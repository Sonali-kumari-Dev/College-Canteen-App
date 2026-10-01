import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Order, OrderStatus, formatCurrency } from '../../types.js';
import { apiRequest } from '../../api/client.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { LoadingSpinner } from '../../components/LoadingSpinner.js';
import { EmptyState } from '../../components/EmptyState.js';

export const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiRequest<{ orders: Order[] }>('/orders');
      setOrders(res.orders || []);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'ACTIVE') {
      return ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(order.status);
    }
    if (filter === 'COMPLETED') {
      return order.status === 'COMPLETED';
    }
    if (filter === 'CANCELLED') {
      return order.status === 'CANCELLED';
    }
    return true;
  });

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Fetching your order history..." size="lg" />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-amber-600" />
            My Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track live kitchen status and view your past orders
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Status
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchOrders} className="ml-auto underline font-medium cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {(['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filter === tab
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab === 'ALL' && `All Orders (${orders.length})`}
            {tab === 'ACTIVE' &&
              `Active (${orders.filter((o) => ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)).length})`}
            {tab === 'COMPLETED' &&
              `Completed (${orders.filter((o) => o.status === 'COMPLETED').length})`}
            {tab === 'CANCELLED' &&
              `Cancelled (${orders.filter((o) => o.status === 'CANCELLED').length})`}
          </button>
        ))}
      </div>

      {/* Orders List or Empty State */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No Orders Found"
          description={
            filter === 'ALL'
              ? 'You have not placed any orders yet. Head to the menu to order tasty meals!'
              : `No orders matching filter "${filter}".`
          }
          action={
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
            >
              Browse Menu
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-slate-900 text-white font-mono font-bold text-sm rounded-lg shadow-2xs">
                    {order.orderNumber}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-slate-600 line-clamp-1">
                  <strong className="text-slate-800 font-semibold">Items: </strong>
                  {order.items.map((i) => `${i.quantity}x ${i.foodName}`).join(', ')}
                </p>

                <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 group-hover:text-amber-800 transition-colors shrink-0">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
