import { hasAdminSession } from './admin-session';
import { createAdminSupabase } from './admin-supabase';
import { getInstructorSessionId } from './instructor-session';

export async function hasPoolAvailabilityAccess() {
  if (await hasAdminSession()) return true;
  const instructorId = await getInstructorSessionId();
  if (!instructorId) return false;
  try {
    const { data, error } = await createAdminSupabase().from('instructors')
      .select('is_approved').eq('id', instructorId).maybeSingle();
    return !error && data?.is_approved === true;
  } catch {
    return false;
  }
}
