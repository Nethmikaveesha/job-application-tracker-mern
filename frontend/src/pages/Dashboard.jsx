import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import JobCard from '../components/JobCard';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/jobs', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => setJobs(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {jobs.map(job => <JobCard key={job._id} job={job} />)}
      </div>
    </div>
  );
}