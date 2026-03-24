import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const { login } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', { name, email, password, adminSecret });
      login(res.data);
      if(res.data.user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-2xl font-bold mb-4">Signup</h2>
        <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 mb-2 border rounded"/>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 mb-2 border rounded"/>
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 mb-2 border rounded"/>
        <input type="text" placeholder="Admin Secret (Optional)" value={adminSecret} onChange={e => setAdminSecret(e.target.value)} className="w-full p-2 mb-4 border rounded"/>
        <button className="w-full bg-green-500 text-white p-2 rounded">Signup</button>
      </form>
    </div>
  );
}