import React from 'react';
import { OrderStatus } from '../types.js';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const getStyle = (s: OrderStatus) => {
    switch (s) {
      case 'PLACED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ACCEPTED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'PREPARING':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'READY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getLabel = (s: OrderStatus) => {
    switch (s) {
      case 'PLACED':
        return 'Order Placed';
      case 'ACCEPTED':
        return 'Accepted by Kitchen';
      case 'PREPARING':
        return 'Preparing Food';
      case 'READY':
        return 'Ready for Pickup';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return s;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeClasses[size]} ${getStyle(
        status
      )} tracking-wide`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-80" />
      {getLabel(status)}
    </span>
  );
};
