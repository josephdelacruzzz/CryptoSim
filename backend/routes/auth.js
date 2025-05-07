const express = require('express')
const User = require('../models/User')
const router = express.Router()

router.post('/register', async (req, res) => {
    // console.log(req.body)
    try {
        const {username, password} = req.body
        const existingUser = await User.findOne({username})
        if (existingUser) {
            // console.log(`Username ' ${username}' already exists.`)
            return res.status(400).json({ 
                error: "Username already exists",
                debug: `User '${username}' is already taken` 
            })
        }

        const user = new User({username, password})
        // console.log(`Attempting to save user '${username}'...`)
        await user.save()
        // console.log(`User '${username}' registered successfully.`)

        res.status(201).json({
            message: "User created",
            userId: user._id,
            balance: user.balance
        })
    } catch (error) {
        // console.log(req.body)
        // console.log(error)
        res.status(400).json({ error: "Username exists"})
    }
})

router.post('/login', async (req, res) => {
    try {
        const {username, password } = req.body
        const user = await User.findOne({username})

        if (!user || user.password !== password) {
            return res.status(401).json({success: false, error: "Wrong username or password"})
        }

        res.json({
            success: true,
            user: {
                username: user.username,
                balance: user.balance,
                _id: user._id
            }
        })
    } catch (error) {
        res.status(500).json({error: "Server error"})
    }
})

module.exports = router