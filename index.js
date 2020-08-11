// Created by ozan.koyuk
const express = require('express');
const app = express(); // Start the server
const mongoose = require("mongoose"); // Mongoose brings schema-based solution to my models
const dotenv = require("dotenv"); // Connection to the database
var database = require('./config/database'); // Connection details

const Records = require("./models/Records");

dotenv.config();

app.use("/static", express.static("public"));

app.use(express.urlencoded({ extended: true })); // URLencoded to use body parts from the request

app.use(express.json({
  inflate: true, // handling compressed body
  limit: '100kb',
  strict: true,
  type: 'application/json',
}))

mongoose.set("useFindAndModify", false); // To use findOneAndUpdate

// Run server if and only if connected to the database
mongoose.connect(database.localUrl, { useNewUrlParser: true }, () => {
  console.log("Connected to db!");
  app.listen(3001, () => console.log("Server up and running")); // Listen the given port
});

app.set("view engine", "ejs"); // View engine configuration

// Simply inserts the parameters from the request and finds the matching documents
app.post('/findData',async (req, res) => {
  try {
    var responseData = {
      "code": 0,
      "msg": "Success",
      "records": []
    };
    // Select only given fields of the documents
    // Code values -> 0: Success
    //               -1: Failure
    Records.aggregate([
      {
        $match:{
          createdAt: {
            $gte: new Date(req.body.startDate),
            $lte: new Date(req.body.endDate)
          }
        }
      },
      {
          "$addFields": {
              "totalCount": {
                  "$reduce": {
                      "input": "$counts",
                      "initialValue": 0,
                      "in": { "$add" : ["$$value", "$$this"] }
                  }
              }
          }
      },
      {
        $match: {
          totalCount:{
            $gte : req.body.minCount,
            $lte: req.body.maxCount
          }
        }
      },
      {
        $project:{
          "key": "$key",
          "createdAt": "$createdAt",
          "totalCount": "$totalCount",
          _id:0
        }
      }
    ]).exec((err, data) => {
        if (err){
          console.log(err);
          responseData["code"] = -1;
          responseData["msg"] = "Failure";
        } else{
          responseData["records"] = data
        }
        return res.json(responseData)
    });

  } catch (e) {
    console.log(e)
    responseData["code"] = -1;
    responseData["msg"] = "Failure";
    return res.json(responseData)
  }
});

// Created by ozan.koyuk
