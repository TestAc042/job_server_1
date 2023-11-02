const express = require("express");
const updateUserDataRoute = require("./routes/updateUserData");
const updateUSet = require("./routes/updateUSet");
const { MongoClient } = require("mongodb");
const axios = require("axios");
const app = express();


app.use('/sendRequest' , updateUserDataRoute)
app.use('/updateUSet' , updateUSet)







module.exports = app