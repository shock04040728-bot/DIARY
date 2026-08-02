import React, { useState } from 'react';
import { TimetableEntry } from '../../types';
import { api } from '../../lib/api';
import { Plus, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { getBase64 } from '../../lib/utils';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const PERIODS = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시', '8교시', '9교시'];

export function TimetableTab({ timetables }: { timetables: TimetableEntry[] }) {
  const [selectedCell, setSelectedCell] = useState<{day: string, period: string} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<TimetableEntry>>({});

  const handleCellClick = (day: string, period: string) => {
    const existing = timetables.find(t => t.day === day && t.period === period);
    if (existing) {
      setEditingEntry(existing);
    } else {
      setEditingEntry({ day, period, subject: '', time: '' });
    }
    setSelectedCell({ day, period });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingEntry.subject || !editingEntry.day || !editingEntry.period) return;
    const id = editingEntry.id || Date.now().toString();
    await api.setTimetable(id, editingEntry);
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (editingEntry.id) {
      await api.deleteTimetable(editingEntry.id);
      setIsModalOpen(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await getBase64(e.target.files[0]);
      setEditingEntry(prev => ({ ...prev, image: base64 }));
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[700px] bg-bg-panel border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-center border-collapse">
            <thead>
              <tr className="bg-bg-base border-b border-border text-text-muted">
                <th className="p-3 w-16 font-medium"></th>
                {DAYS.map(day => (
                  <th key={day} className="p-3 font-medium border-l border-border">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(period => (
                <tr key={period} className="border-b border-border last:border-0">
                  <td className="p-3 bg-bg-base text-text-muted text-xs whitespace-nowrap font-medium border-r border-border">
                    {period}
                  </td>
                  {DAYS.map(day => {
                    const entry = timetables.find(t => t.day === day && t.period === period);
                    return (
                      <td 
                        key={`${day}-${period}`}
                        onClick={() => handleCellClick(day, period)}
                        className="p-2 border-r border-border last:border-0 w-[12%] h-24 relative hover:bg-bg-base transition-colors cursor-pointer group"
                      >
                        {entry ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-1 rounded-xl bg-bg-base overflow-hidden relative">
                            {entry.image && (
                              <div className="absolute inset-0 opacity-20 group-hover:opacity-10 transition-opacity">
                                <img src={entry.image} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="relative z-10 font-bold text-text-base mb-1 truncate w-full px-1">{entry.subject}</div>
                            <div className="relative z-10 text-xs text-text-muted truncate w-full px-1">{entry.time}</div>
                          </div>
                        ) : (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center h-full text-text-muted">
                            <Plus size={16} />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${selectedCell?.day}요일 ${selectedCell?.period}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">과목/일정명</label>
            <input 
              type="text"
              value={editingEntry.subject || ''}
              onChange={(e) => setEditingEntry({...editingEntry, subject: e.target.value})}
              className="w-full p-3 bg-bg-base border border-border rounded-xl text-text-base focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">시간 (예: 09:00~10:00)</label>
            <input 
              type="text"
              value={editingEntry.time || ''}
              onChange={(e) => setEditingEntry({...editingEntry, time: e.target.value})}
              className="w-full p-3 bg-bg-base border border-border rounded-xl text-text-base focus:outline-none focus:border-brand"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">이미지 (선택)</label>
            {editingEntry.image ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-border group">
                <img src={editingEntry.image} alt="preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setEditingEntry({...editingEntry, image: undefined})}
                  className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  삭제
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-brand hover:bg-bg-base transition-colors text-text-muted">
                <span className="flex items-center gap-2"><ImageIcon size={18} /> 이미지 첨부</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          <div className="flex justify-between pt-6">
            {editingEntry.id ? (
              <button onClick={handleDelete} className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                삭제
              </button>
            ) : <div></div>}
            
            <div className="flex gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-text-muted hover:bg-bg-base rounded-xl transition-colors">
                취소
              </button>
              <button onClick={handleSave} className="px-6 py-2.5 text-sm font-medium bg-brand text-bg-panel rounded-xl hover:bg-brand-hover transition-colors">
                저장
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
