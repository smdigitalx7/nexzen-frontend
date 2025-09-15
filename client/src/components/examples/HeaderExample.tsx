import Header from '../Header';
import { useAuthStore } from '@/store/authStore';
import { useNavigationStore } from '@/store/navigationStore';
import { useEffect } from 'react';

export default function HeaderExample() {
  const { login } = useAuthStore();
  const { setIsMobile } = useNavigationStore();

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
      { branch_id: 'branch_1', branch_name: 'Nexzen School', branch_type: 'school' as const, is_default: true },
      { branch_id: 'branch_2', branch_name: 'Velocity College', branch_type: 'college' as const, is_default: false }
    ];

    login(mockUser, mockBranches);
    setIsMobile(false);
  }, [login, setIsMobile]);

  return <Header />;
}