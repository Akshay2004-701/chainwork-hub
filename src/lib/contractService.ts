
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
      .insert([{
        title,
        description,
        bounty: Number(bountyAmount),
        deadline: new Date(deadline * 1000).toISOString(),
        providerId,
        category,
        skills: JSON.stringify(skills),
        attachments: JSON.stringify(attachments),
        createdAt: new Date().toISOString(),
        isCompleted: false,
        isCancelled: false
      }]);

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
      id: Number(task.id),
      title: task.title || '',
      description: task.description || '',
      bounty: Number(task.bounty) || 0,
      deadline: new Date(task.deadline || ''),
      providerId: task.providerId || '',
      createdAt: new Date(task.createdAt || ''),
      category: task.category || '',
      skills: task.skills ? JSON.parse(task.skills) : [],
      attachments: task.attachments ? JSON.parse(task.attachments) : [],
      isCompleted: Boolean(task.isCompleted),
      isCancelled: Boolean(task.isCancelled)
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
      id: Number(data.id),
      title: data.title || '',
      description: data.description || '',
      bounty: Number(data.bounty) || 0,
      deadline: new Date(data.deadline || ''),
      providerId: data.providerId || '',
      createdAt: new Date(data.createdAt || ''),
      category: data.category || '',
      skills: data.skills ? JSON.parse(data.skills) : [],
      attachments: data.attachments ? JSON.parse(data.attachments) : [],
      isCompleted: Boolean(data.isCompleted),
      isCancelled: Boolean(data.isCancelled)
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
