// src/pages/LoginPage.jsx
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      // Si el login es exitoso, redirige al dashboard
      navigate('/dashboard');

    } catch (error) {
      alert(error.error_description || error.message);
    }
  };

  return (
    <div>
      <h2>Ingreso de Usuario</h2>
      <form onSubmit={handleLogin}>
        <label>Correo Electrónico:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <label>Contraseña:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Ingresar</button>
      </form>
      <p>
        ¿No tienes una cuenta? <a href="/register">Regístrate aquí</a>
      </p>
    </div>
  );
}

export default LoginPage;