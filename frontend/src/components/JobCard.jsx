export default function JobCard({ job }) {
  const appliedDate = job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A';
  return (
    <div className="border p-4 rounded shadow">
      <h2 className="font-bold">{job.title}</h2>
      <p>{job.company}</p>
      <p>Type: {job.employmentType || 'N/A'}</p>
      <p>Location: {job.location || 'N/A'}</p>
      <p>Posted: {appliedDate}</p>
    </div>
  );
}
