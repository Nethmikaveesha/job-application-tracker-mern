import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SeekerDashboard from './SeekerDashboard'

export default function HomeGate() {
  const { isAdmin } = useAuth()
  if (isAdmin) return <Navigate to="/admin" replace />
  return <SeekerDashboard />
}
