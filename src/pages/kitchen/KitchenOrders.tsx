import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChefHat,
  RefreshCw,
  Clock,
  ArrowRight,
  Check,
  Flame,
  Bell,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Order, OrderStatus, formatCurrency } from '../../types.js';
import { apiRequest } from '../../api/client.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { LoadingSpinner } from '../../components/LoadingSpinner.js';
import { EmptyState } from '../../components/EmptyState.js';

export const KitchenOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PLACED' | 'PREPARING' | 'READY' | 'COMPLETED'>('ACTIVE');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();

    // Auto-refresh kitchen board every 15 seconds
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setError(null);
      const res = await apiRequest<{ orders: Order[] }>('/orders');
      setOrders(res.orders || []);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to kitchen service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await apiRequest<{ message: string; order: Order }>(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.order : o))
      );
      setActionSuccess(`Order updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(null), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ACTIVE') {
      return ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status);
    }
    if (activeTab === 'PLACED') {
      return o.status === 'PLACED' || o.status === 'ACCEPTED';
    }
    if (activeTab === 'PREPARING') {
      return o.status === 'PREPARING';
    }
    if (activeTab === 'READY') {
      return o.status === 'READY';
    }
    if (activeTab === 'COMPLETED') {
      return o.status === 'COMPLETED';
    }
    return true;
  });

  if (isLoading && orders.length === 0) {
    return <LoadingSpinner message="Connecting to live Kitchen Queue..." size="lg" />;
  }

  const newOrdersCount = orders.filter((o) => o.status === 'PLACED').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <ChefHat className="w-8 h-8 text-amber-600" />
            Kitchen Order Display Board
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time incoming orders and kitchen prep workflow
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Queue
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ACTIVE'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Active ({newOrdersCount + preparingCount + readyCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PLACED')}
          className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PLACED'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          New Incoming ({newOrdersCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PREPARING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PREPARING'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          In Prep ({preparingCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('READY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'READY'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Ready for Counter ({readyCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'COMPLETED'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="Kitchen Queue Clear"
          description="No orders waiting in this section. New incoming orders from students will appear automatically."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className={`bg-white rounded-3xl border shadow-xs overflow-hidden flex flex-col justify-between transition-all ${
                order.status === 'PLACED'
                  ? 'border-blue-300 ring-2 ring-blue-100'
                  : order.status === 'PREPARING'
                  ? 'border-amber-300 ring-2 ring-amber-100'
                  : order.status === 'READY'
                  ? 'border-emerald-300 ring-2 ring-emerald-100'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header */}
                <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-lg text-slate-900">
                      {order.orderNumber}
                    </span>
                    <p className="text-xs text-slate-500 font-medium">
                      Student: {order.customerName}
                    </p>
                  </div>
                  <StatusBadge status={order.status} size="sm" />
                </div>

                {/* Items List for Kitchen */}
                <div className="p-5 space-y-3">
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <span className="text-sm font-bold text-slate-900">
                          {item.foodName}
                        </span>
                        <span className="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold text-sm flex items-center justify-center">
                          ×{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="font-bold text-slate-800">
                      Total: {formatCurrency(order.totalAmount)} (Cash)
                    </span>
                  </div>
                </div>
              </div>

              {/* Kitchen Action Buttons */}
              <div className="p-5 pt-0 mt-2 flex flex-col gap-2">
                {order.status === 'PLACED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order._id, 'ACCEPTED')}
                    className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Accept Order
                  </button>
                )}

                {order.status === 'ACCEPTED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order._id, 'PREPARING')}
                    className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Flame className="w-4 h-4" />
                    Start Preparing
                  </button>
                )}

                {order.status === 'PREPARING' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order._id, 'READY')}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    Mark Ready for Pickup
                  </button>
                )}

                {order.status === 'READY' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order._id, 'COMPLETED')}
                    className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete (Handed to Student)
                  </button>
                )}

                <Link
                  to={`/kitchen/orders/${order._id}`}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  View Full Order Ticket →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
