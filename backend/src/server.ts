import 'dotenv/config';
import crypto from 'node:crypto';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { campaigns, causes, eventItems, faqs, impactUpdates, stories } from './data/mockData.js';

const app = express();
const port = Number(process.env.PORT ?? 5000);
const dataStore = {
  causes: [...causes],
  campaigns: [...campaigns],
  stories: [...stories],
  eventItems: [...eventItems],
  impactUpdates: [...impactUpdates],
};

const adminUsers =
  process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD
    ? [
        {
          id: 'admin-super',
          name: 'AAROHAN Super Admin',
          email: process.env.ADMIN_EMAIL,
          passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
          role: 'Super Admin',
          createdAt: new Date().toISOString(),
        },
      ]
    : [];

const adminSessions = new Map<string, { userId: string; expiresAt: number }>();

function makeSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'item';
}

function formatSummary(items: Array<Record<string, unknown>>, statusValues: string[]) {
  return items.filter((item) => statusValues.includes(String(item.status ?? ''))).length;
}

function buildOverview() {
  const volunteers = (inMemoryStore.volunteers as Array<Record<string, unknown>>).slice();
  const contacts = (inMemoryStore.contacts as Array<Record<string, unknown>>).slice();
  const newsletter = (inMemoryStore.newsletter as Array<Record<string, unknown>>).slice();

  const recentlyUpdatedCampaigns = [...dataStore.campaigns]
    .sort((a, b) => Date.parse(String((b as any).updatedAt ?? b.endDate ?? b.startDate)) - Date.parse(String((a as any).updatedAt ?? a.endDate ?? a.startDate)))
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      updatedAt: (item as any).updatedAt ?? item.endDate ?? new Date().toISOString(),
    }));

  const recentActivity = [
    ...volunteers.slice(0, 2).map((item) => ({
      id: String(item.id),
      label: 'Volunteer update',
      detail: `${String(item.fullName)} • ${String(item.status ?? 'New')}`,
      createdAt: String(item.createdAt ?? new Date().toISOString()),
    })),
    ...contacts.slice(0, 2).map((item) => ({
      id: String(item.id),
      label: 'Enquiry update',
      detail: `${String(item.fullName)} • ${String(item.subject ?? 'General enquiry')}`,
      createdAt: String(item.createdAt ?? new Date().toISOString()),
    })),
  ].sort((a, b) => Date.parse(String(b.createdAt)) - Date.parse(String(a.createdAt))).slice(0, 5);

  return {
    summary: {
      totalCauses: dataStore.causes.length,
      activeCampaigns: dataStore.campaigns.filter((item) => ['active', 'published', 'ongoing'].includes(String(item.status).toLowerCase())).length,
      totalVolunteerApplications: volunteers.length,
      pendingVolunteerApplications: formatSummary(volunteers, ['New', 'Under Review', 'Contacted']),
      totalContactEnquiries: contacts.length,
      unreadPendingEnquiries: formatSummary(contacts, ['New', 'In Progress']),
      publishedStories: dataStore.stories.filter((item) => String(item.status).toLowerCase() === 'published').length,
      upcomingEvents: dataStore.eventItems.filter((item) => String(item.status).toLowerCase() === 'upcoming').length,
      newsletterSubscribers: newsletter.length,
      successfulDonations: getDonationStats().totalSuccessfulDonations,
      totalDonationTransactions: getDonationStats().totalDonationTransactions,
      pendingDonations: getDonationStats().pendingDonations,
      failedDonations: getDonationStats().failedDonations,
    },
    recentVolunteers: volunteers
      .slice()
      .sort((a, b) => Date.parse(String(b.createdAt ?? 0)) - Date.parse(String(a.createdAt ?? 0)))
      .slice(0, 5)
      .map((item) => ({
        id: String(item.id),
        fullName: String(item.fullName ?? 'Volunteer'),
        email: String(item.email ?? 'n/a'),
        status: String(item.status ?? 'New'),
        createdAt: String(item.createdAt ?? new Date().toISOString()),
      })),
    recentEnquiries: contacts
      .slice()
      .sort((a, b) => Date.parse(String(b.createdAt ?? 0)) - Date.parse(String(a.createdAt ?? 0)))
      .slice(0, 5)
      .map((item) => ({
        id: String(item.id),
        fullName: String(item.fullName ?? 'Visitor'),
        email: String(item.email ?? 'n/a'),
        status: String(item.status ?? 'New'),
        subject: String(item.subject ?? 'General enquiry'),
        createdAt: String(item.createdAt ?? new Date().toISOString()),
      })),
    recentCampaigns: recentlyUpdatedCampaigns,
    upcomingEvents: dataStore.eventItems.slice(0, 4).map((item) => ({
      id: item.id,
      title: item.title,
      startDate: item.startDate,
      status: item.status,
    })),
    recentActivity,
  };
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

