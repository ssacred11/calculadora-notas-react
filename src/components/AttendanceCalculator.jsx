// src/components/AttendanceCalculator.jsx
import { useState } from 'react';

function AttendanceCalculator() {
  const [totalClasses, setTotalClasses] = useState('');
  const [absences, setAbsences] = useState('');
  const [requiredPercentage, setRequiredPercentage] = useState(85);
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const total = parseInt(totalClasses);
    const absent = parseInt(absences);

    if (isNaN(total) || isNaN(absent) || total <= 0 || absent < 0 || absent > total) {
      alert('Por favor, ingresa números válidos. Las ausencias no pueden superar el total de clases.');
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
            type="number"
            placeholder="Total de clases"
            value={totalClasses}
            onChange={(e) => setTotalClasses(e.target.value)}
            required
          />
          <input
            type="number"
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