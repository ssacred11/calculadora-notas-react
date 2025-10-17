// src/components/AttendanceCalculator.jsx
import { useState } from 'react';

function AttendanceCalculator() {
  const [totalClasses, setTotalClasses] = useState('');
  const [absences, setAbsences] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const total = parseInt(totalClasses, 10);
    const absent = parseInt(absences, 10);

    if (isNaN(total) || isNaN(absent) || total <= 0 || absent < 0 || absent > total) {
      alert('Por favor, ingresa números válidos.');
      return;
    }

    const attendancePercentage = ((total - absent) / total) * 100;
    const roundedPercentage = Math.round(attendancePercentage * 10) / 10;
    const meetsRequirement = roundedPercentage >= 85;

    // --- MODIFICACIÓN: Crear JSX para el resultado con colores ---
    setResult(
      <>
        Porcentaje de Asistencia: {roundedPercentage.toFixed(1)}% - Estado: 
        <span className={meetsRequirement ? 'status-aprobado' : 'status-reprobado'}>
          {meetsRequirement ? ' Cumple' : ' No Cumple'}
        </span>
      </>
    );
  };

  const handleClear = () => {
    setTotalClasses('');
    setAbsences('');
    setResult(null);
  };

  return (
    <div className="calculator-container simple-attendance-container">
      <h3>Calculadora Rápida de Asistencia</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <input type="number" min="0" placeholder="Total de clases" value={totalClasses} onChange={(e) => setTotalClasses(e.target.value)} required />
          <input type="number" min="0" placeholder="Número de ausencias" value={absences} onChange={(e) => setAbsences(e.target.value)} required />
        </div>
        <button type="submit">Calcular Asistencia</button>
        <button type="button" onClick={handleClear} style={{ backgroundColor: '#dc3545' }}>Limpiar</button>
      </form>
      {result && <h4>{result}</h4>}
    </div>
  );
}

export default AttendanceCalculator;