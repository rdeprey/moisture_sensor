const admin = require('firebase-admin');
let serviceAccount = require('../credentials/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const dbRef = admin.firestore();

const addRecord = async (dbCollection, data) => {
    dbRef.collection(dbCollection).add({
        "createdOn": new Date(),
        "soilDrynessPercentagePreWatering": data.soilDrynessPercentage,
        "location": "fig tree"
    }).then(ref => {	
        console.log('Added document with ID: ', ref);
    });
}

const getLastWateringData = async () => {
    return await dbRef.collection("moisture-levels").where("location", "==", "fig tree").orderBy("createdOn", "desc").limit(1).get().then(querySnapshot => {
        let data = {};
        if (!querySnapshot.empty) {
          querySnapshot.forEach(snapshot => {
            data = snapshot.data();
          });
        }
console.log(data);  
        return data;
      }).catch(error => {
        return Promise.reject(`There was an error getting the last time the plant was watered: ${error}`);
      });
};

module.exports = {
    addRecord,
    getLastWateringData,
};
