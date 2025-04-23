import { createClient } from '@supabase/supabase-js';
import { Project, Task, Milestone, Risk, TimeEntry, Report, Budget, ChangeRequest } from '../types';

class ProjectService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  // Project Management
  async createProject(project: Omit<Project, 'id'>) {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async getProject(id: string) {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select(`
          *,
          tasks:project_tasks(*),
          milestones:project_milestones(*),
          risks:project_risks(*),
          budgets:project_budgets(*),
          team_members:project_team_members(
            *,
            user:auth.users(*)
          ),
          reports:project_reports(*),
          change_requests:project_change_requests(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting project:', error);
      throw error;
    }
  }

  async updateProject(id: string, updates: Partial<Project>) {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Task Management
  async createTask(task: Omit<Task, 'id'>) {
    try {
      const { data, error } = await this.supabase
        .from('project_tasks')
        .insert(task)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(id: string, updates: Partial<Task>) {
    try {
      const { data, error } = await this.supabase
        .from('project_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Time Tracking
  async logTime(entry: Omit<TimeEntry, 'id'>) {
    try {
      const { data, error } = await this.supabase
        .from('project_time_entries')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging time:', error);
      throw error;
    }
  }

  async getTimeEntries(projectId: string, filters?: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    billable?: boolean;
  }) {
    try {
      let query = this.supabase
        .from('project_time_entries')
        .select(`
          *,
          user:auth.users!user_id(*),
          task:project_tasks(*)
        `)
        .eq('project_id', projectId);

      if (filters) {
        if (filters.userId) {
          query = query.eq('user_id', filters.userId);
        }
        if (filters.startDate) {
          query = query.gte('date', filters.startDate.toISOString());
        }
        if (filters.endDate) {
          query = query.lte('date', filters.endDate.toISOString());
        }
        if (filters.billable !== undefined) {
          query = query.eq('billable', filters.billable);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting time entries:', error);
      throw error;
    }
  }

  // Risk Management
  async createRisk(risk: Omit<Risk, 'id'>) {
    try {
      const { data, error } = await this.supabase
        .from('project_risks')
        .insert(risk)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating risk:', error);
      throw error;
    }
  }

  async updateRisk(id: string, updates: Partial<Risk>) {
    try {
      const { data, error } = await this.supabase
        .from('project_risks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating risk:', error);
      throw error;
    }
  }

  // Budget Management
  async createBudget(budget: Omit<Budget, 'id'>) {
    try {
      const { data, error } = await this.supabase
        .from('project_budgets')
        .insert(budget)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }

  async updateBudget(id: string, updates: Partial<Budget>) {
    try {
      const { data, error } = await this.supabase
        .from('project_budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  // Team Management
  async addTeamMember(projectId: string, userId: string, role: string) {
    try {
      const { data, error } = await this.supabase
        .from('project_team_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          role,
        })
        .select()
        .single();

      if (error) throw error;

      // Update project team members array
      await this.supabase
        .from('projects')
        .update({
          team_members: this.supabase.sql`array_append(team_members, ${userId})`
        })
        .eq('id', projectId);

      return data;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  }

  async updateTeamMember(id: string, updates: {
    role?: string;
    allocation_percentage?: number;
    billing_rate?: number;
    status?: string;
  }) {
    try {
      const { data, error } = await this.supabase
        .from('project_team_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  }

  // Reports
  async createReport(report: Omit<Report, 'id'>) {
    try {
      const { data, error } = await this.supabase
        .from('project_reports')
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  async approveReport(id: string, approverId: string) {
    try {
      const { data, error } = await this.supabase
        .from('project_reports')
        .update({
          status: 'approved',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error approving report:', error);
      throw error;
    }
  }

  // Change Management
  async createChangeRequest(change: Omit<ChangeRequest, 'id'>) {
    try {
      const { data, error } = await this.supabase
        .from('project_change_requests')
        .insert(change)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating change request:', error);
      throw error;
    }
  }

  async updateChangeRequest(id: string, updates: Partial<ChangeRequest>) {
    try {
      const { data, error } = await this.supabase
        .from('project_change_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating change request:', error);
      throw error;
    }
  }

  // Analytics
  async getProjectMetrics(projectId: string) {
    try {
      const [tasks, timeEntries, risks, budgets] = await Promise.all([
        this.supabase
          .from('project_tasks')
          .select('status')
          .eq('project_id', projectId),
        this.supabase
          .from('project_time_entries')
          .select('duration, billable, billing_rate')
          .eq('project_id', projectId),
        this.supabase
          .from('project_risks')
          .select('status, impact')
          .eq('project_id', projectId),
        this.supabase
          .from('project_budgets')
          .select('amount, actual_amount')
          .eq('project_id', projectId),
      ]);

      if (tasks.error) throw tasks.error;
      if (timeEntries.error) throw timeEntries.error;
      if (risks.error) throw risks.error;
      if (budgets.error) throw budgets.error;

      // Calculate task metrics
      const taskMetrics = {
        total: tasks.data.length,
        completed: tasks.data.filter(t => t.status === 'completed').length,
        inProgress: tasks.data.filter(t => t.status === 'in_progress').length,
      };

      // Calculate time and cost metrics
      const timeMetrics = timeEntries.data.reduce((acc, entry) => ({
        totalHours: acc.totalHours + (entry.duration || 0),
        billableHours: acc.billableHours + (entry.billable ? entry.duration || 0 : 0),
        billedAmount: acc.billedAmount + (entry.billable ? (entry.duration || 0) * (entry.billing_rate || 0) : 0),
      }), { totalHours: 0, billableHours: 0, billedAmount: 0 });

      // Calculate risk metrics
      const riskMetrics = {
        total: risks.data.length,
        high: risks.data.filter(r => r.impact === 'high').length,
        mitigated: risks.data.filter(r => r.status === 'mitigated').length,
      };

      // Calculate budget metrics
      const budgetMetrics = budgets.data.reduce((acc, budget) => ({
        totalBudget: acc.totalBudget + (budget.amount || 0),
        actualSpent: acc.actualSpent + (budget.actual_amount || 0),
      }), { totalBudget: 0, actualSpent: 0 });

      return {
        tasks: taskMetrics,
        time: timeMetrics,
        risks: riskMetrics,
        budget: budgetMetrics,
      };
    } catch (error) {
      console.error('Error getting project metrics:', error);
      throw error;
    }
  }
}

export const projectService = new ProjectService();