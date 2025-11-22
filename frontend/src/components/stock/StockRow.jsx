import { Edit } from 'lucide-react';
import Button from '../ui/Button';

export default function StockRow({ product, onEdit, index }) {
  const perUnitCost = product.perUnitCost || product.cost || 0;
  const onHand = product.onHand ?? product.stock ?? 0;
  const freeToUse = product.freeToUse ?? onHand;

  // Determine status based on OnHand quantity
  const getStatus = () => {
    if (onHand > 20) {
      return { text: 'In Stock', variant: 'info' };
    } else if (onHand >= 1 && onHand <= 20) {
      return { text: 'Low Stock', variant: 'warning' };
    } else {
      return { text: 'No Stock', variant: 'danger' };
    }
  };

  const status = getStatus();

  return (
    <tr className="hover:bg-white/5">
      <td className="py-3 px-4">
        <span className="text-sm font-medium text-slate-200">{product.name}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-slate-300">{product.sku || 'N/A'}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-slate-300">₹{perUnitCost.toLocaleString()}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-slate-300">{onHand}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-slate-300">{freeToUse}</span>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
          status.variant === 'info' 
            ? 'border-sky-500/20 bg-sky-500/10 text-sky-300'
            : status.variant === 'warning'
            ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
            : 'border-rose-500/20 bg-rose-500/10 text-rose-300'
        }`}>
          {status.text}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(product)}
            className="rounded-md p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-white/5"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
