import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get(`/users/${user.user.id}`);
        setProfile(response.data);
        setName(response.data.name);
        setEmail(response.data.email);
      } catch (err: any) {
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleUpdate = async () => {
    try {
      await api.patch(`/users/${user.user.id}`, { name, email });
      setSuccess('Profile updated successfully');
      setError('');
    } catch (err: any) {
      setError('Failed to update profile');
      setSuccess('');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account?')) {
      try {
        await api.delete(`/users/${user.user.id}`);
        logout();
        navigate('/login');
      } catch (err: any) {
        setError('Failed to delete account');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', position: 'relative' }}>
      {/* Tombol Logout di pojok kanan atas */}
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: '#f44336',
          color: '#fff',
          border: 'none',
          padding: '10px 15px',
          cursor: 'pointer',
          borderRadius: '5px'
        }}
      >
        Logout
      </button>

      <h2>Your Profile</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {profile ? (
        <>
          <div>
            <label><strong>Name:</strong></label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label><strong>Email:</strong></label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <p><strong>Role:</strong> {profile.role}</p>

          <button onClick={handleUpdate}>Update Profile</button>
          <button onClick={handleDelete} style={{ marginLeft: '10px', color: 'red' }}>
            Delete Account
          </button>
        </>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profile;
