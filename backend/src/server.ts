import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { campaigns, causes, eventItems, faqs, impactUpdates, stories } from './data/mockData.js';

const app = express();
const port = Number(process.env.PORT ?? 5000);

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
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
});

const contactSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7).optional().or(z.literal('')),
  subject: z.string().min(3),
  message: z.string().min(10),
});

const newsletterSchema = z.object({
  email: z.string().email(),
});

const inMemoryStore = {
  volunteers: [] as Array<Record<string, unknown>>,
  contacts: [] as Array<Record<string, unknown>>,
  newsletter: [] as Array<Record<string, unknown>>,
};

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'AAROHAN Foundation API is running.' });
});

app.get('/api/causes', (_req, res) => {
  res.json({ success: true, data: causes, count: causes.length });
});

app.get('/api/causes/:slug', (req, res) => {
  const item = causes.find((cause) => cause.slug === req.params.slug);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Cause not found.' });
  }
  return res.json({ success: true, data: item });
});

app.get('/api/campaigns', (_req, res) => {
  res.json({ success: true, data: campaigns, count: campaigns.length });
});

app.get('/api/campaigns/featured', (_req, res) => {
  const featured = campaigns.filter((campaign) => campaign.featured);
  res.json({ success: true, data: featured, count: featured.length });
});

app.get('/api/campaigns/:slug', (req, res) => {
  const item = campaigns.find((campaign) => campaign.slug === req.params.slug);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Campaign not found.' });
  }
  return res.json({ success: true, data: item });
});

app.get('/api/impact', (_req, res) => {
  res.json({ success: true, data: impactUpdates, count: impactUpdates.length });
});

app.get('/api/stories', (_req, res) => {
  res.json({ success: true, data: stories, count: stories.length });
});

app.get('/api/stories/:slug', (req, res) => {
  const item = stories.find((story) => story.slug === req.params.slug);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Story not found.' });
  }
  return res.json({ success: true, data: item });
});

app.get('/api/events', (_req, res) => {
  res.json({ success: true, data: eventItems, count: eventItems.length });
});

app.get('/api/events/:slug', (req, res) => {
  const item = eventItems.find((event) => event.slug === req.params.slug);
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
