import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminGate({ children }) {
  const { user } = useAuth()
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return children
}
