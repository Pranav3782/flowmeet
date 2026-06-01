import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.activityLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.calendarIntegration.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.meetingSummary.deleteMany({});
  await prisma.meetingParticipant.deleteMany({});
  await prisma.meeting.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  console.log('Seeding database...');

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'FlowMeet AI Corp',
    },
  });
  console.log(`Created Organization: ${org.name}`);

  // 2. Create Users (Admin, Manager, Member)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@flowmeet.ai',
      name: 'Sarah Jenkins',
      passwordHash,
      role: 'ADMIN',
      organizationId: org.id,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@flowmeet.ai',
      name: 'David Miller',
      passwordHash,
      role: 'MANAGER',
      organizationId: org.id,
    },
  });

  const member = await prisma.user.create({
    data: {
      email: 'member@flowmeet.ai',
      name: 'Alex Rivera',
      passwordHash,
      role: 'MEMBER',
      organizationId: org.id,
    },
  });
  console.log('Created Users: Admin (Sarah), Manager (David), Member (Alex)');

  // 3. Create Clients in various onboarding stages
  const clientAcme = await prisma.client.create({
    data: {
      companyName: 'Acme Corp',
      contactPerson: 'Wile E. Coyote',
      email: 'wile@acme.com',
      phone: '+1 (555) 123-4567',
      industry: 'Manufacturing & Tech',
      onboardingStage: 'MEETING_SCHEDULED',
      organizationId: org.id,
    },
  });

  const clientGlobex = await prisma.client.create({
    data: {
      companyName: 'Globex Corporation',
      contactPerson: 'Hank Scorpio',
      email: 'scorpio@globex.co',
      phone: '+1 (555) 987-6543',
      industry: 'Energy & Infrastructure',
      onboardingStage: 'DISCOVERY_COMPLETED',
      organizationId: org.id,
    },
  });

  const clientInitech = await prisma.client.create({
    data: {
      companyName: 'Initech',
      contactPerson: 'Peter Gibbons',
      email: 'peter@initech.com',
      phone: '+1 (555) 456-7890',
      industry: 'Enterprise Software',
      onboardingStage: 'SETUP_STARTED',
      organizationId: org.id,
    },
  });

  const clientHooli = await prisma.client.create({
    data: {
      companyName: 'Hooli',
      contactPerson: 'Gavin Belson',
      email: 'gavin@hooli.xyz',
      phone: '+1 (555) 111-2222',
      industry: 'Internet & Search',
      onboardingStage: 'TRAINING_COMPLETED',
      organizationId: org.id,
    },
  });

  const clientUmbrella = await prisma.client.create({
    data: {
      companyName: 'Umbrella Corp',
      contactPerson: 'Albert Wesker',
      email: 'wesker@umbrella.com',
      phone: '+1 (555) 666-6666',
      industry: 'Biotech & Pharma',
      onboardingStage: 'ONBOARDING_COMPLETED',
      organizationId: org.id,
    },
  });
  console.log('Created 5 Clients in various onboarding stages.');

  // 4. Create Meetings (Completed & Upcoming)
  // Meeting 1: Discovery with Globex (Completed yesterday)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(10, 0, 0, 0);

  const meetGlobex = await prisma.meeting.create({
    data: {
      title: 'Discovery Call with Globex',
      purpose: 'Explore cloud infrastructure onboarding and core networking dependencies.',
      meetingType: 'DISCOVERY',
      date: yesterday,
      startTime: '10:00 AM',
      duration: 45,
      timezone: 'America/New_York',
      status: 'COMPLETED',
      hostId: manager.id,
      clientId: clientGlobex.id,
    },
  });

  await prisma.meetingParticipant.createMany({
    data: [
      { meetingId: meetGlobex.id, name: 'David Miller', email: 'manager@flowmeet.ai', role: 'HOST' },
      { meetingId: meetGlobex.id, name: 'Hank Scorpio', email: 'scorpio@globex.co', role: 'ATTENDEE' },
    ],
  });

  // Create AI Summary for Globex Discovery Call
  await prisma.meetingSummary.create({
    data: {
      meetingId: meetGlobex.id,
      summary: 'Productive discovery meeting discussing Globex\'s migration of their main operations pipeline. They need highly secure, scalable cloud scheduling and automated meeting workflow triggers to handle high volumes of tasks.',
      discussion: JSON.stringify([
        'Hank outlined their current bottleneck: team scheduling coordination is broken.',
        'They are looking for Cal.com architecture that connects directly to their onboarding workflows.',
        'Security, custom subdomains, and JWT role access were identified as critical priorities.'
      ]),
      decisions: JSON.stringify([
        'Proceed with dedicated cloud sandbox environment.',
        'Use custom flowmeet scheduler configurations for their internal CS team.'
      ]),
      risks: JSON.stringify([
        'Tight timeline: Scorpio wants deployment within 2 weeks.',
        'High compliance burden: requires strict SOC2 data security standards.'
      ]),
      questions: JSON.stringify([
        'Do we need standard Active Directory or SSO integrations immediately?'
      ]),
      nextSteps: JSON.stringify([
        'Sarah Jenkins to schedule a technical architecture review.',
        'David Miller to compile the commercial pilot contract proposal.'
      ]),
    },
  });

  // Meeting 2: Demo with Initech (Completed)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  threeDaysAgo.setHours(14, 0, 0, 0);

  const meetInitech = await prisma.meeting.create({
    data: {
      title: 'Workflow Demo with Initech',
      purpose: 'Demonstrate automated task creation and Kanban board onboarding configurations.',
      meetingType: 'DEMO',
      date: threeDaysAgo,
      startTime: '02:00 PM',
      duration: 30,
      timezone: 'America/Chicago',
      status: 'COMPLETED',
      hostId: member.id,
      clientId: clientInitech.id,
    },
  });

  await prisma.meetingParticipant.createMany({
    data: [
      { meetingId: meetInitech.id, name: 'Alex Rivera', email: 'member@flowmeet.ai', role: 'HOST' },
      { meetingId: meetInitech.id, name: 'Peter Gibbons', email: 'peter@initech.com', role: 'ATTENDEE' },
    ],
  });

  await prisma.meetingSummary.create({
    data: {
      meetingId: meetInitech.id,
      summary: 'Demonstrated the automatic task extraction pipeline. Peter is highly interested in reducing manual status reporting by syncing booking events directly to developer action items.',
      discussion: JSON.stringify([
        'Showed the standard Kanban drag-and-drop mechanics.',
        'Reviewed the email notifications fired at 24h, 1h, and 30m intervals.'
      ]),
      decisions: JSON.stringify([
        'Initech will start a 14-day trial focusing on task management integration.'
      ]),
      risks: JSON.stringify([
        'Peter mentioned his manager, Lumbergh, might resist workflow shifts unless reports are clear.'
      ]),
      questions: JSON.stringify([
        'Can we export the analytics charts directly as PDF reports?'
      ]),
      nextSteps: JSON.stringify([
        'Create customized developer onboarding template for their software engineers.'
      ]),
    },
  });

  // Meeting 3: Upcoming meeting with Acme Corp
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(11, 0, 0, 0);

  const meetAcme = await prisma.meeting.create({
    data: {
      title: 'Discovery & Onboarding: Acme Corp',
      purpose: 'Kickoff meeting to map out onboarding stages and technical requirements.',
      meetingType: 'DISCOVERY',
      date: tomorrow,
      startTime: '11:00 AM',
      duration: 60,
      timezone: 'America/Los_Angeles',
      status: 'SCHEDULED',
      hostId: manager.id,
      clientId: clientAcme.id,
    },
  });

  await prisma.meetingParticipant.createMany({
    data: [
      { meetingId: meetAcme.id, name: 'David Miller', email: 'manager@flowmeet.ai', role: 'HOST' },
      { meetingId: meetAcme.id, name: 'Wile E. Coyote', email: 'wile@acme.com', role: 'ATTENDEE' },
    ],
  });

  // Meeting 4: Onboarding Call with Hooli (Completed)
  const fourDaysAgo = new Date();
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
  fourDaysAgo.setHours(16, 0, 0, 0);

  const meetHooli = await prisma.meeting.create({
    data: {
      title: 'Hooli Onboarding Kickoff',
      purpose: 'Technical setup of calendar integrations.',
      meetingType: 'ONBOARDING',
      date: fourDaysAgo,
      startTime: '04:00 PM',
      duration: 30,
      timezone: 'America/Los_Angeles',
      status: 'COMPLETED',
      hostId: admin.id,
      clientId: clientHooli.id,
    },
  });

  await prisma.meetingParticipant.createMany({
    data: [
      { meetingId: meetHooli.id, name: 'Sarah Jenkins', email: 'admin@flowmeet.ai', role: 'HOST' },
      { meetingId: meetHooli.id, name: 'Gavin Belson', email: 'gavin@hooli.xyz', role: 'ATTENDEE' },
    ],
  });

  await prisma.meetingSummary.create({
    data: {
      meetingId: meetHooli.id,
      summary: 'Successful technical setup. Gavin confirmed that their Outlook calendars are fully integrated. We resolved a slight timezone mismatch during the booking flow.',
      discussion: JSON.stringify([
        'Configured calendar sync permissions.',
        'Verified real-time multi-side notifications.'
      ]),
      decisions: JSON.stringify([
        'Outlook will be their primary corporate calendar foundation.'
      ]),
      risks: JSON.stringify([]),
      questions: JSON.stringify([]),
      nextSteps: JSON.stringify([
        'Deliver admin security controls manual to the Hooli IT team.'
      ]),
    },
  });

  // Meeting 5: Upcoming internal sync next week
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 4);
  nextWeek.setHours(9, 30, 0, 0);

  await prisma.meeting.create({
    data: {
      title: 'FlowMeet Core Alignment Sync',
      purpose: 'Review team performance metrics and client onboarding completion rates.',
      meetingType: 'INTERNAL',
      date: nextWeek,
      startTime: '09:30 AM',
      duration: 30,
      timezone: 'UTC',
      status: 'SCHEDULED',
      hostId: admin.id,
      clientId: clientAcme.id, // linked to Acme for DB simplicity
    },
  });

  console.log('Created 5 Meetings (3 Completed with AI summaries, 2 Upcoming).');

  // 5. Create Tasks (Kanban items)
  await prisma.task.createMany({
    data: [
      // Globex tasks
      {
        name: 'Compile Globex Commercial Proposal',
        description: 'Prepare detailed contract proposal for Hank Scorpio based on their 2-week timeline requirement.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        ownerId: manager.id,
        clientId: clientGlobex.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        comments: JSON.stringify([
          { author: 'Sarah Jenkins', text: 'Scorpio seemed highly eager. Let\'s prioritize this ASAP.', time: yesterday.toISOString() }
        ]),
      },
      {
        name: 'SOC2 Security Compliance Package Review',
        description: 'Gather and send over compliance documentation for Globex IT team audit.',
        priority: 'HIGH',
        status: 'PENDING',
        ownerId: admin.id,
        clientId: clientGlobex.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      // Initech tasks
      {
        name: 'Design custom developer onboarding template',
        description: 'Peter requested a template showing task workflows synced from scheduling links.',
        priority: 'MEDIUM',
        status: 'COMPLETED',
        ownerId: member.id,
        clientId: clientInitech.id,
        dueDate: yesterday,
      },
      {
        name: 'Schedule Initech mid-trial review',
        description: 'Book a 15-minute alignment check-in with Peter.',
        priority: 'LOW',
        status: 'REVIEW',
        ownerId: member.id,
        clientId: clientInitech.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      // Hooli tasks
      {
        name: 'Deliver Admin Security Controls Manual',
        description: 'Provide Gavin Belson\'s executive assistant with security whitepaper.',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        ownerId: admin.id,
        clientId: clientHooli.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      // Acme tasks
      {
        name: 'Set up custom booking links for Wile E.',
        description: 'Pre-configure Discovery booking template ahead of tomorrow\'s kickoff call.',
        priority: 'MEDIUM',
        status: 'PENDING',
        ownerId: manager.id,
        clientId: clientAcme.id,
        dueDate: tomorrow,
      },
    ],
  });
  console.log('Created 6 Kanban Tasks across different statuses (Pending, In Progress, Review, Completed).');

  // 6. Create Calendar Integrations
  await prisma.calendarIntegration.createMany({
    data: [
      { userId: admin.id, provider: 'GOOGLE', email: 'sarah.j@flowmeet.ai', accessToken: 'mock_google_token' },
      { userId: manager.id, provider: 'GOOGLE', email: 'david.m@flowmeet.ai', accessToken: 'mock_google_token' },
      { userId: member.id, provider: 'OUTLOOK', email: 'alex.r@flowmeet.ai', accessToken: 'mock_outlook_token' },
    ],
  });

  // 7. Create Activities & Notifications
  await prisma.notification.createMany({
    data: [
      { userId: manager.id, title: 'New Booking Request', message: 'Wile E. Coyote booked a Discovery Call for tomorrow at 11:00 AM.', type: 'MEETING' },
      { userId: manager.id, title: 'AI Summary Generated', message: 'Discovery Call with Globex has been summarized. Action items extracted.', type: 'AI' },
      { userId: admin.id, title: 'Task Deadline Imminent', message: 'Task "SOC2 Security Package Review" is due in 5 days.', type: 'TASK' },
      { userId: member.id, title: 'Client Setup Updated', message: 'Initech moved from "Discovery" to "Setup Started".', type: 'ONBOARDING' },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      { userId: manager.id, action: 'MEETING_COMPLETED', details: 'Completed Globex Discovery Call.' },
      { userId: manager.id, action: 'SUMMARY_GENERATED', details: 'AI summarized meeting and generated 2 actionable tasks.' },
      { userId: member.id, action: 'TASK_COMPLETED', details: 'Completed: "Design custom developer onboarding template".' },
      { userId: admin.id, action: 'USER_REGISTERED', details: 'Admin created a new Member user: Alex Rivera.' },
    ],
  });

  console.log('Database Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
