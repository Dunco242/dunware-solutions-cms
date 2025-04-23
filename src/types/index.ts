export interface Module {
  id: string;
  name: string;
  icon: string;
  description: string;
  route: string;
  enabled: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  permissions: string[];
}

export interface SidebarItem {
  id: string;
  name: string;
  icon: string;
  route: string;
  children?: SidebarItem[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

// CRM Types
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: Company;
  title: string;
  status: 'active' | 'inactive';
  source: string;
  assignedTo: User;
  lastContactedAt: string;
  tags: string[];
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  revenue: number;
  website: string;
  address: Address;
  contacts: Contact[];
  deals: Deal[];
  status: 'lead' | 'customer' | 'partner';
  assignedTo: User;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  name: string;
  value: number;
  currency: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: string;
  company: Company;
  contacts: Contact[];
  products: Product[];
  activities: Activity[];
  notes: Note[];
  assignedTo: User;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  subject: string;
  description: string;
  status: 'planned' | 'completed' | 'cancelled';
  dueDate: string;
  completedAt?: string;
  relatedTo: {
    type: 'contact' | 'company' | 'deal';
    id: string;
  };
  assignedTo: User;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  content: string;
  relatedTo: {
    type: 'contact' | 'company' | 'deal';
    id: string;
  };
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Document Types
export interface Document {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  size: number;
  type: string;
  version: number;
  versions: DocumentVersion[];
  permissions: DocumentPermission[];
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  retentionPeriod?: number;
  encryptionStatus: 'encrypted' | 'unencrypted';
  accessLog: DocumentAccess[];
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  fileUrl: string;
  createdBy: User;
  createdAt: string;
  changes: string;
}

export interface DocumentPermission {
  id: string;
  documentId: string;
  userId: string;
  role: 'viewer' | 'editor' | 'owner';
  createdAt: string;
}

export interface DocumentAccess {
  id: string;
  documentId: string;
  userId: string;
  action: 'view' | 'edit' | 'download' | 'share';
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  team: User[];
  tasks: Task[];
  milestones: Milestone[];
  analytics: ProjectAnalytics;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo: User[];
  startDate: string;
  dueDate: string;
  completedAt?: string;
  dependencies: string[];
  timeTracking: TimeEntry[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'delayed';
  tasks: Task[];
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  description: string;
}

export interface ProjectAnalytics {
  timeTracking: {
    planned: number;
    actual: number;
    remaining: number;
  };
  costs: {
    planned: number;
    actual: number;
    remaining: number;
  };
  progress: {
    tasks: {
      total: number;
      completed: number;
      overdue: number;
    };
    milestones: {
      total: number;
      completed: number;
      overdue: number;
    };
  };
  team: {
    utilization: Record<string, number>;
    performance: Record<string, number>;
  };
}

// Route Types
export interface Route {
  id: string;
  name: string;
  description: string;
  startLocation: Location;
  endLocation: Location;
  stops: RouteStop[];
  status: 'planned' | 'in-progress' | 'completed';
  assignedTo: User;
  date: string;
  optimizationStatus: 'not-optimized' | 'optimizing' | 'optimized';
  estimatedDuration: number;
  actualDuration?: number;
  distance: number;
  analytics: RouteAnalytics;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  type: 'business' | 'residential' | 'industrial';
  accessNotes?: string;
}

export interface RouteStop {
  id: string;
  location: Location;
  order: number;
  estimatedTime: string;
  actualTime?: string;
  status: 'pending' | 'completed' | 'skipped';
  serviceType: string;
  duration: number;
  customer: Contact;
  notes: string[];
}

export interface RouteAnalytics {
  efficiency: number;
  onTimePerformance: number;
  fuelConsumption: number;
  customerSatisfaction: number;
  delays: {
    count: number;
    averageDuration: number;
    reasons: Record<string, number>;
  };
}

// Email Types
export interface Email {
  id: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  body: string;
  attachments: Attachment[];
  timestamp: string;
  read: boolean;
  starred: boolean;
  labels: string[];
  thread: string;
  importance: 'low' | 'normal' | 'high';
  category: 'primary' | 'social' | 'promotions' | 'updates';
  securityStatus: {
    encrypted: boolean;
    signed: boolean;
    spamScore: number;
  };
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  scanStatus: 'pending' | 'clean' | 'infected';
}

// Chat Types
export interface ChatMessage {
  id: string;
  sender: User;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: Attachment[];
  reactions?: MessageReaction[];
  thread?: string;
  edited: boolean;
  mentions: string[];
}

export interface ChatSession {
  id: string;
  participants: User[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
  createdAt: string;
  settings: ChatSessionSettings;
}

export interface MessageReaction {
  emoji: string;
  users: string[];
}

export interface ChatSessionSettings {
  notifications: boolean;
  retention: number;
  encryption: boolean;
}

// Video Meeting Types
export interface VideoMeeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  duration: number;
  host: User;
  participants: User[];
  status: 'scheduled' | 'in-progress' | 'completed';
  recordingUrl?: string;
  settings: VideoSettings;
  analytics: VideoAnalytics;
}

export interface VideoSettings {
  recording: boolean;
  chat: boolean;
  screenSharing: boolean;
  participantControl: boolean;
  waitingRoom: boolean;
  quality: 'auto' | 'low' | 'medium' | 'high';
}

export interface VideoAnalytics {
  duration: number;
  participantCount: number;
  averageQuality: number;
  networkStats: {
    latency: number;
    packetLoss: number;
  };
  participantStats: Record<string, ParticipantStats>;
}

export interface ParticipantStats {
  joinTime: string;
  leaveTime?: string;
  duration: number;
  speaking: number;
  videoEnabled: number;
  audioEnabled: number;
}