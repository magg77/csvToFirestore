# Firestores BD

Upload csv file to firestore with javascript

Features:

* Upload CSV : You can upload documents to a firestore collection in bulk
* Download collection to CSV : You can download the documents of a collection to CSV


![My App Notes](https://github.com/magg77/WigilabsPrueba/blob/master/screens/group.png)
![My App Notes](https://github.com/magg77/WigilabsPrueba/blob/master/screens/Wireframe-note.jpeg)



# firebaseConfig.js

- create file ./src/firebaseConfig.js inside the src directory
- add the configuration that firebase-admin console generates, when you generate a new project

````
```

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)


export {db}

```
````