import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Card } from './ui/card';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Dot } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { format } from 'date-fns';

export const Tradify: React.FC = () => {
  const { state, addTradifyTransaction, withdrawFromTradify, deleteTransaction } = useApp();
  const [transactionType, setTransactionType] = useState<'profit' | 'loss' | 'deposit' | 'withdrawal'>('profit');
  const [amount, setAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const { tradifyState } = state;
  const isNegative = tradifyState.balance < 0;

  const handleAddTransaction = () => {
    const amountNum = parseFloat(amount);
    if (!isNaN(amountNum) && amountNum > 0) {
      addTradifyTransaction(transactionType, amountNum);
      setAmount('');
    }
  };

  const handleWithdrawClick = () => {
    if (tradifyState.balance <= 0) {
      alert('Cannot withdraw: Insufficient balance');
      return;
    }
    setShowWithdrawModal(true);
  };

  const handleConfirmWithdraw = () => {
    const amountNum = parseFloat(withdrawAmount);
    if (!isNaN(amountNum) && amountNum > 0) {
      if (amountNum > tradifyState.balance) {
        alert('Cannot withdraw more than available balance');
        return;
      }
      withdrawFromTradify(amountNum);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
    }
  };

  const calculateWithdrawalDistribution = (amt: number) => {
    return {
      travel: amt * 0.2429,
      longTerm: amt * 0.2143,
      bybitCard: amt * 0.1429,
      ryanGlobalIndex: amt * 0.1351,
      politicianStockTracking: amt * 0.0714,
      customKenyan: amt * 0.0714,
      dvye: amt * 0.0657,
      bybitAutosave: amt * 0.0563,
      accountGrowth: amt * 0.30,
    };
  };

  const tradifyTransactions = state.transactions
    .filter(t => t.source === 'tradify')
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const getTransactionIcon = (txnType: string) => {
    if (txnType.includes('profit')) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (txnType.includes('loss')) return <TrendingDown className="w-4 h-4 text-red-600" />;
    if (txnType.includes('deposit')) return <DollarSign className="w-4 h-4 text-blue-600" />;
    if (txnType.includes('withdrawal')) return <Wallet className="w-4 h-4 text-purple-600" />;
    return null;
  };

  const chartData = tradifyState.graphData.map(point => ({
    date: format(point.date, 'MMM dd'),
    balance: point.balance,
    type: point.type,
  }));

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const colors: any = {
      profit: '#28A745',
      loss: '#DC3545',
      deposit: '#007BFF',
      withdrawal: '#9B59B6',
      funded_allocation: '#FFC107',
      pepperstone_transfer: '#FF6B6B',
    };
    
    return (
      <circle cx={cx} cy={cy} r={4} fill={colors[payload.type] || '#007BFF'} stroke="white" strokeWidth={2} />
    );
  };

  const withdrawDistribution = withdrawAmount ? calculateWithdrawalDistribution(parseFloat(withdrawAmount) || 0) : null;

  return (
    <div className="space-y-6">
      {/* Balance Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`rounded-lg shadow-lg p-8 text-white ${
          isNegative ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-green-500 to-green-700'
        }`}
      >
        <div className="text-center space-y-4">
          <h2 className="text-xl opacity-90">Tradify Balance</h2>
          <motion.div
            key={tradifyState.balance}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-bold"
          >
            ${tradifyState.balance.toFixed(2)}
          </motion.div>
        </div>
      </motion.div>

      {/* Negative Balance Warning */}
      {isNegative && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border-2 border-red-400 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-800">Negative Balance Warning</h3>
            <p className="text-sm text-red-700">Your account is in deficit. Withdrawals are not allowed.</p>
          </div>
        </motion.div>
      )}

      {/* Transaction Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4" style={{ color: '#28A745' }}>
            Add Profit
          </h3>
          <div className="space-y-4">
            <div>
              <Label>Amount (USD)</Label>
              <Input
                type="number"
                step="0.01"
                value={transactionType === 'profit' ? amount : ''}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setTransactionType('profit');
                }}
                placeholder="0.00"
              />
            </div>
            <Button
              onClick={() => {
                setTransactionType('profit');
                handleAddTransaction();
              }}
              className="w-full"
              style={{ backgroundColor: '#28A745' }}
            >
              Add Profit
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4" style={{ color: '#DC3545' }}>
            Add Loss
          </h3>
          <div className="space-y-4">
            <div>
              <Label>Amount (USD)</Label>
              <Input
                type="number"
                step="0.01"
                value={transactionType === 'loss' ? amount : ''}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setTransactionType('loss');
                }}
                placeholder="0.00"
              />
            </div>
            <Button
              onClick={() => {
                setTransactionType('loss');
                handleAddTransaction();
              }}
              className="w-full"
              style={{ backgroundColor: '#DC3545' }}
            >
              Add Loss
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4" style={{ color: '#007BFF' }}>
            Deposit
          </h3>
          <div className="space-y-4">
            <div>
              <Label>Amount (USD)</Label>
              <Input
                type="number"
                step="0.01"
                value={transactionType === 'deposit' ? amount : ''}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setTransactionType('deposit');
                }}
                placeholder="0.00"
              />
            </div>
            <Button
              onClick={() => {
                setTransactionType('deposit');
                handleAddTransaction();
              }}
              className="w-full"
              style={{ backgroundColor: '#007BFF' }}
            >
              Deposit
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4" style={{ color: '#9B59B6' }}>
            Withdraw
          </h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Withdrawals are distributed across multiple allocations with 30% staying in account.
            </p>
            <Button
              onClick={handleWithdrawClick}
              className="w-full"
              style={{ backgroundColor: '#9B59B6' }}
              disabled={isNegative}
            >
              Withdraw Funds
            </Button>
          </div>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4" style={{ color: '#007BFF' }}>
          Transaction History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tradifyTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                tradifyTransactions.map((txn, idx) => (
                  <tr key={txn.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2">{format(txn.date, 'MMM dd, yyyy')}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(txn.type)}
                        <span className="capitalize">{txn.type.replace('tradify_', '').replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      ${txn.amountUSD.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteModalId(txn.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Graph */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4" style={{ color: '#007BFF' }}>
          Balance Graph
        </h3>
        
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#28A745"
                strokeWidth={2}
                dot={<CustomDot />}
                name="Balance (USD)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data to display
          </div>
        )}
        
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#28A745' }}></div>
            <span>Profit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#DC3545' }}></div>
            <span>Loss</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#007BFF' }}></div>
            <span>Deposit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9B59B6' }}></div>
            <span>Withdrawal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFC107' }}></div>
            <span>Funded Allocation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF6B6B' }}></div>
            <span>Pepperstone Transfer</span>
          </div>
        </div>
      </Card>

      {/* Withdrawal Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#007BFF' }}>Withdraw from Tradify</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Withdrawal Amount (USD)</Label>
              <Input
                type="number"
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                className="mt-2"
              />
            </div>

            {withdrawDistribution && parseFloat(withdrawAmount) > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-3">Distribution Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Travel (24.29%)</span>
                    <span className="font-medium">${withdrawDistribution.travel.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Long-Term Savings (21.43%)</span>
                    <span className="font-medium">${withdrawDistribution.longTerm.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bybit Card (14.29%)</span>
                    <span className="font-medium">${withdrawDistribution.bybitCard.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ryan Global Index (13.51%)</span>
                    <span className="font-medium">${withdrawDistribution.ryanGlobalIndex.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Politician Stock Tracking (7.14%)</span>
                    <span className="font-medium">${withdrawDistribution.politicianStockTracking.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custom Kenyan Index (7.14%)</span>
                    <span className="font-medium">${withdrawDistribution.customKenyan.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DVYE (6.57%)</span>
                    <span className="font-medium">${withdrawDistribution.dvye.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bybit Autosave (5.63%)</span>
                    <span className="font-medium">${withdrawDistribution.bybitAutosave.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2 font-semibold" style={{ color: '#28A745' }}>
                    <span>Account Growth (30%)</span>
                    <span>${withdrawDistribution.accountGrowth.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowWithdrawModal(false);
              setWithdrawAmount('');
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmWithdraw}
              style={{ backgroundColor: '#28A745' }}
              disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
            >
              Confirm Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteModalId} onOpenChange={() => setDeleteModalId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: '#007BFF' }}>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete this transaction? This will trigger a full recalculation.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteModalId) {
                  deleteTransaction(deleteModalId);
                  setDeleteModalId(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};