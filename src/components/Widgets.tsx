import React from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Circle } from 'lucide-react';
import { TimetableEntry, TodoEntry, GoalEntry, BucketListEntry } from '../types';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export function Widgets({ 
  timetables, 
  todos, 
  goals, 
  bucketList 
}: { 
  timetables: TimetableEntry[], 
  todos: TodoEntry[], 
  goals: GoalEntry[],
  bucketList: BucketListEntry[]
}) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayTodos = todos.filter(t => t.date === todayStr);
  const coreGoal = goals.length > 0 ? goals[0] : null;

  // Find next schedule
  const now = new Date();
  const currentDayStr = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];
  const currentTimeMin = now.getHours() * 60 + now.getMinutes();

  const PERIOD_ORDER: Record<string, number> = {
    '1교시': 1, '2교시': 2, '3교시': 3, '4교시': 4, '5교시': 5, 
    '6교시': 6, '7교시': 7, '8교시': 8, '9교시': 9
  };

  const parseTime = (timeStr?: string): { start: number | null; end: number | null } => {
    if (!timeStr) return { start: null, end: null };
    const matches = timeStr.match(/(\d{1,2}):(\d{2})/g);
    if (matches && matches.length >= 1) {
      const [h1, m1] = matches[0].split(':').map(Number);
      const start = h1 * 60 + m1;
      let end: number | null = null;
      if (matches.length >= 2) {
        const [h2, m2] = matches[1].split(':').map(Number);
        end = h2 * 60 + m2;
      }
      return { start, end };
    }
    return { start: null, end: null };
  };

  let nextSchedule: TimetableEntry | null = null;
  let scheduleLabel = "다음 일정";
  const todaysSchedules = timetables.filter(t => t.day === currentDayStr);

  if (todaysSchedules.length > 0) {
    // Sort schedules by start time or period
    const sorted = [...todaysSchedules].sort((a, b) => {
      const { start: startA } = parseTime(a.time);
      const { start: startB } = parseTime(b.time);
      if (startA !== null && startB !== null) return startA - startB;
      const pA = PERIOD_ORDER[a.period] || 99;
      const pB = PERIOD_ORDER[b.period] || 99;
      return pA - pB;
    });

    // 1. Look for currently ongoing schedule
    const ongoing = sorted.find(t => {
      const { start, end } = parseTime(t.time);
      if (start !== null && end !== null) {
        return currentTimeMin >= start && currentTimeMin < end;
      }
      return false;
    });

    if (ongoing) {
      nextSchedule = ongoing;
      scheduleLabel = "현재 진행 중 일정";
    } else {
      // 2. Look for upcoming schedule today
      const upcoming = sorted.find(t => {
        const { start } = parseTime(t.time);
        if (start !== null) {
          return start > currentTimeMin;
        }
        return false;
      });

      if (upcoming) {
        nextSchedule = upcoming;
        scheduleLabel = "다음 일정";
      } else {
        // 3. Fallback: If no future schedule with time is found today, show the first/next schedule or the day's items
        nextSchedule = sorted[0];
        scheduleLabel = "오늘의 일정";
      }
    }
  }

  const toggleTodo = async (todo: TodoEntry) => {
    await api.updateTodo(todo.id, { completed: !todo.completed });
  };

  return (
    <div className="space-y-6">
      
      {/* Next Schedule */}
      <div className="bg-bg-panel p-5 rounded-2xl shadow-sm border border-border transition-shadow hover:shadow-md">
        <h3 className="text-[11px] font-bold text-text-muted mb-3 tracking-widest uppercase">
          {scheduleLabel}
        </h3>
        {nextSchedule ? (
          <div className="pl-3 border-l-2 border-brand py-1">
            <div className="font-bold text-[14px] text-text-base mb-1">{nextSchedule.subject}</div>
            <div className="text-[12px] text-text-muted font-mono">{nextSchedule.time || `${nextSchedule.period} 일정`}</div>
          </div>
        ) : (
          <div className="text-sm text-text-muted pl-3 border-l-2 border-border py-1">오늘 예정된 일정이 없습니다.</div>
        )}
      </div>

      {/* Today's Todos */}
      <div className="bg-bg-panel p-5 rounded-2xl shadow-sm border border-border transition-shadow hover:shadow-md">
        <h3 className="text-[11px] font-bold text-text-muted mb-3 tracking-widest uppercase">
          TO-DO
        </h3>
        <ul className="space-y-3">
          {todayTodos.slice(0, 4).map(todo => (
            <li key={todo.id} className="flex items-start gap-2 text-sm group">
              <button onClick={() => toggleTodo(todo)} className="text-brand flex-shrink-0 mt-[2px]">
                {todo.completed ? <CheckCircle2 size={16} className="fill-brand text-bg-panel" /> : <Circle size={16} className="text-border group-hover:text-brand transition-colors" />}
              </button>
              <span className={cn("leading-snug transition-all", todo.completed ? "text-text-muted line-through" : "text-text-base")}>
                {todo.text}
              </span>
            </li>
          ))}
          {todayTodos.length === 0 && (
            <li className="text-sm text-text-muted">할 일이 없습니다.</li>
          )}
        </ul>
      </div>

      {/* Core Goal */}
      <div className="bg-bg-panel p-5 rounded-2xl shadow-sm border border-border transition-shadow hover:shadow-md">
        <h3 className="text-[11px] font-bold text-text-muted mb-3 tracking-widest uppercase">
          올해의 목표
        </h3>
        {coreGoal ? (
          <div>
            <div className="flex justify-between items-end mb-2">
              <div className="font-bold text-[14px] text-text-base">{coreGoal.text}</div>
              <div className="text-[11px] font-mono text-text-muted">{coreGoal.progress} / 100</div>
            </div>
            <div className="h-[4px] bg-bg-base rounded-full overflow-hidden w-full">
              <div 
                className="h-full bg-brand transition-all duration-500 ease-out rounded-full"
                style={{ width: `${coreGoal.progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-sm text-text-muted">등록된 목표가 없습니다.</div>
        )}
      </div>

    </div>
  );
}
