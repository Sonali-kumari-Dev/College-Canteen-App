import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Star, RefreshCw, AlertCircle, ShoppingBag } from 'lucide-react';
import { Feedback } from '../../types.js';
import { apiRequest } from '../../api/client.js';
import { LoadingSpinner } from '../../components/LoadingSpinner.js';
import { EmptyState } from '../../components/EmptyState.js';

export const FeedbackList: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiRequest<{ feedbacks: Feedback[] }>('/feedback');
      setFeedbacks(res.feedbacks || []);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading customer feedback..." size="lg" />;
  }

  const averageRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
      : '0.0';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-amber-600" />
            Student Feedback
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ratings and reviews submitted by students after their meals
          </p>
        </div>

        <button
          type="button"
          onClick={fetchFeedbacks}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchFeedbacks} className="ml-auto underline font-medium cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Average score card */}
      {feedbacks.length > 0 && (
        <div className="mb-8 p-6 bg-amber-500 text-slate-950 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-amber-950">
              Overall Canteen Rating
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl font-extrabold">{averageRating}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${
                      s <= Math.round(Number(averageRating))
                        ? 'fill-slate-950 text-slate-950'
                        : 'text-amber-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-amber-950 block">
              Based on {feedbacks.length} authentic {feedbacks.length === 1 ? 'review' : 'reviews'}
            </span>
            <span className="text-xs text-amber-900">Stored in MongoDB database</span>
          </div>
        </div>
      )}

      {feedbacks.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No Feedback Yet"
          description="Students will be able to rate their food once their orders are placed."
        />
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div
              key={fb._id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                    {fb.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{fb.userName}</h3>
                    <p className="text-[11px] text-slate-400">
                      {new Date(fb.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= fb.rating
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-1.5">
                    {fb.rating} / 5
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 italic">
                "{fb.comment}"
              </p>

              <div className="pt-2 flex items-center justify-end">
                <Link
                  to={`/admin/orders/${fb.orderId}`}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>View Related Order Ticket</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
