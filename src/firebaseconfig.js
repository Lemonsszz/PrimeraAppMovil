// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDaMbDwKGe7_1ADMyi-ORuzL_1N3nK4LC8",
  authDomain: "aplicaciones-mo-p.firebaseapp.com",
  projectId: "aplicaciones-mo-p",
  databaseURL: "https://aplicaciones-mo-p-default-rtdb.firebaseio.com/",
  storageBucket: "aplicaciones-mo-p.firebasestorage.app",
  messagingSenderId: "1051017501535",
  appId: "1:1051017501535:web:66519cefbc7edf9d0df4ea",
  measurementId: "G-YMPHH862Q0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Conexión con la base de datos (REALTME DATABASE)
export const database=getDatabase(app);
