'use server';

import { adminDb } from '@/firebaseAdmin';
import { generateLangchainCompletion } from '@/lib/langchain';
import { auth } from '@clerk/nextjs/server';

const FREE_LIMIT = 3;
const PRO_LIMIT = 100;

export type Message = {
  id?: string;
  role: 'human' | 'ai' | 'placeholder';
  message: string;
  createdAt: Date;
};

export const askQuestion = async (id: string, question: string) => {
  auth().protect();

  const { userId } = await auth();

  const chatRef = adminDb
    .collection('users')
    .doc(userId!)
    .collection('files')
    .doc(id)
    .collection('chat');

  //   const chatSnapshot = await chatRef.get();
  //   const userMessages = chatSnapshot.docs.filter(
  //     (doc) => doc.data().role === 'human'
  //   );

  const userMessage: Message = {
    role: 'human',
    message: question,
    createdAt: new Date(),
  };

  await chatRef.add(userMessage);

  const reply = await generateLangchainCompletion(id, question);

  const aiMessage: Message = {
    role: 'ai',
    message: reply,
    createdAt: new Date(),
  };

  await chatRef.add(aiMessage);

  return { success: true, message: null };
};