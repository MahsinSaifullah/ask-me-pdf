import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAcFsXrpYTyfNwlWtv2Wt6EOY9NVgiJXWw',
  authDomain: 'ask-me-pdf-29a0c.firebaseapp.com',
  projectId: 'ask-me-pdf-29a0c',
  storageBucket: 'ask-me-pdf-29a0c.firebasestorage.app',
  messagingSenderId: '198496409998',
  appId: '1:198496409998:web:376fbffc15cc57afe7ecdf',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
