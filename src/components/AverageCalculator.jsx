// src/components/AverageCalculator.jsx
import { useState } from 'react';

function AverageCalculator() {
  const [grades, setGrades] = useState([{ note: '', weight: '' }]);
  const [result, setResult] = useState(null);

  const handleInputChange = (index, event) => {
    const values = [...grades];
    let inputValue = event.target.value;

    if (event.target.name === 'note') {
      // Permitir solo números y asegurar que no haya un punto decimal si no lo queremos
      inputValue = inputValue.replace(/[^0-9]/g, ''); // Solo números
      if (inputValue.length > 0) {
        // Asegurarse de que el valor numérico no excede 70 (para representar 7.0)
        let numValue = parseInt(inputValue, 10);
        if (numValue > 70) numValue = 70;
        if (numValue < 10 && inputValue.length > 1) numValue = 10; // Evitar 01, 02 etc.
        inputValue = numValue.toString();
      }
    } else if (event.target.name === 'weight') {
      // Permitir solo números y asegurar que no sea negativo
      inputValue = inputValue.replace(/[^0-9]/g, '');
      if (inputValue === '' || parseInt(inputValue, 10) < 0) {
        inputValue = ''; // No permitir negativos
      }
      if (parseInt(inputValue, 10) > 100) inputValue = '100'; // Máx 100%
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
      // Convertir el input de nota (ej. '45') a flotante (ej. 4.5)
      const noteInput = parseInt(grade.note, 10);
      const note = noteInput / 10.0; // Lo dividimos por 10 para simular el punto
      const weight = parseInt(grade.weight, 10);

      // Nuevas validaciones mejoradas
      if (isNaN(noteInput) || isNaN(weight) || noteInput === '' || grade.weight === '') {
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

    const status = finalGrade >= 4.0 ? 'Aprobado' : 'Reprobado';
    setResult(`Nota Final: ${finalGrade.toFixed(2)} - Estado: ${status}`);
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
              type="text" // Cambiado a text para mayor control sobre el input
              name="note"
              placeholder={`Nota ${index + 1} (10-70)`}
              value={grade.note}
              onChange={(e) => handleInputChange(index, e)}
              maxLength="2" // Limitar a dos dígitos (ej. 70)
              required
            />
            <input
              type="text" // Cambiado a text para mayor control
              name="weight"
              placeholder={`Ponderación %`}
              value={grade.weight}
              onChange={(e) => handleInputChange(index, e)}
              maxLength="3" // Máximo 3 dígitos (100)
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
        <button type="button" onClick={handleClear} style={{ backgroundColor: '#dc3545' }}>
          Limpiar
        </button>
      </form>
      {result && <h4>{result}</h4>}
    </div>
  );
}

export default AverageCalculator;