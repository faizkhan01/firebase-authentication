import React, { useState } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import Button from 'react-bootstrap/Button';

firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: ''
  })

  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () => {
    firebase.auth().signInWithPopup(googleProvider)
    .then(res => {
      const {displayName, photoURL, email} = res.user;
      const signedInUser= {
        isSignedIn: true,
        name: displayName,
        email: email,
        photo: photoURL
      }
      setUser(signedInUser);
      console.log(displayName, email, photoURL);
    })
    .catch(err => {
      console.log(err);
      console.log(err.message);

    })
  }

  const handleFbSignIn= () => {
    firebase.auth().signInWithPopup(fbProvider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      
      // The signed-in user info.
      var user = result.user;
      console.log('Fb User After Sign In', user);
      // ...
    })
    // .catch(function(error) {
    //   // Handle Errors here.
    //   var errorCode = error.code;
    //   var errorMessage = error.message;
    //   // The email of the user's account used.
    //   var email = error.email;
    //   // The firebase.auth.AuthCredential type that was used.
    //   var credential = error.credential;
    //   // ...
    // });
  }

  const handleSignOut = () => {
    firebase.auth().signOut()
    .then(res => {
      const signedOutUser= {
        isSignedIn: false,
        name: '',
        email: '',
        photo: '',
        error: '',
        success: false
      }
      setUser(signedOutUser);
    })
    .catch(err => {
      console.log(err);
      console.log(err.message);

    })
  }
  
  const handleBlur = (event) => {
    let isFieldValid=true;
    if (event.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(event.target.value);
    }
    if (event.target.name === 'password') {
      const isPasswordValid = event.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(event.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber;
    }
    if (isFieldValid) {
      const newUserInfo = {...user};
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo);
    }
  }

  const handleSubmit = (event) => {
    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then ( res => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
        updateUserName(user.name);
      })
      
      
      .catch( error => {
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
        // ...
      });

    }

    if(!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then( res=> {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
      })
      .catch(error => {
        // Handle Errors here.
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      });
    }
    event.preventDefault();

  }

  const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(function () {
      // Update successful.
    }).catch(function (error) {
      // An error happened.
    });
  }
      
  
  return (
    <div className="App">
      {
        user.isSignedIn ? <Button onClick={handleSignOut} variant='danger'> Sign Out </Button> : <Button onClick={handleSignIn} variant='success'> Sign In </Button>
      }
      <br/>
      <button id='fb' onClick={handleFbSignIn}> Sign In Using Facebook </button>

      {
        user.isSignedIn &&  
        <div>
          <p> Welcome,  {user.name} </p>
          <p> Your Email: {user.email} </p>
          <img src={user.photo} alt=""/>
        </div>
      }

      <h1> Our Own Authentication </h1>

      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id=""/>
      <label htmlFor="newUser"> New User Sign Up </label>

      <form onSubmit={handleSubmit}>
        { newUser && <input type="text" name='name' onBlur={handleBlur} placeholder="Your Name"/> }
        <br/> <br/>
        <input type="text" name='email' onBlur={handleBlur} placeholder="Enter your email address" required />
        <br /> <br/>
        <input type="password" name="password" onBlur={handleBlur} placeholder="Enter your password" required />
        <br /> <br/>
        <input type="submit" value= {newUser ? 'Sign Up' : 'Sign In' } />
      </form>
      <p style= {{color: 'red'}}  > {user.error} </p>
      { user.success && <p style= {{color: 'green'}}> User {newUser ? 'Created' : 'Logged In'} Successfully </p>}
      
    </div>
  );
}

export default App;
