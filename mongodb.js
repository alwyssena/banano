const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://indrasena197:indrasena@cluster0.dov1iki.mongodb.net/ddatatable")
    .then(() => {
        console.log("success")
    })
    .catch((error) => {
        console.error("error", error)
    });

    const newSchema = new mongoose.Schema({
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        
    });

const collection = mongoose.model("mycollection", newSchema);

console.log(collection);
module.exports = collection;
