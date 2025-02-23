
import axios from 'axios';

const BASE_URL = '/api'; // This will be proxied through Vite's development server

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

export interface Submission {
  subId: string;
  taskId: number;
  freelancer: string;
  submissionLink: string;
  isApproved: boolean;
  review?: string;
}

export const api = {
  // Task endpoints
  createTask: async (task: Task) => {
    const response = await axios.post(`${BASE_URL}/tasks`, task);
    return response.data;
  },

  getTask: async (id: number) => {
    const response = await axios.get<Task>(`${BASE_URL}/tasks/${id}`);
    return response.data;
  },

  getAllTasks: async () => {
    const response = await axios.get<Task[]>(`${BASE_URL}/tasks`);
    return response.data;
  },

  updateTask: async (id: number, task: Task) => {
    const response = await axios.put(`${BASE_URL}/tasks/${id}`, task);
    return response.data;
  },

  cancelTask: async (id: number) => {
    const response = await axios.post(`${BASE_URL}/tasks/${id}/cancel`);
    return response.data;
  },

  completeTask: async (id: number) => {
    const response = await axios.post(`${BASE_URL}/tasks/${id}/complete`);
    return response.data;
  },

  // Submission endpoints
  createSubmission: async (submission: Submission) => {
    const response = await axios.post(`${BASE_URL}/submissions`, submission);
    return response.data;
  },

  getSubmissionsByTaskId: async (taskId: number) => {
    const response = await axios.get<Submission[]>(`${BASE_URL}/submissions/task/${taskId}`);
    return response.data;
  },

  approveSubmission: async (submissionId: string) => {
    const response = await axios.post(`${BASE_URL}/submissions/${submissionId}/approve`);
    return response.data;
  }
};
