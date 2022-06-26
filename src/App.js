
import './App.css';
import React, { useState, useRef } from "react";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import {useAuthState} from 'react-firebase-hooks/auth'
import {useCollectionData} from 'react-firebase-hooks/firestore'


// Initialization
firebase.initializeApp({
  apiKey: "AIzaSyAW6xZ4yqgSk99wc933HzWkhT95uKe4jrI",
  authDomain: "react-chat-app-1cc08.firebaseapp.com",
  projectId: "react-chat-app-1cc08",
  databaseURL: "https://react-chat-app-1cc08.firebaseio.com",
  storageBucket: "react-chat-app-1cc08.appspot.com",
  messagingSenderId: "705669836562",
  appId: "1:705669836562:web:e8a4d5d2fd2269f1360dcb"
});

const auth = firebase.auth();

const firestore = firebase.firestore();


function App() {

  const [user] = useAuthState(auth);
  return (
    <div className='App'>
      <header>
        <h1>
          This is a chat server
        </h1>
        <SignOut/>

      </header>
      <section>
        {user ? <ChatRoom/> : <SignIn/>}
      </section>
    </div>
  );
}

function SignIn(){

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return(
    <>
    <button className='sign-in' onClick={signInWithGoogle}>Sign in with Google account</button>
    </>
  )
}

function SignOut(){
  
  return auth.currentUser &&(
    <>
    <button className='sign-out' onClick={() => auth.signOut()}>Sign Out</button>
    </>
  )
}

function ChatRoom(){
  const messagesRef = firestore.collection('messages');

  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const {uid, photoURL} = auth.currentUser;

  const sendMessage = async(e) => {
    e.preventDefault();
    
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    })
    setFormValue('')
  }

  return(
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message = {msg}/>)}
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}></input>

        <button type='submit' disabled={!formValue}>Send Message</button>
      </form>
    </>
  );
}

function ChatMessage(props){
  const {text, uid, photoURL} = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return(
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL || "https://cdn-icons-png.flaticon.com/512/147/147142.png"}></img>
        <p>{text}</p>
      </div>
      
    </>
  )
}

export default App;
