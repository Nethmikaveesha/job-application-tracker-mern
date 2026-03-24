export default function JobCard({ job }) {
  return (
    <div className="border p-4 rounded shadow">
      <h2 className="font-bold">{job.position}</h2>
      <p>{job.company}</p>
      <p>Status: {job.status}</p>
      <p>Applied: {new Date(job.dateApplied).toLocaleDateString()}</p>
    </div>
  );
}