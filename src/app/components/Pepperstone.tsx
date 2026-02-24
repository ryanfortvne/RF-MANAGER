import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Dot } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export const Pepperstone: React.FC = () => {
  const { state, addPepperstoneTransaction, deleteTransaction } = useApp();
  const [type, setType] = useState<'profit' | 'loss' | 'deposit' | 'withdrawal'>('profit');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [graphView, setGraphView] = useState<'goal' | 'growth'>('goal');
  const [show5KModal, setShow5KModal] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const { pepperstoneState } = state;
  const isGoalMode = pepperstoneState.mode === 'goal';
  const goalProgress = Math.min((pepperstoneState.balance / 5000) * 100, 100);

  const handleAddTransaction = () => {
    const amountNum = parseFloat(amount);
    if (!isNaN(amountNum) && amountNum > 0) {
      addPepperstoneTransaction(type, amountNum, notes);
      setAmount('');
      setNotes('');
    }
  };

  const pepperstoneTransactions = state.transactions
    .filter(t => t.source === 'pepperstone')
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const getTransactionIcon = (txnType: string) => {
    if (txnType.includes('profit')) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (txnType.includes('loss')) return <TrendingDown className="w-4 h-4 text-red-600" />;
    if (txnType.includes('deposit')) return <DollarSign className="w-4 h-4 text-blue-600" />;
    if (txnType.includes('withdrawal')) return <Wallet className="w-4 h-4 text-orange-600" />;
    return null;
  };

  const graphData = graphView === 'goal' 
    ? pepperstoneState.goalCycleData 
    : pepperstoneState.growthModeData;

  const chartData = graphData.map(point => ({
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
      withdrawal: '#FFC107',
      funded_allocation: '#9B59B6',
    };
    
    return (
      <circle cx={cx} cy={cy} r={4} fill={colors[payload.type] || '#007BFF'} stroke="white" strokeWidth={2} />
    );
  };

  return (
    <div className="space-y-6">
      {/* Balance Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg p-8 text-white"
      >
        <div className="text-center space-y-4">
          <h2 className="text-xl opacity-90">Pepperstone Balance</h2>
          <motion.div
            key={pepperstoneState.balance}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-bold"
          >
            ${pepperstoneState.balance.toFixed(2)}
          </motion.div>
        </div>
      </motion.div>

      {/* Mode Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg p-4 shadow-md ${
          isGoalMode ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-green-100 border-2 border-green-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-2xl font-bold ${isGoalMode ? 'text-yellow-800' : 'text-green-800'}`}>
              {isGoalMode ? '🎯 GOAL MODE' : '📈 GROWTH MODE'}
            </h3>
            {isGoalMode && (
              <p className="text-sm text-gray-700 mt-1">Target: $5,000</p>
            )}
            {!isGoalMode && (
              <p className="text-sm text-gray-700 mt-1">Goal achieved! Mode irreversible.</p>
            )}
          </div>
          {isGoalMode && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-2xl font-bold" style={{ color: '#FFC107' }}>
                {goalProgress.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
        
        {isGoalMode && (
          <div className="mt-4">
            <Progress value={goalProgress} className="h-3" />
          </div>
        )}
      </motion.div>

      {/* Transaction Input */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4" style={{ color: '#007BFF' }}>
          Add Transaction
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profit">Trading Profit (+)</SelectItem>
                <SelectItem value="loss">Loss (-)</SelectItem>
                <SelectItem value="deposit">Deposit (+)</SelectItem>
                <SelectItem value="withdrawal">Withdrawal (-)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Amount (USD)</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div>
            <Label>Notes (Optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
            />
          </div>
        </div>
        <Button
          onClick={handleAddTransaction}
          className="mt-4 w-full"
          style={{ backgroundColor: '#28A745' }}
        >
          Add Transaction
        </Button>
      </Card>

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
                <th className="px-4 py-2 text-left">Notes</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pepperstoneTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                pepperstoneTransactions.map((txn, idx) => (
                  <tr key={txn.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2">{format(txn.date, 'MMM dd, yyyy')}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(txn.type)}
                        <span className="capitalize">{txn.type.replace('pepperstone_', '').replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      ${txn.amountUSD.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{txn.notes || '-'}</td>
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

      {/* Graph Panel */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold" style={{ color: '#007BFF' }}>
            Balance Graph
          </h3>
          <Select value={graphView} onValueChange={(v: any) => setGraphView(v)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goal">Goal Cycle Graph</SelectItem>
              <SelectItem value="growth">Growth Mode Graph</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
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
                stroke="#007BFF"
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
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFC107' }}></div>
            <span>Withdrawal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9B59B6' }}></div>
            <span>Funded Allocation</span>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteModalId} onOpenChange={() => setDeleteModalId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: '#007BFF' }}>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 text-amber-600 mb-4">
              <AlertCircle className="w-5 h-5" />
              <p>Are you sure you want to delete this transaction?</p>
            </div>
            <p className="text-sm text-gray-600">
              This will trigger a full recalculation of all balances and may affect your Pepperstone mode.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalId(null)}>
              Cancel
            </Button>
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