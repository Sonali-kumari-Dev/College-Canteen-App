import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { Navbar } from './components/Navbar.js';
import { LoadingSpinner } from './components/LoadingSpinner.js';

// Auth & General Pages
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { Profile } from './pages/Profile.js';

// Student Pages
import { Menu } from './pages/student/Menu.js';
import { FoodDetails } from './pages/student/FoodDetails.js';
import { Cart } from './pages/student/Cart.js';
import { Checkout } from './pages/student/Checkout.js';
import { OrderHistory } from './pages/student/OrderHistory.js';
import { OrderDetails } from './pages/student/OrderDetails.js';

// Admin Pages
import { Dashboard } from './pages/admin/Dashboard.js';
import { CategoryList } from './pages/admin/CategoryList.js';
import { CategoryForm } from './pages/admin/CategoryForm.js';
import { FoodList } from './pages/admin/FoodList.js';
import { FoodForm } from './pages/admin/FoodForm.js';
import { AdminOrders } from './pages/admin/AdminOrders.js';
import { AdminOrderDetails } from './pages/admin/AdminOrderDetails.js';
import { FeedbackList } from './pages/admin/FeedbackList.js';
import { Reports } from './pages/admin/Reports.js';

// Kitchen Pages
import { KitchenOrders } from './pages/kitchen/KitchenOrders.js';
import { KitchenOrderDetails } from './pages/kitchen/KitchenOrderDetails.js';

import { Role } from './types.js';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<RouteGuardProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Verifying session..." size="lg" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'KITCHEN') return <Navigate to="/kitchen" replace />;
    return <Navigate to="/menu" replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Loading CanteenX..." size="lg" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'KITCHEN') return <Navigate to="/kitchen" replace />;
  return <Navigate to="/menu" replace />;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Common Protected Profile */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Student Protected Routes */}
                <Route
                  path="/menu"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'KITCHEN']}>
                      <Menu />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/food/:id"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'KITCHEN']}>
                      <FoodDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <OrderHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'KITCHEN']}>
                      <OrderDetails />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <CategoryList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories/new"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <CategoryForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories/edit/:id"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <CategoryForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/food"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <FoodList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/food/new"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <FoodForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/food/edit/:id"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <FoodForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders/:id"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminOrderDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/feedback"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <FeedbackList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <Reports />
                    </ProtectedRoute>
                  }
                />

                {/* Kitchen Protected Routes */}
                <Route
                  path="/kitchen"
                  element={
                    <ProtectedRoute allowedRoles={['KITCHEN', 'ADMIN']}>
                      <KitchenOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/kitchen/orders/:id"
                  element={
                    <ProtectedRoute allowedRoles={['KITCHEN', 'ADMIN']}>
                      <KitchenOrderDetails />
                    </ProtectedRoute>
                  }
                />

                {/* Default route */}
                <Route path="/" element={<RootRedirect />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
