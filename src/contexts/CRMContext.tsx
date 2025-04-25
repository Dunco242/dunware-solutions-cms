import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { crmService } from '../services/crm';
import { Company, Contact, Deal, Activity } from '../types';
import { useAuthContext } from '../components/auth/AuthProvider';

interface CRMState {
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
}

type CRMAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_COMPANIES'; payload: Company[] }
  | { type: 'SET_CONTACTS'; payload: Contact[] }
  | { type: 'SET_DEALS'; payload: Deal[] }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'ADD_COMPANY'; payload: Company }
  | { type: 'UPDATE_COMPANY'; payload: Company }
  | { type: 'ADD_CONTACT'; payload: Contact }
  | { type: 'UPDATE_CONTACT'; payload: Contact }
  | { type: 'ADD_DEAL'; payload: Deal }
  | { type: 'UPDATE_DEAL'; payload: Deal }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'UPDATE_ACTIVITY'; payload: Activity };

const initialState: CRMState = {
  companies: [],
  contacts: [],
  deals: [],
  activities: [],
  isLoading: false,
  error: null,
};

const CRMContext = createContext<{
  state: CRMState;
  dispatch: React.Dispatch<CRMAction>;
  refreshData: () => Promise<void>;
} | null>(null);

function crmReducer(state: CRMState, action: CRMAction): CRMState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'SET_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'SET_COMPANIES':
      return { ...state, companies: action.payload, isLoading: false };
    case 'SET_CONTACTS':
      return { ...state, contacts: action.payload, isLoading: false };
    case 'SET_DEALS':
      return { ...state, deals: action.payload, isLoading: false };
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload, isLoading: false };
    case 'ADD_COMPANY':
      return { ...state, companies: [...state.companies, action.payload] };
    case 'UPDATE_COMPANY':
      return {
        ...state,
        companies: state.companies.map(company =>
          company.id === action.payload.id ? action.payload : company
        ),
      };
    case 'ADD_CONTACT':
      return { ...state, contacts: [...state.contacts, action.payload] };
    case 'UPDATE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.map(contact =>
          contact.id === action.payload.id ? action.payload : contact
        ),
      };
    case 'ADD_DEAL':
      return { ...state, deals: [...state.deals, action.payload] };
    case 'UPDATE_DEAL':
      return {
        ...state,
        deals: state.deals.map(deal =>
          deal.id === action.payload.id ? action.payload : deal
        ),
      };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [...state.activities, action.payload] };
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.map(activity =>
          activity.id === action.payload.id ? action.payload : activity
        ),
      };
    default:
      return state;
  }
}

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(crmReducer, initialState);
  const { user } = useAuthContext();

  const refreshData = async () => {
    if (!user) return;

    dispatch({ type: 'SET_LOADING' });
    try {
      const [companies, contacts, deals, activities] = await Promise.all([
        crmService.getCompanies(),
        crmService.getContacts(),
        crmService.getDeals(),
        crmService.getActivities(),
      ]);

      dispatch({ type: 'SET_COMPANIES', payload: companies });
      dispatch({ type: 'SET_CONTACTS', payload: contacts });
      dispatch({ type: 'SET_DEALS', payload: deals });
      dispatch({ type: 'SET_ACTIVITIES', payload: activities });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load CRM data' });
      console.error('Error loading CRM data:', error);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  return (
    <CRMContext.Provider value={{ state, dispatch, refreshData }}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}