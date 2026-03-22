import { supabase } from '../config/supabase.js';
import { decryptUserFields } from '../utils/crypto.js';

export const getDashboardService = async (userId) => {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: schemes } = await supabase
    .from('user_schemes')
    .select(`*, schemes (*)`)
    .eq('user_id', userId);

  const { data: milestones } = await supabase
    .from('user_milestones')
    .select(`*, milestones (*)`)
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

  return {
    user: decryptUserFields(user), // decrypt PII before sending to client
    schemes,
    milestones,
    documents,
    notifications,
  };
};