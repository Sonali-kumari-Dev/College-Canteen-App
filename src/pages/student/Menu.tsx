import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Plus,
  Check,
  Utensils,
  AlertCircle,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { Food, Category, formatCurrency } from '../../types.js';
import { apiRequest } from '../../api/client.js';
import { useCart } from '../../context/CartContext.js';
import { LoadingSpinner } from '../../components/LoadingSpinner.js';
import { EmptyState } from '../../components/EmptyState.js';

export const Menu: React.FC = () => {
  const { addToCart, items: cartItems } = useCart();

  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [foodRes, catRes] = await Promise.all([
        apiRequest<{ foods: Food[] }>('/food'),
        apiRequest<{ categories: Category[] }>('/categories'),
      ]);

      setFoods(foodRes.foods || []);
      setCategories(catRes.categories || []);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, food: Food) => {
    e.preventDefault();
    e.stopPropagation();
    if (!food.isAvailable) return;

    addToCart(food, 1);
    setAddedItemIds((prev) => ({ ...prev, [food._id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [food._id]: false }));
    }, 1200);
  };

  const filteredFoods = foods.filter((food) => {
    const matchesCategory =
      selectedCategory === 'all' || food.categoryId === selectedCategory;
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.description && food.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading fresh canteen menu..." size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Canteen Menu
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Order fresh meals and snacks directly from the counter
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search food by name..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-xs"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
          <button
            onClick={fetchData}
            className="ml-auto underline font-medium cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Dynamic Categories Filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Items ({foods.length})
          </button>
          {categories.map((cat) => {
            const count = foods.filter((f) => f.categoryId === cat._id).length;
            return (
              <button
                key={cat._id}
                type="button"
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat._id
                    ? 'bg-amber-600 text-white shadow-xs font-semibold'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Food Grid or Empty State */}
      {filteredFoods.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title={searchQuery ? 'No matching food found' : 'No food items available'}
          description={
            searchQuery
              ? 'Try adjusting your search terms or filter criteria.'
              : 'The canteen admin has not added any food items yet. Please check back shortly.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFoods.map((food) => {
            const isAdded = addedItemIds[food._id];
            const inCart = cartItems.find((ci) => ci.food._id === food._id);

            return (
              <Link
                key={food._id}
                to={`/food/${food._id}`}
                className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Food Image / Placeholder */}
                  <div className="relative h-44 w-full bg-gradient-to-br from-amber-50 to-orange-100 overflow-hidden">
                    {food.imageUrl ? (
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-amber-700/60 p-4 text-center">
                        <Utensils className="w-10 h-10 mb-2 opacity-50" />
                        <span className="text-xs font-medium text-amber-800/80">Fresh Canteen Food</span>
                      </div>
                    )}

                    {/* Category pill */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 shadow-xs flex items-center gap-1 border border-slate-100">
                      <Tag className="w-3 h-3 text-amber-600" />
                      <span>{food.categoryName || 'General'}</span>
                    </div>

                    {/* Availability badge */}
                    <div className="absolute top-3 right-3">
                      {food.isAvailable ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/90 text-white backdrop-blur-xs shadow-xs">
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/90 text-white backdrop-blur-xs shadow-xs">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Food Details */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                      {food.name}
                    </h3>
                    {food.description && (
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        {food.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer with Price and Action */}
                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 mt-auto">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Price</span>
                    <span className="text-lg font-bold text-slate-900">
                      {formatCurrency(food.price)}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={!food.isAvailable}
                    onClick={(e) => handleAddToCart(e, food)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      !food.isAvailable
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : isAdded
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : inCart
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        {inCart ? `In Cart (${inCart.quantity})` : 'Add to Cart'}
                      </>
                    )}
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Floating Cart bar on bottom for mobile/tablets if items in cart */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-30">
          <Link
            to="/cart"
            className="flex items-center justify-between gap-4 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-xl transition-all max-w-md ml-auto"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-sm">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-300">
                  {cartItems.reduce((acc, c) => acc + c.quantity, 0)} items in your cart
                </p>
                <p className="text-sm font-bold text-white">
                  Total:{' '}
                  {formatCurrency(
                    cartItems.reduce((acc, c) => acc + c.food.price * c.quantity, 0)
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-xl">
              <span>View Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};
