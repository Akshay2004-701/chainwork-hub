
export interface Task {
  id: number;
  title: string;
  description: string;
  bounty: number;
  deadline: Date;
  providerId: string;
  createdAt: Date;
  category: string;
  skills: string[];
  attachments: string[];
  isCompleted: boolean;
  isCancelled: boolean;
}
