import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ChefHat,
  User,
  Clock,
  Check,
  Flame,
  Bell,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Order, OrderStatus, formatCurrency } from '../../types.js';
import { apiRequest } from '../../api/client.js';
import { BackButton } from '../../components/BackButton.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { LoadingSpinner } from '../../components/LoadingSpinner.js';

export const KitchenOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiRequest<{ order: Order }>(`/orders/${id}`);
      setOrder(res.order);
    } catch (err: any) {
      setError(err.message || 'Unable to load kitchen order.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    try {
      setIsUpdating(true);
      const res = await apiRequest<{ message: string; order: Order }>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setOrder(res.order);
      setSuccessNotice(`Order status changed to ${newStatus}`);
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading kitchen ticket..." size="lg" />;
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <BackButton to="/kitchen" label="Back to Kitchen Orders" className="mb-6" />
        <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <p className="text-slate-800 font-bold">{error || 'Order not found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Prominent Back to Kitchen Orders button */}
      <div className="mb-6 flex items-center justify-between">
        <BackButton to="/kitchen" label="Back to Kitchen Orders" />
        <button
          type="button"
          onClick={fetchOrder}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {successNotice && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Main Kitchen Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Ticket Header */}
        <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Kitchen Preparation Ticket
            </span>
            <h1 className="text-3xl font-mono font-bold tracking-tight mt-0.5">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Placed at{' '}
              {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <StatusBadge status={order.status} size="lg" />
            <span className="text-xs text-slate-300">
              Customer: <strong>{order.customerName}</strong>
            </span>
          </div>
        </div>

        {/* Big Prep List */}
        <div className="p-6 sm:p-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Items to Cook & Prepare
          </h2>

          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between"
              >
                <div>
                  <p className="text-lg font-bold text-slate-900">{item.foodName}</p>
                  <p className="text-xs text-slate-500">Unit: {formatCurrency(item.price)}</p>
                </div>
                <div className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xl font-extrabold shadow-xs">
                  ×{item.quantity}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Payment Collection: <strong>Cash at Counter</strong></span>
            <span className="text-sm font-bold text-slate-900">
              Total Amount: {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Transition Buttons */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Kitchen Action Workflow
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              type="button"
              disabled={isUpdating || order.status !== 'PLACED'}
              onClick={() => handleUpdateStatus('ACCEPTED')}
              className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                order.status === 'ACCEPTED'
                  ? 'bg-indigo-700 text-white ring-2 ring-indigo-400'
                  : order.status === 'PLACED'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              1. Accept
            </button>

            <button
              type="button"
              disabled={isUpdating || !['ACCEPTED', 'PLACED'].includes(order.status)}
              onClick={() => handleUpdateStatus('PREPARING')}
              className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                order.status === 'PREPARING'
                  ? 'bg-amber-700 text-white ring-2 ring-amber-400'
                  : order.status === 'ACCEPTED'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Flame className="w-4 h-4" />
              2. Preparing
            </button>

            <button
              type="button"
              disabled={isUpdating || !['PREPARING', 'ACCEPTED'].includes(order.status)}
              onClick={() => handleUpdateStatus('READY')}
              className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                order.status === 'READY'
                  ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                  : order.status === 'PREPARING'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Bell className="w-4 h-4" />
              3. Ready for Counter
            </button>

            <button
              type="button"
              disabled={isUpdating || order.status !== 'READY'}
              onClick={() => handleUpdateStatus('COMPLETED')}
              className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                order.status === 'COMPLETED'
                  ? 'bg-slate-800 text-white'
                  : order.status === 'READY'
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              4. Complete Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
