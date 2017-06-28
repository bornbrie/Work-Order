'use strict';

// [START imports]

// The Admin library for Firebase SDK to access the database with admin privileges
var firebase = require('firebase');
// [END imports]

// Set the configuration for your app
var config = {
    apiKey: "AIzaSyDJ3ZCnTcqRiFh63WKPlBNidSl13OeUG1Q",
    authDomain: "work-orders-1f179.firebaseapp.com",
    databaseURL: "https://work-orders-1f179.firebaseio.com/",
    storageBucket: "work-orders-1f179.appspot.com"
};
firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

var connectionInfo = {
    domainPrefix: nconf.get('experimacwseattle'),
    accessToken: nconf.get('O8jjl0gRt3LyIIpQTYOnI6QTOYbxYKTK')
};

// Opens the listener function set to trigger when a write command is executed (with .onWrite) on the 'work-order' child.
function setWorkOrderUpdatedListener() {

    // The Firebase Admin SDK to access the Firebase Realtime Database.
    var functions = require('firebase-functions');

    var vendSDK = require('vend-nodejs-sdk');

    // Attach 'workOrderUpdated' to exports
    exports.workOrderUpdated = functions.database.ref('/work-orders/{work-order-id}')
            .onWrite((writeEvent) = {


                // Exit if the data has not changed.
                if (!writeEvent.data.changed()) {
                    return;
                }

                // Get the current Work Order that was just written.
                var workOrderRef = writeEvent.data;

                // Get the Vend sale from the work order.
                var vendSale = workOrderRef.child('vend_sale');

                if (vendSale.changed() === false) {
                    return;
                }

                // Create arguments for the transaction.
                var args;

                // If the data is new (if the previous data does not exist), create a new transaction.
                // Else if it already exists, update the transaction.
                if (writeEvent.data.previous.exists() === false) {

                    // Configure the arguments for the creation of a new sale on Vend.
                    args = vendSDK.args.sales.create();
                    args.body = vendSale.toJSON();

                    //Execute the creation.
                    return vendSDK.sales.create(args)

                } else {

                    // Configure the arguments for the update.
                    args = vendSDK.args.sales.update();
                    args.body = vendSale.toJSON();
                    args.page = 1;
                    args.pageSize = 50;

                    // Execute the update.
                    return vendSDK.sales.update(args)
                }
            }
            )
}

function setUpdatedTransactionPayloadRecieved() {
    // The Firebase Admin SDK to access the Firebase Realtime Database.
    var functions = require('firebase-functions');

    var vendSDK = require('vend-nodejs-sdk');

    exports.updatedTransaction = functions.https.onRequest((req, res) => {

    });
}

function startListeners() {
    setWorkOrderUpdatedListener();
    setUpdatedTransactionPayloadRecieved();
}

startListeners();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) = {
 response.send("Hello from Firebase!");
})
