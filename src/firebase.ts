import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
console.log('Firebase app initialized:', app.name)

// Initialize Auth
const auth = getAuth(app)
console.log('Firebase Auth initialized')

// Initialize Firestore with the named database
const db = getFirestore(app, 'competition')
console.log('Firestore initialized with database:', 'competition')

// Enable offline persistence
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('Offline persistence enabled')
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: Multiple tabs open')
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence not available')
    } else {
      console.error('Error enabling offline persistence:', err)
    }
  })

const storage = getStorage(app)

export { auth, db, storage } 