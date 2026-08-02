import React, { useState } from 'react';
import { BucketListEntry } from '../../types';
import { api } from '../../lib/api';
import { getBase64 } from '../../lib/utils';
import { Plus, Trash2, Image as ImageIcon, CheckCircle2, Circle, Edit2 } from 'lucide-react';
import { Modal } from '../ui/Modal';

export function BucketListTab({ items }: { items: BucketListEntry[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<BucketListEntry>>({});

  const handleSave = async () => {
    if (!editingItem.title) return;
    
    if (editingItem.id) {
      await api.updateBucketList(editingItem.id, {
        title: editingItem.title,
        image: editingItem.image,
      });
    } else {
      await api.addBucketList(Date.now().toString(), { 
        title: editingItem.title, 
        image: editingItem.image, 
        completed: false 
      });
    }
    setEditingItem({});
    setIsModalOpen(false);
  };

  const openEditModal = (item: BucketListEntry) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingItem({});
    setIsModalOpen(true);
  };

  const toggleComplete = async (item: BucketListEntry) => {
    await api.updateBucketList(item.id, { completed: !item.completed });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await getBase64(e.target.files[0]);
      setEditingItem(prev => ({ ...prev, image: base64 }));
    }
  };

  const handleDelete = async (id: string) => {
    await api.deleteBucketList(id);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-end mb-6 text-sm text-text-muted">
        <span>총 {items.length}개의 버킷리스트</span>
        <button 
          onClick={openNewModal}
          className="flex items-center gap-1 hover:text-brand transition-colors font-medium"
        >
          <Plus size={16} /> 추가하기
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div 
            key={item.id} 
            className="group bg-bg-panel border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative"
          >
            <div className="h-48 bg-bg-base relative overflow-hidden flex items-center justify-center text-text-muted">
              {item.image ? (
                <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <ImageIcon size={32} className="opacity-20" />
              )}
              {item.completed && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-bg-panel text-accent-blue px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                    <CheckCircle2 size={18} className="fill-accent-blue text-bg-panel" /> 달성 완료
                  </div>
                </div>
              )}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                  className="bg-bg-panel/80 backdrop-blur-sm p-2 rounded-full text-text-base hover:text-brand transition-colors shadow-sm"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  className="bg-bg-panel/80 backdrop-blur-sm p-2 rounded-full text-text-base hover:text-red-500 transition-colors shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-5 flex justify-between items-start gap-4">
              <h3 className="font-medium text-text-base leading-snug">{item.title}</h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleComplete(item)} className="text-border hover:text-brand transition-colors mt-0.5">
                  {item.completed ? <CheckCircle2 className="fill-brand text-bg-panel" /> : <Circle />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="p-16 text-center text-text-muted border border-dashed border-border rounded-2xl">
          버킷리스트가 없습니다. 죽기 전에 꼭 해보고 싶은 것을 적어보세요.
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem.id ? "버킷리스트 수정" : "새 버킷리스트"}>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="무엇을 해보고 싶나요?"
            value={editingItem.title || ''}
            onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
            className="w-full p-4 bg-bg-base border border-border rounded-xl text-text-base text-lg font-medium focus:outline-none focus:border-brand"
          />
          
          {editingItem.image ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border group">
              <img src={editingItem.image} alt="preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => setEditingItem({...editingItem, image: undefined})}
                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                이미지 삭제
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-brand hover:bg-bg-base transition-colors text-text-muted">
              <ImageIcon size={32} className="mb-2 opacity-50" />
              <span>영감이나 목표가 되는 이미지 첨부 (선택)</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm text-text-muted hover:bg-bg-base rounded-xl transition-colors">
              취소
            </button>
            <button onClick={handleSave} className="px-6 py-2.5 text-sm font-medium bg-brand text-bg-panel rounded-xl hover:bg-brand-hover transition-colors">
              저장
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
