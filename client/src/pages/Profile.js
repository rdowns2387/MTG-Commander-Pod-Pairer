import React, { useState, useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

const Profile = () => {
  const { currentUser, updateUserDetails, updatePin, error, clearError } = useContext(AuthContext);
  
  const [profileData, setProfileData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || ''
  });
  
  const [pinData, setPinData] = useState({
    currentPin: '',
    newPin: '',
    confirmNewPin: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  
  const { firstName, lastName, email } = profileData;
  const { currentPin, newPin, confirmNewPin } = pinData;
  
  // Handle profile form change
  const onProfileChange = e => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };
  
  // Handle PIN form change
  const onPinChange = e => {
    setPinData({ ...pinData, [e.target.name]: e.target.value });
  };
  
  // Update profile
  const onProfileSubmit = async e => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await updateUserDetails({ firstName, lastName, email });
      setAlert({ type: 'success', msg: 'Profile updated successfully' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    } catch (err) {
      setAlert({ 
        type: 'danger', 
        msg: err.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Update PIN
  const onPinSubmit = async e => {
    e.preventDefault();
    
    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(newPin)) {
      setAlert({ type: 'danger', msg: 'PIN must be exactly 4 digits' });
      return;
    }
    
    // Check if PINs match
    if (newPin !== confirmNewPin) {
      setAlert({ type: 'danger', msg: 'New PINs do not match' });
      return;
    }
    
    try {
      setLoading(true);
      await updatePin({ currentPin, newPin });
      setAlert({ type: 'success', msg: 'PIN updated successfully' });
      
      // Clear form
      setPinData({
        currentPin: '',
        newPin: '',
        confirmNewPin: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    } catch (err) {
      setAlert({ 
        type: 'danger', 
        msg: err.response?.data?.message || 'Failed to update PIN' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="main-content">
      <h1>Profile</h1>
      
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.msg}
        </div>
      )}
      
      <div className="card">
        <h2>Update Profile</h2>
        <div className="card-body">
          <form onSubmit={onProfileSubmit}>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={firstName}
                onChange={onProfileChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={lastName}
                onChange={onProfileChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={onProfileChange}
                className="form-control"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              Update Profile
            </button>
          </form>
        </div>
      </div>
      
      <div className="card">
        <h2>Change PIN</h2>
        <div className="card-body">
          <form onSubmit={onPinSubmit}>
            <div className="form-group">
              <label htmlFor="currentPin">Current PIN</label>
              <input
                type="password"
                name="currentPin"
                id="currentPin"
                value={currentPin}
                onChange={onPinChange}
                className="form-control"
                maxLength="4"
                pattern="[0-9]{4}"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPin">New PIN (4 digits)</label>
              <input
                type="password"
                name="newPin"
                id="newPin"
                value={newPin}
                onChange={onPinChange}
                className="form-control"
                maxLength="4"
                pattern="[0-9]{4}"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmNewPin">Confirm New PIN</label>
              <input
                type="password"
                name="confirmNewPin"
                id="confirmNewPin"
                value={confirmNewPin}
                onChange={onPinChange}
                className="form-control"
                maxLength="4"
                pattern="[0-9]{4}"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              Update PIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;