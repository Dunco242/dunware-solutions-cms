import { useCRM } from '../contexts/CRMContext';
import { crmService } from '../services/crm';
import { Company, Contact, Deal, Activity } from '../types';
import { useAuthContext } from '../components/auth/AuthProvider';

export function useCRMActions() {
  const { dispatch, refreshData } = useCRM();
  const { user } = useAuthContext();

  const createCompany = async (company: Omit<Company, 'id'>) => {
    try {
      const newCompany = await crmService.createCompany({
        ...company,
        createdBy: user?.id,
      });
      dispatch({ type: 'ADD_COMPANY', payload: newCompany });
      return newCompany;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      const updatedCompany = await crmService.updateCompany(id, updates);
      dispatch({ type: 'UPDATE_COMPANY', payload: updatedCompany });
      return updatedCompany;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  };

  const createContact = async (contact: Omit<Contact, 'id'>) => {
    try {
      const newContact = await crmService.createContact({
        ...contact,
        createdBy: user?.id,
      });
      dispatch({ type: 'ADD_CONTACT', payload: newContact });
      return newContact;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const updatedContact = await crmService.updateContact(id, updates);
      dispatch({ type: 'UPDATE_CONTACT', payload: updatedContact });
      return updatedContact;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  };

  const createDeal = async (deal: Omit<Deal, 'id'>) => {
    try {
      const newDeal = await crmService.createDeal({
        ...deal,
        createdBy: user?.id,
      });
      dispatch({ type: 'ADD_DEAL', payload: newDeal });
      return newDeal;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    try {
      const updatedDeal = await crmService.updateDeal(id, updates);
      dispatch({ type: 'UPDATE_DEAL', payload: updatedDeal });
      return updatedDeal;
    } catch (error) {
      console.error('Error updating deal:', error);
      throw error;
    }
  };

  const createActivity = async (activity: Omit<Activity, 'id'>) => {
    try {
      const newActivity = await crmService.createActivity({
        ...activity,
        createdBy: user?.id,
      });
      dispatch({ type: 'ADD_ACTIVITY', payload: newActivity });
      return newActivity;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    try {
      const updatedActivity = await crmService.updateActivity(id, updates);
      dispatch({ type: 'UPDATE_ACTIVITY', payload: updatedActivity });
      return updatedActivity;
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  };

  return {
    createCompany,
    updateCompany,
    createContact,
    updateContact,
    createDeal,
    updateDeal,
    createActivity,
    updateActivity,
    refreshData,
  };
}