import { create } from 'zustand';
import { api } from '@/shared/services/api';

export interface User {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
  isCurrentUser?: boolean;
  isGhost?: boolean;
  salary?: number;
}

export interface Group {
  id: string;
  name: string;
  created_by: string;
  members: User[];
  balances?: { from: string; to: string; amount: number }[];
  default_split_method?: 'EQUAL' | 'PERCENTAGE' | 'PRO_RATA';
  createdAt: string;
}

// Fallback current user to be overridden by auth store if necessary
const CURRENT_USER: User = { id: 'user_me', name: 'You', isCurrentUser: true };

interface GroupState {
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  
  fetchGroups: () => Promise<void>;
  createGroup: (
    name: string, 
    members: {name?: string, phoneNumber?: string, id: string}[],
    splitMethod?: 'EQUAL' | 'PERCENTAGE' | 'PRO_RATA',
    defaultSplits?: { userId: string, splitValue: number }[]
  ) => Promise<Group | undefined>;
  updateGroupDefaultSplits: (groupId: string, splitMethod: 'EQUAL' | 'PERCENTAGE' | 'PRO_RATA', defaultSplits?: { userId: string, splitValue: number }[]) => Promise<void>;
  addGroupMembers: (groupId: string, contacts: {name?: string, phoneNumber?: string}[]) => Promise<void>;
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  fetchGroupBalances: (groupId: string) => Promise<void>;
  
  getGroupById: (id: string) => Group | undefined;
  getCurrentUser: () => User;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  isLoading: false,
  error: null,

  fetchGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<{ groups: Group[] }>('/groups');
      set({ groups: data.groups, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createGroup: async (name, members, splitMethod, defaultSplits) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Create the group
      const { group } = await api.post<{ group: Group }>('/groups', { name });
      
      // 2. Add members to the group
      let finalGroup = group;
      if (members.length > 0) {
        await api.post(`/groups/${group.id}/members`, { contacts: members });
        
        // Re-fetch the group to get the actual generated user IDs for the members
        const { group: updatedGroup } = await api.get<{ group: Group }>(`/groups/${group.id}`);
        finalGroup = updatedGroup;
      }

      // 3. Set default splits
      if (splitMethod === 'PERCENTAGE' && defaultSplits) {
        // Map temp member IDs to actual user IDs
        const finalDefaultSplits = defaultSplits.map(ds => {
          if (ds.userId === CURRENT_USER.id) return ds;
          
          // Match by name/phone because temp ID is gone
          const tempMember = members.find(m => m.id === ds.userId);
          const actualMember = finalGroup.members.find(m => m.phoneNumber === tempMember?.phoneNumber);
          
          return {
            userId: actualMember ? actualMember.id : ds.userId,
            splitValue: ds.splitValue
          };
        });

        await api.put(`/groups/${group.id}/default-splits`, { 
          splitMethod,
          defaultSplits: finalDefaultSplits 
        });
      }

      // Refetch everything
      await get().fetchGroups();
      
      set({ isLoading: false });
      return finalGroup;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return undefined;
    }
  },

  updateGroupDefaultSplits: async (groupId, splitMethod, defaultSplits) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/groups/${groupId}/default-splits`, { 
        splitMethod,
        defaultSplits 
      });
      await get().fetchGroups();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addGroupMembers: async (groupId, contacts) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.post<{ members: User[] }>(`/groups/${groupId}/members`, { contacts });
      set(state => ({
        groups: state.groups.map(g => 
          g.id === groupId 
            ? { ...g, members: [...g.members, ...data.members] } 
            : g
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  removeGroupMember: async (groupId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/groups/${groupId}/members/${userId}`);
      set(state => ({
        groups: state.groups.map(g => 
          g.id === groupId 
            ? { ...g, members: g.members.filter(m => m.id !== userId) } 
            : g
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchGroupBalances: async (groupId) => {
    try {
      const { balances } = await api.get<{ balances: { from: string; to: string; amount: number }[] }>(`/groups/${groupId}/balances`);
      set(state => ({
        groups: state.groups.map(g => 
          g.id === groupId 
            ? { ...g, balances } 
            : g
        )
      }));
    } catch (error: any) {
      console.error('Failed to fetch balances:', error);
    }
  },

  getGroupById: (id) => {
    return get().groups.find(g => g.id === id);
  },

  getCurrentUser: () => CURRENT_USER,
}));
