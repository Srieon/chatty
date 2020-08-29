import { StatusBar } from 'expo-status-bar';
import React,{useState,useEffect,useCallback} from 'react';
import { StyleSheet, Text, View,YellowBox, TextInput, Button } from 'react-native';
import * as firebase from 'firebase'
import AsyncStorage from '@react-native-community/async-storage'
import {GiftedChat} from 'react-native-gifted-chat'

const firebaseConfig = {
  apiKey: "AIzaSyDvfvP3qRoydMv5dIx6DYER3kP5ixVqv3Y",
  authDomain: "chatty-cb163.firebaseapp.com",
  databaseURL: "https://chatty-cb163.firebaseio.com",
  projectId: "chatty-cb163",
  storageBucket: "chatty-cb163.appspot.com",
  messagingSenderId: "396557966910",
  appId: "1:396557966910:web:89fad7ae1582be17b5bb6f",
  measurementId: "G-HF31N6VDC9"
};


  firebase.initializeApp(firebaseConfig);



YellowBox.ignoreWarnings(['Setting a timer for a long period of time'])

const db = firebase.firestore()
const chatRef = db.collection('chats')

export default function App() {
  const [user,setUser] = useState(null)
  const [name,setName] = useState('')
  const [messages,setMessages] = useState([])

  useEffect(()=>{
    readUser()
    const unsub = chatRef.onSnapshot(querySnapshot => {
      const sendFirestore = querySnapshot.docChanges().filter(({type}) => type === 'added')
      .map(({doc}) => {
        const message = doc.data()
        return {...message,createdAt:message.createdAt.toDate()}
      }).sort((a,b) => b.createdAt.getTime()-a.createdAt.getTime()) 
      joinmessages(sendFirestore)
    })
    return ()=> unsub()
  },[])

  async function readUser(){
    const user = await AsyncStorage.getItem('user')
    if(user){
      setUser(JSON.parse(user))
    }
  }

  async function handleSend(messages){
    const promise = messages.map(m => chatRef.add(m))
    await Promise.all(promise)
  }

  async function handlePress(){
    const _id = Math.random().toString(36).substring(7)
    const user = {_id,name}
    await AsyncStorage.setItem('user',JSON.stringify(user))
    setUser(user)
  }

  const joinmessages = useCallback((messages) => {
    setMessages((previousMessage) => GiftedChat.append(previousMessage,messages))
  },[messages])

  if(!user){
    return (
      <View style={styles.container}>
        <TextInput style={styles.input} placeholder="Enter your nic"
        value={name} onChange={setName} />
        <Button title= 'Enter the chat' onPress={handlePress}/>
      </View>
    );
  }

  return (
   
      <GiftedChat messages={messages} user={user} onSend={handleSend}/>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input:{
    height:50,
    width:'1005',
    borderWidth:1,
    padding:15,
    borderColor:'green'
  }
});
