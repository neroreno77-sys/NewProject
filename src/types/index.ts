export interface User {
  id: string;
  name: string;
  password: string;
  role: 'Admin' | 'TU' | 'Koordinator' | 'Staff';
}

export interface Report {
  id: string;
  noSurat: string;
  hal: string;
  dari: string;
  tanggalSurat: string;
  tanggalAgenda: string;
  noAgenda: string;
  kelompokAsalSurat: string;
  agendaSestama: string;
  sifat: string[];
  derajat: string[];
  files: FileUpload[];
  status: 'draft' | 'forwarded' | 'assigned' | 'in-progress' | 'completed' | 'revision';
  createdBy: string;
  createdAt: string;
  forwardedTo: string[];
  currentAssignee?: string;
  timeline: TimelineEntry[];
}

export interface Task {
  id: string;
  reportId: string;
  assignedTo: string[];
  assignedBy: string;
  todoList: string[];
  catatan: string;
  catatanRevisi?: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'approved' | 'revision';
  assignedAt: string;
  completedAt?: string;
  submittedAt?: string;
}

export interface FileUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface TimelineEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}