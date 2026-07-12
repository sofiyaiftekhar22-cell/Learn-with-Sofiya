import React, { useState, useEffect } from 'react';
import { StudentData, CalendarEvent, AssignmentItem } from '../types';
import { getStatusConfig } from './StatusConfig';

interface CalendarProps {
  studentId: string;
  studentData: StudentData;
  isTeacher: boolean;
  onUpdate: (updatedData: StudentData) => void;
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const Calendar: React.FC<CalendarProps> = ({
  studentId,
  studentData,
  isTeacher,
  onUpdate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hoveredDateStr, setHoveredDateStr] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  // Modal form states
  const [status, setStatus] = useState<CalendarEvent['status']>(null);
  const [lesson, setLesson] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [hwText, setHwText] = useState('');
  const [hwDueDate, setHwDueDate] = useState('');
  const [hwCompleted, setHwCompleted] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [teacherNote, setTeacherNote] = useState('');
  const [parentNote, setParentNote] = useState('');
  const [missedReason, setMissedReason] = useState('Student Absent');
  const [missedNotes, setMissedNotes] = useState('');
  const [excellent, setExcellent] = useState(false);
  const [classTime, setClassTime] = useState('');
  const [classTeacher, setClassTeacher] = useState('Sofiya');

  // Local assignments state inside modal/panel
  const [newAsgText, setNewAsgText] = useState('');

  // Class Settings States
  const [zoomLink, setZoomLink] = useState(studentData.zoomMeetingLink || studentData.classLink || '');
  const [zoomId, setZoomId] = useState(studentData.zoomMeetingId || '');
  const [zoomPass, setZoomPass] = useState(studentData.zoomPasscode || '');
  const [recDays, setRecDays] = useState<number[]>(studentData.recurringDays || []);
  const [defTime, setDefTime] = useState(studentData.recurringTime || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [isEditingTimings, setIsEditingTimings] = useState(false);
  const [editingTimingsText, setEditingTimingsText] = useState(studentData.classTimings || '');

  useEffect(() => {
    setZoomLink(studentData.zoomMeetingLink || studentData.classLink || '');
    setZoomId(studentData.zoomMeetingId || '');
    setZoomPass(studentData.zoomPasscode || '');
    setRecDays(studentData.recurringDays || []);
    setDefTime(studentData.recurringTime || '');
    setEditingTimingsText(studentData.classTimings || '');
  }, [
    studentId,
    studentData.zoomMeetingLink,
    studentData.classLink,
    studentData.zoomMeetingId,
    studentData.zoomPasscode,
    JSON.stringify(studentData.recurringDays || []),
    studentData.recurringTime,
    studentData.classTimings
  ]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const totalDays = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const getFormattedDateStr = (dayNum: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
  };

  const getDayEvent = (dayNum: number): CalendarEvent | null => {
    const dStr = getFormattedDateStr(dayNum);
    return studentData.calendarEvents?.[dStr] || null;
  };

  const isClassScheduledOnDay = (dayNum: number, weekdayIdx: number) => {
    const dStr = getFormattedDateStr(dayNum);
    if (studentData.cancelledDates?.includes(dStr)) return false;
    if (studentData.calendarEvents?.[dStr]?.status) return true;
    return studentData.recurringDays?.includes(weekdayIdx);
  };

  const getDayStatus = (dayNum: number, weekdayIdx: number): CalendarEvent['status'] => {
    const event = getDayEvent(dayNum);
    if (event?.status) return event.status;
    if (isClassScheduledOnDay(dayNum, weekdayIdx)) return 'upcoming';
    return null;
  };

  // Open clicked date details
  const handleDayClick = (dayNum: number) => {
    const dStr = getFormattedDateStr(dayNum);
    const weekdayIdx = new Date(year, month, dayNum).getDay();
    const event = studentData.calendarEvents?.[dStr] || {
      status: isClassScheduledOnDay(dayNum, weekdayIdx) ? 'upcoming' : null,
      lesson: '',
      focusArea: '',
      homework: null,
      audio: '',
      teacherNote: '',
      parentNote: '',
      reason: 'Student Absent',
      notes: '',
      excellent: false,
      time: studentData.recurringTime || '',
      teacher: 'Sofiya'
    };

    setSelectedDateStr(dStr);
    setStatus(event.status);
    setLesson(event.lesson || '');
    setFocusArea(event.focusArea || '');
    setHwText(event.homework?.text || '');
    setHwDueDate(event.homework?.dueDate || '');
    setHwCompleted(event.homework?.completed || false);
    setAudioUrl(event.audio || '');
    setTeacherNote(event.teacherNote || '');
    setParentNote(event.parentNote || '');
    setMissedReason(event.reason || 'Student Absent');
    setMissedNotes(event.notes || '');
    setExcellent(event.excellent || false);
    setClassTime(event.time || studentData.recurringTime || '');
    setClassTeacher(event.teacher || 'Sofiya');

    setShowModal(true);
  };

  const handleDoubleClick = (dayNum: number) => {
    const dStr = getFormattedDateStr(dayNum);
    const quickTitle = prompt('Quickly create an assignment for this date:', 'Practice Lesson');
    if (quickTitle && quickTitle.trim()) {
      const newAsg: AssignmentItem = {
        id: 'asg-' + Date.now(),
        text: `${quickTitle.trim()} (For ${dStr})`,
        completed: false,
        addedDate: dStr
      };
      const updated = {
        ...studentData,
        assignments: [...(studentData.assignments || []), newAsg]
      };
      onUpdate(updated);
    }
  };

  const handleQuickAddAsgClick = (e: React.MouseEvent, dayNum: number) => {
    e.stopPropagation();
    handleDoubleClick(dayNum);
  };

  const handleSaveModal = () => {
    if (!selectedDateStr) return;

    const newHw = hwText.trim()
      ? { text: hwText.trim(), dueDate: hwDueDate, completed: hwCompleted }
      : null;

    const updatedEvents = {
      ...(studentData.calendarEvents || {}),
      [selectedDateStr]: {
        status,
        lesson: lesson.trim(),
        focusArea: focusArea.trim(),
        homework: newHw,
        audio: audioUrl.trim(),
        teacherNote: isTeacher ? teacherNote.trim() : (studentData.calendarEvents?.[selectedDateStr]?.teacherNote || ''),
        parentNote: isTeacher ? parentNote.trim() : (studentData.calendarEvents?.[selectedDateStr]?.parentNote || ''),
        reason: status === 'missed' ? missedReason : '',
        notes: status === 'missed' ? missedNotes.trim() : '',
        excellent,
        time: classTime,
        teacher: classTeacher
      }
    };

    const updated = {
      ...studentData,
      calendarEvents: updatedEvents
    };

    onUpdate(updated);
    setShowModal(false);
    setSelectedDateStr(null);
  };

  const handleDeleteDay = () => {
    if (!selectedDateStr) return;
    if (!window.confirm(`Delete all study plans/attendance logged for ${selectedDateStr}?`)) return;

    const updatedEvents = { ...(studentData.calendarEvents || {}) };
    delete updatedEvents[selectedDateStr];

    const updated = {
      ...studentData,
      calendarEvents: updatedEvents
    };

    onUpdate(updated);
    setShowModal(false);
    setSelectedDateStr(null);
  };

  // Homework completeness helper from the planner
  const toggleHomeworkStatus = (dateKey: string) => {
    const event = studentData.calendarEvents?.[dateKey];
    if (!event || !event.homework) return;

    const updatedEvents = {
      ...(studentData.calendarEvents || {}),
      [dateKey]: {
        ...event,
        homework: {
          ...event.homework,
          completed: !event.homework.completed
        }
      }
    };

    onUpdate({
      ...studentData,
      calendarEvents: updatedEvents
    });
  };

  // Add assignment
  const handleAddAssignment = () => {
    if (!newAsgText.trim()) return;
    const newAsg: AssignmentItem = {
      id: 'asg-' + Date.now(),
      text: newAsgText.trim(),
      completed: false,
      addedDate: new Date().toISOString().split('T')[0]
    };
    onUpdate({
      ...studentData,
      assignments: [...(studentData.assignments || []), newAsg]
    });
    setNewAsgText('');
  };

  const toggleAssignmentCompleted = (id: string) => {
    const updatedAsg = (studentData.assignments || []).map(asg => {
      if (asg.id === id) return { ...asg, completed: !asg.completed };
      return asg;
    });
    onUpdate({ ...studentData, assignments: updatedAsg });
  };

  const deleteAssignment = (id: string) => {
    onUpdate({
      ...studentData,
      assignments: (studentData.assignments || []).filter(asg => asg.id !== id)
    });
  };

  const reorderAssignment = (index: number, direction: 'up' | 'down') => {
    const list = [...(studentData.assignments || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    onUpdate({ ...studentData, assignments: list });
  };

  // Hover tooltip positioning
  const handleMouseEnter = (e: React.MouseEvent, dayNum: number) => {
    const dStr = getFormattedDateStr(dayNum);
    setHoveredDateStr(dStr);
    setHoverPosition({ x: e.clientX + 12, y: e.clientY + 12 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setHoverPosition({ x: e.clientX + 12, y: e.clientY + 12 });
  };

  const handleMouseLeave = () => {
    setHoveredDateStr(null);
  };

  // Render tooltip details
  const renderTooltip = () => {
    if (!hoveredDateStr) return null;
    const event = studentData.calendarEvents?.[hoveredDateStr];
    if (!event) return null;

    const config = getStatusConfig(event.status);
    return (
      <div
        className="fixed z-50 bg-[#2d4739] text-white p-3 rounded-lg shadow-xl text-xs max-w-xs pointer-events-none border border-emerald-800"
        style={{ left: hoverPosition.x, top: hoverPosition.y }}
      >
        <p className="font-bold border-b border-emerald-800 pb-1 mb-1 text-emerald-100 flex items-center justify-between">
          <span>📅 {hoveredDateStr}</span>
          {config && <span className="text-[10px] uppercase bg-emerald-900 px-1.5 py-0.5 rounded text-emerald-200">{config.label}</span>}
        </p>
        {event.lesson && <p className="mb-1"><span className="text-emerald-300 font-semibold">📖 Lesson:</span> {event.lesson}</p>}
        {event.focusArea && <p className="mb-1"><span className="text-emerald-300 font-semibold">🎯 Focus:</span> {event.focusArea}</p>}
        {event.homework?.text && <p className="mb-1"><span className="text-emerald-300 font-semibold">📝 Homework:</span> {event.homework.text}</p>}
        {event.parentNote && <p className="italic text-emerald-200 border-t border-emerald-900 pt-1 mt-1 font-serif">"{event.parentNote}"</p>}
      </div>
    );
  };

  // Compute attendance summary
  const getAttendanceStats = () => {
    const events = Object.values(studentData.calendarEvents || {}) as CalendarEvent[];
    const completed = events.filter(e => e && e.status === 'completed').length;
    const missed = events.filter(e => e && e.status === 'missed').length;
    const total = completed + missed;
    const attendancePct = total ? Math.round((completed / total) * 100) : 100;
    return { completed, missed, total, attendancePct };
  };

  const formatScheduleString = (days: number[], time: string) => {
    if (!days || days.length === 0) return 'No recurring days set';
    const dayNames = days.map(d => WEEKDAY_NAMES[d]).join(', ');
    if (!time) return `Every ${dayNames}`;
    
    let formattedTime = time;
    try {
      const [hours, minutes] = time.split(':');
      if (hours !== undefined && minutes !== undefined) {
        const hr = parseInt(hours, 10);
        const ampm = hr >= 12 ? 'PM' : 'AM';
        const displayHr = hr % 12 || 12;
        formattedTime = `${displayHr}:${minutes} ${ampm}`;
      }
    } catch (e) {
      // Fallback
    }
    
    return `Every ${dayNames} at ${formattedTime}`;
  };

  const saveClassInfo = () => {
    const scheduleStr = formatScheduleString(recDays, defTime);
    const updated = {
      ...studentData,
      zoomMeetingLink: zoomLink.trim(),
      classLink: zoomLink.trim(),
      zoomMeetingId: zoomId.trim(),
      zoomPasscode: zoomPass.trim(),
      recurringDays: recDays,
      recurringTime: defTime.trim(),
      classTimings: scheduleStr
    };
    onUpdate(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveTimingsDirectly = () => {
    const updated = {
      ...studentData,
      classTimings: editingTimingsText.trim()
    };
    onUpdate(updated);
    setIsEditingTimings(false);
  };

  const attStats = getAttendanceStats();

  return (
    <div className="space-y-6">
      {/* Attendance & Summary Integrated Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#24392c] p-4 rounded-xl border-t-4 border-sage shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted dark:text-[#C7D2C4] mb-1">Attendance Record</h3>
            <p className="text-2xl font-serif font-bold text-sage">{attStats.attendancePct}%</p>
          </div>
          <p className="text-xs text-muted dark:text-[#C7D2C4] mt-2">
            Based on {attStats.completed} completed classes out of {attStats.total} total sessions.
          </p>
        </div>

        <div className="bg-white dark:bg-[#24392c] p-4 rounded-xl border-t-4 border-gold shadow-sm flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted dark:text-[#C7D2C4]">Class Schedule</h3>
              {isTeacher && !isEditingTimings && (
                <button
                  type="button"
                  onClick={() => setIsEditingTimings(true)}
                  className="p-1 text-muted hover:text-sage hover:bg-sage/10 rounded transition-all cursor-pointer text-[10px] flex items-center gap-0.5"
                  title="Edit schedule text"
                >
                  ✏️ <span className="text-[9px] font-bold">Edit</span>
                </button>
              )}
            </div>
            {isEditingTimings ? (
              <div className="flex items-center gap-1.5 my-1">
                <input
                  type="text"
                  value={editingTimingsText}
                  onChange={(e) => setEditingTimingsText(e.target.value)}
                  placeholder="e.g. Mon, Wed, Fri — 5:00 PM"
                  className="w-full p-1.5 text-xs border rounded bg-white dark:bg-[#24392c] border-border-soft dark:border-[#4a6552] text-sage-deep dark:text-white focus:outline-none focus:border-sage font-sans font-bold"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveTimingsDirectly();
                    } else if (e.key === 'Escape') {
                      setIsEditingTimings(false);
                      setEditingTimingsText(studentData.classTimings || '');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveTimingsDirectly}
                  className="p-1 bg-sage text-white rounded hover:bg-sage-dark text-[10px] font-bold cursor-pointer"
                  title="Save timings"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingTimings(false);
                    setEditingTimingsText(studentData.classTimings || '');
                  }}
                  className="p-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-[10px] font-bold cursor-pointer"
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
            ) : (
              <p className="text-xs font-bold text-sage-dark dark:text-[#E8ECE7] leading-tight py-1">
                {studentData.classTimings || 'No fixed schedule set'}
              </p>
            )}
            
            {/* Saved Zoom Credentials displayed to student/teacher in read-only format */}
            {(studentData.zoomMeetingId || studentData.zoomPasscode) && (
              <div className="mt-2 pt-1.5 border-t border-dashed border-border-soft dark:border-[#4a6552] text-[10px] space-y-0.5 text-sage-deep dark:text-[#C7D2C4]">
                {studentData.zoomMeetingId && (
                  <p className="flex justify-between">
                    <span className="opacity-70">Meeting ID:</span>
                    <span className="font-mono font-bold select-all bg-cream dark:bg-[#1c2b22] px-1 rounded">{studentData.zoomMeetingId}</span>
                  </p>
                )}
                {studentData.zoomPasscode && (
                  <p className="flex justify-between">
                    <span className="opacity-70">Passcode:</span>
                    <span className="font-mono font-bold select-all bg-cream dark:bg-[#1c2b22] px-1 rounded">{studentData.zoomPasscode}</span>
                  </p>
                )}
              </div>
            )}
          </div>
          {studentData.classLink && (
            <a
              href={studentData.classLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-1 w-full py-1.5 bg-sage hover:bg-sage-dark text-white font-bold text-[10px] rounded shadow-sm transition-all text-center"
            >
              📹 Join Zoom Class
            </a>
          )}
        </div>

        <div className="bg-white dark:bg-[#24392c] p-4 rounded-xl border-t-4 border-danger shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted dark:text-[#C7D2C4] mb-1">Missed Classes</h3>
            <p className="text-2xl font-serif font-bold text-danger">{attStats.missed}</p>
          </div>
          <p className="text-xs text-muted dark:text-[#C7D2C4] mt-2">
            Missed classes integrated seamlessly inside calendar.
          </p>
        </div>
      </div>

      {/* Class Settings Section (Teacher Only) */}
      {isTeacher && (
        <div className="bg-white dark:bg-[#24392c] p-4 rounded-xl border border-border-soft dark:border-[#4a6552] space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border-soft dark:border-[#4a6552] pb-1.5">
            <div>
              <h3 className="font-serif text-xs font-bold text-sage-dark dark:text-white flex items-center gap-1.5">
                <span>⚙️ Class Settings</span>
              </h3>
              <p className="text-[10px] text-muted dark:text-[#C7D2C4]">
                Configure default weekly schedule and live Zoom class details for this student.
              </p>
            </div>
            {saveSuccess && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded animate-pulse">
                ✓ Settings saved
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Column 1: Zoom Credentials */}
            <div className="space-y-2 bg-cream/30 dark:bg-[#1c2b22]/30 p-2.5 rounded-lg border border-border-soft dark:border-[#4a6552]/40">
              <h4 className="text-[10px] font-bold text-sage uppercase tracking-wider">📹 Zoom Credentials</h4>
              <div className="space-y-1.5">
                <div>
                  <label className="block text-[9px] font-bold text-sage-dark dark:text-[#C7D2C4] mb-0.5">Zoom Link</label>
                  <input
                    type="text"
                    placeholder="https://zoom.us/j/..."
                    value={zoomLink}
                    onChange={(e) => setZoomLink(e.target.value)}
                    className="w-full p-1.5 text-xs border rounded bg-white dark:bg-[#24392c] border-border-soft dark:border-[#4a6552] text-sage-deep dark:text-white focus:outline-none focus:border-sage"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-sage-dark dark:text-[#C7D2C4] mb-0.5">Meeting ID</label>
                    <input
                      type="text"
                      placeholder="123 456 7890"
                      value={zoomId}
                      onChange={(e) => setZoomId(e.target.value)}
                      className="w-full p-1.5 text-xs border rounded bg-white dark:bg-[#24392c] border-border-soft dark:border-[#4a6552] text-sage-deep dark:text-white focus:outline-none focus:border-sage"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-sage-dark dark:text-[#C7D2C4] mb-0.5">Passcode</label>
                    <input
                      type="text"
                      placeholder="Passcode"
                      value={zoomPass}
                      onChange={(e) => setZoomPass(e.target.value)}
                      className="w-full p-1.5 text-xs border rounded bg-white dark:bg-[#24392c] border-border-soft dark:border-[#4a6552] text-sage-deep dark:text-white focus:outline-none focus:border-sage"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 & 3: Weekly Recurring Days & Time */}
            <div className="md:col-span-1 lg:col-span-2 space-y-2 bg-cream/30 dark:bg-[#1c2b22]/30 p-2.5 rounded-lg border border-border-soft dark:border-[#4a6552]/40 flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] font-bold text-sage uppercase tracking-wider mb-2">🗓️ Recurring Class Days (Sun–Sat)</h4>
                <div className="flex flex-wrap gap-1">
                  {WEEKDAY_NAMES.map((dayName, idx) => {
                    const isSelected = recDays.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setRecDays(recDays.filter(d => d !== idx));
                          } else {
                            setRecDays([...recDays, idx].sort());
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-sage border-sage text-white shadow-sm ring-2 ring-offset-2 ring-sage/20 dark:ring-offset-[#24392c]'
                            : 'bg-soft-bg dark:bg-[#1f3126] border-border-soft dark:border-[#4a6552]/40 text-sage-deep dark:text-[#C7D2C4] hover:bg-sage/10 hover:border-sage'
                        }`}
                      >
                        {dayName}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end pt-1">
                <div>
                  <label className="block text-[9px] font-bold text-sage uppercase mb-0.5">Default Class Time</label>
                  <input
                    type="time"
                    value={defTime}
                    onChange={(e) => setDefTime(e.target.value)}
                    className="w-full p-1.5 border rounded bg-white dark:bg-[#24392c] border-border-soft dark:border-[#4a6552] font-mono text-xs text-sage-deep dark:text-white focus:outline-none focus:border-sage"
                  />
                </div>
                <button
                  type="button"
                  onClick={saveClassInfo}
                  className="w-full py-1.5 bg-sage hover:bg-sage-dark text-white rounded font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>💾</span> Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Calendar Card */}
      <div className="bg-white dark:bg-[#24392c] p-5 rounded-xl shadow-sm border border-border-soft dark:border-[#4a6552]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-sage-dark dark:text-white font-serif">Study Planner &amp; Calendar</h2>
            <p className="text-xs text-muted dark:text-[#C7D2C4]">Double-click any date or hover '+' icon to add a quick assignment.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-1 bg-soft-bg dark:bg-[#2f4a3a] text-sage-deep dark:text-white hover:bg-sage hover:text-white rounded-lg transition-colors text-sm font-semibold"
            >
              ◀ Prev
            </button>
            <span className="font-serif font-bold text-sm text-sage-deep dark:text-white min-w-[100px] text-center">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1 bg-soft-bg dark:bg-[#2f4a3a] text-sage-deep dark:text-white hover:bg-sage hover:text-white rounded-lg transition-colors text-sm font-semibold"
            >
              Next ▶
            </button>
          </div>
        </div>

        {/* Days of week labels */}
        <div className="grid grid-cols-7 gap-2 text-center font-bold text-xs text-sage-dark dark:text-white border-b border-border-soft dark:border-[#4a6552] pb-2 mb-2">
          {WEEKDAY_NAMES.map((name, idx) => (
            <div key={idx}>{name}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cell placeholders */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square bg-transparent rounded-lg" />
          ))}

          {/* Active days */}
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayNum = idx + 1;
            const weekdayIdx = (firstDayIndex + idx) % 7;
            const statusKey = getDayStatus(dayNum, weekdayIdx);
            const config = getStatusConfig(statusKey);
            const hasEvent = getDayEvent(dayNum);

            let bgStyle = 'bg-soft-bg dark:bg-[#2f4a3a] text-sage-deep dark:text-white';
            if (config) {
              bgStyle = `text-white`;
            }

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => handleDayClick(dayNum)}
                onDoubleClick={() => handleDoubleClick(dayNum)}
                onMouseEnter={(e) => handleMouseEnter(e, dayNum)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ backgroundColor: config?.bg }}
                className={`relative group aspect-square rounded-lg p-1.5 flex flex-col justify-between border border-border-soft dark:border-[#4a6552] cursor-pointer hover:shadow-md hover:scale-105 transition-all ${bgStyle}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold ${config ? 'text-white' : 'text-muted dark:text-[#C7D2C4]'}`}>
                    {dayNum}
                  </span>
                  {hasEvent?.excellent && (
                    <span className="text-[10px] text-amber-300 drop-shadow">⭐</span>
                  )}
                </div>

                {/* Icons row at the bottom */}
                <div className="flex gap-1 items-center overflow-hidden h-4">
                  {hasEvent?.lesson && <span className="text-[9px]">📖</span>}
                  {hasEvent?.homework?.text && <span className="text-[9px]">📝</span>}
                  {hasEvent?.audio && <span className="text-[9px]">🎧</span>}
                  {hasEvent?.parentNote && <span className="text-[9px]">💬</span>}
                </div>

                {/* Small quick add plus on hover */}
                <button
                  onClick={(e) => handleQuickAddAsgClick(e, dayNum)}
                  className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/25 text-white hover:bg-white/40 h-4 w-4 rounded flex items-center justify-center font-bold text-[10px]"
                  title="Quick add assignment"
                >
                  +
                </button>
              </div>
            );
          })}
        </div>

        {/* Legend block */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-muted dark:text-[#C7D2C4] border-t border-border-soft dark:border-[#4a6552] pt-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#3fa34d]" /> <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#d64545]" /> <span>Missed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#3b82c4]" /> <span>Rescheduled</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#e8c948]" /> <span>Holiday</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#9b59b6]" /> <span>Assessment</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#d8ded9] border border-gray-400 dark:bg-[#335140]" /> <span>Upcoming</span>
          </div>
        </div>
      </div>

      {/* Assignments list management */}
      <div className="bg-white dark:bg-[#24392c] p-5 rounded-xl shadow-sm border border-border-soft dark:border-[#4a6552]">
        <h2 className="text-base font-bold font-serif text-sage-dark dark:text-white mb-3">📋 Study Assignments</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Assign something..."
            value={newAsgText}
            onChange={(e) => setNewAsgText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddAssignment()}
            className="flex-1 px-3 py-2 border rounded-lg bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552] text-sage-deep dark:text-white text-sm"
          />
          <button
            onClick={handleAddAssignment}
            className="px-4 py-2 bg-sage hover:bg-sage-dark text-white rounded-lg font-bold text-sm transition-colors"
          >
            Add
          </button>
        </div>

        <div className="space-y-2">
          {(studentData.assignments || []).length === 0 ? (
            <p className="text-xs text-muted dark:text-[#C7D2C4] py-3 text-center">No assignments added yet.</p>
          ) : (
            (studentData.assignments || []).map((asg, idx) => (
              <div
                key={asg.id}
                className="flex items-center justify-between p-2.5 bg-soft-bg dark:bg-[#2f4a3a] border border-border-soft dark:border-[#4a6552] rounded-lg text-sm"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={asg.completed}
                    onChange={() => toggleAssignmentCompleted(asg.id)}
                    className="w-4 h-4 rounded border-gray-300 accent-sage"
                  />
                  <span className={`${asg.completed ? 'line-through text-muted' : 'text-sage-deep dark:text-white'}`}>
                    {asg.text}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => reorderAssignment(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 bg-white/40 hover:bg-white/60 dark:bg-black/10 dark:hover:bg-black/20 text-xs rounded font-bold disabled:opacity-40"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => reorderAssignment(idx, 'down')}
                    disabled={idx === (studentData.assignments || []).length - 1}
                    className="p-1 bg-white/40 hover:bg-white/60 dark:bg-black/10 dark:hover:bg-black/20 text-xs rounded font-bold disabled:opacity-40"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => deleteAssignment(asg.id)}
                    className="px-2 py-0.5 bg-danger text-white text-xs font-bold rounded hover:opacity-95"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Homework Aggregated list view */}
      <div className="bg-white dark:bg-[#24392c] p-5 rounded-xl shadow-sm border border-border-soft dark:border-[#4a6552]">
        <h2 className="text-base font-bold font-serif text-sage-dark dark:text-white mb-3">📝 Daily Homework Timeline</h2>
        <div className="space-y-3">
          {Object.keys(studentData.calendarEvents || {})
            .filter(key => studentData.calendarEvents[key]?.homework?.text)
            .sort()
            .map(dateKey => {
              const item = studentData.calendarEvents[dateKey];
              const hw = item.homework!;
              const isLate = hw.dueDate && hw.dueDate < new Date().toISOString().split('T')[0] && !hw.completed;

              return (
                <div
                  key={dateKey}
                  className="flex items-center justify-between p-3 bg-soft-bg dark:bg-[#2f4a3a] border border-border-soft dark:border-[#4a6552] rounded-lg"
                >
                  <div>
                    <p className="text-xs text-sage font-bold uppercase">{dateKey}</p>
                    <p className={`text-sm ${hw.completed ? 'line-through text-muted' : 'text-sage-deep dark:text-white'}`}>
                      {hw.text}
                    </p>
                    {hw.dueDate && (
                      <p className="text-[11px] text-muted dark:text-[#C7D2C4] mt-0.5">Due: {hw.dueDate}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {isLate && (
                      <span className="px-2 py-0.5 bg-danger text-white font-bold text-[9px] rounded">
                        LATE
                      </span>
                    )}
                    <input
                      type="checkbox"
                      checked={hw.completed}
                      onChange={() => toggleHomeworkStatus(dateKey)}
                      className="w-5 h-5 rounded border-gray-300 accent-sage cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Modal / Dialog */}
      {showModal && selectedDateStr && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#24392c] p-6 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl border border-border-soft dark:border-[#4a6552]">
            <div className="flex items-center justify-between border-b border-border-soft dark:border-[#4a6552] pb-3 mb-4">
              <h3 className="text-lg font-bold font-serif text-sage-dark dark:text-white">
                Study Details: {selectedDateStr}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted dark:text-[#C7D2C4] hover:text-danger text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {!isTeacher ? (
              /* Student View (Premium, Read-only summary, compact & minimal) */
              <div className="space-y-4 text-sm text-sage-deep dark:text-white">
                {/* Attendance & Status Badge */}
                <div className="flex items-center justify-between p-3.5 bg-soft-bg dark:bg-[#2f4a3a] rounded-xl border border-border-soft dark:border-[#4a6552]">
                  <span className="text-xs font-bold text-sage uppercase tracking-wider">🟢 Attendance &amp; Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                    status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-[#1a3322] dark:text-emerald-300 border-emerald-200' :
                    status === 'missed' ? 'bg-rose-100 text-rose-800 dark:bg-[#3d1a1a] dark:text-rose-300 border-rose-200' :
                    status === 'rescheduled' ? 'bg-blue-100 text-blue-800 dark:bg-[#1a2b3d] dark:text-blue-300 border-blue-200' :
                    status === 'holiday' ? 'bg-amber-100 text-amber-800 dark:bg-[#3d331a] dark:text-amber-300 border-amber-200' :
                    status === 'assessment' ? 'bg-purple-100 text-purple-800 dark:bg-[#2d1a3d] dark:text-purple-300 border-purple-200' :
                    'bg-slate-100 text-slate-800 dark:bg-[#2b2d2f] dark:text-slate-300 border-slate-200'
                  }`}>
                    {CALENDAR_STATUSES.find(s => s.key === status)?.emoji || '⚪'} {CALENDAR_STATUSES.find(s => s.key === status)?.label || 'Upcoming'}
                  </span>
                </div>

                {/* Missed Details if applicable */}
                {status === 'missed' && (missedReason || missedNotes) && (
                  <div className="p-3 bg-rose-50/50 dark:bg-[#2d1e1e] border border-rose-100 dark:border-rose-900/50 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">Absence Information</p>
                    <p className="text-sm font-semibold text-rose-950 dark:text-rose-100">Reason: {missedReason}</p>
                    {missedNotes && <p className="text-xs text-rose-800 dark:text-rose-200 mt-1">Note: {missedNotes}</p>}
                  </div>
                )}

                {/* Lesson & Focus Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 bg-soft-bg dark:bg-[#2f4a3a] border border-border-soft dark:border-[#4a6552] rounded-xl">
                    <p className="text-xs font-bold text-sage mb-1 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📖</span> Lesson
                    </p>
                    <p className="text-sm font-bold text-sage-dark dark:text-white mt-1 leading-relaxed">
                      {lesson || 'No lesson details recorded.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-soft-bg dark:bg-[#2f4a3a] border border-border-soft dark:border-[#4a6552] rounded-xl">
                    <p className="text-xs font-bold text-sage mb-1 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🎯</span> Focus Area
                    </p>
                    <p className="text-sm font-medium text-sage-dark dark:text-white mt-1 leading-relaxed">
                      {focusArea || 'No focus area specified.'}
                    </p>
                  </div>
                </div>

                {/* Homework Block */}
                <div className="p-3.5 bg-soft-bg dark:bg-[#2f4a3a] border border-border-soft dark:border-[#4a6552] rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-sage uppercase tracking-wider flex items-center gap-1.5">
                      <span>📝</span> Homework
                    </p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      hwCompleted 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                    }`}>
                      {hwCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-sage-dark dark:text-white leading-relaxed">
                    {hwText || 'No homework assigned for today.'}
                  </p>
                  {hwDueDate && (
                    <p className="text-xs text-muted dark:text-[#C7D2C4] flex items-center gap-1.5 pt-2 border-t border-border-soft/50 dark:border-[#4a6552]/50">
                      <span>📅</span> <span className="font-semibold">Due Date:</span> {hwDueDate}
                    </p>
                  )}
                </div>

                {/* Play Audio */}
                {audioUrl && (
                  <div className="p-3.5 bg-soft-bg dark:bg-[#2f4a3a] border border-border-soft dark:border-[#4a6552] rounded-xl">
                    <p className="text-xs font-bold text-sage mb-2.5 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🎧</span> Play Audio
                    </p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <audio src={audioUrl} controls className="w-full h-10 flex-1 rounded-lg" />
                      <a
                        href={audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-sage hover:bg-sage-dark text-white rounded-lg text-xs font-bold text-center transition-colors shadow-sm flex items-center justify-center gap-1 shrink-0"
                      >
                        <span>🔗</span> Open Link
                      </a>
                    </div>
                  </div>
                )}

                {/* Teacher Note & Feedback */}
                <div className="p-3.5 bg-[#fdf8ec] dark:bg-[#2e372e] border border-gold/30 rounded-xl">
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <span>👩‍🏫</span> Teacher Note
                  </p>
                  <p className="text-sm italic text-amber-950 dark:text-amber-100 mt-2 font-serif leading-relaxed">
                    {parentNote ? `"${parentNote}"` : 'No teacher feedback notes entered for this class.'}
                  </p>
                  {excellent && (
                    <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full mt-3">
                      ⭐ Received "Excellent Performance" award!
                    </div>
                  )}
                </div>

                {/* Assignments checklist (only mark own assignments complete) */}
                <div className="p-3.5 bg-soft-bg dark:bg-[#2f4a3a] border border-border-soft dark:border-[#4a6552] rounded-xl space-y-2.5">
                  <p className="text-xs font-bold text-sage uppercase tracking-wider flex items-center gap-1.5">
                    <span>📋</span> Class Assignments
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(studentData.assignments || []).filter(asg => asg.addedDate === selectedDateStr).length === 0 ? (
                      <p className="text-xs text-muted dark:text-[#C7D2C4] italic py-1">No specific assignments logged for this date.</p>
                    ) : (
                      (studentData.assignments || [])
                        .filter(asg => asg.addedDate === selectedDateStr)
                        .map(asg => (
                          <label
                            key={asg.id}
                            className="flex items-center gap-3 p-2 bg-white dark:bg-[#1c2b22] border border-border-soft dark:border-[#4a6552] rounded-lg cursor-pointer hover:bg-soft-bg2 dark:hover:bg-[#2d4033] transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={asg.completed}
                              onChange={() => toggleAssignmentCompleted(asg.id)}
                              className="w-4 h-4 rounded border-gray-300 accent-sage cursor-pointer"
                            />
                            <span className={`text-xs ${asg.completed ? 'line-through text-muted' : 'text-sage-deep dark:text-white font-medium'}`}>
                              {asg.text}
                            </span>
                          </label>
                        ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Teacher View (Full Editor Form with All Controls) */
              <div className="space-y-4 text-sm text-sage-deep dark:text-white">
                {/* Scheduled class indicators inside modal */}
                <div className="bg-soft-bg dark:bg-[#2f4a3a] p-3 rounded-lg border border-border-soft dark:border-[#4a6552] space-y-1">
                  <p className="text-xs text-sage font-bold uppercase tracking-wider">Scheduled Class</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-muted dark:text-[#C7D2C4]">Teacher:</span> {classTeacher}
                    </div>
                    <div>
                      <span className="font-semibold text-muted dark:text-[#C7D2C4]">Time:</span> {classTime || 'Not scheduled'}
                    </div>
                  </div>
                </div>

                {/* Status selectors */}
                <div>
                  <label className="block text-xs font-bold text-sage mb-1.5 uppercase">Class Status (Attendance)</label>
                  <div className="flex flex-wrap gap-2">
                    {CALENDAR_STATUSES.map(s => (
                      <button
                        key={s.key}
                        onClick={() => setStatus(s.key as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                          status === s.key
                            ? 'bg-sage text-white border-sage scale-105'
                            : 'bg-soft-bg dark:bg-[#2f4a3a] border-border-soft dark:border-[#4a6552] text-sage-deep dark:text-white'
                        }`}
                      >
                        {s.emoji} {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Missed Details */}
                {status === 'missed' && (
                  <div className="p-3 bg-soft-bg2 dark:bg-[#3d2e24] border border-danger/30 rounded-lg space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-danger mb-1 uppercase">Reason for absence</label>
                      <select
                        value={missedReason}
                        onChange={(e) => setMissedReason(e.target.value)}
                        className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-danger/40 text-sm"
                      >
                        <option value="Student Absent">Student Absent</option>
                        <option value="Teacher Unavailable">Teacher Unavailable</option>
                        <option value="Public Holiday">Public Holiday</option>
                        <option value="Family Emergency">Family Emergency</option>
                        <option value="Technical/Internet Issue">Technical/Internet Issue</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-danger mb-1 uppercase">Missed Notes</label>
                      <textarea
                        value={missedNotes}
                        onChange={(e) => setMissedNotes(e.target.value)}
                        placeholder="Add some notes about this missed class..."
                        className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-danger/40 text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {/* Lesson details */}
                <div>
                  <label className="block text-xs font-bold text-sage mb-1 uppercase">📖 Lesson Details</label>
                  <input
                    type="text"
                    placeholder="e.g. Surah Al-Mulk, Ayah 11-15"
                    value={lesson}
                    onChange={(e) => setLesson(e.target.value)}
                    className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                  />
                </div>

                {/* Focus area */}
                <div>
                  <label className="block text-xs font-bold text-sage mb-1 uppercase">🎯 Lesson Focus Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Practice correct Madd length"
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                  />
                </div>

                {/* Homework block */}
                <div className="p-3 bg-soft-bg dark:bg-[#2f4a3a] border border-border-soft dark:border-[#4a6552] rounded-lg space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-sage mb-1 uppercase">📝 Assigned Homework</label>
                    <input
                      type="text"
                      placeholder="Homework task..."
                      value={hwText}
                      onChange={(e) => setHwText(e.target.value)}
                      className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552] text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div>
                      <label className="block text-xs font-bold text-sage mb-1 uppercase">Due Date</label>
                      <input
                        type="text"
                        placeholder="YYYY-MM-DD"
                        value={hwDueDate}
                        onChange={(e) => setHwDueDate(e.target.value)}
                        className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552] text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <input
                        type="checkbox"
                        id="hw_done"
                        checked={hwCompleted}
                        onChange={() => setHwCompleted(!hwCompleted)}
                        className="w-4 h-4 rounded border-gray-300 accent-sage cursor-pointer"
                      />
                      <label htmlFor="hw_done" className="text-xs font-bold cursor-pointer">
                        Mark as Completed
                      </label>
                    </div>
                  </div>
                </div>

                {/* Date-specific Assignments manager */}
                <div className="p-3 bg-soft-bg dark:bg-[#2f4a3a] border border-border-soft dark:border-[#4a6552] rounded-lg space-y-2.5">
                  <label className="block text-xs font-bold text-sage uppercase">📋 Assignments for this Class</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add specific assignment for this date..."
                      value={newAsgText}
                      onChange={(e) => setNewAsgText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!newAsgText.trim()) return;
                          const newAsg: AssignmentItem = {
                            id: 'asg-' + Date.now(),
                            text: newAsgText.trim(),
                            completed: false,
                            addedDate: selectedDateStr
                          };
                          onUpdate({
                            ...studentData,
                            assignments: [...(studentData.assignments || []), newAsg]
                          });
                          setNewAsgText('');
                        }
                      }}
                      className="flex-1 px-2.5 py-1.5 border rounded bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552] text-xs text-sage-deep dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newAsgText.trim()) return;
                        const newAsg: AssignmentItem = {
                          id: 'asg-' + Date.now(),
                          text: newAsgText.trim(),
                          completed: false,
                          addedDate: selectedDateStr
                        };
                        onUpdate({
                          ...studentData,
                          assignments: [...(studentData.assignments || []), newAsg]
                        });
                        setNewAsgText('');
                      }}
                      className="px-3 py-1 bg-sage hover:bg-sage-dark text-white rounded text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {(studentData.assignments || []).filter(asg => asg.addedDate === selectedDateStr).length === 0 ? (
                      <p className="text-[11px] text-muted dark:text-[#C7D2C4] italic">No assignments added for this date yet.</p>
                    ) : (
                      (studentData.assignments || [])
                        .filter(asg => asg.addedDate === selectedDateStr)
                        .map(asg => (
                          <div key={asg.id} className="flex items-center justify-between p-1.5 bg-white dark:bg-[#1c2b22] border border-border-soft dark:border-[#4a6552] rounded text-xs">
                            <span className={`${asg.completed ? 'line-through text-muted' : 'text-sage-deep dark:text-white font-medium'}`}>
                              {asg.text}
                            </span>
                            <button
                              type="button"
                              onClick={() => deleteAssignment(asg.id)}
                              className="text-danger hover:text-red-700 px-1 font-bold text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Audio URL */}
                <div>
                  <label className="block text-xs font-bold text-sage mb-1 uppercase">🎧 Lesson Audio Link</label>
                  <input
                    type="text"
                    placeholder="Lesson audio recording link..."
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                  />
                  {audioUrl && (
                    <a
                      href={audioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-1 text-xs text-sage hover:underline font-bold"
                    >
                      ▶ Listen to Today's Audio
                    </a>
                  )}
                </div>

                {/* Teacher Notes */}
                <div>
                  <label className="block text-xs font-bold text-sage mb-1 uppercase">🔒 Teacher private notes (Private)</label>
                  <textarea
                    placeholder="Private teacher comments..."
                    value={teacherNote}
                    onChange={(e) => setTeacherNote(e.target.value)}
                    className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                    rows={2}
                  />
                </div>

                {/* Parent/Student notes */}
                <div>
                  <label className="block text-xs font-bold text-sage mb-1 uppercase">💬 Teacher Feedback (Visible to Student/Parent)</label>
                  <textarea
                    placeholder="Feedback comments..."
                    value={parentNote}
                    onChange={(e) => setParentNote(e.target.value)}
                    className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                    rows={2}
                  />
                </div>

                {/* Excellent star indicator */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="excellent_star"
                    checked={excellent}
                    onChange={() => setExcellent(!excellent)}
                    className="w-4 h-4 rounded border-gray-300 accent-sage cursor-pointer"
                  />
                  <label htmlFor="excellent_star" className="text-xs font-bold cursor-pointer">
                    ⭐ Excellent Student Performance
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between border-t border-border-soft dark:border-[#4a6552] pt-4 mt-6">
            {isTeacher ? (
              <>
                <button
                  onClick={handleDeleteDay}
                  className="px-4 py-2 bg-danger text-white rounded-lg font-bold text-xs hover:opacity-95"
                >
                  Delete Log
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-soft-bg dark:bg-[#2f4a3a] text-sage-deep dark:text-white rounded-lg font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveModal}
                    className="px-5 py-2 bg-sage hover:bg-sage-dark text-white rounded-lg font-bold text-xs transition-colors"
                  >
                    Save Study Plan
                  </button>
                </div>
              </>
            ) : (
              <div className="flex w-full justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 bg-sage hover:bg-sage-dark text-white rounded-lg font-bold text-xs transition-colors"
                >
                  Close Details
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {renderTooltip()}
    </div>
  );
};

const CALENDAR_STATUSES = [
  { key: 'completed', label: 'Completed', emoji: '🟢', bg: '#3fa34d', text: '#ffffff' },
  { key: 'missed', label: 'Missed', emoji: '🔴', bg: '#d64545', text: '#ffffff' },
  { key: 'rescheduled', label: 'Rescheduled', emoji: '🔵', bg: '#3b82c4', text: '#ffffff' },
  { key: 'holiday', label: 'Holiday', emoji: '🟡', bg: '#e8c948', text: '#3c3020' },
  { key: 'assessment', label: 'Assessment', emoji: '🟣', bg: '#9b59b6', text: '#ffffff' },
  { key: 'upcoming', label: 'Upcoming', emoji: '⚪', bg: '#d8ded9', text: '#3c5c4a' }
];
