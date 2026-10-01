import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  Calendar,
  Flame,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { ReportsData, formatCurrency } from '../../types.js';
import { apiRequest } from '../../api/client.js';
import { BackButton } from '../../components/BackButton.js';
import { LoadingSpinner } from '../../components/LoadingSpinner.js';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiRequest<{ reports: ReportsData }>('/admin/reports');
      setReports(res.reports);
    } catch (err: any) {
      setError(err.message || 'Unable to load canteen reports.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Generating real database reports..." size="lg" />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Prominent Back to Dashboard button */}
      <div className="mb-6 flex items-center justify-between">
        <BackButton to="/admin/dashboard" label="Back to Dashboard" />
        <button
          type="button"
          onClick={fetchReports}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Data
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-amber-600" />
          Canteen Sales & Demand Reports
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Detailed metrics compiled directly from real customer order receipts
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchReports} className="ml-auto underline font-medium cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-3">
            {formatCurrency(reports?.totalSales || 0)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Total revenue collected in cash</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Orders Logged
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-3">
            {reports?.totalOrders || 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">All tickets created by students</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-3">
            {reports?.completedOrders || 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">Successfully fulfilled by kitchen</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Food Items Leaderboard */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-600" />
            Most Popular Food Items
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Ranked by total quantity ordered by students
          </p>

          {!reports?.popularFoodItems || reports.popularFoodItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm bg-slate-50 rounded-2xl">
              No sales data recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.popularFoodItems.map((item, idx) => (
                <div
                  key={item.foodId}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0
                          ? 'bg-amber-500 text-white'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : idx === 2
                          ? 'bg-orange-300 text-orange-900'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        {item.count} {item.count === 1 ? 'serving' : 'servings'} ordered
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-slate-800">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            Daily Orders & Sales
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Order volume and revenue tracked per day
          </p>

          {!reports?.dailyOrders || reports.dailyOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm bg-slate-50 rounded-2xl">
              No order dates recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.dailyOrders.map((day) => (
                <div
                  key={day.date}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {new Date(day.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-slate-400">
                      {day.orders} {day.orders === 1 ? 'order' : 'orders'} placed
                    </p>
                  </div>

                  <span className="text-sm font-bold text-amber-700">
                    {formatCurrency(day.sales)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
