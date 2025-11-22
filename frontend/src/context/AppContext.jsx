import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const STORAGE_KEYS = {
  PRODUCTS: 'stockmaster_products',
  RECEIPTS: 'stockmaster_receipts',
  DELIVERIES: 'stockmaster_deliveries',
  USER: 'stockmaster_user',
};

// Mock initial data
const initialProducts = [
  { id: 1, name: 'Steel Rods', sku: 'STL-001', category: 'Raw Materials', uom: 'kg', stock: 1250, reorderLevel: 200, status: 'in_stock' },
  { id: 2, name: 'Office Chairs', sku: 'FUR-001', category: 'Furniture', uom: 'pcs', stock: 45, reorderLevel: 20, status: 'in_stock' },
  { id: 3, name: 'Laptop Computers', sku: 'ELC-001', category: 'Electronics', uom: 'pcs', stock: 12, reorderLevel: 15, status: 'low_stock' },
  { id: 4, name: 'Wooden Planks', sku: 'RAW-001', category: 'Raw Materials', uom: 'meters', stock: 320, reorderLevel: 100, status: 'in_stock' },
  { id: 5, name: 'Paint (Blue)', sku: 'CHM-001', category: 'Chemicals', uom: 'liters', stock: 8, reorderLevel: 20, status: 'low_stock' },
  { id: 6, name: 'Screws (M6)', sku: 'HRD-001', category: 'Hardware', uom: 'pcs', stock: 0, reorderLevel: 500, status: 'out_of_stock' },
  { id: 7, name: 'LED Bulbs', sku: 'ELC-002', category: 'Electronics', uom: 'pcs', stock: 150, reorderLevel: 50, status: 'in_stock' },
  { id: 8, name: 'Desk Tables', sku: 'FUR-002', category: 'Furniture', uom: 'pcs', stock: 25, reorderLevel: 10, status: 'in_stock' },
  { id: 9, name: 'Motor Oil', sku: 'CHM-002', category: 'Chemicals', uom: 'liters', stock: 5, reorderLevel: 30, status: 'low_stock' },
  { id: 10, name: 'Nails (3 inch)', sku: 'HRD-002', category: 'Hardware', uom: 'pcs', stock: 850, reorderLevel: 200, status: 'in_stock' },
];

const initialReceipts = [
  { id: 1, receiptId: 'RCP-001', supplier: 'Steel Corp Ltd', date: '2025-01-15', status: 'done', items: [{ productId: 1, quantity: 50 }], totalItems: 50 },
  { id: 2, receiptId: 'RCP-002', supplier: 'Furniture World', date: '2025-01-16', status: 'ready', items: [{ productId: 2, quantity: 20 }], totalItems: 20 },
  { id: 3, receiptId: 'RCP-003', supplier: 'Tech Supplies Inc', date: '2025-01-17', status: 'waiting', items: [{ productId: 3, quantity: 10 }], totalItems: 10 },
  { id: 4, receiptId: 'RCP-004', supplier: 'Raw Materials Co', date: '2025-01-18', status: 'draft', items: [{ productId: 4, quantity: 100 }], totalItems: 100 },
  { id: 5, receiptId: 'RCP-005', supplier: 'Chemical Solutions', date: '2025-01-19', status: 'canceled', items: [{ productId: 5, quantity: 15 }], totalItems: 15 },
];

const initialDeliveries = [
  { id: 1, deliveryId: 'DEL-001', customer: 'ABC Manufacturing', date: '2025-01-15', status: 'done', items: [{ productId: 1, quantity: 20 }], totalItems: 20 },
  { id: 2, deliveryId: 'DEL-002', customer: 'XYZ Retail', date: '2025-01-16', status: 'ready', items: [{ productId: 2, quantity: 10 }], totalItems: 10 },
  { id: 3, deliveryId: 'DEL-003', customer: 'Tech Store', date: '2025-01-17', status: 'waiting', items: [{ productId: 3, quantity: 5 }], totalItems: 5 },
  { id: 4, deliveryId: 'DEL-004', customer: 'Construction Co', date: '2025-01-18', status: 'draft', items: [{ productId: 4, quantity: 50 }], totalItems: 50 },
  { id: 5, deliveryId: 'DEL-005', customer: 'Home Depot', date: '2025-01-19', status: 'done', items: [{ productId: 7, quantity: 30 }], totalItems: 30 },
];

function loadFromStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function AppProvider({ children }) {
  const [products, setProducts] = useState(() => loadFromStorage(STORAGE_KEYS.PRODUCTS, initialProducts));
  const [receipts, setReceipts] = useState(() => loadFromStorage(STORAGE_KEYS.RECEIPTS, initialReceipts));
  const [deliveries, setDeliveries] = useState(() => loadFromStorage(STORAGE_KEYS.DELIVERIES, initialDeliveries));
  const [user, setUser] = useState(() => loadFromStorage(STORAGE_KEYS.USER, null));
  const [toast, setToast] = useState(null);

  // Sync to localStorage whenever state changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RECEIPTS, receipts);
  }, [receipts]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DELIVERIES, deliveries);
  }, [deliveries]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USER, user);
  }, [user]);

  // Product operations
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      stock: product.initialStock || 0,
      status: getProductStatus(product.initialStock || 0, product.reorderLevel || 0),
    };
    setProducts([...products, newProduct]);
    showToast('Product added successfully', 'success');
  };

  const updateProduct = (id, updates) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        updated.status = getProductStatus(updated.stock, updated.reorderLevel);
        return updated;
      }
      return p;
    }));
    showToast('Product updated successfully', 'success');
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
    showToast('Product deleted successfully', 'success');
  };

  // Receipt operations
  const addReceipt = (receipt) => {
    const receiptNumber = receipts.length + 1;
    const newReceipt = {
      ...receipt,
      id: Date.now(),
      receiptId: `RCP-${String(receiptNumber).padStart(3, '0')}`,
      totalItems: receipt.items.reduce((sum, item) => sum + item.quantity, 0),
    };
    setReceipts([...receipts, newReceipt]);
    
    // Update product stock if receipt is validated
    if (receipt.status === 'done') {
      receipt.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          updateProduct(product.id, { stock: product.stock + item.quantity });
        }
      });
    }
    
    showToast('Receipt created successfully', 'success');
  };

  const updateReceipt = (id, updates) => {
    setReceipts(receipts.map(r => {
      if (r.id === id) {
        const updated = { ...r, ...updates };
        updated.totalItems = updated.items.reduce((sum, item) => sum + item.quantity, 0);
        return updated;
      }
      return r;
    }));
    showToast('Receipt updated successfully', 'success');
  };

  const validateReceipt = (id) => {
    const receipt = receipts.find(r => r.id === id);
    if (receipt && receipt.status !== 'done') {
      receipt.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          updateProduct(product.id, { stock: product.stock + item.quantity });
        }
      });
      updateReceipt(id, { status: 'done' });
      showToast('Receipt validated successfully', 'success');
    }
  };

  const deleteReceipt = (id) => {
    setReceipts(receipts.filter(r => r.id !== id));
    showToast('Receipt deleted successfully', 'success');
  };

  // Delivery operations
  const addDelivery = (delivery) => {
    const deliveryNumber = deliveries.length + 1;
    const newDelivery = {
      ...delivery,
      id: Date.now(),
      deliveryId: `DEL-${String(deliveryNumber).padStart(3, '0')}`,
      totalItems: delivery.items.reduce((sum, item) => sum + item.quantity, 0),
    };
    setDeliveries([...deliveries, newDelivery]);
    
    // Update product stock if delivery is done
    if (delivery.status === 'done') {
      delivery.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          updateProduct(product.id, { stock: Math.max(0, product.stock - item.quantity) });
        }
      });
    }
    
    showToast('Delivery order created successfully', 'success');
  };

  const updateDelivery = (id, updates) => {
    setDeliveries(deliveries.map(d => {
      if (d.id === id) {
        const updated = { ...d, ...updates };
        updated.totalItems = updated.items.reduce((sum, item) => sum + item.quantity, 0);
        return updated;
      }
      return d;
    }));
    showToast('Delivery updated successfully', 'success');
  };

  const deleteDelivery = (id) => {
    setDeliveries(deliveries.filter(d => d.id !== id));
    showToast('Delivery deleted successfully', 'success');
  };

  // Auth operations
  const login = (email, password) => {
    // Mock authentication
    const mockUser = { email, name: 'Admin User' };
    setUser(mockUser);
    showToast('Login successful', 'success');
    return true;
  };

  const logout = () => {
    setUser(null);
    showToast('Logged out successfully', 'success');
  };

  // Toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Helper function to determine product status
  function getProductStatus(stock, reorderLevel) {
    if (stock === 0) return 'out_of_stock';
    if (stock <= reorderLevel) return 'low_stock';
    return 'in_stock';
  }

  // Calculate dashboard KPIs
  const getDashboardKPIs = () => {
    const totalProducts = products.length;
    const lowStockItems = products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').length;
    const pendingReceipts = receipts.filter(r => r.status !== 'done' && r.status !== 'canceled').length;
    const pendingDeliveries = deliveries.filter(d => d.status !== 'done' && d.status !== 'canceled').length;
    const scheduledTransfers = 0; // Placeholder for future feature

    return {
      totalProducts,
      lowStockItems,
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers,
    };
  };

  const value = {
    products,
    receipts,
    deliveries,
    user,
    toast,
    addProduct,
    updateProduct,
    deleteProduct,
    addReceipt,
    updateReceipt,
    validateReceipt,
    deleteReceipt,
    addDelivery,
    updateDelivery,
    deleteDelivery,
    login,
    logout,
    showToast,
    closeToast,
    getDashboardKPIs,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

