import React, { useState, useEffect } from 'react';
import { User, StudentData, Announcement, NoteItem } from './types';
import {
  getUsers,
  saveUsers,
  getStudentData,
  saveStudentData,
  getSession,
  setSession,
  clearSession,
  getAnnouncements,
  saveAnnouncements,
  LOGO_DATA_URI,
  initFirebaseSync
} from './dataStore';
import { Calendar } from './components/Calendar';
import { Overview } from './components/Overview';
import { Resources } from './components/Resources';
import { AudioLessons } from './components/AudioLessons';
import { Certificate } from './components/Certificate';

export default function App() {
  const reloadRef = React.useRef<() => void>(() => {});

  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Login form states
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Global announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Clock
  const [utcTime, setUtcTime] = useState('');

  // Private Student Notes Input
  const [newSelfNote, setNewSelfNote] = useState('');

  // Teacher View States
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [teacherSelectedStudentId, setTeacherSelectedStudentId] = useState<string>('s1');
  
  // Teacher editor form states
  const [tAge, setTAge] = useState<string | number>('');
  const [tLevel, setTLevel] = useState('');
  const [tSurahsCompleted, setTSurahsCompleted] = useState<number>(0);
  const [tSurah, setTSurah] = useState('');
  const [tGoal, setTGoal] = useState('');
  const [tProgress, setTProgress] = useState<number>(0);
  const [tParentCorner, setTParentCorner] = useState(false);
  const [tHomeworkText, setTHomeworkText] = useState('');
  const [tNoteText, setTNoteText] = useState('');
  const [tRewardText, setTRewardText] = useState('');
  const [tPhotoFile, setTPhotoFile] = useState<File | null>(null);

  // Teacher extras editor states
  const [tAttendancePct, setTAttendancePct] = useState<number>(100);
  const [tMissedDate, setTMissedDate] = useState('');
  const [tMissedReason, setTMissedReason] = useState('Student Absent');
  const [tNewRuleName, setTNewRuleName] = useState('');
  const [tNewCategoryName, setTNewCategoryName] = useState('');
  
  // Teacher resource editor form
  const [tResCategory, setTResCategory] = useState('');
  const [tResFileType, setTResFileType] = useState<'PDF' | 'Word' | 'Audio' | 'Video' | 'Website' | 'Image' | 'Other'>('PDF');
  const [tResTitle, setTResTitle] = useState('');
  const [tResUrl, setTResUrl] = useState('');
  const [tResDesc, setTResDesc] = useState('');

  // Awarding certificates state
  const [tCertTitle, setTCertTitle] = useState('');
  const [tCertDate, setTCertDate] = useState(new Date().toISOString().split('T')[0]);
  const [tCertInstructor, setTCertInstructor] = useState('Sofiya');
  const [tCertSignature, setTCertSignature] = useState('Ustadha Sofiya');
  const [tCertDua, setTCertDua] = useState('We ask Allah (SWT) to make this knowledge beneficial for them, to make it a light in their heart, a source of success in their actions, and to elevate their status and the status of their parents in this world and the Hereafter.');
  const [tUpdateCounter, setTUpdateCounter] = useState(0);

  // Audio/duas editor
  const [tAudioTitle, setTAudioTitle] = useState('');
  const [tAudioListen, setTAudioListen] = useState('');
  const [tAudioSlow, setTAudioSlow] = useState('');
  const [tAudioRepeat, setTAudioRepeat] = useState('');
  const [tAudioDownload, setTAudioDownload] = useState('');

  const [tDuaTitle, setTDuaTitle] = useState('');
  const [tDuaText, setTDuaText] = useState('');

  // Announcements editor
  const [tAnnouncementText, setTAnnouncementText] = useState('');

  // Add Student Form
  const [addStuName, setAddStuName] = useState('');
  const [addStuUser, setAddStuUser] = useState('');
  const [addStuPass, setAddStuPass] = useState('');
  const [addStuMsg, setAddStuMsg] = useState('');

  // Streak tracking helper functions
  const getLocalDateString = (): string => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const r = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${r}`;
  };

  const calculateUpdatedStreak = (data: StudentData): StudentData => {
    const todayStr = getLocalDateString();
    const currentCount = data.streakCount || 0;
    const lastDate = data.lastStreakUpdateDate;

    if (!lastDate) {
      return checkAndAwardStreakBadges({
        ...data,
        streakCount: 1,
        lastStreakUpdateDate: todayStr
      }, 1, todayStr);
    }

    if (lastDate === todayStr) {
      // Streak already updated today
      return data;
    }

    const dToday = new Date(todayStr + 'T00:00:00');
    const dLast = new Date(lastDate + 'T00:00:00');
    
    const diffTime = dToday.getTime() - dLast.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    let nextCount = currentCount;
    if (diffDays === 1) {
      nextCount = currentCount + 1;
    } else if (diffDays > 1) {
      nextCount = 1;
    } else {
      nextCount = Math.max(1, currentCount);
    }

    return checkAndAwardStreakBadges({
      ...data,
      streakCount: nextCount,
      lastStreakUpdateDate: todayStr
    }, nextCount, todayStr);
  };

  const checkAndAwardStreakBadges = (data: StudentData, streak: number, todayStr: string): StudentData => {
    const milestoneMilestones = [3, 5, 10, 15, 30, 50, 100];
    if (!milestoneMilestones.includes(streak)) return data;

    const alreadyHas = (data.rewards || []).some(
      r => r.text.includes(`${streak}-day study streak`) || r.text.includes(`${streak}-day Study Streak`)
    );

    if (!alreadyHas) {
      return {
        ...data,
        rewards: [
          { text: `🌟 Achieved a spectacular ${streak}-day study streak!`, date: todayStr },
          ...(data.rewards || [])
        ]
      };
    }
    return data;
  };

  reloadRef.current = () => {
    setAnnouncements(getAnnouncements());
    const savedId = getSession();
    if (savedId) {
      const found = getUsers().find(u => u.id === savedId);
      if (found) {
        setSessionUser(found);
        if (found.role === 'student') {
          const sData = getStudentData(found.id);
          setStudentData(sData);
        } else if (teacherSelectedStudentId) {
          loadStudentEditorStates(teacherSelectedStudentId);
        }
      }
    }
    setTUpdateCounter(prev => prev + 1);
  };

  useEffect(() => {
    // Initialize Firebase Sync
    initFirebaseSync(() => {
      reloadRef.current();
    });

    // Sync clock
    const interval = setInterval(() => {
      setUtcTime(new Date().toUTCString());
    }, 1000);

    // Initial auth load
    const savedId = getSession();
    if (savedId) {
      const found = getUsers().find(u => u.id === savedId);
      if (found) {
        setSessionUser(found);
        if (found.role === 'student') {
          let sData = getStudentData(found.id);
          if (sData) {
            sData = calculateUpdatedStreak(sData);
            saveStudentData(found.id, sData);
          }
          setStudentData(sData);
        }
      }
    }

    // Load announcements
    setAnnouncements(getAnnouncements());

    // Dark mode check
    const darkVal = localStorage.getItem('tb_darkMode') === 'true';
    setIsDarkMode(darkVal);
    document.body.classList.toggle('dark-mode', darkVal);
    document.body.classList.toggle('dark', darkVal);
    document.documentElement.classList.toggle('dark-mode', darkVal);
    document.documentElement.classList.toggle('dark', darkVal);

    return () => clearInterval(interval);
  }, []);

  const handleToggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    localStorage.setItem('tb_darkMode', String(nextDark));
    document.body.classList.toggle('dark-mode', nextDark);
    document.body.classList.toggle('dark', nextDark);
    document.documentElement.classList.toggle('dark-mode', nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser.trim() || !loginPass.trim()) {
      setLoginError('Please enter both username and password.');
      return;
    }

    const found = getUsers().find(
      u => u.username.toLowerCase() === loginUser.toLowerCase().trim() && u.password === loginPass
    );

    if (!found) {
      setLoginError('Invalid username or password.');
      return;
    }

    setLoginError('');
    setSession(found.id);
    setSessionUser(found);
    setLoginUser('');
    setLoginPass('');

    if (found.role === 'student') {
      let sData = getStudentData(found.id);
      if (sData) {
        sData = calculateUpdatedStreak(sData);
        saveStudentData(found.id, sData);
      }
      setStudentData(sData);
      setActiveTab('overview');
    } else {
      setActiveTab('t-overview');
    }
  };

  const handleLogoutClick = () => {
    clearSession();
    setSessionUser(null);
    setStudentData(null);
    setShowMobileSidebar(false);
  };

  const handleUpdateStudentData = (updated: StudentData) => {
    let finalUpdated = updated;
    if (sessionUser && sessionUser.role === 'student' && studentData) {
      // Detect if they marked a task as completed
      const prevCompletedAsg = (studentData.assignments || []).filter(a => a.completed).length;
      const nextCompletedAsg = (updated.assignments || []).filter(a => a.completed).length;

      const getCompletedHwCount = (data: StudentData | null) => {
        if (!data) return 0;
        return Object.values(data.calendarEvents || {}).filter(e => e?.homework?.completed).length;
      };

      const prevCompletedHw = getCompletedHwCount(studentData);
      const nextCompletedHw = getCompletedHwCount(updated);

      const taskWasCompleted = (nextCompletedAsg > prevCompletedAsg) || (nextCompletedHw > prevCompletedHw);

      if (taskWasCompleted) {
        finalUpdated = calculateUpdatedStreak(updated);
        const prevStreak = studentData.streakCount || 0;
        const nextStreak = finalUpdated.streakCount || 0;
        if (nextStreak > prevStreak) {
          alert(`🔥 Spectacular! Your study streak has increased to ${nextStreak} days! Keep learning! 📖`);
        } else {
          alert(`🔥 Active Study Streak of ${nextStreak} days maintained! Brilliant work checking off your task! 🌟`);
        }
      }

      saveStudentData(sessionUser.id, finalUpdated);
      setStudentData(finalUpdated);
    } else if (teacherSelectedStudentId) {
      saveStudentData(teacherSelectedStudentId, finalUpdated);
      // Trigger a local state re-render
      loadStudentEditorStates(teacherSelectedStudentId);
      setTUpdateCounter(prev => prev + 1);
    }
  };

  // Sync state helpers for student notes
  const handleSaveSelfNote = () => {
    if (!newSelfNote.trim() || !studentData) return;
    const newNote: NoteItem = {
      text: newSelfNote.trim(),
      date: new Date().toISOString().split('T')[0]
    };
    const updated = {
      ...studentData,
      selfNotes: [...(studentData.selfNotes || []), newNote]
    };
    handleUpdateStudentData(updated);
    setNewSelfNote('');
  };

  // Setup student form values when picker changes
  const loadStudentEditorStates = (id: string) => {
    const data = getStudentData(id);
    if (!data) return;

    setTAge(data.age || '');
    setTLevel(data.level || '');
    setTSurahsCompleted(data.surahsCompleted || 0);
    setTSurah(data.surah || '');
    setTGoal(data.goal || '');
    setTProgress(data.progress || 0);
    setTParentCorner(data.parentCornerEnabled || false);

    setTAttendancePct(data.attendance || 100);
    if (data.resourceCategories && data.resourceCategories.length > 0) {
      setTResCategory(data.resourceCategories[0]);
    }
  };

  useEffect(() => {
    if (sessionUser?.role === 'teacher' && teacherSelectedStudentId) {
      loadStudentEditorStates(teacherSelectedStudentId);
    }
  }, [sessionUser, teacherSelectedStudentId]);

  const handleSaveTeacherBasics = () => {
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    const updated = {
      ...data,
      age: tAge,
      level: tLevel.trim(),
      surahsCompleted: Number(tSurahsCompleted),
      surah: tSurah.trim(),
      goal: tGoal.trim(),
      progress: Math.min(100, Math.max(0, Number(tProgress))),
      parentCornerEnabled: tParentCorner
    };

    saveStudentData(teacherSelectedStudentId, updated);
    alert('Basic details saved successfully! ✅');
  };

  const handleAddTeacherHomework = () => {
    if (!tHomeworkText.trim()) return;
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    const updated = {
      ...data,
      homework: [...(data.homework || []), { text: tHomeworkText.trim(), done: false }]
    };

    saveStudentData(teacherSelectedStudentId, updated);
    setTHomeworkText('');
    alert('Homework assigned! ✅');
  };

  const handleAddTeacherNote = () => {
    if (!tNoteText.trim()) return;
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    const updated = {
      ...data,
      teacherNotes: [
        { text: tNoteText.trim(), date: new Date().toISOString().split('T')[0] },
        ...(data.teacherNotes || [])
      ]
    };

    saveStudentData(teacherSelectedStudentId, updated);
    setTNoteText('');
    alert('Teacher note logged! ✅');
  };

  const handleAddTeacherReward = () => {
    if (!tRewardText.trim()) return;
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    const updated = {
      ...data,
      rewards: [
        { text: tRewardText.trim(), date: new Date().toISOString().split('T')[0] },
        ...(data.rewards || [])
      ]
    };

    saveStudentData(teacherSelectedStudentId, updated);
    setTRewardText('');
    alert('Reward/Badge awarded! ✅');
  };

  // Image upload handling for student photo
  const handleStudentPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 200;
        const canvas = document.createElement('canvas');
        canvas.width = MAX_SIZE;
        canvas.height = MAX_SIZE;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const side = Math.min(img.width, img.height);
          const sx = (img.width - side) / 2;
          const sy = (img.height - side) / 2;
          ctx.drawImage(img, sx, sy, side, side, 0, 0, MAX_SIZE, MAX_SIZE);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

          const data = getStudentData(teacherSelectedStudentId);
          if (data) {
            data.photo = dataUrl;
            saveStudentData(teacherSelectedStudentId, data);
            alert('Student picture uploaded successfully! 📸');
            // Trigger state reload
            loadStudentEditorStates(teacherSelectedStudentId);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveStudentPhoto = () => {
    const data = getStudentData(teacherSelectedStudentId);
    if (data) {
      data.photo = '';
      saveStudentData(teacherSelectedStudentId, data);
      alert('Student picture removed! 📸');
      loadStudentEditorStates(teacherSelectedStudentId);
    }
  };

  // Attendance, Tajweed, Category & Resource Editors
  const handleSaveAttendancePct = () => {
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    data.attendance = Math.min(100, Math.max(0, Number(tAttendancePct)));
    saveStudentData(teacherSelectedStudentId, data);
    alert('Attendance percentage updated! ✅');
  };

  const handleLogMissedClass = () => {
    if (!tMissedDate.trim()) return;
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    data.missedClasses = [
      ...(data.missedClasses || []),
      { date: tMissedDate.trim(), reason: tMissedReason }
    ];
    saveStudentData(teacherSelectedStudentId, data);
    setTMissedDate('');
    alert('Missed class logged! 🔴');
  };

  const handleAddTajweedRule = () => {
    if (!tNewRuleName.trim()) return;
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    data.tajweedRules = [
      ...(data.tajweedRules || []),
      { name: tNewRuleName.trim(), learned: false }
    ];
    saveStudentData(teacherSelectedStudentId, data);
    setTNewRuleName('');
    alert('Tajweed rule added! 🔤');
  };

  const handleToggleRuleLearned = (idx: number) => {
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    data.tajweedRules[idx].learned = !data.tajweedRules[idx].learned;
    saveStudentData(teacherSelectedStudentId, data);
    loadStudentEditorStates(teacherSelectedStudentId);
  };

  const handleAddCategory = () => {
    if (!tNewCategoryName.trim()) return;
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    if (data.resourceCategories.includes(tNewCategoryName.trim())) {
      alert('That category already exists.');
      return;
    }

    data.resourceCategories = [...(data.resourceCategories || []), tNewCategoryName.trim()];
    saveStudentData(teacherSelectedStudentId, data);
    setTNewCategoryName('');
    loadStudentEditorStates(teacherSelectedStudentId);
    alert('Category created! 📁');
  };

  const handleDeleteCategory = (cat: string) => {
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    if (!window.confirm(`Delete category "${cat}"? Resources inside will move to uncategorized.`)) return;

    data.resourceCategories = data.resourceCategories.filter(c => c !== cat);
    data.resources = (data.resources || []).map(r => {
      if (r.category === cat) return { ...r, category: '' };
      return r;
    });

    saveStudentData(teacherSelectedStudentId, data);
    loadStudentEditorStates(teacherSelectedStudentId);
  };

  const handleAddResource = () => {
    if (!tResTitle.trim() || !tResUrl.trim()) return;
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    data.resources = [
      ...(data.resources || []),
      {
        category: tResCategory,
        fileType: tResFileType,
        title: tResTitle.trim(),
        url: tResUrl.trim(),
        description: tResDesc.trim(),
        addedDate: new Date().toISOString().split('T')[0]
      }
    ];

    saveStudentData(teacherSelectedStudentId, data);
    setTResTitle('');
    setTResUrl('');
    setTResDesc('');
    alert('Shared resource added! 📁');
  };

  const handleDeleteResource = (idx: number) => {
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    data.resources.splice(idx, 1);
    saveStudentData(teacherSelectedStudentId, data);
    loadStudentEditorStates(teacherSelectedStudentId);
  };

  const handleAwardCertificate = () => {
    if (!tCertTitle.trim()) return;
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    data.certificates = [
      ...(data.certificates || []),
      {
        title: tCertTitle.trim(),
        date: tCertDate.trim() || new Date().toISOString().split('T')[0],
        instructor: tCertInstructor.trim() || 'Sofiya',
        signature: tCertSignature.trim() || 'Ustadha Sofiya',
        duaText: tCertDua.trim() || undefined
      }
    ];

    saveStudentData(teacherSelectedStudentId, data);
    setTCertTitle('');
    // Trigger local state re-render
    setTUpdateCounter(prev => prev + 1);
    alert('Certificate awarded to student! 🏅');
  };

  const handleDeleteCertificate = (idx: number) => {
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    data.certificates.splice(idx, 1);
    saveStudentData(teacherSelectedStudentId, data);
    loadStudentEditorStates(teacherSelectedStudentId);
    setTUpdateCounter(prev => prev + 1);
  };

  // Add Audio/Dua items
  const handleAddAudioLesson = () => {
    if (!tAudioTitle.trim()) return;
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    data.audioLessons = [
      ...(data.audioLessons || []),
      {
        title: tAudioTitle.trim(),
        listenUrl: tAudioListen.trim() || undefined,
        slowUrl: tAudioSlow.trim() || undefined,
        repeatUrl: tAudioRepeat.trim() || undefined,
        downloadUrl: tAudioDownload.trim() || undefined
      }
    ];

    saveStudentData(teacherSelectedStudentId, data);
    setTAudioTitle('');
    setTAudioListen('');
    setTAudioSlow('');
    setTAudioRepeat('');
    setTAudioDownload('');
    alert('Audio lesson added successfully! 🎧');
  };

  const handleDeleteAudioLesson = (idx: number) => {
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    data.audioLessons.splice(idx, 1);
    saveStudentData(teacherSelectedStudentId, data);
    loadStudentEditorStates(teacherSelectedStudentId);
  };

  const handleAddDua = () => {
    if (!tDuaTitle.trim() || !tDuaText.trim()) return;
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    data.duas = [
      ...(data.duas || []),
      { title: tDuaTitle.trim(), text: tDuaText.trim() }
    ];

    saveStudentData(teacherSelectedStudentId, data);
    setTDuaTitle('');
    setTDuaText('');
    alert('Shared Dua added successfully! 🤲');
  };

  const handleDeleteDua = (idx: number) => {
    const data = getStudentData(teacherSelectedStudentId);
    if (!data) return;

    data.duas.splice(idx, 1);
    saveStudentData(teacherSelectedStudentId, data);
    loadStudentEditorStates(teacherSelectedStudentId);
  };

  // Post Global Announcements
  const handlePostAnnouncement = () => {
    if (!tAnnouncementText.trim()) return;
    const updated = [
      { text: tAnnouncementText.trim(), date: new Date().toISOString().split('T')[0] },
      ...announcements
    ];
    saveAnnouncements(updated);
    setAnnouncements(updated);
    setTAnnouncementText('');
    alert('Announcement posted! 📢');
  };

  const handleDeleteAnnouncement = (idx: number) => {
    const updated = announcements.filter((_, i) => i !== idx);
    saveAnnouncements(updated);
    setAnnouncements(updated);
  };

  // Add Student Logic
  const handleCreateStudent = () => {
    if (!addStuName.trim() || !addStuUser.trim() || !addStuPass.trim()) {
      setAddStuMsg('Please enter student name, username and password.');
      return;
    }

    const currentUsers = getUsers();
    if (currentUsers.some(u => u.username.toLowerCase() === addStuUser.toLowerCase().trim())) {
      setAddStuMsg('That username is already taken.');
      return;
    }

    const nextId = 's' + Date.now();
    const newUser: User = {
      id: nextId,
      name: addStuName.trim(),
      username: addStuUser.trim().toLowerCase(),
      password: addStuPass,
      role: 'student'
    };

    const newStudentProfile: StudentData = {
      surah: 'Not started yet',
      goal: 'Set a goal for this student',
      progress: 0,
      age: '',
      level: '',
      surahsCompleted: 0,
      homework: [],
      rewards: [],
      parentNotes: [],
      teacherNotes: [],
      dua: 'Rabbi zidni ilma — "My Lord, increase me in knowledge." (Surah Taha 20:114)',
      parentCornerEnabled: false,
      attendance: 100,
      missedClasses: [],
      tajweedRules: [],
      resources: [],
      classLink: '',
      classTimings: '',
      recurringDays: [],
      recurringTime: '',
      recurringTopic: '',
      cancelledDates: [],
      audioLessons: [],
      duas: [],
      monthlyPlan: {},
      calendarEvents: {},
      assignments: [],
      weeklyPlan: {},
      photo: '',
      resourceCategories: ['Quran', 'Tajweed', 'Islamic Studies', 'Arabic', 'Revision', 'Assignments', 'Games', 'Videos'],
      selfNotes: [],
      certificates: []
    };

    saveUsers([...currentUsers, newUser]);
    saveStudentData(nextId, newStudentProfile);

    setAddStuName('');
    setAddStuUser('');
    setAddStuPass('');
    setAddStuMsg('Student profile created successfully! ✅');
  };

  // Student search helper
  const getFilteredStudentsForTeacherTable = () => {
    const allStudents = getUsers().filter(u => u.role === 'student');
    if (!teacherSearchQuery.trim()) return allStudents;
    return allStudents.filter(s => s.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()));
  };

  // Sidebar link items
  const studentNavItems = [
    { key: 'overview', label: '🏠 Overview' },
    { key: 'planner', label: '🗓️ Study Planner' },
    { key: 'resources', label: '📁 Shared Resources' },
    { key: 'rewards', label: '🏆 Rewards & Certificates' },
    ...(studentData?.parentCornerEnabled ? [{ key: 'parent', label: '👨‍👩‍👧 Parent Corner' }] : []),
    { key: 'notes', label: '📔 My Notes' }
  ];

  const teacherNavItems = [
    { key: 't-overview', label: '📊 All Students' },
    { key: 't-manage', label: '✏️ Manage Student' },
    { key: 't-planner', label: '🗓️ Study Planner' },
    { key: 't-extras', label: '📋 Resources & Extras' },
    { key: 't-audios', label: '🎧 Audio & Duas' },
    { key: 't-announcements', label: '📢 Announcements' },
    { key: 't-add', label: '➕ Add Student' }
  ];

  return (
    <div className="min-h-screen bg-cream dark:bg-[#1c2b22] text-sage-deep dark:text-[#E8ECE7] flex flex-col transition-colors duration-200">
      
      {/* ---------------- LOGIN SCREEN ---------------- */}
      {!sessionUser && (
        <div className="flex-1 flex items-center justify-center px-4 py-12 login-wrap">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#24392c] p-8 rounded-2xl shadow-xl border-t-4 border-gold text-center space-y-6">
            <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-16 h-8 border-2 border-gold border-b-0 rounded-t-full opacity-60" />
            <img src={LOGO_DATA_URI} alt="Academy logo" className="w-20 h-auto mx-auto drop-shadow-md" />
            
            <div className="space-y-1">
              <h1 className="text-2xl font-serif font-bold text-sage-deep dark:text-[#E8ECE7]">Learn with Sofiya</h1>
              <p className="text-xs text-muted dark:text-[#C7D2C4] font-medium tracking-wider uppercase">Qur'an Learning Portal</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-sage mb-1 uppercase">Username</label>
                <input
                  type="text"
                  placeholder="e.g. aisha"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552] text-sage-deep dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-sage mb-1 uppercase">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552] text-sage-deep dark:text-white"
                />
              </div>

              {loginError && (
                <p className="text-xs text-danger font-bold text-center pt-1">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-sage hover:bg-sage-dark text-white rounded-lg font-bold text-sm transition-colors mt-2"
              >
                Log In
              </button>
            </form>

            <div className="border-t border-border-soft dark:border-[#4a6552] pt-4 text-[11px] leading-relaxed text-sage-deep dark:text-[#C7D2C4] space-y-0.5">
              <p className="font-serif font-bold text-xs text-sage dark:text-[#E8ECE7]">© 2026 Learn with Sofiya</p>
              <p className="text-[10px] italic">Teaching the Qur'an with excellence and sincerity.</p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MAIN APP SYSTEM ---------------- */}
      {sessionUser && (
        <div className="flex-1 flex flex-col md:flex-row">
          
          {/* Mobile Overlay Background */}
          {showMobileSidebar && (
            <div
              onClick={() => setShowMobileSidebar(false)}
              className="fixed inset-0 bg-black/40 z-30 md:hidden"
            />
          )}

          {/* Desktop/Mobile Sidebar Container */}
          <aside
            className={`fixed md:static inset-y-0 left-0 w-64 bg-panel-bg dark:bg-[#24392c] p-5 flex flex-col justify-between z-40 transform transition-transform duration-200 md:transform-none md:translate-x-0 ${
              showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="space-y-6">
              <div className="text-center pb-4 border-b border-border-soft dark:border-[#4a6552] space-y-1">
                <img src={LOGO_DATA_URI} alt="Academy logo" className="w-14 h-auto mx-auto mb-1" />
                <h2 className="font-serif text-base font-bold text-sage-deep dark:text-[#E8ECE7]">Learn with Sofiya</h2>
                <p className="text-[10px] uppercase text-muted dark:text-[#C7D2C4] font-bold tracking-wider">Portal Navigation</p>
              </div>

              {/* Sidebar items */}
              <nav className="space-y-1">
                {(sessionUser.role === 'student' ? studentNavItems : teacherNavItems).map(item => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setActiveTab(item.key);
                      setShowMobileSidebar(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === item.key
                        ? 'bg-sage text-white shadow-sm'
                        : 'text-sage-deep dark:text-[#C7D2C4] hover:bg-cream/40 dark:hover:bg-[#2f4a3a]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="space-y-4 pt-4 border-t border-border-soft dark:border-[#4a6552]/40">
              <div className="text-center text-[11px] text-muted dark:text-[#C7D2C4] leading-relaxed space-y-0.5">
                <p className="font-serif font-bold text-sage-deep dark:text-white">© 2026 Learn with Sofiya</p>
                <p className="italic">Teaching the Qur'an with excellence and sincerity.</p>
              </div>
              <button
                onClick={handleLogoutClick}
                className="w-full py-2 bg-danger hover:opacity-90 text-white rounded-lg text-xs font-bold transition-all"
              >
                Log Out
              </button>
            </div>
          </aside>

          {/* Main workspace viewport */}
          <main className="flex-1 p-4 md:p-6 space-y-6 overflow-x-hidden">
            
            {/* Header toolbar */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-panel-bg dark:bg-[#24392c] rounded-xl border border-border-soft dark:border-[#4a6552]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileSidebar(true)}
                  className="p-1 md:hidden text-lg text-sage-deep dark:text-white"
                >
                  ☰
                </button>
                <h1 className="text-lg font-serif font-bold text-sage-deep dark:text-white flex items-center gap-2">
                  <span>Welcome, {sessionUser.name} 🌷</span>
                </h1>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <button
                  onClick={handleToggleDarkMode}
                  className="px-3 py-1.5 bg-cream dark:bg-[#1c2b22] hover:opacity-90 rounded-lg text-[11px] font-bold border border-border-soft dark:border-[#4a6552]"
                >
                  {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
                <div className="text-muted dark:text-[#C7D2C4] hidden lg:block font-mono">
                  {utcTime}
                </div>
              </div>
            </header>

            {/* Global announcements banner */}
            {sessionUser.role === 'student' && announcements.length > 0 && (
              <div className="bg-[#fff9e6] dark:bg-[#3d3215] border border-gold/30 p-4 rounded-xl space-y-2">
                <h3 className="text-xs font-bold text-[#8a6d1f] uppercase tracking-wider flex items-center gap-1">
                  <span>📢 Announcements</span>
                </h3>
                <div className="space-y-1.5">
                  {announcements.map((ann, idx) => (
                    <div key={idx} className="text-xs text-[#5c4a14] dark:text-[#e8d7a5]">
                      • {ann.text} <span className="opacity-60 text-[10px]">({ann.date})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- STUDENT MODULES ---------------- */}
            {sessionUser.role === 'student' && studentData && (
              <div className="space-y-6">
                
                {/* 1. Overview */}
                {activeTab === 'overview' && (
                  <Overview user={sessionUser} studentData={studentData} />
                )}

                {/* 2. Study Planner / Calendar */}
                {activeTab === 'planner' && (
                  <Calendar
                    studentId={sessionUser.id}
                    studentData={studentData}
                    isTeacher={false}
                    onUpdate={handleUpdateStudentData}
                  />
                )}

                {/* 3. Resources */}
                {activeTab === 'resources' && (
                  <Resources studentData={studentData} />
                )}

                {/* 5. Listening Centre */}
                {activeTab === 'listening' && (
                  <AudioLessons studentData={studentData} />
                )}

                {/* 6. Rewards & Certificates */}
                {activeTab === 'rewards' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-[#24392c] p-6 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] space-y-4">
                      <div>
                        <h2 className="text-lg font-bold font-serif text-sage-dark dark:text-white">🏆 Badges &amp; Rewards</h2>
                        <p className="text-xs text-muted dark:text-[#C7D2C4]">Your milestone rewards and streak recognition.</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(studentData.rewards || []).length === 0 ? (
                          <p className="text-xs text-muted dark:text-[#C7D2C4] py-2 col-span-2 text-center">No badges unlocked yet. Keep reading! 🌱</p>
                        ) : (
                          (studentData.rewards || []).map((rw, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-[#fdf8ec] dark:bg-[#2d392f] border border-gold/30 rounded-xl flex items-center justify-between"
                            >
                              <span className="font-bold text-xs text-amber-800 dark:text-amber-200">{rw.text}</span>
                              <span className="text-[10px] text-muted dark:text-[#C7D2C4]">{rw.date}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <Certificate user={sessionUser} studentData={studentData} />
                  </div>
                )}

                {/* 8. Parent Corner */}
                {activeTab === 'parent' && (
                  <div className="bg-white dark:bg-[#24392c] p-6 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] space-y-4">
                    <div>
                      <h2 className="text-lg font-bold font-serif text-sage-dark dark:text-white">👨‍👩‍👧 Parent Corner</h2>
                      <p className="text-xs text-muted dark:text-[#C7D2C4]">Shared practice updates, logs, and home reminders from Ustadha Sofiya.</p>
                    </div>
                    <div className="space-y-3">
                      {(studentData.parentNotes || []).length === 0 ? (
                        <p className="text-xs text-muted">No notes shared for parents yet.</p>
                      ) : (
                        (studentData.parentNotes || []).map((pn, idx) => (
                          <div key={idx} className="p-3 bg-soft-bg dark:bg-[#2f4a3a] rounded-xl text-xs">
                            <p className="leading-relaxed font-medium">{pn.text}</p>
                            <span className="block text-[10px] text-muted dark:text-[#C7D2C4] mt-1.5">{pn.date}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 9. My Notes */}
                {activeTab === 'notes' && (
                  <div className="bg-white dark:bg-[#24392c] p-6 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] space-y-4">
                    <div>
                      <h2 className="text-lg font-bold font-serif text-sage-dark dark:text-white">📔 Personal Notes &amp; Reflections</h2>
                      <p className="text-xs text-muted dark:text-[#C7D2C4]">Private journal space to log your daily thoughts or specific questions for next class.</p>
                    </div>
                    <div className="space-y-3">
                      <textarea
                        rows={3}
                        placeholder="Write something down to review next class..."
                        value={newSelfNote}
                        onChange={(e) => setNewSelfNote(e.target.value)}
                        className="w-full p-3 border rounded-xl bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                      />
                      <button
                        onClick={handleSaveSelfNote}
                        className="px-4 py-2 bg-sage hover:bg-sage-dark text-white rounded-lg font-bold text-xs transition-colors"
                      >
                        Save Reflection Note
                      </button>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-border-soft dark:border-[#4a6552]">
                      {(studentData.selfNotes || []).length === 0 ? (
                        <p className="text-xs text-muted">No private reflections saved yet.</p>
                      ) : (
                        (studentData.selfNotes || []).slice().reverse().map((sn, idx) => (
                          <div key={idx} className="p-3 bg-soft-bg dark:bg-[#2f4a3a] rounded-xl text-xs">
                            <p className="leading-relaxed">{sn.text}</p>
                            <span className="block text-[10px] text-muted dark:text-[#C7D2C4] mt-1">{sn.date}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- TEACHER MODULES ---------------- */}
            {sessionUser.role === 'teacher' && (
              <div className="space-y-6">
                
                {/* Picker shared for managing pages */}
                {activeTab !== 't-overview' && activeTab !== 't-announcements' && (
                  <div className="bg-white dark:bg-[#24392c] p-4 rounded-xl border border-border-soft dark:border-[#4a6552] flex items-center justify-between">
                    <span className="text-xs font-bold text-sage uppercase">Currently Selected Student:</span>
                    <select
                      value={teacherSelectedStudentId}
                      onChange={(e) => setTeacherSelectedStudentId(e.target.value)}
                      className="px-3 py-1.5 border rounded-lg bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                    >
                      {getUsers()
                        .filter(u => u.role === 'student')
                        .map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* 1. All Students Overview */}
                {activeTab === 't-overview' && (
                  <div className="space-y-6">
                    {/* Search student */}
                    <div className="bg-white dark:bg-[#24392c] p-5 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] space-y-3">
                      <h2 className="text-lg font-bold font-serif text-sage-dark dark:text-white">📊 Academy Student Roster</h2>
                      <input
                        type="text"
                        placeholder="Search student profile by name..."
                        value={teacherSearchQuery}
                        onChange={(e) => setTeacherSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                      />
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-[#24392c] rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] overflow-x-auto">
                      <table className="w-full border-collapse text-sm text-left">
                        <thead>
                          <tr className="bg-soft-bg dark:bg-[#2f4a3a] text-sage-dark dark:text-white border-b border-border-soft dark:border-[#4a6552]">
                            <th className="p-3">Avatar</th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Current Study Focus</th>
                            <th className="p-3">Progress</th>
                            <th className="p-3">Attendance</th>
                            <th className="p-3">Homework</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-soft dark:divide-[#4a6552]">
                          {getFilteredStudentsForTeacherTable().map(s => {
                            const data = getStudentData(s.id);
                            if (!data) return null;
                            const initials = s.name.slice(0, 2).toUpperCase();

                            return (
                              <tr key={s.id} className="hover:bg-soft-bg/30">
                                <td className="p-3">
                                  {data.photo ? (
                                    <div
                                      className="w-8 h-8 rounded-full"
                                      style={{ backgroundImage: `url(${data.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-sage text-white text-xs font-bold flex items-center justify-center">
                                      {initials}
                                    </div>
                                  )}
                                </td>
                                <td className="p-3 font-semibold">{s.name}</td>
                                <td className="p-3 italic text-xs">{data.surah}</td>
                                <td className="p-3">
                                  <span className="font-bold">{data.progress}%</span>
                                </td>
                                <td className="p-3">
                                  <span className="font-bold text-sage">{data.attendance}%</span>
                                </td>
                                <td className="p-3 text-xs">
                                  {data.homework?.filter(h => !h.done).length} pending
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 2. Manage Student profile details */}
                {activeTab === 't-manage' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left profile/photo details */}
                    <div className="bg-white dark:bg-[#24392c] p-6 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] space-y-4">
                      <h3 className="font-serif text-base font-bold text-sage-dark dark:text-white border-b pb-2 mb-2">📸 Student Profile Picture</h3>
                      
                      <div className="flex items-center gap-4">
                        {getStudentData(teacherSelectedStudentId)?.photo ? (
                          <div
                            className="w-20 h-20 rounded-full border-2 border-sage"
                            style={{
                              backgroundImage: `url(${getStudentData(teacherSelectedStudentId)?.photo})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-sage text-white text-xl font-bold flex items-center justify-center font-serif">
                            {getUsers().find(u => u.id === teacherSelectedStudentId)?.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="space-y-1.5 text-xs">
                          <input type="file" accept="image/*" onChange={handleStudentPhotoUpload} className="block" />
                          <button onClick={handleRemoveStudentPhoto} className="px-3 py-1 bg-danger text-white rounded font-bold text-[10px]">
                            Remove picture
                          </button>
                        </div>
                      </div>

                      {/* Editing Profile Basics */}
                      <div className="space-y-3 pt-4 border-t border-border-soft dark:border-[#4a6552]">
                        <h3 className="font-serif text-base font-bold text-sage-dark dark:text-white">✏️ Basic Student Details</h3>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold text-sage uppercase mb-1">Age</label>
                            <input
                              type="number"
                              value={tAge}
                              onChange={(e) => setTAge(e.target.value)}
                              className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-sage uppercase mb-1">Completed Surahs</label>
                            <input
                              type="number"
                              value={tSurahsCompleted}
                              onChange={(e) => setTSurahsCompleted(Number(e.target.value))}
                              className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-sage uppercase mb-1">Study Level</label>
                          <input
                            type="text"
                            value={tLevel}
                            onChange={(e) => setTLevel(e.target.value)}
                            className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552] text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-sage uppercase mb-1">Current Surah / Study Focus</label>
                          <input
                            type="text"
                            value={tSurah}
                            onChange={(e) => setTSurah(e.target.value)}
                            className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552] text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-sage uppercase mb-1">Current Goal</label>
                          <input
                            type="text"
                            value={tGoal}
                            onChange={(e) => setTGoal(e.target.value)}
                            className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552] text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 items-center">
                          <div>
                            <label className="block text-[10px] font-bold text-sage uppercase mb-1">Overall Progress (%)</label>
                            <input
                              type="number"
                              value={tProgress}
                              onChange={(e) => setTProgress(Number(e.target.value))}
                              className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                            />
                          </div>

                          <div className="flex items-center gap-2 mt-4 text-xs font-semibold">
                            <input
                              type="checkbox"
                              id="t_parent"
                              checked={tParentCorner}
                              onChange={() => setTParentCorner(!tParentCorner)}
                              className="w-4 h-4 rounded border-gray-300 accent-sage cursor-pointer"
                            />
                            <label htmlFor="t_parent" className="cursor-pointer select-none">
                              Enable Parent Corner
                            </label>
                          </div>
                        </div>

                        <button
                          onClick={handleSaveTeacherBasics}
                          className="px-4 py-2 bg-sage hover:bg-sage-dark text-white rounded-lg font-bold text-xs transition-all w-full"
                        >
                          Save Profile Changes
                        </button>
                      </div>
                    </div>

                    {/* Right side widgets (Homework, Notes, Custom Rewards) */}
                    <div className="bg-white dark:bg-[#24392c] p-6 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] space-y-4">
                      {/* Study planner & timeline for the teacher view */}
                      <h3 className="font-serif text-base font-bold text-sage-dark dark:text-white border-b pb-2">📋 Quick Assignment Widgets</h3>
                      
                      {/* Homework */}
                      <div className="space-y-1.5 text-xs">
                        <label className="block text-[10px] font-bold text-sage uppercase">Assign Homework task</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Recite Surah Al-Mulk 3x"
                            value={tHomeworkText}
                            onChange={(e) => setTHomeworkText(e.target.value)}
                            className="flex-1 p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                          />
                          <button onClick={handleAddTeacherHomework} className="px-4 bg-sage text-white rounded font-bold">Assign</button>
                        </div>
                      </div>

                      {/* Note */}
                      <div className="space-y-1.5 text-xs">
                        <label className="block text-[10px] font-bold text-sage uppercase">Teacher Note (private)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add note comments..."
                            value={tNoteText}
                            onChange={(e) => setTNoteText(e.target.value)}
                            className="flex-1 p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                          />
                          <button onClick={handleAddTeacherNote} className="px-4 bg-sage text-white rounded font-bold">Add Note</button>
                        </div>
                      </div>

                      {/* Custom rewards */}
                      <div className="space-y-1.5 text-xs">
                        <label className="block text-[10px] font-bold text-sage uppercase">Reward custom badge</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. ⭐ Tajweed Master"
                            value={tRewardText}
                            onChange={(e) => setTRewardText(e.target.value)}
                            className="flex-1 p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                          />
                          <button onClick={handleAddTeacherReward} className="px-4 bg-sage text-white rounded font-bold">Award</button>
                        </div>
                      </div>

                      <div className="p-3 bg-soft-bg dark:bg-[#2f4a3a] rounded-xl space-y-1.5">
                        <h4 className="text-[10px] font-bold uppercase text-sage">Assigned student badges:</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {getStudentData(teacherSelectedStudentId)?.rewards?.map((r, idx) => (
                            <span key={idx} className="bg-soft-bg3 dark:bg-[#335140] text-sage-dark dark:text-white px-2 py-0.5 rounded text-[10px]">
                              {r.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Resources & extras */}
                {activeTab === 't-extras' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column: Attendance & Notes */}
                      <div className="bg-white dark:bg-[#24392c] p-6 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] space-y-4">
                        <div>
                          <h3 className="font-serif text-base font-bold text-sage-dark dark:text-white mb-1">📊 Attendance Adjustment</h3>
                          <div className="flex gap-2 text-xs">
                            <input
                              type="number"
                              value={tAttendancePct}
                              onChange={(e) => setTAttendancePct(Number(e.target.value))}
                              className="p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552] w-20"
                            />
                            <button onClick={handleSaveAttendancePct} className="px-4 py-2 bg-sage hover:bg-sage-dark text-white rounded-lg font-bold">Save %</button>
                          </div>
                        </div>

                        <div className="border-t border-border-soft dark:border-[#4a6552] pt-4 space-y-2">
                          <h3 className="font-serif text-base font-bold text-sage-dark dark:text-white mb-1">🔴 Manual Log Missed Class</h3>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <input
                              type="text"
                              placeholder="YYYY-MM-DD"
                              value={tMissedDate}
                              onChange={(e) => setTMissedDate(e.target.value)}
                              className="p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                            />
                            <select
                              value={tMissedReason}
                              onChange={(e) => setTMissedReason(e.target.value)}
                              className="p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                            >
                              <option value="Student Absent">Student Absent</option>
                              <option value="Teacher Unavailable">Teacher Unavailable</option>
                              <option value="Public Holiday">Public Holiday</option>
                              <option value="Family Emergency">Family Emergency</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <button onClick={handleLogMissedClass} className="w-full py-2 bg-danger hover:opacity-90 text-white rounded-lg text-xs font-bold transition-all">
                            Log Missed Class
                          </button>
                        </div>

                        {/* Read-only self notes preview */}
                        <div className="border-t border-border-soft dark:border-[#4a6552] pt-4 space-y-2">
                          <h3 className="font-serif text-base font-bold text-sage-dark dark:text-white mb-1">📔 Student's Reflection Notes</h3>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {getStudentData(teacherSelectedStudentId)?.selfNotes?.length === 0 ? (
                              <p className="text-xs text-muted">No entries yet.</p>
                            ) : (
                              getStudentData(teacherSelectedStudentId)?.selfNotes?.map((sn, idx) => (
                                <div key={idx} className="p-2.5 bg-soft-bg dark:bg-[#2f4a3a] rounded-lg text-xs">
                                  <p>{sn.text}</p>
                                  <span className="block text-[9px] text-muted dark:text-[#C7D2C4] mt-0.5">{sn.date}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Certificates */}
                      <div className="bg-white dark:bg-[#24392c] p-6 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] space-y-4">
                        {/* Award Milestone Certificates (Advanced Editor) */}
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-serif text-base font-bold text-sage-dark dark:text-white">🏅 Award Certificate Creator</h3>
                            <p className="text-[10px] text-muted dark:text-[#C7D2C4] mb-2">Design, customize and issue a beautiful certificate of achievement to this student.</p>
                          </div>
                          
                          <div className="space-y-2.5 text-xs">
                            <div>
                              <label className="block text-[10px] font-bold text-sage uppercase mb-0.5">Certificate / Milestone Title</label>
                              <input
                                type="text"
                                placeholder="e.g. Completed Makharij-ul-Huroof"
                                value={tCertTitle}
                                onChange={(e) => setTCertTitle(e.target.value)}
                                className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-sage uppercase mb-0.5">Issue Date (YYYY-MM-DD)</label>
                                <input
                                  type="text"
                                  placeholder={new Date().toISOString().split('T')[0]}
                                  value={tCertDate}
                                  onChange={(e) => setTCertDate(e.target.value)}
                                  className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-sage uppercase mb-0.5">Instructor Name</label>
                                <input
                                  type="text"
                                  value={tCertInstructor}
                                  onChange={(e) => setTCertInstructor(e.target.value)}
                                  className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-sage uppercase mb-0.5">Signature Label</label>
                              <input
                                type="text"
                                value={tCertSignature}
                                onChange={(e) => setTCertSignature(e.target.value)}
                                className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-sage uppercase mb-0.5">Custom Prayer / Dua Text</label>
                              <textarea
                                rows={3}
                                value={tCertDua}
                                onChange={(e) => setTCertDua(e.target.value)}
                                className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                              />
                            </div>

                            <button
                              onClick={handleAwardCertificate}
                              className="w-full py-2 bg-sage hover:bg-sage-dark text-white rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>🏅</span> Issue &amp; Award Certificate
                            </button>
                          </div>

                          {/* Issued certificates listing */}
                          <div className="pt-2 border-t border-dashed border-border-soft dark:border-[#4a6552] space-y-1.5 max-h-36 overflow-y-auto">
                            <label className="block text-[10px] font-bold text-sage-dark dark:text-white uppercase mb-1">Issued Certificates ({getStudentData(teacherSelectedStudentId)?.certificates?.length || 0})</label>
                            {getStudentData(teacherSelectedStudentId)?.certificates?.length === 0 ? (
                              <p className="text-[11px] italic text-muted">No certificates awarded yet.</p>
                            ) : (
                              getStudentData(teacherSelectedStudentId)?.certificates?.map((c, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-soft-bg dark:bg-[#2f4a3a] rounded-lg text-xs border border-border-soft dark:border-[#4a6552]">
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-sage-dark dark:text-[#E8ECE7]">🏆 {c.title}</span>
                                    <span className="block text-[9px] text-muted dark:text-[#C7D2C4]">{c.date} (By {c.instructor || 'Sofiya'})</span>
                                  </div>
                                  <button onClick={() => handleDeleteCertificate(idx)} className="text-danger hover:text-red-700 font-bold px-1 text-sm cursor-pointer">✕</button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Integrated Interactive Resources and Tajweed rules editor */}
                    <div className="border-t border-border-soft dark:border-[#4a6552] pt-6">
                      {getStudentData(teacherSelectedStudentId) ? (
                        <Resources
                          studentData={getStudentData(teacherSelectedStudentId)!}
                          isTeacher={true}
                          onUpdate={handleUpdateStudentData}
                        />
                      ) : (
                        <p className="text-xs text-muted dark:text-[#C7D2C4] py-4 bg-white dark:bg-[#24392c] rounded-2xl border text-center">Please select a student to view and edit resources.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Audio & Duas */}
                {activeTab === 't-audios' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Audio lessons */}
                    <div className="bg-white dark:bg-[#24392c] p-6 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] space-y-4">
                      <h3 className="font-serif text-base font-bold text-sage-dark dark:text-white">🎧 Shared Audio Recitations</h3>
                      
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-sage uppercase mb-1">Audio Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Surah Al-Mulk practice"
                            value={tAudioTitle}
                            onChange={(e) => setTAudioTitle(e.target.value)}
                            className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-sage uppercase mb-1">Standard Listen Link</label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={tAudioListen}
                            onChange={(e) => setTAudioListen(e.target.value)}
                            className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-sage uppercase mb-1">Slow Practice Link</label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={tAudioSlow}
                            onChange={(e) => setTAudioSlow(e.target.value)}
                            className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-sage uppercase mb-1">Teacher Repeat link</label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={tAudioRepeat}
                            onChange={(e) => setTAudioRepeat(e.target.value)}
                            className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-sage uppercase mb-1">Download Link</label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={tAudioDownload}
                            onChange={(e) => setTAudioDownload(e.target.value)}
                            className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                          />
                        </div>

                        <button onClick={handleAddAudioLesson} className="w-full py-2 bg-sage hover:bg-sage-dark text-white rounded-lg font-bold">
                          Add Audio Lesson
                        </button>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-border-soft dark:border-[#4a6552] max-h-44 overflow-y-auto">
                        {getStudentData(teacherSelectedStudentId)?.audioLessons?.map((aud, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-soft-bg dark:bg-[#2f4a3a] rounded-lg text-xs">
                            <span>📖 {aud.title}</span>
                            <button onClick={() => handleDeleteAudioLesson(idx)} className="text-danger font-bold">Remove</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shared Duas */}
                    <div className="bg-white dark:bg-[#24392c] p-6 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] space-y-4">
                      <h3 className="font-serif text-base font-bold text-sage-dark dark:text-white">🤲 Share New Supplications / Duas</h3>
                      
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-sage uppercase mb-1">Dua Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Dua for parents"
                            value={tDuaTitle}
                            onChange={(e) => setTDuaTitle(e.target.value)}
                            className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-sage uppercase mb-1">Arabic text / Translation / Transliteration</label>
                          <textarea
                            rows={3}
                            placeholder="Provide full supplication text..."
                            value={tDuaText}
                            onChange={(e) => setTDuaText(e.target.value)}
                            className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                          />
                        </div>

                        <button onClick={handleAddDua} className="w-full py-2 bg-sage hover:bg-sage-dark text-white rounded-lg font-bold">
                          Add Dua Card
                        </button>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-border-soft dark:border-[#4a6552] max-h-44 overflow-y-auto">
                        {getStudentData(teacherSelectedStudentId)?.duas?.map((dua, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-soft-bg dark:bg-[#2f4a3a] rounded-lg text-xs">
                            <span>🤲 {dua.title}</span>
                            <button onClick={() => handleDeleteDua(idx)} className="text-danger font-bold">Remove</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Announcements */}
                {activeTab === 't-announcements' && (
                  <div className="bg-white dark:bg-[#24392c] p-6 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] space-y-4">
                    <h3 className="font-serif text-base font-bold text-sage-dark dark:text-white">📢 Global Board Announcements</h3>
                    
                    <div className="flex gap-2 text-xs">
                      <input
                        type="text"
                        placeholder="e.g. Due to public holiday on Friday, classes are moved to Saturday."
                        value={tAnnouncementText}
                        onChange={(e) => setTAnnouncementText(e.target.value)}
                        className="flex-1 p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                      />
                      <button onClick={handlePostAnnouncement} className="px-4 bg-sage text-white rounded font-bold">Post Announcement</button>
                    </div>

                    <div className="space-y-2 pt-4 max-h-80 overflow-y-auto">
                      {announcements.map((ann, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-soft-bg dark:bg-[#2f4a3a] rounded-xl text-xs">
                          <div>
                            <p className="font-medium leading-relaxed">{ann.text}</p>
                            <span className="text-[10px] text-muted dark:text-[#C7D2C4] mt-1 block">{ann.date}</span>
                          </div>
                          <button onClick={() => handleDeleteAnnouncement(idx)} className="text-danger font-bold px-2">Delete</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Study Planner (Teacher Editor) */}
                {activeTab === 't-planner' && (
                  <div className="space-y-6 animate-fade-in">
                    {getStudentData(teacherSelectedStudentId) ? (
                      <div className="space-y-6">
                        <div className="bg-white dark:bg-[#24392c] p-6 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552]">
                          <h2 className="text-lg font-bold font-serif text-sage-dark dark:text-white mb-1">🗓️ Student Study Planner &amp; Attendance Manager</h2>
                          <p className="text-xs text-muted dark:text-[#C7D2C4]">
                            Click on any date to open the interactive study details editor. You have full editing control over lesson details, focus areas, homework assignments, attendance status, private teacher notes, student/parent comments, audio links, and student performance stars.
                          </p>
                        </div>
                        <Calendar
                          studentId={teacherSelectedStudentId}
                          studentData={getStudentData(teacherSelectedStudentId)!}
                          isTeacher={true}
                          onUpdate={handleUpdateStudentData}
                          key={`${teacherSelectedStudentId}-${tUpdateCounter}`}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted">Please select a student from the dropdown above to view and edit their study planner.</p>
                    )}
                  </div>
                )}

                {/* 6. Add Student */}
                {activeTab === 't-add' && (
                  <div className="bg-white dark:bg-[#24392c] p-6 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] space-y-4 max-w-md mx-auto">
                    <h3 className="font-serif text-base font-bold text-sage-dark dark:text-white">➕ Add New Student Credentials</h3>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-sage uppercase mb-1">Student Full Name</label>
                        <input
                          type="text"
                          placeholder="Aisha Jamil"
                          value={addStuName}
                          onChange={(e) => setAddStuName(e.target.value)}
                          className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-sage uppercase mb-1">Student Account Username</label>
                        <input
                          type="text"
                          placeholder="aisha"
                          value={addStuUser}
                          onChange={(e) => setAddStuUser(e.target.value)}
                          className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-sage uppercase mb-1">Account Password</label>
                        <input
                          type="text"
                          placeholder="Pass123"
                          value={addStuPass}
                          onChange={(e) => setAddStuPass(e.target.value)}
                          className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                        />
                      </div>

                      {addStuMsg && (
                        <p className="text-xs text-center font-bold text-sage dark:text-emerald-200">{addStuMsg}</p>
                      )}

                      <button onClick={handleCreateStudent} className="w-full py-2 bg-sage hover:bg-sage-dark text-white rounded-lg font-bold transition-all">
                        Create Student Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      )}

    </div>
  );
}
