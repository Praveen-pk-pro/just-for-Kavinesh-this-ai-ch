export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp?: string;
  isError?: boolean;
}