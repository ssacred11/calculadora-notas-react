// src/components/AttendanceCalculator.jsx
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Estilos base del calendario
import { supabase } from '../supabaseClient';
import { startOfMonth, endOfMonth, format } from 'date-fns';

function AttendanceCalculator() {
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Cargar las asignaturas del usuario al iniciar
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Cargar los registros de asistencia cuando cambia la asignatura o el mes
  useEffect(() => {
    if (selectedSubject) {
      fetchAttendanceRecords(selectedSubject.id, currentDate);
    } else {
      setAttendanceRecords([]);
    }
  }, [selectedSubject, currentDate]);

  const fetchSubjects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from('subjects').select('*').eq('user_id', user.id);
      if (error) console.error('Error cargando asignaturas:', error);
      else setSubjects(data);
    }
  };

  const fetchAttendanceRecords = async (subjectId, date) => {
    const start = format(startOfMonth(date), 'yyyy-MM-dd');
    const end = format(endOfMonth(date), 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('attendance_records')
      .select('date, status')
      .eq('subject_id', subjectId)
      .gte('date', start)
      .lte('date', end);
    
    if (error) console.error('Error cargando registros:', error);
    else setAttendanceRecords(data);
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('subjects')
      .insert({ name: newSubjectName, user_id: user.id })
      .select()
      .single();

    if (error) {
      alert('Error al crear la asignatura: ' + error.message);
    } else {
      setSubjects([...subjects, data]);
      setNewSubjectName('');
    }
  };

  const handleDeleteSubject = async () => {
    if (!selectedSubject || !window.confirm(`¿Seguro que quieres borrar la asignatura "${selectedSubject.name}" y toda su asistencia?`)) return;

    const { error } = await supabase.from('subjects').delete().eq('id', selectedSubject.id);
    if (error) {
        alert('Error al borrar la asignatura.');
    } else {
        setSelectedSubject(null);
        fetchSubjects();
    }
  };

  const handleDayClick = async (date) => {
    if (!selectedSubject) return;

    const dateString = format(date, 'yyyy-MM-dd');
    const existingRecord = attendanceRecords.find(r => r.date === dateString);
    const { data: { user } } = await supabase.auth.getUser();

    let newStatus = 'presente';
    if (existingRecord) {
      newStatus = existingRecord.status === 'presente' ? 'ausente' : null;
    }

    if (newStatus === null) {
      // Borrar el registro existente
      await supabase.from('attendance_records').delete().match({ subject_id: selectedSubject.id, date: dateString });
    } else {
      // Crear o actualizar el registro
      await supabase.from('attendance_records').upsert({
        subject_id: selectedSubject.id,
        user_id: user.id,
        date: dateString,
        status: newStatus
      }, { onConflict: 'subject_id, date' });
    }
    fetchAttendanceRecords(selectedSubject.id, currentDate);
  };

  // Función para dar estilo a los días del calendario
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = format(date, 'yyyy-MM-dd');
      const record = attendanceRecords.find(r => r.date === dateString);
      if (record) return record.status; // Devuelve 'presente' o 'ausente' como clase CSS
    }
  };

  // Función para cambiar el mes/año visible
  const handleActiveStartDateChange = ({ activeStartDate }) => {
    setCurrentDate(activeStartDate);
  };

  const summary = attendanceRecords.reduce((acc, record) => {
    if(record.status === 'presente') acc.presente++;
    if(record.status === 'ausente') acc.ausente++;
    return acc;
  }, { presente: 0, ausente: 0 });

  return (
    <div className="calculator-container attendance-container">
      <h3>Control de Asistencia por Asignatura</h3>

      <div className="subject-controls">
        <form onSubmit={handleAddSubject}>
          <input
            type="text"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="Nueva asignatura"
          />
          <button type="submit">Crear</button>
        </form>
        <select onChange={(e) => setSelectedSubject(subjects.find(s => s.id == e.target.value))} value={selectedSubject?.id || ''}>
          <option value="">-- Selecciona una asignatura --</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {selectedSubject && <button onClick={handleDeleteSubject} className="delete-button">Borrar Asignatura</button>}
      </div>

      {selectedSubject && (
        <div className="calendar-wrapper">
          <Calendar
            onClickDay={handleDayClick}
            tileClassName={tileClassName}
            value={currentDate}
            onActiveStartDateChange={handleActiveStartDateChange}
          />
          <div className="attendance-summary">
            <h4>Resumen de {selectedSubject.name}</h4>
            <p><span className="presente-dot"></span> Asistencias: {summary.presente}</p>
            <p><span className="ausente-dot"></span> Ausencias: {summary.ausente}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceCalculator;