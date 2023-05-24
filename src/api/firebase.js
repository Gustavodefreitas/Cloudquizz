import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'
import 'firebase/analytics'

firebase.initializeApp({
  apiKey: "AIzaSyCpybC6kzW2YvmzhCdu3uGhh9Cio55OKQ4",
  authDomain: "quizzcloud-873f9.firebaseapp.com",
  projectId: "quizzcloud-873f9",
  storageBucket: "quizzcloud-873f9.appspot.com",
  messagingSenderId: "632924829441",
  appId: "1:632924829441:web:31d2f14a65b4e8e3a38d00",
  measurementId: "G-VVXKBB4XTM"
})

export const googleProvider = new firebase.auth.GoogleAuthProvider()

export const auth = firebase.auth()
export const db = firebase.firestore()
export const storage = firebase.storage()

export const analytics = firebase.analytics()