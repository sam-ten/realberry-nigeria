import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || './database.sqlite';
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'investor' CHECK(role IN ('investor', 'admin', 'company')),
      kyc_status TEXT DEFAULT 'pending' CHECK(kyc_status IN ('pending', 'verified', 'rejected')),
      kyc_documents TEXT,
      bank_name TEXT,
      account_number TEXT,
      account_name TEXT,
      bvn TEXT,
      nin TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      logo_url TEXT,
      admin_id INTEGER REFERENCES users(id),
      verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER REFERENCES companies(id),
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT,
      property_type TEXT DEFAULT 'land' CHECK(property_type IN ('land', 'apartment', 'commercial', 'estate')),
      total_value REAL NOT NULL,
      total_units INTEGER NOT NULL,
      available_units INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      min_investment INTEGER DEFAULT 1,
      roi_percentage REAL DEFAULT 15,
      rental_yield REAL DEFAULT 8,
      status TEXT DEFAULT 'funding' CHECK(status IN ('funding', 'funded', 'completed', 'sold')),
      images TEXT,
      documents TEXT,
      coordinates TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      funded_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      property_id INTEGER REFERENCES properties(id),
      units INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'bank_transfer',
      payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'completed', 'failed', 'refunded')),
      transaction_ref TEXT,
      certificate_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      investment_id INTEGER REFERENCES investments(id),
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'NGN',
      gateway TEXT DEFAULT 'paystack',
      status TEXT DEFAULT 'pending',
      reference TEXT UNIQUE,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      paid_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS dividends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER REFERENCES properties(id),
      total_amount REAL NOT NULL,
      per_unit_amount REAL NOT NULL,
      period_start DATE,
      period_end DATE,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
      executed_by INTEGER REFERENCES users(id),
      executed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS dividend_payouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dividend_id INTEGER REFERENCES dividends(id),
      user_id INTEGER REFERENCES users(id),
      investment_id INTEGER REFERENCES investments(id),
      units INTEGER NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
      gateway_response TEXT,
      paid_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS property_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER REFERENCES properties(id),
      title TEXT NOT NULL,
      content TEXT,
      update_type TEXT DEFAULT 'general' CHECK(update_type IN ('general', 'milestone', 'financial', 'structural')),
      media_urls TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      property_id INTEGER REFERENCES properties(id),
      document_type TEXT NOT NULL CHECK(document_type IN ('id_card', 'passport', 'utility_bill', 'bank_statement', 'title_deed', 'co_ownership_agreement', 'certificate_of_occupancy', 'survey_plan', 'other')),
      file_url TEXT NOT NULL,
      file_name TEXT,
      verification_status TEXT DEFAULT 'pending',
      notes TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      title TEXT NOT NULL,
      message TEXT,
      type TEXT DEFAULT 'info',
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS communities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER REFERENCES properties(id),
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS community_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      community_id INTEGER REFERENCES communities(id),
      user_id INTEGER REFERENCES users(id),
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id);
    CREATE INDEX IF NOT EXISTS idx_investments_property ON investments(property_id);
    CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
    CREATE INDEX IF NOT EXISTS idx_dividends_property ON dividends(property_id);
    CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
  `);
};

initDb();

export default db;
