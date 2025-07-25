
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// TODO: Substitua o seguinte objeto pela configuração do seu projeto Firebase
// Você pode encontrar isso nas configurações do seu projeto no console do Firebase.
const firebaseConfig = {
  apiKey: "AIzaSyC_33DsUJdJNkjMO2O1mESdCfenEJOcnIk",
  authDomain: "lista-de-oracao-9829c.firebaseapp.com",
  projectId: "lista-de-oracao-9829c",
  storageBucket: "lista-de-oracao-9829c.firebasestorage.app",
  messagingSenderId: "598701378693",
  appId: "1:598701378693:web:3eae192663662658f16dec"
};

// Verificamos se a chave da API é o placeholder.
// Isso evita que o app quebre se as credenciais não forem preenchidas.
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
} else {
  console.warn(`
    *****************************************************************
    * FIREBASE NÃO CONFIGURADO                                      *
    *                                                               *
    * Por favor, configure suas credenciais do Firebase no arquivo   *
    * 'firebaseConfig.ts' para que o aplicativo funcione.           *
    *****************************************************************
  `);
}

// Exporta os serviços (que podem ser nulos se não configurados) e a flag.
export { firebaseApp, auth, db };
