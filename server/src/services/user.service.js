import { supabase } from '../config/supabase.js';
import { decryptUserFields } from '../utils/crypto.js';

export const getDashboardService = async (userId) => {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: schemes } = await supabase
    .from('user_scheme_matches')
    .select(`*, schemes (*)`)
    .eq('user_id', userId)
    .neq('status', 'matched'); // Only count applied/completed schemes

  const { data: milestones } = await supabase
    .from('user_milestone_progress')
    .select(`*, scheme_milestones (*), schemes (*)`)
    .eq('user_id', userId);

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId);

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const { data: transactions } = await supabase
    .from('benefit_transactions')
    .select('amount')
    .eq('user_id', userId);

  const calculatedTotalBenefits = (transactions || []).reduce((total, t) => total + Number(t.amount || 0), 0);

  const decryptedUser = decryptUserFields(user);
  if (decryptedUser) {
    decryptedUser.total_benefits = calculatedTotalBenefits;
  }

  return {
    user: decryptedUser, // decrypt PII and inject dynamically calculated benefits
    schemes,
    milestones,
    documents,
    notifications,
  };
};