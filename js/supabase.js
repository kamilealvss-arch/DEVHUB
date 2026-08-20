import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = "https://htlyccadeagvimfphadt.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bHljY2FkZWFndmltZnBoYWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzM4ODQsImV4cCI6MjA5NTY0OTg4NH0.DyvzRvWBkKCzPwz8H45_SOlyGK1nAIWu6t31VVnDU7E"

export const supabase = createClient(supabaseUrl, supabaseKey)