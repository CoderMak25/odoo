import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function EditStockModal({ isOpen, onClose, product, onSave }) {
  const [formData, setFormData] = useState({
    perUnitCost: '',
    onHand: '',
    freeToUse: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        perUnitCost: (product.perUnitCost || product.cost || 0).toString(),
        onHand: (product.onHand ?? product.stock ?? 0).toString(),
        freeToUse: (product.freeToUse ?? product.onHand ?? product.stock ?? 0).toString(),
      });
      setErrors({});
    }
  }, [product, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const perUnitCostNum = parseFloat(formData.perUnitCost);
    const onHandNum = parseFloat(formData.onHand);
    const freeToUseNum = parseFloat(formData.freeToUse);

    if (isNaN(perUnitCostNum) || perUnitCostNum < 0) {
      newErrors.perUnitCost = 'Valid per unit cost is required';
    }

    if (isNaN(onHandNum) || onHandNum < 0) {
      newErrors.onHand = 'Valid on-hand quantity is required';
    }

    if (isNaN(freeToUseNum) || freeToUseNum < 0) {
      newErrors.freeToUse = 'Valid free-to-use quantity is required';
    }

    if (freeToUseNum > onHandNum) {
      newErrors.freeToUse = 'Free to use cannot exceed on-hand quantity';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      perUnitCost: perUnitCostNum,
      onHand: onHandNum,
      freeToUse: freeToUseNum,
    });
    onClose();
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Stock" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-md border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400 mb-1">Product Name</p>
          <p className="text-sm font-medium text-slate-200">{product.name}</p>
        </div>

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
          label="On Hand"
          type="number"
          value={formData.onHand}
          onChange={(e) => {
            setFormData({ ...formData, onHand: e.target.value });
            setErrors({ ...errors, onHand: '' });
          }}
          error={errors.onHand}
          required
          min="0"
          step="1"
        />

        <Input
          label="Free to Use"
          type="number"
          value={formData.freeToUse}
          onChange={(e) => {
            setFormData({ ...formData, freeToUse: e.target.value });
            setErrors({ ...errors, freeToUse: '' });
          }}
          error={errors.freeToUse}
          required
          min="0"
          step="1"
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
