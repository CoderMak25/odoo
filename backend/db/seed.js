import { pool } from './index.js';
import bcrypt from 'bcryptjs';

/**
 * Seed the database with initial test data
 */
export async function seedDatabase() {
  try {
    console.log('Seeding database with initial data...');
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 0. Clear existing deliveries to ensure fresh seed data
      console.log('  Clearing existing deliveries...');
      await client.query('DELETE FROM delivery_items');
      await client.query('DELETE FROM deliveries');
      
      // 1. Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, name) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        ['admin@stockmaster.com', hashedPassword, 'Admin User']
      );
      const userId = userResult.rows[0].id;
      console.log('  ✅ Created test user');
      
      // 2. Get default warehouse
      const warehouseResult = await client.query(
        'SELECT id FROM warehouses WHERE name = $1',
        ['Main Warehouse']
      );
      const warehouseId = warehouseResult.rows[0]?.id;
      
      // 3. Insert products
      const products = [
        { name: 'Steel Rods', sku: 'STL-001', category: 'Raw Materials', uom: 'kg', stock: 1250, reorderLevel: 200 },
        { name: 'Office Chairs', sku: 'FUR-001', category: 'Furniture', uom: 'pcs', stock: 45, reorderLevel: 20 },
        { name: 'Laptop Computers', sku: 'ELC-001', category: 'Electronics', uom: 'pcs', stock: 12, reorderLevel: 15 },
        { name: 'Wooden Planks', sku: 'RAW-001', category: 'Raw Materials', uom: 'meters', stock: 320, reorderLevel: 100 },
        { name: 'Paint (Blue)', sku: 'CHM-001', category: 'Chemicals', uom: 'liters', stock: 8, reorderLevel: 20 },
        { name: 'Screws (M6)', sku: 'HRD-001', category: 'Hardware', uom: 'pcs', stock: 0, reorderLevel: 500 },
        { name: 'LED Bulbs', sku: 'ELC-002', category: 'Electronics', uom: 'pcs', stock: 150, reorderLevel: 50 },
        { name: 'Desk Tables', sku: 'FUR-002', category: 'Furniture', uom: 'pcs', stock: 25, reorderLevel: 10 },
        { name: 'Motor Oil', sku: 'CHM-002', category: 'Chemicals', uom: 'liters', stock: 5, reorderLevel: 30 },
        { name: 'Nails (3 inch)', sku: 'HRD-002', category: 'Hardware', uom: 'pcs', stock: 850, reorderLevel: 200 },
      ];
      
      const productIds = [];
      for (const product of products) {
        const result = await client.query(
          `INSERT INTO products (name, sku, category, uom, stock, reorder_level) 
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (sku) DO UPDATE SET 
             name = EXCLUDED.name,
             category = EXCLUDED.category,
             uom = EXCLUDED.uom,
             stock = EXCLUDED.stock,
             reorder_level = EXCLUDED.reorder_level
           RETURNING id`,
          [product.name, product.sku, product.category, product.uom, product.stock, product.reorderLevel]
        );
        productIds.push(result.rows[0].id);
        
        // Create stock level entry if warehouse exists
        if (warehouseId) {
          await client.query(
            `INSERT INTO stock_levels (product_id, warehouse_id, location_id, quantity)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (product_id, warehouse_id, location_id) DO UPDATE SET
               quantity = EXCLUDED.quantity`,
            [result.rows[0].id, warehouseId, null, product.stock]
          );
        }
      }
      console.log(`  ✅ Created ${products.length} products`);
      
      // Helper function to get date string for N days ago
      const getDateString = (daysAgo) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split('T')[0];
      };

      // 4. Insert receipts - spread across last 90 days with more data
      const receipts = [];
      const suppliers = [
        'Steel Corp Ltd', 'Furniture World', 'Tech Supplies Inc', 'Raw Materials Co',
        'Chemical Solutions', 'Hardware Plus', 'Electronics Direct', 'Office Supplies Co',
        'Industrial Materials', 'Tech Solutions', 'Wood Suppliers', 'Paint & Chemicals',
        'Hardware Depot', 'Lighting Solutions', 'Furniture Plus', 'Office Furniture Co'
      ];
      const statuses = ['done', 'done', 'done', 'ready', 'waiting', 'draft']; // More done than others
      
      let receiptCounter = 1;
      // Generate receipts for last 90 days
      for (let daysAgo = 0; daysAgo < 90; daysAgo++) {
        // More receipts on recent days, fewer on older days
        const baseCount = daysAgo < 7 ? 3 : daysAgo < 30 ? 2 : daysAgo < 60 ? 1 : 0;
        const randomCount = Math.floor(Math.random() * 2); // 0-1 additional
        const count = baseCount + randomCount;
        
        for (let i = 0; i < count; i++) {
          const receiptId = `RCP-${String(receiptCounter++).padStart(3, '0')}`;
          const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const productIndex = Math.floor(Math.random() * productIds.length);
          const quantity = Math.floor(Math.random() * 100) + 10;
          
          receipts.push({
            receiptId,
            supplier,
            date: getDateString(daysAgo),
            status,
            items: [{ productId: productIndex, quantity }]
          });
        }
      }
      
      for (const receipt of receipts) {
        const receiptResult = await client.query(
          `INSERT INTO receipts (receipt_id, supplier, date, status, warehouse_id, created_by)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (receipt_id) DO UPDATE SET
             supplier = EXCLUDED.supplier,
             date = EXCLUDED.date,
             status = EXCLUDED.status
           RETURNING id`,
          [receipt.receiptId, receipt.supplier, receipt.date, receipt.status, warehouseId, userId]
        );
        const receiptDbId = receiptResult.rows[0].id;
        
        // Insert receipt items
        for (const item of receipt.items) {
          const productId = typeof item.productId === 'number' 
            ? productIds[item.productId] 
            : item.productId;
          if (productId) {
            await client.query(
              `INSERT INTO receipt_items (receipt_id, product_id, quantity)
               VALUES ($1, $2, $3)
               ON CONFLICT DO NOTHING`,
              [receiptDbId, productId, item.quantity]
            );
          }
        }
      }
      console.log(`  ✅ Created ${receipts.length} receipts`);
      
      // 5. Insert deliveries - spread across last 90 days with all statuses
      const deliveries = [];
      const customers = [
        'ABC Manufacturing', 'XYZ Retail', 'Tech Store', 'Construction Co', 'Home Depot',
        'Retail Chain', 'Electronics Shop', 'Hardware Store', 'Manufacturing Inc', 'Furniture Outlet',
        'Tech Solutions', 'Building Supplies', 'Paint Store', 'Hardware Plus', 'Lighting Store',
        'Office Supplies', 'Industrial Supply', 'Furniture Warehouse', 'Big Box Store', 'Online Seller'
      ];
      
      // Ensure we have deliveries with all statuses - limited quantity
      const deliveryStatusList = ['draft', 'waiting', 'ready', 'done'];
      let deliveryCounter = 1;
      
      // Create 3-4 deliveries for each status (total ~12-16 deliveries)
      deliveryStatusList.forEach((status, statusIndex) => {
        const count = 3 + Math.floor(Math.random() * 2); // 3-4 per status
        for (let i = 0; i < count; i++) {
          const deliveryId = `DEL-${String(deliveryCounter++).padStart(3, '0')}`;
          const customer = customers[Math.floor(Math.random() * customers.length)];
          const productIndex = Math.floor(Math.random() * productIds.length);
          const quantity = Math.floor(Math.random() * 50) + 5;
          const daysAgo = statusIndex * 2 + i; // Spread across recent days
          
          deliveries.push({
            deliveryId,
            customer,
            date: getDateString(daysAgo),
            status,
            items: [{ productId: productIndex, quantity }]
          });
        }
      });
      
      // Get default location
      const locationResult = await client.query(
        'SELECT id FROM locations WHERE warehouse_id = $1 LIMIT 1',
        [warehouseId]
      );
      const locationId = locationResult.rows[0]?.id || null;
      
      const contacts = ['Jane Scherer', 'John Doe', 'Sarah Smith', 'Mike Johnson', 'Emily Davis'];
      
      for (const delivery of deliveries) {
        // Extract number from DEL-001 format
        const match = delivery.deliveryId.match(/DEL-(\d+)/);
        const deliveryNumber = match ? parseInt(match[1]) : parseInt(delivery.deliveryId.replace('DEL-', '')) || 1;
        const reference = `WH/OUT/${String(deliveryNumber).padStart(4, '0')}`;
        const contact = contacts[Math.floor(Math.random() * contacts.length)];
        
        const deliveryResult = await client.query(
          `INSERT INTO deliveries (
            delivery_id, reference, customer, to_customer, contact, date, schedule_date,
            status, warehouse_id, from_location_id, operation_type, created_by
          )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (delivery_id) DO UPDATE SET
             customer = EXCLUDED.customer,
             to_customer = COALESCE(EXCLUDED.to_customer, EXCLUDED.customer),
             date = EXCLUDED.date,
             schedule_date = COALESCE(EXCLUDED.schedule_date, EXCLUDED.date),
             status = EXCLUDED.status,
             reference = COALESCE(EXCLUDED.reference, deliveries.reference),
             contact = COALESCE(EXCLUDED.contact, deliveries.contact),
             from_location_id = COALESCE(EXCLUDED.from_location_id, deliveries.from_location_id)
           RETURNING id`,
          [
            delivery.deliveryId, reference, delivery.customer, delivery.customer,
            contact, delivery.date, delivery.date, delivery.status,
            warehouseId, locationId, 'Delivery Order', userId
          ]
        );
        const deliveryDbId = deliveryResult.rows[0].id;
        
        // Insert delivery items
        // For ready and done statuses, reserve stock; for draft and waiting, don't reserve yet
        const shouldReserveStock = (delivery.status === 'ready' || delivery.status === 'done');
        
        for (const item of delivery.items) {
          const productId = typeof item.productId === 'number' 
            ? productIds[item.productId] 
            : item.productId;
          if (productId) {
            const reservedStock = shouldReserveStock ? item.quantity : 0;
            await client.query(
              `INSERT INTO delivery_items (delivery_id, product_id, quantity, reserved_stock)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT DO NOTHING`,
              [deliveryDbId, productId, item.quantity, reservedStock]
            );
          }
        }
      }
      console.log(`  ✅ Created ${deliveries.length} deliveries`);
      
      await client.query('COMMIT');
      console.log('✅ Database seeded successfully!');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

