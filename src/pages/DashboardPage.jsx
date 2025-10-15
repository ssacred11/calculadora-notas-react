// src/pages/DashboardPage.jsx
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import AverageCalculator from '../components/AverageCalculator';
import AttendanceCalculator from '../components/AttendanceCalculator';

function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div>
      <h1>¡Bienvenido!</h1>
      <p>Esta es tu página principal. Aquí irán las calculadoras.</p>

      {/* Aquí añadiremos los componentes de cálculo más adelante */}

      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
}

export default DashboardPage;