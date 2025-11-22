import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Package, Bell, Download, Upload, ArrowLeftRight } from 'lucide-react';

export default function Dashboard() {
  const { getDashboardKPIs, receipts, deliveries, products } = useApp();
  const kpis = getDashboardKPIs();

  const kpiCards = [
    {
      title: 'Total Products in Stock',
      value: kpis.totalProducts,
      icon: Package,
      iconColor: 'text-indigo-400',
      trend: '+5 this month',
      trendColor: 'text-emerald-400',
    },
    {
      title: 'Low Stock Items',
      value: kpis.lowStockItems,
      icon: Bell,
      iconColor: 'text-amber-400',
      trend: `${kpis.lowStockItems} need attention`,
      trendColor: 'text-rose-400',
    },
    {
      title: 'Pending Receipts',
      value: kpis.pendingReceipts,
      icon: Download,
      iconColor: 'text-emerald-400',
      trend: '7 waiting',
      trendColor: 'text-slate-400',
    },
    {
      title: 'Pending Deliveries',
      value: kpis.pendingDeliveries,
      icon: Upload,
      iconColor: 'text-sky-400',
      trend: '4 ready',
      trendColor: 'text-slate-400',
    },
    {
      title: 'Internal Transfers Scheduled',
      value: kpis.scheduledTransfers,
      icon: ArrowLeftRight,
      iconColor: 'text-fuchsia-400',
      trend: '0 scheduled',
      trendColor: 'text-slate-400',
    },
  ];

  const statusFilters = ['Draft', 'Waiting', 'Ready', 'Done'];
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Get recent activity (last 5 transactions)
  const recentActivity = [
    ...receipts.slice(0, 3).map(r => ({ ...r, type: 'receipt' })),
    ...deliveries.slice(0, 2).map(d => ({ ...d, type: 'delivery' })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const getStatusBadge = (status) => {
    const variants = {
      draft: 'default',
      waiting: 'warning',
      ready: 'info',
      done: 'success',
      canceled: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50 mb-2">Dashboard</h1>
        <p className="text-sm text-slate-400">Overview of your inventory operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">{kpi.title}</span>
                <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
              <div className="text-2xl font-semibold tracking-tight text-slate-50 mb-1">{kpi.value}</div>
              <div className={`text-[0.7rem] ${kpi.trendColor}`}>{kpi.trend}</div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-400">Filter by Status:</span>
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedStatus === 'all'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          All
        </button>
        {statusFilters.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status.toLowerCase())}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedStatus === status.toLowerCase()
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-50">Recent Activity</h2>
          <span className="text-xs text-slate-400">Last 5 transactions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Type</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">ID</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Details</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {recentActivity.map((activity) => (
                <tr key={activity.id} className="hover:bg-white/5">
                  <td className="py-3 px-4">
                    <span className="text-xs font-medium text-slate-300">
                      {activity.type === 'receipt' ? 'Receipt' : 'Delivery'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-slate-200">
                      {activity.receiptId || activity.deliveryId}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-slate-400">
                      {activity.supplier || activity.customer}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-slate-400">{activity.date}</span>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(activity.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

