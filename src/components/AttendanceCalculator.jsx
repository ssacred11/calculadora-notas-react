// src/components/AttendanceCalculator.jsx
import { useState } from 'react';

function AttendanceCalculator() {
  const [totalClasses, setTotalClasses] = useState('');
  const [absences, setAbsences] = useState('');
  const [requiredPercentage] = useState(85); // No permitimos que el usuario cambie esto directamente
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const total = parseInt(totalClasses, 10);
    const absent = parseInt(absences, 10);

    // Validaciones mejoradas
    if (isNaN(total) || isNaN(absent) || totalClasses === '' || absences === '') {
      alert('Todos los campos deben estar completos.');
      return;
    }
    if (total <= 0) {
      alert('El total de clases debe ser un número positivo.');
      return;
    }
    if (absent < 0) {
      alert('El número de ausencias no puede ser negativo.');
      return;
    }
    if (absent > total) {
      alert('El número de ausencias no puede ser mayor al total de clases.');
      return;
    }

    const attendancePercentage = ((total - absent) / total) * 100;
    const meetsRequirement = attendancePercentage >= requiredPercentage;
    const status = meetsRequirement ? 'Cumple' : 'No Cumple';

    setResult(`Porcentaje de Asistencia: ${attendancePercentage.toFixed(2)}% - Estado: ${status}`);
  };

  const handleClear = () => {
    setTotalClasses('');
    setAbsences('');
    setResult(null);
  };

  return (
    <div className="calculator-container">
      <h3>Calculadora de Asistencia</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <input
            type="number" // Mantener como number para el spinner, pero añadir min
            min="0" // No permitir negativos
            placeholder="Total de clases"
            value={totalClasses}
            onChange={(e) => setTotalClasses(e.target.value)}
            required
          />
          <input
            type="number" // Mantener como number para el spinner, pero añadir min
            min="0" // No permitir negativos
            placeholder="Número de ausencias"
            value={absences}
            onChange={(e) => setAbsences(e.target.value)}
            required
          />
        </div>
        <button type="submit">Calcular Asistencia</button>
        <button type="button" onClick={handleClear} style={{ backgroundColor: '#dc3545' }}>
          Limpiar
        </button>
      </form>
      {result && <h4>{result}</h4>}
    </div>
  );
}

export default AttendanceCalculator;