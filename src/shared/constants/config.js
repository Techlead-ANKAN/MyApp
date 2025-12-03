export const CONFIG = {
  // Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // App settings
  app: {
    name: 'MyApp',
    version: '1.0.0',
  },
  
  // Toast settings
  toast: {
    duration: 4000, // 4 seconds
    position: 'top-right',
  },
  
  // Calendar settings
  calendar: {
    defaultView: 'month',
    weekStartsOn: 0, // Sunday
  },
}
