import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkiTRBqyPUEI2vxOWjxpRvMHLnJ7vm9rU",
  authDomain: "smart-cart-e4ff3.firebaseapp.com",
  projectId: "smart-cart-e4ff3",
  storageBucket: "smart-cart-e4ff3.firebasestorage.app",
  messagingSenderId: "327888803071",
  appId: "1:327888803071:web:e705547e4943ed3e41e8ca",
  measurementId: "G-8GV88SHJMB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // eslint-disable-line no-unused-vars

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;