import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { FileText, Filter } from 'lucide-react';

export const Ledger: React.FC = () => {
  const { state, deleteTransaction } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'funded' | 'pepperstone' | 'tradify'>('all');

  const filteredTransactions = state.transactions
    .filter(t => filterType === 'all' || t.source === filterType)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const getSourceLabel = (source: string) => {
    return source.charAt(0).toUpperCase() + source.slice(1);
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/^(funded|pepperstone|tradify) /, '');
  };

  // Calculate taxable income
  const taxableTransactions = state.transactions.filter(t => 
    t.type === 'funded_profit' || 
    t.type === 'pepperstone_withdrawal' || 
    t.type === 'tradify_withdrawal'
  );

  const totalTaxableUSD = taxableTransactions.reduce((sum, t) => sum + t.amountUSD, 0);
  const totalTaxableKES = totalTaxableUSD * state.settings.kesUsdRate;

  // Kenyan tax calculation
  const calculateKenyanTax = (monthlyIncomeKES: number) => {
    const brackets = [
      { min: 0, max: 24000, rate: 0.10 },
      { min: 24001, max: 32333, rate: 0.25 },
      { min: 32334, max: 500000, rate: 0.30 },
      { min: 500001, max: 800000, rate: 0.325 },
      { min: 800001, max: Infinity, rate: 0.35 },
    ];

    let tax = 0;
    let remainingIncome = monthlyIncomeKES;

    for (const bracket of brackets) {
      if (remainingIncome <= 0) break;
      
      const taxableInBracket = Math.min(
        remainingIncome,
        bracket.max - bracket.min + 1
      );
      
      tax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }

    // Apply personal relief
    const personalRelief = 2400;
    return Math.max(0, tax - personalRelief);
  };

  const monthlyTaxableKES = totalTaxableKES / 12;
  const estimatedMonthlyTax = calculateKenyanTax(monthlyTaxableKES);
  const annualTax = estimatedMonthlyTax * 12;

  return (
    <div className="space-y-6">
      {/* Tax Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6" style={{ color: '#007BFF' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#007BFF' }}>
              Tax Summary (Kenyan Resident)
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total Taxable Income</p>
              <p className="text-2xl font-bold" style={{ color: '#007BFF' }}>
                ${totalTaxableUSD.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                KES {totalTaxableKES.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Est. Monthly Tax</p>
              <p className="text-2xl font-bold" style={{ color: '#DC3545' }}>
                KES {estimatedMonthlyTax.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                ${(estimatedMonthlyTax / state.settings.kesUsdRate).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Est. Annual Tax</p>
              <p className="text-2xl font-bold" style={{ color: '#DC3545' }}>
                KES {annualTax.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                ${(annualTax / state.settings.kesUsdRate).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Tax calculated using Kenyan progressive tax brackets with KES 2,400 monthly personal relief.
              Only funded profits, Pepperstone withdrawals, and Tradify withdrawals are taxable.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Ledger Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold" style={{ color: '#007BFF' }}>
              Unified Ledger
            </h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="funded">Funded Only</SelectItem>
                  <SelectItem value="pepperstone">Pepperstone Only</SelectItem>
                  <SelectItem value="tradify">Tradify Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Amount (USD)</th>
                  <th className="px-4 py-3 text-right">Amount (KES)</th>
                  <th className="px-4 py-3 text-center">Taxable</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No transactions to display
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((txn, idx) => {
                    const isTaxable = 
                      txn.type === 'funded_profit' || 
                      txn.type === 'pepperstone_withdrawal' || 
                      txn.type === 'tradify_withdrawal';

                    return (
                      <motion.tr
                        key={txn.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.03 }}
                        className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
                      >
                        <td className="px-4 py-3">
                          {format(txn.date, 'MMM dd, yyyy')}
                        </td>
                        <td className="px-4 py-3">
                          <span className="capitalize font-medium">
                            {getSourceLabel(txn.source)}
                          </span>
                        </td>
                        <td className="px-4 py-3 capitalize">
                          {getTypeLabel(txn.type)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          ${txn.amountUSD.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          KES {(txn.amountUSD * txn.exchangeRate).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isTaxable ? (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                              Yes
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm('Delete this transaction? This will trigger recalculation.')) {
                                deleteTransaction(txn.id);
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Tax Brackets Reference */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4" style={{ color: '#007BFF' }}>
          Kenyan Tax Brackets (Monthly)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Income Band (KES/month)</th>
                <th className="px-4 py-2 text-right">Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="px-4 py-2">0 - 24,000</td>
                <td className="px-4 py-2 text-right">10%</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2">24,001 - 32,333</td>
                <td className="px-4 py-2 text-right">25%</td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-2">32,334 - 500,000</td>
                <td className="px-4 py-2 text-right">30%</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2">500,001 - 800,000</td>
                <td className="px-4 py-2 text-right">32.5%</td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-2">Above 800,000</td>
                <td className="px-4 py-2 text-right">35%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Personal relief of KES 2,400/month is automatically deducted.
        </p>
      </Card>
    </div>
  );
};