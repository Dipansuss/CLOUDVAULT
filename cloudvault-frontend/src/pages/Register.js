import React, { useState } from 'react';
import './Register.css';   // Import your Register-specific styles
import { useNavigate } from 'react-router-dom';
import API from '../api';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/register', form);
      setMsg(res.data.msg);
      setTimeout(() => navigate('/'), 1500); // Redirect to login after success
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Your CloudVault Account ☁️</h2>
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            onChange={handleChange}
            required
          />

          <button type="submit">Register</button>
          <p>
            Already have an account? <span onClick={() => navigate('/')}>Login</span>
          </p>
        </form>
        {msg && <p style={{ color: 'green' }}>{msg}</p>}
      </div>
    </div>
  );
}

export default Register;
