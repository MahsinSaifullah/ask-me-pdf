import { adminDb } from '@/firebaseAdmin';
import PlaceholderDocument from './PlaceholderDocument';
import userGuard from '@/lib/userGuard';
import Document from './Document';

const Documents = async () => {
  const userId = await userGuard();

  const documentsSnapshot = await adminDb
    .collection('users')
    .doc(userId)
    .collection('files')
    .get();

  return (
    <div className="flex flex-wrap p-5 bg-gray-100 justify-center lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto">
      {documentsSnapshot.docs.map((doc) => {
        const { name, downloadUrl, size } = doc.data();

        return (
          <Document
            key={doc.id}
            id={doc.id}
            name={name}
            size={size}
            downloadUrl={downloadUrl}
          />
        );
      })}
      <PlaceholderDocument />
    </div>
  );
};

export default Documents;
