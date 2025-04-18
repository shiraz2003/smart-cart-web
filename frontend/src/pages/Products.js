import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        
        const productsList = [];
        const categoriesSet = new Set();
        
        productsSnapshot.forEach((doc) => {
          const product = {
            id: doc.id,
            ...doc.data()
          };
          productsList.push(product);
          
          // Collect categories
          if (product.category) {
            categoriesSet.add(product.category);
          }
        });
        
        setProducts(productsList);
        setCategories(Array.from(categoriesSet));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products by category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="products-page">
      <h1>All Products</h1>
      
      {/* Category Filter */}
      <div className="category-filter">
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <div className="loading">Loading products...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <Link to={`/products/${product.id}`}>
                  <img 
                    src={product.imageUrl || 'https://via.placeholder.com/150'} 
                    alt={product.name} 
                    className="product-image" 
                  />
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-price">${product.price.toFixed(2)}</p>
                    {product.inStock ? (
                      <span className="in-stock">In Stock</span>
                    ) : (
                      <span className="out-of-stock">Out of Stock</span>
                    )}
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="no-products">
              No products found in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;