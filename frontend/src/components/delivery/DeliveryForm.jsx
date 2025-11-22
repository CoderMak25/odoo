import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, Printer, X, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import StatusStepper from './StatusStepper';
import ProductSelector from './ProductSelector';
import LineItemsTable from './LineItemsTable';
import ConfirmDialog from '../ui/ConfirmDialog';
import * as api from '../../utils/api';
import { useApp } from '../../context/AppContext';

const OPERATION_TYPES = [
  'Delivery Order',
  'Sales Return',
  'Internal Transfer',
  'Customer Return'
];

export default function DeliveryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, showToast } = useApp();
  const isNew = !id || id === 'new';
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    delivery_address: '',
    responsible: '',
    schedule_date: new Date().toISOString().split('T')[0],
    operation_type: 'Delivery Order',
    to_customer: '',
    contact: '',
    from_location_id: null,
    notes: ''
  });
  
  const [lineItems, setLineItems] = useState([]);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [errors, setErrors] = useState({});
  const [itemForm, setItemForm] = useState({ productId: '', quantity: '' });
  const [itemErrors, setItemErrors] = useState({});
  const [validateDialog, setValidateDialog] = useState({ open: false });
  const [processDialog, setProcessDialog] = useState({ open: false });
  const [deleteDialog, setDeleteDialog] = useState({ open: false });
  
  useEffect(() => {
    if (!isNew) {
      fetchDelivery();
    }
  }, [id]);
  
  const fetchDelivery = async () => {
    try {
      setLoading(true);
      const delivery = await api.fetchDeliveryById(id);
      setCurrentDelivery(delivery);
      setFormData({
        delivery_address: delivery.delivery_address || '',
        responsible: delivery.responsible || '',
        schedule_date: delivery.schedule_date || delivery.date || new Date().toISOString().split('T')[0],
        operation_type: delivery.operation_type || 'Delivery Order',
        to_customer: delivery.to_customer || delivery.customer || '',
        contact: delivery.contact || '',
        from_location_id: delivery.from_location_id || null,
        notes: delivery.notes || ''
      });
      setLineItems(delivery.items || []);
    } catch (error) {
      console.error('Error fetching delivery:', error);
      showToast('Failed to load delivery', 'error');
      navigate('/deliveries');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStockCheck = async (productId, locationId) => {
    try {
      const products = await api.fetchAvailableStock(locationId);
      const product = products.find(p => p.id === productId);
      return product?.available || product?.stock || 0;
    } catch (error) {
      console.error('Error checking stock:', error);
      return 0;
    }
  };
  
  const handleAddItem = async () => {
    const newErrors = {};
    
    if (!itemForm.productId) {
      newErrors.productId = 'Please select a product';
    }
    if (!itemForm.quantity || parseFloat(itemForm.quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setItemErrors(newErrors);
      return;
    }
    
    const product = products.find(p => p.id === parseInt(itemForm.productId));
    if (!product) {
      setItemErrors({ productId: 'Product not found' });
      return;
    }
    
    const quantity = parseFloat(itemForm.quantity);
    
    // Check stock availability
    try {
      const available = await handleStockCheck(product.id, formData.from_location_id);
      if (quantity > available) {
        setItemErrors({
          quantity: `Insufficient stock. Available: ${available} ${product.uom}`
        });
        return;
      }
      
      // Check if product already exists in line items
      const existingIndex = lineItems.findIndex(item => item.productId === product.id);
      if (existingIndex >= 0) {
        const newQuantity = lineItems[existingIndex].quantity + quantity;
        if (newQuantity > available) {
          setItemErrors({
            quantity: `Total quantity exceeds available stock. Available: ${available} ${product.uom}`
          });
          return;
        }
        const updatedItems = [...lineItems];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: newQuantity
        };
        setLineItems(updatedItems);
      } else {
        setLineItems([...lineItems, {
          id: Date.now(), // Temporary ID
          productId: product.id,
          quantity: quantity,
          productName: product.name,
          sku: product.sku,
          uom: product.uom
        }]);
      }
      
      setItemForm({ productId: '', quantity: '' });
      setItemErrors({});
    } catch (error) {
      console.error('Error checking stock:', error);
      setItemErrors({ quantity: 'Error checking stock availability' });
    }
  };
  
  const handleRemoveItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };
  
  const handleQuantityChange = (index, newQuantity) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: newQuantity
    };
    setLineItems(updatedItems);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.delivery_address.trim()) {
      newErrors.delivery_address = 'Delivery address is required';
    }
    if (!formData.schedule_date) {
      newErrors.schedule_date = 'Schedule date is required';
    }
    if (!formData.to_customer.trim()) {
      newErrors.to_customer = 'Customer is required';
    }
    if (lineItems.length === 0) {
      newErrors.items = 'At least one product is required';
    }
    
    // Validate stock for all items
    lineItems.forEach((item, index) => {
      const product = products.find(p => p.id === item.productId);
      if (product && item.quantity > (product.available || product.stock || 0)) {
        newErrors[`item_${index}`] = `Insufficient stock. Available: ${product.available || product.stock || 0} ${product.uom}`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = async () => {
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }
    
    try {
      setSaving(true);
      const deliveryData = {
        ...formData,
        items: lineItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };
      
      if (isNew) {
        await api.createDelivery(deliveryData);
        showToast('Delivery created successfully', 'success');
        navigate('/deliveries');
      } else {
        await api.updateDelivery(id, deliveryData);
        showToast('Delivery updated successfully', 'success');
        fetchDelivery();
      }
    } catch (error) {
      console.error('Error saving delivery:', error);
      showToast(error.message || 'Failed to save delivery', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const handleValidate = async () => {
    try {
      setSaving(true);
      await api.validateDelivery(id);
      showToast('Delivery validated successfully', 'success');
      setValidateDialog({ open: false });
      fetchDelivery();
    } catch (error) {
      console.error('Error validating delivery:', error);
      showToast(error.message || 'Failed to validate delivery', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const handleProcess = async () => {
    try {
      setSaving(true);
      await api.processDelivery(id);
      showToast('Delivery processed successfully', 'success');
      setProcessDialog({ open: false });
      fetchDelivery();
    } catch (error) {
      console.error('Error processing delivery:', error);
      showToast(error.message || 'Failed to process delivery', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      await api.deleteDelivery(id);
      showToast('Delivery deleted successfully', 'success');
      navigate('/deliveries');
    } catch (error) {
      console.error('Error deleting delivery:', error);
      showToast(error.message || 'Failed to delete delivery', 'error');
    }
  };
  
  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading delivery...</div>;
  }
  
  const status = currentDelivery?.status || 'draft';
  const canValidate = status === 'draft' && !isNew;
  const canProcess = status === 'ready' && !isNew;
  const canEdit = status === 'draft' && !isNew;
  
  // Get products with available stock info
  const productsWithStock = products.map(p => ({
    ...p,
    available: p.stock || 0 // Will be updated by stock check
  }));
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/deliveries')}
            className="rounded-md p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-50">Delivery</h1>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <>
              {canValidate && (
                <Button
                  onClick={() => setValidateDialog({ open: true })}
                  variant="success"
                  disabled={saving}
                >
                  <CheckCircle className="h-4 w-4" />
                  Validate
                </Button>
              )}
              {canProcess && (
                <Button
                  onClick={() => setProcessDialog({ open: true })}
                  variant="success"
                  disabled={saving}
                >
                  <CheckCircle className="h-4 w-4" />
                  Process
                </Button>
              )}
              <Button variant="secondary" disabled={saving}>
                <Printer className="h-4 w-4" />
                Print
              </Button>
              {canEdit && (
                <Button
                  onClick={() => setDeleteDialog({ open: true })}
                  variant="danger"
                  disabled={saving}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              )}
            </>
          )}
          <Button
            onClick={() => navigate('/deliveries/new')}
            variant="primary"
            className="bg-red-500 hover:bg-red-600"
          >
            <Plus className="h-4 w-4" />
            NEW
          </Button>
        </div>
      </div>
      
      {/* Status Stepper */}
      {!isNew && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <StatusStepper currentStatus={status} />
        </div>
      )}
      
      {/* Delivery Information Section */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Delivery Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Delivery ID"
              value={currentDelivery?.reference || currentDelivery?.deliveryId || 'Auto-generated'}
              disabled
              className="font-mono"
            />
          </div>
          <div>
            <Input
              label="Delivery Address"
              value={formData.delivery_address}
              onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
              error={errors.delivery_address}
              required
            />
          </div>
          <div>
            <Input
              label="Responsible"
              value={formData.responsible}
              onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
              error={errors.responsible}
            />
          </div>
          <div>
            <Input
              label="Schedule Date"
              type="date"
              value={formData.schedule_date}
              onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
              error={errors.schedule_date}
              required
            />
          </div>
          <div>
            <Select
              label="Operation Type"
              value={formData.operation_type}
              onChange={(e) => setFormData({ ...formData, operation_type: e.target.value })}
              options={OPERATION_TYPES.map(type => ({ value: type, label: type }))}
              error={errors.operation_type}
            />
          </div>
          <div>
            <Input
              label="To (Customer)"
              value={formData.to_customer}
              onChange={(e) => setFormData({ ...formData, to_customer: e.target.value })}
              error={errors.to_customer}
              required
            />
          </div>
          <div>
            <Input
              label="Contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              error={errors.contact}
            />
          </div>
        </div>
      </div>
      
      {/* Products Table Section */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200">Products</h2>
        </div>
        
        {/* Add Product Form */}
        {canEdit && (
          <div className="mb-4 p-4 rounded-lg border border-white/10 bg-white/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ProductSelector
                products={productsWithStock}
                value={itemForm.productId}
                onChange={(e) => {
                  setItemForm({ ...itemForm, productId: e.target.value });
                  setItemErrors({ ...itemErrors, productId: '' });
                }}
                locationId={formData.from_location_id}
                onStockCheck={handleStockCheck}
                error={itemErrors.productId}
                required
              />
              <Input
                label="Quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={itemForm.quantity}
                onChange={(e) => {
                  setItemForm({ ...itemForm, quantity: e.target.value });
                  setItemErrors({ ...itemErrors, quantity: '' });
                }}
                error={itemErrors.quantity}
                required
              />
              <div className="flex items-end">
                <Button onClick={handleAddItem} variant="secondary" className="w-full">
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Line Items Table */}
        <LineItemsTable
          items={lineItems}
          products={productsWithStock}
          onRemoveItem={canEdit ? handleRemoveItem : null}
          onQuantityChange={canEdit ? handleQuantityChange : null}
          locationId={formData.from_location_id}
          onStockCheck={handleStockCheck}
          errors={errors}
        />
        
        {errors.items && (
          <p className="mt-2 text-xs text-rose-400">{errors.items}</p>
        )}
      </div>
      
      {/* Additional Options Section */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Additional Options</h2>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Notes/Comments
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30"
            placeholder="Add any notes or comments..."
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="secondary"
          onClick={() => navigate('/deliveries')}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="primary"
          disabled={saving || (!canEdit && !isNew)}
        >
          {saving ? 'Saving...' : isNew ? 'Create Delivery' : 'Save Changes'}
        </Button>
      </div>
      
      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={validateDialog.open}
        onClose={() => setValidateDialog({ open: false })}
        onConfirm={handleValidate}
        title="Validate Delivery"
        message="Are you sure you want to validate this delivery? This will reserve stock and change the status to 'Ready'."
      />
      
      <ConfirmDialog
        isOpen={processDialog.open}
        onClose={() => setProcessDialog({ open: false })}
        onConfirm={handleProcess}
        title="Process Delivery"
        message="Are you sure you want to process this delivery? This will decrease stock and change the status to 'Done'."
      />
      
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
        onConfirm={handleDelete}
        title="Delete Delivery"
        message="Are you sure you want to delete this delivery? This action cannot be undone."
      />
    </div>
  );
}

