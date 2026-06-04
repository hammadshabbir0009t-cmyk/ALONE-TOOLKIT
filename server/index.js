import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

function getDataFile(file) {
  return path.join(DATA_DIR, `${file}.json`);
}

function readData(file, defaultData = {}) {
  try {
    const filePath = getDataFile(file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return defaultData;
  }
}

function writeData(file, data) {
  fs.writeFileSync(getDataFile(file), JSON.stringify(data, null, 2));
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize default data
const defaultSettings = {
  dpImage: null,
  userPassword: 'alone99',
  adminPassword: 'a889900h',
  socialLinks: {
    whatsapp: 'https://wa.me/923235248941',
    youtube: 'https://youtube.com/@alonehacker-0009t?si=uDcpQT4xHDH3ZeR-',
    telegram: 'https://t.me/alone_hacker_0009t',
    Channel: 'https://whatsapp.com/channel/0029Vb50wllJuyAEmYS7iV1h'
  },
  lastModified: Date.now()
};

const defaultTools = { tools: [], lastModified: Date.now() };
const defaultNotifications = { notifications: [], lastModified: Date.now() };
const defaultUsers = { activeUsers: [], lastModified: Date.now() };

function initData() {
  readData('settings', defaultSettings);
  readData('tools', defaultTools);
  readData('notifications', defaultNotifications);
  readData('users', defaultUsers);
}

initData();

// ===== AUTH ROUTES =====
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const settings = readData('settings', defaultSettings);

  if (!password) return res.status(400).json({ error: 'Password required' });

  let userType = null;
  if (password === settings.userPassword) userType = 'user';
  else if (password === settings.adminPassword) userType = 'admin';

  if (!userType) return res.status(401).json({ error: 'Invalid password' });

  const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const users = readData('users', defaultUsers);

  users.activeUsers = users.activeUsers.filter(u => Date.now() - u.lastSeen < 30 * 60 * 1000);
  users.activeUsers.push({
    id: token,
    type: userType,
    lastSeen: Date.now(),
    joinedAt: Date.now()
  });
  users.lastModified = Date.now();
  writeData('users', users);

  res.json({ token, userType });
});

app.post('/api/auth/logout', (req, res) => {
  const { token } = req.body;
  const users = readData('users', defaultUsers);
  users.activeUsers = users.activeUsers.filter(u => u.id !== token);
  users.lastModified = Date.now();
  writeData('users', users);
  res.json({ success: true });
});

app.get('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization;
  const settings = readData('settings', defaultSettings);
  const users = readData('users', defaultUsers);

  if (!token) return res.status(401).json({ error: 'No token' });

  const user = users.activeUsers.find(u => u.id === token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  user.lastSeen = Date.now();
  writeData('users', users);

  res.json({ userType: user.type });
});

// ===== TOOLS ROUTES =====
app.get('/api/tools', (req, res) => {
  const data = readData('tools', defaultTools);
  res.json(data);
});

app.post('/api/tools', (req, res) => {
  const { title, link, image } = req.body;
  if (!title || !link || !image) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const data = readData('tools', defaultTools);
  const tool = {
    id: Date.now(),
    title,
    link,
    image,
    date: new Date().toLocaleDateString(),
    downloads: 0,
    isNew: true
  };
  data.tools.unshift(tool);
  data.lastModified = Date.now();
  writeData('tools', data);

  // Add notification
  const notifData = readData('notifications', defaultNotifications);
  notifData.notifications.unshift({
    id: Date.now(),
    title: 'New Tool Added!',
    message: `Tool "${title}" has been added to the toolkit.`,
    time: new Date().toLocaleString(),
    read: false,
    type: 'normal'
  });
  notifData.lastModified = Date.now();
  writeData('notifications', notifData);

  res.json(tool);
});

app.delete('/api/tools/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const data = readData('tools', defaultTools);
  data.tools = data.tools.filter(t => t.id !== id);
  data.lastModified = Date.now();
  writeData('tools', data);
  res.json({ success: true });
});

app.post('/api/tools/:id/download', (req, res) => {
  const id = parseInt(req.params.id);
  const data = readData('tools', defaultTools);
  const tool = data.tools.find(t => t.id === id);
  if (tool) {
    tool.downloads = (tool.downloads || 0) + 1;
    tool.isNew = false;
    data.lastModified = Date.now();
    writeData('tools', data);
  }
  res.json(tool || { error: 'Tool not found' });
});

// ===== NOTIFICATIONS ROUTES =====
app.get('/api/notifications', (req, res) => {
  const data = readData('notifications', defaultNotifications);
  res.json(data);
});

