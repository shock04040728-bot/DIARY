import React, { useState } from 'react';
import { GoalEntry } from '../../types';
import { api } from '../../lib/api';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export function GoalsTab({ goals }: { goals: GoalEntry[] }) {
  const [newGoal, setNewGoal] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editGoalText, setEditGoalText] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    await api.addGoal(Date.now().toString(), { text: newGoal, progress: 0 });
    setNewGoal('');
  };

  const updateProgress = async (id: string, progress: number) => {
    await api.updateGoal(id, { progress });
  };
  
  const startEdit = (goal: GoalEntry) => {
    setEditingId(goal.id);
    setEditGoalText(goal.text);
  };

  const saveEdit = async (id: string) => {
    if (editGoalText.trim()) {
      await api.updateGoal(id, { text: editGoalText.trim() });
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input 
          type="text" 
          placeholder="올해의 새로운 목표를 입력하세요..."
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          className="flex-1 bg-bg-panel border border-border rounded-2xl px-6 py-4 text-text-base focus:outline-none focus:border-brand shadow-sm transition-colors"
        />
        <button 
          type="submit"
          disabled={!newGoal.trim()}
          className="bg-brand text-bg-panel px-6 rounded-2xl disabled:opacity-50 transition-colors hover:bg-brand-hover shadow-sm font-medium flex items-center gap-2"
        >
          <Plus size={18} /> 추가
        </button>
      </form>

      <div className="grid gap-4">
        {goals.map(goal => (
          <div key={goal.id} className="bg-bg-panel p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              {editingId === goal.id ? (
                <div className="flex-1 flex gap-2 mr-4">
                  <input
                    type="text"
                    value={editGoalText}
                    onChange={(e) => setEditGoalText(e.target.value)}
                    className="flex-1 bg-bg-base border border-border rounded-xl px-4 py-2 text-text-base focus:outline-none focus:border-brand transition-colors"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(goal.id)}
                  />
                  <button onClick={() => saveEdit(goal.id)} className="text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 p-2 rounded-xl transition-colors">
                    <Check size={18} />
                  </button>
                  <button onClick={cancelEdit} className="text-text-muted hover:bg-bg-base p-2 rounded-xl transition-colors">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-text-base text-lg">{goal.text}</h3>
                  <div className="flex items-center gap-2 relative z-10">
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); startEdit(goal); }}
                      className="text-text-muted hover:text-brand transition-all p-3 -m-1 rounded-full hover:bg-bg-base"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        api.deleteGoal(goal.id);
                      }}
                      className="text-text-muted hover:text-red-500 transition-all p-3 -m-1 rounded-full hover:bg-bg-base"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-text-muted">
                <span>진행률</span>
                <span className="font-medium text-accent-orange">{goal.progress}%</span>
              </div>
              <div className="h-3 bg-bg-base rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent-orange transition-all duration-500 ease-out"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <div className="pt-2 flex justify-between gap-1">
                {[0, 25, 50, 75, 100].map(val => (
                  <button
                    key={val}
                    onClick={() => updateProgress(goal.id, val)}
                    className="flex-1 text-xs py-1 rounded-md text-text-muted hover:bg-bg-base transition-colors hover:text-text-base"
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {goals.length === 0 && (
          <div className="p-12 text-center text-text-muted border border-dashed border-border rounded-2xl">
            등록된 목표가 없습니다. 올해의 다짐을 적어보세요.
          </div>
        )}
      </div>
    </div>
  );
}
