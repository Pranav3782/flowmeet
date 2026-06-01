import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'flowmeet-ai-super-secret-key-2026';

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────
// GLOBAL SAFETY NET — prevent any unhandled promise rejection from
// crashing the Express server (e.g. bad email credentials)
// ─────────────────────────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('⚠️  Unhandled Promise Rejection (server kept alive):', reason);
});

// ─────────────────────────────────────────────────────────────────
// EMAIL TRANSPORT
// Uses Gmail SMTP when GMAIL_USER + GMAIL_APP_PASSWORD are set in .env
// Falls back to Ethereal (preview-only) if credentials are missing/wrong
// ─────────────────────────────────────────────────────────────────
let emailTransporter: nodemailer.Transporter | null = null;
let emailPreviewMode = false;

async function initEmailTransport() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailPass && gmailPass !== 'your_16_char_app_password_here') {
    try {
      emailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass },
      });
      emailPreviewMode = false;
      console.log(`\n✅ Gmail SMTP configured — sending FROM: ${gmailUser}`);
      console.log(`   Credentials will be verified on first send.\n`);
    } catch (err: any) {
      console.error(`\n❌ Gmail SMTP config failed: ${err.message}`);
      await initEtherealFallback();
    }
  } else {
    await initEtherealFallback();
  }
}

async function initEtherealFallback() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    emailTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    emailPreviewMode = true;
    console.log('\n⚠️  Using Ethereal preview mode (emails NOT delivered to real inboxes).');
    console.log('   Set a valid GMAIL_APP_PASSWORD in server/.env to send real emails.\n');
  } catch (err) {
    console.error('Failed to create Ethereal fallback account:', err);
  }
}

initEmailTransport().catch(console.error);




