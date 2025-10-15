// src/components/AverageCalculator.jsx
import { useState } from 'react';

function AverageCalculator() {
  const [grades, setGrades] = useState([{ note: '', weight: '' }]);
  const [result, setResult] = useState(null);

  const handleInputChange = (index, event) => {
    const values = [...grades];
    values[index][event.target.name] = event.target.value;
    setGrades(values);
  };

  const handleAddFields = () => {
    setGrades([...grades, { note: '', weight: '' }]);
  };

  const handleRemoveFields = (index) => {
    const values = [...grades];
    values.splice(index, 1);
    setGrades(values);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let totalWeight = 0;
    let finalGrade = 0;

    for (const grade of grades) {
      const note = parseFloat(grade.note);
      const weight = parseInt(grade.weight);

      if (isNaN(note) || isNaN(weight) || note < 1 || note > 7 || weight <= 0) {
        alert('Por favor, ingresa valores válidos. Las notas deben estar entre 1.0 y 7.0.');
        return;
      }
      totalWeight += weight;
      finalGrade += note * (weight / 100);
    }

    if (totalWeight !== 100) {
      alert(`La suma de las ponderaciones debe ser 100%, no ${totalWeight}%.`);
      return;
    }

    const status = finalGrade >= 4.0 ? 'Aprobado' : 'Reprobado';
    setResult(`Nota Final: ${finalGrade.toFixed(2)} - Estado: ${status}`);
  };

  return (
    <div className="calculator-container">
      <h3>Calculadora de Promedio Ponderado</h3>
      <form onSubmit={handleSubmit}>
        {grades.map((grade, index) => (
          <div key={index} className="form-row">
            <input
              type="number"
              step="0.1"
              name="note"
              placeholder={`Nota ${index + 1} (1.0 - 7.0)`}
              value={grade.note}
              onChange={(e) => handleInputChange(index, e)}
              required
            />
            <input
              type="number"
              name="weight"
              placeholder={`Ponderación %`}
              value={grade.weight}
              onChange={(e) => handleInputChange(index, e)}
              required
            />
            {grades.length > 1 && (
              <button type="button" onClick={() => handleRemoveFields(index)}>
                -
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddFields}>
          Añadir Nota
        </button>
        <button type="submit">Calcular Promedio</button>
      </form>
      {result && <h4>{result}</h4>}
    </div>
  );
}

export default AverageCalculator;