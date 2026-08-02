import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Image as ImageIcon, Trash2, ArrowUpDown } from 'lucide-react';
import { DiaryEntry } from '../../types';
import { api } from '../../lib/api';
import { getBase64, cn } from '../../lib/utils';
import { Modal } from '../ui/Modal';

export function DiaryTab({ diaries, triggerNewPost }: { diaries: DiaryEntry[], triggerNewPost?: number }) {
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<DiaryEntry>>({});
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const handleSave = async () => {
    const title = editingEntry.title?.trim();
    const content = editingEntry.content?.trim();
    const date = editingEntry.date || format(new Date(), 'yyyy-MM-dd');
    
    if (!title || !content) return;
    
    const dataToSave = { ...editingEntry, title, content, date };
    
    if (editingEntry.id) {
      await api.updateDiary(editingEntry.id, dataToSave);
    } else {
      const id = Date.now().toString();
      await api.addDiary(id, dataToSave);
    }
    setIsEditModalOpen(false);
    setSelectedEntry(null);
  };

  const handleDelete = async (id: string) => {
    await api.deleteDiary(id);
    setIsEditModalOpen(false);
    setSelectedEntry(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const base64s = await Promise.all(files.map(f => getBase64(f)));
      setEditingEntry(prev => ({ ...prev, images: [...(prev.images || []), ...base64s] }));
    }
  };

  useEffect(() => {
    if (triggerNewPost && triggerNewPost > 0) {
      setEditingEntry({});
      setIsEditModalOpen(true);
    }
  }, [triggerNewPost]);

  const sortedDiaries = useMemo(() => {
    return [...diaries].sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      if (timeA === timeB) {
        return sortOrder === 'desc' ? Number(b.id) - Number(a.id) : Number(a.id) - Number(b.id);
      }
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [diaries, sortOrder]);

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* List Header */}
      <div className="flex items-center px-4 py-2 border-b border-border text-[11px] font-bold text-text-muted tracking-wider">
        <span className="w-16">NO</span>
        <span className="flex-1">TITLE</span>
        <button 
          onClick={toggleSort}
          className="w-20 text-right flex items-center justify-end gap-1 hover:text-text-base transition-colors focus:outline-none"
        >
          DATE <ArrowUpDown size={12} className="opacity-70" />
        </button>
      </div>

      <div className="rounded-2xl">
        {sortedDiaries.length === 0 ? (
          <div className="py-12 text-center text-text-muted text-sm">기록이 없습니다.</div>
        ) : (
          <ul className="space-y-2">
            {sortedDiaries.map((entry, index) => {
              const itemNumber = sortOrder === 'desc' ? sortedDiaries.length - index : index + 1;
              return (
              <li 
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="group flex items-center px-4 py-4 cursor-pointer rounded-2xl hover:bg-white hover:shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 border border-transparent hover:border-border"
              >
                <span className="w-16 text-[12px] text-text-muted font-mono tracking-wider">
                  {String(itemNumber).padStart(3, '0')}
                </span>
                <span className="flex-1 text-[14px] font-medium text-text-base truncate pr-4 group-hover:text-brand transition-colors flex items-center gap-2">
                  {entry.title}
                  {entry.images && entry.images.length > 0 && (
                    <ImageIcon size={12} className="text-text-muted opacity-50" />
                  )}
                </span>
                <span className="w-20 text-right text-[12px] text-text-muted font-mono tracking-wider">
                  {format(new Date(entry.date), 'yy.MM.dd')}
                </span>
              </li>
            )})}
          </ul>
        )}
      </div>

      {/* View Modal */}
      <Modal 
        isOpen={!!selectedEntry && !isEditModalOpen} 
        onClose={() => setSelectedEntry(null)}
        title={selectedEntry?.title}
      >
        <div className="space-y-6">
          <div className="text-sm text-text-muted border-b border-border pb-4">
            {selectedEntry && format(new Date(selectedEntry.date), 'yyyy년 MM월 dd일')}
          </div>
          <div className="text-text-base whitespace-pre-wrap leading-relaxed">
            {selectedEntry?.content}
          </div>
          {selectedEntry?.images && selectedEntry.images.length > 0 && (
            <div className="space-y-4 mt-6">
              {selectedEntry.images.map((img, i) => (
                <img key={i} src={img} alt="diary attachment" className="w-full rounded-xl object-cover" />
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-6">
            <button 
              onClick={() => {
                setEditingEntry(selectedEntry!);
                setIsEditModalOpen(true);
              }}
              className="px-4 py-2 text-sm font-medium bg-bg-base text-text-base rounded-lg hover:bg-border transition-colors"
            >
              수정
            </button>
            <button 
              onClick={() => handleDelete(selectedEntry!.id)}
              className="px-4 py-2 text-sm font-medium text-red-500 bg-red-50/50 dark:bg-red-900/20 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
            >
              삭제
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit/Create Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingEntry({});
        }}
        title={editingEntry.id ? '일기 수정' : '새 일기'}
      >
        <div className="space-y-4">
          <input 
            type="date"
            value={editingEntry.date || format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => setEditingEntry({...editingEntry, date: e.target.value})}
            className="w-full p-3 bg-bg-base border border-border rounded-xl text-text-base focus:outline-none focus:border-brand transition-colors"
          />
          <input 
            type="text"
            placeholder="제목을 입력하세요"
            value={editingEntry.title || ''}
            onChange={(e) => setEditingEntry({...editingEntry, title: e.target.value})}
            className="w-full p-3 bg-bg-base border border-border rounded-xl text-text-base font-medium focus:outline-none focus:border-brand transition-colors"
          />
          <textarea 
            placeholder="내용을 입력하세요"
            value={editingEntry.content || ''}
            onChange={(e) => setEditingEntry({...editingEntry, content: e.target.value})}
            className="w-full p-3 bg-bg-base border border-border rounded-xl text-text-base min-h-[200px] resize-y focus:outline-none focus:border-brand transition-colors"
          />
          
          <div className="space-y-2">
            <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-brand hover:bg-bg-base transition-colors text-text-muted">
              <span className="flex items-center gap-2">
                <ImageIcon size={18} /> 이미지 첨부
              </span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </label>
            
            {editingEntry.images && editingEntry.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {editingEntry.images.map((img, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-border">
                    <img src={img} alt="preview" className="w-full h-24 object-cover" />
                    <button 
                      onClick={() => setEditingEntry({
                        ...editingEntry, 
                        images: editingEntry.images!.filter((_, index) => index !== i)
                      })}
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-6">
            <button 
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingEntry({});
              }}
              className="px-6 py-2.5 text-sm font-medium text-text-muted hover:text-text-base transition-colors"
            >
              취소
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 text-sm font-medium bg-brand text-bg-panel rounded-xl hover:bg-brand-hover transition-colors shadow-sm"
            >
              저장
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
