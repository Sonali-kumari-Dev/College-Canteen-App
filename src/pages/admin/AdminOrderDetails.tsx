import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShoppingBag,
  User,
  Mail,
  Phone,
  Banknote,
  AlertCircle,
  CheckCircle,
  Star,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Order, Feedback, OrderStatus, formatCurrency } from '../../types.js';
import { apiRequest } from '../../api/client.js';
import { BackButton } from '../../components/BackButton.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { LoadingSpinner } from '../../components/LoadingSpinner.js';

export const AdminOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiRequest<{ order: Order; feedback: Feedback | null }>(`/orders/${id}`);
      setOrder(res.order);
      setFeedback(res.feedback || null);
    } catch (err: any) {
      setError(err.message || 'Unable to load order details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    try {
      setIsUpdatingStatus(true);
      setStatusMessage(null);
      const res = await apiRequest<{ message: string; order: Order }>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setOrder(res.order);
      setStatusMessage(`Order status updated to ${newStatus}`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update order status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading order details..." size="lg" />;
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <BackButton to="/admin/orders" label="Back to Orders" className="mb-6" />
        <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <p className="text-slate-800 font-bold">{error || 'Order not found.'}</p>
        </div>
      </div>
    );
  }

  const validStatuses: OrderStatus[] = [
    'PLACED',
    'ACCEPTED',
    'PREPARING',
    'READY',
    'COMPLETED',
    'CANCELLED',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Prominent Back to Orders button */}
      <div className="mb-6 flex items-center justify-between">
        <BackButton to="/admin/orders" label="Back to Orders" />
        <button
          type="button"
          onClick={fetchOrder}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {statusMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden mb-6">
        <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Admin Order View
            </span>
            <h1 className="text-2xl sm:text-3xl font-mono font-bold tracking-tight mt-0.5">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <StatusBadge status={order.status} size="lg" />
            <span className="text-xs text-slate-300">
              Payment: <strong>Cash at Counter</strong>
            </span>
          </div>
        </div>

        {/* Status transition controls */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Change Order Status
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {validStatuses.map((st) => (
              <button
                key={st}
                type="button"
                disabled={isUpdatingStatus || order.status === st}
                onClick={() => handleUpdateStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  order.status === st
                    ? 'bg-slate-900 text-white shadow-xs cursor-default ring-2 ring-slate-900'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Information */}
        <div className="p-6 sm:p-8 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <User className="w-3.5 h-3.5 text-amber-600" />
              Customer Name
            </div>
            <p className="text-sm font-bold text-slate-800">{order.customerName}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              Email
            </div>
            <p className="text-sm font-bold text-slate-800 truncate">{order.customerEmail}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              Phone Number
            </div>
            <p className="text-sm font-bold text-slate-800">
              {order.customerPhone || 'Not provided'}
            </p>
          </div>
        </div>

        {/* Items List */}
        <div className="p-6 sm:p-8">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Ordered Items</h2>
          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-bold text-slate-800">{item.foodName}</p>
                  <p className="text-xs text-slate-400">
                    {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <span className="font-bold text-slate-900">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-between">
            <span className="text-base font-bold text-slate-900">Total Order Amount</span>
            <span className="text-2xl font-bold text-amber-700">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Feedback if provided */}
      {feedback && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Customer Review & Feedback
          </h2>
          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl">
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= feedback.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-xs font-bold text-slate-700">
                {feedback.rating} / 5 Stars
              </span>
            </div>
            <p className="text-sm text-slate-700 italic">"{feedback.comment}"</p>
            <p className="text-[11px] text-slate-400 mt-2">
              Submitted by {feedback.userName} on{' '}
              {new Date(feedback.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
