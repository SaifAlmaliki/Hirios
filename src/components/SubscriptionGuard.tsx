import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { user, loading, subscriptionActive, subscriptionError, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Allow access to auth pages and invitation pages even when subscription is expired
  const isAuthPage = location.pathname.startsWith('/auth');
  const isJoinPage = location.pathname.startsWith('/join/');

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is logged in but subscription is not active and not on auth/join page
  // Note: Users accepting invitations might not have membership yet, so we allow join pages
  if (user && !subscriptionActive && !isAuthPage && !isJoinPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6"
          >
            <AlertCircle className="h-8 w-8 text-red-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 mb-3"
          >
            Subscription Expired
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-6"
          >
            {subscriptionError || 'Your trial/subscription has expired. Please contact support to upgrade your account.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <Mail className="h-5 w-5" />
              <span className="font-semibold">support@hirios.com</span>
            </div>
            <p className="text-sm text-blue-600 mt-2">
              Contact us to upgrade and continue using Hirios
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <a
              href="mailto:support@hirios.com?subject=Subscription Upgrade Request"
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
            >
              Email Support
            </a>
            
            <button
              onClick={signOut}
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
            >
              Sign Out
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xs text-gray-500 mt-6"
          >
            Your data is safe and will be available once your subscription is renewed.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Allow access if subscription is active or if on auth page
  return <>{children}</>;
};

export default SubscriptionGuard;

