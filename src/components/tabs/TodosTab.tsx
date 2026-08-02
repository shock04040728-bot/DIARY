import React, { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Trash2, Plus } from 'lucide-react';
import { TodoEntry } from '../../types';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

export function TodosTab({ todos }: { todos: TodoEntry[] }) {
  const [newTodo, setNewTodo] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const id = Date.now().toString();
    await api.addTodo(id, { text: newTodo, date: selectedDate, completed: false });
    setNewTodo('');
  };

  const toggleTodo = async (todo: TodoEntry) => {
    await api.updateTodo(todo.id, { completed: !todo.completed });
  };

  const deleteTodo = async (id: string) => {
    await api.deleteTodo(id);
  };

  const filteredTodos = todos.filter(t => t.date === selectedDate);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center bg-bg-panel p-2 rounded-2xl border border-border shadow-sm">
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-transparent border-none outline-none text-text-base p-2 font-medium"
        />
        <div className="text-sm text-text-muted pr-4">
          총 {filteredTodos.length}개 / {filteredTodos.filter(t => t.completed).length}개 완료
        </div>
      </div>

      <div className="bg-bg-panel border border-border rounded-2xl overflow-hidden shadow-sm">
        <ul className="divide-y divide-border">
          {filteredTodos.map(todo => (
            <li key={todo.id} className="flex items-center gap-3 p-4 group hover:bg-bg-base transition-colors">
              <button onClick={() => toggleTodo(todo)} className="text-brand flex-shrink-0">
                {todo.completed ? <CheckCircle2 className="fill-brand text-bg-panel" /> : <Circle className="text-border hover:text-brand transition-colors" />}
              </button>
              <span className={cn("flex-1 text-text-base transition-all", todo.completed && "text-text-muted line-through")}>
                {todo.text}
              </span>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTodo(todo.id);
                }}
                className="text-text-muted hover:text-red-500 transition-all p-2 rounded-full hover:bg-bg-panel flex-shrink-0"
                title="삭제"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
          {filteredTodos.length === 0 && (
            <li className="p-8 text-center text-text-muted text-sm">이 날짜의 할 일이 없습니다.</li>
          )}
        </ul>
        <form onSubmit={handleAdd} className="border-t border-border p-4 flex gap-2">
          <input 
            type="text" 
            placeholder="새로운 할 일 추가..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="flex-1 bg-bg-base border border-border rounded-xl px-4 py-2.5 text-sm text-text-base focus:outline-none focus:border-brand transition-colors"
          />
          <button 
            type="submit"
            disabled={!newTodo.trim()}
            className="bg-brand text-bg-panel p-2.5 rounded-xl disabled:opacity-50 transition-opacity hover:bg-brand-hover shadow-sm"
          >
            <Plus size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
