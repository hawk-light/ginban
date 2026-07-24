import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
    db,
    collection,
    addDoc,
    onSnapshot,
    query,
    where,
    deleteDoc,
    doc
};