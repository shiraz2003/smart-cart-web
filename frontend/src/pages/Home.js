import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to Smart Cart</h1>
        <p>Your intelligent shopping solution for a better shopping experience</p>
        <div className="cta-buttons">
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Why Choose Smart Cart?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Smart Recommendations</h3>
            <p>Get personalized product recommendations based on your shopping habits</p>
          </div>
          <div className="feature-card">
            <h3>Easy Checkout</h3>
            <p>Seamless and secure checkout process for a better shopping experience</p>
          </div>
          <div className="feature-card">
            <h3>Order Tracking</h3>
            <p>Track your orders in real-time from purchase to delivery</p>
          </div>
        </div>
      </div>

      <div className="popular-products">
        <h2>Popular Products</h2>
        <div className="products-grid">
          {/* Products will be loaded dynamically */}
          <p>Loading popular products...</p>
        </div>
        <div className="view-all">
          <Link to="/products" className="btn btn-secondary">View All Products</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;