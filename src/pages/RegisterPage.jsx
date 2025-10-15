// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // --- Validaciones ---
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) throw error;

      alert('Registro exitoso. Revisa tu correo para confirmar la cuenta.');
      navigate('/login');

    } catch (error) {
      alert(error.error_description || error.message);
    }
  };

  return (
    <div>
      <h2>Crear una Cuenta</h2>
      <form onSubmit={handleRegister}>
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
        <label>Confirmar Contraseña:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Registrarse</button>
      </form>
      <p>
        ¿Ya tienes una cuenta? <a href="/login">Ingresa aquí</a>
      </p>
    </div>
  );
}

export default RegisterPage;