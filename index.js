// Coded by ozan.koyuk
const express = require('express');
const app = express(); // Start the server
const dotenv = require("dotenv"); // Connection to the database
const mongoose = require("mongoose"); // Mongoose brings schema-based solution to my models
const CustomDocument = require("./models/CustomDocument");
var database = require('./config/database'); // Connection details
var moment = require('moment'); // Formatting datetime

dotenv.config();

app.use("/static", express.static("public"));

app.use(express.urlencoded({ extended: true })); // URLencoded to use body parts from the request

app.use(express.json({
  inflate: true, // handling compressed body
  limit: '100kb',
  strict: true,
  type: 'application/json',
  verify: undefined
}))

mongoose.set("useFindAndModify", false); //connection to db

// Run server if and only if connected to the database
mongoose.connect(database.localUrl, { useNewUrlParser: true }, () => {
  console.log("Connected to db!");
  app.listen(3000, () => console.log("Server up and running")); // Listen the given port
});

app.set("view engine", "ejs"); // View engine configuration

// Save method
// Returns to home after success and prints a log message
// Returns to home after fail and prints a log message
app.post('/',async (req, res) => {
    var uuid = require("uuid");
    const obj = new CustomDocument({
        totalCount: req.body.count,
        createdAt: Date.now(),
        key: uuid.v4()
    });
    try {
        await obj.save();
        console.log('Save completed')
        res.redirect("/");
    }
    catch (err) {
        console.log('Cannot save: ' + err)
        res.redirect("/");
    }
});

// Get all saved documents to list them
// Sort in descending order
app.get("/", (req, res) => {
    CustomDocument.find().sort({'totalCount':-1}).exec((err, documents) => {
        res.render("home.ejs", { documents: documents, moment: moment });
    });
});

// Main task route is this one
// Simply inserts the parameters from the request and finds the matching documents
app.post('/findData',async (req, res) => {
  try {
    var query = {};
    if (req.body.maxCount != "" || req.body.maxCount != ""){
      if ( !("totalCount" in query) ){
        query.totalCount = {}
      }
      query.totalCount["$lte"] = req.body.maxCount
    }
    if (req.body.minCount != "" || req.body.minCount != ""){
      if ( !("totalCount" in query) ){
        query.totalCount = {}
      }
      query.totalCount["$gte"] = req.body.minCount
    }
    if (req.body.startDate != "" || req.body.startDate != ""){
      if ( !("createdAt" in query) ){
        query.createdAt = {}
      }
      query.createdAt["$gte"] = req.body.startDate
    }
    if (req.body.endDate != "" || req.body.endDate != ""){
      if ( !("createdAt" in query) ){
        query.createdAt = {}
      }
      query.createdAt["$lte"] = req.body.endDate
    }

    // Select only given fields of the documents
    // Code values -> 0: Success
    //               -1: Failure
    CustomDocument.find(query).select('createdAt key totalCount -_id').exec((err, documents) => {
      var resultDict = {};

      if (err){
        console.log(err)
        resultDict = {
          "code" : -1,
          "msg" : "Failure",
          "records" : []
        };
      }
      else{
        resultDict = {
          "code" : 0,
          "msg" : "Success",
          "records" : documents
        };
      }

      res.type('json')
      res.json(resultDict)
    });
  } catch (e) {
    console.log(e)
  }
});

// Coded by ozan.koyuk
