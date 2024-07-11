const express = require("express");
const collection = require("./mongodb");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const app=express()
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'alwaysindra99@gmail.com',
        pass: 'axki ieqj ypap plss'
    }
});

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
                // const token = jwt.sign(payload, "INDRA", { expiresIn: '1d' });
                res.json("logged in");
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



app.listen(30003,()=>{
    console.log("dfds")
})