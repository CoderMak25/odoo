import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Search, Plus, Edit, Trash2, Package } from 'lucide-react';

const categories = ['Electronics', 'Furniture', 'Raw Materials', 'Chemicals', 'Hardware'];
const uoms = ['kg', 'pcs', 'liters', 'meters'];

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    uom: '',
    initialStock: '',
    reorderLevel: '',
  });
  const [errors, setErrors] = useState({});

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (product) => {
    if (product.status === 'out_of_stock') {
      return <Badge variant="danger">Out of Stock</Badge>;
    }
    if (product.status === 'low_stock') {
      return <Badge variant="warning">Low Stock</Badge>;
    }
    return <Badge variant="success">In Stock</Badge>;
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        uom: product.uom,
        initialStock: product.stock.toString(),
        reorderLevel: product.reorderLevel.toString(),
      });
      setSelectedProduct(product);
    } else {
      setFormData({
        name: '',
        sku: '',
        category: '',
        uom: '',
        initialStock: '',
        reorderLevel: '',
      });
      setSelectedProduct(null);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.uom) newErrors.uom = 'Unit of measure is required';
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
      initialStock: parseFloat(formData.initialStock),
      reorderLevel: parseFloat(formData.reorderLevel),
    };

    if (selectedProduct) {
      updateProduct(selectedProduct.id, productData);
    } else {
      addProduct(productData);
    }

    handleCloseModal();
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteProduct(selectedProduct.id);
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50 mb-2">Products</h1>
          <p className="text-sm text-slate-400">Manage your product catalog</p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by product name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-md border border-white/10 bg-white/5 text-slate-200 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      {/* Products Table */}
      <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Product Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">SKU/Code</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Category</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Unit</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Current Stock</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Status</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-200">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-slate-300">{product.sku}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-slate-300">{product.category}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-slate-300">{product.uom}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-slate-200">{product.stock}</span>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(product)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="rounded-md p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-white/5"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="rounded-md p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProduct ? 'Edit Product' : 'Add Product'}
        size="md"
      >
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
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value });
                setErrors({ ...errors, category: '' });
              }}
              options={categories}
              error={errors.category}
              required
            />

            <Select
              label="Unit of Measure"
              value={formData.uom}
              onChange={(e) => {
                setFormData({ ...formData, uom: e.target.value });
                setErrors({ ...errors, uom: '' });
              }}
              options={uoms}
              error={errors.uom}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            />

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
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {selectedProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}

