import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

const AuthForm: React.FC<{ isLogin: boolean }> = ({ isLogin }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('mahasiswa');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = isLogin
        ? { email, password }
        : { email, password, name, role };

      const response = isLogin
        ? await api.post('/auth/login', payload)
        : await api.post('/auth/register', payload);

      if (isLogin) {
        login(response.data);
        setSuccess('Login successful!');
        navigate('/Home');
    } else {
        setSuccess('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Authentication failed';
      setError(typeof message === 'string' ? message : message[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3>{isLogin ? 'Login' : 'Register'}</h3>

      {!isLogin && (
        <>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
            style={styles.input}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
            <option value="mahasiswa">mahasiswa</option>
            <option value="dosen">dosen</option>
          </select>
        </>
      )}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        style={styles.input}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        style={styles.input}
      />
      <button type="submit" style={styles.button}>
        {isLogin ? 'Login' : 'Register'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  form: {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '0.5rem',
    marginBottom: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default AuthForm;
