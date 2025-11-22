import { pool } from './index.js';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const timeResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected!');
    console.log('   Current time:', timeResult.rows[0].current_time);
    
    // Check if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`\n📊 Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Check data counts
    if (tablesResult.rows.some(r => r.table_name === 'receipts')) {
      const receiptsCount = await pool.query('SELECT COUNT(*) as count FROM receipts');
      console.log(`\n📦 Receipts: ${receiptsCount.rows[0].count}`);
    }
    
    if (tablesResult.rows.some(r => r.table_name === 'deliveries')) {
      const deliveriesCount = await pool.query('SELECT COUNT(*) as count FROM deliveries');
      console.log(`📦 Deliveries: ${deliveriesCount.rows[0].count}`);
    }
    
    if (tablesResult.rows.some(r => r.table_name === 'products')) {
      const productsCount = await pool.query('SELECT COUNT(*) as count FROM products');
      console.log(`📦 Products: ${productsCount.rows[0].count}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\nMake sure:');
    console.error('1. Your database is running');
    console.error('2. Your .env file has correct DATABASE_URL or DB_* variables');
    console.error('3. You have run: npm run db:init');
    process.exit(1);
  }
}

testConnection();

