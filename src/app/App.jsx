import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppRouter from './router'
import { Toaster } from '@/shared/components/Toaster'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
