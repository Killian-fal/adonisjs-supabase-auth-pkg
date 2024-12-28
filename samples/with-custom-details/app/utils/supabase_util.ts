import env from '#start/env'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(env.get('SUPABASE_PROJECT_URL'), env.get('SUPABASE_API_KEY'))

export { supabase }
