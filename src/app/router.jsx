import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from '@/widgets/RootLayout'
import ProtectedRoute from '@/features/auth/components/ProtectedRoute'

// Pages
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import CalendarPage from '@/pages/CalendarPage'
import GymPage from '@/pages/GymPage'
import GymAdmin from '@/pages/GymAdmin'
// import LearningPage from '@/pages/LearningPage'
import ProfilePage from '@/pages/ProfilePage'
import NotFoundPage from '@/pages/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <ProtectedRoute><HomePage /></ProtectedRoute> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      {
        path: 'calendar',
        element: <ProtectedRoute><CalendarPage /></ProtectedRoute>,
      },
      {
        path: 'gym',
        element: <ProtectedRoute><GymPage /></ProtectedRoute>,
      },
      {
        path: 'gym/admin',
        element: <ProtectedRoute><GymAdmin /></ProtectedRoute>,
      },
      // {
      //   path: 'learning',
      //   element: <ProtectedRoute><LearningPage /></ProtectedRoute>,
      // },
      {
        path: 'profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
