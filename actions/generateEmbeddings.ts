'use server';

import { generateEmbeddingsInPineconeVectorStore } from '@/lib/langchain';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

const generateEmbeddings = async (docId: string) => {
  auth().protect();

  await generateEmbeddingsInPineconeVectorStore(docId);

  revalidatePath('/dashboard');

  return { complete: true };
};

export default generateEmbeddings;
