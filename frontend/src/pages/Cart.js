import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Cart = () => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate(); // eslint-disable-line no-unused-vars

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/cart/${user.uid}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }
        
        const cartData = await response.json();
        setCart(cartData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError('Failed to load your cart. Please try again.');
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (!user) return;
    
    if (newQuantity < 0) return;
    
    try {
      setUpdating(true);
      
      if (newQuantity === 0) {
        // Remove item from cart
        await removeItem(productId);
      } else {
        // Update item quantity
        const response = await fetch(`/api/cart/${user.uid}/items/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: newQuantity })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update cart');
        }
        
        const updatedCart = await response.json();
        setCart(updatedCart);
      }
      
      setUpdating(false);
    } catch (err) {
      console.error('Error updating cart:', err);
      setUpdating(false);
      alert('Failed to update cart. Please try again.');
    }
  };

  const removeItem = async (productId) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/cart/${user.uid}/items/${productId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }
      
      const updatedCart = await response.json();
      setCart(updatedCart);
    } catch (err) {
      console.error('Error removing item from cart:', err);
      alert('Failed to remove item from cart. Please try again.');
    }
  };

  const clearCart = async () => {
    if (!user || !cart || cart.items.length === 0) return;
    
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    
    try {
      setUpdating(true);
      
      const response = await fetch(`/api/cart/${user.uid}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
      
      setCart({ items: [], total: 0 });
      setUpdating(false);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setUpdating(false);
      alert('Failed to clear cart. Please try again.');
    }
  };

  const proceedToCheckout = () => {
    // This would typically navigate to a checkout page
    alert('Checkout functionality will be implemented in a future update.');
  };

  if (!user) {
    return (
      <div className="cart-page">
        <h1>Your Cart</h1>
        <div className="cart-login-message">
          <p>Please log in to view your cart</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-page">
        <h1>Your Cart</h1>
        <div className="loading">Loading your cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <h1>Your Cart</h1>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <h1>Your Cart</h1>
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <Link to="/products" className="btn btn-primary">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      
      <div className="cart-items">
        {cart.items.map(item => (
          <div key={item.productId} className="cart-item">
            <img 
              src={item.imageUrl || 'https://via.placeholder.com/80'} 
              alt={item.name} 
              className="cart-item-image" 
            />
            <div className="cart-item-details">
              <h3>
                <Link to={`/products/${item.productId}`}>{item.name}</Link>
              </h3>
              <p className="item-price">${item.price.toFixed(2)}</p>
            </div>
            <div className="cart-quantity-controls">
              <button 
                className="quantity-btn"
                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                disabled={updating}
              >
                -
              </button>
              <input 
                type="number" 
                className="quantity-input"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 0)}
                min="0"
                disabled={updating}
              />
              <button 
                className="quantity-btn"
                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                disabled={updating}
              >
                +
              </button>
            </div>
            <div className="item-total">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
            <button 
              className="remove-item"
              onClick={() => removeItem(item.productId)}
              disabled={updating}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      
      <div className="cart-summary">
        <div className="cart-total">
          <h3>Total: ${cart.total.toFixed(2)}</h3>
        </div>
        <div className="cart-actions">
          <button 
            className="btn btn-secondary"
            onClick={clearCart}
            disabled={updating}
          >
            Clear Cart
          </button>
          <button 
            className="btn btn-primary"
            onClick={proceedToCheckout}
            disabled={updating}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;