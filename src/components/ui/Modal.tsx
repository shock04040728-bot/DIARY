import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Modal({ isOpen, onClose, children, title, className }: ModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show && !isOpen) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        "bg-black/30 backdrop-blur-sm"
      )}
      onClick={onClose}
    >
      <div 
        className={cn(
          "bg-bg-panel border border-border w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden transition-all duration-300",
          isOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-text-base">{title}</h2>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-base transition-colors p-2 rounded-full hover:bg-bg-base"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
