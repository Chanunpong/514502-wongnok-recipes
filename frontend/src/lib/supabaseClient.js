
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://finkqkgaeatfqtookrrf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpbmtxa2dhZWF0ZnF0b29rcnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NDE5MzQsImV4cCI6MjA2MzQxNzkzNH0.l2NOjMkt6FXrf7UisAUHZ1Pzi4Gti5luaYwCWU5URLk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
