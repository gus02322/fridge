// Initialisation Firebase (Auth + Cloud Firestore).
// La config web Firebase est un identifiant PUBLIC (pas un secret) : elle est
// destinée à vivre côté client. La sécurité des données repose sur les règles
// Firestore (voir firestore.rules), pas sur cette clé.
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAp9a22kBVakHkgla0omDc3afqwuhavncI',
  authDomain: 'fridge-2c6ca.firebaseapp.com',
  projectId: 'fridge-2c6ca',
  storageBucket: 'fridge-2c6ca.firebasestorage.app',
  messagingSenderId: '104883622635',
  appId: '1:104883622635:web:6ebcef1922fd7e35cfa4ae',
  measurementId: 'G-V37F63Q6YX',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
