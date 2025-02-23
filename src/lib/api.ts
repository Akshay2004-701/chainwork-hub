
import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// Types
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

// Task Functions
export const taskApi = {
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'isCompleted' | 'isCancelled'>) {
    const response = await axios.post(`${BASE_URL}/tasks`, task);
    return response.data;
  },

  async getTask(id: number) {
    const response = await axios.get<Task>(`${BASE_URL}/tasks/${id}`);
    return response.data;
  },

  async getAllTasks() {
    const response = await axios.get<Task[]>(`${BASE_URL}/tasks`);
    return response.data;
  },

  async updateTask(id: number, task: Partial<Task>) {
    const response = await axios.put(`${BASE_URL}/tasks/${id}`, task);
    return response.data;
  },

  async deleteTask(id: number) {
    await axios.delete(`${BASE_URL}/tasks/${id}`);
  },

  async cancelTask(id: number) {
    const response = await axios.post(`${BASE_URL}/tasks/${id}/cancel`);
    return response.data;
  },

  async completeTask(id: number) {
    const response = await axios.post(`${BASE_URL}/tasks/${id}/complete`);
    return response.data;
  }
};
