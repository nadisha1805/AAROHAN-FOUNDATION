import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { apiGet, apiPatch, apiPost } from './api';

type AdminOverview = {
  summary: Record<string, number>;
  recentVolunteers: Array<{ id: string; fullName: string; email: string; status: string; createdAt: string }>;
  recentEnquiries: Array<{ id: string; fullName: string; email: string; status: string; subject: string; createdAt: string }>;
  recentCampaigns: Array<{ id: string; title: string; status: string; updatedAt: string }>;
  upcomingEvents: Array<{ id: string; title: string; startDate: string; status: string }>;
  recentActivity: Array<{ id: string; label: string; detail: string; createdAt: string }>;
};

const adminNavigation = [
  'overview',
  'causes',
  'campaigns',
  'volunteers',
  'enquiries',
  'stories',
  'events',
  'donations',
  'newsletter',
] as const;

type AdminSection = (typeof adminNavigation)[number];

function isAuthenticated() {
  return Boolean(typeof window !== 'undefined' && window.localStorage.getItem('aarohan_admin_token'));
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date);
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiPost('/admin/logout', {}, true);
    } catch {
      // no-op: best effort logout
    } finally {
      window.localStorage.removeItem('aarohan_admin_token');
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brandwrap">
          <div className="brand-mark">A</div>
          <div>
            <strong>AAROHAN</strong>
            <small>ADMIN</small>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {adminNavigation.map((section) => (
            <Link
              key={section}
              to={`/admin/${section === 'overview' ? '' : section}`}
              className="admin-nav-item"
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="eyebrow">Foundation operations</span>
            <h2>Administrative dashboard</h2>
          </div>
          <div className="admin-user-pill">Super Admin</div>
        </header>
        {children}
      </div>
    </div>
  );
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState<{ success?: boolean; message?: string }>({});
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus({});

    try {
      const result = await apiPost('/admin/login', form, false);
      if (!result.success) {
        throw new Error(result.message || 'Unable to sign in.');
      }
      if (result.data?.token) {
        window.localStorage.setItem('aarohan_admin_token', result.data.token);
      }
      setStatus({ success: true, message: 'Welcome back.' });
      navigate('/admin', { replace: true });
    } catch (error) {
      setStatus({ success: false, message: error instanceof Error ? error.message : 'Login failed.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-brandwrap">
          <div className="brand-mark">A</div>
          <div>
            <strong>AAROHAN</strong>
            <small>FOUNDATION</small>
          </div>
        </div>

        <h1>Admin login</h1>
        <p>Secure access for foundation staff.</p>

        <form onSubmit={handleSubmit} className="form-shell">
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Email address"
            aria-label="Admin email"
          />
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Password"
            aria-label="Admin password"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          {status.message ? <p className={status.success ? 'success-text' : 'error-text'}>{status.message}</p> : null}
        </form>
      </div>
    </div>
  );
}

function OverviewCards({ data }: { data: AdminOverview | null }) {
  const summary = useMemo(() => {
    const values = data?.summary ?? {};
    return [
      { label: 'Total Causes', value: values.totalCauses ?? 0 },
      { label: 'Active Campaigns', value: values.activeCampaigns ?? 0 },
      { label: 'Total Volunteers', value: values.totalVolunteerApplications ?? 0 },
      { label: 'Pending Volunteer Apps', value: values.pendingVolunteerApplications ?? 0 },
      { label: 'Total Enquiries', value: values.totalContactEnquiries ?? 0 },
      { label: 'Unread Enquiries', value: values.unreadPendingEnquiries ?? 0 },
      { label: 'Published Stories', value: values.publishedStories ?? 0 },
      { label: 'Upcoming Events', value: values.upcomingEvents ?? 0 },
      { label: 'Newsletter Subscribers', value: values.newsletterSubscribers ?? 0 },
      { label: 'Successful Donations', value: values.successfulDonations ?? 0 },
      { label: 'Pending Donations', value: values.pendingDonations ?? 0 },
      { label: 'Failed Donations', value: values.failedDonations ?? 0 },
    ];
  }, [data]);

  return (
    <div className="admin-grid admin-grid-3">
      {summary.map((item) => (
        <div key={item.label} className="admin-card stat-card">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

function AdminDashboardPage() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [causes, setCauses] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [newsletter, setNewsletter] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const section = location.pathname.replace(/^\/admin\/?/, '') || 'overview';
    const normalized = section.split('/')[0] as AdminSection;
    if (adminNavigation.includes(normalized)) {
      setActiveSection(normalized);
    }
  }, [location.pathname]);

  useEffect(() => {
    async function load() {
      try {
        const [overviewData, causesData, campaignsData, volunteersData, enquiriesData, storiesData, eventsData, donationsData, newsletterData] = await Promise.all([
          apiGet('/admin/overview', true),
          apiGet('/admin/causes', true),
          apiGet('/admin/campaigns', true),
          apiGet('/admin/volunteers', true),
          apiGet('/admin/enquiries', true),
          apiGet('/admin/stories', true),
          apiGet('/admin/events', true),
          apiGet('/admin/donations', true),
          apiGet('/admin/newsletter', true),
        ]);
        setOverview(overviewData as AdminOverview);
        setCauses(Array.isArray(causesData) ? causesData : []);
        setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
        setVolunteers(Array.isArray(volunteersData) ? volunteersData : []);
        setEnquiries(Array.isArray(enquiriesData) ? enquiriesData : []);
        setStories(Array.isArray(storiesData) ? storiesData : []);
        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setDonations(Array.isArray(donationsData) ? donationsData : []);
        setNewsletter(Array.isArray(newsletterData) ? newsletterData : []);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load admin dashboard data.');
      }
    }

    void load();
  }, []);

  const renderSection = () => {
    const overviewCard = <OverviewCards data={overview} />;

    switch (activeSection) {
      case 'overview':
        return (
          <>
            {error ? <div className="empty-state error-text">{error}</div> : null}
            {overview ? overviewCard : <div className="empty-state">Loading overview...</div>}

            {overview ? (
              <div className="admin-grid admin-grid-2">
                <div className="admin-card">
                  <h3>Recent volunteer applications</h3>
                  <ul className="admin-list">
                    {overview.recentVolunteers.length ? overview.recentVolunteers.map((item) => (
                      <li key={item.id}><strong>{item.fullName}</strong><span>{item.status}</span><small>{formatDate(item.createdAt)}</small></li>
                    )) : <li className="empty-state">No volunteer applications yet.</li>}
                  </ul>
                </div>

                <div className="admin-card">
                  <h3>Recent contact enquiries</h3>
                  <ul className="admin-list">
                    {overview.recentEnquiries.length ? overview.recentEnquiries.map((item) => (
                      <li key={item.id}><strong>{item.fullName}</strong><span>{item.subject}</span><small>{item.status}</small></li>
                    )) : <li className="empty-state">No enquiries received.</li>}
                  </ul>
                </div>

                <div className="admin-card">
                  <h3>Recently updated campaigns</h3>
                  <ul className="admin-list">
                    {overview.recentCampaigns.length ? overview.recentCampaigns.map((item) => (
                      <li key={item.id}><strong>{item.title}</strong><span>{item.status}</span><small>{formatDate(item.updatedAt)}</small></li>
                    )) : <li className="empty-state">No campaigns currently updated.</li>}
                  </ul>
                </div>

                <div className="admin-card">
                  <h3>Administration activity</h3>
                  <ul className="admin-list">
                    {overview.recentActivity.length ? overview.recentActivity.map((item) => (
                      <li key={item.id}><strong>{item.label}</strong><span>{item.detail}</span><small>{formatDate(item.createdAt)}</small></li>
                    )) : <li className="empty-state">No recent activity.</li>}
                  </ul>
                </div>
              </div>
            ) : null}
          </>
        );
      case 'causes':
        return <AdminCrudSection title="Causes" type="causes" items={causes} onRefresh={setCauses} />;
      case 'campaigns':
        return <AdminCrudSection title="Campaigns" type="campaigns" items={campaigns} onRefresh={setCampaigns} />;
      case 'volunteers':
        return <AdminVolunteerTable items={volunteers} onRefresh={setVolunteers} />;
      case 'enquiries':
        return <AdminEnquiryTable items={enquiries} onRefresh={setEnquiries} />;
      case 'stories':
        return <AdminContentTable title="Stories & News" items={stories} onRefresh={setStories} />;
      case 'events':
        return <AdminContentTable title="Events" items={events} onRefresh={setEvents} />;
      case 'donations':
        return <AdminDonationsTable items={donations} />;
      case 'newsletter':
        return <AdminNewsletterTable items={newsletter} />;
      default:
        return null;
    }
  };

  return (
    <AdminShell>
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Operations</span>
          <h3>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h3>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => setActiveSection('overview')}>Dashboard</button>
      </div>
      {renderSection()}
    </AdminShell>
  );
}

function AdminCrudSection({ title, type, items, onRefresh }: { title: string; type: 'causes' | 'campaigns'; items: any[]; onRefresh: (value: any[]) => void }) {
  const defaultForm: {
    title: string;
    slug: string;
    description: string;
    image: string;
    status: string;
    featured: boolean;
    startDate?: string;
    endDate?: string;
  } = type === 'causes'
    ? { title: '', slug: '', description: '', image: '', status: 'Draft', featured: false }
    : { title: '', slug: '', description: '', image: '', status: 'Draft', featured: false, startDate: '', endDate: '' };

  const [form, setForm] = useState(defaultForm);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { ...form, slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') };
    const result = await apiPost(`/admin/${type}`, payload, true);
    if (result.success) {
      onRefresh([...(items || []), result.data]);
      setForm(defaultForm);
    }
  }

  async function handleStatusChange(id: string, nextStatus: string) {
    const result = await apiPatch(`/admin/${type}/${id}`, { status: nextStatus }, true);
    if (result.success) {
      onRefresh((items || []).map((item) => item.id === id ? { ...item, status: nextStatus } : item));
    }
  }

  async function handleDelete(id: string) {
    const result = await apiPost(`/admin/${type}/${id}/delete`, {}, true);
    if (result.success) {
      onRefresh((items || []).filter((item) => item.id !== id));
    }
  }

  return (
    <div className="admin-grid admin-grid-2">
      <div className="admin-card">
        <h3>Add {title}</h3>
        <form onSubmit={handleCreate} className="admin-form">
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Title" />
          <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Slug" />
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" rows={4} />
          <input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="Image URL" />
          {type === 'campaigns' ? (
            <>
              <input type="date" value={form.startDate as string} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
              <input type="date" value={form.endDate as string} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
            </>
          ) : null}
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
          <label className="checkbox-row"><input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Featured</label>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      </div>

      <div className="admin-card">
        <h3>Existing {title.toLowerCase()}</h3>
        <ul className="admin-list admin-list-inline">
          {items.length ? items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.title || item.name}</strong>
                <small>{item.status}</small>
              </div>
              <div className="row-actions">
                <select value={item.status} onChange={(event) => void handleStatusChange(item.id, event.target.value)}>
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
                <button type="button" className="btn btn-secondary small" onClick={() => void handleDelete(item.id)}>Delete</button>
              </div>
            </li>
          )) : <li className="empty-state">No items available.</li>}
        </ul>
      </div>
    </div>
  );
}

function AdminVolunteerTable({ items, onRefresh }: { items: any[]; onRefresh: (value: any[]) => void }) {
  async function updateStatus(id: string, status: string) {
    const result = await apiPatch(`/admin/volunteers/${id}`, { status }, true);
    if (result.success) {
      onRefresh((items || []).map((item) => item.id === id ? { ...item, status } : item));
    }
  }

  return (
    <div className="admin-card">
      <h3>Volunteer applications</h3>
      <table className="admin-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Applied</th></tr>
        </thead>
        <tbody>
          {items.length ? items.map((item) => (
            <tr key={item.id}>
              <td>{item.fullName}</td>
              <td>{item.email}</td>
              <td>{item.interests || 'General support'}</td>
              <td>
                <select value={item.status || 'New'} onChange={(event) => void updateStatus(item.id, event.target.value)}>
                  <option value="New">New</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Contacted">Contacted</option>
                </select>
              </td>
              <td>{formatDate(item.createdAt)}</td>
            </tr>
          )) : (
            <tr><td colSpan={5}><div className="empty-state">No volunteer submissions yet.</div></td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AdminEnquiryTable({ items, onRefresh }: { items: any[]; onRefresh: (value: any[]) => void }) {
  async function updateStatus(id: string, status: string) {
    const result = await apiPatch(`/admin/enquiries/${id}`, { status }, true);
    if (result.success) {
      onRefresh((items || []).map((item) => item.id === id ? { ...item, status } : item));
    }
  }

  return (
    <div className="admin-card">
      <h3>Contact enquiries</h3>
      <table className="admin-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Subject</th><th>Status</th><th>Date</th></tr>
        </thead>
        <tbody>
          {items.length ? items.map((item) => (
            <tr key={item.id}>
              <td>{item.fullName}</td>
              <td>{item.email}</td>
              <td>{item.subject}</td>
              <td>
                <select value={item.status || 'New'} onChange={(event) => void updateStatus(item.id, event.target.value)}>
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </td>
              <td>{formatDate(item.createdAt)}</td>
            </tr>
          )) : (
            <tr><td colSpan={5}><div className="empty-state">No enquiries logged.</div></td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AdminContentTable({ title, items, onRefresh }: { title: string; items: any[]; onRefresh: (value: any[]) => void }) {
  async function updateStatus(id: string, status: string) {
    const endpoint = title.includes('Event') ? '/admin/events' : '/admin/stories';
    const result = await apiPatch(`${endpoint}/${id}`, { status }, true);
    if (result.success) {
      onRefresh((items || []).map((item) => item.id === id ? { ...item, status } : item));
    }
  }

  return (
    <div className="admin-card">
      <h3>{title}</h3>
      <table className="admin-table">
        <thead>
          <tr><th>Title</th><th>Category</th><th>Status</th><th>Updated</th></tr>
        </thead>
        <tbody>
          {items.length ? items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.category || 'General'}</td>
              <td>
                <select value={item.status || 'Draft'} onChange={(event) => void updateStatus(item.id, event.target.value)}>
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </td>
              <td>{formatDate(item.updatedAt || item.publishedAt || item.createdAt)}</td>
            </tr>
          )) : (
            <tr><td colSpan={4}><div className="empty-state">No {title.toLowerCase()} available.</div></td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AdminDonationsTable({ items }: { items: any[] }) {
  return (
    <div className="admin-card">
      <h3>Donations</h3>
      <table className="admin-table">
        <thead>
          <tr><th>Donor</th><th>Amount</th><th>Type</th><th>Status</th><th>Reference</th></tr>
        </thead>
        <tbody>
          {items.length ? items.map((item) => (
            <tr key={item.id}>
              <td>{item.isAnonymous ? 'Anonymous donor' : item.donorName}</td>
              <td>₹{Number(item.amount || 0).toLocaleString('en-IN')}</td>
              <td>{item.donationType}</td>
              <td>{item.paymentStatus}</td>
              <td>{item.paymentReference || item.gatewayPaymentId || '—'}</td>
            </tr>
          )) : (
            <tr><td colSpan={5}><div className="empty-state">No donation records yet.</div></td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AdminNewsletterTable({ items }: { items: any[] }) {
  return (
    <div className="admin-card">
      <h3>Newsletter subscribers</h3>
      <ul className="admin-list admin-list-inline">
        {items.length ? items.map((item) => (
          <li key={item.id}><strong>{item.email}</strong><small>{formatDate(item.createdAt)}</small></li>
        )) : <li className="empty-state">No subscribers yet.</li>}
      </ul>
    </div>
  );
}

export { AdminLoginPage, AdminDashboardPage, AdminProtectedRoute };
