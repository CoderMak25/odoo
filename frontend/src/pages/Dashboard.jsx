import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Package, Bell, Download, Upload, ArrowLeftRight, Plus,
  Calendar, Settings2, Filter, BarChart3, ArrowRight, Clock, X, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { getDashboardKPIs, receipts, deliveries, products, loading } = useApp();
  const navigate = useNavigate();
  const kpis = getDashboardKPIs();
  const [mounted, setMounted] = useState(false);
  
  // Filter states
  const dateRange = 7; // Fixed to 7 days for graph
  const [operationFilterOpen, setOperationFilterOpen] = useState(false);
  const [operationFilters, setOperationFilters] = useState({
    type: 'all', // all, receipt, delivery, internal, adjustment
    status: 'all', // all, draft, waiting, ready, done, canceled
    dateRange: 'all', // all, today, week, month
    warehouse: 'all', // all, or specific warehouse
    category: 'all', // all, or specific product category
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const operationFilterRef = useRef(null);
  
  // Get unique categories from products
  const productCategories = [...new Set(products.map(p => p.category))].sort();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (operationFilterRef.current && !operationFilterRef.current.contains(event.target)) {
        setOperationFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [operationFilters.type, operationFilters.status, operationFilters.dateRange, operationFilters.warehouse, operationFilters.category]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Calculate KPIs
  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').length;
  const pendingReceipts = receipts.filter(r => r.status !== 'done' && r.status !== 'canceled').length;
  const pendingDeliveries = deliveries.filter(d => d.status !== 'done' && d.status !== 'canceled').length;
  const scheduledTransfers = 0; // TODO: Add transfers when implemented
  
  // Additional statistics
  const lateReceipts = receipts.filter(r => r.status === 'waiting' || r.status === 'ready').length;
  const lateDeliveries = deliveries.filter(d => d.status === 'waiting' || d.status === 'ready').length;

  // Calculate operations data for selected date range
  const getDaysForRange = (days) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      result.push({
        date: date.toISOString().split('T')[0],
        dayName: dayNames[date.getDay()],
        receipt: 0,
        delivery: 0,
      });
    }
    return result;
  };

  const daysForRange = getDaysForRange(dateRange);
  const operationsData = daysForRange.map(day => {
    const dayReceipts = receipts.filter(r => r.date === day.date);
    const dayDeliveries = deliveries.filter(d => d.date === day.date);
    return {
      day: day.dayName,
      date: day.date,
      receipt: dayReceipts.length,
      delivery: dayDeliveries.length,
    };
  });

  // Combine all operations for calculations and filtering
  const allOperations = [
    ...receipts.map(r => ({ ...r, type: 'receipt', id: r.receiptId })),
    ...deliveries.map(d => ({ ...d, type: 'delivery', id: d.deliveryId })),
  ];
  
  // Calculate SLA data from actual operations
  const onTimeOps = allOperations.filter(op => op.status === 'done').length;
  const waitingOps = allOperations.filter(op => op.status === 'waiting' || op.status === 'ready').length;
  const lateOps = allOperations.filter(op => op.status === 'draft').length;
  const totalOps = allOperations.length || 1;

  const slaData = [
    { name: 'On-time', value: onTimeOps, color: '#10b981' },
    { name: 'Waiting', value: waitingOps, color: '#f59e0b' },
    { name: 'Late', value: lateOps, color: '#ef4444' },
  ];

  const onTimePercentage = Math.round((onTimeOps / totalOps) * 100);

  // Calculate status distribution for delivery card
  const doneDeliveries = deliveries.filter(d => d.status === 'done').length;
  const waitingDeliveries = deliveries.filter(d => d.status === 'waiting' || d.status === 'ready').length;
  const draftDeliveries = deliveries.filter(d => d.status === 'draft').length;
  const totalDeliveries = deliveries.length || 1;
  
  const doneRatio = doneDeliveries / totalDeliveries;
  const waitingRatio = waitingDeliveries / totalDeliveries;
  const draftRatio = draftDeliveries / totalDeliveries;

  // Apply filters
  let filteredOperations = allOperations.filter(op => {
    // Type filter
    if (operationFilters.type !== 'all' && op.type !== operationFilters.type) {
      return false;
    }
    
    // Status filter
    if (operationFilters.status !== 'all' && op.status !== operationFilters.status) {
      return false;
    }
    
    // Date range filter
    if (operationFilters.dateRange !== 'all') {
      const opDate = new Date(op.date);
      const now = new Date();
      const daysDiff = Math.floor((now - opDate) / (1000 * 60 * 60 * 24));
      
      switch (operationFilters.dateRange) {
        case 'today':
          if (daysDiff !== 0) return false;
          break;
        case 'week':
          if (daysDiff > 7) return false;
          break;
        case 'month':
          if (daysDiff > 30) return false;
          break;
      }
    }
    
    // Category filter (filter by product category in operation items)
    if (operationFilters.category !== 'all') {
      const operationProducts = op.items?.map(item => {
        const product = products.find(p => p.id === item.productId);
        return product?.category;
      }) || [];
      if (!operationProducts.includes(operationFilters.category)) {
        return false;
      }
    }
    
    return true;
  });

  // Sort operations
  const sortedOperations = filteredOperations.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedOperations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const recentOperations = sortedOperations.slice(startIndex, endIndex);

  const getStatusBadge = (status, type) => {
    const statusConfig = {
      done: { label: 'On-time', color: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', text: 'text-emerald-200' },
      ready: { label: 'Waiting', color: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/50', text: 'text-amber-200' },
      waiting: { label: 'Waiting', color: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/50', text: 'text-amber-200' },
      draft: { label: 'Draft', color: 'slate', bg: 'bg-slate-500/10', border: 'border-slate-500/50', text: 'text-slate-200' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full ${config.bg} ${config.border} border px-2 py-0.5 text-xs ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const isReceipt = type === 'receipt';
    return (
      <span className={`inline-flex items-center gap-1 rounded-full ${isReceipt ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-200' : 'bg-violet-500/10 border-violet-500/50 text-violet-200'} border px-2 py-0.5 text-xs`}>
        <span className={`h-1.5 w-1.5 rounded-full ${isReceipt ? 'bg-indigo-400' : 'bg-violet-400'}`}></span>
        {isReceipt ? 'Receipt' : 'Delivery'}
      </span>
    );
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const now = new Date();
    const then = new Date(dateString);
    if (isNaN(then.getTime())) return 'Invalid date';
    
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    // For older dates, show the actual date
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate processing time bars from recent receipts (last 5)
  const recentReceiptsForBars = receipts
    .filter(r => r.status === 'done')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const processingTimes = recentReceiptsForBars.length > 0
    ? recentReceiptsForBars.map((r, i) => {
        // Simulate processing time based on totalItems (more items = longer processing)
        const baseTime = r.totalItems || 1;
        return Math.min(12, Math.max(3, Math.round(baseTime / 10) + 3));
      })
    : [5, 7, 6, 8, 5]; // Default values if no data

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Row */}
        <div 
          className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50">
              Dashboard
            </h1>
            <p className="mt-1 text-base text-slate-400">
              Snapshot of receipt and delivery operations with live trends.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All systems normal</span>
            </div>
            <button
              onClick={() => navigate('/receipts')}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-3 py-1.5 text-sm font-medium tracking-tight text-white shadow-lg shadow-amber-500/40 hover:shadow-amber-500/60 transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-4 w-4 stroke-[1.5]" />
              <span>New operation</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Row */}
        <section 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          aria-label="Dashboard KPIs"
        >
          {/* Total Products */}
          <article
            className={`rounded-xl border border-white/10 bg-slate-950/80 p-4 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '50ms' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Total Products</p>
                <p className="text-2xl font-semibold text-slate-50">{totalProducts}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
          </article>

          {/* Low Stock Items */}
          <article
            className={`rounded-xl border border-white/10 bg-slate-950/80 p-4 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Low / Out of Stock</p>
                <p className="text-2xl font-semibold text-amber-400">{lowStockItems}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-amber-400" />
              </div>
            </div>
          </article>

          {/* Pending Receipts */}
          <article
            className={`rounded-xl border border-white/10 bg-slate-950/80 p-4 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Pending Receipts</p>
                <p className="text-2xl font-semibold text-indigo-400">{pendingReceipts}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Download className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
          </article>

          {/* Pending Deliveries */}
          <article
            className={`rounded-xl border border-white/10 bg-slate-950/80 p-4 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Pending Deliveries</p>
                <p className="text-2xl font-semibold text-violet-400">{pendingDeliveries}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-violet-400" />
              </div>
            </div>
          </article>

          {/* Scheduled Transfers */}
          <article
            className={`rounded-xl border border-white/10 bg-slate-950/80 p-4 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '250ms' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Scheduled Transfers</p>
                <p className="text-2xl font-semibold text-slate-400">{scheduledTransfers}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-slate-500/10 flex items-center justify-center">
                <ArrowLeftRight className="h-5 w-5 text-slate-400" />
              </div>
            </div>
          </article>
        </section>

        {/* Summary Cards Row: Receipt & Delivery */}
        <section 
          className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6"
          aria-label="Receipt and Delivery overview"
        >
          {/* Receipt Card */}
          <article
            className={`relative overflow-hidden rounded-2xl border border-indigo-500/70 bg-slate-950/80 px-4 py-4 sm:px-6 sm:py-5 shadow-[0_0_0_1px_rgba(99,102,241,0.3)] transition-all duration-700 hover:border-indigo-500/90 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.5)] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-indigo-100">
                  Receipt
                </h2>
                <p className="mt-1 text-base text-slate-300">
                  Incoming orders waiting to be received.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-200 border border-indigo-500/60">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Priority</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => navigate('/receipts')}
                className="inline-flex items-center justify-between gap-3 rounded-xl border border-indigo-500/80 bg-indigo-500/10 px-3 py-2 text-sm font-medium tracking-tight text-indigo-100 hover:bg-indigo-500/20 transition-all duration-300 hover:scale-105"
              >
                <span>{pendingReceipts} to receive</span>
                <ArrowRight className="h-4 w-4 stroke-[1.5]" />
              </button>

              <div className="text-right sm:text-left">
                <p className="text-sm text-indigo-100">
                  <span className="font-medium">{lateReceipts}</span>
                  <span className="ml-1 text-indigo-200/90">Late</span>
                </p>
                <p className="text-sm text-indigo-100 mt-0.5">
                  <span className="font-medium">{receipts.length}</span>
                  <span className="ml-1 text-indigo-200/90">operations</span>
                </p>
              </div>
            </div>

            {/* Mini trend bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Processing time (hrs)</span>
                <span>Last 24h</span>
              </div>
              <div className="mt-2 flex gap-1.5 items-end h-16">
                {processingTimes.map((height, i) => (
                  <div key={i} className="flex-1 rounded-full bg-indigo-500/20 overflow-hidden">
                    <div 
                      className="w-full rounded-full bg-indigo-400/80 transition-all duration-1000 ease-out"
                      style={{ 
                        height: `${(height / 12) * 100}%`,
                        animationDelay: `${i * 100}ms`
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Delivery Card */}
          <article
            className={`relative overflow-hidden rounded-2xl border border-violet-500/70 bg-slate-950/80 px-4 py-4 sm:px-6 sm:py-5 shadow-[0_0_0_1px_rgba(139,92,246,0.3)] transition-all duration-700 hover:border-violet-500/90 hover:shadow-[0_0_0_1px_rgba(139,92,246,0.5)] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-violet-100">
                  Delivery
                </h2>
                <p className="mt-1 text-base text-slate-300">
                  Outgoing shipments queued for dispatch.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200 border border-emerald-500/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>On track</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => navigate('/deliveries')}
                className="inline-flex items-center justify-between gap-3 rounded-xl border border-violet-500/80 bg-violet-500/10 px-3 py-2 text-sm font-medium tracking-tight text-violet-100 hover:bg-violet-500/20 transition-all duration-300 hover:scale-105"
              >
                <span>{pendingDeliveries} to deliver</span>
                <ArrowRight className="h-4 w-4 stroke-[1.5]" />
              </button>

              <div className="text-right sm:text-left">
                <p className="text-sm text-violet-100">
                  <span className="font-medium">{lateDeliveries}</span>
                  <span className="ml-1 text-violet-200/90">Late</span>
                </p>
                <p className="text-sm text-amber-200 mt-0.5">
                  <span className="font-medium">{deliveries.filter(d => d.status === 'waiting').length}</span>
                  <span className="ml-1">waiting</span>
                </p>
                <p className="text-sm text-violet-100 mt-0.5">
                  <span className="font-medium">{deliveries.length}</span>
                  <span className="ml-1 text-violet-200/90">operations</span>
                </p>
              </div>
            </div>

            {/* Mini stacked status chart */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Status distribution</span>
                <span>Today</span>
              </div>
              <div className="mt-2 flex w-full gap-1.5">
                <div 
                  className="h-3 rounded-full bg-emerald-400/80 transition-all duration-1000" 
                  style={{ 
                    flex: doneRatio || 0.5,
                    animationDelay: '300ms' 
                  }}
                ></div>
                <div 
                  className="h-3 rounded-full bg-amber-400/80 transition-all duration-1000" 
                  style={{ 
                    flex: waitingRatio || 0.3,
                    animationDelay: '400ms' 
                  }}
                ></div>
                <div 
                  className="h-3 rounded-full bg-rose-500/80 transition-all duration-1000" 
                  style={{ 
                    flex: draftRatio || 0.2,
                    animationDelay: '500ms' 
                  }}
                ></div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>On time</span>
                <span>Waiting</span>
                <span>Late</span>
              </div>
            </div>
          </article>
        </section>

        {/* Analytics Section: Charts & Graphs */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left: Combined line/area chart */}
          <div
            className={`lg:col-span-2 rounded-2xl border border-white/10 bg-slate-950/80 p-4 sm:p-5 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-50">
                  Operations volume
                </h2>
                <p className="mt-1 text-base text-slate-400">
                  Comparison of receipt vs delivery over the last 7 days.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                  <Calendar className="h-3.5 w-3.5 stroke-[1.5]" />
                  <span>Last 7 days</span>
                </div>
                <button className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:border-white/20 hover:text-slate-50 transition-colors">
                  <Settings2 className="h-3.5 w-3.5 stroke-[1.5]" />
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
              <div className="inline-flex items-center gap-2 text-slate-300">
                <span className="h-1 w-6 rounded-full bg-indigo-400"></span>
                <span>Receipt</span>
              </div>
              <div className="inline-flex items-center gap-2 text-slate-300">
                <span className="h-1 w-6 rounded-full bg-violet-400"></span>
                <span>Delivery</span>
              </div>
            </div>

            {/* Chart */}
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={operationsData}>
                  <defs>
                    <linearGradient id="colorReceipt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDelivery" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    angle={dateRange > 14 ? -45 : 0}
                    textAnchor={dateRange > 14 ? 'end' : 'middle'}
                    height={dateRange > 14 ? 60 : 30}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="receipt" 
                    stroke="#818cf8" 
                    fillOpacity={1} 
                    fill="url(#colorReceipt)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="delivery" 
                    stroke="#a78bfa" 
                    fillOpacity={1} 
                    fill="url(#colorDelivery)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: KPIs & donut chart */}
          <div
            className={`rounded-2xl border border-white/10 bg-slate-950/80 p-4 sm:p-5 flex flex-col transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <div className="flex items-start justify-between gap-3">
      <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-50">
                  SLA & status
                </h2>
                <p className="mt-1 text-base text-slate-400">
                  Overview of on-time vs late operations.
                </p>
              </div>
              <button className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:border-white/20 hover:text-slate-50 transition-colors">
                <BarChart3 className="h-3.5 w-3.5 stroke-[1.5]" />
              </button>
      </div>

            {/* Ring chart */}
            <div className="mt-4 flex flex-1 items-center gap-4">
              <div className="relative h-32 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={slaData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {slaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-slate-400">On-time</span>
                  <span className="mt-0.5 text-xl font-semibold tracking-tight text-emerald-300">
                    {onTimePercentage}%
                  </span>
              </div>
      </div>

              <div className="flex-1 space-y-3">
                {slaData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span 
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></span>
                      <span className="text-slate-200">{item.name}</span>
                    </div>
                    <span className="text-slate-300 font-medium">{item.value}</span>
                  </div>
                ))}

                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-slate-400">
                    {lateOps > 0 ? (
                      <>
                        You have
                        <span className="text-rose-300 font-medium mx-1">{lateOps}</span>
                        {lateOps === 1 ? 'operation' : 'operations'} requiring attention.
                      </>
                    ) : (
                      <>All operations are on track.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom: Table + Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Recent operations table */}
          <div
            className={`lg:col-span-2 rounded-2xl border border-white/10 bg-slate-950/80 p-4 sm:p-5 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-slate-50">
                  Recent operations
                </h2>
                <p className="mt-1 text-base text-slate-400">
                  Latest receipt and delivery movements. {filteredOperations.length} operations
                </p>
              </div>
              <div className="relative flex-shrink-0" ref={operationFilterRef}>
                <button 
                  onClick={() => setOperationFilterOpen(!operationFilterOpen)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200 hover:border-white/20 transition-colors whitespace-nowrap"
                >
                  <Filter className="h-3.5 w-3.5 stroke-[1.5]" />
                  <span>Filter</span>
                  {(operationFilters.type !== 'all' || operationFilters.status !== 'all' || operationFilters.dateRange !== 'all' || operationFilters.warehouse !== 'all' || operationFilters.category !== 'all') && (
                    <span className="ml-1 h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                  )}
                  <ChevronDown className={`h-3 w-3 transition-transform ${operationFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {operationFilterOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-white/10 bg-slate-900 shadow-xl z-50">
                    <div className="p-3 space-y-3">
                      {/* Document Type Filter */}
                      <div>
                        <label className="text-xs font-medium text-slate-400 mb-1.5 block">Document Type</label>
                        <div className="grid grid-cols-3 gap-1">
                          {['all', 'receipt', 'delivery', 'internal', 'adjustment'].map(type => (
                            <button
                              key={type}
                              onClick={() => setOperationFilters({ ...operationFilters, type })}
                              className={`px-2 py-1.5 rounded-md text-xs transition-colors ${
                                operationFilters.type === type
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                                  : 'text-slate-300 hover:bg-white/5 border border-transparent'
                              }`}
                            >
                              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Status Filter */}
                      <div>
                        <label className="text-xs font-medium text-slate-400 mb-1.5 block">Status</label>
                        <div className="grid grid-cols-3 gap-1">
                          {['all', 'draft', 'waiting', 'ready', 'done', 'canceled'].map(status => (
                            <button
                              key={status}
                              onClick={() => setOperationFilters({ ...operationFilters, status })}
                              className={`px-2 py-1.5 rounded-md text-xs transition-colors ${
                                operationFilters.status === status
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                                  : 'text-slate-300 hover:bg-white/5 border border-transparent'
                              }`}
                            >
                              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Product Category Filter */}
                      {productCategories.length > 0 && (
                        <div>
                          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Product Category</label>
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              onClick={() => setOperationFilters({ ...operationFilters, category: 'all' })}
                              className={`px-2 py-1.5 rounded-md text-xs transition-colors text-left ${
                                operationFilters.category === 'all'
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                                  : 'text-slate-300 hover:bg-white/5 border border-transparent'
                              }`}
                            >
                              All
                            </button>
                            {productCategories.slice(0, 5).map(category => (
                              <button
                                key={category}
                                onClick={() => setOperationFilters({ ...operationFilters, category })}
                                className={`px-2 py-1.5 rounded-md text-xs transition-colors text-left truncate ${
                                  operationFilters.category === category
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                                    : 'text-slate-300 hover:bg-white/5 border border-transparent'
                                }`}
                              >
                                {category}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Date Range Filter */}
                      <div>
                        <label className="text-xs font-medium text-slate-400 mb-1.5 block">Date Range</label>
                        <div className="grid grid-cols-2 gap-1">
                          {['all', 'today', 'week', 'month'].map(range => (
                            <button
                              key={range}
                              onClick={() => setOperationFilters({ ...operationFilters, dateRange: range })}
                              className={`px-2 py-1.5 rounded-md text-xs transition-colors ${
                                operationFilters.dateRange === range
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                                  : 'text-slate-300 hover:bg-white/5 border border-transparent'
                              }`}
                            >
                              {range === 'all' ? 'All Time' : range === 'today' ? 'Today' : range === 'week' ? '7 Days' : '30 Days'}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Clear Filters */}
                      <button
                        onClick={() => {
                          setOperationFilters({ type: 'all', status: 'all', dateRange: 'all', warehouse: 'all', category: 'all' });
                          setOperationFilterOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-md text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors border border-rose-500/20"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-slate-950/80">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left font-medium text-slate-400">
                      ID
                    </th>
                    <th scope="col" className="px-3 py-2 text-left font-medium text-slate-400">
                      Type
                    </th>
                    <th scope="col" className="px-3 py-2 text-left font-medium text-slate-400">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-2 text-left font-medium text-slate-400">
                      Items
                    </th>
                    <th scope="col" className="px-3 py-2 text-left font-medium text-slate-400">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-slate-950/60 min-h-[400px]">
                  {recentOperations.length > 0 ? (
                    <>
                      {recentOperations.map((op, index) => (
                        <tr 
                          key={op.id} 
                          className="hover:bg-white/5 transition-colors duration-200"
                          style={{ animationDelay: `${600 + index * 50}ms` }}
                        >
                          <td className="px-3 py-2 text-slate-200">{op.id}</td>
                          <td className="px-3 py-2">{getTypeBadge(op.type)}</td>
                          <td className="px-3 py-2">{getStatusBadge(op.status, op.type)}</td>
                          <td className="px-3 py-2 text-slate-200">{op.totalItems || 0}</td>
                          <td className="px-3 py-2 text-slate-400">{formatTimeAgo(op.date)}</td>
                        </tr>
                      ))}
                      {/* Fill remaining rows to maintain consistent height */}
                      {recentOperations.length < itemsPerPage && Array.from({ length: itemsPerPage - recentOperations.length }).map((_, index) => (
                        <tr key={`empty-${index}`} className="h-[40px]">
                          <td colSpan="5" className="px-3 py-2"></td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-3 h-[400px] align-middle">
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/50 mb-2">
                            <Filter className="h-5 w-5 text-slate-500" />
                          </div>
                          <p className="text-sm font-medium text-slate-300 mb-1">No operations found</p>
                          <p className="text-xs text-slate-500">
                            {sortedOperations.length === 0 
                              ? 'Create a receipt or delivery to get started.'
                              : 'Try adjusting your filters to see more results.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, sortedOperations.length)} of {sortedOperations.length} operations
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:border-white/20 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Previous</span>
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-[2rem] rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                            currentPage === pageNum
                              ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:border-white/20 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Activity and alerts */}
          <div
            className={`rounded-2xl border border-white/10 bg-slate-950/80 p-4 sm:p-5 flex flex-col transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-50">
                  Activity & alerts
                </h2>
                <p className="mt-1 text-base text-slate-400">
                  Recent changes affecting receipt and delivery.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_0_4px_rgba(239,68,68,0.35)]"></div>
                <div className="flex-1">
                  <p className="text-slate-200">
                    Two delivery operations exceeded their SLA threshold.
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">5 min ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.35)]"></div>
                <div className="flex-1">
                  <p className="text-slate-200">
                    Receipt dock 2 capacity reached 90%.
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">12 min ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.35)]"></div>
                <div className="flex-1">
                  <p className="text-slate-200">
                    14 deliveries dispatched successfully in the last hour.
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">37 min ago</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <button className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:border-white/20 hover:bg-white/10 transition-colors">
                <Bell className="h-4 w-4 stroke-[1.5]" />
                <span>View full alert history</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
