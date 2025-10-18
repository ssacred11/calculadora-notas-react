// src/components/AverageCalculator.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify'; // Importar toast
import Spinner from './Spinner'; // Importar Spinner

function AverageCalculator() {
  const [grades, setGrades] = useState([{ note: '', weight: '' }]);
  const [result, setResult] = useState(null);
  const [combinationName, setCombinationName] = useState('');
  const [savedCombinations, setSavedCombinations] = useState([]);
  const [selectedCombinationId, setSelectedCombinationId] = useState('');
  const [neededGrade, setNeededGrade] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Estado de carga

  useEffect(() => {
    fetchSavedCombinations();
  }, []);

  const fetchSavedCombinations = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from('saved_grades').select('id, combination_name').eq('user_id', user.id);
      if (error) toast.error('Error al cargar combinaciones');
      else setSavedCombinations(data);
    }
    setIsLoading(false);
  };
  
  // ... (performCalculation, handleInputChange, etc. se mantienen igual) ...

  const handleSaveCombination = async () => {
    if (!combinationName) {
      toast.warn('Por favor, dale un nombre a la combinación.');
      return;
    }
    // ... validaciones ...
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('saved_grades').insert({ /* ... */ });
      if (error) toast.error('Error al guardar: ' + error.message);
      else {
        toast.success('¡Combinación guardada!');
        setCombinationName('');
        fetchSavedCombinations();
      }
    }
    setIsLoading(false);
  };

  const handleLoadCombination = async (event) => {
    const idToLoad = event.target.value;
    setSelectedCombinationId(idToLoad);
    if (idToLoad) {
      setIsLoading(true);
      const { data, error } = await supabase.from('saved_grades').select('grades_data').eq('id', idToLoad).single();
      if (error) toast.error('Error al cargar la combinación.');
      else {
        setGrades(data.grades_data);
        performCalculation(data.grades_data);
      }
      setIsLoading(false);
    } else {
      handleClear();
    }
  };

  const handleDeleteCombination = async () => {
    if (!selectedCombinationId) {
        toast.warn('Selecciona una combinación para borrar.');
        return;
    }
    const isConfirmed = window.confirm("¿Estás seguro de que quieres borrar esta combinación?");
    if (isConfirmed) {
        setIsLoading(true);
        const { error } = await supabase.from('saved_grades').delete().eq('id', selectedCombinationId);
        if (error) toast.error('Error al borrar.');
        else {
            toast.success('Combinación borrada.');
            handleClear();
            fetchSavedCombinations();
        }
        setIsLoading(false);
    }
  };

  // ... (el resto de las funciones se mantienen igual, pero reemplaza los alert() por toast()) ...

  return (
    <div className="calculator-container average-calculator-container">
      <h3>Calculadora de Promedio Ponderado</h3>
      <p className="instructions">
        {/* ... */}
      </p>

      {isLoading ? <Spinner /> : (
        <>
          <div className="saved-grades-controls">
            {/* ... */}
          </div>
          <form onSubmit={handleSubmit}>
            {/* ... */}
          </form>
          {result && <h4>{result}</h4>}
          {neededGrade && <p className="needed-grade-text">{neededGrade}</p>}
          <div className="save-combination">
            {/* ... */}
          </div>
        </>
      )}
    </div>
  );
}

// Pega el resto de tus funciones aquí, asegurándote de cambiar alert() por toast.error(), toast.warn(), etc.
export default AverageCalculator;