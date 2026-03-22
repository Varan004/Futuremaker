const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const adminPassword = process.env.ADMIN_PASSWORD || 'futuremakers-admin';
const adminSessionSecret = process.env.ADMIN_SESSION_SECRET || crypto
  .createHash('sha256')
  .update(`${__dirname}:${adminPassword}`)
  .digest('hex');
const adminSessionCookieName = 'futuremakers_admin_session';
const adminSessionTtlMs = 1000 * 60 * 60 * 8;
const teamSessionSecret = process.env.TEAM_SESSION_SECRET || crypto
  .createHash('sha256')
  .update(`${__dirname}:${adminSessionSecret}:team`)
  .digest('hex');
const teamSessionCookieName = 'futuremakers_team_session';
const teamSessionTtlMs = 1000 * 60 * 60 * 8;

let _mongoDb = null;

async function getDb() {
  if (_mongoDb) return _mongoDb;
  if (!MONGODB_URI) throw new Error('MONGODB_URI environment variable is required. See .env.example.');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  _mongoDb = client.db();
  const count = await _mongoDb.collection('teamUsers').countDocuments();
  if (count === 0) {
    await _mongoDb.collection('teamUsers').insertMany(seededTeamUsers.map((u) => normalizeTeamUser(u)));
  }
  return _mongoDb;
}

const defaultPaymentDetails = {
  bankName: 'Bank of Ceylon',
  accountName: 'U.Yethavaran',
  accountNumber: '8502232',
  branchName: 'Jaffna',
  paymentNote: 'Use your application code as the transfer reference.'
};

const pageRoutes = [
  { route: '/', file: 'index.html' },
  { route: '/about-us', file: 'Aboutus.html' },
  { route: '/services', file: 'Service.html' },
  { route: '/opportunity', file: 'Opportunity.html' },
  { route: '/testimonials', file: 'Testimonial.html' },
  { route: '/contact', file: 'Contact.html' },
  { route: '/register', file: 'Register.html' },
  { route: '/admin', file: 'admin.html' },
  { route: '/team', file: 'team.html' }
];

const legacyRedirects = {
  '/Home.html': '/',
  '/index.html': '/',
  '/Aboutus.html': '/about-us',
  '/Service.html': '/services',
  '/Opportunity.html': '/opportunity',
  '/Testimonial.html': '/testimonials',
  '/Contact.html': '/contact',
  '/Register.html': '/register',
  '/admin.html': '/admin',
  '/team.html': '/team'
};

