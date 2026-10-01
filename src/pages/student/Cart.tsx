import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Utensils,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { formatCurrency } from '../../types.js';
import { BackButton } from '../../components/BackButton.js';
import { EmptyState } from '../../components/EmptyState.js';

export const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, total, itemCount } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <BackButton to="/menu" label="Back to Menu" />
        </div>
        <EmptyState
          icon={ShoppingCart}
          title="Your Cart is Empty"
          description="You haven't added any delicious food items to your cart yet."
          action={
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
            >
              <Utensils className="w-4 h-4" />
              Browse Canteen Menu
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Prominent Back to Menu button */}
      <div className="mb-6 flex items-center justify-between">
        <BackButton to="/menu" label="Back to Menu" />
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
        >
          Clear Entire Cart
        </button>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-6 flex items-center gap-2.5">
        <ShoppingCart className="w-6 h-6 text-amber-600" />
        Your Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const itemSubtotal = item.food.price * item.quantity;
            return (
              <div
                key={item.food._id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 transition-all"
              >
                {/* Food Image */}
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-amber-50 overflow-hidden shrink-0 flex items-center justify-center border border-slate-100">
                  {item.food.imageUrl ? (
                    <img
                      src={item.food.imageUrl}
                      alt={item.food.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Utensils className="w-8 h-8 text-amber-600/60" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {item.food.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Unit Price: {formatCurrency(item.food.price)}
                  </p>
                  <p className="text-sm font-bold text-amber-700 mt-1">
                    {formatCurrency(itemSubtotal)}
                  </p>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.food._id, item.quantity - 1)}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-l-lg transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.food._id, item.quantity + 1)}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-r-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.food._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 sticky top-20">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Canteen Service Fee</span>
                <span className="text-emerald-700 font-medium">Free (₹0)</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-base font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-xl text-amber-700">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pay with <strong>Cash at Counter</strong> when collecting.</span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
