import Dashboard from '../Dashboard';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

export default function DashboardExample() {
  const { login } = useAuthStore();

  useEffect(() => {
    // Mock user login for demo
    const mockUser = {
      user_id: '1',
      full_name: 'Sarah Johnson',
      email: 'sarah@nexzen.edu',
      role: 'institute_admin' as const,
      institute_id: 'inst_1',
      current_branch_id: 'branch_1'
    };

    const mockBranches = [
      { branch_id: 'branch_1', branch_name: 'Nexzen School', branch_type: 'school' as const, is_default: true }
    ];

    login(mockUser, mockBranches);
  }, [login]);

  return <Dashboard />;
}