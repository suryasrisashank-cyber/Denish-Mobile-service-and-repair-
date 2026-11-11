import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Persistent storage location
const DATA_DIR = path.join(__dirname, 'server', 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory and orders file exist (strictly empty initially - NO demo data!)
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

export interface RepairOrder {
  id: string;
  serviceId: string; // 10-digit normalized phone number
  customerName: string;
  phone: string;
  brand: string;
  model: string;
  serviceType: string;
  issueDescription: string;
  estimatedPrice?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  adminMessage?: string;
  adminUpdatedAt?: string;
  createdAt: string;
  source: 'website' | 'admin';
}

function readOrders(): RepairOrder[] {
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading orders file:', err);
    return [];
  }
}

function writeOrders(orders: RepairOrder[]): void {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing orders file:', err);
  }
}

// Normalize phone number to 10 digits
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

// ADMIN AUTH MIDDLEWARE
const WORKSHOP_PIN = process.env.ADMIN_PIN || '8511';

function checkAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const pinHeader = req.headers['x-admin-pin'];
  
  if (authHeader === 'Bearer denish-workshop-auth-token' || pinHeader === WORKSHOP_PIN) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });
}

// API ROUTES

// Workshop info
app.get('/api/info', (_req, res) => {
  res.json({
    businessName: 'DENISH Mobile Repairing and Service',
    slogan: 'Your Mobile, Our Care',
    hotline: '8511668848',
    formattedPhone: '+91 8511668848',
    whatsappUrl: 'https://wa.me/918511668848',
    timing: '10:00 AM – 9:00 PM (Monday – Sunday)',
    warranty: '6-Month Spares Guarantee',
    services: [
      'Screen Replacement',
      'Battery Replacement',
      'Charging Problem',
      'Software Solutions',
      'Water Damage Repair',
      'IC / PCB Repair',
      'Speaker Replacement',
      'Camera Replacement'
    ]
  });
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { pin } = req.body;
  if (!pin) {
    return res.status(400).json({ error: 'PIN is required' });
  }
  if (pin.trim() === WORKSHOP_PIN) {
    return res.json({
      success: true,
      token: 'denish-workshop-auth-token',
      role: 'technician'
    });
  }
  return res.status(401).json({ error: 'Incorrect Workshop Passcode' });
});

// Track Order by Customer Phone (Service ID)
app.get('/api/orders/track/:serviceId', (req, res) => {
  const normalized = normalizePhone(req.params.serviceId);
  if (!normalized || normalized.length < 10) {
    return res.status(400).json({ error: 'Please provide a valid 10-digit mobile number' });
  }
  const orders = readOrders();
  const customerOrders = orders.filter(
    (o) => normalizePhone(o.serviceId) === normalized || normalizePhone(o.phone) === normalized
  );

  res.json({
    serviceId: normalized,
    found: customerOrders.length > 0,
    orders: customerOrders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  });
});

// Create Customer Booking (Genuine orders only)
app.post('/api/orders', (req, res) => {
  const { customerName, phone, brand, model, serviceType, issueDescription, estimatedPrice } = req.body;

  if (!customerName || !phone || !brand || !model || !serviceType) {
    return res.status(400).json({ error: 'Missing required booking fields' });
  }

  const normalized = normalizePhone(phone);
  if (normalized.length < 10) {
    return res.status(400).json({ error: 'Invalid phone number: Must be at least 10 digits' });
  }

  const orders = readOrders();

  // Deduplication check: If active order for exact same brand/model & issue created in past 3 minutes, reuse it
  const now = new Date();
  const recentDuplicate = orders.find((o) => {
    if (normalizePhone(o.phone) !== normalized) return false;
    if (o.status === 'Completed' || o.status === 'Cancelled') return false;
    const orderTime = new Date(o.createdAt).getTime();
    return now.getTime() - orderTime < 3 * 60 * 1000 && o.serviceType === serviceType;
  });

  if (recentDuplicate) {
    return res.json({
      success: true,
      order: recentDuplicate,
      isExisting: true,
      message: 'Repair booking already registered under your mobile number.'
    });
  }

  const newOrder: RepairOrder = {
    id: 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    serviceId: normalized,
    customerName: customerName.trim(),
    phone: phone.trim(),
    brand: brand.trim(),
    model: model.trim(),
    serviceType: serviceType.trim(),
    issueDescription: (issueDescription || 'Standard diagnosis and component replacement').trim(),
    estimatedPrice: estimatedPrice || undefined,
    status: 'Pending',
    adminMessage: 'Your repair request has been registered at our workshop counter. Technician diagnosis will begin shortly.',
    adminUpdatedAt: now.toISOString(),
    createdAt: now.toISOString(),
    source: 'website'
  };

  orders.push(newOrder);
  writeOrders(orders);

  res.status(201).json({
    success: true,
    order: newOrder,
    message: 'Repair booking created successfully'
  });
});

// ADMIN: Get All Genuine Orders
app.get('/api/admin/orders', checkAdminAuth, (_req, res) => {
  const orders = readOrders();
  res.json({
    orders: orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  });
});

// ADMIN: Manually Create Workshop Order
app.post('/api/admin/orders', checkAdminAuth, (req, res) => {
  const { customerName, phone, brand, model, serviceType, issueDescription, estimatedPrice, status, adminMessage } = req.body;

  if (!customerName || !phone || !brand || !model || !serviceType) {
    return res.status(400).json({ error: 'Missing required booking fields' });
  }

  const normalized = normalizePhone(phone);
  const now = new Date();
  const newOrder: RepairOrder = {
    id: 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    serviceId: normalized,
    customerName: customerName.trim(),
    phone: phone.trim(),
    brand: brand.trim(),
    model: model.trim(),
    serviceType: serviceType.trim(),
    issueDescription: (issueDescription || 'Workshop walk-in repair intake').trim(),
    estimatedPrice: estimatedPrice || undefined,
    status: status || 'Pending',
    adminMessage: adminMessage || 'Device received at workshop intake desk.',
    adminUpdatedAt: now.toISOString(),
    createdAt: now.toISOString(),
    source: 'admin'
  };

  const orders = readOrders();
  orders.push(newOrder);
  writeOrders(orders);

  res.status(201).json({
    success: true,
    order: newOrder
  });
});

// ADMIN: Update Order Status & Special Message
app.patch('/api/admin/orders/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status, adminMessage, estimatedPrice, issueDescription } = req.body;

  const orders = readOrders();
  const orderIndex = orders.findIndex((o) => o.id === id);

  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const existing = orders[orderIndex];
  const now = new Date().toISOString();

  if (status && ['Pending', 'In Progress', 'Completed', 'Cancelled'].includes(status)) {
    existing.status = status;
  }
  if (typeof adminMessage === 'string') {
    existing.adminMessage = adminMessage.trim();
    existing.adminUpdatedAt = now;
  }
  if (estimatedPrice !== undefined) {
    existing.estimatedPrice = estimatedPrice;
  }
  if (issueDescription !== undefined) {
    existing.issueDescription = issueDescription;
  }

  orders[orderIndex] = existing;
  writeOrders(orders);

  res.json({
    success: true,
    order: existing,
    message: 'Order updated successfully'
  });
});

// ADMIN: Delete Order with Confirmation
app.delete('/api/admin/orders/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const orders = readOrders();
  const filtered = orders.filter((o) => o.id !== id);

  if (filtered.length === orders.length) {
    return res.status(404).json({ error: 'Order not found' });
  }

  writeOrders(filtered);
  res.json({ success: true, message: 'Order deleted successfully' });
});

// Vite Middleware & Static Serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DENISH Mobile Repairing Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