const seededTeamUsers = [
  {
    username: 'teamlead',
    fullName: 'Naveen Rajan',
    role: 'Team Lead',
    department: 'Admissions and Growth',
    email: 'teamlead@futuremakers.local',
    focusArea: 'Registration reviews and partner follow-up',
    welcomeNote: 'Review new registrations first, then coordinate conversions with the rest of the team.',
    metrics: {
      assignedLeads: 18,
      pendingActions: 4,
      completedFollowUps: 26,
      priorityLevel: 'High'
    },
    permissions: [
      'Review registration submissions',
      'Monitor bank transfer confirmations',
      'Coordinate outreach priorities'
    ],
    tasks: [
      {
        title: 'Approve pending bank transfer registrations',
        status: 'Needs review',
        deadline: 'Today'
      },
      {
        title: 'Call shortlisted opportunity candidates',
        status: 'In progress',
        deadline: 'This afternoon'
      },
      {
        title: 'Share daily enrollment update with founder',
        status: 'Scheduled',
        deadline: '6:00 PM'
      }
    ],
    paymentDetails: {
      bankName: 'Bank of Ceylon',
      accountName: 'FutureMakers - Team Lead Desk',
      accountNumber: '8502232',
      branchName: 'Jaffna',
      paymentNote: 'Use transfer note: TEAMLEAD + your application code.'
    },
    salt: '83657b4b50db47d3c2544765434098a7',
    passwordHash: 'b30b69fab8ea98bc6388b2629caa4ab2f39c097b6a480484ac2f04401dd8b75bc199c883d547a5cf7771d7da953e2c0fbb4a02a1bbb46b58d8e0098ac8deee37'
  },
  {
    username: 'coordinator',
    fullName: 'Fathima Nazeera',
    role: 'Program Coordinator',
    department: 'Student Operations',
    email: 'coordinator@futuremakers.local',
    focusArea: 'Student onboarding and communication flow',
    welcomeNote: 'Keep the onboarding lane moving by closing follow-ups and confirming program starts.',
    metrics: {
      assignedLeads: 12,
      pendingActions: 6,
      completedFollowUps: 19,
      priorityLevel: 'Medium'
    },
    permissions: [
      'Track contact submissions',
      'Manage onboarding follow-ups',
      'Share status updates with the team lead'
    ],
    tasks: [
      {
        title: 'Send welcome messages to today\'s registrations',
        status: 'Ready',
        deadline: 'Today'
      },
      {
        title: 'Confirm orientation attendance list',
        status: 'Pending',
        deadline: 'Tomorrow'
      },
      {
        title: 'Update contact notes for unresolved leads',
        status: 'In progress',
        deadline: 'This week'
      }
    ],
    paymentDetails: {
      bankName: 'Commercial Bank',
      accountName: 'FutureMakers - Coordinator Desk',
      accountNumber: '1002387445',
      branchName: 'Colombo Fort',
      paymentNote: 'Use transfer note: COORDINATOR + your application code.'
    },
    salt: '34fcafe857182b84caf998635884a2dd',
    passwordHash: '33c213acdccab8ef86bd9923ae0072b3227ad3cd560631cc92e2aa6762eb5c6c7506b5aa287f9812cd9cbc316e1adeda34ac732fcab151121b89b89e8f97a297'
  },
  {
    username: 'support',
    fullName: 'Kavishka Perera',
    role: 'Support Officer',
    department: 'Student Support',
    email: 'support@futuremakers.local',
    focusArea: 'First-response support and contact triage',
    welcomeNote: 'Handle incoming contact requests quickly and escalate anything payment-related to the coordinator.',
    metrics: {
      assignedLeads: 9,
      pendingActions: 3,
      completedFollowUps: 21,
      priorityLevel: 'Normal'
    },
    permissions: [
      'View contact requests',
      'Log follow-up progress',
      'Escalate registration payment issues'
    ],
    tasks: [
      {
        title: 'Reply to new contact form submissions',
        status: 'Open',
        deadline: 'Today'
      },
      {
        title: 'Prepare FAQ responses for weekend batch',
        status: 'Scheduled',
        deadline: 'Friday'
      },
      {
        title: 'Flag high-intent leads for callback',
        status: 'Pending',
        deadline: 'This evening'
      }
    ],
    paymentDetails: {
      bankName: 'Sampath Bank',
      accountName: 'FutureMakers - Support Desk',
      accountNumber: '3320001982',
      branchName: 'Jaffna City',
      paymentNote: 'Use transfer note: SUPPORT + your application code.'
    },
    salt: '9bdc63073f2665286ed3c0d5cd879040',
    passwordHash: '2bc0ff492c75f75ff37e40a5705b21db543f37e0d336f2a379efc734ece3045c8399c2656962d620409166c067d0bed448583892a66dbbac06c95fd1a70e267e'
  }
];

const siteStats = {
  members: '500+',
  programs: '50+',
  partners: '10+',
  support: '24/7'
};

const programs = [
  {
    slug: 'orientation',
    title: 'Orientation Course',
    fee: 1000,
    category: 'course',
    description: 'A guided starting point for students who want to build online income skills and career direction.'
  },
  {
    slug: 'future-ai',
    title: 'Future in AI',
    fee: 1500,
    category: 'course',
    description: 'An introduction to AI-focused learning paths, practical tools, and modern career opportunities.'
  },
  {
    slug: 'career-guidance',
    title: 'Career Guidance',
    fee: 1200,
    category: 'support',
    description: 'One-to-one support for students who need clarity on skills, direction, and next steps.'
  }
];

const opportunities = [
  {
    id: 'orientation-program',
    title: 'Orientation Program',
    status: 'open',
    description: 'Career direction and part-time earning support for new learners.',
    ctaUrl: '/register'
  },
  {
    id: 'archive-batch-01',
    title: 'Closed Opportunity Archive',
    status: 'closed',
    description: 'Previous application cycle kept for reference and future announcements.',
    ctaUrl: '/opportunity'
  }
];

