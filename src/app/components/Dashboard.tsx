import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { FundedProfitModal } from './FundedProfitModal';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { state } = useApp();
  const [showModal, setShowModal] = useState(false);

  const allocationData = [
    { label: 'Bybit Autosave', key: 'bybitAutosave' },
    { label: 'Cash in Hand', key: 'cashInHand' },
    { label: 'Short-Term Savings', key: 'shortTerm' },
    { label: 'Long-Term Savings', key: 'longTerm' },
    { label: 'Grooming', key: 'grooming' },
    { label: 'Custom Kenyan Index', key: 'customKenyan' },
    { label: 'Emergency Fund', key: 'emergencyFund' },
    { label: 'Travel', key: 'travel' },
    { label: 'Bybit Card', key: 'bybitCard' },
    { label: 'Ryan Custom Global Index', key: 'ryanGlobalIndex' },
    { label: 'Politician Stock Tracking', key: 'politicianStockTracking' },
    { label: 'DVYE', key: 'dvye' },
  ];

  const getRecentInflow = (key: string): number => {
    // Get most recent funded transaction's allocation
    const fundedTransactions = state.transactions
      .filter(t => t.source === 'funded' && t.allocations)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    if (fundedTransactions.length === 0) return 0;
    
    const recentTransaction = fundedTransactions[0];
    if (!recentTransaction.allocations) return 0;
    
    const allocationMap: any = {
      pepperstoneAllocation: recentTransaction.allocations.pepperstoneAllocation,
      tradify: recentTransaction.allocations.tradifyAllocation || 0,
      bybitAutosave: recentTransaction.allocations.bybitAutosave,
      cashInHand: recentTransaction.allocations.cashInHand,
      shortTerm: recentTransaction.allocations.shortTerm,
      longTerm: recentTransaction.allocations.longTerm,
      grooming: recentTransaction.allocations.grooming,
      customKenyan: recentTransaction.allocations.customKenyan,
      emergencyFund: recentTransaction.allocations.emergencyFund,
      travel: recentTransaction.allocations.travel,
    };
    
    return allocationMap[key] || 0;
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold" style={{ color: '#007BFF' }}>
          Profit Manager 2.0
        </h1>
        <Button
          onClick={() => setShowModal(true)}
          size="lg"
          className="text-lg px-8 py-6"
          style={{ backgroundColor: '#007BFF' }}
        >
          Input Funded Profit
        </Button>
      </motion.div>

      {/* Balance Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Pepperstone Cent Balance Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg p-8 text-white">
          <h3 className="text-xl opacity-90 mb-2">Pepperstone Cent Balance</h3>
          <motion.div
            key={state.pepperstoneState.balance}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-bold mb-4"
          >
            ${state.pepperstoneState.balance.toFixed(2)}
          </motion.div>
          <div className="text-sm opacity-80">
            Recent Inflow: {getRecentInflow('pepperstoneAllocation') > 0 ? `$${getRecentInflow('pepperstoneAllocation').toFixed(2)}` : '-'}
          </div>
        </div>

        {/* Tradify Balance Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-lg p-8 text-white">
          <h3 className="text-xl opacity-90 mb-2">Tradify Balance</h3>
          <motion.div
            key={state.tradifyState.balance}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-bold mb-4"
          >
            ${state.tradifyState.balance.toFixed(2)}
          </motion.div>
          <div className="text-sm opacity-80">
            Recent Inflow: {getRecentInflow('tradify') > 0 ? `$${getRecentInflow('tradify').toFixed(2)}` : '-'}
          </div>
        </div>
      </motion.div>

      {/* Allocation Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div className="px-6 py-4" style={{ backgroundColor: '#007BFF' }}>
          <h2 className="text-2xl font-semibold text-white">Dashboard Allocation Table</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Allocation</th>
                <th className="px-6 py-3 text-right">Current Total (USD)</th>
                <th className="px-6 py-3 text-right">Most Recent Single Inflow</th>
              </tr>
            </thead>
            <tbody>
              {allocationData.map((item, idx) => {
                const total = state.allocationTotals[item.key as keyof typeof state.allocationTotals];
                const recentInflow = getRecentInflow(item.key);
                
                return (
                  <motion.tr
                    key={item.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`
                      ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      hover:bg-blue-50 transition-colors
                    `}
                  >
                    <td className="px-6 py-4 font-medium">{item.label}</td>
                    <td className="px-6 py-4 text-right text-lg font-semibold" style={{ color: '#007BFF' }}>
                      ${total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {recentInflow > 0 ? `$${recentInflow.toFixed(2)}` : '-'}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <FundedProfitModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};