app.post('/api/notifications', (req, res) => {
  const { title, message, type, push } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message required' });
  }

  const notifData = readData('notifications', defaultNotifications);
  const notification = {
    id: Date.now(),
    title,
    message,
    time: new Date().toLocaleString(),
    read: false,
    type: type || 'normal',
    push: push || false
  };
  notifData.notifications.unshift(notification);
  notifData.lastModified = Date.now();
  writeData('notifications', notifData);

  res.json(notification);
});

app.post('/api/notifications/read', (req, res) => {
  const notifData = readData('notifications', defaultNotifications);
  notifData.notifications.forEach(n => n.read = true);
  notifData.lastModified = Date.now();
  writeData('notifications', notifData);
  res.json({ success: true });
});

app.delete('/api/notifications', (req, res) => {
  const notifData = readData('notifications', defaultNotifications);
  notifData.notifications = [];
  notifData.lastModified = Date.now();
  writeData('notifications', notifData);
  res.json({ success: true });
});

// ===== SETTINGS ROUTES =====
app.get('/api/settings', (req, res) => {
  const data = readData('settings', defaultSettings);
  res.json(data);
});

app.post('/api/settings/password', (req, res) => {
  const { type, currentPassword, newPassword } = req.body;
  const settings = readData('settings', defaultSettings);

  const current = type === 'user' ? settings.userPassword : settings.adminPassword;
  if (currentPassword !== current) {
    return res.status(400).json({ error: 'Current password incorrect' });
  }

  if (type === 'user') settings.userPassword = newPassword;
  else settings.adminPassword = newPassword;

  settings.lastModified = Date.now();
  writeData('settings', settings);
  res.json({ success: true });
});

app.post('/api/settings/social', (req, res) => {
  const { socialLinks } = req.body;
  const settings = readData('settings', defaultSettings);
  settings.socialLinks = { ...settings.socialLinks, ...socialLinks };
  settings.lastModified = Date.now();
  writeData('settings', settings);
  res.json(settings.socialLinks);
});

// ===== DP IMAGE ROUTES =====
app.get('/api/dp', (req, res) => {
  const settings = readData('settings', defaultSettings);
  if (settings.dpImage) {
    res.json({ dpImage: settings.dpImage });
  } else {
    // Return default DP from file
    const defaultDpPath = path.join(__dirname, '..', 'public', 'images', 'dp.png');
    if (fs.existsSync(defaultDpPath)) {
      const base64 = fs.readFileSync(defaultDpPath, 'base64');
      res.json({ dpImage: `data:image/png;base64,${base64}` });
    } else {
      res.json({ dpImage: null });
    }
  }
});

app.post('/api/dp', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' });

  const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  const settings = readData('settings', defaultSettings);
  settings.dpImage = base64;
  settings.lastModified = Date.now();
  writeData('settings', settings);

  res.json({ dpImage: base64 });
});

// ===== USERS / STATS ROUTES =====
app.get('/api/users/active', (req, res) => {
  const users = readData('users', defaultUsers);
  const now = Date.now();
  // Clean up old users (inactive for 30 min)
  users.activeUsers = users.activeUsers.filter(u => now - u.lastSeen < 30 * 60 * 1000);
  writeData('users', users);

  res.json({
    total: users.activeUsers.length,
    users: users.activeUsers,
    lastModified: users.lastModified
  });
});

// ===== SYNC / REALTIME ROUTE =====
app.get('/api/sync', (req, res) => {
  const tools = readData('tools', defaultTools);
  const notifications = readData('notifications', defaultNotifications);
  const settings = readData('settings', defaultSettings);
  const users = readData('users', defaultUsers);

  const now = Date.now();
  users.activeUsers = users.activeUsers.filter(u => now - u.lastSeen < 30 * 60 * 1000);

  res.json({
    tools,
    notifications,
    settings: {
      socialLinks: settings.socialLinks,
      lastModified: settings.lastModified,
      hasCustomDp: !!settings.dpImage
    },
    activeUsers: users.activeUsers.length,
    lastModified: Math.max(tools.lastModified, notifications.lastModified, settings.lastModified)
  });
});

// ===== SERVE STATIC FRONTEND =====
app.use(express.static(path.join(__dirname, '..', 'dist')));
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

app.get('/{*path}', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Frontend not built yet. Run npm run build first.' });
  }
});

app.listen(PORT, () => {
  console.log(`ALONE HACKER TOOLKIT Server running on port ${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
});
