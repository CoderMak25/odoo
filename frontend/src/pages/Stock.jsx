import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import TopNavigationTabs from '../components/stock/TopNavigationTabs';
import SearchBar from '../components/stock/SearchBar';
import StockTable from '../components/stock/StockTable';
import StockCard from '../components/stock/StockCard';
import EditStockModal from '../components/stock/EditStockModal';

export default function Stock() {
  const { products, updateStock, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSave = (stockData) => {
    if (selectedProduct) {
      updateStock(selectedProduct.id, stockData);
      showToast('Stock updated successfully', 'success');
    }
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Navigation Tabs */}
      <TopNavigationTabs />

      {/* Main Content */}
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="animate-slide-up">
            <h1 className="text-3xl font-bold text-slate-50 mb-2">Stock</h1>
            <p className="text-sm text-slate-400">
              This page contains the warehouse details & location.
            </p>
          </div>
          <div className="animate-slide-up stagger-1">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block animate-slide-up stagger-2">
          <StockTable products={filteredProducts} onEdit={handleEdit} />
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden grid grid-cols-1 gap-4 animate-slide-up stagger-2">
          {filteredProducts.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-12 text-center">
              <p className="text-sm text-slate-400">No products found</p>
            </div>
          ) : (
            filteredProducts.map((product, index) => (
              <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${0.1 * index}s` }}>
                <StockCard product={product} onEdit={handleEdit} />
              </div>
            ))
          )}
        </div>

        {/* Edit Stock Modal */}
        <EditStockModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          product={selectedProduct}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

