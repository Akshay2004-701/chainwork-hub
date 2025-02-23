import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// Types
interface Task {
    id: number;
    title: string;
    description: string;
    bounty: number;
    deadline: string;
    providerId: string;
    createdAt: string;
    category: string;
    skills: string[];
    attachments: string[];
    isCompleted: boolean;
    isCancelled: boolean;
}

interface UserProfile {
    walletAddress: string;
    username: string;
    bio?: string;
    resumeUrl?: string;
    role: 'TASK_PROVIDER' | 'FREELANCER';
    reputationScore: number;
    totalEarnings: number;
    totalSpent: number;
    createdAt: string;
}

// Task Functions
export const taskApi = {
    async createTask(task: Omit<Task, 'id' | 'createdAt' | 'isCompleted' | 'isCancelled'>) {
        const response = await axios.post(`${BASE_URL}/tasks`, task);
        return response.data;
    },

    async getTask(id: number) {
        const response = await axios.get(`${BASE_URL}/tasks/${id}`);
        return response.data;
    },

    async updateTask(id: number, task: Task) {
        const response = await axios.put(`${BASE_URL}/tasks/${id}`, task);
        return response.data;
    },

    async deleteTask(id: number) {
        await axios.delete(`${BASE_URL}/tasks/${id}`);
    },

    async getAllTasks() {
        const response = await axios.get(`${BASE_URL}/tasks`);
        return response.data;
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

// User Profile Functions
export const userApi = {
    async createProfile(profile: Omit<UserProfile, 'createdAt'>) {
        const response = await axios.post(`${BASE_URL}/users`, profile);
        return response.data;
    },

    async getProfile(walletAddress: string) {
        const response = await axios.get(`${BASE_URL}/users/${walletAddress}`);
        return response.data;
    },

    async updateProfile(walletAddress: string, profile: UserProfile) {
        const response = await axios.put(`${BASE_URL}/users/${walletAddress}`, profile);
        return response.data;
    },

    async deleteProfile(walletAddress: string) {
        await axios.delete(`${BASE_URL}/users/${walletAddress}`);
    },

    async getAllProfiles() {
        const response = await axios.get(`${BASE_URL}/users`);
        return response.data;
    },

    async updateReputation(walletAddress: string, delta: number) {
        const response = await axios.post(
            `${BASE_URL}/users/${walletAddress}/reputation?delta=${delta}`
        );
        return response.data;
    },

    async addEarnings(walletAddress: string, earnings: number) {
        const response = await axios.post(
            `${BASE_URL}/users/${walletAddress}/earnings?earnings=${earnings}`
        );
        return response.data;
    },

    async addSpent(walletAddress: string, spent: number) {
        const response = await axios.post(
            `${BASE_URL}/users/${walletAddress}/spent?spent=${spent}`
        );
        return response.data;
    }
}; 

// (async () => {
//     const taskId = 1; // Replace with the desired task ID
//     try {
//         const task = await taskApi.getTask(taskId);
//         console.log(task);
//     } catch (error) {
//         console.error('Error fetching task:', error);
//     }
// })();