const express = require("express");
const {collection,postt,commentSchema} = require("./mongodb");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const jwt=require( "jsonwebtoken")
const app=express()
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'alwaysindra99@gmail.com',
        pass: 'axki ieqj ypap plss'
    }
});


const authenticateToken = (request, response, next) => {
    let jwtToken;
    const authHeader = request.headers["authorization"];
    if (authHeader !== undefined) {
      jwtToken = authHeader.split(" ")[1];
    }
    if (jwtToken === undefined) {
      response.status(401);
      response.send("Invalid JWT Token");
    } else {
      jwt.verify(jwtToken, "indra", async (error, payload) => {
        if (error) {
          response.status(401);
          response.send("Invalid JWT Token");
        } else {
          request.username = payload.username;
          next();
        }
      });
    }
  };

app.post("/signup",async(req,res)=>{
const {email,username,password}=req.body
try{
    const check = await collection.findOne({ email: email });
    if (check) {
        res.json("exist");
    }
    else{
      
       // const hash=await bcrypt.hash(password,10)
        const newUser = { email, username,password };
        await collection.insertMany([newUser]);
        res.json("User created successfully");
    }
}
catch{
    res.json("fail");
}
})

app.post("/login", async (req, res) => {
    const {  username,password } = req.body;
    try {
        const user = await collection.findOne({username:username });
        if (user) {
            const isPasswordMatched = await (password===user.password);
            if (isPasswordMatched) {
                // const payload = { email: email };
                const payload = {
                    username: username,
                  };
                  const jwtToken = jwt.sign(payload, "indra");
                  console.log(jwtToken)
                 
                  res.send({ jwtToken });
            } else {
                res.json("check pwd");
            }
        } else {
            res.json("User not found");
        }
    } catch (e) {
        res.json("fail");
    }
});

app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await collection.findOne({ email: email });
        if (!user) {
            return res.status(404).json("User not found");
        }

        // const resetToken = crypto.randomBytes(32).toString("hex");
        // const hashedResetToken = await bcrypt.hash(resetToken, 10);
       // const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        //await collection.updateOne({ email }, { $set: { resetToken: hashedResetToken, resetTokenExpiry } });

        const resetUrl = `http://localhost:3001/reset-password?email=${email}`;

        const mailOptions = {
            from: 'alwaysindra99@gmail.com',
            to: user.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click this link to reset your password: ${resetUrl}`
        };

        await transporter.sendMail(mailOptions);
        res.json("Password reset email sent");
    } catch (error) {
        console.error("Error sending reset email:", error);
        res.status(500).json("Server error");
    }
});

// Reset Password Route
app.post("/reset-password", async (req, res) => {
    const {  email, newPassword } = req.body;
    try {
        const user = await collection.findOne({ email });
        if (!user) {
            return res.status(404).json("User not found");
        }

        //const isTokenValid = await bcrypt.compare(token, user.resetToken);
        // if (!isTokenValid || user.resetTokenExpiry < Date.now()) {
        //     return res.status(400).json("Invalid or expired token");
        // }

        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(newPassword, salt);

        await collection.updateOne(
            { email },
            { $set: { password: newPassword} }
        );

        res.json("Password reset successfully");
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json("Server error");
    }
});

app.post("/p", authenticateToken,async (req, res) => {
    const { title,content } = req.body;
    
console.log(title)
const username=req.username
console.log(username)
try {
        const user = await collection.findOne({ username });
        console.log(user)
        if (!user) {
            return res.status(404).json("User not found");
        }

        // Create a new post instance
        const newPost = new postt({
            user: user._id,
            title,
            content,
            date: new Date()
        });

        // Save the new post to the database
        await newPost.save();
        
        res.json("Post created successfully");
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json("Server error");
    }
    
});


app.put("/post/:id", authenticateToken, async (req, res) => {
    const { title, content } = req.body;
    const postId = req.params.id;
    const username = req.username; // Username from the JWT payload

    try {
        // Find the user by username
        const userr = await collection.findOne({ username });
        if (!userr) {
            return res.status(404).json("User not found");
        }
console.log(userr)
        // Find the post by ID and ensure it belongs to the logged-in user
        const post = await postt.findOne({ _id: postId, user: userr._id });
        if (!post) {
            return res.status(404).json("Post not found");
        }

        // Update the post with new title and content
        post.title = title;
        post.content = content;
        await post.save();

        res.json("Post updated successfully");
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json("Server error");
    }
});

app.get("/posts", authenticateToken, async (req, res) => {
    const username = req.username; // Username from the JWT payload

    try {
        // Find the user by username
        const user = await collection.findOne({ username });
        if (!user) {
            return res.status(404).json("User not found");
        }

        // Find posts by the user
        const posts = await postt.find({ user: user._id }).populate('user', 'username');

        res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json("Server error");
    }
});

app.delete("/post/:id", authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const username = req.username; // Username from the JWT payload

    try {
        // Find the user by username
        const user = await collection.findOne({ username });
        if (!user) {
            return res.status(404).json("User not found");
        }

        // Find the post by ID and ensure it belongs to the logged-in user
        const post = await postt.findOne({ _id: postId, user: user._id });
        if (!post) {
            return res.status(404).json("Post not found");
        }

        // Convert the post object to a Mongoose document
       // const postDoc = new postt(post);

        // Delete the post
        await post.deleteOne();

        res.json("Post deleted successfully");
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json("Server error");
    }
});


app.post("/post/like/:id", authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const username = req.username; // Username from the JWT payload
console.log(username )
    try {
        // Find the user by username
        const user = await collection.findOne({ username });
        if (!user) {
            return res.status(404).json("User not found");
        }

        // Find the post by ID and update its likes array
        const post = await postt.findById(postId);
        if (!post) {
            return res.status(404).json("Post not found");
        }

        // Check if the user already liked the post
        if (post.likes.includes(user._id)) {
            return res.status(400).json("You have already liked this post");
        }

        // Add user's ID to the likes array
        post.likes.push(user._id);
        await post.save();

        res.json("Post liked successfully");
    } catch (error) {
        console.error("Error liking post:", error);
        res.status(500).json("Server error");
    }
});


// Add Comment Route
app.post("/post/comment/:id", authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const { text } = req.body;
    const username = req.username; // Username from the JWT payload
console.log(username,text)
    try {
        // Find the user by username
        const user = await collection.findOne({ username });
        console
        if (!user) {
            return res.status(404).json("User not found");
        }

        // Find the post by ID
        const post = await postt.findById(postId);
        console.log(post)
        if (!post) {
            return res.status(404).json("Post not found");
        }

        // Create a new comment
        const newComment = {
            user: user._id,
            text,
            date: new Date()
        };
console.log(newComment)
        // Add the comment to the post
        post.comments.push(newComment);
        await post.save();

        res.json("Comment added successfully");
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json("Server error");
    }
});



app.listen(30003,()=>{
    console.log("server running")
})
