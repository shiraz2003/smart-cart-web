const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Get user's cart
router.get('/:userId', async (req, res) => {
  try {
    const cartRef = db.collection('carts').doc(req.params.userId);
    const cartDoc = await cartRef.get();
    
    if (!cartDoc.exists) {
      return res.status(200).json({ items: [], total: 0 });
    }
    
    res.status(200).json({
      id: cartDoc.id,
      ...cartDoc.data()
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/:userId/items', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Product ID and valid quantity are required' });
    }
    
    const userId = req.params.userId;
    const cartRef = db.collection('carts').doc(userId);
    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = {
      id: productDoc.id,
      ...productDoc.data()
    };
    
    const batch = db.batch();
    
    // Check if cart exists
    const cartDoc = await cartRef.get();
    
    if (!cartDoc.exists) {
      // Create new cart
      const newCart = {
        userId,
        items: [
          {
            productId,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity
          }
        ],
        total: product.price * quantity,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      batch.set(cartRef, newCart);
      
      await batch.commit();
      
      return res.status(201).json(newCart);
    }
    
    // Update existing cart
    const cart = cartDoc.data();
    const items = cart.items || [];
    let total = 0;
    
    // Check if item already in cart
    const existingItemIndex = items.findIndex(item => item.productId === productId);
    
    if (existingItemIndex > -1) {
      // Update quantity of existing item
      items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      items.push({
        productId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity
      });
    }
    
    // Calculate new total
    items.forEach(item => {
      total += item.price * item.quantity;
    });
    
    const updatedCart = {
      items,
      total,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    batch.update(cartRef, updatedCart);
    
    await batch.commit();
    
    res.status(200).json({
      id: userId,
      ...updatedCart,
      items
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update item quantity in cart
router.put('/:userId/items/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const { userId, productId } = req.params;
    
    if (!quantity || quantity < 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }
    
    const cartRef = db.collection('carts').doc(userId);
    const cartDoc = await cartRef.get();
    
    if (!cartDoc.exists) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const cart = cartDoc.data();
    const items = cart.items || [];
    
    // Find item
    const itemIndex = items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    
    // Handle removal if quantity is 0
    if (quantity === 0) {
      items.splice(itemIndex, 1);
    } else {
      // Update quantity
      items[itemIndex].quantity = quantity;
    }
    
    // Calculate new total
    let total = 0;
    items.forEach(item => {
      total += item.price * item.quantity;
    });
    
    const updatedCart = {
      items,
      total,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await cartRef.update(updatedCart);
    
    res.status(200).json({
      id: userId,
      ...updatedCart
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove item from cart
router.delete('/:userId/items/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    const cartRef = db.collection('carts').doc(userId);
    const cartDoc = await cartRef.get();
    
    if (!cartDoc.exists) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const cart = cartDoc.data();
    const items = cart.items || [];
    
    // Find item
    const itemIndex = items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    
    // Remove item
    items.splice(itemIndex, 1);
    
    // Calculate new total
    let total = 0;
    items.forEach(item => {
      total += item.price * item.quantity;
    });
    
    const updatedCart = {
      items,
      total,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await cartRef.update(updatedCart);
    
    res.status(200).json({
      id: userId,
      ...updatedCart
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear cart
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const cartRef = db.collection('carts').doc(userId);
    const cartDoc = await cartRef.get();
    
    if (!cartDoc.exists) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const emptyCart = {
      userId,
      items: [],
      total: 0,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await cartRef.set(emptyCart);
    
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;