// src/App.jsx
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  // 1. Creamos un estado para guardar la sesión del usuario
  const [session, setSession] = useState(null);

  // 2. Usamos useEffect para verificar la sesión al cargar la app
  useEffect(() => {
    // Obtenemos la sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Creamos un "oyente" que actualiza el estado 'session'
    // cada vez que el usuario inicia o cierra sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Limpiamos el "oyente" cuando el componente se desmonta
    return () => subscription.unsubscribe();
  }, []); // El array vacío [] asegura que esto solo se ejecute una vez al inicio

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz: si hay sesión va al dashboard, si no, al login */}
        <Route path="/" element={!session ? <Navigate to="/login" /> : <Navigate to="/dashboard" />} />
        
        {/* Rutas de Login y Registro: si ya hay sesión, no pueden accederse */}
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!session ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        
        {/* Ruta Protegida del Dashboard: solo se muestra si hay una sesión activa */}
        <Route path="/dashboard" element={session ? <DashboardPage /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;