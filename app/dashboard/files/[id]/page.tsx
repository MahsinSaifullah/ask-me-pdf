import Chat from '@/components/Chat';
import PdfView from '@/components/PdfView';
import { adminDb } from '@/firebaseAdmin';
import { auth } from '@clerk/nextjs/server';

interface ChatToFilePageProps {
  params: {
    id: string;
  };
}

const ChatToFilePage = async ({ params: { id } }: ChatToFilePageProps) => {
  auth().protect();
  const { userId } = await auth();

  const ref = await adminDb
    .collection('users')
    .doc(userId || '')
    .collection('files')
    .doc(id)
    .get();

  const downloadUrl = ref.data()?.downloadUrl;

  return (
    <div className="grid lg:grid-cols-5 h-full overflow-hidden">
      <div className="lg:col-span-2 overflow-y-auto">
        <Chat id={id} />
      </div>
      <div className="lg:col-span-3 bg-gray-100 border-r-2 lg:border-indigo-600 lg:-order-1 overflow-auto">
        <PdfView url={downloadUrl} />
      </div>
    </div>
  );
};

export default ChatToFilePage;
