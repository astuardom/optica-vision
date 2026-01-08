
import React, { useState } from 'react';
import { loginAdmin } from '../services/firebaseService';

const Login: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginAdmin(email, pass);
      onLoginSuccess();
    } catch (err: any) {
      setError("Credenciales incorrectas o acceso denegado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-20">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 border border-gray-100 animate-zoom-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl">admin_panel_settings</span>
          </div>
          <h1 className="text-2xl font-black text-text-main">Acceso Interno</h1>
          <p className="text-text-sub text-sm">Ingresa para gestionar citas y recetas.</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold text-center border border-red-100">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email Corporativo" 
            className="w-full h-14 rounded-2xl border-gray-100 px-6 font-bold text-sm focus:ring-primary bg-gray-50/50"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full h-14 rounded-2xl border-gray-100 px-6 font-bold text-sm focus:ring-primary bg-gray-50/50"
            value={pass}
            onChange={e => setPass(e.target.value)}
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-lg hover:bg-primary-hover transition-all disabled:opacity-50"
          >
            {loading ? 'AUTENTICANDO...' : 'ENTRAR AL PANEL'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
