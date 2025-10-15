// src/pages/DashboardPage.jsx
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import AverageCalculator from '../components/AverageCalculator'; // Importar
import AttendanceCalculator from '../components/AttendanceCalculator'; // Importar

function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header>
        <h1>Panel de Herramientas</h1>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </header>
      
      <main>
        <AverageCalculator />
        <AttendanceCalculator />
      </main>
    </div>
  );
}

export default DashboardPage;