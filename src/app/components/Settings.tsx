import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Info, DollarSign } from 'lucide-react';

export const Settings: React.FC = () => {
  const { state, updateSettings } = useApp();
  const [kesUsdRate, setKesUsdRate] = useState(state.settings.kesUsdRate.toString());

  const handleSaveRate = () => {
    const rate = parseFloat(kesUsdRate);
    if (!isNaN(rate) && rate > 0) {
      updateSettings({ kesUsdRate: rate });
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-8 h-8" style={{ color: '#007BFF' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#007BFF' }}>
            Settings
          </h1>
        </div>

        {/* Exchange Rate */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5" style={{ color: '#007BFF' }} />
            <h3 className="text-xl font-semibold">Currency Exchange Rate</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    All monetary values are stored in USD. The KES conversion is display-only.
                    Changing this rate affects future allocations only - past entries remain unchanged.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-4">
            <div>
              <Label>KES per 1 USD</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  step="0.01"
                  value={kesUsdRate}
                  onChange={(e) => setKesUsdRate(e.target.value)}
                  placeholder="130.00"
                  className="flex-1"
                />
                <Button onClick={handleSaveRate} style={{ backgroundColor: '#28A745' }}>
                  Save
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Current rate: 1 USD = {state.settings.kesUsdRate} KES
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">How Currency Conversion Works:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• All balances are stored internally in USD</li>
                <li>• KES is shown for display purposes only (mainly for tax)</li>
                <li>• Each transaction locks in the exchange rate at time of entry</li>
                <li>• Changing the rate here only affects new transactions</li>
                <li>• Historical data remains unchanged</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* App Info */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Application Info</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Version:</span>
              <span className="font-semibold">2.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Total Transactions:</span>
              <span className="font-semibold">{state.transactions.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Pepperstone Mode:</span>
              <span className="font-semibold capitalize">{state.pepperstoneState.mode}</span>
            </div>
            <div className="flex justify-between">
              <span>Short-Term Goals:</span>
              <span className="font-semibold">{state.shortTermGoals.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Long-Term Goals:</span>
              <span className="font-semibold">{state.longTermGoals.length}</span>
            </div>
          </div>
        </Card>

        {/* Brand Colors */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Brand Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="h-16 rounded-lg" style={{ backgroundColor: '#007BFF' }}></div>
              <p className="text-xs font-medium">Primary Blue</p>
              <p className="text-xs text-gray-500">#007BFF</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg" style={{ backgroundColor: '#28A745' }}></div>
              <p className="text-xs font-medium">Success Green</p>
              <p className="text-xs text-gray-500">#28A745</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg" style={{ backgroundColor: '#FFC107' }}></div>
              <p className="text-xs font-medium">Warning Yellow</p>
              <p className="text-xs text-gray-500">#FFC107</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg" style={{ backgroundColor: '#DC3545' }}></div>
              <p className="text-xs font-medium">Danger Red</p>
              <p className="text-xs text-gray-500">#DC3545</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg" style={{ backgroundColor: '#6C757D' }}></div>
              <p className="text-xs font-medium">Neutral Gray</p>
              <p className="text-xs text-gray-500">#6C757D</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg border" style={{ backgroundColor: '#DEE2E6' }}></div>
              <p className="text-xs font-medium">Light Gray</p>
              <p className="text-xs text-gray-500">#DEE2E6</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};