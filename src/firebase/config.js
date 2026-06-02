import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBuiuMTKCFL0ftPXvtDCLsn6fl8ye4T0nA",
  authDomain: "chapita-8211c.firebaseapp.com",
  databaseURL: "https://chapita-8211c-default-rtdb.firebaseio.com",
  projectId: "chapita-8211c",
  storageBucket: "chapita-8211c.firebasestorage.app",
  messagingSenderId: "558679081850",
  appId: "1:558679081850:web:6ca792c8ea6e6916710cc3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;
