import { createClient } from '@supabase/supabase-js'

const supabaseUrl = https://supabase.com/dashboard/project/rpkqljzkkjvidukurnhy
const supabaseKey = sb_publishable_WoYTSQg-Wkb6eY53zWFXVQ_N5__7xar

export const supabase = createClient(supabaseUrl, supabaseKey)
