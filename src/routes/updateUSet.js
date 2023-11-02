const express = require("express");
const router = express.Router();
// const { updateUser } = require("../models/user");

const users = require("./users_2");
const usersData = users["users"];

const mongoURI =
  "mongodb+srv://testac042:qrBNlA5NMpGYDm3h@testleet.y9jtdbz.mongodb.net/?retryWrites=true&w=majority";
const dbName = "student";
const collectionName = "users_2";
const logCollectionName = "log";
const apiUrl = "https://queryservertest.onrender.com/sendRequest";
const apiHeaders = { "Content-Type": "application/json" };

const mongoClient = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// app.get("/", async (req, res) => {
//   try {
//     res.status(200).send("Ok I am awake");
    // console.log("Wake up sid");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.get("/", async (req, res) => {});

router.get("/", async (req, res) => {
   

});

module.exports = router;
