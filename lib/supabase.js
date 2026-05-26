import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rpkqljzkkjvidukurnhy.supabase.co'
const supabaseKey = 'sb_publishable_WoYTSQg-Wkb6eY53zWFXVQ_N5__7xar'

export const supabase = createClient(supabaseUrl, supabaseKey)
