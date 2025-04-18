import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productDoc = await getDoc(doc(db, 'products', id));
        
        if (!productDoc.exists()) {
          setError('Product not found');
          setLoading(false);
          return;
        }
        
        setProduct({
          id: productDoc.id,
          ...productDoc.data()
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to fetch product details');
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    if (!product.inStock) {
      alert('Sorry, this product is out of stock');
      return;
    }

    try {
      setAddingToCart(true);
      
      // Call the backend API to add the product to the cart
      const response = await fetch(`/api/cart/${user.uid}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      setAddingToCart(false);
      
      // Show success message and offer to navigate to cart
      if (window.confirm('Product added to cart! View your cart now?')) {
        navigate('/cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setAddingToCart(false);
      alert('Failed to add product to cart. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!product) {
    return <div className="not-found">Product not found</div>;
  }

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        <div className="product-image-container">
          <img 
            src={product.imageUrl || 'https://via.placeholder.com/400'} 
            alt={product.name} 
            className="product-detail-image" 
          />
        </div>
        <div className="product-info-container">
          <h1>{product.name}</h1>
          <p className="product-detail-price">${product.price.toFixed(2)}</p>
          <div className="product-availability">
            {product.inStock ? (
              <span className="in-stock">In Stock</span>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description || 'No description available'}</p>
          </div>
          {product.inStock && (
            <div className="product-actions">
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                />
              </div>
              <button 
                className="btn btn-primary add-to-cart" 
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;