app.use('/api', publicLimiter);

const volunteerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  city: z.string().min(2),
  interests: z.string().min(2),
  skills: z.string().min(2),
  availability: z.string().min(2),
  message: z.string().optional().or(z.literal('')),
  consent: z.boolean().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

const contactSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7).optional().or(z.literal('')),
  subject: z.string().min(3),
  message: z.string().min(10),
  status: z.string().optional(),
  notes: z.string().optional(),
});

const newsletterSchema = z.object({
  email: z.string().email(),
});

type DonationType = 'general' | 'cause' | 'campaign';
type DonationStatus = 'pending' | 'success' | 'failed' | 'cancelled';

type DonationRecord = {
  id: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  currency: string;
  donationType: DonationType;
  causeId?: string | null;
  campaignId?: string | null;
  paymentStatus: DonationStatus;
  paymentGateway: string;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  paymentReference?: string | null;
  isAnonymous: boolean;
  donorMessage?: string | null;
  consent: boolean;
  createdAt: string;
  updatedAt: string;
};

type DonationSettings = {
  suggestedAmounts: number[];
  minimumDonationAmount: number;
  generalDonationEnabled: boolean;
  campaignDonationEnabled: boolean;
  donationFormMessage: string;
  thankYouMessage: string;
  contactDetails: {
    email: string;
    phone: string;
    address: string;
  };
};

const inMemoryStore = {
  volunteers: [] as Array<Record<string, unknown>>,
  contacts: [] as Array<Record<string, unknown>>,
  newsletter: [] as Array<Record<string, unknown>>,
  donations: [] as DonationRecord[],
};

const donationSettings: DonationSettings = {
  suggestedAmounts: [500, 1000, 2500, 5000],
  minimumDonationAmount: 100,
  generalDonationEnabled: true,
  campaignDonationEnabled: true,
  donationFormMessage: 'Your generosity helps us deliver compassionate support to families, children, and communities with dignity and care.',
  thankYouMessage: 'Thank you for partnering with AAROHAN Foundation to create a better tomorrow.',
  contactDetails: {
    email: 'hello@aarohanfoundation.org',
    phone: '+91 00000 00000',
    address: 'Placeholder address, Bengaluru, India',
  },
};

function parseDonationAmount(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : NaN;
}

function getDonationById(id: string) {
  return inMemoryStore.donations.find((donation) => donation.id === id) ?? null;
}

