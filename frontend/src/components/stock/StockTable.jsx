import StockRow from './StockRow';

export default function StockTable({ products, onEdit }) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-12 text-center">
        <p className="text-sm text-slate-400">No products found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Product</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">SKU</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Per Unit Cost</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">On Hand</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Free to Use</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Status</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {products.map((product, index) => (
              <StockRow key={product.id} product={product} onEdit={onEdit} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
