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
    <div className="dashboard-container">
      <header>
        <h1>Mis calculadoras</h1>
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