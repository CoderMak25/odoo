import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ProductSelect from './ProductSelect';

export default function RemoveStockModal({ isOpen, onClose, products, onSave }) {
  const [formData, setFormData] = useState({
    productId: '',
  });
  const [errors, setErrors] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ productId: '' });
      setErrors({});
      setSelectedProduct(null);
    }
  }, [isOpen, products]);

  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    setSelectedProduct(product);
    setFormData({ productId });
    setErrors({ ...errors, productId: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.productId) {
      newErrors.productId = 'Please select a product';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (selectedProduct) {
      // Delete the product entirely
      onSave(parseInt(formData.productId));
    }
    onClose();
  };

  const productOptions = products.map(p => ({
    value: p.id.toString(),
    label: p.name,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Remove Stock" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ProductSelect
          label="Select Product"
          value={formData.productId}
          onChange={handleProductChange}
          options={productOptions}
          error={errors.productId}
          required
        />

        {selectedProduct && (
          <div className="rounded-md border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-slate-400 mb-2">Current Stock</p>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">On Hand:</span>
              <span className="text-slate-200 font-medium">
                {selectedProduct.onHand ?? selectedProduct.stock ?? 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Free to Use:</span>
              <span className="text-slate-200 font-medium">
                {selectedProduct.freeToUse ?? selectedProduct.onHand ?? selectedProduct.stock ?? 0}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-rose-400 font-medium">
                ⚠️ This will permanently delete this product from the stock table
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" disabled={!selectedProduct}>
            Delete Product
          </Button>
        </div>
      </form>
    </Modal>
  );
}