const feeMap = {
  orientation: 1000,
  'future-ai': 1500,
  'career-guidance': 1200
};

const programLabels = {
  orientation: 'Orientation Course',
  'future-ai': 'Future in AI',
  'career-guidance': 'Career Guidance'
};

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.get(Object.keys(legacyRedirects), (req, res) => {
  res.redirect(301, legacyRedirects[req.path] || '/');
});

pageRoutes.forEach(({ route, file }) => {
  app.get(route, (_req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
});

app.use(express.static(__dirname));

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  return /^[0-9+()\-\s]{7,20}$/.test(value);
}

function sanitizeText(value) {
  return String(value || '').trim();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseCookies(req) {
  const cookieHeader = req.headers.cookie || '';

  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) {
        return cookies;
      }

      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});
}

function passwordMatches(inputPassword) {
  const provided = Buffer.from(sanitizeText(inputPassword), 'utf8');
  const expected = Buffer.from(adminPassword, 'utf8');

  if (provided.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(provided, expected);
}

function createAdminSessionToken() {
  const expiresAt = String(Date.now() + adminSessionTtlMs);
  const signature = crypto
    .createHmac('sha256', adminSessionSecret)
    .update(expiresAt)
    .digest('hex');

  return `${expiresAt}.${signature}`;
}

function hasValidAdminSession(req) {
  const cookies = parseCookies(req);
  const token = cookies[adminSessionCookieName];

  if (!token) {
    return false;
  }

  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature || !/^\d+$/.test(expiresAt)) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', adminSessionSecret)
    .update(expiresAt)
    .digest('hex');

  const providedBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return false;
  }

  return Number(expiresAt) > Date.now();
}

function setAdminSessionCookie(res) {
  res.cookie(adminSessionCookieName, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: adminSessionTtlMs,
    path: '/'
  });
}

