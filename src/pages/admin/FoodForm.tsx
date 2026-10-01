import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChefHat, Loader2, AlertCircle, Save, Plus, ExternalLink } from 'lucide-react';
import { Food, Category } from '../../types.js';
import { apiRequest } from '../../api/client.js';
import { BackButton } from '../../components/BackButton.js';
import { LoadingSpinner } from '../../components/LoadingSpinner.js';

export const FoodForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const catRes = await apiRequest<{ categories: Category[] }>('/categories');
        const cats = catRes.categories || [];
        setCategories(cats);

        if (isEditing && id) {
          const foodRes = await apiRequest<{ food: Food }>(`/food/${id}`);
          if (foodRes.food) {
            setName(foodRes.food.name);
            setDescription(foodRes.food.description || '');
            setPrice(String(foodRes.food.price));
            setCategoryId(foodRes.food.categoryId);
            setIsAvailable(foodRes.food.isAvailable);
            setImageUrl(foodRes.food.imageUrl || '');
          }
        } else if (cats.length > 0) {
          setCategoryId(cats[0]._id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize form.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Food item name is required.');
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError('Please enter a valid price in ₹ greater than 0.');
      return;
    }

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: numericPrice,
        categoryId,
        isAvailable,
        imageUrl: imageUrl.trim() || undefined,
      };

      if (isEditing && id) {
        await apiRequest(`/food/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest('/food', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      navigate('/admin/food');
    } catch (err: any) {
      setError(err.message || 'Failed to save food item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading food form data..." size="lg" />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Prominent Back to Food button */}
      <div className="mb-6">
        <BackButton to="/admin/food" label="Back to Food" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditing ? 'Edit Food Item' : 'Add New Food Item'}
            </h1>
            <p className="text-xs text-slate-500">
              {isEditing
                ? 'Update food information, pricing in ₹, or availability'
                : 'Publish a new dish or beverage to your canteen menu'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Check if categories exist */}
        {categories.length === 0 ? (
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
            <h3 className="text-base font-bold text-amber-900">
              No categories available. Create a category first.
            </h3>
            <p className="text-xs text-amber-700 max-w-sm mx-auto">
              Every food item must belong to a menu category (e.g. Snacks, Breakfast, Meals). Please create at least one category before adding food.
            </p>
            <div className="pt-2">
              <Link
                to="/admin/categories/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create a Category First
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Food Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Food Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Masala Dosa, Samosa Pav, Filter Coffee"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-2xs"
              />
            </div>

            {/* Category selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Category <span className="text-rose-500">*</span>
                </label>
                <Link
                  to="/admin/categories/new"
                  className="text-xs text-amber-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" />
                  New Category
                </Link>
              </div>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-2xs"
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price in ₹ */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Price in Indian Rupees (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-slate-600 text-base">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="50"
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-2xs"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">All prices use Indian Rupee (₹).</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Description <span className="text-slate-400 font-normal text-xs">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Crispy golden crepe served with hot sambar and fresh coconut chutney."
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-2xs"
              />
            </div>

            {/* Image URL (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Image Web URL <span className="text-slate-400 font-normal text-xs">(Optional)</span>
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-2xs"
              />
            </div>

            {/* Availability */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                />
                <span className="text-sm font-semibold text-slate-800">
                  Item is available for ordering immediately
                </span>
              </label>
              <p className="text-xs text-slate-400 pl-7 mt-0.5">
                Uncheck if ingredients run out or during off-peak hours.
              </p>
            </div>

            {/* Submit */}
            <div className="pt-4 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Update Food Item' : 'Publish Food Item'}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/food')}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
