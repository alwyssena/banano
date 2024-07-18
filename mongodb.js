const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://indrasena197:indrasena@cluster0.dov1iki.mongodb.net/databasesocial")
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



const commentSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'collection', // Referring to the 'collection' model for user who made the comment
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  });


const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "mycollection",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'mycollection' // Referring to the 'collection' model for users who liked the post
      
    }
  ],
  comments: [commentSchema],
  date: {
    type: Date,
    default: Date.now,
  },
});


const postt = mongoose.model('postt', PostSchema);

console.log(collection);
module.exports = {collection,postt,commentSchema};
