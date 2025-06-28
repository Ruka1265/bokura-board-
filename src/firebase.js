// Firebaseの初期化
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 下記の値は自分のFirebaseプロジェクトのものに書き換えてください

const firebaseConfig = {
    apiKey: "AIzaSyD-fyUEXTsXDccSmMoI40eKQmwzJVKNxjk",
    authDomain: "today-note-app.firebaseapp.com",
    projectId: "today-note-app",
    storageBucket: "today-note-app.firebasestorage.app",
    messagingSenderId: "88213999140",
    appId: "1:88213999140:web:494a9910be707bc59492b1"
};


// Firebaseを初期化
const app = initializeApp(firebaseConfig);

// Firestoreデータベースインスタンスを取得
const db = getFirestore(app);

export { db };
