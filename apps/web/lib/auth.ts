import { createServerSupabaseClient } from './supabase/server';
import { createAdminSupabaseClient } from './supabase/admin';

export async function getUserId(): Promise<string | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

export async function checkUserQuota(userId: string): Promise<{
  allowed: boolean;
  message: string;
  remaining: number;
}> {
  const supabase = createAdminSupabaseClient();

  // Get quota
  const { data: quota, error } = await supabase
    .from('usage_quotas')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !quota) {
    // Create default quota if it doesn't exist
    const { data: newQuota, error: createError } = await supabase
      .from('usage_quotas')
      .insert({
        user_id: userId,
        tokens_used_today: 0,
        tokens_used_month: 0,
        daily_limit: 100000,
        monthly_limit: 3000000,
        is_blocked: false
      })
      .select()
      .single();

    if (createError || !newQuota) {
      return { allowed: false, message: 'Failed to create quota', remaining: 0 };
    }

    return { allowed: true, message: 'OK', remaining: newQuota.daily_limit };
  }

  if (quota.is_blocked) {
    return { allowed: false, message: 'Account suspended', remaining: 0 };
  }

  // Check daily limit - reset if new day
  const today = new Date().toISOString().split('T')[0];
  const lastReset = new Date(quota.last_reset_daily).toISOString().split('T')[0];

  let tokensUsedToday = quota.tokens_used_today;

  if (lastReset !== today) {
    // Reset daily counter
    await supabase
      .from('usage_quotas')
      .update({
        tokens_used_today: 0,
        last_reset_daily: new Date().toISOString()
      })
      .eq('user_id', userId);
    tokensUsedToday = 0;
  }

  const remaining = quota.daily_limit - tokensUsedToday;

  return {
    allowed: remaining > 0,
    message: remaining > 0 ? 'OK' : 'Daily limit reached. Resets at midnight UTC.',
    remaining
  };
}

export async function incrementTokenUsage(
  userId: string,
  tokensUsed: number
): Promise<void> {
  const supabase = createAdminSupabaseClient();

  // Get current quota
  const { data: quota } = await supabase
    .from('usage_quotas')
    .select('tokens_used_today, tokens_used_month')
    .eq('user_id', userId)
    .single();

  if (quota) {
    await supabase
      .from('usage_quotas')
      .update({
        tokens_used_today: quota.tokens_used_today + tokensUsed,
        tokens_used_month: quota.tokens_used_month + tokensUsed
      })
      .eq('user_id', userId);
  }
}
