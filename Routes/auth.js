const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dynamodb = require('../config'); // Your DynamoDB config file

// Register User
router.post('/register', async (req, res) => {
    try {
        const {  email,name, password } = req.body;

        const { v4: uuidv4 } = require('uuid');
        const id = uuidv4();
        // Check if user already exists
        const scanParams = {
            TableName: 'MyAppData',
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email },
        };
        console.log("🔍 Checking email with params:", scanParams);
        const existingUsers = await dynamodb.scan(scanParams).promise();
        if (existingUsers.Items && existingUsers.Items.length > 0) {
            console.log("⚠️ User already exists:", existingUsers.Items);
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = {
            id,
            email,           // Partition key
            name,
            password: hashedPassword,
        };

        // Save to DynamoDB
        const putParams = {
            TableName: 'MyAppData',
            Item: newUser,
        };
        console.log("💾 Saving user with params:", putParams);
        await dynamodb.put(putParams).promise();

        console.log("✅ User registered:", newUser);
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("❌ Error in /register:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get All Users
router.get('/users', async (req, res) => {
    try {
        const scanParams = {
            TableName: 'MyAppData',
        };
        const result = await dynamodb.scan(scanParams).promise();
        const users = result.Items || [];
        console.log("📤 Users:", users);
        res.status(200).json(users);
    } catch (error) {
        console.error("❌ Error in /users:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete('/deleteUser/:id',async(req,res)=>{
    try {
        const { id } = req.params;
        const params = {
            TableName: 'MyAppData',
            Key: { id },
        };
        await dynamodb.delete(params).promise();
        res.status(200).json({ message: "User deleted successfully  " });   

    } catch (error) {
        console.error("❌ Error in /deleteUser:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email (using scan since id is the key)
        const scanParams = {
            TableName: 'MyAppData',
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email },
        };
        const result = await dynamodb.scan(scanParams).promise();
        const findUserByEmail = result.Items && result.Items[0];

        if (!findUserByEmail) {
            return res.status(400).json({ message: "User not found" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, findUserByEmail.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT
        const payload = {
            id: findUserByEmail.id, // Use lowercase 'id'
            name: findUserByEmail.name,
            email: findUserByEmail.email,
        };
        const token = jwt.sign(payload, process.env.JWT_Secret_Key, { expiresIn: "1h" });

        res.status(200).json({
            message: "Logged in successfully",
            token,
            user: {
                id: findUserByEmail.id,
                name: findUserByEmail.name,
                email: findUserByEmail.email,
            },
        });
    } catch (error) {
        console.error("❌ Error in /login:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;