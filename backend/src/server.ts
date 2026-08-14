import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import db from './database';
import { authenticate, requireRole, generateToken } from './middleware/auth';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ==================== AUTH ROUTES ====================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare(
      'INSERT INTO users (email, password, full_name, phone) VALUES (?, ?, ?, ?)'
    ).run(email, hashedPassword, full_name, phone);
    const token = generateToken(result.lastInsertRowid as number, 'investor');
    res.json({ token, user: { id: result.lastInsertRowid, email, full_name, role: 'investor' } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(user.id, user.role);
    res.json({
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, kyc_status: user.kyc_status }
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json(req.user);
});

// ==================== USER / KYC ROUTES ====================
app.put('/api/users/kyc', authenticate, upload.array('documents', 5), (req, res) => {
  try {
    const { bank_name, account_number, account_name, bvn, nin } = req.body;
    const files = req.files as Express.Multer.File[];
    const docUrls = files?.map(f => `/uploads/${f.filename}`).join(',') || '';

    db.prepare(
      'UPDATE users SET bank_name=?, account_number=?, account_name=?, bvn=?, nin=?, kyc_documents=?, kyc_status=? WHERE id=?'
    ).run(bank_name, account_number, account_name, bvn, nin, docUrls, 'pending', req.user.id);

    // Create notification
    db.prepare('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)')
      .run(req.user.id, 'KYC Submitted', 'Your KYC documents have been submitted for review.', 'info');

    res.json({ message: 'KYC submitted successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/users/portfolio', authenticate, (req, res) => {
  try {
    const investments = db.prepare(`
      SELECT i.*, p.title as property_title, p.location, p.property_type, p.images, p.status as property_status,
             p.roi_percentage, p.rental_yield
      FROM investments i
      JOIN properties p ON i.property_id = p.id
      WHERE i.user_id = ? AND i.payment_status = 'completed'
    `).all(req.user.id);

    const totalValue = investments.reduce((sum: number, inv: any) => sum + inv.total_amount, 0);
    const totalUnits = investments.reduce((sum: number, inv: any) => sum + inv.units, 0);

    // Calculate accumulated rental income (simulated)
    const rentalIncome = investments.reduce((sum: number, inv: any) => {
      const monthsOwned = Math.max(1, Math.floor((Date.now() - new Date(inv.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)));
      return sum + (inv.total_amount * (inv.rental_yield / 100) * (monthsOwned / 12));
    }, 0);

    // Get notifications
    const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10')
      .all(req.user.id);

    res.json({ investments, totalValue, totalUnits, rentalIncome, notifications });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== COMPANY ROUTES ====================
app.get('/api/companies', (req, res) => {
  try {
    const companies = db.prepare('SELECT * FROM companies WHERE verified = 1').all();
    res.json(companies);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/companies/:slug', (req, res) => {
  try {
    const company = db.prepare('SELECT * FROM companies WHERE slug = ?').get(req.params.slug);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    const properties = db.prepare('SELECT * FROM properties WHERE company_id = ? AND status IN (?, ?)')
      .all(company.id, 'funding', 'funded');
    res.json({ ...company, properties });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== PROPERTY ROUTES ====================
app.get('/api/properties', (req, res) => {
  try {
    const { status, type, location } = req.query;
    let query = 'SELECT p.*, c.name as company_name FROM properties p JOIN companies c ON p.company_id = c.id WHERE 1=1';
    const params: any[] = [];
    if (status) { query += ' AND p.status = ?'; params.push(status); }
    if (type) { query += ' AND p.property_type = ?'; params.push(type); }
    if (location) { query += ' AND p.location LIKE ?'; params.push(`%${location}%`); }
    query += ' ORDER BY p.created_at DESC';
    const properties = db.prepare(query).all(...params);
    res.json(properties);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/properties/:id', (req, res) => {
  try {
    const property = db.prepare('SELECT p.*, c.name as company_name FROM properties p JOIN companies c ON p.company_id = c.id WHERE p.id = ?').get(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const updates = db.prepare('SELECT * FROM property_updates WHERE property_id = ? ORDER BY created_at DESC').all(req.params.id);
    const documents = db.prepare('SELECT * FROM documents WHERE property_id = ?').all(req.params.id);
    const investors = db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM investments WHERE property_id = ? AND payment_status = ?').get(req.params.id, 'completed');

    res.json({ ...property, updates, documents, investorCount: investors.count });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== INVESTMENT ROUTES ====================
app.post('/api/investments', authenticate, (req, res) => {
  try {
    const { property_id, units, payment_method } = req.body;
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(property_id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    if (units > property.available_units) return res.status(400).json({ error: 'Not enough units available' });

    const totalAmount = units * property.unit_price;
    const transactionRef = `INV-${uuidv4().slice(0, 8).toUpperCase()}`;

    const result = db.prepare(
      'INSERT INTO investments (user_id, property_id, units, unit_price, total_amount, payment_method, transaction_ref) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, property_id, units, property.unit_price, totalAmount, payment_method, transactionRef);

    // Create payment record
    db.prepare('INSERT INTO payments (user_id, investment_id, amount, gateway, reference) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, result.lastInsertRowid, totalAmount, payment_method === 'card' ? 'paystack' : 'bank_transfer', transactionRef);

    res.json({
      investmentId: result.lastInsertRowid,
      transactionRef,
      totalAmount,
      message: 'Investment initiated. Complete payment to finalize.'
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/investments/:id/verify-payment', authenticate, (req, res) => {
  try {
    const { reference } = req.body;
    const investment = db.prepare('SELECT * FROM investments WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!investment) return res.status(404).json({ error: 'Investment not found' });

    // Simulate payment verification (in production, call Paystack/Flutterwave API)
    db.prepare('UPDATE investments SET payment_status = ? WHERE id = ?').run('completed', req.params.id);
    db.prepare('UPDATE payments SET status = ?, paid_at = ? WHERE reference = ?')
      .run('completed', new Date().toISOString(), reference);

    // Update available units
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(investment.property_id);
    const newAvailable = property.available_units - investment.units;
    db.prepare('UPDATE properties SET available_units = ?, status = ? WHERE id = ?')
      .run(newAvailable, newAvailable === 0 ? 'funded' : 'funding', investment.property_id);

    // Generate certificate
    const certUrl = `/uploads/cert-${investment.id}-${Date.now()}.pdf`;
    db.prepare('UPDATE investments SET certificate_url = ? WHERE id = ?').run(certUrl, investment.id);

    // Create community membership
    const community = db.prepare('SELECT id FROM communities WHERE property_id = ?').get(investment.property_id);
    if (community) {
      db.prepare('INSERT OR IGNORE INTO community_members (community_id, user_id) VALUES (?, ?)')
        .run(community.id, req.user.id);
    }

    // Notification
    db.prepare('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)')
      .run(req.user.id, 'Investment Confirmed', `You have successfully invested ₦${investment.total_amount.toLocaleString()} in ${property.title}`, 'success');

    res.json({ message: 'Payment verified and investment confirmed', certificateUrl: certUrl });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== DIVIDEND / BULK PAYOUT ROUTES ====================
app.post('/api/dividends', authenticate, requireRole('admin', 'company'), (req, res) => {
  try {
    const { property_id, total_amount, period_start, period_end } = req.body;
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(property_id);
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const totalUnits = property.total_units;
    const perUnit = total_amount / totalUnits;

    const result = db.prepare(
      'INSERT INTO dividends (property_id, total_amount, per_unit_amount, period_start, period_end, status, executed_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(property_id, total_amount, perUnit, period_start, period_end, 'pending', req.user.id);

    const dividendId = result.lastInsertRowid;

    // Create individual payouts
    const investments = db.prepare('SELECT * FROM investments WHERE property_id = ? AND payment_status = ?').all(property_id, 'completed');
    for (const inv of investments as any[]) {
      db.prepare(
        'INSERT INTO dividend_payouts (dividend_id, user_id, investment_id, units, amount, status) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(dividendId, inv.user_id, inv.id, inv.units, inv.units * perUnit, 'pending');
    }

    res.json({ dividendId, totalPayouts: investments.length, perUnitAmount: perUnit, message: 'Dividend created successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/dividends/:id/execute', authenticate, requireRole('admin', 'company'), (req, res) => {
  try {
    const dividendId = req.params.id;
    const dividend = db.prepare('SELECT * FROM dividends WHERE id = ?').get(dividendId);
    if (!dividend) return res.status(404).json({ error: 'Dividend not found' });
    if (dividend.status !== 'pending') return res.status(400).json({ error: 'Dividend already processed' });

    // Update dividend status
    db.prepare('UPDATE dividends SET status = ?, executed_at = ? WHERE id = ?')
      .run('processing', new Date().toISOString(), dividendId);

    const payouts = db.prepare('SELECT dp.*, u.bank_name, u.account_number, u.account_name FROM dividend_payouts dp JOIN users u ON dp.user_id = u.id WHERE dp.dividend_id = ? AND dp.status = ?')
      .all(dividendId, 'pending');

    let successCount = 0;
    let failCount = 0;

    for (const payout of payouts as any[]) {
      try {
        // Simulate Paystack/Korapay bulk transfer API call
        // In production: await paystack.transfer.create({...})
        const success = Math.random() > 0.05; // 95% success rate simulation

        if (success) {
          db.prepare('UPDATE dividend_payouts SET status = ?, paid_at = ? WHERE id = ?')
            .run('completed', new Date().toISOString(), payout.id);
          db.prepare('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)')
            .run(payout.user_id, 'Dividend Paid', `You received ₦${payout.amount.toLocaleString()} dividend payout`, 'success');
          successCount++;
        } else {
          db.prepare('UPDATE dividend_payouts SET status = ?, gateway_response = ? WHERE id = ?')
            .run('failed', 'Transfer failed - insufficient funds', payout.id);
          failCount++;
        }
      } catch (e) {
        failCount++;
      }
    }

    const finalStatus = failCount === 0 ? 'completed' : (successCount === 0 ? 'failed' : 'completed');
    db.prepare('UPDATE dividends SET status = ? WHERE id = ?').run(finalStatus, dividendId);

    res.json({
      message: 'Bulk dividend execution completed',
      totalProcessed: payouts.length,
      successCount,
      failCount,
      status: finalStatus
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/dividends', authenticate, requireRole('admin', 'company'), (req, res) => {
  try {
    const dividends = db.prepare(`
      SELECT d.*, p.title as property_title, p.location
      FROM dividends d
      JOIN properties p ON d.property_id = p.id
      ORDER BY d.created_at DESC
    `).all();
    res.json(dividends);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/dividends/:id/payouts', authenticate, requireRole('admin', 'company'), (req, res) => {
  try {
    const payouts = db.prepare(`
      SELECT dp.*, u.full_name, u.email, u.bank_name, u.account_number
      FROM dividend_payouts dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.dividend_id = ?
    `).all(req.params.id);
    res.json(payouts);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== ADMIN DASHBOARD ROUTES ====================
app.get('/api/admin/dashboard', authenticate, requireRole('admin', 'company'), (req, res) => {
  try {
    const totalInvestors = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('investor').count;
    const totalProperties = db.prepare('SELECT COUNT(*) as count FROM properties').get().count;
    const totalInvestments = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as total FROM investments WHERE payment_status = ?').get('completed').total;
    const totalUnitsSold = db.prepare('SELECT COALESCE(SUM(units), 0) as total FROM investments WHERE payment_status = ?').get('completed').total;
    const pendingKyc = db.prepare('SELECT COUNT(*) as count FROM users WHERE kyc_status = ?').get('pending').count;

    const recentInvestments = db.prepare(`
      SELECT i.*, u.full_name, p.title as property_title
      FROM investments i
      JOIN users u ON i.user_id = u.id
      JOIN properties p ON i.property_id = p.id
      ORDER BY i.created_at DESC LIMIT 10
    `).all();

    const monthlyData = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, COALESCE(SUM(total_amount), 0) as amount, COUNT(*) as count
      FROM investments WHERE payment_status = 'completed'
      GROUP BY month ORDER BY month DESC LIMIT 12
    `).all();

    res.json({ totalInvestors, totalProperties, totalInvestments, totalUnitsSold, pendingKyc, recentInvestments, monthlyData });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/properties', authenticate, requireRole('admin', 'company'), (req, res) => {
  try {
    const properties = db.prepare(`
      SELECT p.*, c.name as company_name,
             COALESCE((SELECT SUM(units) FROM investments WHERE property_id = p.id AND payment_status = 'completed'), 0) as sold_units
      FROM properties p
      JOIN companies c ON p.company_id = c.id
      ORDER BY p.created_at DESC
    `).all();
    res.json(properties);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/properties', authenticate, requireRole('admin', 'company'), upload.array('images', 10), (req, res) => {
  try {
    const { title, location, description, property_type, total_value, total_units, unit_price, roi_percentage, rental_yield, company_id } = req.body;
    const files = req.files as Express.Multer.File[];
    const images = files?.map(f => `/uploads/${f.filename}`).join(',') || '';

    const result = db.prepare(
      'INSERT INTO properties (company_id, title, location, description, property_type, total_value, total_units, available_units, unit_price, roi_percentage, rental_yield, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(company_id, title, location, description, property_type, total_value, total_units, total_units, unit_price, roi_percentage, rental_yield, images);

    // Create community for this property
    db.prepare('INSERT INTO communities (property_id, name, description) VALUES (?, ?, ?)')
      .run(result.lastInsertRowid, `${title} Investors`, `Community for investors in ${title}`);

    res.json({ id: result.lastInsertRowid, message: 'Property created successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/investors', authenticate, requireRole('admin', 'company'), (req, res) => {
  try {
    const investors = db.prepare(`
      SELECT u.*, COALESCE(SUM(i.total_amount), 0) as total_invested, COUNT(i.id) as investment_count
      FROM users u
      LEFT JOIN investments i ON u.id = i.user_id AND i.payment_status = 'completed'
      WHERE u.role = 'investor'
      GROUP BY u.id
      ORDER BY total_invested DESC
    `).all();
    res.json(investors);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/users/:id/kyc', authenticate, requireRole('admin', 'company'), (req, res) => {
  try {
    const { status, notes } = req.body;
    db.prepare('UPDATE users SET kyc_status = ? WHERE id = ?').run(status, req.params.id);
    db.prepare('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)')
      .run(req.params.id, `KYC ${status.charAt(0).toUpperCase() + status.slice(1)}`, notes || `Your KYC has been ${status}.`, status === 'verified' ? 'success' : 'warning');
    res.json({ message: 'KYC status updated' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== DOCUMENT ROUTES ====================
app.post('/api/documents', authenticate, upload.single('file'), (req, res) => {
  try {
    const { property_id, document_type } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    db.prepare('INSERT INTO documents (user_id, property_id, document_type, file_url, file_name) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, property_id || null, document_type, `/uploads/${file.filename}`, file.originalname);

    res.json({ message: 'Document uploaded successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/documents', authenticate, (req, res) => {
  try {
    const docs = db.prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC').all(req.user.id);
    res.json(docs);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== PROPERTY UPDATE ROUTES ====================
app.post('/api/properties/:id/updates', authenticate, requireRole('admin', 'company'), upload.array('media', 10), (req, res) => {
  try {
    const { title, content, update_type } = req.body;
    const files = req.files as Express.Multer.File[];
    const mediaUrls = files?.map(f => `/uploads/${f.filename}`).join(',') || '';

    db.prepare('INSERT INTO property_updates (property_id, title, content, update_type, media_urls, created_by) VALUES (?, ?, ?, ?, ?, ?)')
      .run(req.params.id, title, content, update_type, mediaUrls, req.user.id);

    // Notify all investors
    const investors = db.prepare('SELECT DISTINCT user_id FROM investments WHERE property_id = ? AND payment_status = ?').all(req.params.id, 'completed');
    for (const inv of investors as any[]) {
      db.prepare('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)')
        .run(inv.user_id, 'Project Update', `New update on ${title}`, 'info');
    }

    res.json({ message: 'Update posted successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== COMMUNITY ROUTES ====================
app.get('/api/communities', authenticate, (req, res) => {
  try {
    const communities = db.prepare(`
      SELECT c.*, p.title as property_title, p.location,
             (SELECT COUNT(*) FROM community_members WHERE community_id = c.id) as member_count
      FROM communities c
      JOIN properties p ON c.property_id = p.id
      WHERE c.id IN (SELECT community_id FROM community_members WHERE user_id = ?)
    `).all(req.user.id);
    res.json(communities);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== NOTIFICATIONS ====================
app.get('/api/notifications', authenticate, (req, res) => {
  try {
    const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
    res.json(notifications);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/notifications/:id/read', authenticate, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Notification marked as read' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== SEED DATA ENDPOINT (DEV ONLY) ====================
app.post('/api/seed', (req, res) => {
  try {
    // Create admin
    const adminPass = bcrypt.hashSync('admin123', 10);
    const admin = db.prepare('INSERT OR IGNORE INTO users (email, password, full_name, role, kyc_status) VALUES (?, ?, ?, ?, ?)')
      .run('admin@realberry.ng', adminPass, 'System Administrator', 'admin', 'verified');

    // Create demo company
    const company = db.prepare('INSERT OR IGNORE INTO companies (name, slug, description, admin_id, verified) VALUES (?, ?, ?, ?, ?)')
      .run('Barnes & Harmer Realty', 'barnes-harmer', 'Premium real estate investment platform', admin.lastInsertRowid || 1, 1);

    const company2 = db.prepare('INSERT OR IGNORE INTO companies (name, slug, description, admin_id, verified) VALUES (?, ?, ?, ?, ?)')
      .run('MSHEL Properties', 'mshel', 'Leading Abuja property developers', admin.lastInsertRowid || 1, 1);

    const company3 = db.prepare('INSERT OR IGNORE INTO companies (name, slug, description, admin_id, verified) VALUES (?, ?, ?, ?, ?)')
      .run('Promise Land Estates', 'promise-land', 'Trusted land banking specialists', admin.lastInsertRowid || 1, 1);

    // Create demo properties
    const properties = [
      { company_id: 1, title: 'Maitama Luxury Residences', location: 'Maitama, Abuja', description: 'Premium 4-bedroom apartments with smart home features', property_type: 'apartment', total_value: 500000000, total_units: 1000, unit_price: 500000, roi_percentage: 18, rental_yield: 10 },
      { company_id: 1, title: 'Jabi Waterfront Estate', location: 'Jabi, Abuja', description: 'Waterfront land plots with C of O', property_type: 'land', total_value: 200000000, total_units: 500, unit_price: 400000, roi_percentage: 25, rental_yield: 0 },
      { company_id: 2, title: 'Wuse II Commercial Plaza', location: 'Wuse II, Abuja', description: 'Commercial office spaces in prime location', property_type: 'commercial', total_value: 350000000, total_units: 700, unit_price: 500000, roi_percentage: 15, rental_yield: 12 },
      { company_id: 3, title: 'Lugbe Garden City', location: 'Lugbe, Abuja', description: 'Mixed-use development with residential and commercial units', property_type: 'estate', total_value: 800000000, total_units: 2000, unit_price: 400000, roi_percentage: 22, rental_yield: 8 },
    ];

    for (const p of properties) {
      const result = db.prepare(
        'INSERT OR IGNORE INTO properties (company_id, title, location, description, property_type, total_value, total_units, available_units, unit_price, roi_percentage, rental_yield) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(p.company_id, p.title, p.location, p.description, p.property_type, p.total_value, p.total_units, p.total_units, p.unit_price, p.roi_percentage, p.rental_yield);

      if (result.lastInsertRowid) {
        db.prepare('INSERT OR IGNORE INTO communities (property_id, name, description) VALUES (?, ?, ?)')
          .run(result.lastInsertRowid, `${p.title} Investors`, `Community for ${p.title} investors`);
      }
    }

    // Create demo investors
    const investors = [
      { email: 'chinedu@email.com', name: 'Chinedu Okafor', phone: '08031234567' },
      { email: 'fatima@email.com', name: 'Fatima Abdullahi', phone: '08042345678' },
      { email: 'emeka@email.com', name: 'Emeka Nwosu', phone: '08053456789' },
      { email: 'amina@email.com', name: 'Amina Ibrahim', phone: '08064567890' },
      { email: 'tolu@email.com', name: 'Tolu Adeyemi', phone: '08075678901' },
    ];

    for (const inv of investors) {
      const pass = bcrypt.hashSync('password123', 10);
      const result = db.prepare('INSERT OR IGNORE INTO users (email, password, full_name, phone, role, kyc_status) VALUES (?, ?, ?, ?, ?, ?)')
        .run(inv.email, pass, inv.name, inv.phone, 'investor', 'verified');
    }

    // Create demo investments
    const demoInvestments = [
      { user_id: 2, property_id: 1, units: 10 },
      { user_id: 3, property_id: 1, units: 5 },
      { user_id: 4, property_id: 2, units: 15 },
      { user_id: 5, property_id: 3, units: 8 },
      { user_id: 6, property_id: 4, units: 20 },
    ];

    for (const di of demoInvestments) {
      const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(di.property_id);
      if (property) {
        const totalAmount = di.units * property.unit_price;
        db.prepare(
          'INSERT OR IGNORE INTO investments (user_id, property_id, units, unit_price, total_amount, payment_method, payment_status, transaction_ref) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(di.user_id, di.property_id, di.units, property.unit_price, totalAmount, 'bank_transfer', 'completed', `INV-${uuidv4().slice(0, 8).toUpperCase()}`);
      }
    }

    // Update available units
    for (let pid = 1; pid <= 4; pid++) {
      const sold = db.prepare('SELECT COALESCE(SUM(units), 0) as total FROM investments WHERE property_id = ? AND payment_status = ?').get(pid, 'completed').total;
      db.prepare('UPDATE properties SET available_units = total_units - ? WHERE id = ?').run(sold, pid);
    }

    res.json({ message: 'Seed data created successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 RealBerry Nigeria API running on port ${PORT}`);
  console.log(`📊 Admin Dashboard: http://localhost:${PORT}/api/admin/dashboard`);
});
