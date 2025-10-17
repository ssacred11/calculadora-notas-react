// src/components/AverageCalculator.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function AverageCalculator() {
  const [grades, setGrades] = useState([{ note: '', weight: '' }]);
  const [result, setResult] = useState(null);
  const [combinationName, setCombinationName] = useState('');
  const [savedCombinations, setSavedCombinations] = useState([]);
  const [selectedCombinationId, setSelectedCombinationId] = useState('');
  const [neededGrade, setNeededGrade] = useState(null);

  useEffect(() => {
    fetchSavedCombinations();
  }, []);

  const fetchSavedCombinations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('saved_grades')
        .select('id, combination_name')
        .eq('user_id', user.id);

      if (error) console.error('Error cargando combinaciones:', error);
      else setSavedCombinations(data);
    }
  };

  const performCalculation = (gradesToCalculate) => {
    let totalWeight = 0;
    let finalGrade = 0;
    let isValid = true;

    for (const grade of gradesToCalculate) {
      const noteInput = parseInt(grade.note, 10);
      const note = noteInput / 10.0;
      const weight = parseInt(grade.weight, 10);

      if (isNaN(note) || isNaN(weight) || grade.note === '' || grade.weight === '') {
        isValid = false;
        break;
      }
      totalWeight += weight;
      finalGrade += note * (weight / 100);
    }

    if (!isValid) {
      setResult(null);
      setNeededGrade(null);
      alert('La combinación cargada tiene campos incompletos.');
      return;
    }
    if (totalWeight > 100) {
      setResult(null);
      setNeededGrade(null);
      alert(`La suma de las ponderaciones no puede superar el 100%. Suma actual: ${totalWeight}%.`);
      return;
    }

    const roundedGrade = Math.round(finalGrade * 10) / 10;
    const status = roundedGrade >= 4.0 ? 'Aprobado' : 'Reprobado';
    setResult(`Nota Final: ${roundedGrade.toFixed(1)} - Estado: ${status}`);
    setNeededGrade(null);

    if (totalWeight < 100) {
      const remainingWeight = 100 - totalWeight;
      const neededScore = (4.0 - finalGrade) / (remainingWeight / 100);
      if (neededScore > 0 && neededScore <= 7.0) {
        setNeededGrade(`Para aprobar con un 4.0, necesitas un ${neededScore.toFixed(1)} en el ${remainingWeight}% restante.`);
      } else if (neededScore > 7.0) {
        setNeededGrade(`Incluso con un 7.0 en el ${remainingWeight}% restante, no alcanzas a aprobar.`);
      } else {
        setNeededGrade(`Ya has aprobado con las notas actuales.`);
      }
    }
  };

  const handleInputChange = (index, event) => {
    const values = [...grades];
    let inputValue = event.target.value.replace(/[^0-9]/g, '');
    if (event.target.name === 'note' && inputValue) {
      if (parseInt(inputValue, 10) > 70) inputValue = '70';
    } else if (event.target.name === 'weight' && inputValue) {
      if (parseInt(inputValue, 10) > 100) inputValue = '100';
    }
    values[index][event.target.name] = inputValue;
    setGrades(values);
  };

  const handleAddFields = () => setGrades([...grades, { note: '', weight: '' }]);
  const handleRemoveFields = (index) => {
    const values = [...grades];
    values.splice(index, 1);
    setGrades(values);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performCalculation(grades);
  };

  const handleSaveCombination = async () => {
    if (!combinationName) {
      alert('Por favor, dale un nombre a la combinación antes de guardarla.');
      return;
    }
    // Lógica para guardar...
  };

  const handleLoadCombination = async (event) => {
    const idToLoad = event.target.value;
    setSelectedCombinationId(idToLoad);

    if (idToLoad) {
      const { data, error } = await supabase
        .from('saved_grades')
        .select('grades_data')
        .eq('id', idToLoad)
        .single();
      
      if (error) {
        alert('Error al cargar la combinación.');
      } else {
        setGrades(data.grades_data);
        performCalculation(data.grades_data);
      }
    } else {
      handleClear();
    }
  };

  const handleDeleteCombination = async () => {
    // Lógica para borrar...
  };

  const handleClear = () => {
    setGrades([{ note: '', weight: '' }]);
    setResult(null);
    setNeededGrade(null);
    setCombinationName('');
    setSelectedCombinationId('');
  };

  return (
    <div className="calculator-container average-calculator-container">
      <h3>Calculadora de Promedio Ponderado</h3>

      <div className="saved-grades-controls">
        <select value={selectedCombinationId} onChange={handleLoadCombination}>
          <option value="">-- Cargar una combinación --</option>
          {savedCombinations.map(combo => (
            <option key={combo.id} value={combo.id}>{combo.combination_name}</option>
          ))}
        </select>
        {selectedCombinationId && <button onClick={handleDeleteCombination} className="delete-button">Borrar</button>}
      </div>

      <form onSubmit={handleSubmit}>
        {grades.map((grade, index) => (
          <div key={index} className="form-row">
            <input type="text" name="note" placeholder={`Nota ${index + 1} (10-70)`} value={grade.note} onChange={(e) => handleInputChange(index, e)} maxLength="2" required />
            <div className="input-with-symbol">
              <input type="text" name="weight" placeholder={`Ponderación`} value={grade.weight} onChange={(e) => handleInputChange(index, e)} maxLength="3" required />
              <span>%</span>
            </div>
            {grades.length > 1 && <button type="button" onClick={() => handleRemoveFields(index)}>-</button>}
          </div>
        ))}
        
        <button type="button" onClick={handleAddFields}>Añadir Nota</button>
        <button type="submit">Calcular Promedio</button>
        <button type="button" onClick={handleClear} style={{ backgroundColor: '#dc3545' }}>Limpiar</button>
      </form>
      
      {result && <h4>{result}</h4>}
      {neededGrade && <p className="needed-grade-text">{neededGrade}</p>}

      <div className="save-combination">
        <input type="text" value={combinationName} onChange={(e) => setCombinationName(e.target.value)} placeholder="Nombre de la combinación" />
        <button onClick={handleSaveCombination}>Guardar</button>
      </div>
    </div>
  );
}

export default AverageCalculator;