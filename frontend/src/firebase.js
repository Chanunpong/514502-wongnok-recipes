import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBSBHshEao-Xb8c37XrbcB4rFwUOFd7B-s",
  authDomain: "wongnokchp.firebaseapp.com",
  projectId: "wongnokchp",
  storageBucket: "wongnokchp.appspot.com",
  messagingSenderId: "860919239204",
  appId: "1:860919239204:web:3b703171997d9c3e1dbeb1",
  measurementId: "G-WL1MP1RNNB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const getIdToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};
