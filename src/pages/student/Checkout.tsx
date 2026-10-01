import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Phone,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { apiRequest } from '../../api/client.js';
import { Order, formatCurrency } from '../../types.js';
import { BackButton } from '../../components/BackButton.js';

export const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);

      const orderPayload = {
        customerPhone: phone.trim() || undefined,
        items: items.map((i) => ({
          foodId: i.food._id,
          quantity: i.quantity,
        })),
      };

      const res = await apiRequest<{ message: string; order: Order }>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });

      if (res && res.order) {
        clearCart();
        navigate(`/orders/${res.order._id}`, {
          state: { orderPlaced: true },
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Prominent Back to Cart button */}
      <div className="mb-6 flex items-center justify-between">
        <BackButton to="/cart" label="Back to Cart" />
        <span className="text-xs text-slate-500 font-medium">Step 2 of 2: Checkout</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-6 flex items-center gap-2.5">
        <ShoppingBag className="w-6 h-6 text-amber-600" />
        Checkout & Confirmation
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Details & Payment method */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" />
              Customer Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{user?.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{user?.email}</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone Number <span className="text-slate-400 font-normal">(Optional for SMS alerts)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-600" />
              Payment Method
            </h2>

            <div className="p-4 rounded-xl border-2 border-amber-600 bg-amber-50/50 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Banknote className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-base">Cash at Counter</span>
                  <span className="text-xs font-bold text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                    Selected
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  No online payment gateway required. You will receive an official order number to present at the canteen counter, and pay directly when picking up your food.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Review & Final Action */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 sticky top-20">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Review Items ({items.length})
            </h2>

            {/* List items briefly */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.food._id} className="flex items-center justify-between text-xs">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-bold text-slate-800 truncate">{item.food.name}</p>
                    <p className="text-slate-400">
                      {item.quantity} × {formatCurrency(item.food.price)}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    {formatCurrency(item.food.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatCurrency(total)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Payment Mode</span>
                <span className="font-medium text-slate-700">Cash at Counter</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-base font-bold text-slate-900">
                <span>Total Due</span>
                <span className="text-xl text-amber-700">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <span>Confirm & Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400">
              By confirming, your order ticket will be dispatched to the kitchen queue.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
