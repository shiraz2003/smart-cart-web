import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, getUserProfile } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // User not logged in, redirect to login
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const result = await getUserProfile(user.uid);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch user profile');
        }
        
        setProfile(result.profile);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load your profile. Please try again.');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!user || !profile) {
    return <div className="error">User profile not found</div>;
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="avatar-image" />
            ) : (
              <div className="avatar-placeholder">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h2>{profile.name}</h2>
            <p className="profile-email">{profile.email}</p>
            <p className="profile-role">Role: {profile.role || 'Customer'}</p>
          </div>
        </div>
        
        <div className="profile-details">
          <div className="profile-section">
            <h3>Account Information</h3>
            <div className="profile-field">
              <span className="field-label">Email:</span>
              <span className="field-value">{profile.email}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Member since:</span>
              <span className="field-value">
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="profile-section">
            <h3>Contact Information</h3>
            <div className="profile-field">
              <span className="field-label">Address:</span>
              <span className="field-value">
                {profile.address || 'No address added'}
              </span>
            </div>
            <div className="profile-field">
              <span className="field-label">Phone:</span>
              <span className="field-value">
                {profile.phone || 'No phone number added'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="profile-actions">
          <button className="btn btn-primary">Edit Profile</button>
          <button className="btn btn-secondary">Change Password</button>
        </div>
      </div>
      
      <div className="order-history">
        <h2>Order History</h2>
        <p>You haven't placed any orders yet.</p>
      </div>
    </div>
  );
};

export default Profile;