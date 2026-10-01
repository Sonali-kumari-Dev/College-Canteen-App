import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Plus, Edit2, Trash2, AlertCircle, Utensils } from 'lucide-react';
import { Food, Category, formatCurrency } from '../../types.js';
import { apiRequest } from '../../api/client.js';
import { LoadingSpinner } from '../../components/LoadingSpinner.js';
import { EmptyState } from '../../components/EmptyState.js';

export const FoodList: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchFoodAndCategories();
  }, []);

  const fetchFoodAndCategories = async () => {
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

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete food item "${name}"?`)) return;

    try {
      setActionError(null);
      await apiRequest(`/food/${id}`, { method: 'DELETE' });
      setFoods((prev) => prev.filter((f) => f._id !== id));
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete food item.');
    }
  };

  const handleToggleAvailability = async (food: Food) => {
    try {
      setActionError(null);
      const newStatus = !food.isAvailable;
      const res = await apiRequest<{ food: Food }>(`/food/${food._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isAvailable: newStatus }),
      });
      setFoods((prev) =>
        prev.map((f) => (f._id === food._id ? { ...f, isAvailable: newStatus } : f))
      );
    } catch (err: any) {
      setActionError(err.message || 'Failed to update availability.');
    }
  };

  const filteredFoods =
    selectedCategory === 'all'
      ? foods
      : foods.filter((f) => f.categoryId === selectedCategory);

  if (isLoading) {
    return <LoadingSpinner message="Loading canteen food items..." size="lg" />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <ChefHat className="w-7 h-7 text-amber-600" />
            Food Items & Menu Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage food pricing, details, and live availability
          </p>
        </div>

        <Link
          to="/admin/food/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Food Item
        </Link>
      </div>

      {actionError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchFoodAndCategories} className="ml-auto underline font-medium cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Category Filter tabs */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat._id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {foods.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="No food items available"
          description="Your canteen menu is currently empty. Add your first food item with price in ₹."
          action={
            <Link
              to="/admin/food/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Food Item
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Food Item</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price (₹)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFoods.map((food) => (
                  <tr key={food._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                          {food.imageUrl ? (
                            <img
                              src={food.imageUrl}
                              alt={food.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Utensils className="w-5 h-5 text-amber-600/70" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{food.name}</p>
                          {food.description && (
                            <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                              {food.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {food.categoryName || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-base">
                      {formatCurrency(food.price)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(food)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          food.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to toggle availability"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {food.isAvailable ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/food/edit/${food._id}`}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Food"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(food._id, food.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Food"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
