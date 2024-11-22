import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import pineconeClient from './pinecone';
import { Index, RecordMetadata } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import userGuard from './userGuard';
import { adminDb } from '@/firebaseAdmin';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';

export const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4o-mini',
});

export const indexName = 'askmepdf';

const fetchMessagesFromDB = async (docId: string) => {
  const userId = await userGuard();

  console.log('---- Fetching chat history from the firestore database... ---');

  const chats = await adminDb
    .collection('users')
    .doc(userId)
    .collection('files')
    .doc(docId)
    .collection('chat')
    .orderBy('createdAt', 'desc')
    .get();

  const chatHistory = chats.docs.map((doc) =>
    doc.data().role === 'human'
      ? new HumanMessage(doc.data().message)
      : new AIMessage(doc.data().message)
  );

  console.log(
    `--- fetched last ${chatHistory.length} messages successfully ----`
  );
  console.log(chatHistory.map((msg) => msg.content.toString()));

  return chatHistory;
};

export const generateDocs = async (docId: string) => {
  const userId = await userGuard();

  console.log('---Fetching the download url from Firebase---');

  const firebaseRef = await adminDb
    .collection('users')
    .doc(userId)
    .collection('files')
    .doc(docId)
    .get();

  const downloadUrl = firebaseRef.data()?.downloadUrl;

  if (!downloadUrl) {
    throw new Error('Download url not found');
  }

  console.log(`---Download URL fetched successfully: ${downloadUrl}---`);

  const response = await fetch(downloadUrl);
  const data = await response.blob();
  const loader = new PDFLoader(data);
  const docs = await loader.load();

  console.log('---Splitting the document into smaller parts-----');

  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(docs);

  console.log(`---Split into ${splitDocs.length} parts`);

  return splitDocs;
};

export const namespaceExists = async (
  index: Index<RecordMetadata>,
  namespace: string | null
) => {
  if (namespace === null) throw new Error('No namespace value provided');

  const { namespaces } = await index.describeIndexStats();

  return namespaces?.[namespace] !== undefined;
};

export const generateEmbeddingsInPineconeVectorStore = async (
  docId: string
) => {
  await userGuard();

  let pineconeVectorStore;

  console.log('---Generating embeddings----');

  const embeddings = new OpenAIEmbeddings();
  const pineconeIndex = await pineconeClient.index(indexName);
  const namespaceAlreadyExist = await namespaceExists(pineconeIndex, docId);

  if (namespaceAlreadyExist) {
    console.log(
      `----Namespace ${docId} already exists, reuse existing embeddings----`
    );

    pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: docId,
    });

    return pineconeVectorStore;
  }

  const splitDocs = await generateDocs(docId);

  console.log(
    `----Storing the embeddings in namespace ${docId} in the ${indexName} Pinecone vector store---`
  );

  pineconeVectorStore = await PineconeStore.fromDocuments(
    splitDocs,
    embeddings,
    {
      pineconeIndex: pineconeIndex,
      namespace: docId,
    }
  );

  return pineconeVectorStore;
};

export const generateLangchainCompletion = async (
  docId: string,
  question: string
) => {
  let pineconeVectorStore;

  pineconeVectorStore = await generateEmbeddingsInPineconeVectorStore(docId);

  if (!pineconeVectorStore) {
    throw new Error('Pinecone vector store not found');
  }

  console.log('---- Creating a retriever.. ---');

  const retriever = pineconeVectorStore.asRetriever();

  const chatHistory = await fetchMessagesFromDB(docId);

  console.log('---- Defining a prompt template... ---');

  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ...chatHistory,
    ['user', '{input}'],
    [
      'user',
      'Given the above conversation, generate a search query to look up in order to get information relevant to the conversation',
    ],
  ]);

  console.log('--- Creating a history-aware retriver chain... ---');

  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });

  console.log(
    '---- Defining a prompt template for answering questions.... ----'
  );

  const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      "Answer the user's questions based on the below context:\n\n{context}",
    ],
    ...chatHistory,
    ['user', '{input}'],
  ]);

  console.log('--- Creating a document combining chain ----');
  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: historyAwareRetrievalPrompt,
  });

  console.log('---- Creating the main retrieval chain... ---');
  const conversationalRetrievalChain = await createRetrievalChain({
    retriever: historyAwareRetrieverChain,
    combineDocsChain: historyAwareCombineDocsChain,
  });

  console.log('--- Running the chain with a sample conversation... ---');
  const reply = await conversationalRetrievalChain.invoke({
    chat_history: chatHistory,
    input: question,
  });

  console.log(reply.answer);

  return reply.answer;
};
