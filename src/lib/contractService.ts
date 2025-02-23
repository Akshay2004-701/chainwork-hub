
import { getContract } from './contract';
import { ethers } from 'ethers';
import { taskApi } from './api';

export class ContractService {
  static async createTask(title: string, description: string, deadline: number, bountyAmount: string, category: string, skills: string[], attachments: string[]) {
    const contract = await getContract();
    const bountyInWei = ethers.parseEther(bountyAmount);
    
    // Create task on blockchain
    const tx = await contract.createTask(title, deadline, {
      value: bountyInWei,
    });
    const receipt = await tx.wait();
    
    // Get provider's address - fixed the signer type issue
    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    });
    const provider = accounts[0];
    
    // After successful blockchain transaction, store in MongoDB
    const task = {
      title,
      description,
      bounty: Number(bountyAmount),
      deadline: new Date(deadline * 1000),
      providerId: provider,
      category,
      skills,
      attachments
    };
    
    await taskApi.createTask(task);
    return receipt;
  }

  static async getAllTasks() {
    // Fetch tasks from MongoDB instead of blockchain
    return await taskApi.getAllTasks();
  }

  static async getTask(id: number) {
    // Fetch specific task from MongoDB
    return await taskApi.getTask(id);
  }

  static async getSubmissions(taskId: number) {
    const contract = await getContract();
    return await contract.getSubmissions(taskId);
  }

  static async submitWork(taskId: number, submissionLink: string) {
    const contract = await getContract();
    const tx = await contract.submitWork(taskId, submissionLink);
    return await tx.wait();
  }

  static async approveSubmission(taskId: number, freelancerAddress: string) {
    const contract = await getContract();
    const tx = await contract.approveSubmission(taskId, [freelancerAddress]);
    
    // Update task status in MongoDB after successful blockchain transaction
    await tx.wait();
    await taskApi.completeTask(taskId);
    
    return tx;
  }

  static async cancelTask(taskId: number) {
    const contract = await getContract();
    const tx = await contract.cancelTask(taskId);
    
    // Update task status in MongoDB after successful blockchain transaction
    await tx.wait();
    await taskApi.cancelTask(taskId);
    
    return tx;
  }
}
