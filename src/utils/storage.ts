import { User, Report, Task } from '../types';

const STORAGE_KEYS = {
  USERS: 'workflow_users',
  REPORTS: 'workflow_reports',
  TASKS: 'workflow_tasks',
  CURRENT_USER: 'workflow_current_user'
};

// Default staff list
export const STAFF_LIST = [
  'Roza Erlinda',
  'Ahmad Syafrudin',
  'Bambang Sudirman',
  'Citra Dewi',
  'Dedi Irawan',
  'Eka Sari',
  'Fajar Nugroho',
  'Gita Permana',
  'Hadi Santoso',
  'Indra Kusuma',
  'Joko Widodo',
  'Kartika Sari',
  'Lukman Hakim',
  'Maya Putri',
  'Nanda Pratama',
  'Oktavia Ningsih',
  'Pandu Wijaya',
  'Qori Amalia',
  'Rizki Ramadan',
  'Sinta Maharani',
  'Taufik Hidayat',
  'Umi Kalsum',
  'Vina Melati',
  'Dede Winarta Putra'
];

// Default koordinator list
export const KOORDINATOR_LIST = [
  'Suwati, S.h',
  'Achamd Evianto',
  'Adi Sulaksono',
  'Yosi Yosandi'
];

// Default todo list items
export const TODO_LIST_ITEMS = [
  'Jadwalkan/Agendakan',
  'Bahas dengan saya',
  'Untuk ditindaklanjuti',
  'Untuk diperhatikan',
  'Untuk diketahui',
  'Untuk ditelaah',
  'Untuk dipelajari',
  'Untuk dikoordinasikan',
  'Untuk diselesaikan',
  'Untuk dilaksanakan'
];

export const initializeData = () => {
  // Initialize users if not exists
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers: User[] = [
      { id: '1', name: 'Admin', password: 'admin123', role: 'Admin' },
      { id: '2', name: 'TU User', password: 'tu123', role: 'TU' },
      { id: '3', name: 'Suwati, S.h', password: 'koordinator123', role: 'Koordinator' },
      { id: '4', name: 'Roza Erlinda', password: 'staff123', role: 'Staff' }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  // Initialize reports if not exists
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
  }

  // Initialize tasks if not exists
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
  }
};

export const getUsers = (): User[] => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getReports = (): Report[] => {
  const reports = localStorage.getItem(STORAGE_KEYS.REPORTS);
  return reports ? JSON.parse(reports) : [];
};

export const saveReports = (reports: Report[]) => {
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
};

export const getTasks = (): Task[] => {
  const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
  return tasks ? JSON.parse(tasks) : [];
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

export const clearCurrentUser = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};