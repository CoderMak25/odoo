const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Health check
export async function fetchHealth() {
  return apiCall('/health');
}

// Test database connection
export async function fetchData() {
  return apiCall('/data');
}

// Products API
export async function fetchProducts() {
  return apiCall('/products');
}

export async function createProduct(product) {
  return apiCall('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export async function updateProduct(id, product) {
  return apiCall(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

export async function deleteProduct(id) {
  return apiCall(`/products/${id}`, {
    method: 'DELETE',
  });
}

// Receipts API
export async function fetchReceipts() {
  return apiCall('/receipts');
}

export async function createReceipt(receipt) {
  return apiCall('/receipts', {
    method: 'POST',
    body: JSON.stringify(receipt),
  });
}

export async function updateReceipt(id, receipt) {
  return apiCall(`/receipts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(receipt),
  });
}

export async function validateReceipt(id) {
  return apiCall(`/receipts/${id}/validate`, {
    method: 'POST',
  });
}

export async function deleteReceipt(id) {
  return apiCall(`/receipts/${id}`, {
    method: 'DELETE',
  });
}

// Deliveries API
export async function fetchDeliveries() {
  return apiCall('/deliveries');
}

export async function createDelivery(delivery) {
  return apiCall('/deliveries', {
    method: 'POST',
    body: JSON.stringify(delivery),
  });
}

export async function updateDelivery(id, delivery) {
  return apiCall(`/deliveries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(delivery),
  });
}

export async function deleteDelivery(id) {
  return apiCall(`/deliveries/${id}`, {
    method: 'DELETE',
  });
}
