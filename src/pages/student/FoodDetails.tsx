import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Utensils,
  Plus,
  Minus,
  ShoppingCart,
  Check,
  AlertCircle,
  Tag,
  Clock,
} from 'lucide-react';
import { Food, formatCurrency } from '../../types.js';
import { apiRequest } from '../../api/client.js';
import { useCart } from '../../context/CartContext.js';
import { BackButton } from '../../components/BackButton.js';
import { LoadingSpinner } from '../../components/LoadingSpinner.js';

export const FoodDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, items: cartItems } = useCart();

  const [food, setFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await apiRequest<{ food: Food }>(`/food/${id}`);
        setFood(res.food);
      } catch (err: any) {
        setError(err.message || 'Food item not found.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchFood();
    }
  }, [id]);

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (!food || !food.isAvailable) return;
    addToCart(food, quantity);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading food details..." size="lg" />;
  }

  if (error || !food) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <BackButton to="/menu" label="Back to Menu" className="mb-6" />
        <div className="p-8 bg-white rounded-2xl border border-slate-200">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Item Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'This food item does not exist.'}</p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700"
          >
            ← Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  const existingInCart = cartItems.find((ci) => ci.food._id === food._id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Prominent Back to Menu button */}
      <div className="mb-6 flex items-center justify-between">
        <BackButton to="/menu" label="Back to Menu" />
        <Link
          to="/cart"
          className="text-xs font-semibold text-slate-600 hover:text-amber-600 flex items-center gap-1.5"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>View Cart ({cartItems.reduce((acc, c) => acc + c.quantity, 0)})</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Food Visual Section */}
        <div className="relative min-h-[280px] md:min-h-[400px] bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-6">
          {food.imageUrl ? (
            <img
              src={food.imageUrl}
              alt={food.name}
              className="w-full h-full object-cover absolute inset-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-amber-700/60 p-6 text-center">
              <Utensils className="w-20 h-20 mb-3 opacity-40" />
              <p className="text-sm font-semibold text-amber-900/70">Freshly Made at Canteen</p>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-xl text-xs font-semibold text-slate-700 shadow-xs border border-slate-100">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              {food.categoryName || 'General'}
            </span>
          </div>

          <div className="absolute top-4 right-4 z-10">
            {food.isAvailable ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-xs">
                Available
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-500 text-white shadow-xs">
                Unavailable
              </span>
            )}
          </div>
        </div>

        {/* Food Info & Add to Cart Section */}
        <div className="p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {food.name}
              </h1>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {formatCurrency(food.price)}
                </span>
                <span className="text-xs text-slate-400">per plate/serving</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Description
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {food.description || 'Prepared fresh daily with authentic ingredients at the college canteen.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-6 flex items-center gap-2.5 text-xs text-slate-600">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Payment mode: <strong>Cash at Counter</strong> upon pickup.</span>
            </div>

            {existingInCart && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-800 flex items-center justify-between">
                <span>You currently have {existingInCart.quantity} in your cart.</span>
                <Link to="/cart" className="underline font-bold hover:text-amber-900">
                  Go to Cart
                </Link>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-slate-100">
            {food.isAvailable ? (
              <div className="space-y-4">
                {/* Quantity selector */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Quantity</span>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden">
                    <button
                      type="button"
                      onClick={handleDecrease}
                      disabled={quantity <= 1}
                      className="p-2.5 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-slate-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrease}
                      className="p-2.5 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                  }`}
                >
                  {isSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      Added {quantity} to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart • {formatCurrency(food.price * quantity)}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-center">
                <p className="text-sm font-semibold text-slate-600">
                  This item is currently unavailable.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Please select another item from the menu.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
