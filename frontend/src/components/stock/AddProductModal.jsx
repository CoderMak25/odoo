import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import ProductSelect from './ProductSelect';
import Button from '../ui/Button';

const categories = ['Electronics', 'Furniture', 'Raw Materials', 'Chemicals', 'Hardware'];
const uoms = ['kg', 'pcs', 'liters', 'meters'];

export default function AddProductModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    uom: '',
    perUnitCost: '',
    initialStock: '',
    reorderLevel: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        sku: '',
        category: '',
        uom: '',
        perUnitCost: '',
        initialStock: '',
        reorderLevel: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.uom) newErrors.uom = 'Unit of measure is required';
    if (!formData.perUnitCost || isNaN(formData.perUnitCost) || parseFloat(formData.perUnitCost) < 0) {
      newErrors.perUnitCost = 'Valid per unit cost is required';
    }
    if (!formData.initialStock || isNaN(formData.initialStock) || parseFloat(formData.initialStock) < 0) {
      newErrors.initialStock = 'Valid initial stock is required';
    }
    if (!formData.reorderLevel || isNaN(formData.reorderLevel) || parseFloat(formData.reorderLevel) < 0) {
      newErrors.reorderLevel = 'Valid reorder level is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const productData = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      category: formData.category,
      uom: formData.uom,
      perUnitCost: parseFloat(formData.perUnitCost),
      initialStock: parseFloat(formData.initialStock),
      reorderLevel: parseFloat(formData.reorderLevel),
    };

    onSave(productData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Product" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Product Name"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            setErrors({ ...errors, name: '' });
          }}
          error={errors.name}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="SKU/Code"
            value={formData.sku}
            onChange={(e) => {
              setFormData({ ...formData, sku: e.target.value });
              setErrors({ ...errors, sku: '' });
            }}
            error={errors.sku}
            required
          />
          <div className="flex items-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const autoSku = `PRD-${Date.now().toString().slice(-6)}`;
                setFormData({ ...formData, sku: autoSku });
              }}
              className="w-full"
            >
              Auto-generate
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ProductSelect
            label="Category"
            value={formData.category}
            onChange={(value) => {
              setFormData({ ...formData, category: value });
              setErrors({ ...errors, category: '' });
            }}
            options={categories.map(cat => ({ value: cat, label: cat }))}
            error={errors.category}
            required
            placeholder="Select category..."
          />

          <ProductSelect
            label="Unit of Measure"
            value={formData.uom}
            onChange={(value) => {
              setFormData({ ...formData, uom: value });
              setErrors({ ...errors, uom: '' });
            }}
            options={uoms.map(uom => ({ value: uom, label: uom }))}
            error={errors.uom}
            required
            placeholder="Select unit..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Per Unit Cost (₹)"
            type="number"
            value={formData.perUnitCost}
            onChange={(e) => {
              setFormData({ ...formData, perUnitCost: e.target.value });
              setErrors({ ...errors, perUnitCost: '' });
            }}
            error={errors.perUnitCost}
            required
            min="0"
            step="0.01"
          />

          <Input
            label="Initial Stock"
            type="number"
            value={formData.initialStock}
            onChange={(e) => {
              setFormData({ ...formData, initialStock: e.target.value });
              setErrors({ ...errors, initialStock: '' });
            }}
            error={errors.initialStock}
            required
            min="0"
          />
        </div>

        <Input
          label="Reorder Level"
          type="number"
          value={formData.reorderLevel}
          onChange={(e) => {
            setFormData({ ...formData, reorderLevel: e.target.value });
            setErrors({ ...errors, reorderLevel: '' });
          }}
          error={errors.reorderLevel}
          required
          min="0"
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add Product
          </Button>
        </div>
      </form>
    </Modal>
  );
}

