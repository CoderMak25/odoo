import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../utils/api';

const AppContext = createContext();

const STORAGE_KEYS = {
  USER: 'stockmaster_user',
};

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
  const [products, setProducts] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [user, setUser] = useState(() => loadFromStorage(STORAGE_KEYS.USER, null));
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data from API on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [productsData, receiptsData, deliveriesData] = await Promise.all([
          api.fetchProducts().catch(() => []),
          api.fetchReceipts().catch(() => []),
          api.fetchDeliveries().catch(() => []),
        ]);
        
        setProducts(productsData);
        setReceipts(receiptsData);
        setDeliveries(deliveriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load data from server', 'error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Sync user to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USER, user);
  }, [user]);

  // Helper function to determine product status
  function getProductStatus(stock, reorderLevel) {
    if (stock === 0) return 'out_of_stock';
    if (stock <= reorderLevel) return 'low_stock';
    return 'in_stock';
  }

  // Product operations
  const addProduct = async (product) => {
    try {
      const newProduct = await api.createProduct({
        name: product.name,
        sku: product.sku,
        category: product.category,
        uom: product.uom,
        initialStock: product.initialStock || 0,
        reorderLevel: product.reorderLevel || 0,
      });
      setProducts([...products, newProduct]);
      showToast('Product added successfully', 'success');
    } catch (error) {
      console.error('Error adding product:', error);
      showToast(error.message || 'Failed to add product', 'error');
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      const updated = await api.updateProduct(id, {
        name: updates.name,
        sku: updates.sku,
        category: updates.category,
        uom: updates.uom,
        stock: updates.stock !== undefined ? updates.stock : updates.initialStock,
        reorderLevel: updates.reorderLevel,
      });
      setProducts(products.map(p => p.id === id ? updated : p));
      showToast('Product updated successfully', 'success');
    } catch (error) {
      console.error('Error updating product:', error);
      showToast(error.message || 'Failed to update product', 'error');
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      showToast('Product deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast(error.message || 'Failed to delete product', 'error');
    }
  };

  // Receipt operations
  const addReceipt = async (receipt) => {
    try {
      const newReceipt = await api.createReceipt({
        supplier: receipt.supplier,
        date: receipt.date,
        status: receipt.status || 'draft',
        items: receipt.items,
      });
      setReceipts([...receipts, newReceipt]);
      
      // Update product stock if receipt is validated
      if (receipt.status === 'done') {
        await refreshProducts();
      }
      
      showToast('Receipt created successfully', 'success');
    } catch (error) {
      console.error('Error adding receipt:', error);
      showToast(error.message || 'Failed to create receipt', 'error');
    }
  };

  const updateReceipt = async (id, updates) => {
    try {
      const updated = await api.updateReceipt(id, {
        supplier: updates.supplier,
        date: updates.date,
        status: updates.status,
        items: updates.items,
      });
      setReceipts(receipts.map(r => r.id === id ? updated : r));
      showToast('Receipt updated successfully', 'success');
    } catch (error) {
      console.error('Error updating receipt:', error);
      showToast(error.message || 'Failed to update receipt', 'error');
    }
  };

  const validateReceipt = async (id) => {
    try {
      await api.validateReceipt(id);
      // Refresh receipts and products to get updated data
      const [updatedReceipts, updatedProducts] = await Promise.all([
        api.fetchReceipts(),
        api.fetchProducts(),
      ]);
      setReceipts(updatedReceipts);
      setProducts(updatedProducts);
      showToast('Receipt validated successfully', 'success');
    } catch (error) {
      console.error('Error validating receipt:', error);
      showToast(error.message || 'Failed to validate receipt', 'error');
    }
  };

  const deleteReceipt = async (id) => {
    try {
      await api.deleteReceipt(id);
      setReceipts(receipts.filter(r => r.id !== id));
      showToast('Receipt deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting receipt:', error);
      showToast(error.message || 'Failed to delete receipt', 'error');
    }
  };

  // Delivery operations
  const addDelivery = async (delivery) => {
    try {
      const newDelivery = await api.createDelivery({
        customer: delivery.customer,
        date: delivery.date,
        status: delivery.status || 'draft',
        items: delivery.items,
      });
      setDeliveries([...deliveries, newDelivery]);
      
      // Update product stock if delivery is done
      if (delivery.status === 'done') {
        await refreshProducts();
      }
      
      showToast('Delivery order created successfully', 'success');
    } catch (error) {
      console.error('Error adding delivery:', error);
      showToast(error.message || 'Failed to create delivery', 'error');
    }
  };

  const updateDelivery = async (id, updates) => {
    try {
      const updated = await api.updateDelivery(id, {
        customer: updates.customer,
        date: updates.date,
        status: updates.status,
        items: updates.items,
      });
      setDeliveries(deliveries.map(d => d.id === id ? updated : d));
      showToast('Delivery updated successfully', 'success');
    } catch (error) {
      console.error('Error updating delivery:', error);
      showToast(error.message || 'Failed to update delivery', 'error');
    }
  };

  const deleteDelivery = async (id) => {
    try {
      await api.deleteDelivery(id);
      setDeliveries(deliveries.filter(d => d.id !== id));
      showToast('Delivery deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting delivery:', error);
      showToast(error.message || 'Failed to delete delivery', 'error');
    }
  };

  // Helper to refresh products
  const refreshProducts = async () => {
    try {
      const updatedProducts = await api.fetchProducts();
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  };

  // Auth operations
  const login = (email, password) => {
    // Mock authentication - TODO: implement real auth
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
    loading,
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
