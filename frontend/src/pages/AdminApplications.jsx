// import { useCallback, useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import { api } from '../api/client';

// export default function AdminApplications() {
//   const [rows, setRows] = useState([]);
//   const [pagination, setPagination] = useState({ page: 1, pages: 1 });
//   const [page, setPage] = useState(1);
//   const [users, setUsers] = useState([]);
//   const [draft, setDraft] = useState({
//     search: '',
//     status: '',
//     userId: '',
//   });
//   const [query, setQuery] = useState({
//     search: '',
//     status: '',
//     userId: '',
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let cancelled = false;
//     api('/api/users?limit=100&page=1')
//       .then((res) => {
//         const seekers = (res.data || []).filter((u) => u.role === 'job_seeker');
//         if (!cancelled) setUsers(seekers);
//       })
//       .catch(() => {
//         if (!cancelled) toast.error('Could not load applicants list');
//       });
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const load = useCallback(async () => {
//     setLoading(true);
//     const q = new URLSearchParams();
//     q.set('page', String(page));
//     q.set('limit', '20');
//     if (query.search) q.set('search', query.search);
//     if (query.status) q.set('status', query.status);
//     if (query.userId) q.set('userId', query.userId);
//     try {
//       const res = await api(`/api/applications?${q}`);
//       setRows(res.data || []);
//       setPagination(res.pagination || { page: 1, pages: 1 });
//     } catch (e) {
//       toast.error(e.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [page, query]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   function applyFilters(e) {
//     e.preventDefault();
//     setQuery({ ...draft });
//     setPage(1);
//   }

//   const userInList = (id) =>
//     id && users.some((u) => String(u._id) === String(id));

//   const isRedactedAdminApplicant = (a) => a.user?.role === 'admin';

//   return (
//     <div className="page">
//       <header className="page-header">
//         <div>
//           <h1>All applications</h1>
//           <p className="muted">Search job title or company, or filter by applicant and status</p>
//         </div>
//       </header>

//       <form className="filter-bar wrap" onSubmit={applyFilters}>
//         <input
//           type="search"
//           className="filter-bar-search"
//           placeholder="Search title, company…"
//           value={draft.search}
//           onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value }))}
//           aria-label="Search job title or company"
//         />
//         <label className="filter-bar-select-label">
//           <select
//             value={draft.userId}
//             onChange={(e) => setDraft((d) => ({ ...d, userId: e.target.value }))}
//             aria-label="Applicant"
//           >
//             <option value="">All applicants</option>
//             {draft.userId && !userInList(draft.userId) ? (
//               <option value={draft.userId}>Selected applicant (not in first 100 users)</option>
//             ) : null}
//             {users.map((u) => (
//               <option key={String(u._id)} value={String(u._id)}>
//                 {u.name} — {u.email}
//               </option>
//             ))}
//           </select>
//         </label>
//         <select
//           value={draft.status}
//           onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
//           aria-label="Filter by status"
//         >
//           <option value="">All statuses</option>
//           <option value="pending">Pending</option>
//           <option value="accepted">Accepted</option>
//           <option value="rejected">Rejected</option>
//         </select>
//         <button type="submit" className="btn secondary">
//           Apply filters
//         </button>
//       </form>

//       {loading ? (
//         <p className="muted">Loading…</p>
//       ) : rows.length === 0 ? (
//         <p className="muted">No applications match.</p>
//       ) : (
//         <>
//           <div className="table-wrap">
//             <table className="data-table">
//               <thead>
//                 <tr>
//                   <th>Applicant</th>
//                   <th>Job</th>
//                   <th>Company</th>
//                   <th>Status</th>
//                   <th>Applied</th>
//                   <th></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {rows.map((a) => (
//                   <tr key={a._id}>
//                     <td>
//                       {isRedactedAdminApplicant(a) ? (
//                         <span className="muted">Admin account</span>
//                       ) : (
//                         <>
//                           {a.user?.name}
//                           <br />
//                           <span className="muted sm">{a.user?.email}</span>
//                         </>
//                       )}
//                     </td>
//                     <td>{a.job?.title}</td>
//                     <td>{a.job?.company}</td>
//                     <td>
//                       <span className={`badge status-${a.status}`}>{a.status}</span>
//                     </td>
//                     <td>{new Date(a.appliedAt).toLocaleDateString()}</td>
//                     <td>
//                       <Link to={`/admin/applications/${a._id}`} className="link">
//                         Open
//                       </Link>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <div className="pagination">
//             <button
//               type="button"
//               className="btn ghost sm"
//               disabled={pagination.page <= 1}
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//             >
//               Previous
//             </button>
//             <span className="muted">
//               Page {pagination.page} of {pagination.pages}
//             </span>
//             <button
//               type="button"
//               className="btn ghost sm"
//               disabled={pagination.page >= pagination.pages}
//               onClick={() => setPage((p) => p + 1)}
//             >
//               Next
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, getToken } from '../api/client';

export default function AdminApplications() {
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState({ search: '', status: '', userId: '' });
  const [query, setQuery] = useState({ search: '', status: '', userId: '' });
  const [loading, setLoading] = useState(true);

  // Load first 100 users (job_seekers only)
  useEffect(() => {
    let cancelled = false;
    api('/api/users?limit=100&page=1')
      .then((res) => {
        if (!cancelled) {
          const seekers = (res.data || []).filter((u) => u.role === 'job_seeker');
          setUsers(seekers);
        }
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load applicants list');
      });
    return () => { cancelled = true; };
  }, []);

  // Load applications with applied filters and pagination
  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', '20');
      if (query.search) params.set('search', query.search);
      if (query.status) params.set('status', query.status);
      if (query.userId) params.set('userId', query.userId);

      const res = await api(`/api/applications?${params}`);
      setRows(res.data || []);
      setPagination(res.pagination || { page: 1, pages: 1 });
    } catch (e) {
      toast.error(e.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const downloadCsv = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (query.search) params.set('search', query.search);
      if (query.status) params.set('status', query.status);
      if (query.userId) params.set('userId', query.userId);

      const token = getToken();
      const res = await fetch(`/api/admin/reports/applications.csv?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to download report');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'applications-report.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('CSV downloaded');
    } catch (e) {
      toast.error(e.message || 'Failed to download report');
    }
  }, [query]);

  // Apply filters from form
  const applyFilters = (e) => {
    e.preventDefault();
    setQuery({ ...draft });
    setPage(1);
  };

  const userInList = (id) => id && users.some((u) => String(u._id) === String(id));
  const isAdminApplicant = (a) => a.user?.role === 'admin';

  return (
    <div className="page">
      <header className="page-header">
        <h1>All applications</h1>
        <p className="muted">Search job title or company, or filter by applicant and status</p>
      </header>

      {/* Admin list behavior help */}
      
      {/* Filters */}
      <form className="filter-bar wrap" onSubmit={applyFilters}>
        <input
          type="search"
          className="filter-bar-search"
          placeholder="Search title, company…"
          value={draft.search}
          onChange={(e) => setDraft(d => ({ ...d, search: e.target.value }))}
          aria-label="Search job title or company"
        />

        <label className="filter-bar-select-label">
          <select
            value={draft.userId}
            onChange={(e) => setDraft(d => ({ ...d, userId: e.target.value }))}
            aria-label="Applicant"
          >
            <option value="">All applicants</option>
            {draft.userId && !userInList(draft.userId) && (
              <option value={draft.userId}>Selected applicant (not in first 100 users)</option>
            )}
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name} — {u.email}</option>
            ))}
          </select>
        </label>

        <select
          value={draft.status}
          onChange={(e) => setDraft(d => ({ ...d, status: e.target.value }))}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>

        <button type="submit" className="btn secondary">Apply filters</button>
        <button type="button" className="btn ghost sm" onClick={downloadCsv}>
          Download CSV
        </button>
      </form>

      {/* Applications Table */}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="muted">No applications match.</p>
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(a => (
                  <tr key={a._id}>
                    <td>
                      {isAdminApplicant(a) ? (
                        <span className="muted">Admin account</span>
                      ) : (
                        <>
                          {a.user?.name}<br />
                          <span className="muted sm">{a.user?.email}</span>
                        </>
                      )}
                    </td>
                    <td>{a.job?.title}</td>
                    <td>{a.job?.company}</td>
                    <td><span className={`badge status-${a.status}`}>{a.status}</span></td>
                    <td>{new Date(a.appliedAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/admin/applications/${a._id}`} className="link">Open</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              type="button"
              className="btn ghost sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >Previous</button>

            <span className="muted">Page {pagination.page} of {pagination.pages}</span>

            <button
              type="button"
              className="btn ghost sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage(p => p + 1)}
            >Next</button>
          </div>
        </>
      )}
    </div>
  );
}