function clearAdminSessionCookie(res) {
  res.clearCookie(adminSessionCookieName, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
}

function createPasswordHash(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
}

function teamPasswordMatches(inputPassword, user) {
  const providedHash = createPasswordHash(sanitizeText(inputPassword), user.salt);
  const providedBuffer = Buffer.from(providedHash, 'utf8');
  const expectedBuffer = Buffer.from(user.passwordHash, 'utf8');

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

function createTeamSessionToken(username) {
  const expiresAt = String(Date.now() + teamSessionTtlMs);
  const payload = `${username}:${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', teamSessionSecret)
    .update(payload)
    .digest('hex');

  return `${Buffer.from(payload, 'utf8').toString('base64url')}.${signature}`;
}

function readTeamSession(req) {
  const cookies = parseCookies(req);
  const token = cookies[teamSessionCookieName];

  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  let payload;

  try {
    payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
  } catch {
    return null;
  }

  const [username, expiresAt] = payload.split(':');
  if (!username || !expiresAt || !/^\d+$/.test(expiresAt)) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac('sha256', teamSessionSecret)
    .update(`${username}:${expiresAt}`)
    .digest('hex');

  const providedBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  if (Number(expiresAt) <= Date.now()) {
    return null;
  }

  return { username };
}

function setTeamSessionCookie(res, username) {
  res.cookie(teamSessionCookieName, createTeamSessionToken(username), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: teamSessionTtlMs,
    path: '/'
  });
}

function clearTeamSessionCookie(res) {
  res.clearCookie(teamSessionCookieName, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
}

function requireAdminAuth(req, res, next) {
  if (!hasValidAdminSession(req)) {
    return res.status(401).json({
      error: 'Admin login required.'
    });
  }

  return next();
}

function sanitizeTeamUser(user) {
  if (!user) {
    return null;
  }

  return {
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    department: user.department,
    email: user.email,
    focusArea: user.focusArea,
    welcomeNote: user.welcomeNote,
    metrics: user.metrics || {},
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
    tasks: Array.isArray(user.tasks) ? user.tasks : [],
    paymentDetails: user.paymentDetails || defaultPaymentDetails
  };
}

function sanitizePublicTeamUser(user) {
  if (!user) {
    return null;
  }

  return {
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    paymentDetails: user.paymentDetails || defaultPaymentDetails
  };
}

function normalizePaymentDetails(details) {
  return {
    bankName: sanitizeText(details && details.bankName) || defaultPaymentDetails.bankName,
    accountName: sanitizeText(details && details.accountName) || defaultPaymentDetails.accountName,
    accountNumber: sanitizeText(details && details.accountNumber) || defaultPaymentDetails.accountNumber,
    branchName: sanitizeText(details && details.branchName) || defaultPaymentDetails.branchName,
    paymentNote: sanitizeText(details && details.paymentNote) || defaultPaymentDetails.paymentNote
  };
}

function normalizeTeamUser(user) {
  return {
    ...user,
    paymentDetails: normalizePaymentDetails(user && user.paymentDetails)
  };
}

function generateApplicationCode() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `FM-${datePart}-${randomPart}`;
}

function sortRecordsDescending(records) {
  return [...records].sort((left, right) => (
    new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime()
  ));
}

async function appendRecord(collectionName, record) {
  const db = await getDb();
  await db.collection(collectionName).insertOne({ ...record });
}

async function readRecords(collectionName) {
  const db = await getDb();
  return db.collection(collectionName).find({}, { projection: { _id: 0 } }).toArray();
}

async function readTeamUsers() {
  const db = await getDb();
  const users = await db.collection('teamUsers').find({}, { projection: { _id: 0 } }).toArray();
  return users.map((user) => normalizeTeamUser(user));
}

async function findTeamUser(username) {
  const safeUsername = sanitizeText(username).toLowerCase();
  if (!safeUsername) return null;
  const db = await getDb();
  const user = await db.collection('teamUsers').findOne(
    { username: safeUsername },
    { projection: { _id: 0 } }
  );
  return user ? normalizeTeamUser(user) : null;
}

async function createTeamUser(input) {
  const username = sanitizeText(input.username).toLowerCase();
  const fullName = sanitizeText(input.fullName);
  const email = sanitizeText(input.email).toLowerCase();
  const role = sanitizeText(input.role || 'Team Member');
  const department = sanitizeText(input.department || 'Operations');
  const focusArea = sanitizeText(input.focusArea || 'General follow-ups and coordination');

  if (!/^[a-z0-9._-]{3,24}$/.test(username)) {
    return { error: 'Username must be 3-24 characters and use letters, numbers, dot, underscore, or hyphen.' };
  }

  if (!isNonEmptyString(fullName) || fullName.length < 3) {
    return { error: 'Full name must be at least 3 characters.' };
  }

  if (!isValidEmail(email)) {
    return { error: 'A valid email address is required.' };
  }

  if (!isNonEmptyString(input.password) || sanitizeText(input.password).length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  const db = await getDb();
  const duplicateUsername = await db.collection('teamUsers').findOne({ username });
  if (duplicateUsername) {
    return { error: 'This username is already in use.' };
  }

  const duplicateEmail = await db.collection('teamUsers').findOne({ email });
  if (duplicateEmail) {
    return { error: 'This email is already registered.' };
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = createPasswordHash(sanitizeText(input.password), salt);

  const newUser = {
    username,
    fullName,
    role,
    department,
    email,
    focusArea,
    welcomeNote: `Welcome ${fullName}. Stay focused and keep your daily follow-ups updated.`,
    metrics: {
      assignedLeads: 0,
      pendingActions: 0,
      completedFollowUps: 0,
      priorityLevel: 'Normal'
    },
    permissions: [
      'View your assigned dashboard',
      'Track your follow-up tasks'
    ],
    tasks: [
      {
        title: 'Review today\'s incoming submissions',
        status: 'Pending',
        deadline: 'Today'
      }
    ],
    paymentDetails: {
      bankName: defaultPaymentDetails.bankName,
      accountName: `FutureMakers - ${fullName}`,
      accountNumber: defaultPaymentDetails.accountNumber,
      branchName: defaultPaymentDetails.branchName,
      paymentNote: `Use transfer note: ${username.toUpperCase()} + your application code.`
    },
    salt,
    passwordHash
  };

  await db.collection('teamUsers').insertOne({ ...newUser });

  return { user: newUser };
}

async function resetTeamUserPassword(input) {
  const username = sanitizeText(input.username).toLowerCase();
  const email = sanitizeText(input.email).toLowerCase();
  const newPassword = sanitizeText(input.newPassword);

  if (!isNonEmptyString(username) || !isNonEmptyString(email) || !isNonEmptyString(newPassword)) {
    return { error: 'Username, email, and new password are required.' };
  }

  if (!isValidEmail(email)) {
    return { error: 'A valid email address is required.' };
  }

  if (newPassword.length < 8) {
    return { error: 'New password must be at least 8 characters.' };
  }

  const db = await getDb();
  const teamUser = await db.collection('teamUsers').findOne(
    { username },
    { projection: { _id: 0 } }
  );

  if (!teamUser) {
    return { error: 'No team account found for these details.' };
  }

  if (sanitizeText(teamUser.email).toLowerCase() !== email) {
    return { error: 'No team account found for these details.' };
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = createPasswordHash(newPassword, salt);
  await db.collection('teamUsers').updateOne({ username }, { $set: { salt, passwordHash } });
  return { user: { ...teamUser, salt, passwordHash } };
}

async function getAuthenticatedTeamUser(req) {
  const session = readTeamSession(req);
  if (!session) {
    return null;
  }

  return findTeamUser(session.username);
}

async function requireTeamAuth(req, res, next) {
  const teamUser = await getAuthenticatedTeamUser(req);

  if (!teamUser) {
    return res.status(401).json({
      error: 'Team login required.'
    });
  }

  req.teamUser = teamUser;
  return next();
}

function validateContactPayload(body) {
  const payload = {
    fullName: sanitizeText(body.fullName),
    phone: sanitizeText(body.phone),
    email: sanitizeText(body.email),
    subject: sanitizeText(body.subject),
    message: sanitizeText(body.message)
  };

  if (!isNonEmptyString(payload.fullName)) {
    return { error: 'Full name is required.' };
  }

  if (!isValidPhone(payload.phone)) {
    return { error: 'A valid phone number is required.' };
  }

  if (!isValidEmail(payload.email)) {
    return { error: 'A valid email address is required.' };
  }

  if (!isNonEmptyString(payload.subject)) {
    return { error: 'Subject is required.' };
  }

  if (!isNonEmptyString(payload.message)) {
    return { error: 'Message is required.' };
  }

  return { payload };
}

async function validateRegistrationPayload(body) {
  const payload = {
    firstName: sanitizeText(body.firstName),
    lastName: sanitizeText(body.lastName),
    email: sanitizeText(body.email),
    phone: sanitizeText(body.phone),
    program: sanitizeText(body.program),
    city: sanitizeText(body.city),
    goal: sanitizeText(body.goal),
    paymentMethod: sanitizeText(body.paymentMethod || 'cash'),
    cardName: sanitizeText(body.cardName),
    cardNumber: sanitizeText(body.cardNumber).replace(/\s+/g, ''),
    expMonth: sanitizeText(body.expMonth),
    expYear: sanitizeText(body.expYear),
    transferReference: sanitizeText(body.transferReference),
    payerName: sanitizeText(body.payerName),
    teamUser: sanitizeText(body.teamUser).toLowerCase()
  };

  if (!isNonEmptyString(payload.firstName)) {
    return { error: 'First name is required.' };
  }

  if (!isNonEmptyString(payload.lastName)) {
    return { error: 'Last name is required.' };
  }

  if (!isValidEmail(payload.email)) {
    return { error: 'A valid email address is required.' };
  }

  if (!isValidPhone(payload.phone)) {
    return { error: 'A valid phone number is required.' };
  }

  if (!isNonEmptyString(payload.teamUser)) {
    return { error: 'Please choose the team member who will handle your registration.' };
  }

  const assignedTeamUser = await findTeamUser(payload.teamUser);
  if (!assignedTeamUser) {
    return { error: 'Selected team user was not found. Please refresh and try again.' };
  }

  if (!feeMap[payload.program]) {
    return { error: 'Please choose a valid program.' };
  }

  if (!isNonEmptyString(payload.city)) {
    return { error: 'City is required.' };
  }

  if (!isNonEmptyString(payload.goal)) {
    return { error: 'Career goal is required.' };
  }

  if (!['card', 'cash', 'bank'].includes(payload.paymentMethod)) {
    return { error: 'Please choose a valid payment method.' };
  }

  if (payload.paymentMethod === 'bank') {
    if (!isNonEmptyString(payload.transferReference)) {
      return { error: 'Transfer reference is required for bank transfer.' };
    }

    if (!isNonEmptyString(payload.payerName)) {
      return { error: 'Payer name is required for bank transfer.' };
    }
  }

  if (payload.paymentMethod === 'card') {
    if (!/^\d{13,19}$/.test(payload.cardNumber)) {
      return { error: 'Please enter a valid card number.' };
    }

    if (!isNonEmptyString(payload.cardName)) {
      return { error: 'Card holder name is required.' };
    }

    if (!/^(0[1-9]|1[0-2])$/.test(payload.expMonth)) {
      return { error: 'Expiry month must be in MM format.' };
    }

    if (!/^\d{4}$/.test(payload.expYear)) {
      return { error: 'Expiry year must be in YYYY format.' };
    }
  }

  const amount = feeMap[payload.program];
  const registrationPaymentMeta = payload.paymentMethod === 'card'
    ? {
        cardHolderName: payload.cardName,
        cardLast4: payload.cardNumber.slice(-4)
      }
    : payload.paymentMethod === 'bank'
      ? {
          transferReference: payload.transferReference,
          payerName: payload.payerName
        }
      : {};
  const assignedTeamPaymentDetails = normalizePaymentDetails(assignedTeamUser.paymentDetails);

  return {
    payload: {
      applicationCode: generateApplicationCode(),
      firstName: payload.firstName,
      lastName: payload.lastName,
      fullName: `${payload.firstName} ${payload.lastName}`.trim(),
      email: payload.email,
      phone: payload.phone,
      program: payload.program,
      programLabel: programLabels[payload.program],
      city: payload.city,
      goal: payload.goal,
      paymentMethod: payload.paymentMethod,
      amount,
      paymentDetails: assignedTeamPaymentDetails,
      paymentMeta: registrationPaymentMeta,
      assignedTeamUser: assignedTeamUser.username,
      assignedTeamUserName: assignedTeamUser.fullName || assignedTeamUser.username
    }
  };
}

app.post('/api/contact', async (req, res) => {
  const { error, payload } = validateContactPayload(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const record = {
    id: `contact_${Date.now()}`,
    submittedAt: new Date().toISOString(),
    ...payload
  };

  await appendRecord('contacts', record);
  return res.status(201).json({
    message: 'Your message has been received. Our team will contact you soon.'
  });
});

app.post('/api/registrations', async (req, res) => {
  const { error, payload } = await validateRegistrationPayload(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const record = {
    id: `registration_${Date.now()}`,
    submittedAt: new Date().toISOString(),
    status: payload.paymentMethod === 'card' ? 'payment-captured-locally' : 'pending-review',
    ...payload
  };

  await appendRecord('registrations', record);

  const responseMessage = payload.paymentMethod === 'card'
    ? `Registration saved. Card payment has been marked as received for ${payload.programLabel}.`
    : payload.paymentMethod === 'bank'
      ? `Registration saved. We will verify your bank transfer for ${payload.programLabel}.`
      : `Registration saved. Payment for ${payload.programLabel} is pending.`;

  return res.status(201).json({
    message: responseMessage,
    amount: payload.amount,
    applicationCode: payload.applicationCode,
    assignedTeamUser: payload.assignedTeamUser,
    assignedTeamUserName: payload.assignedTeamUserName,
    paymentDetails: payload.paymentDetails,
  });
});

app.get('/api', async (_req, res) => {
  const [contactSubmissions, registrations] = await Promise.all([
    readRecords('contacts'),
    readRecords('registrations')
  ]);

  res.json({
    name: 'FutureMakers API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      programs: '/api/programs',
      opportunities: '/api/opportunities',
      stats: '/api/stats',
      contact: '/api/contact',
      registrations: '/api/registrations',
      teamSession: '/api/team/session',
      teamPublicUsers: '/api/team/public-users',
      teamRegister: '/api/team/register',
      teamLogin: '/api/team/login',
      teamForgotPassword: '/api/team/forgot-password',
      teamLogout: '/api/team/logout',
      teamDashboard: '/api/team/dashboard'
    },
    totals: {
      contactSubmissions: contactSubmissions.length,
      registrations: registrations.length
    }
  });
});

app.get('/api/programs', (_req, res) => {
  res.json({
    items: programs,
    total: programs.length
  });
});

app.get('/api/opportunities', (_req, res) => {
  const openCount = opportunities.filter((item) => item.status === 'open').length;
  const closedCount = opportunities.filter((item) => item.status === 'closed').length;

  res.json({
    items: opportunities,
    total: opportunities.length,
    summary: {
      open: openCount,
      closed: closedCount
    }
  });
});

app.get('/api/stats', async (_req, res) => {
  const [contactSubmissions, registrations] = await Promise.all([
    readRecords('contacts'),
    readRecords('registrations')
  ]);

  res.json({
    site: siteStats,
    forms: {
      contactSubmissions: contactSubmissions.length,
      registrations: registrations.length
    }
  });
});

app.get('/api/team/public-users', async (_req, res) => {
  const users = await readTeamUsers();

  return res.json({
    items: users.map((user) => sanitizePublicTeamUser(user)).filter(Boolean),
    total: users.length
  });
});

app.get('/api/admin/session', (req, res) => {
  return res.json({
    authenticated: hasValidAdminSession(req)
  });
});

app.post('/api/admin/login', (req, res) => {
  const password = sanitizeText(req.body.password);

  if (!isNonEmptyString(password)) {
    return res.status(400).json({
      error: 'Password is required.'
    });
  }

  if (!passwordMatches(password)) {
    clearAdminSessionCookie(res);
    return res.status(401).json({
      error: 'Invalid admin password.'
    });
  }

  setAdminSessionCookie(res);
  return res.json({
    message: 'Admin login successful.'
  });
});

app.post('/api/admin/logout', (_req, res) => {
  clearAdminSessionCookie(res);
  return res.json({
    message: 'Admin logout successful.'
  });
});

app.get('/api/team/session', async (req, res) => {
  const teamUser = await getAuthenticatedTeamUser(req);

  return res.json({
    authenticated: Boolean(teamUser),
    user: sanitizeTeamUser(teamUser)
  });
});

app.post('/api/team/register', async (req, res) => {
  const { error, user } = await createTeamUser(req.body || {});

  if (error) {
    return res.status(400).json({ error });
  }

  setTeamSessionCookie(res, user.username);
  return res.status(201).json({
    message: 'Team account created successfully.',
    user: sanitizeTeamUser(user)
  });
});

app.post('/api/team/login', async (req, res) => {
  const username = sanitizeText(req.body.username);
  const password = sanitizeText(req.body.password);

  if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
    return res.status(400).json({
      error: 'Username and password are required.'
    });
  }

  const teamUser = await findTeamUser(username);

  if (!teamUser || !teamPasswordMatches(password, teamUser)) {
    clearTeamSessionCookie(res);
    return res.status(401).json({
      error: 'Invalid team username or password.'
    });
  }

  setTeamSessionCookie(res, teamUser.username);
  return res.json({
    message: 'Team login successful.',
    user: sanitizeTeamUser(teamUser)
  });
});

app.post('/api/team/forgot-password', async (req, res) => {
  const { error, user } = await resetTeamUserPassword(req.body || {});

  if (error) {
    clearTeamSessionCookie(res);
    return res.status(400).json({ error });
  }

  clearTeamSessionCookie(res);
  return res.json({
    message: `Password reset successful for ${user.username}. Please login with your new password.`
  });
});

app.post('/api/team/logout', (_req, res) => {
  clearTeamSessionCookie(res);
  return res.json({
    message: 'Team logout successful.'
  });
});

app.get('/api/team/dashboard', requireTeamAuth, async (req, res) => {
  const [contactSubmissions, registrations] = await Promise.all([
    readRecords('contacts'),
    readRecords('registrations')
  ]);
  const sortedContacts = sortRecordsDescending(contactSubmissions);
  const sortedRegistrations = sortRecordsDescending(registrations);
  const teamUsername = sanitizeText(req.teamUser.username).toLowerCase();
  const assignedRegistrations = sortedRegistrations.filter((item) => (
    sanitizeText(item.assignedTeamUser).toLowerCase() === teamUsername
  ));

  return res.json({
    user: sanitizeTeamUser(req.teamUser),
    workspace: {
      contactSubmissions: sortedContacts.length,
      registrations: assignedRegistrations.length,
      latestContact: sortedContacts[0] ? sortedContacts[0].submittedAt : null,
      latestRegistration: assignedRegistrations[0] ? assignedRegistrations[0].submittedAt : null
    },
    recentContacts: sortedContacts.slice(0, 5).map((item) => ({
      fullName: item.fullName,
      subject: item.subject,
      submittedAt: item.submittedAt
    })),
    recentRegistrations: assignedRegistrations.slice(0, 5).map((item) => ({
      fullName: item.fullName,
      programLabel: item.programLabel,
      status: item.status,
      submittedAt: item.submittedAt,
      applicationCode: item.applicationCode
    }))
  });
});

app.put('/api/team/profile', requireTeamAuth, async (req, res) => {
  const fullName = sanitizeText(req.body.fullName);
  const email = sanitizeText(req.body.email).toLowerCase();
  const role = sanitizeText(req.body.role);
  const department = sanitizeText(req.body.department);
  const focusArea = sanitizeText(req.body.focusArea);
  const welcomeNote = sanitizeText(req.body.welcomeNote);

  if (!isNonEmptyString(fullName) || fullName.length < 3) {
    return res.status(400).json({ error: 'Full name must be at least 3 characters.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const teamUsername = sanitizeText(req.teamUser.username).toLowerCase();
  const db = await getDb();
  const emailConflict = await db.collection('teamUsers').findOne(
    { email, username: { $ne: teamUsername } }
  );

  if (emailConflict) {
    return res.status(400).json({ error: 'This email is already registered by another user.' });
  }

  const updates = { fullName, email };
  if (isNonEmptyString(role)) updates.role = role;
  if (isNonEmptyString(department)) updates.department = department;
  if (isNonEmptyString(focusArea)) updates.focusArea = focusArea;
  if (isNonEmptyString(welcomeNote)) updates.welcomeNote = welcomeNote;

  const updatedUser = await db.collection('teamUsers').findOneAndUpdate(
    { username: teamUsername },
    { $set: updates },
    { returnDocument: 'after', projection: { _id: 0 } }
  );

  if (!updatedUser) {
    return res.status(404).json({ error: 'Team user not found.' });
  }

  return res.json({
    message: 'Profile updated successfully.',
    user: sanitizeTeamUser(updatedUser)
  });
});

app.put('/api/team/payment-details', requireTeamAuth, async (req, res) => {
  const incomingDetails = normalizePaymentDetails(req.body || {});

  if (!isNonEmptyString(incomingDetails.accountName)) {
    return res.status(400).json({
      error: 'Account name is required.'
    });
  }

  const teamUsername = sanitizeText(req.teamUser.username).toLowerCase();
  const db = await getDb();
  const updatedUser = await db.collection('teamUsers').findOneAndUpdate(
    { username: teamUsername },
    { $set: { paymentDetails: incomingDetails } },
    { returnDocument: 'after', projection: { _id: 0 } }
  );

  if (!updatedUser) {
    return res.status(404).json({
      error: 'Team user not found.'
    });
  }

  return res.json({
    message: 'Bank details updated successfully.',
    paymentDetails: updatedUser.paymentDetails
  });
});

app.get('/api/admin/submissions', requireAdminAuth, async (_req, res) => {
  const [contactSubmissions, registrations] = await Promise.all([
    readRecords('contacts'),
    readRecords('registrations')
  ]);

  const sortedContacts = sortRecordsDescending(contactSubmissions);
  const sortedRegistrations = sortRecordsDescending(registrations);

  return res.json({
    summary: {
      contacts: sortedContacts.length,
      registrations: sortedRegistrations.length,
      latestContact: sortedContacts[0] ? sortedContacts[0].submittedAt : null,
      latestRegistration: sortedRegistrations[0] ? sortedRegistrations[0].submittedAt : null
    },
    contactSubmissions: sortedContacts,
    registrations: sortedRegistrations
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`FutureMakers server running on http://localhost:${port}`);
  });
}

module.exports = app;