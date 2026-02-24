import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useApp } from '../context/AppContext';
import { AllocationDistribution } from '../types';

interface FundedProfitModalProps {
  open: boolean;
  onClose: () => void;
}

export const FundedProfitModal: React.FC<FundedProfitModalProps> = ({ open, onClose }) => {
  const { state, addFundedProfit } = useApp();
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState('');
  const [allocations, setAllocations] = useState<AllocationDistribution | null>(null);
  const [surplus, setSurplus] = useState<{ [key: string]: number }>({});

  const pre5K = !state.pepperstoneState.hasReached5K;

  const calculateAllocations = (profitUSD: number): AllocationDistribution => {
    if (pre5K) {
      return {
        pepperstoneAllocation: profitUSD * 0.15,
        bybitAutosave: profitUSD * 0.05,
        cashInHand: profitUSD * 0.03,
        shortTerm: profitUSD * 0.32,
        grooming: profitUSD * 0.08,
        longTerm: profitUSD * 0.08,
        customKenyan: profitUSD * 0.18,
        emergencyFund: profitUSD * 0.03,
        travel: profitUSD * 0.08,
      };
    } else {
      return {
        pepperstoneAllocation: profitUSD * 0.05,
        tradifyAllocation: profitUSD * 0.10,
        bybitAutosave: profitUSD * 0.05,
        cashInHand: profitUSD * 0.03,
        shortTerm: profitUSD * 0.32,
        grooming: profitUSD * 0.08,
        longTerm: profitUSD * 0.08,
        customKenyan: profitUSD * 0.18,
        emergencyFund: profitUSD * 0.03,
        travel: profitUSD * 0.08,
      };
    }
  };

  const handleNext = () => {
    const profitUSD = parseFloat(amount);
    if (!isNaN(profitUSD) && profitUSD > 0) {
      const calculated = calculateAllocations(profitUSD);
      setAllocations(calculated);
      setStep(2);
    }
  };

  const handleAllocationChange = (key: keyof AllocationDistribution, value: string) => {
    if (!allocations) return;
    
    const numValue = parseFloat(value) || 0;
    const original = calculateAllocations(parseFloat(amount));
    const originalValue = original[key] || 0;
    
    setAllocations(prev => {
      if (!prev) return prev;
      return { ...prev, [key]: numValue };
    });
    
    if (numValue < originalValue && key !== 'longTerm') {
      setSurplus(prev => ({ ...prev, [key]: originalValue - numValue }));
    } else {
      setSurplus(prev => {
        const newSurplus = { ...prev };
        delete newSurplus[key];
        return newSurplus;
      });
    }
  };

  const getTotalSurplus = () => {
    return Object.values(surplus).reduce((sum, val) => sum + val, 0);
  };

  const handleConfirm = () => {
    if (!allocations) return;
    
    const totalSurplus = getTotalSurplus();
    const finalAllocations = {
      ...allocations,
      longTerm: allocations.longTerm + totalSurplus,
    };
    
    addFundedProfit(parseFloat(amount), finalAllocations);
    onClose();
    setStep(1);
    setAmount('');
    setAllocations(null);
    setSurplus({});
  };

  const allocationRows = allocations ? [
    { key: 'pepperstoneAllocation', label: 'Pepperstone Cent' },
    ...(pre5K ? [] : [{ key: 'tradifyAllocation' as keyof AllocationDistribution, label: 'Tradify' }]),
    { key: 'bybitAutosave', label: 'Bybit Autosave' },
    { key: 'cashInHand', label: 'Cash in Hand' },
    { key: 'shortTerm', label: 'Short-Term Savings' },
    { key: 'grooming', label: 'Grooming' },
    { key: 'longTerm', label: 'Long-Term Savings' },
    { key: 'customKenyan', label: 'Custom Kenyan Index' },
    { key: 'emergencyFund', label: 'Emergency Fund' },
    { key: 'travel', label: 'Travel' },
  ] : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl" style={{ color: '#007BFF' }}>
            Input Funded Profit
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="profit-amount">Profit Amount (USD)</Label>
              <Input
                id="profit-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter profit amount"
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleNext} style={{ backgroundColor: '#007BFF' }}>
                Next
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Preview Allocation Table - Mode: {pre5K ? 'Pre-5K' : 'Post-5K'}
            </p>
            
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead style={{ backgroundColor: '#007BFF' }}>
                  <tr>
                    <th className="px-4 py-2 text-left text-white">Allocation</th>
                    <th className="px-4 py-2 text-right text-white">%</th>
                    <th className="px-4 py-2 text-right text-white">USD Amount</th>
                    <th className="px-4 py-2 text-right text-white">Surplus</th>
                  </tr>
                </thead>
                <tbody>
                  {allocationRows.map((row, idx) => {
                    const value = allocations[row.key as keyof AllocationDistribution] || 0;
                    const original = calculateAllocations(parseFloat(amount));
                    const percentage = ((original[row.key as keyof AllocationDistribution] || 0) / parseFloat(amount)) * 100;
                    const surplusValue = surplus[row.key] || 0;
                    
                    return (
                      <tr key={row.key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-2">{row.label}</td>
                        <td className="px-4 py-2 text-right">{percentage.toFixed(1)}%</td>
                        <td className="px-4 py-2 text-right">
                          {row.key === 'longTerm' ? (
                            <span className="font-medium">${value.toFixed(2)}</span>
                          ) : (
                            <Input
                              type="number"
                              step="0.01"
                              value={value.toFixed(2)}
                              onChange={(e) => handleAllocationChange(row.key as keyof AllocationDistribution, e.target.value)}
                              className="w-24 text-right ml-auto"
                            />
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {surplusValue > 0 ? (
                            <span className="text-orange-600">${surplusValue.toFixed(2)}</span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {getTotalSurplus() > 0 && (
                    <tr className="bg-green-50 font-medium">
                      <td className="px-4 py-2" colSpan={2}>Total Surplus → Long-Term Savings</td>
                      <td className="px-4 py-2 text-right" colSpan={2} style={{ color: '#28A745' }}>
                        +${getTotalSurplus().toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleConfirm} style={{ backgroundColor: '#28A745', color: 'white' }}>
                Confirm
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};