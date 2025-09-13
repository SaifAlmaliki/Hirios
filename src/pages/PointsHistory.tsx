import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Coins, 
  FileText, 
  Mic, 
  Gift, 
  RefreshCw, 
  ArrowUp, 
  ArrowDown,
  Calendar,
  Clock
} from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

const PointsHistory = () => {
  const { 
    transactions, 
    isLoadingTransactions, 
    points, 
    refreshPoints,
    formatPoints 
  } = usePoints();

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <Coins className="h-5 w-5 text-blue-600" />;
      case 'screening':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'voice_interview':
        return <Mic className="h-5 w-5 text-purple-600" />;
      case 'bonus':
        return <Gift className="h-5 w-5 text-yellow-600" />;
      case 'refund':
        return <RefreshCw className="h-5 w-5 text-orange-600" />;
      default:
        return <Coins className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string, points: number) => {
    if (points > 0) {
      return 'text-green-600 bg-green-50';
    } else {
      return 'text-red-600 bg-red-50';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'Purchase';
      case 'screening':
        return 'Resume Screening';
      case 'voice_interview':
        return 'Voice Interview';
      case 'bonus':
        return 'Bonus';
      case 'refund':
        return 'Refund';
      default:
        return 'Transaction';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoadingTransactions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar title="Points History" />
        <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar title="Points History" />
      
      <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Points History</h1>
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="bg-white px-6 py-3 rounded-full shadow-lg">
                <span className="text-lg font-semibold text-gray-900">
                  Current Balance: {formatPoints(points)}
                </span>
              </div>
              <Button
                onClick={refreshPoints}
                variant="outline"
                size="sm"
                className="px-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </motion.div>

          {/* Transactions List */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Coins className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No transactions yet
                    </h3>
                    <p className="text-gray-600">
                      Your point transactions will appear here once you start using the platform.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            {getTransactionIcon(transaction.transaction_type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {getTransactionTypeLabel(transaction.transaction_type)}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {transaction.transaction_type}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 truncate">
                              {transaction.description}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {formatDate(transaction.created_at)}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({getRelativeTime(transaction.created_at)})
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getTransactionColor(transaction.transaction_type, transaction.points)}`}>
                            {transaction.points > 0 ? (
                              <div className="flex items-center gap-1">
                                <ArrowUp className="h-3 w-3" />
                                +{transaction.points}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <ArrowDown className="h-3 w-3" />
                                {transaction.points}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Summary Stats */}
          {transactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {transactions.filter(t => t.points > 0).reduce((sum, t) => sum + t.points, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Points Earned</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-red-600 mb-2">
                    {Math.abs(transactions.filter(t => t.points < 0).reduce((sum, t) => sum + t.points, 0))}
                  </div>
                  <div className="text-sm text-gray-600">Points Used</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {transactions.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Transactions</div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PointsHistory;
