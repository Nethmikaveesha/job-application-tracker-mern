export default function JobCard({ job }) {
  const posted = job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A';
  return (
    <div className="job-card-item">
      <h2>{job.title}</h2>
      <p className="company">{job.company}</p>
      <p className="meta">Type: {job.employmentType || 'N/A'}</p>
      <p className="meta">Location: {job.location || 'N/A'}</p>
      <p className="meta">Posted: {posted}</p>
    </div>
  );
}
