const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      // Exclude sensitive information
      const userData = doc.data();
      delete userData.password;
      
      users.push({
        id: doc.id,
        ...userData
      });
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get a specific user
router.get('/:id', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Exclude sensitive information
    const userData = userDoc.data();
    delete userData.password;
    
    res.status(200).json({
      id: userDoc.id,
      ...userData
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  try {
    const { name, email, address, phone } = req.body;
    const userRef = db.collection('users').doc(req.params.id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const updatedUser = {};
    
    if (name !== undefined) updatedUser.name = name;
    if (email !== undefined) updatedUser.email = email;
    if (address !== undefined) updatedUser.address = address;
    if (phone !== undefined) updatedUser.phone = phone;
    
    updatedUser.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    await userRef.update(updatedUser);
    
    res.status(200).json({
      id: req.params.id,
      ...updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Create a new user profile (usually called after Firebase Authentication)
router.post('/profile', async (req, res) => {
  try {
    const { uid, name, email, address, phone } = req.body;
    
    if (!uid || !email) {
      return res.status(400).json({ error: 'User ID and email are required' });
    }
    
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      return res.status(409).json({ error: 'User profile already exists' });
    }
    
    const newUser = {
      name: name || '',
      email,
      address: address || '',
      phone: phone || '',
      role: 'customer', // Default role
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await userRef.set(newUser);
    
    res.status(201).json({
      id: uid,
      ...newUser
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    res.status(500).json({ error: 'Failed to create user profile' });
  }
});

module.exports = router;