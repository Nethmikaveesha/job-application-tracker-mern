import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import JobCard from '../components/JobCard';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch('/api/jobs', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setJobs(Array.isArray(data?.data) ? data.data : []))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Admin Dashboard - {user?.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {jobs.map(job => <JobCard key={job._id} job={job} />)}
      </div>
    </div>
  );
}
