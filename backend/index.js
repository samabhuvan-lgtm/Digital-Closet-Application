import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = 'supersecret_genz_key_123';

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));

// Setup uploads folder
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// In-memory Database
const users = []; // { id, username, password, savedOutfits: [] }
const clothes = []; // { id, userId, category, imageUrl }

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// --- AUTH ROUTES ---

app.post('/api/auth/signup', async (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now().toString(), username, password: hashedPassword, savedOutfits: [] };
  users.push(newUser);

  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '1d' });
  res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' });
  res.json({ message: 'Signup successful', user: { id: newUser.id, username } });
});

app.post('/api/auth/signin', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
  res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' });
  res.json({ message: 'Signin successful', user: { id: user.id, username } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Middleware for protected routes
const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- CLOTHES ROUTES ---

app.post('/api/clothes', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const { category } = req.body;
  
  const newItem = {
    id: Date.now().toString(),
    userId: req.user.userId,
    category,
    imageUrl: `/uploads/${req.file.filename}`
  };
  clothes.push(newItem);
  res.json(newItem);
});

app.get('/api/clothes', authenticate, (req, res) => {
  const userClothes = clothes.filter(c => c.userId === req.user.userId);
  res.json(userClothes);
});

app.delete('/api/clothes/:id', authenticate, (req, res) => {
  const itemId = req.params.id;
  const index = clothes.findIndex(c => c.id === itemId && c.userId === req.user.userId);
  if (index === -1) return res.status(404).json({ error: 'Item not found' });
  
  // Optionally, we could delete the file from 'uploads' here using fs.unlinkSync
  const deletedItem = clothes.splice(index, 1)[0];
  res.json({ message: 'Item deleted', id: deletedItem.id });
});

// --- OUTFIT ROUTES ---

app.get('/api/outfit/random', authenticate, (req, res) => {
  const userClothes = clothes.filter(c => c.userId === req.user.userId);
  const tops = userClothes.filter(c => c.category === 'top');
  const bottoms = userClothes.filter(c => c.category === 'bottom');
  const shoes = userClothes.filter(c => c.category === 'shoes');

  if (!tops.length || !bottoms.length) {
    return res.status(400).json({ error: 'Not enough items to generate an outfit (need at least top and bottom)' });
  }

  const randomTop = tops[Math.floor(Math.random() * tops.length)];
  const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
  const randomShoes = shoes.length ? shoes[Math.floor(Math.random() * shoes.length)] : null;

  const outfit = [randomTop, randomBottom];
  if (randomShoes) outfit.push(randomShoes);

  res.json(outfit);
});

app.post('/api/outfit/save', authenticate, (req, res) => {
  const { outfit } = req.body;
  const user = users.find(u => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  user.savedOutfits.push({ id: Date.now().toString(), items: outfit });
  res.json({ message: 'Outfit saved successfully' });
});

app.get('/api/outfit/saved', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.savedOutfits);
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
