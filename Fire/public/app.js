  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-analytics.js";
  import { getAuth , GoogleAuthProvider , signInWithPopup, updateProfile } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";
  import { getFirestore, collection, addDoc, doc, query, where, updateDoc, onSnapshot, serverTimestamp, increment ,  arrayUnion, arrayRemove} from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAwuSWttaQ7YITAggI_1vsxwWy0QEAHEkc",
    authDomain: "agora-5ab79.firebaseapp.com",
    projectId: "agora-5ab79",
    storageBucket: "agora-5ab79.appspot.com",
    messagingSenderId: "13699979990",
    appId: "1:13699979990:web:8d89557b02a7d97546c777",
    measurementId: "G-3CXZSXT8KL"
  };// Initialize Firebase
 const app = initializeApp(firebaseConfig);
 const analytics = getAnalytics(app);
 const db = getFirestore(app);
 const auth = getAuth(app);
 


///// User Authentication /////


 
 const whenSignedIn = document.getElementById('whenSignedIn');
 const whenSignedOut = document.getElementById('whenSignedOut');
 
 const signInBtn = document.getElementById('signInBtn');
 const signOutBtn = document.getElementById('signOutBtn');
 
 const userDetails = document.getElementById('userDetails');
 
 
 const provider = new GoogleAuthProvider();
 
 /// Sign in event handlers
 
 signInBtn.onclick = () => signInWithPopup(auth, provider);
 
 signOutBtn.onclick = () => auth.signOut();
 
 auth.onAuthStateChanged(user => {
     if (user) {
         // signed in
         whenSignedIn.hidden = false;
         whenSignedOut.hidden = true;
         userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3>`;
     } else {
         // not signed in
         whenSignedIn.hidden = true;
         whenSignedOut.hidden = false;
         userDetails.innerHTML = '';
     }
 });
 
 /// Username
 
 const ChangeName = document.getElementById('nameChange');
 const NameField = document.getElementById('nameField');

 ChangeName.onclick = () => {
 
    updateProfile(auth.currentUser, {displayName: NameField.value});
    };
    
 ///// Firestore /////
 

 const createThing = document.getElementById('createThing');
 const OpinionField = document.getElementById('opinionField');
 const thingsList = document.getElementById('thingsList');
 
 
 let thingsRef;
 let unsubscribe;
 
 auth.onAuthStateChanged(user => {
 
     if (user) {
 
         // Database Reference
         
         createThing.onclick = () => {
 
            if(OpinionField.value.length > 3) addDoc(collection(db, 'opinions'), {
                 uid: user.uid,
                 username: auth.currentUser.displayName,
                 opinion: OpinionField.value,
                 createdAt: serverTimestamp(),
                 Likes: 1,
                 Likelist: [user.uid],
                 Dislikelist: [],
                 ArgFor : [],
                 ArgContra : []
             });
         }
 
 
         // Query
         const q = query(collection(db, "opinions") , where("uid", "==", user.uid));
         
         const unsubscribe = onSnapshot(q, (querySnapshot) => {
      
                 const items = querySnapshot.docs.map(doc => {
 
                     return `<li>${doc.data().opinion}</li>`
 
                 });
 
                 thingsList.innerHTML = items.join('');

             });
 
 
 
     } else {
         // Unsubscribe when the user signs out
         unsubscribe && unsubscribe();
     }
 });

 ///// Feed /////
 
 const opinionFeed = document.getElementById('opinionFeed');

 var OpenOpinion = "none";

 auth.onAuthStateChanged(user => {
 
    if (user) {

        onSnapshot(query(collection(db, "opinions")), (querySnapshot) => {
            while(opinionFeed.firstChild) opinionFeed.removeChild(opinionFeed.lastChild);
            querySnapshot.docs.map(opinion => {
                if (OpenOpinion == opinion.id) Argue(opinion);

                let item = document.createElement("li");
                
                let OpinionTextHolder = document.createElement('text');
                OpinionTextHolder.innerHTML = opinion.data().username + ": " + opinion.data().opinion + "<br>";
                OpinionTextHolder.addEventListener('click', () => {
                    Discuss(opinion)
                })
                item.appendChild(OpinionTextHolder);
                
                if(opinion.data().uid != user.uid){
                    let opinionRef = doc(db, "opinions", opinion.id);     
                    const Likebutton = document.createElement('button')
                    Likebutton.innerText = 'I agree'
                    Likebutton.addEventListener('click', () => {
                        if(!opinion.data().Likelist.includes(user.uid)){
                            updateDoc(opinionRef, {Likes: increment(1)});
                            updateDoc(opinionRef, {Likelist: arrayUnion(user.uid)});
                            if(opinion.data().Dislikelist.includes(user.uid)){
                                updateDoc(opinionRef, {Likes: increment(1)});
                                updateDoc(opinionRef, {Dislikelist: arrayRemove(user.uid)});
                            }
                        }    
                    })
                    item.appendChild(Likebutton);
                
                    const Dislikebutton = document.createElement('button')
                    Dislikebutton.innerText = 'I disagree'
                    Dislikebutton.addEventListener('click', () => {
                        if(!opinion.data().Dislikelist.includes(user.uid)){
                            updateDoc(opinionRef, {Likes: increment(-1)});
                            updateDoc(opinionRef, {Dislikelist: arrayUnion(user.uid)});
                            if(opinion.data().Likelist.includes(user.uid)){
                                updateDoc(opinionRef, {Likes: increment(-1)});
                                updateDoc(opinionRef, {Likelist: arrayRemove(user.uid)});
                            }
                        }    
                    })
                    item.appendChild(Dislikebutton);
                }
                let LikesTextHolder = document.createElement('text');
                LikesTextHolder.innerHTML = " Likes: " + opinion.data().Likes;
                item.appendChild(LikesTextHolder);
                
                opinionFeed.appendChild(item);
            });
        })
    };

    ///Discussion///
    
    let DicsTab = document.getElementById("Discussion");

    function Argue(opinion) {
        while(proFeed.firstChild) proFeed.removeChild(proFeed.lastChild);
        while(contraFeed.firstChild) contraFeed.removeChild(contraFeed.lastChild);
        opinion.data().ArgFor.map(argument => {
            let item = document.createElement("li");
            let ArgumentTextHolder = document.createElement('text');
            ArgumentTextHolder.innerHTML = "Argument: " + argument + "<br>";
            item.appendChild(ArgumentTextHolder);
            proFeed.appendChild(item);
        }) 
         opinion.data().ArgContra.map(argument => {
            let item = document.createElement("li");
            let ArgumentTextHolder = document.createElement('text');
            ArgumentTextHolder.innerHTML = argument + "<br>";
            item.appendChild(ArgumentTextHolder);
            contraFeed.appendChild(item);
        })
    }

     function Discuss(opinion) {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
          tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
          tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        DicsTab.style.display = "block";
        DicsTab.className += " active";
        OpenOpinion = opinion.id;
        document.getElementById("opinionTitle").innerHTML = opinion.data().opinion;
        Argue (opinion);
    }
      
    const proFeed = document.getElementById('argFeedPro');
    const contraFeed = document.getElementById('argFeedContra');
    
    const ForField = document.getElementById('argForField');
    const ContraField = document.getElementById('argContraField');
    
    const makeFor = document.getElementById('makeArgFor');
    const makeContra = document.getElementById('makeArdContra');

    makeFor.addEventListener('click', () => {
        if(ForField.value.length > 3) updateDoc(doc(db, "opinions", OpenOpinion), {ArgFor: arrayUnion(ForField.value)});
    })
    makeContra.addEventListener('click', () => {
        if(ContraField.value.length > 3) updateDoc(doc(db, "opinions", OpenOpinion), {ArgContra: arrayUnion(ContraField.value)});
    })
})