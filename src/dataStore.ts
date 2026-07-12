import { User, StudentData, Announcement } from './types';
import logoImg from './assets/images/quran_portal_logo_1783813508046.jpg';
import { db } from './firebase';
import { doc, setDoc, collection, onSnapshot, getDocs, getDocFromServer } from 'firebase/firestore';

export const LOGO_DATA_URI = logoImg;

export function seedDataIfEmpty() {
  if (localStorage.getItem('tb_users')) return;

  const users: User[] = [
    { id: 't1', username: 'teacher', password: 'teacher123', role: 'teacher', name: 'Ustadha' },
    { id: 's1', username: 'aisha', password: 'aisha123', role: 'student', name: 'Aisha' },
    { id: 's2', username: 'yusuf', password: 'yusuf123', role: 'student', name: 'Yusuf' }
  ];
  localStorage.setItem('tb_users', JSON.stringify(users));

  const aishaData: StudentData = {
    surah: 'Surah Al-Mulk, Ayah 1-10',
    goal: 'Memorize Surah Al-Mulk by end of month',
    progress: 65,
    age: 10,
    level: 'Reading Fluency Improvement',
    surahsCompleted: 4,
    homework: [
      { text: 'Recite Surah Al-Mulk with Tajweed 3x', done: false },
      { text: 'Revise Makharij chart', done: true }
    ],
    rewards: [
      { text: '🌟 5-day streak', date: '2026-06-25' },
      { text: '📖 Completed Juz Amma', date: '2026-06-29' }
    ],
    parentNotes: [
      { text: 'Aisha recited beautifully this week, keep encouraging daily practice at home.', date: '2026-06-28' }
    ],
    teacherNotes: [
      { text: 'Focus more on Qalqalah letters next class.', date: '2026-06-30' }
    ],
    dua: 'Rabbi zidni ilma — "My Lord, increase me in knowledge." (Surah Taha 20:114)',
    parentCornerEnabled: true,
    attendance: 95,
    missedClasses: [{ date: '2026-06-15', reason: 'Family trip' }],
    tajweedRules: [
      { name: 'Noon Sakinah & Tanween', learned: true },
      { name: 'Qalqalah', learned: true },
      { name: 'Idgham', learned: false },
      { name: 'Madd Rules', learned: false }
    ],
    resources: [
      { category: 'Qaidah', fileType: 'PDF', title: 'Makharij Chart (PDF)', url: 'https://example.com/makharij-chart.pdf', description: 'Visual mapping of makharij points.', addedDate: '2026-06-10' },
      { category: 'Games', fileType: 'Website', title: 'Surah Al-Mulk Recitation Game', url: 'https://example.com/surah-al-mulk', description: 'Interactive game to test memorisation.', addedDate: '2026-06-12' },
      { category: 'Islamic Studies', fileType: 'PDF', title: 'Stories of the Prophets (PDF)', url: 'https://example.com/prophets-stories.pdf', description: 'Simplified illustrated stories.', addedDate: '2026-06-14' },
      { category: 'Assignments', fileType: 'Other', title: 'Juz Amma Practice Quiz', url: 'https://example.com/juz-amma-quiz', description: 'Formative multiple-choice questions.', addedDate: '2026-06-16' }
    ],
    classLink: 'https://zoom.us/j/example',
    classTimings: 'Mon, Wed, Fri — 5:00 PM',
    recurringDays: [1, 3, 5],
    recurringTime: '5:00 PM',
    recurringTopic: 'Surah Al-Mulk',
    cancelledDates: [],
    audioLessons: [
      { title: 'Surah Al-Mulk', listenUrl: 'https://example.com/audio/al-mulk-full.mp3', slowUrl: 'https://example.com/audio/al-mulk-slow.mp3', repeatUrl: 'https://example.com/audio/al-mulk-repeat.mp3', downloadUrl: 'https://example.com/audio/al-mulk-full.mp3' }
    ],
    duas: [
      { title: 'Dua for Knowledge', text: 'Rabbi zidni ilma — "My Lord, increase me in knowledge." (Surah Taha 20:114)' },
      { title: 'Dua Before Reciting Quran', text: 'A\'udhu billahi minash-shaytanir-rajim — "I seek refuge in Allah from Satan, the accursed."' }
    ],
    monthlyPlan: {
      '2026-07': {
        days: {},
        goals: [],
        mainGoal: { text: 'Complete Surah Al-Adiyat before the end of July.', completed: false }
      }
    },
    calendarEvents: {
      '2026-07-01': { status: 'completed', lesson: 'Surah Al-Mulk, Ayah 1-5', focusArea: 'Applying Madd Waw correctly', homework: { text: 'Recite Ayah 1-5 three times', dueDate: '2026-07-03', completed: true }, audio: 'https://example.com/audio/july1.mp3', teacherNote: 'Good tajweed control today.', parentNote: 'Excellent participation today.', reason: '', notes: '', excellent: true },
      '2026-07-03': { status: 'missed', lesson: '', focusArea: '', homework: null, audio: '', teacherNote: '', parentNote: '', reason: 'Student Absent', notes: 'Family was travelling, will make up next session.', excellent: false },
      '2026-07-06': { status: 'rescheduled', lesson: '', focusArea: '', homework: null, audio: '', teacherNote: 'Moved to Thursday due to public holiday.', parentNote: '', reason: '', notes: '', excellent: false },
      '2026-07-08': { status: 'completed', lesson: 'Surah Al-Adiyat, Ayah 1-6', focusArea: 'Reading smoothly without frequent pauses', homework: { text: 'Practice Ayah 1-6 daily', dueDate: '2026-07-10', completed: false }, audio: 'https://example.com/audio/july8.mp3', teacherNote: '', parentNote: 'Keep listening to today\'s audio.', reason: '', notes: '', excellent: false }
    },
    assignments: [
      { id: 'a1', text: 'Revise Makharij chart', completed: false, addedDate: '2026-07-07' },
      { id: 'a2', text: 'Listen to Surah Al-Mulk recording', completed: true, addedDate: '2026-07-05' }
    ],
    weeklyPlan: {
      '2026-W28': {
        goals: [
          { text: 'Read smoothly without frequent pauses', done: false },
          { text: 'Practise Madd Waw', done: true },
          { text: 'Listen to today\'s audio every day', done: false },
          { text: 'Memorise five new verses', done: false }
        ]
      }
    },
    photo: '',
    resourceCategories: ['Quran', 'Tajweed', 'Islamic Studies', 'Arabic', 'Revision', 'Assignments', 'Games', 'Videos', 'Qaidah', 'Worksheets'],
    selfNotes: [],
    certificates: []
  };

  const yusufData: StudentData = {
    surah: 'Surah Al-Baqarah, Ayah 1-5',
    goal: 'Perfect Tajweed of Idgham rules',
    progress: 40,
    age: 9,
    level: 'Qaida Nooraniyah',
    surahsCompleted: 1,
    homework: [
      { text: 'Practice Idgham examples worksheet', done: false }
    ],
    rewards: [
      { text: '🌟 3-day streak', date: '2026-06-30' }
    ],
    parentNotes: [],
    teacherNotes: [
      { text: 'Needs more practice with Noon Sakinah rules.', date: '2026-06-29' }
    ],
    dua: 'Rabbi zidni ilma — "My Lord, increase me in knowledge." (Surah Taha 20:114)',
    parentCornerEnabled: false,
    attendance: 88,
    missedClasses: [],
    tajweedRules: [
      { name: 'Noon Sakinah & Tanween', learned: false },
      { name: 'Qalqalah', learned: false }
    ],
    resources: [],
    classLink: '',
    classTimings: 'Tue, Thu — 4:00 PM',
    recurringDays: [2, 4],
    recurringTime: '4:00 PM',
    recurringTopic: 'Qaida Nooraniyah',
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

  localStorage.setItem('tb_data_s1', JSON.stringify(aishaData));
  localStorage.setItem('tb_data_s2', JSON.stringify(yusufData));
}

export function getUsers(): User[] {
  seedDataIfEmpty();
  const raw = localStorage.getItem('tb_users');
  return raw ? JSON.parse(raw) : [];
}

export function saveUsers(users: User[]) {
  localStorage.setItem('tb_users', JSON.stringify(users));
  users.forEach(user => {
    setDoc(doc(db, 'users', user.id), user).catch(err => console.error('Error saving user to Firestore:', err));
  });
}

export function getStudentData(id: string): StudentData | null {
  seedDataIfEmpty();
  const raw = localStorage.getItem('tb_data_' + id);
  if (!raw) return null;
  
  const parsed = JSON.parse(raw);
  
  // Fill missing fields (fallback for consistency)
  const defaults = {
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

  let modified = false;
  Object.keys(defaults).forEach((key) => {
    if (!(key in parsed)) {
      (parsed as any)[key] = (defaults as any)[key];
      modified = true;
    }
  });

  if (modified) {
    saveStudentData(id, parsed);
  }

  return parsed;
}

export function saveStudentData(id: string, data: StudentData) {
  localStorage.setItem('tb_data_' + id, JSON.stringify(data));
  setDoc(doc(db, 'studentData', id), data).catch(err => console.error('Error saving student data to Firestore:', err));
}

export function getSession(): string | null {
  return localStorage.getItem('tb_session');
}

export function setSession(id: string) {
  localStorage.setItem('tb_session', id);
}

export function clearSession() {
  localStorage.removeItem('tb_session');
}

export function getAnnouncements(): Announcement[] {
  const raw = localStorage.getItem('tb_announcements');
  return raw ? JSON.parse(raw) : [];
}

export function saveAnnouncements(announcements: Announcement[]) {
  localStorage.setItem('tb_announcements', JSON.stringify(announcements));
  setDoc(doc(db, 'globalConfig', 'announcements'), { list: announcements }).catch(err => console.error('Error saving announcements to Firestore:', err));
}

const DEFAULT_CERTIFICATE_DUA = 'We ask Allah (SWT) to make this knowledge beneficial for them, to make it a light in their heart, a source of success in their actions, and to elevate their status and the status of their parents in this world and the Hereafter.';

export function getCertificateDuaText(): string {
  return localStorage.getItem('tb_certificateDua') || DEFAULT_CERTIFICATE_DUA;
}

export function saveCertificateDuaText(text: string) {
  localStorage.setItem('tb_certificateDua', text);
  setDoc(doc(db, 'globalConfig', 'certificateDua'), { text }).catch(err => console.error('Error saving certificate dua to Firestore:', err));
}

let isSyncInitialized = false;

export function initFirebaseSync(onUpdate: () => void) {
  if (isSyncInitialized) return;
  isSyncInitialized = true;

  // Verify connection to Firestore on startup
  async function testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  }
  testConnection();

  // Ensure local storage has seed data in case it's a completely new environment
  seedDataIfEmpty();

  const usersCol = collection(db, 'users');
  getDocs(usersCol).then((snapshot) => {
    if (snapshot.empty) {
      console.log('Firestore is empty. Seeding default data from localStorage to Firestore...');
      // 1. Seed users
      const localUsers = getUsers();
      localUsers.forEach(user => {
        setDoc(doc(db, 'users', user.id), user);
      });

      // 2. Seed student data
      localUsers.forEach(user => {
        if (user.role === 'student') {
          const sData = getStudentData(user.id);
          if (sData) {
            setDoc(doc(db, 'studentData', user.id), sData);
          }
        }
      });

      // 3. Seed announcements
      const localAnnouncements = getAnnouncements();
      setDoc(doc(db, 'globalConfig', 'announcements'), { list: localAnnouncements });

      // 4. Seed certificate Dua
      const localDua = getCertificateDuaText();
      setDoc(doc(db, 'globalConfig', 'certificateDua'), { text: localDua });
    }
  }).catch((err) => {
    console.error('Error checking users collection for seeding:', err);
  });

  // Listen for changes on users
  onSnapshot(collection(db, 'users'), (snapshot) => {
    if (snapshot.empty) return;
    const users: User[] = [];
    snapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });
    localStorage.setItem('tb_users', JSON.stringify(users));
    onUpdate();
  });

  // Listen for changes on studentData
  onSnapshot(collection(db, 'studentData'), (snapshot) => {
    snapshot.forEach((doc) => {
      localStorage.setItem('tb_data_' + doc.id, JSON.stringify(doc.data()));
    });
    onUpdate();
  });

  // Listen for changes on announcements
  onSnapshot(doc(db, 'globalConfig', 'announcements'), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      localStorage.setItem('tb_announcements', JSON.stringify(data.list || []));
      onUpdate();
    }
  });

  // Listen for changes on certificateDua
  onSnapshot(doc(db, 'globalConfig', 'certificateDua'), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      localStorage.setItem('tb_certificateDua', data.text || '');
      onUpdate();
    }
  });
}
