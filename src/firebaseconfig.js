import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";

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
  measurementId: "G-YMPHH862Q0",
};

const app = initializeApp(firebaseConfig);

// Conexión con la base de datos (REALTIME DATABASE)
export const database = getDatabase(app);

/**
 * Auth con persistencia en AsyncStorage: la sesión sobrevive al cerrar y abrir
 * la app. `initializeAuth` falla si Auth ya estaba inicializado (recarga en
 * caliente de Metro), así que se cae con elegancia a `getAuth`.
 */
function crearAuth() {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

export const auth = crearAuth();
