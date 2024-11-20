import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import pineconeClient from './pinecone';
import { Index, RecordMetadata } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import userGuard from './userGuard';
import { adminDb } from '@/firebaseAdmin';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4o-mini',
});

export const indexName = 'askmepdf';

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
