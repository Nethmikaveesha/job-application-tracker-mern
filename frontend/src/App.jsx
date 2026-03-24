import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import HomeGate from './pages/HomeGate'
import SeekerGate from './pages/SeekerGate'
import AdminGate from './pages/AdminGate'
import JobsPage from './pages/JobsPage'
import ApplyPage from './pages/ApplyPage'
import ApplicationsPage from './pages/ApplicationsPage'
import ApplicationDetail from './pages/ApplicationDetail'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminJobs from './pages/AdminJobs'
import AdminApplications from './pages/AdminApplications'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomeGate />} />
            <Route
              path="jobs"
              element={
                <SeekerGate>
                  <JobsPage />
                </SeekerGate>
              }
            />
            <Route
              path="jobs/:jobId/apply"
              element={
                <SeekerGate>
                  <ApplyPage />
                </SeekerGate>
              }
            />
            <Route
              path="applications"
              element={
                <SeekerGate>
                  <ApplicationsPage />
                </SeekerGate>
              }
            />
            <Route path="applications/:id" element={<ApplicationDetail />} />
            <Route
              path="profile"
              element={
                <SeekerGate>
                  <Profile />
                </SeekerGate>
              }
            />
            <Route
              path="admin"
              element={
                <AdminGate>
                  <AdminDashboard />
                </AdminGate>
              }
            />
            <Route
              path="admin/users"
              element={
                <AdminGate>
                  <AdminUsers />
                </AdminGate>
              }
            />
            <Route
              path="admin/jobs"
              element={
                <AdminGate>
                  <AdminJobs />
                </AdminGate>
              }
            />
            <Route
              path="admin/applications"
              element={
                <AdminGate>
                  <AdminApplications />
                </AdminGate>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
