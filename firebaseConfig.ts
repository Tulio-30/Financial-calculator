import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Cole aqui as suas credenciais do console do Firebase
const firebaseConfig = {

  apiKey: "AIzaSyAMi-Dd43lLaih-rXFZmmFBjag9vHCGv-4",

  authDomain: "calculadora-financeira-8456a.firebaseapp.com",

  projectId: "calculadora-financeira-8456a",

  storageBucket: "calculadora-financeira-8456a.firebasestorage.app",

  messagingSenderId: "118064289935",

  appId: "1:118064289935:web:c78d49e6c39fca1de938fa"

};


// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Auth com persistência (para o usuário não ter que logar toda hora)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Inicializa o Banco de Dados
const db = getFirestore(app);

export { app, auth, db };