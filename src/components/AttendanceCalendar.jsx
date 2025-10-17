// src/components/AttendanceCalendar.jsx
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from '../supabaseClient';
import { startOfMonth, endOfMonth, format } from 'date-fns';

function AttendanceCalendar() {
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  // Estado para los registros del mes visible en el calendario
  const [monthlyRecords, setMonthlyRecords] = useState([]);
  // --- NUEVO ESTADO: Para el resumen total de la asignatura ---
  const [totalSummary, setTotalSummary] = useState({ presente: 0, ausente: 0 });

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Hook para cargar los registros del mes visible
  useEffect(() => {
    if (selectedSubject) {
      fetchMonthlyRecords(selectedSubject.id, currentDate);
    } else {
      setMonthlyRecords([]);
    }
  }, [selectedSubject, currentDate]);

  // --- NUEVO HOOK: Carga el resumen total solo cuando cambia la asignatura ---
  useEffect(() => {
    if (selectedSubject) {
      fetchTotalSummary(selectedSubject.id);
    } else {
      // Resetea el resumen si no hay asignatura seleccionada
      setTotalSummary({ presente: 0, ausente: 0 });
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from('subjects').select('*').eq('user_id', user.id);
      if (error) console.error('Error cargando asignaturas:', error);
      else setSubjects(data);
    }
  };

  // Esta función ahora solo alimenta el calendario visual
  const fetchMonthlyRecords = async (subjectId, date) => {
    const start = format(startOfMonth(date), 'yyyy-MM-dd');
    const end = format(endOfMonth(date), 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('attendance_records')
      .select('date, status')
      .eq('subject_id', subjectId)
      .gte('date', start)
      .lte('date', end);
    
    if (error) console.error('Error cargando registros del mes:', error);
    else setMonthlyRecords(data);
  };

  // --- NUEVA FUNCIÓN: Obtiene TODOS los registros de una asignatura para el resumen ---
  const fetchTotalSummary = async (subjectId) => {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('status')
      .eq('subject_id', subjectId);

    if (error) {
      console.error('Error cargando el resumen total:', error);
    } else {
      const summary = data.reduce((acc, record) => {
        if (record.status === 'presente') acc.presente++;
        if (record.status === 'ausente') acc.ausente++;
        return acc;
      }, { presente: 0, ausente: 0 });
      setTotalSummary(summary);
    }
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
    const existingRecord = monthlyRecords.find(r => r.date === dateString);
    const { data: { user } } = await supabase.auth.getUser();

    let newStatus = 'presente';
    if (existingRecord) {
      newStatus = existingRecord.status === 'presente' ? 'ausente' : null;
    }
    
    // Actualización optimista (instantánea)
    let updatedRecords = [...monthlyRecords];
    if (newStatus === null) {
      updatedRecords = updatedRecords.filter(r => r.date !== dateString);
    } else if (existingRecord) {
      updatedRecords = updatedRecords.map(r => r.date === dateString ? { ...r, status: newStatus } : r);
    } else {
      updatedRecords.push({ date: dateString, status: newStatus });
    }
    setMonthlyRecords(updatedRecords);

    // Sincronización con la base de datos y actualización del resumen total
    try {
      if (newStatus === null) {
        await supabase.from('attendance_records').delete().match({ subject_id: selectedSubject.id, date: dateString });
      } else {
        await supabase.from('attendance_records').upsert({
          subject_id: selectedSubject.id, user_id: user.id, date: dateString, status: newStatus
        }, { onConflict: 'subject_id, date' });
      }
      // Volvemos a calcular el resumen total DESPUÉS de confirmar el cambio
      fetchTotalSummary(selectedSubject.id);
    } catch (error) {
      console.error("Error al guardar en la base de datos:", error);
      alert("No se pudo guardar el cambio. Revisa tu conexión.");
      setMonthlyRecords(monthlyRecords); // Revierte el cambio visual si falla
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = format(date, 'yyyy-MM-dd');
      const record = monthlyRecords.find(r => r.date === dateString);
      if (record) return record.status;
    }
  };

  const handleActiveStartDateChange = ({ activeStartDate }) => {
    setCurrentDate(activeStartDate);
  };

  return (
    <div className="calculator-container attendance-container">
      <h3>Control de Asistencia por Asignatura</h3>

      <div className="subject-controls">
        <form onSubmit={handleAddSubject}>
          <input type="text" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="Nueva asignatura"/>
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
            <h4>Resumen Total de {selectedSubject.name}</h4>
            {/* --- MODIFICACIÓN: Usar el nuevo estado totalSummary --- */}
            <p><span className="presente-dot"></span> Asistencias: {totalSummary.presente}</p>
            <p><span className="ausente-dot"></span> Ausencias: {totalSummary.ausente}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceCalendar;