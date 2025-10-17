// src/components/AverageCalculator.jsx
import { useState } from 'react';

function AverageCalculator() {
  const [grades, setGrades] = useState([{ note: '', weight: '' }]);
  const [result, setResult] = useState(null);

  const handleInputChange = (index, event) => {
    const values = [...grades];
    let inputValue = event.target.value;

    // Validations to allow only numbers
    inputValue = inputValue.replace(/[^0-9]/g, '');

    if (event.target.name === 'note') {
      if (inputValue.length > 0) {
        let numValue = parseInt(inputValue, 10);
        if (numValue > 70) numValue = 70;
        if (numValue < 10 && inputValue.length > 1) numValue = 10;
        inputValue = numValue.toString();
      }
    } else if (event.target.name === 'weight') {
      if (parseInt(inputValue, 10) > 100) inputValue = '100';
    }
    
    values[index][event.target.name] = inputValue;
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
      const noteInput = parseInt(grade.note, 10);
      const note = noteInput / 10.0;
      const weight = parseInt(grade.weight, 10);

      if (isNaN(noteInput) || isNaN(weight) || grade.note === '' || grade.weight === '') {
        alert('Todos los campos de nota y ponderación deben estar completos.');
        return;
      }
      if (note < 1.0 || note > 7.0) {
        alert('Las notas deben estar entre 1.0 y 7.0 (ingresa 10 para 1.0, 70 para 7.0).');
        return;
      }
      if (weight <= 0 || weight > 100) {
        alert('La ponderación debe ser un número positivo y no puede superar el 100%.');
        return;
      }
      
      totalWeight += weight;
      finalGrade += note * (weight / 100);
    }

    if (totalWeight !== 100) {
      alert(`La suma de las ponderaciones debe ser 100%, no ${totalWeight}%.`);
      return;
    }
    
    // --- MODIFICATION: Rounding to one decimal place ---
    const roundedGrade = Math.round(finalGrade * 10) / 10;
    const status = roundedGrade >= 4.0 ? 'Aprobado' : 'Reprobado';
    setResult(`Nota Final: ${roundedGrade.toFixed(1)} - Estado: ${status}`);
  };

  const handleClear = () => {
    setGrades([{ note: '', weight: '' }]);
    setResult(null);
  };

  return (
    <div className="calculator-container">
      <h3>Calculadora de Promedio Ponderado</h3>
      <form onSubmit={handleSubmit}>
        {grades.map((grade, index) => (
          <div key={index} className="form-row">
            <input
              type="text"
              name="note"
              placeholder={`Nota ${index + 1} (10-70)`}
              value={grade.note}
              onChange={(e) => handleInputChange(index, e)}
              maxLength="2"
              required
            />
            {/* --- MODIFICATION: Container for weight input with '%' --- */}
            <div className="input-with-symbol">
              <input
                type="text"
                name="weight"
                placeholder={`Ponderación`}
                value={grade.weight}
                onChange={(e) => handleInputChange(index, e)}
                maxLength="3"
                required
              />
              <span>%</span>
            </div>
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
        <button type="button" onClick={handleClear} style={{ backgroundColor: '#dc3545' }}>
          Limpiar
        </button>
      </form>
      {result && <h4>{result}</h4>}
    </div>
  );
}

export default AverageCalculator;