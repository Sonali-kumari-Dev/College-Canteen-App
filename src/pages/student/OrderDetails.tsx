import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Star,
  Banknote,
  Send,
  Loader2,
  Calendar,
  XCircle,
} from 'lucide-react';
import { Order, Feedback, OrderStatus, formatCurrency } from '../../types.js';
import { apiRequest } from '../../api/client.js';
import { BackButton } from '../../components/BackButton.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { LoadingSpinner } from '../../components/LoadingSpinner.js';

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [order, setOrder] = useState<Order | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Feedback form states
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Cancel order state
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const justPlaced = (location.state as any)?.orderPlaced;

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
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

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setIsCancelling(true);
      setCancelError(null);
      const res = await apiRequest<{ message: string; order: Order }>(`/orders/${id}/cancel`, {
        method: 'POST',
      });
      setOrder(res.order);
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setFeedbackError('Please enter a short comment.');
      return;
    }

    try {
      setIsSubmittingFeedback(true);
      setFeedbackError(null);
      const res = await apiRequest<{ message: string; feedback: Feedback }>('/feedback', {
        method: 'POST',
        body: JSON.stringify({
          orderId: id,
          rating,
          comment: comment.trim(),
        }),
      });

      setFeedback(res.feedback);
      setFeedbackSuccess('Thank you for rating your canteen meal!');
    } catch (err: any) {
      setFeedbackError(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading order details..." size="lg" />;
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <BackButton to="/orders" label="Back to Order History" className="mb-6" />
        <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <p className="text-slate-800 font-bold">{error || 'Order not found.'}</p>
        </div>
      </div>
    );
  }

  const steps: { status: OrderStatus; label: string }[] = [
    { status: 'PLACED', label: 'Placed' },
    { status: 'ACCEPTED', label: 'Accepted' },
    { status: 'PREPARING', label: 'Preparing' },
    { status: 'READY', label: 'Ready for Pickup' },
    { status: 'COMPLETED', label: 'Completed' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.status === order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Prominent Back to Order History button */}
      <div className="mb-6 flex items-center justify-between">
        <BackButton to="/orders" label="Back to Order History" />
        <button
          type="button"
          onClick={fetchOrderDetails}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Status
        </button>
      </div>

      {justPlaced && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-900 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Your order has been placed successfully!</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              The kitchen received your order ticket #{order.orderNumber}. Pay cash when collecting from the counter.
            </p>
          </div>
        </div>
      )}

      {cancelError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{cancelError}</span>
        </div>
      )}

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden mb-8">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Order Ticket
            </span>
            <h1 className="text-2xl sm:text-3xl font-mono font-bold tracking-tight mt-0.5">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(order.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <StatusBadge status={order.status} size="lg" />
            <span className="text-xs text-slate-300">
              Payment: <strong>Cash at Counter</strong>
            </span>
          </div>
        </div>

        {/* Live Stepper Tracker (if not cancelled) */}
        {order.status !== 'CANCELLED' ? (
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/60">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Live Preparation Timeline
            </h2>
            <div className="relative">
              <div className="grid grid-cols-5 gap-2 text-center">
                {steps.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={step.status} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                          isCurrent
                            ? 'bg-amber-600 text-white ring-4 ring-amber-100 shadow-xs'
                            : isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-[11px] leading-tight font-semibold ${
                          isCurrent
                            ? 'text-amber-800'
                            : isDone
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-rose-50 border-b border-rose-100 flex items-center gap-3 text-rose-800 text-xs font-semibold">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>This order was cancelled and will not be prepared by the kitchen.</span>
          </div>
        )}

        {/* Itemized Table */}
        <div className="p-6 sm:p-8">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Order Items</h2>
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

          {/* Pricing summary */}
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Payment Method</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-600" />
                Cash at Counter
              </span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-lg font-bold text-slate-900">
              <span>Total Payable</span>
              <span className="text-2xl text-amber-700">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Cancel Order Action if eligible */}
          {order.status === 'PLACED' && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-700">Need to cancel?</p>
                <p className="text-[11px] text-slate-400">
                  You can cancel your order while it is still waiting for kitchen acceptance.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          Meal Feedback & Experience
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Rate your food and service to help the canteen team improve quality.
        </p>

        {feedbackSuccess && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{feedbackSuccess}</span>
          </div>
        )}

        {feedbackError && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{feedbackError}</span>
          </div>
        )}

        {feedback ? (
          <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= feedback.rating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">
                {feedback.rating} out of 5 stars
              </span>
            </div>
            <p className="text-sm text-slate-700 italic">"{feedback.comment}"</p>
            <p className="text-[11px] text-slate-400 mt-2">
              Submitted on {new Date(feedback.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-bold text-slate-700">{rating} / 5</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Your Comments
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the taste, freshness, and packaging?"
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingFeedback}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isSubmittingFeedback ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
