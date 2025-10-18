// src/components/AttendanceCalendar.jsx
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from '../supabaseClient';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

function AttendanceCalendar() {
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // ... otros estados ...

  const fetchSubjects = async () => {
    setIsLoading(true);
    // ...
    const { data, error } = await supabase.from('subjects').select('*').eq('user_id', user.id);
    if (error) toast.error("Error al cargar asignaturas.");
    else setSubjects(data);
    setIsLoading(false);
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    setIsLoading(true);
    // ...
    const { error } = await supabase.from('subjects').insert({ /* ... */ });
    if (error) toast.error("Error al crear la asignatura.");
    else {
      setSubjects([...subjects, data]);
      setNewSubjectName('');
      toast.success("Asignatura creada.");
    }
    setIsLoading(false);
  };
  
  // ... (aplica la misma lógica de setIsLoading y toast a las demás funciones) ...

  return (
    <div className="calculator-container attendance-container">
      <h3>Control de Asistencia por Asignatura</h3>
      <p className="instructions">
        {/* ... */}
      </p>
      {isLoading ? <Spinner /> : (
        <>
          <div className="subject-controls">
            {/* ... */}
          </div>
          {selectedSubject && (
            <div className="calendar-wrapper">
              {/* ... */}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Pega el resto de tus funciones aquí, asegurándote de cambiar alert() por toast()
export default AttendanceCalendar;