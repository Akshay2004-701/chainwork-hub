
import { getContract, switchToElectroneum } from './contract';
import { ethers } from 'ethers';

export class ContractService {
  static async createTask(title: string, description: string, deadline: number, bountyAmount: string) {
    const contract = await getContract();
    const bountyInWei = ethers.parseEther(bountyAmount);
    const tx = await contract.createTask(title, description, deadline, {
      value: bountyInWei,
    });
    return await tx.wait();
  }

  static async getAllTasks() {
    const contract = await getContract();
    const counter = await contract.getCounter();
    const taskPromises = [];

    for (let i = 1; i <= counter; i++) {
      taskPromises.push(contract.getTask(i));
    }

    return await Promise.all(taskPromises);
  }

  static async getTask(id: number) {
    const contract = await getContract();
    return await contract.getTask(id);
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
    return await tx.wait();
  }

  static async cancelTask(taskId: number) {
    const contract = await getContract();
    const tx = await contract.cancelTask(taskId);
    return await tx.wait();
  }

  static async extendDeadline(taskId: number, newDeadline: number) {
    const contract = await getContract();
    const tx = await contract.extendDeadline(taskId, newDeadline);
    return await tx.wait();
  }

  static async claimRefundAfterDeadline(taskId: number) {
    const contract = await getContract();
    const tx = await contract.claimRefundAfterDeadline(taskId);
    return await tx.wait();
  }

  static async getHeldBounty(taskId: number) {
    const contract = await getContract();
    return await contract.getHeldBounty(taskId);
  }
}