function buildNewDonationReference() {
  return `AAR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function pickRouteParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function getGatewaySignature(orderId: string, paymentId: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
}

function getDonationStats() {
  const donations = inMemoryStore.donations.slice();
  const successful = donations.filter((item) => item.paymentStatus === 'success');
  const pending = donations.filter((item) => item.paymentStatus === 'pending');
  const failed = donations.filter((item) => item.paymentStatus === 'failed' || item.paymentStatus === 'cancelled');
  const thisMonth = donations.filter((item) => {
    const created = new Date(item.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  const campaignSummary = Array.from(
    new Map(
      donations
        .filter((item) => item.donationType === 'campaign' && item.campaignId)
        .map((item) => [item.campaignId, { campaignId: item.campaignId, total: 0, donations: 0 }]),
    ),
  ).map(([campaignId, summary]) => {
    const campaignDonations = donations.filter((item) => item.campaignId === campaignId && item.paymentStatus === 'success');
    summary.total = campaignDonations.reduce((total, item) => total + item.amount, 0);
    summary.donations = campaignDonations.length;
    return { ...summary };
  });

  return {
    totalSuccessfulDonations: successful.length,
    totalDonationTransactions: donations.length,
    pendingDonations: pending.length,
    failedDonations: failed.length,
    donationsThisMonth: thisMonth,
    totalVerifiedAmount: successful.reduce((sum, item) => sum + item.amount, 0),
    campaignSummary,
  };
}

function getTokenFromRequest(req: Request) {
  const authorizationHeader = req.headers.authorization;
  const authorization = Array.isArray(authorizationHeader) ? authorizationHeader.join(' ') : authorizationHeader ?? '';
  const [scheme, token] = authorization.split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

function sanitizeUser(user: (typeof adminUsers)[number]) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const session = adminSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    adminSessions.delete(token);
    return res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
  }

  const user = adminUsers.find((entry) => entry.id === session.userId);
  if (!user) {
    adminSessions.delete(token);
    return res.status(401).json({ success: false, message: 'User session not found.' });
  }

  (req as Request & { admin?: typeof user }).admin = user;
  return next();
}

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'AAROHAN Foundation API is running.' });
});

app.get('/api/causes', (_req, res) => {
  res.json({ success: true, data: dataStore.causes, count: dataStore.causes.length });
});

app.get('/api/causes/:slug', (req, res) => {
  const item = dataStore.causes.find((cause) => cause.slug === pickRouteParam(req.params.slug));
  if (!item) {
    return res.status(404).json({ success: false, message: 'Cause not found.' });
  }
  return res.json({ success: true, data: item });
});

app.get('/api/campaigns', (_req, res) => {
  res.json({ success: true, data: dataStore.campaigns, count: dataStore.campaigns.length });
});

app.get('/api/campaigns/featured', (_req, res) => {
  const featured = dataStore.campaigns.filter((campaign) => campaign.featured);
  res.json({ success: true, data: featured, count: featured.length });
});

app.get('/api/campaigns/:slug', (req, res) => {
  const item = dataStore.campaigns.find((campaign) => campaign.slug === pickRouteParam(req.params.slug));
  if (!item) {
    return res.status(404).json({ success: false, message: 'Campaign not found.' });
  }
  return res.json({ success: true, data: item });
});

app.get('/api/campaigns/:slug/donation-progress', (req, res) => {
  const item = dataStore.campaigns.find((campaign) => campaign.slug === pickRouteParam(req.params.slug));
  if (!item) {
    return res.status(404).json({ success: false, message: 'Campaign not found.' });
  }

  const verifiedDonations = inMemoryStore.donations.filter((donation) => donation.campaignId === item.id && donation.paymentStatus === 'success');
  const raisedAmount = verifiedDonations.reduce((sum, donation) => sum + donation.amount, 0);
  const progress = item.goalAmount ? Math.min(100, Math.round((raisedAmount / Number(item.goalAmount)) * 100)) : 0;

  return res.json({
    success: true,
    data: {
      slug: item.slug,
      goalAmount: Number(item.goalAmount ?? 0),
      raisedAmount,
      remainingAmount: Math.max(0, Number(item.goalAmount ?? 0) - raisedAmount),
      progress,
      donationCount: verifiedDonations.length,
    },
  });
});

app.get('/api/impact', (_req, res) => {
  res.json({ success: true, data: dataStore.impactUpdates, count: dataStore.impactUpdates.length });
});

app.get('/api/stories', (_req, res) => {
  res.json({ success: true, data: dataStore.stories, count: dataStore.stories.length });
});

app.get('/api/stories/:slug', (req, res) => {
  const item = dataStore.stories.find((story) => story.slug === pickRouteParam(req.params.slug));
  if (!item) {
    return res.status(404).json({ success: false, message: 'Story not found.' });
  }
  return res.json({ success: true, data: item });
});

app.get('/api/events', (_req, res) => {
  res.json({ success: true, data: dataStore.eventItems, count: dataStore.eventItems.length });
});

app.get('/api/events/:slug', (req, res) => {
  const item = dataStore.eventItems.find((event) => event.slug === pickRouteParam(req.params.slug));
  if (!item) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }
  return res.json({ success: true, data: item });
});

app.get('/api/faqs', (_req, res) => {
  res.json({ success: true, data: faqs });
});

app.post('/api/volunteers', (req, res) => {
  const parsed = volunteerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Please provide valid volunteer details.', errors: parsed.error.flatten() });
  }

  const submission = {
    id: crypto.randomUUID(),
    ...parsed.data,
    status: parsed.data.status ?? 'New',
    notes: parsed.data.notes ?? '',
    createdAt: new Date().toISOString(),
  };
  inMemoryStore.volunteers.push(submission);
  return res.status(201).json({ success: true, message: 'Volunteer application submitted successfully.', data: submission });
});

app.post('/api/contact', (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Please provide valid contact details.', errors: parsed.error.flatten() });
  }

  const submission = {
    id: crypto.randomUUID(),
    ...parsed.data,
    status: parsed.data.status ?? 'New',
    notes: parsed.data.notes ?? '',
    createdAt: new Date().toISOString(),
  };
  inMemoryStore.contacts.push(submission);
  return res.status(201).json({ success: true, message: 'Your enquiry has been received. We will respond soon.', data: submission });
});

app.post('/api/newsletter/subscribe', (req, res) => {
  const parsed = newsletterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  const email = parsed.data.email.toLowerCase();
  const exists = inMemoryStore.newsletter.some((entry) => (entry.email as string) === email);
  if (exists) {
    return res.status(409).json({ success: false, message: 'This email is already subscribed.' });
  }

  const record = {
    id: crypto.randomUUID(),
    email,
    createdAt: new Date().toISOString(),
  };
  inMemoryStore.newsletter.push(record);
  return res.status(201).json({ success: true, message: 'Subscribed successfully.', data: record });
});

const donationSchema = z.object({
  donorName: z.string().min(2),
  donorEmail: z.string().email(),
  donorPhone: z.string().min(7),
  donationType: z.enum(['general', 'cause', 'campaign']),
  causeId: z.string().optional().or(z.literal('')),
  campaignId: z.string().optional().or(z.literal('')),
  amount: z.union([z.number(), z.string()]),
  donorMessage: z.string().optional().or(z.literal('')),
  isAnonymous: z.boolean().optional().default(false),
  consent: z.boolean().optional().default(false),
  currency: z.string().optional().default('INR'),
});

const paymentVerificationSchema = z.object({
  donationId: z.string().min(1),
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  paymentId: z.string().optional(),
  orderId: z.string().optional(),
  signature: z.string().optional(),
});

const createOrderSchema = z.object({
  donationId: z.string().min(1),
  amount: z.union([z.number(), z.string()]),
  currency: z.string().optional().default('INR'),
  donorName: z.string().optional(),
  donorEmail: z.string().optional(),
  donorPhone: z.string().optional(),
});

function normalizeDonation(donation: DonationRecord) {
  return {
    ...donation,
    donorName: donation.isAnonymous ? 'Anonymous donor' : donation.donorName,
  };
}

app.post('/api/donations', (req, res) => {
  const parsed = donationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Please provide valid donation details.', errors: parsed.error.flatten() });
  }

  const amount = parseDonationAmount(parsed.data.amount);
  if (!Number.isFinite(amount) || amount < donationSettings.minimumDonationAmount) {
    return res.status(400).json({ success: false, message: `Minimum donation amount is ${donationSettings.minimumDonationAmount}.` });
  }

  if (parsed.data.donationType === 'cause' && !parsed.data.causeId) {
    return res.status(400).json({ success: false, message: 'A cause must be selected for cause donations.' });
  }

  if (parsed.data.donationType === 'campaign' && !parsed.data.campaignId) {
    return res.status(400).json({ success: false, message: 'A campaign must be selected for campaign donations.' });
  }

  if (!parsed.data.consent) {
    return res.status(400).json({ success: false, message: 'Please confirm the donation terms and privacy notice.' });
  }

  const donation: DonationRecord = {
    id: crypto.randomUUID(),
    donorName: parsed.data.donorName.trim(),
    donorEmail: parsed.data.donorEmail.trim(),
    donorPhone: parsed.data.donorPhone.trim(),
    amount,
    currency: parsed.data.currency.toUpperCase(),
    donationType: parsed.data.donationType,
    causeId: parsed.data.causeId || null,
    campaignId: parsed.data.campaignId || null,
    paymentStatus: 'pending',
    paymentGateway: 'razorpay',
    paymentReference: buildNewDonationReference(),
    isAnonymous: Boolean(parsed.data.isAnonymous),
    donorMessage: parsed.data.donorMessage?.trim() || null,
    consent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryStore.donations.push(donation);
  return res.status(201).json({ success: true, message: 'Donation created. Please complete the payment to finalize your support.', data: normalizeDonation(donation) });
});

app.get('/api/donations/:id/status', (req, res) => {
  const donation = getDonationById(pickRouteParam(req.params.id));
  if (!donation) {
    return res.status(404).json({ success: false, message: 'Donation not found.' });
  }

  return res.json({ success: true, data: normalizeDonation(donation) });
});

app.post('/api/donations/:id/verify', (req, res) => {
  const donationId = pickRouteParam(req.params.id);
  const parsed = paymentVerificationSchema.safeParse({ ...req.body, donationId });
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Donation verification details are invalid.', errors: parsed.error.flatten() });
  }

  const donation = getDonationById(parsed.data.donationId);
  if (!donation) {
    return res.status(404).json({ success: false, message: 'Donation not found.' });
  }

  const paymentId = parsed.data.razorpay_payment_id ?? parsed.data.paymentId ?? `demo_payment_${Date.now()}`;
  const orderId = parsed.data.razorpay_order_id ?? parsed.data.orderId ?? donation.gatewayOrderId ?? `demo_order_${Date.now()}`;
  const signature = parsed.data.razorpay_signature ?? parsed.data.signature;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (secret && signature) {
    const expected = getGatewaySignature(orderId, paymentId, secret);
    if (expected !== signature) {
      donation.paymentStatus = 'failed';
      donation.updatedAt = new Date().toISOString();
      return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
    }
  }

  donation.paymentStatus = 'success';
  donation.gatewayOrderId = orderId;
  donation.gatewayPaymentId = paymentId;
  donation.paymentReference = donation.paymentReference || buildNewDonationReference();
  donation.updatedAt = new Date().toISOString();

  return res.json({ success: true, message: 'Payment verified successfully.', data: normalizeDonation(donation) });
});

app.get('/api/donations/:id/receipt', (req, res) => {
  const donation = getDonationById(pickRouteParam(req.params.id));
  if (!donation) {
    return res.status(404).json({ success: false, message: 'Donation not found.' });
  }

  return res.json({
    success: true,
    data: {
      id: donation.id,
      receiptNumber: donation.paymentReference,
      amount: donation.amount,
      currency: donation.currency,
      donorName: donation.isAnonymous ? 'Anonymous donor' : donation.donorName,
      donationType: donation.donationType,
      createdAt: donation.createdAt,
      status: donation.paymentStatus,
      receiptUrl: `/api/donations/${donation.id}/receipt`,
    },
  });
});

app.post('/api/payments/create-order', (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid payment order request.', errors: parsed.error.flatten() });
  }

  const donation = getDonationById(parsed.data.donationId);
  if (!donation) {
    return res.status(404).json({ success: false, message: 'Donation not found.' });
  }

  const amount = parseDonationAmount(parsed.data.amount);
  if (!Number.isFinite(amount) || amount < donationSettings.minimumDonationAmount) {
    return res.status(400).json({ success: false, message: `Invalid donation amount. Minimum accepted is ${donationSettings.minimumDonationAmount}.` });
  }

  const hasLiveCredentials = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  const orderId = hasLiveCredentials ? `order_${crypto.randomUUID().slice(0, 16)}` : `demo_order_${crypto.randomUUID().slice(0, 12)}`;

  donation.gatewayOrderId = orderId;
  donation.paymentStatus = 'pending';
  donation.amount = amount;
  donation.updatedAt = new Date().toISOString();

  return res.json({
    success: true,
    data: {
      orderId,
      amount: Math.round(amount * 100),
      currency: (parsed.data.currency || donation.currency || 'INR').toUpperCase(),
      keyId: process.env.RAZORPAY_KEY_ID || 'demo_key_id',
      mock: !hasLiveCredentials,
      donationId: donation.id,
    },
  });
});

app.post('/api/payments/verify', (req, res) => {
  const parsed = paymentVerificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid payment verification payload.', errors: parsed.error.flatten() });
  }

  const donation = getDonationById(parsed.data.donationId);
  if (!donation) {
    return res.status(404).json({ success: false, message: 'Donation not found.' });
  }

  const paymentId = parsed.data.razorpay_payment_id ?? parsed.data.paymentId ?? `demo_payment_${Date.now()}`;
  const orderId = parsed.data.razorpay_order_id ?? parsed.data.orderId ?? donation.gatewayOrderId ?? `demo_order_${Date.now()}`;
  const signature = parsed.data.razorpay_signature ?? parsed.data.signature;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (secret && signature) {
    const expected = getGatewaySignature(orderId, paymentId, secret);
    if (expected !== signature) {
      donation.paymentStatus = 'failed';
      donation.updatedAt = new Date().toISOString();
      return res.status(400).json({ success: false, message: 'Payment verification failed. Please retry your payment.' });
    }
  }

  donation.paymentStatus = 'success';
  donation.gatewayOrderId = orderId;
  donation.gatewayPaymentId = paymentId;
  donation.paymentReference = donation.paymentReference || buildNewDonationReference();
  donation.updatedAt = new Date().toISOString();

  return res.json({ success: true, message: 'Donation payment verified successfully.', data: normalizeDonation(donation) });
});

app.post('/api/payments/webhook', (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return res.status(200).json({ success: true, message: 'Webhook endpoint ready. No active Razorpay secret configured.' });
  }

  const signatureHeader = req.headers['x-razorpay-signature'];
  const signature = Array.isArray(signatureHeader) ? signatureHeader[0] ?? '' : signatureHeader ?? '';
  const body = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body ?? {});
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');

  if (signature !== expected) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
  }

  try {
    const payload = JSON.parse(body || '{}');
    const payment = payload?.payload?.payment?.entity ?? null;
    const orderId = payment?.order_id;
    if (!orderId) {
      return res.status(200).json({ success: true, message: 'Webhook processed with no payment payload.' });
    }

    const donation = inMemoryStore.donations.find((item) => item.gatewayOrderId === orderId);
    if (!donation) {
      return res.status(200).json({ success: true, message: 'Webhook processed without a matching donation.' });
    }

    const isSuccessful = ['captured', 'authorized'].includes(String(payment.status ?? ''));
    donation.paymentStatus = isSuccessful ? 'success' : 'failed';
    donation.gatewayPaymentId = payment.id ?? donation.gatewayPaymentId ?? null;
    donation.updatedAt = new Date().toISOString();

    return res.status(200).json({ success: true, message: 'Webhook processed successfully.' });
  } catch {
    return res.status(400).json({ success: false, message: 'Webhook payload could not be parsed.' });
  }
});

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

app.post('/api/admin/login', loginLimiter, (req, res) => {
  const parsed = adminLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Enter a valid email and password.' });
  }

  const user = adminUsers.find((entry) => entry.email.toLowerCase() === parsed.data.email.toLowerCase());
  if (!user || !bcrypt.compareSync(parsed.data.password, user.passwordHash)) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = crypto.randomUUID();
  adminSessions.set(token, {
    userId: user.id,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    message: 'Signed in successfully.',
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

app.post('/api/admin/logout', (req, res) => {
  const token = getTokenFromRequest(req);
  if (token) {
    adminSessions.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  const admin = (req as Request & { admin?: (typeof adminUsers)[number] }).admin;
  return res.json({ success: true, data: admin ? sanitizeUser(admin) : null });
});

app.get('/api/admin/donations', requireAdmin, (_req, res) => {
  return res.json({ success: true, data: inMemoryStore.donations.map((donation) => normalizeDonation(donation)) });
});

app.get('/api/admin/donations/:id', requireAdmin, (req, res) => {
  const donation = getDonationById(pickRouteParam(req.params.id));
  if (!donation) {
    return res.status(404).json({ success: false, message: 'Donation not found.' });
  }

  return res.json({ success: true, data: normalizeDonation(donation) });
});

app.get('/api/admin/donations/stats', requireAdmin, (_req, res) => {
  return res.json({ success: true, data: getDonationStats() });
});

app.get('/api/admin/donations/export', requireAdmin, (_req, res) => {
  const rows = inMemoryStore.donations.map((donation) => ({
    id: donation.id,
    donorName: donation.isAnonymous ? 'Anonymous donor' : donation.donorName,
    donorEmail: donation.donorEmail,
    donorPhone: donation.donorPhone,
    amount: donation.amount,
    currency: donation.currency,
    donationType: donation.donationType,
    causeId: donation.causeId ?? '',
    campaignId: donation.campaignId ?? '',
    paymentStatus: donation.paymentStatus,
    paymentGateway: donation.paymentGateway,
    gatewayOrderId: donation.gatewayOrderId ?? '',
    gatewayPaymentId: donation.gatewayPaymentId ?? '',
    createdAt: donation.createdAt,
  }));

  const headers = Object.keys(rows[0] ?? { id: '', donorName: '', donorEmail: '', donorPhone: '', amount: '', currency: '', donationType: '', causeId: '', campaignId: '', paymentStatus: '', paymentGateway: '', gatewayOrderId: '', gatewayPaymentId: '', createdAt: '' });
  const csv = [headers.join(',')]
    .concat(
      rows.map((row) => headers.map((header) => `"${String((row as Record<string, string | number | null>)[header] ?? '').replace(/"/g, '""')}"`).join(',')),
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="aarohan-donations.csv"');
  return res.send(csv);
});

