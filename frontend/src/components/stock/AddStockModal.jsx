import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ProductSelect from './ProductSelect';

export default function AddStockModal({ isOpen, onClose, products, onSave }) {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ productId: '', quantity: '' });
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.productId) {
      newErrors.productId = 'Please select a product';
    }

    const quantityNum = parseFloat(formData.quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedProduct = products.find(p => p.id === parseInt(formData.productId));
    if (selectedProduct) {
      const currentOnHand = selectedProduct.onHand ?? selectedProduct.stock ?? 0;
      const currentFreeToUse = selectedProduct.freeToUse ?? currentOnHand;
      
      onSave({
        productId: parseInt(formData.productId),
        onHand: currentOnHand + quantityNum,
        freeToUse: currentFreeToUse + quantityNum,
      });
    }
    onClose();
  };

  const productOptions = products.map(p => ({
    value: p.id.toString(),
    label: p.name,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Stock" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ProductSelect
          label="Select Product"
          value={formData.productId}
          onChange={(value) => {
            setFormData({ ...formData, productId: value });
            setErrors({ ...errors, productId: '' });
          }}
          options={productOptions}
          error={errors.productId}
          required
        />

        <Input
          label="Quantity to Add"
          type="number"
          value={formData.quantity}
          onChange={(e) => {
            setFormData({ ...formData, quantity: e.target.value });
            setErrors({ ...errors, quantity: '' });
          }}
          error={errors.quantity}
          required
          min="0.01"
          step="0.01"
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add Stock
          </Button>
        </div>
      </form>
    </Modal>
  );
}