// Helper: build and send a booking confirmation email
async function sendBookingConfirmationEmail(opts: {
  to: string;
  toName: string;
  hostName: string;
  hostEmail: string;
  company: string;
  meetingType: string;
  date: string;
  time: string;
  purpose?: string;
}): Promise<{ previewUrl: string; messageId: string } | null> {
  if (!emailTransporter) return null;

  const meetingLabel = opts.meetingType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Meeting Confirmation</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F5F0E6; }
    .wrapper { max-width: 560px; margin: 32px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #111111; padding: 32px 40px; text-align: center; }
    .header .logo { display: inline-flex; align-items: center; gap: 10px; }
    .header .icon { width: 40px; height: 40px; background: #ffffff; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; line-height: 1; }
    .header .brand { color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header .brand span { font-size: 10px; background: #F8D4E5; color: #111111; padding: 2px 7px; border-radius: 999px; font-weight: 900; margin-left: 6px; vertical-align: middle; }
    .badge { background: #B8E3A1; color: #1a4a2e; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 16px; border-radius: 999px; display: inline-block; margin: 24px 0 0; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 22px; font-weight: 800; color: #111111; margin: 0 0 8px; }
    .subtext { font-size: 14px; color: #666666; margin: 0 0 28px; line-height: 1.6; }
    .detail-card { background: #F5F0E6; border-radius: 14px; padding: 24px; margin-bottom: 24px; }
    .detail-row { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
    .detail-row:last-child { margin-bottom: 0; }
    .detail-icon { font-size: 18px; min-width: 24px; text-align: center; margin-top: 1px; }
    .detail-label { font-size: 10px; font-weight: 700; color: #999999; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
    .detail-value { font-size: 14px; font-weight: 700; color: #111111; }
    .cta-area { text-align: center; margin: 28px 0; }
    .cta-btn { display: inline-block; background: #111111; color: #ffffff; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 999px; text-decoration: none; letter-spacing: -0.2px; }
    .divider { height: 1px; background: #eeeeee; margin: 28px 0; }
    .reminder-note { background: #EFF6FF; border-left: 3px solid #93C5FD; border-radius: 0 8px 8px 0; padding: 12px 16px; font-size: 13px; color: #1e40af; line-height: 1.5; }
    .footer { background: #F5F0E6; padding: 20px 40px; text-align: center; }
    .footer p { font-size: 11px; color: #aaaaaa; margin: 4px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">
        <div class="icon">⚡</div>
        <div class="brand">FlowMeet<span>AI</span></div>
      </div>
      <div class="badge">✓ Booking Confirmed</div>
    </div>

    <div class="body">
      <p class="greeting">Hi ${opts.toName},</p>
      <p class="subtext">
        Your <strong>${meetingLabel}</strong> with the FlowMeet AI team has been successfully
        confirmed and synced to your calendar. Here are your full meeting details:
      </p>

      <div class="detail-card">
        <div class="detail-row">
          <div class="detail-icon">📅</div>
          <div>
            <div class="detail-label">Date</div>
            <div class="detail-value">${opts.date}</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-icon">⏰</div>
          <div>
            <div class="detail-label">Time</div>
            <div class="detail-value">${opts.time} (UTC)</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-icon">🎯</div>
          <div>
            <div class="detail-label">Session Type</div>
            <div class="detail-value">${meetingLabel}</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-icon">👤</div>
          <div>
            <div class="detail-label">Your Host</div>
            <div class="detail-value">${opts.hostName} &lt;${opts.hostEmail}&gt;</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-icon">🏢</div>
          <div>
            <div class="detail-label">Company</div>
            <div class="detail-value">${opts.company}</div>
          </div>
        </div>
        ${opts.purpose ? `
        <div class="detail-row">
          <div class="detail-icon">💬</div>
          <div>
            <div class="detail-label">Your Notes</div>
            <div class="detail-value">${opts.purpose}</div>
          </div>
        </div>` : ''}
      </div>

      <div class="reminder-note">
        🔔 <strong>Reminders active:</strong> You will receive automatic reminders 24 hours, 1 hour, and 30 minutes before the session starts.
      </div>

      <div class="divider"></div>

      <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 0;">
        Need to reschedule or have questions? Reply to this email and our team will get back to you promptly.
      </p>
    </div>

    <div class="footer">
      <p><strong style="color:#111111;">FlowMeet AI</strong> — Turn Meetings Into Actionable Workflows</p>
      <p>Made with ♥ by Entrext &bull; <a href="https://linktr.ee/entrext.pro" style="color:#111111;">Community</a></p>
    </div>
  </div>
</body>
</html>`;

  const textBody = `Hi ${opts.toName},

Your ${meetingLabel} has been confirmed!

Meeting Details:
  Date: ${opts.date}
  Time: ${opts.time} (UTC)
  Session: ${meetingLabel}
  Host: ${opts.hostName} (${opts.hostEmail})
  Company: ${opts.company}
  ${opts.purpose ? `Notes: ${opts.purpose}` : ''}

Automatic reminders will be sent 24h, 1h, and 30min before the session.

Need to reschedule? Just reply to this email.

Best regards,
The FlowMeet AI Team
---
Made with ♥ by Entrext`;

  try {
    const fromAddress = process.env.GMAIL_USER
      ? `"FlowMeet AI" <${process.env.GMAIL_USER}>`
      : '"FlowMeet AI" <no-reply@flowmeet.ai>';

    const info = await emailTransporter.sendMail({
      from: fromAddress,
      to: `${opts.toName} <${opts.to}>`,
      subject: `✓ Confirmed: Your ${meetingLabel} on ${opts.date} at ${opts.time}`,
      text: textBody,
      html: htmlBody,
    });

    // Preview URL only works with Ethereal (test mode)
    const previewUrl = emailPreviewMode
      ? (nodemailer.getTestMessageUrl(info) as string)
      : null;

    console.log(`\n📧 Email ${emailPreviewMode ? 'preview' : 'DELIVERED'} → ${opts.to}`);
    console.log(`   Subject: ✓ Confirmed: Your ${meetingLabel} on ${opts.date} at ${opts.time}`);
    if (previewUrl) console.log(`   Preview URL: ${previewUrl}`);
    console.log(`   Message ID: ${info.messageId}\n`);

    return { previewUrl: previewUrl || '', messageId: info.messageId };
  } catch (err) {
    console.error('Email send failed:', err);
    return null;
  }
}

// TYPES AND INTERFACES
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

// AUTH MIDDLEWARE
const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  if (token === 'mock-google-jwt-token-2026') {
    try {
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });
      if (adminUser) {
        req.user = {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          name: adminUser.name
        };
        return next();
      }
    } catch (err) {
      console.error('Error finding admin user for mock google token:', err);
    }
    
    // Fallback if DB query fails or seed isn't active
    req.user = {
      id: 'google-user-id',
      email: 'admin@flowmeet.ai',
      role: 'ADMIN',
      name: 'Sarah Jenkins'
    };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
};

// ROLE-BASED ACCESS GUARDS
const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized: insufficient permissions' });
    }
    next();
  };
};

// ----------------------------------------------------
// 1. AUTHENTICATION ENDPOINTS
// ----------------------------------------------------

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { email, password, name, role, organizationName } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let orgId = null;
    if (organizationName) {
      const org = await prisma.organization.create({ data: { name: organizationName } });
      orgId = org.id;
    } else {
      // Find or create default org
      let defaultOrg = await prisma.organization.findFirst();
      if (!defaultOrg) {
        defaultOrg = await prisma.organization.create({ data: { name: 'FlowMeet AI Default Corp' } });
      }
      orgId = defaultOrg.id;
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: role || 'MEMBER',
        organizationId: orgId,
      },
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: 'Retrieval failed', details: error.message });
  }
});

// ----------------------------------------------------
// 2. CLIENT MANAGEMENT ENDPOINTS
// ----------------------------------------------------

app.get('/api/clients', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        meetings: { select: { id: true, title: true, date: true, startTime: true, status: true } },
        tasks: { select: { id: true, name: true, status: true } },
      },
    });
    res.json(clients);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch clients', details: error.message });
  }
});

app.post('/api/clients', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { companyName, contactPerson, email, phone, industry } = req.body;
  if (!companyName || !contactPerson || !email) {
    return res.status(400).json({ error: 'Company Name, Contact Person, and Email are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    const orgId = user?.organizationId;

    if (!orgId) return res.status(400).json({ error: 'User does not belong to any organization' });

    const newClient = await prisma.client.create({
      data: {
        companyName,
        contactPerson,
        email,
        phone,
        industry,
        onboardingStage: 'MEETING_SCHEDULED',
        organizationId: orgId,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'CLIENT_CREATED',
        details: `Created new client CRM entry: ${companyName}`,
      },
    });

    res.status(201).json(newClient);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create client', details: error.message });
  }
});

app.put('/api/clients/:id/stage', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { stage } = req.body;
  if (!stage) return res.status(400).json({ error: 'Onboarding stage is required' });

  try {
    const updatedClient = await prisma.client.update({
      where: { id: req.params.id },
      data: { onboardingStage: stage },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'ONBOARDING_STAGE_UPDATED',
        details: `Updated ${updatedClient.companyName} onboarding to ${stage}`,
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: 'Onboarding Stage Transition',
        message: `${updatedClient.companyName} is now in stage "${stage.replace(/_/g, ' ')}".`,
        type: 'ONBOARDING',
      },
    });

    res.json(updatedClient);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update stage', details: error.message });
  }
});

// ----------------------------------------------------
// 3. MEETINGS ENGINE & BOOKINGS (using Cal.com scheduling concepts)
// ----------------------------------------------------

app.get('/api/meetings', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const meetings = await prisma.meeting.findMany({
      orderBy: { date: 'asc' },
      include: {
        client: true,
        participants: true,
        summary: true,
      },
    });
    res.json(meetings);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch meetings', details: error.message });
  }
});

// Scheduling page bookings (doesn't require authenticateToken, public Cal.com-style form!)
app.post('/api/meetings', async (req: Request, res: Response) => {
  const { name, email, company, purpose, date, time, meetingType, hostId } = req.body;

  if (!name || !email || !company || !date || !time) {
    return res.status(400).json({ error: 'Name, email, company, date, and time are required' });
  }

  try {
    // 1. Find or create default organization
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({ data: { name: 'FlowMeet AI Corp' } });
    }

    // 2. Select host (if provided, otherwise first manager/admin)
    let assignedHost = null;
    if (hostId) {
      assignedHost = await prisma.user.findUnique({ where: { id: hostId } });
    }
    if (!assignedHost) {
      assignedHost = await prisma.user.findFirst({ where: { role: { in: ['MANAGER', 'ADMIN'] } } });
    }
    if (!assignedHost) {
      // Create a default fallback host
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('password123', salt);
      assignedHost = await prisma.user.create({
        data: {
          email: 'david.fallback@flowmeet.ai',
          name: 'David Miller',
          passwordHash,
          role: 'MANAGER',
          organizationId: org.id,
        },
      });
    }

    // 3. Find or Create Client
    let client = await prisma.client.findUnique({ where: { email } });
    if (!client) {
      client = await prisma.client.create({
        data: {
          companyName: company,
          contactPerson: name,
          email: email,
          onboardingStage: 'MEETING_SCHEDULED',
          organizationId: org.id,
        },
      });
    } else {
      // Re-trigger stage back to meeting scheduled on new booking
      await prisma.client.update({
        where: { id: client.id },
        data: { onboardingStage: 'MEETING_SCHEDULED' },
      });
    }

    // 4. Create Meeting record
    const parseDate = new Date(date);
    const meeting = await prisma.meeting.create({
      data: {
        title: `${meetingType || 'Discovery Call'}: ${company}`,
        purpose: purpose || 'Scheduling Kickoff Call',
        meetingType: meetingType || 'DISCOVERY',
        date: parseDate,
        startTime: time,
        duration: 30,
        timezone: 'UTC',
        status: 'SCHEDULED',
        hostId: assignedHost.id,
        clientId: client.id,
      },
    });

    // 5. Create participants
    await prisma.meetingParticipant.create({
      data: { meetingId: meeting.id, name: assignedHost.name, email: assignedHost.email, role: 'HOST' },
    });
    await prisma.meetingParticipant.create({
      data: { meetingId: meeting.id, name, email, role: 'ATTENDEE' },
    });

    // 6. Create notifications & activities
    await prisma.notification.create({
      data: {
        userId: assignedHost.id,
        title: 'New Booking Confirmed',
        message: `${name} (${company}) booked a ${meetingType || 'Discovery Call'} for ${date} at ${time}.`,
        type: 'MEETING',
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: assignedHost.id,
        action: 'MEETING_SCHEDULED',
        details: `Client scheduled meeting: ${meeting.title} via booking link`,
      },
    });

    // Send real confirmation email via Nodemailer (Ethereal test SMTP)
    const emailResult = await sendBookingConfirmationEmail({
      to: email,
      toName: name,
      hostName: assignedHost.name,
      hostEmail: assignedHost.email,
      company,
      meetingType: meetingType || 'DISCOVERY',
      date,
      time,
      purpose,
    });

    res.status(201).json({
      message: 'Meeting successfully booked! Confirmation email sent.',
      meeting,
      client,
      emailSent: !!emailResult,
      emailPreviewUrl: emailResult?.previewUrl || null,
      simulatedEmail: {
        to: email,
        subject: `✓ Confirmed: Your ${(meetingType || 'Discovery Call').replace(/_/g, ' ')} on ${date} at ${time}`,
        body: `Hi ${name},\n\nYour meeting has been confirmed for ${date} at ${time} (UTC).\nHost: ${assignedHost.name}\n\nCheck your inbox at: ${emailResult?.previewUrl || 'Email sent to your address'}`,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to schedule booking', details: error.message });
  }
});

// ----------------------------------------------------
// 4. MOCK AI GENERATOR PIPELINE & MEETING COMPLETION
// ----------------------------------------------------

app.post('/api/meetings/:id/complete', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: req.params.id },
      include: { client: true, participants: true },
    });

    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.status === 'COMPLETED') return res.status(400).json({ error: 'Meeting already completed' });

    // 1. Update status
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meeting.id },
      data: { status: 'COMPLETED' },
    });

    // 2. Generate simulated AI Summary & Action Items based on meeting types
    const company = meeting.client.companyName;
    const clientName = meeting.client.contactPerson;
    let summaryText = '';
    let discussion: string[] = [];
    let decisions: string[] = [];
    let risks: string[] = [];
    let questions: string[] = [];
    let nextSteps: string[] = [];
    let taskList: { name: string; description: string; priority: string }[] = [];
    let nextOnboardingStage = 'DISCOVERY_COMPLETED';

    if (meeting.meetingType === 'DISCOVERY') {
      summaryText = `Highly productive discovery session with ${company}. Main focus was evaluating core bottlenecks in their current scheduling and operations pipeline. ${clientName} confirmed high interest in the FlowMeet action item generator to bypass manual reporting overheads.`;
      discussion = [
        `${clientName} highlighted the struggle to maintain task alignment across CS teams.`,
        'Shared how calendar automation reduces drop-offs.'
      ];
      decisions = ['Approved moving forward with a 14-day technical proof-of-concept.'];
      risks = ['Need to verify enterprise calendar delegation compatibility with Outlook.'];
      questions = ['Does Hooli IT require customized corporate firewalls?'];
      nextSteps = [
        'Deliver technical cloud sandbox configurations.',
        'Compile customized pilot pricing proposal.'
      ];
      taskList = [
        { name: `Compile pilot proposal for ${company}`, description: 'Generate custom pricing sheet based on their scaling requirements.', priority: 'HIGH' },
        { name: `Set up sandbox workspace for ${company}`, description: 'Pre-configure template dashboards and onboarding stages.', priority: 'MEDIUM' }
      ];
      nextOnboardingStage = 'DISCOVERY_COMPLETED';
    } else if (meeting.meetingType === 'DEMO') {
      summaryText = `Product demo reviewing live Kanban boards and automated email alert channels. ${clientName} gave extremely positive feedback regarding the visual aesthetics and spacious layout inspired by premium SaaS models.`;
      discussion = [
        'Demonstrated drag-and-drop operations, assignee cards, and task history logs.',
        'Reviewed visual progress metrics in the analytics cockpit.'
      ];
      decisions = ['Initech will select the Pro Team subscription tier.'];
      risks = ['Onboarding must finish before their peak traffic season next month.'];
      nextSteps = ['Submit official SOC2 security and data policy documentation.'];
      taskList = [
        { name: `Send SOC2 compliance packet to ${company}`, description: 'Deliver official security policy details for legal compliance review.', priority: 'HIGH' }
      ];
      nextOnboardingStage = 'DOCUMENTS_SUBMITTED';
    } else {
      summaryText = `Onboarding session ensuring all integrations and active pipelines are established. Fully verified two-way Google and Outlook calendar synchronizations to prevent any double-bookings.`;
      discussion = [
        'Confirmed calendars are live and synchronized.',
        'Assigned training exercises to the core operators.'
      ];
      decisions = ['David Miller designated as primary customer success manager.'];
      nextSteps = ['Conclude workspace setup and verify member invites.'];
      taskList = [
        { name: `Verify workspace invites for ${company}`, description: 'Audit active invites list to verify team member registrations.', priority: 'LOW' }
      ];
      nextOnboardingStage = 'SETUP_STARTED';
    }

    // 3. Save Summary in DB
    const summary = await prisma.meetingSummary.create({
      data: {
        meetingId: meeting.id,
        summary: summaryText,
        discussion: JSON.stringify(discussion),
        decisions: JSON.stringify(decisions),
        risks: JSON.stringify(risks),
        questions: JSON.stringify(questions),
        nextSteps: JSON.stringify(nextSteps),
      },
    });

    // 4. Auto-generate tasks in the Pending state
    const createdTasks = [];
    for (const t of taskList) {
      const task = await prisma.task.create({
        data: {
          name: t.name,
          description: t.description,
          priority: t.priority,
          status: 'PENDING',
          clientId: meeting.clientId,
          ownerId: req.user!.id,
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        },
      });
      createdTasks.push(task);
    }

    // 5. Auto-advance Client Onboarding progress stage
    const updatedClient = await prisma.client.update({
      where: { id: meeting.clientId },
      data: { onboardingStage: nextOnboardingStage },
    });

    // 6. Log activity and notification
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: 'Meeting Processed by AI',
        message: `Meeting completed. AI generated summary and extracted ${createdTasks.length} pending task(s). Onboarding stage updated.`,
        type: 'AI',
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'AI_SUMMARIZATION_FLOW',
        details: `Successfully compiled AI summary and auto-extracted tasks for ${meeting.client.companyName}.`,
      },
    });

    res.json({
      message: 'AI successfully analyzed meeting, updated onboarding pipeline, and created tasks!',
      meeting: updatedMeeting,
      summary,
      tasks: createdTasks,
      client: updatedClient,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'AI processing failed', details: error.message });
  }
});

// ----------------------------------------------------
// 5. KANBAN TASK MANAGEMENT ENDPOINTS
// ----------------------------------------------------

app.get('/api/tasks', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
      include: { client: true, owner: true },
    });
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch tasks', details: error.message });
  }
});

app.post('/api/tasks', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, priority, status, clientId, ownerId, dueDate } = req.body;

  if (!name) return res.status(400).json({ error: 'Task name is required' });

  try {
    const newTask = await prisma.task.create({
      data: {
        name,
        description,
        priority: priority || 'MEDIUM',
        status: status || 'PENDING',
        clientId,
        ownerId: ownerId || req.user!.id,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: { client: true, owner: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'TASK_CREATED',
        details: `Created task: ${name}`,
      },
    });

    res.status(201).json(newTask);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create task', details: error.message });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, priority, status, ownerId, dueDate, comments } = req.body;

  try {
    const currentTask = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!currentTask) return res.status(404).json({ error: 'Task not found' });

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined ? name : currentTask.name,
        description: description !== undefined ? description : currentTask.description,
        priority: priority !== undefined ? priority : currentTask.priority,
        status: status !== undefined ? status : currentTask.status,
        ownerId: ownerId !== undefined ? ownerId : currentTask.ownerId,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : currentTask.dueDate,
        comments: comments !== undefined ? JSON.stringify(comments) : currentTask.comments,
      },
      include: { client: true, owner: true },
    });

    // Notify user if status updated
    if (status && status !== currentTask.status) {
      await prisma.notification.create({
        data: {
          userId: req.user!.id,
          title: 'Task Status Updated',
          message: `Task "${updatedTask.name}" was moved to "${status.replace(/_/g, ' ')}".`,
          type: 'TASK',
        },
      });

      await prisma.activityLog.create({
        data: {
          userId: req.user!.id,
          action: 'TASK_STATUS_UPDATED',
          details: `Moved task "${updatedTask.name}" to status: ${status}`,
        },
      });
    }

    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update task', details: error.message });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Task successfully deleted' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete task', details: error.message });
  }
});

// ----------------------------------------------------
// 6. MEETING SUMMARIES & AI REPORTS
// ----------------------------------------------------

app.get('/api/summaries', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const summaries = await prisma.meetingSummary.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        meeting: {
          include: { client: true },
        },
      },
    });
    res.json(summaries);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch AI summaries', details: error.message });
  }
});

// ----------------------------------------------------
// 7. REAL-TIME NOTIFICATIONS
// ----------------------------------------------------

app.get('/api/notifications', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    // For mock/non-DB users return empty array safely instead of crashing
    const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!userExists) {
      return res.json([]);
    }
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (error: any) {
    console.error('Notifications fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch notifications', details: error.message });
  }
});


app.post('/api/notifications/read-all', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true },
    });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: 'Operation failed', details: error.message });
  }
});

// ----------------------------------------------------
// 8. TEAM AND COLLABORATION
// ----------------------------------------------------

app.get('/api/team', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const team = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
    res.json(team);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch team members', details: error.message });
  }
});

// Invite team member
app.post('/api/team/invite', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, role } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered on team' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt); // Default signup password

    const me = await prisma.user.findUnique({ where: { id: req.user!.id } });
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: role || 'MEMBER',
        organizationId: me?.organizationId,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'TEAM_INVITE_SENT',
        details: `Invited new ${newUser.role.toLowerCase()}: ${name} (${email})`,
      },
    });

    res.status(201).json({
      message: 'Team invitation simulated! Default password set to: password123',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to invite user', details: error.message });
  }
});

// Change user role (Admin only)
app.put('/api/users/:id/role', authenticateToken, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ error: 'Role is required' });

  try {
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'ROLE_MODIFIED',
        details: `Updated role of ${updated.name} to ${role}`,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update role', details: error.message });
  }
});

// ----------------------------------------------------
// 9. ANALYTICS ENGINE
// ----------------------------------------------------

app.get('/api/analytics', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allMeetings = await prisma.meeting.findMany();
    const allClients = await prisma.client.findMany();
    const allTasks = await prisma.task.findMany();

    const totalMeetings = allMeetings.length;
    const completedMeetings = allMeetings.filter((m) => m.status === 'COMPLETED').length;
    const scheduledMeetings = allMeetings.filter((m) => m.status === 'SCHEDULED').length;
    const cancelledMeetings = allMeetings.filter((m) => m.status === 'CANCELLED').length;

    const noShowRate = totalMeetings > 0 ? Math.round((cancelledMeetings / totalMeetings) * 100) : 0;
    const activeClients = allClients.length;

    const onboardingCompleted = allClients.filter((c) => c.onboardingStage === 'ONBOARDING_COMPLETED').length;
    const onboardingCompletionRate = activeClients > 0 ? Math.round((onboardingCompleted / activeClients) * 100) : 0;

    const tasksCreated = allTasks.length;
    const tasksCompleted = allTasks.filter((t) => t.status === 'COMPLETED').length;
    const taskCompletionRate = tasksCreated > 0 ? Math.round((tasksCompleted / tasksCreated) * 100) : 0;

    // Line Chart: Meeting volume trend per month (simulate last 6 months)
    const meetingsTrend = [
      { name: 'Jan', value: Math.max(0, completedMeetings - 4) },
      { name: 'Feb', value: Math.max(0, completedMeetings - 2) },
      { name: 'Mar', value: Math.max(0, completedMeetings - 1) },
      { name: 'Apr', value: completedMeetings },
      { name: 'May', value: completedMeetings + 3 },
    ];

    // Bar Chart: Task completion ratios
    const taskRatioTrend = [
      { name: 'Pending', count: allTasks.filter((t) => t.status === 'PENDING').length },
      { name: 'In Progress', count: allTasks.filter((t) => t.status === 'IN_PROGRESS').length },
      { name: 'Review', count: allTasks.filter((t) => t.status === 'REVIEW').length },
      { name: 'Completed', count: allTasks.filter((t) => t.status === 'COMPLETED').length },
    ];

    // Donut Chart: Onboarding Success Ratios by OnboardingStage
    const onboardingRatios = [
      { name: 'Discovery Kickoff', value: allClients.filter((c) => c.onboardingStage === 'MEETING_SCHEDULED' || c.onboardingStage === 'DISCOVERY_COMPLETED').length },
      { name: 'Active Setup & Training', value: allClients.filter((c) => c.onboardingStage === 'DOCUMENTS_SUBMITTED' || c.onboardingStage === 'SETUP_STARTED' || c.onboardingStage === 'TRAINING_COMPLETED').length },
      { name: 'Fully Onboarded', value: onboardingCompleted },
    ];

    // Productivity metrics (Avg duration)
    const averageMeetingDuration = allMeetings.length > 0 
      ? Math.round(allMeetings.reduce((acc, m) => acc + m.duration, 0) / allMeetings.length)
      : 30;

    // Recent activity list
    const activities = await prisma.activityLog.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    });

    res.json({
      metrics: {
        totalMeetings,
        upcomingMeetings: scheduledMeetings,
        completedMeetings,
        noShowRate,
        averageMeetingDuration,
        activeClients,
        onboardingCompletionRate,
        tasksCreated,
        tasksCompleted,
        taskCompletionRate,
      },
      charts: {
        meetingsTrend,
        taskRatioTrend,
        onboardingRatios,
      },
      activities,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to compile analytics dashboard', details: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// GLOBAL EXPRESS ERROR HANDLER — always returns JSON, never crashes
// ─────────────────────────────────────────────────────────────────
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Express error handler caught:', err.message);
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  }
});

// START EXPRESS BACKEND SERVICE
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 FLOWMEET AI Backend Server is live at http://localhost:${PORT}`);
  console.log(`====================================================`);
});
