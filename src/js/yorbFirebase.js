require('dotenv').config()
import firebase from 'firebase';
import debugModule from 'debug'
const log = debugModule('YORB:Firebase')

var firebaseConfig = {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: process.env.FIREBASE_AUTHDOMAIN,
    projectId: process.env.FIREBASE_PROJECTID,
    storageBucket: process.env.FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
    appId: process.env.FIREBASE_APPID
};
// Initialize Firebase
// firebase.initializeApp(firebaseConfig);
if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}

export class YorbFirebase {
    constructor() {
        // console.log(firebase);
        this.database = firebase.database();
        this.storage = firebase.storage();
        log("YORB Firebase initialized")
    }

    /**
     * add a row into the database
     * @param {*} ref 
     * @param {*} data data object, includes filename, url, position, rotation, scale 
     */
    add(ref, data) {
        this.database.ref(ref).push(data);
    }

    /**
     * read data rows under a certain path from the database
     * @param {*} ref ref path to the data records
     */
    async read(ref) {
        const data = this.database.ref(ref).once('value').then((snapshot) => {
            return snapshot.val();
        });
        return await data;
    }

    /**
     * upload files to the storage and get it's the file's download URL
     * @param {*} ref 
     * @param {*} file 
     */
    async upload(ref, file) {
        const fileRef = this.storage.ref().child(ref);
        await fileRef.put(file);
        const fileURL = await fileRef.getDownloadURL();
        return fileURL;
    }

    /**
     * getting download URL from the storage
     * @param {*} ref 
     */
    async getFileURL(ref) {
        //create a storage reference
        let storage = this.storage.ref(ref);

        //get file url
        const fileURL = storage.getDownloadURL().then(function (url) {
            return url;
        }).catch(function (error) {
            console.log("error encountered:" + error);
        });
        return await fileURL;
    }



}