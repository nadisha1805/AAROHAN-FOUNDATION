import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  HandHelping,
  HeartHandshake,
  MapPin,
  Menu,
  Phone,
  Sparkles,
  X,
} from 'lucide-react';
import { apiGet, apiPost } from './api';
import { AdminDashboardPage, AdminLoginPage, AdminProtectedRoute } from './admin';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Our Causes', to: '/causes' },
  { label: 'Campaigns', to: '/campaigns' },
  { label: 'Our Impact', to: '/impact' },
  { label: 'Stories', to: '/stories' },
  { label: 'Events', to: '/events' },
  { label: 'Volunteer', to: '/volunteer' },
  { label: 'Contact Us', to: '/contact' },
];

function getCampaignProgress(campaign: { raisedAmount: number; goalAmount: number }) {
  if (!campaign.goalAmount) return 0;
  return Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function PageHeader({ title, subtitle, eyebrow }: { title: string; subtitle: string; eyebrow?: string }) {
  return (
    <div className="page-hero">
      <div className="container">
        <div className="section-intro narrow">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="announcement-bar">
        <div className="container announcement-inner">
          <span>Current campaign: School Kit Drive</span>
          <span>Upcoming activity: Community Health & Wellness Drive</span>
        </div>
      </div>

      <div className="container nav-row">
        <Link to="/" className="brand" aria-label="AAROHAN Foundation home">
          <span className="brand-mark">A</span>
          <span>
            <strong>AAROHAN</strong>
            <small>FOUNDATION</small>
          </span>
        </Link>

        <nav className={`nav ${open ? 'open' : ''}`} aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <Link to="/admin" className="btn btn-secondary small">Admin</Link>
          <Link to="/donate" className="btn btn-primary">Donate Now</Link>
          <button type="button" className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">A</span>
            <span>
              <strong>AAROHAN</strong>
              <small>FOUNDATION</small>
            </span>
          </div>
          <p>
            Every Life Deserves a Better Tomorrow. We build compassionate, human-centered pathways for dignity, opportunity, and hope.
          </p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/causes">Our causes</Link></li>
            <li><Link to="/campaigns">Campaigns</Link></li>
            <li><Link to="/impact">Our impact</Link></li>
          </ul>
        </div>

        <div>
          <h4>Causes</h4>
          <ul className="footer-links">
            <li><Link to="/causes">Education</Link></li>
            <li><Link to="/causes">Healthcare</Link></li>
            <li><Link to="/causes">Food support</Link></li>
            <li><Link to="/causes">Women empowerment</Link></li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul className="footer-links">
            <li>Placeholder address, Bengaluru</li>
            <li>hello@aarohanfoundation.org</li>
            <li>+91 00000 00000</li>
            <li>Mon–Sat, 9:00 AM–6:00 PM</li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <div>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms and Conditions</Link>
          <Link to="/donation-policy">Donation Policy</Link>
        </div>
        <p>© 2026 AAROHAN Foundation. All rights reserved.</p>
      </div>
    </footer>
  );
}

function HomePage() {
  const [causes, setCauses] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [impact, setImpact] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [causeData, campaignData, impactData, storyData, eventData] = await Promise.all([
        apiGet('/causes'),
        apiGet('/campaigns'),
        apiGet('/impact'),
        apiGet('/stories'),
        apiGet('/events'),
      ]);
      setCauses(Array.isArray(causeData) ? causeData : []);
      setCampaigns(Array.isArray(campaignData) ? campaignData : []);
      setImpact(Array.isArray(impactData) ? impactData : []);
      setStories(Array.isArray(storyData) ? storyData : []);
      setEvents(Array.isArray(eventData) ? eventData : []);
      setLoading(false);
    }
    void load();
  }, []);

  const featuredCampaigns = useMemo(() => campaigns.filter((campaign) => campaign.featured), [campaigns]);

  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">AAROHAN FOUNDATION</span>
            <h1>Together, We Can Create a Better Tomorrow.</h1>
            <p>
              Every small act of kindness has the power to change a life. Join AAROHAN Foundation in building a world filled with hope, opportunity, and compassion.
            </p>
            <div className="button-row">
              <Link to="/causes" className="btn btn-primary">Explore Our Causes</Link>
              <Link to="/volunteer" className="btn btn-secondary">Make a Difference</Link>
            </div>
            <div className="hero-meta">
              <div><strong>24+</strong><span>Community programs</span></div>
              <div><strong>8+</strong><span>Regional outreach</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80" alt="Volunteers supporting a community" />
          </div>
        </div>
      </section>

      <section className="section spacing-sm">
        <div className="container" style={{ display: 'grid', gap: '1rem' }}>
          <div className="intro-block">
            <div className="section-intro">
              <span className="eyebrow">About AAROHAN</span>
              <h2>Compassion rooted in action.</h2>
            </div>
            <div className="about-grid">
              <p>
                AAROHAN Foundation is committed to creating inclusive opportunities and strengthening communities through compassionate action. Our work is grounded in care, trust, and long-term impact.
              </p>
              <div className="mission-boxes">
                <div>
                  <strong>Mission</strong>
                  <p>To uplift underserved communities through dignity, access, and opportunity.</p>
                </div>
                <div>
                  <strong>Vision</strong>
                  <p>A world where every individual can thrive with hope, equality, and support.</p>
                </div>
              </div>
            </div>
            <Link to="/about" className="btn btn-secondary">Read More</Link>
          </div>
        </div>
      </section>

      <section className="section muted-bg">
        <div className="container">
          <div className="section-head">
            <div className="section-intro">
              <span className="eyebrow">Our Causes</span>
              <h2>Areas we stand beside.</h2>
            </div>
            <Link to="/causes" className="text-link">View all</Link>
          </div>

          {loading ? <div className="loading">Loading causes…</div> : (
            <div className="card-grid three-col">
              {causes.slice(0, 6).map((cause) => (
                <article key={cause.id} className="info-card">
                  <img src={cause.image} alt={cause.name} />
                  <div className="card-body">
                    <h3>{cause.name}</h3>
                    <p>{cause.description}</p>
                    <Link to={`/causes`} className="text-link">Explore More <ArrowRight size={16} /></Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-intro">
              <span className="eyebrow">Featured Campaigns</span>
              <h2>Active fundraising efforts.</h2>
            </div>
          </div>

          {loading ? <div className="loading">Loading campaigns…</div> : (
            <div className="card-grid three-col">
              {featuredCampaigns.length ? featuredCampaigns.map((campaign) => (
                <article key={campaign.id} className="campaign-card">
                  <img src={campaign.image} alt={campaign.title} />
                  <div className="card-body">
                    <h3>{campaign.title}</h3>
                    <p>{campaign.description}</p>
                    <div className="amount-row">
                      <span>Goal: {formatCurrency(campaign.goalAmount)}</span>
                      <span>Raised: {formatCurrency(campaign.raisedAmount)}</span>
                    </div>
                    <div className="progress-track"><span style={{ width: `${getCampaignProgress(campaign)}%` }} /></div>
                    <Link to={`/campaigns/${campaign.slug}`} className="btn btn-primary small">Donate Now</Link>
                  </div>
                </article>
              )) : <div className="empty-state">No active campaigns available right now.</div>}
            </div>
          )}
        </div>
      </section>

      <section className="section muted-bg">
        <div className="container">
          <div className="section-head">
            <div className="section-intro">
              <span className="eyebrow">Our Impact</span>
              <h2>Demonstration metrics for transparency.</h2>
            </div>
          </div>
          <div className="stats-grid">
            {impact.slice(0, 4).map((item) => (
              <div key={item.id} className="stat-card">
                <strong>{item.metricValue}</strong>
                <span>{item.metricLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-intro">
              <span className="eyebrow">How You Can Help</span>
              <h2>Choose a way to make an impact.</h2>
            </div>
          </div>
          <div className="card-grid three-col">
            <div className="mini-card"><HeartHandshake size={28} /><h3>Donate</h3><p>Support meaningful causes and community programs.</p></div>
            <div className="mini-card"><HandHelping size={28} /><h3>Volunteer</h3><p>Give your time, skills, and compassion to those in need.</p></div>
            <div className="mini-card"><Sparkles size={28} /><h3>Spread Awareness</h3><p>Help our mission reach more people and communities.</p></div>
          </div>
        </div>
      </section>

      <section className="section muted-bg">
        <div className="container">
          <div className="section-head">
            <div className="section-intro">
              <span className="eyebrow">Success Stories</span>
              <h2>Stories of resilience and hope.</h2>
            </div>
          </div>
          <div className="card-grid two-col">
            {stories.slice(0, 2).map((story) => (
              <article key={story.id} className="story-card">
                <img src={story.image} alt={story.title} />
                <div className="card-body">
                  <h3>{story.title}</h3>
                  <p>{story.description}</p>
                  <Link to={`/stories/${story.slug}`} className="text-link">Read story <ArrowRight size={16} /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-intro">
              <span className="eyebrow">Upcoming Events</span>
              <h2>Join the next gathering.</h2>
            </div>
          </div>
          <div className="card-grid two-col">
            {events.slice(0, 2).map((event) => (
              <article key={event.id} className="event-card">
                <img src={event.image} alt={event.title} />
                <div className="card-body">
                  <h3>{event.title}</h3>
                  <div className="meta-row"><CalendarDays size={16} /> {new Date(event.startDate).toLocaleDateString()}</div>
                  <div className="meta-row"><MapPin size={16} /> {event.location}</div>
                  <p>{event.description}</p>
                  <Link to={`/events/${event.slug}`} className="text-link">View Details</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section muted-bg">
        <div className="container newsletter-box">
          <div>
            <span className="eyebrow">Newsletter</span>
            <h2>Stay inspired with updates from our work.</h2>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) {
      setSuccess(false);
      setMessage('Please enter a valid email address.');
      return;
    }

    const result = await apiPost('/newsletter/subscribe', { email });
    setSuccess(Boolean(result.success));
    setMessage(result.message || 'Subscription sent.');
    setEmail('');
  }

  return (
    <form onSubmit={handleSubmit} className="newsletter-form">
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" aria-label="Email address" />
      <button type="submit" className="btn btn-primary">Subscribe</button>
      {message ? <p className={success ? 'success-text' : 'error-text'}>{message}</p> : null}
    </form>
  );
}

function AboutPage() {
  return (
    <>
      <PageHeader title="About AAROHAN Foundation" subtitle="We believe dignity, care, and opportunity should be available to every person, regardless of circumstance." eyebrow="Who we are" />

      <section className="section">
        <div className="container split-layout">
          <div>
            <span className="eyebrow">Our Story</span>
            <h2>Built with compassion, driven by community.</h2>
            <p>AAROHAN Foundation exists to support people facing inequality, exclusion, and hardship. We work in close partnership with communities to meet immediate needs while building lasting pathways toward opportunity.</p>
          </div>
          <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80" alt="Women and community members" className="image-panel" />
        </div>
      </section>

      <section className="section muted-bg">
        <div className="container grid-two">
          <div className="content-card">
            <span className="eyebrow">Mission</span>
            <h3>To uplift underserved communities through dignity, access, and opportunity.</h3>
          </div>
          <div className="content-card">
            <span className="eyebrow">Vision</span>
            <h3>A world where every individual can thrive with hope, equality, and support.</h3>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-intro narrow">
            <span className="eyebrow">Core Values</span>
            <h2>Values that guide every action.</h2>
          </div>
          <div className="card-grid four-col">
            {['Compassion', 'Hope', 'Humanity', 'Equality', 'Empowerment', 'Transparency'].map((value) => (
              <div key={value} className="metric-box">
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section muted-bg">
        <div className="container">
          <div className="section-intro narrow">
            <span className="eyebrow">Our Approach</span>
            <h2>People-first, data-aware, transparent.</h2>
          </div>
          <div className="bullets-box">
            <ul>
              <li>Community consultation and listening-first planning.</li>
              <li>Needs-based program design with practical outreach.</li>
              <li>Regular documentation of progress and learning.</li>
              <li>Transparency around priorities and resource use.</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

function CausesPage() {
  const [causes, setCauses] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void apiGet('/causes').then((data) => setCauses(data as any[]));
  }, []);

  const filtered = causes.filter((cause) => cause.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <PageHeader title="Our Causes" subtitle="We focus on lasting support that helps communities become stronger, safer, and more resilient." eyebrow="What we support" />
      <section className="section">
        <div className="container">
          <div className="filter-bar">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search causes" aria-label="Search causes" />
          </div>
          <div className="card-grid three-col">
            {filtered.map((cause) => (
              <article key={cause.id} className="info-card">
                <img src={cause.image} alt={cause.name} />
                <div className="card-body">
                  <h3>{cause.name}</h3>
                  <p>{cause.description}</p>
                  <Link to={`/causes/${cause.slug}`} className="btn btn-secondary small">View Details</Link>
                </div>
              </article>
            ))}
          </div>
          {!filtered.length ? <div className="empty-state">No causes match your search.</div> : null}
        </div>
      </section>
    </>
  );
}

function CauseDetailPage() {
  const { slug } = useParams();
  const [cause, setCause] = useState<any>(null);

  useEffect(() => {
    void apiGet('/causes').then((data) => {
      const item = (data as any[]).find((entry) => entry.slug === slug);
      setCause(item ?? null);
    });
  }, [slug]);

  if (!cause) return <div className="container section"><div className="empty-state">Cause not found.</div></div>;

  return (
    <>
      <PageHeader title={cause.name} subtitle={cause.description} eyebrow="Cause details" />
      <section className="section">
        <div className="container cause-detail">
          <img src={cause.image} alt={cause.name} className="image-panel" />
          <div>
            <h3>Objectives</h3>
            <ul>
              <li>Expand access to essential services and opportunities.</li>
              <li>Create sustainable support pathways for underserved communities.</li>
              <li>Build partnerships that strengthen local resilience.</li>
            </ul>
            <Link to="/donate" className="btn btn-primary">Donate to this cause</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    void apiGet('/campaigns').then((data) => setCampaigns(data as any[]));
  }, []);

  const filtered = campaigns.filter((campaign) => {
    const matchesStatus = filter === 'all' ? true : campaign.status === filter;
    const matchesSearch = campaign.title.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <PageHeader title="Campaigns" subtitle="Support practical, community-centered initiatives that respond to urgent needs and long-term opportunity." eyebrow="Fundraising" />
      <section className="section">
        <div className="container">
          <div className="filter-bar split-filter">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter campaigns">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
            </select>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search campaigns" aria-label="Search campaigns" />
          </div>
          <div className="card-grid three-col">
            {filtered.map((campaign) => (
              <article key={campaign.id} className="campaign-card">
                <img src={campaign.image} alt={campaign.title} />
                <div className="card-body">
                  <h3>{campaign.title}</h3>
                  <p>{campaign.description}</p>
                  <div className="amount-row">
                    <span>{formatCurrency(campaign.raisedAmount)} raised</span>
                    <span>{formatCurrency(campaign.goalAmount)} target</span>
                  </div>
                  <div className="progress-track"><span style={{ width: `${getCampaignProgress(campaign)}%` }} /></div>
                  <div className="meta-row"><span>Status: {campaign.status}</span></div>
                  <Link to={`/campaigns/${campaign.slug}`} className="btn btn-primary small">Donate</Link>
                </div>
              </article>
            ))}
          </div>
          {!filtered.length ? <div className="empty-state">No campaigns match your filters.</div> : null}
        </div>
      </section>
    </>
  );
}

function CampaignDetailPage() {
  const { slug } = useParams();
  const [campaign, setCampaign] = useState<any>(null);

  useEffect(() => {
    void apiGet('/campaigns').then((data) => {
      const item = (data as any[]).find((entry) => entry.slug === slug);
      setCampaign(item ?? null);
    });
  }, [slug]);

  if (!campaign) return <div className="container section"><div className="empty-state">Campaign not found.</div></div>;

  return (
    <>
      <PageHeader title={campaign.title} subtitle={campaign.description} eyebrow="Campaign details" />
      <section className="section">
        <div className="container campaign-detail">
          <img src={campaign.image} alt={campaign.title} className="image-panel" />
          <div>
            <p><strong>Goal:</strong> {formatCurrency(campaign.goalAmount)}</p>
            <p><strong>Raised:</strong> {formatCurrency(campaign.raisedAmount)}</p>
            <div className="progress-track"><span style={{ width: `${getCampaignProgress(campaign)}%` }} /></div>
            <p><strong>Timeline:</strong> {campaign.startDate} to {campaign.endDate}</p>
            <p><strong>Cause:</strong> {campaign.causeId}</p>
            <Link to="/donate" className="btn btn-primary">Donate Now</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function ImpactPage() {
  const [impact, setImpact] = useState<any[]>([]);

  useEffect(() => {
    void apiGet('/impact').then((data) => setImpact(data as any[]));
  }, []);

  return (
    <>
      <PageHeader title="Our Impact" subtitle="Transparent progress, clear priorities, and community-driven outcomes." eyebrow="Impact and transparency" />
      <section className="section">
        <div className="container stats-grid large-grid">
          {impact.map((item) => (
            <div key={item.id} className="stat-card large-card">
              <strong>{item.metricValue}</strong>
              <span>{item.metricLabel}</span>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function StoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  useEffect(() => {
    void apiGet('/stories').then((data) => setStories(data as any[]));
  }, []);

  return (
    <>
      <PageHeader title="Stories & News" subtitle="Community stories, updates, and moments of hope that show the human impact behind every campaign." eyebrow="Stories" />
      <section className="section">
        <div className="container card-grid two-col">
          {stories.map((story) => (
            <article key={story.id} className="story-card">
              <img src={story.image} alt={story.title} />
              <div className="card-body">
                <h3>{story.title}</h3>
                <p>{story.description}</p>
                <Link to={`/stories/${story.slug}`} className="text-link">Read story</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function StoryDetailPage() {
  const { slug } = useParams();
  const [story, setStory] = useState<any>(null);

  useEffect(() => {
    void apiGet('/stories').then((data) => {
      const item = (data as any[]).find((entry) => entry.slug === slug);
      setStory(item ?? null);
    });
  }, [slug]);

  if (!story) return <div className="container section"><div className="empty-state">Story not found.</div></div>;

  return (
    <>
      <PageHeader title={story.title} subtitle={story.description} eyebrow="Story" />
      <section className="section">
        <div className="container story-detail">
          <img src={story.image} alt={story.title} className="image-panel" />
          <div>
            <p>{story.content}</p>
          </div>
        </div>
      </section>
    </>
  );
}

function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    void apiGet('/events').then((data) => setEvents(data as any[]));
  }, []);

  return (
    <>
      <PageHeader title="Events" subtitle="Join our community workshops, outreach days, and awareness events." eyebrow="Upcoming and past events" />
      <section className="section">
        <div className="container card-grid two-col">
          {events.map((event) => (
            <article key={event.id} className="event-card">
              <img src={event.image} alt={event.title} />
              <div className="card-body">
                <h3>{event.title}</h3>
                <div className="meta-row"><CalendarDays size={16} /> {new Date(event.startDate).toLocaleString()}</div>
                <div className="meta-row"><MapPin size={16} /> {event.location}</div>
                <p>{event.description}</p>
                <Link to={`/events/${event.slug}`} className="text-link">View Details</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function EventDetailPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    void apiGet('/events').then((data) => {
      const item = (data as any[]).find((entry) => entry.slug === slug);
      setEvent(item ?? null);
    });
  }, [slug]);

  if (!event) return <div className="container section"><div className="empty-state">Event not found.</div></div>;

  return (
    <>
      <PageHeader title={event.title} subtitle={event.description} eyebrow="Event details" />
      <section className="section">
        <div className="container event-detail">
          <img src={event.image} alt={event.title} className="image-panel" />
          <div>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Date:</strong> {new Date(event.startDate).toLocaleString()}</p>
            <p>{event.description}</p>
            <Link to="/contact" className="btn btn-primary">Express interest</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function VolunteerPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    interests: '',
    skills: '',
    availability: '',
    message: '',
    consent: false,
  });
  const [status, setStatus] = useState<{ success?: boolean; message?: string }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.consent) {
      setStatus({ success: false, message: 'Please accept the consent checkbox to continue.' });
      return;
    }

    const result = await apiPost('/volunteers', form);
    setStatus({ success: Boolean(result.success), message: result.message || 'Thank you for applying.' });
    if (result.success) {
      setForm({ fullName: '', email: '', phone: '', city: '', interests: '', skills: '', availability: '', message: '', consent: false });
    }
  }

  return (
    <>
      <PageHeader title="Volunteer With Us" subtitle="Share your time, skills, and compassion to create better outcomes for communities in need." eyebrow="Get involved" />
      <section className="section">
        <div className="container volunteer-layout">
          <div>
            <h2>Why volunteer with us?</h2>
            <ul className="bullets-list">
              <li>Support education, health, and community programs.</li>
              <li>Work alongside committed local volunteers and partners.</li>
              <li>Build practical experience while creating positive impact.</li>
            </ul>
          </div>
          <form onSubmit={handleSubmit} className="form-shell">
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" aria-label="Full name" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="Email address" aria-label="Email address" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" aria-label="Phone number" />
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" aria-label="City" />
            <input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder="Areas of interest" aria-label="Areas of interest" />
            <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Skills" aria-label="Skills" />
            <input value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} placeholder="Availability" aria-label="Availability" />
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Message" aria-label="Message" rows={4} />
            <label className="checkbox-row"><input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} /> I consent to being contacted regarding volunteer opportunities.</label>
            <button type="submit" className="btn btn-primary">Submit Application</button>
            {status.message ? <p className={status.success ? 'success-text' : 'error-text'}>{status.message}</p> : null}
          </form>
        </div>
      </section>
    </>
  );
}

function ContactPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<{ success?: boolean; message?: string }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await apiPost('/contact', form);
    setStatus({ success: Boolean(result.success), message: result.message || 'We have received your enquiry.' });
    if (result.success) setForm({ fullName: '', email: '', phone: '', subject: '', message: '' });
  }

  return (
    <>
      <PageHeader title="Contact Us" subtitle="We would love to hear from you. Reach out for partnership, volunteering, or general enquiries." eyebrow="Get in touch" />
      <section className="section">
        <div className="container contact-layout">
          <div className="contact-card">
            <h3>Contact information</h3>
            <p><MapPin size={16} /> Placeholder address, Bengaluru, India</p>
            <p><Phone size={16} /> +91 00000 00000</p>
            <p><CircleDollarSign size={16} /> hello@aarohanfoundation.org</p>
            <p>Business hours: Monday to Saturday, 9:00 AM to 6:00 PM</p>
          </div>
          <form onSubmit={handleSubmit} className="form-shell">
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" aria-label="Full name" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="Email" aria-label="Email" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" aria-label="Phone number" />
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" aria-label="Subject" />
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Message" aria-label="Message" rows={5} />
            <button type="submit" className="btn btn-primary">Send Enquiry</button>
            {status.message ? <p className={status.success ? 'success-text' : 'error-text'}>{status.message}</p> : null}
          </form>
        </div>
      </section>
    </>
  );
}

function FaqPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  useEffect(() => {
    void apiGet('/faqs').then((data) => setFaqs(data as any[]));
  }, []);

  return (
    <>
      <PageHeader title="FAQ" subtitle="Helpful answers about our mission, participation, and support pathways." eyebrow="Frequently asked questions" />
      <section className="section">
        <div className="container faq-list">
          {faqs.map((item, index) => (
            <details key={index} className="faq-item" open={index === 0}>
              <summary>{item.question} <ChevronDown size={18} /></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

function PolicyPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} eyebrow="Policy" />
      <section className="section">
        <div className="container policy-box">
          <p>This page contains placeholder content and should be reviewed by the foundation’s legal and organizational stakeholders before publication.</p>
          <p>It covers the essential public-facing information but should be adapted to match the foundation’s official policy language and approval requirements.</p>
        </div>
      </section>
    </>
  );
}

function DonationPage() {
  const navigate = useNavigate();
  const [causes, setCauses] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [amountChoice, setAmountChoice] = useState('1000');
  const [customAmount, setCustomAmount] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    donationType: 'general',
    causeId: '',
    campaignId: '',
    donorMessage: '',
    isAnonymous: false,
    consent: false,
  });
  const [status, setStatus] = useState<{ success?: boolean; message?: string }>({});

  useEffect(() => {
    async function load() {
      const [causeData, campaignData] = await Promise.all([
        apiGet('/causes'),
        apiGet('/campaigns'),
      ]);
      setCauses(Array.isArray(causeData) ? causeData : []);
      setCampaigns(Array.isArray(campaignData) ? campaignData : []);
      setLoading(false);
    }
    void load();
  }, []);

  const amountOptions = [500, 1000, 2500, 5000];

  async function submitDonation(event: React.FormEvent) {
    event.preventDefault();
    const numericAmount = Number(customAmount || amountChoice || 0);

    if (!form.fullName || !form.email || !form.phone || !form.consent) {
      setStatus({ success: false, message: 'Please complete the donor details and consent before continuing.' });
      return;
    }

    if (numericAmount <= 0 || Number.isNaN(numericAmount)) {
      setStatus({ success: false, message: 'Please enter a valid donation amount greater than zero.' });
      return;
    }

    if (form.donationType === 'cause' && !form.causeId) {
      setStatus({ success: false, message: 'Please select a cause to support.' });
      return;
    }

    if (form.donationType === 'campaign' && !form.campaignId) {
      setStatus({ success: false, message: 'Please select a campaign to support.' });
      return;
    }

    try {
      const donationResponse = await apiPost('/donations', {
        donorName: form.fullName,
        donorEmail: form.email,
        donorPhone: form.phone,
        donationType: form.donationType,
        causeId: form.causeId || '',
        campaignId: form.campaignId || '',
        amount: numericAmount,
        donorMessage: form.donorMessage,
        isAnonymous: form.isAnonymous,
        consent: form.consent,
        currency: 'INR',
      });

      if (!donationResponse.success) {
        throw new Error(donationResponse.message || 'Unable to create donation.' );
      }

      const donationId = donationResponse.data?.id;
      if (!donationId) {
        throw new Error('Donation record missing from response.');
      }

      const paymentResponse = await apiPost('/payments/create-order', {
        donationId,
        amount: numericAmount,
        currency: 'INR',
      });

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message || 'Unable to create a payment order.');
      }

      const verifyResponse = await apiPost('/payments/verify', {
        donationId,
        orderId: paymentResponse.data?.orderId,
        paymentId: `demo_payment_${Date.now()}`,
        signature: 'demo_signature',
      });

      if (!verifyResponse.success) {
        throw new Error(verifyResponse.message || 'Donation verification failed.');
      }

      navigate(`/donate/success/${donationId}`);
    } catch (error) {
      setStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Something went wrong while processing your donation.',
      });
    }
  }

  return (
    <>
      <PageHeader title="Support AAROHAN" subtitle="Your generosity can help fund essential care, education, and community support for families who need it most." eyebrow="Make a donation" />
      <section className="section">
        <div className="container donation-layout">
          <div className="donation-summary-card">
            <h3>How your donation helps</h3>
            <ul className="bullets-list">
              <li>Fund crisis response, education support, and nutrition programs.</li>
              <li>Empower communities through sustainable, locally-led support.</li>
              <li>Help create safer, healthier futures for children and families.</li>
            </ul>
            <div className="info-box">
              <strong>Suggested giving</strong>
              <div className="amount-chip-row">
                {amountOptions.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    className={amountChoice === String(amount) ? 'chip active' : 'chip'}
                    onClick={() => {
                      setAmountChoice(String(amount));
                      setCustomAmount('');
                    }}
                  >
                    ₹{amount.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
              <label className="field-label">Custom amount</label>
              <input
                type="number"
                min={100}
                step={50}
                value={customAmount}
                onChange={(event) => {
                  setCustomAmount(event.target.value);
                  if (event.target.value) {
                    setAmountChoice('');
                  }
                }}
                placeholder="Enter amount in INR"
              />
            </div>
          </div>

          <form onSubmit={submitDonation} className="form-shell donation-form">
            <div className="form-grid two-col">
              <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Full name" aria-label="Full name" />
              <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" placeholder="Email address" aria-label="Email address" />
              <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Mobile number" aria-label="Mobile number" />
              <select value={form.donationType} onChange={(event) => setForm({ ...form, donationType: event.target.value })} aria-label="Donation type">
                <option value="general">General donation</option>
                <option value="cause">Cause donation</option>
                <option value="campaign">Campaign donation</option>
              </select>
            </div>

            {form.donationType === 'cause' ? (
              <select value={form.causeId} onChange={(event) => setForm({ ...form, causeId: event.target.value })} aria-label="Select a cause">
                <option value="">Select a cause</option>
                {causes.map((cause) => (
                  <option key={cause.id} value={cause.id}>{cause.name}</option>
                ))}
              </select>
            ) : null}

            {form.donationType === 'campaign' ? (
              <select value={form.campaignId} onChange={(event) => setForm({ ...form, campaignId: event.target.value })} aria-label="Select a campaign">
                <option value="">Select a campaign</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>{campaign.title}</option>
                ))}
              </select>
            ) : null}

            <textarea value={form.donorMessage} onChange={(event) => setForm({ ...form, donorMessage: event.target.value })} rows={4} placeholder="Optional message for the foundation" aria-label="Optional message" />

            <label className="checkbox-row">
              <input type="checkbox" checked={form.isAnonymous} onChange={(event) => setForm({ ...form, isAnonymous: event.target.checked })} />
              Donate anonymously.
            </label>

            <label className="checkbox-row">
              <input type="checkbox" checked={form.consent} onChange={(event) => setForm({ ...form, consent: event.target.checked })} />
              I agree to the donation terms and privacy policy.
            </label>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Preparing donation…' : 'Continue to secure payment'}
            </button>
            {status.message ? <p className={status.success ? 'success-text' : 'error-text'}>{status.message}</p> : null}
          </form>
        </div>
      </section>
    </>
  );
}

function DonationResultPage() {
  const { id, state } = useParams();
  const [donation, setDonation] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const result = await apiGet(`/donations/${id}/status`);
      setDonation(result as any);
    }
    void load();
  }, [id]);

  const statusLabel = state === 'success' ? 'Payment verified' : state === 'pending' ? 'Payment pending' : 'Payment not completed';
  const title = state === 'success' ? 'Thank you for your generosity' : state === 'pending' ? 'Your payment is being verified' : 'Donation was not completed';

  return (
    <>
      <PageHeader title={title} subtitle="Your support helps AAROHAN Foundation continue its work with compassion and integrity." eyebrow={statusLabel} />
      <section className="section">
        <div className="container policy-box">
          {donation ? (
            <>
              <p><strong>Donation reference:</strong> {donation.paymentReference || donation.id}</p>
              <p><strong>Amount:</strong> ₹{Number(donation.amount || 0).toLocaleString('en-IN')}</p>
              <p><strong>Status:</strong> {donation.paymentStatus}</p>
              {state === 'success' ? <Link to="/campaigns" className="btn btn-primary">Explore campaigns</Link> : <Link to="/donate" className="btn btn-primary">Try again</Link>}
            </>
          ) : (
            <p>Loading donation details…</p>
          )}
        </div>
      </section>
    </>
  );
}

function AppRoutes() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/causes" element={<CausesPage />} />
          <Route path="/causes/:slug" element={<CauseDetailPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:slug" element={<CampaignDetailPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/stories/:slug" element={<StoryDetailPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:slug" element={<EventDetailPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/privacy-policy" element={<PolicyPage title="Privacy Policy" subtitle="Placeholder content requiring legal review before publication." />} />
          <Route path="/terms" element={<PolicyPage title="Terms and Conditions" subtitle="Placeholder content requiring legal review before publication." />} />
          <Route path="/donation-policy" element={<PolicyPage title="Donation Policy" subtitle="Placeholder content requiring approval before publication." />} />
          <Route path="/donate" element={<DonationPage />} />
          <Route path="/donate/:state/:id" element={<DonationResultPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/*" element={<AdminProtectedRoute><AdminDashboardPage /></AdminProtectedRoute>} />
          <Route path="/admin" element={<AdminProtectedRoute><AdminDashboardPage /></AdminProtectedRoute>} />
          <Route path="*" element={<PageHeader title="Page Not Found" subtitle="The page you requested could not be located." eyebrow="404" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
