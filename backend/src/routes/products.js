const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Get all products
router.get('/', async (req, res) => {
  try {
    const productsSnapshot = await db.collection('products').get();
    const products = [];
    
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get a specific product
router.get('/:id', async (req, res) => {
  try {
    const productDoc = await db.collection('products').doc(req.params.id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json({
      id: productDoc.id,
      ...productDoc.data()
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create a new product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, inStock } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    
    const newProduct = {
      name,
      description: description || '',
      price,
      imageUrl: imageUrl || '',
      category: category || 'general',
      inStock: inStock !== undefined ? inStock : true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('products').add(newProduct);
    
    res.status(201).json({
      id: docRef.id,
      ...newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, inStock } = req.body;
    const productRef = db.collection('products').doc(req.params.id);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const updatedProduct = {};
    
    if (name !== undefined) updatedProduct.name = name;
    if (description !== undefined) updatedProduct.description = description;
    if (price !== undefined) updatedProduct.price = price;
    if (imageUrl !== undefined) updatedProduct.imageUrl = imageUrl;
    if (category !== undefined) updatedProduct.category = category;
    if (inStock !== undefined) updatedProduct.inStock = inStock;
    
    updatedProduct.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    await productRef.update(updatedProduct);
    
    res.status(200).json({
      id: req.params.id,
      ...updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const productRef = db.collection('products').doc(req.params.id);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await productRef.delete();
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;