app.get('/api/admin/donation-settings', requireAdmin, (_req, res) => {
  return res.json({ success: true, data: donationSettings });
});

app.put('/api/admin/donation-settings', requireAdmin, (req, res) => {
  Object.assign(donationSettings, {
    ...donationSettings,
    ...req.body,
    contactDetails: {
      ...donationSettings.contactDetails,
      ...(req.body.contactDetails ?? {}),
    },
  });

  return res.json({ success: true, message: 'Donation settings updated.', data: donationSettings });
});

app.get('/api/admin/overview', requireAdmin, (_req, res) => {
  return res.json({ success: true, data: buildOverview() });
});

app.get('/api/admin/causes', requireAdmin, (_req, res) => {
  return res.json({ success: true, data: dataStore.causes });
});

app.post('/api/admin/causes', requireAdmin, (req, res) => {
  const title = String(req.body.title ?? req.body.name ?? '').trim();
  if (!title) {
    return res.status(400).json({ success: false, message: 'Cause title is required.' });
  }

  const item = {
    id: crypto.randomUUID(),
    name: title,
    title,
    slug: String(req.body.slug ?? makeSlug(title)),
    description: String(req.body.description ?? 'New cause description.'),
    shortDescription: String(req.body.shortDescription ?? req.body.description ?? 'New cause description.'),
    category: String(req.body.category ?? 'General'),
    image: String(req.body.image ?? 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80'),
    status: String(req.body.status ?? 'Draft'),
    featured: Boolean(req.body.featured),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dataStore.causes.push(item);
  return res.status(201).json({ success: true, message: 'Cause created successfully.', data: item });
});

app.patch('/api/admin/causes/:id', requireAdmin, (req, res) => {
  const found = dataStore.causes.find((item) => item.id === pickRouteParam(req.params.id));
  if (!found) {
    return res.status(404).json({ success: false, message: 'Cause not found.' });
  }

  Object.assign(found, {
    ...found,
    ...req.body,
    updatedAt: new Date().toISOString(),
    slug: req.body.slug ?? found.slug ?? makeSlug(String(req.body.title ?? found.name ?? 'cause')),
  });

  return res.json({ success: true, message: 'Cause updated successfully.', data: found });
});

app.post('/api/admin/causes/:id/delete', requireAdmin, (req, res) => {
  const index = dataStore.causes.findIndex((item) => item.id === pickRouteParam(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Cause not found.' });
  }

  const [removed] = dataStore.causes.splice(index, 1);
  return res.json({ success: true, message: 'Cause deleted successfully.', data: removed });
});

app.get('/api/admin/campaigns', requireAdmin, (_req, res) => {
  return res.json({ success: true, data: dataStore.campaigns });
});

app.post('/api/admin/campaigns', requireAdmin, (req, res) => {
  const title = String(req.body.title ?? '').trim();
  if (!title) {
    return res.status(400).json({ success: false, message: 'Campaign title is required.' });
  }

  const item = {
    id: crypto.randomUUID(),
    title,
    slug: String(req.body.slug ?? makeSlug(title)),
    description: String(req.body.description ?? 'Campaign description.'),
    image: String(req.body.image ?? 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80'),
    category: String(req.body.category ?? 'General'),
    startDate: String(req.body.startDate ?? new Date().toISOString()),
    endDate: String(req.body.endDate ?? new Date(Date.now() + 86400000 * 30).toISOString()),
    status: String(req.body.status ?? 'Draft'),
    featured: Boolean(req.body.featured),
    goalAmount: Number(req.body.goalAmount ?? 0),
    raisedAmount: Number(req.body.raisedAmount ?? 0),
    causeId: String(req.body.causeId ?? 'cause-edu'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dataStore.campaigns.push(item);
  return res.status(201).json({ success: true, message: 'Campaign created successfully.', data: item });
});

app.patch('/api/admin/campaigns/:id', requireAdmin, (req, res) => {
  const found = dataStore.campaigns.find((item) => item.id === pickRouteParam(req.params.id));
  if (!found) {
    return res.status(404).json({ success: false, message: 'Campaign not found.' });
  }

  Object.assign(found, {
    ...found,
    ...req.body,
    updatedAt: new Date().toISOString(),
    slug: req.body.slug ?? found.slug ?? makeSlug(String(req.body.title ?? 'campaign')),
  });

  return res.json({ success: true, message: 'Campaign updated successfully.', data: found });
});

app.post('/api/admin/campaigns/:id/delete', requireAdmin, (req, res) => {
  const index = dataStore.campaigns.findIndex((item) => item.id === pickRouteParam(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Campaign not found.' });
  }

  const [removed] = dataStore.campaigns.splice(index, 1);
  return res.json({ success: true, message: 'Campaign deleted successfully.', data: removed });
});

app.get('/api/admin/volunteers', requireAdmin, (_req, res) => {
  return res.json({ success: true, data: inMemoryStore.volunteers });
});

app.patch('/api/admin/volunteers/:id', requireAdmin, (req, res) => {
  const item = inMemoryStore.volunteers.find((entry) => entry.id === pickRouteParam(req.params.id));
  if (!item) {
    return res.status(404).json({ success: false, message: 'Volunteer application not found.' });
  }
  Object.assign(item, { ...item, ...req.body, updatedAt: new Date().toISOString() });
  return res.json({ success: true, message: 'Volunteer status updated.', data: item });
});

app.get('/api/admin/enquiries', requireAdmin, (_req, res) => {
  return res.json({ success: true, data: inMemoryStore.contacts });
});

app.patch('/api/admin/enquiries/:id', requireAdmin, (req, res) => {
  const item = inMemoryStore.contacts.find((entry) => entry.id === pickRouteParam(req.params.id));
  if (!item) {
    return res.status(404).json({ success: false, message: 'Enquiry not found.' });
  }
  Object.assign(item, { ...item, ...req.body, updatedAt: new Date().toISOString() });
  return res.json({ success: true, message: 'Enquiry status updated.', data: item });
});

app.get('/api/admin/stories', requireAdmin, (_req, res) => {
  return res.json({ success: true, data: dataStore.stories });
});

app.patch('/api/admin/stories/:id', requireAdmin, (req, res) => {
  const item = dataStore.stories.find((entry) => entry.id === pickRouteParam(req.params.id));
  if (!item) {
    return res.status(404).json({ success: false, message: 'Story not found.' });
  }
  Object.assign(item, { ...item, ...req.body, updatedAt: new Date().toISOString() });
  return res.json({ success: true, message: 'Story updated.', data: item });
});

app.get('/api/admin/events', requireAdmin, (_req, res) => {
  return res.json({ success: true, data: dataStore.eventItems });
});

app.patch('/api/admin/events/:id', requireAdmin, (req, res) => {
  const item = dataStore.eventItems.find((entry) => entry.id === pickRouteParam(req.params.id));
  if (!item) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }
  Object.assign(item, { ...item, ...req.body, updatedAt: new Date().toISOString() });
  return res.json({ success: true, message: 'Event updated.', data: item });
});

app.get('/api/admin/newsletter', requireAdmin, (_req, res) => {
  return res.json({ success: true, data: inMemoryStore.newsletter });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Something went wrong on the server.' });
});

app.listen(port, () => {
  console.log(`AAROHAN Foundation API is running on http://localhost:${port}`);
});
