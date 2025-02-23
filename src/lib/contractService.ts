
import { getContract } from './contract';
import { ethers } from 'ethers';
import { Task } from '@/types/task';
import { supabase } from "@/integrations/supabase/client";

export class ContractService {
  static async createTask(title: string, description: string, deadline: number, bountyAmount: string, category: string, skills: string[] = [], attachments: string[] = []) {
    const contract = await getContract();
    const bountyInWei = ethers.parseEther(bountyAmount);
    
    // Create task on blockchain
    const tx = await contract.createTask(title, deadline, {
      value: bountyInWei,
    });
    const receipt = await tx.wait();
    
    // Get provider's address
    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    });
    const providerId = accounts[0];
    
    // After successful blockchain transaction, store in Supabase
    const { error } = await supabase
      .from('Task')
      .insert({
        title,
        description,
        bounty: Number(bountyAmount),
        deadline: new Date(deadline * 1000),
        providerId,
        category,
        skills,
        attachments,
        createdAt: new Date(),
        isCompleted: false,
        isCancelled: false
      });

    if (error) throw error;
    return receipt;
  }

  static async getAllTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('Task')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data.map(task => ({
      ...task,
      deadline: new Date(task.deadline),
      createdAt: new Date(task.createdAt)
    }));
  }

  static async getTask(id: number): Promise<Task> {
    const { data, error } = await supabase
      .from('Task')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return {
      ...data,
      deadline: new Date(data.deadline),
      createdAt: new Date(data.createdAt)
    };
  }

  static async approveSubmission(taskId: number, freelancerAddress: string) {
    const contract = await getContract();
    const tx = await contract.approveSubmission(taskId, [freelancerAddress]);
    await tx.wait();
    
    // Update task status in Supabase
    const { error } = await supabase
      .from('Task')
      .update({ isCompleted: true })
      .eq('id', taskId);

    if (error) throw error;
    return tx;
  }

  static async cancelTask(taskId: number) {
    const contract = await getContract();
    const tx = await contract.cancelTask(taskId);
    await tx.wait();
    
    // Update task status in Supabase
    const { error } = await supabase
      .from('Task')
      .update({ isCancelled: true })
      .eq('id', taskId);

    if (error) throw error;
    return tx;
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
}
