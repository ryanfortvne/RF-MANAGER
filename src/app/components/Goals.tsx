import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Trophy, GripVertical, ChevronDown, Search } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ShortTermGoal, LongTermGoal } from '../types';

interface DraggableSTGCardProps {
  goal: ShortTermGoal;
  index: number;
  moveGoal: (dragIndex: number, hoverIndex: number) => void;
  onDelete: (id: string) => void;
  onEditName: (id: string, newName: string) => void;
}

const DraggableSTGCard: React.FC<DraggableSTGCardProps> = ({ goal, index, moveGoal, onDelete, onEditName }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(goal.label);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'STG',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'STG',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveGoal(item.index, index);
        item.index = index;
      }
    },
  });

  const progressPercent = Math.min((goal.progress / goal.target) * 100, 100);

  const handleSaveName = () => {
    if (editedName.trim()) {
      onEditName(goal.id, editedName.trim());
      setIsEditingName(false);
    }
  };

  return (
    <div ref={(node) => preview(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start gap-3 mb-4">
          <div ref={drag} className="cursor-grab active:cursor-grabbing pt-1">
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                style={{ backgroundColor: '#007BFF' }}
              >
                [STG]
              </span>
              {isEditingName ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') {
                        setIsEditingName(false);
                        setEditedName(goal.label);
                      }
                    }}
                    className="flex-1"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveName}>Save</Button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold flex-1">{goal.label}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(goal.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-2xl font-bold mb-3" style={{ color: '#007BFF' }}>
              Target: ${goal.target.toFixed(2)}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress: ${goal.progress.toFixed(2)}</span>
                <span className="font-semibold">{progressPercent.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>
            {progressPercent >= 100 && (
              <div className="mt-4 flex items-center gap-2 text-green-600">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">Goal Achieved!</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export const Goals: React.FC = () => {
  const { 
    state, 
    addShortTermGoal, 
    editShortTermGoal,
    deleteShortTermGoal, 
    reorderShortTermGoals,
    addLongTermGoal,
    editLongTermGoal, 
    deleteLongTermGoal,
  } = useApp();
  
  const [showAddSTG, setShowAddSTG] = useState(false);
  const [showAddLTG, setShowAddLTG] = useState(false);
  const [newGoalLabel, setNewGoalLabel] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isEditingLTGName, setIsEditingLTGName] = useState(false);
  const [editedLTGName, setEditedLTGName] = useState('');

  const [localSTGoals, setLocalSTGoals] = useState<ShortTermGoal[]>([]);

  const activeSTGoals = state.shortTermGoals.filter(g => !g.achieved);
  const activeLTGoals = state.longTermGoals.filter(g => !g.achieved);
  const activeLTG = activeLTGoals.length > 0 ? activeLTGoals[0] : null;

  // Sync with global state
  useEffect(() => {
    setLocalSTGoals(activeSTGoals.sort((a, b) => a.priority - b.priority));
  }, [state.shortTermGoals]);

  const moveSTGoal = (dragIndex: number, hoverIndex: number) => {
    const draggedGoal = localSTGoals[dragIndex];
    const newGoals = [...localSTGoals];
    newGoals.splice(dragIndex, 1);
    newGoals.splice(hoverIndex, 0, draggedGoal);
    
    // Recalculate priorities: top = 1, bottom = 2
    const reorderedGoals = newGoals.map((goal, idx) => ({
      ...goal,
      priority: (idx + 1) as 1 | 2 | 3,
    }));
    
    setLocalSTGoals(reorderedGoals);
  };

  const handleDropSTGoal = () => {
    // Save the reordered goals
    reorderShortTermGoals(localSTGoals);
  };

  const handleAddSTG = () => {
    const target = parseFloat(newGoalTarget);
    if (newGoalLabel.trim() && !isNaN(target) && target > 0) {
      if (activeSTGoals.length >= 2) {
        alert('Maximum 2 Short-Term Goals allowed. Complete or delete an existing goal first.');
        return;
      }
      // Auto-add as Priority 2 (or Priority 1 if it's the first)
      const priority = activeSTGoals.length === 0 ? 1 : 2;
      addShortTermGoal(newGoalLabel.trim(), target, 'Funded');
      setShowAddSTG(false);
      setNewGoalLabel('');
      setNewGoalTarget('');
    }
  };

  const handleAddLTG = () => {
    const target = parseFloat(newGoalTarget);
    if (newGoalLabel.trim() && !isNaN(target) && target > 0) {
      if (activeLTGoals.length >= 1) {
        alert('Only 1 Long-Term Goal allowed at a time. Complete the existing goal first or set a new target.');
        return;
      }
      addLongTermGoal(newGoalLabel.trim(), target, 'Mixed');
      setShowAddLTG(false);
      setNewGoalLabel('');
      setNewGoalTarget('');
    }
  };

  const handleSetNewLTGTarget = () => {
    if (!activeLTG) return;
    
    const newTargetStr = prompt('Enter new target amount (USD):');
    if (newTargetStr) {
      const newTarget = parseFloat(newTargetStr);
      if (!isNaN(newTarget) && newTarget > 0) {
        // Archive current goal
        editLongTermGoal(activeLTG.id, { achieved: true, archivedDate: new Date() });
        // Create new goal with same name
        addLongTermGoal(activeLTG.label, newTarget, 'Mixed');
      }
    }
  };

  const handleEditSTGName = (id: string, newName: string) => {
    editShortTermGoal(id, { label: newName });
  };

  const handleSaveLTGName = () => {
    if (activeLTG && editedLTGName.trim()) {
      editLongTermGoal(activeLTG.id, { label: editedLTGName.trim() });
      setIsEditingLTGName(false);
    }
  };

  const archivedGoals = [
    ...state.shortTermGoals.filter(g => g.achieved),
    ...state.longTermGoals.filter(g => g.achieved),
  ];

  const filteredArchivedGoals = archivedGoals.filter(goal => {
    const matchesSearch = goal.label.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (dateFrom && goal.archivedDate) {
      const goalDate = new Date(goal.archivedDate);
      const fromDate = new Date(dateFrom);
      if (goalDate < fromDate) return false;
    }
    
    if (dateTo && goal.archivedDate) {
      const goalDate = new Date(goal.archivedDate);
      const toDate = new Date(dateTo);
      if (goalDate > toDate) return false;
    }
    
    return true;
  });

  const ltgProgressPercent = activeLTG ? Math.min((activeLTG.progress / activeLTG.target) * 100, 100) : 0;
  const ltgCompleted = activeLTG && ltgProgressPercent >= 100;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-8">
        {/* SHORT-TERM GOALS SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold underline" style={{ color: '#007BFF' }}>
              Short-Term Goals (Funded 32%)
            </h2>
            <Button
              onClick={() => setShowAddSTG(true)}
              disabled={activeSTGoals.length >= 2}
              style={{ backgroundColor: '#28A745' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add STG
            </Button>
          </div>

          <div className="space-y-4" onMouseUp={handleDropSTGoal}>
            {localSTGoals.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">
                No short-term goals yet. Click "Add STG" to create one. (Maximum 2 goals)
              </Card>
            ) : (
              localSTGoals.map((goal, idx) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <DraggableSTGCard
                    goal={goal}
                    index={idx}
                    moveGoal={moveSTGoal}
                    onDelete={deleteShortTermGoal}
                    onEditName={handleEditSTGName}
                  />
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Short-Term Goal Rules:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Maximum 2 goals at a time</li>
              <li>• Top position = Priority 1 (80% of 32% = 25.6% of Funded profits)</li>
              <li>• Bottom position = Priority 2 (20% of 32% = 6.4% of Funded profits)</li>
              <li>• Drag to reorder priorities instantly</li>
            </ul>
          </div>
        </motion.div>

        {/* LONG-TERM GOALS SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold underline" style={{ color: '#28A745' }}>
              Long-Term Goals
            </h2>
            <Button
              onClick={() => setShowAddLTG(true)}
              disabled={activeLTGoals.length >= 1}
              style={{ backgroundColor: '#28A745' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add LTG
            </Button>
          </div>

          {!activeLTG ? (
            <Card className="p-8 text-center text-gray-500">
              No long-term goal yet. Click "Add LTG" to create one. (Only 1 active goal at a time)
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                        style={{ backgroundColor: '#28A745' }}
                      >
                        [LTG]
                      </span>
                      {isEditingLTGName ? (
                        <div className="flex gap-2 flex-1">
                          <Input
                            value={editedLTGName}
                            onChange={(e) => setEditedLTGName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveLTGName();
                              if (e.key === 'Escape') {
                                setIsEditingLTGName(false);
                                setEditedLTGName(activeLTG.label);
                              }
                            }}
                            className="flex-1"
                            autoFocus
                          />
                          <Button size="sm" onClick={handleSaveLTGName}>Save</Button>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-xl font-semibold flex-1">{activeLTG.label}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsEditingLTGName(true);
                              setEditedLTGName(activeLTG.label);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteLongTermGoal(activeLTG.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-2xl font-bold mb-3" style={{ color: '#28A745' }}>
                      Target: ${activeLTG.target.toFixed(2)}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: ${activeLTG.progress.toFixed(2)}</span>
                        <span className="font-semibold">{ltgProgressPercent.toFixed(1)}%</span>
                      </div>
                      <Progress value={ltgProgressPercent} className="h-3" />
                    </div>
                    {ltgCompleted && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2 text-green-600">
                          <Trophy className="w-5 h-5" />
                          <span className="font-semibold">Goal Achieved!</span>
                        </div>
                        <Button
                          onClick={handleSetNewLTGTarget}
                          style={{ backgroundColor: '#28A745' }}
                          className="w-full"
                        >
                          Set New Target
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Long-Term Goal Rules:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Only 1 active goal at a time</li>
              <li>• Receives 8% of Funded profits + 21.43% of Tradify withdrawals</li>
              <li>• On completion, click "Set New Target" to create a fresh goal</li>
            </ul>
          </div>
        </motion.div>

        {/* ACHIEVED GOALS ARCHIVE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Collapsible open={archiveOpen} onOpenChange={setArchiveOpen}>
            <div className="flex justify-between items-center mb-4">
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-2 text-left">
                  <h2 
                    className="text-3xl font-bold underline cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: '#007BFF' }}
                  >
                    Achieved Goals Archive
                  </h2>
                  <ChevronDown 
                    className={`w-6 h-6 transition-transform ${archiveOpen ? 'rotate-180' : ''}`}
                    style={{ color: '#007BFF' }}
                  />
                </button>
              </CollapsibleTrigger>
              
              {archiveOpen && (
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search goals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="From"
                    className="w-40"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    placeholder="To"
                    className="w-40"
                  />
                </div>
              )}
            </div>

            <CollapsibleContent>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left">Goal Name</th>
                        <th className="px-6 py-3 text-right">Target</th>
                        <th className="px-6 py-3 text-right">Achieved Date</th>
                        <th className="px-6 py-3 text-right">Final Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredArchivedGoals.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            No archived goals yet
                          </td>
                        </tr>
                      ) : (
                        filteredArchivedGoals.map((goal, idx) => (
                          <tr
                            key={goal.id}
                            className={`
                              ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                              hover:bg-blue-50 transition-colors
                            `}
                          >
                            <td className="px-6 py-4 font-medium">{goal.label}</td>
                            <td className="px-6 py-4 text-right">${goal.target.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right">
                              {goal.archivedDate ? new Date(goal.archivedDate).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold" style={{ color: '#28A745' }}>
                              ${goal.progress.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>

        {/* Add Short-Term Goal Modal */}
        <Dialog open={showAddSTG} onOpenChange={setShowAddSTG}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle style={{ color: '#007BFF' }}>Add Short-Term Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Goal Name</Label>
                <Input
                  value={newGoalLabel}
                  onChange={(e) => setNewGoalLabel(e.target.value)}
                  placeholder="e.g., New Laptop"
                />
              </div>
              <div>
                <Label>Target Amount (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddSTG(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSTG} style={{ backgroundColor: '#28A745' }}>
                Add Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Long-Term Goal Modal */}
        <Dialog open={showAddLTG} onOpenChange={setShowAddLTG}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle style={{ color: '#28A745' }}>Add Long-Term Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Goal Name</Label>
                <Input
                  value={newGoalLabel}
                  onChange={(e) => setNewGoalLabel(e.target.value)}
                  placeholder="e.g., House Down Payment"
                />
              </div>
              <div>
                <Label>Target Amount (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddLTG(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLTG} style={{ backgroundColor: '#28A745' }}>
                Add Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
};
