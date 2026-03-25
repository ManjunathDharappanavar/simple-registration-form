const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Basic validation in backend
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'Email is already registered' });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
        }

        // NOTE: In a production environment, you should hash the password using bcrypt before saving!
        const newUser = new User({
            username,
            email,
            password
        });

        await newUser.save();
        res.status(201).json({ 
            message: 'User registered successfully', 
            user: { id: newUser._id, username: newUser.username, email: newUser.email } 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
