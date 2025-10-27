import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types';

interface ContextMenuProps {
    message: Message;
    position: { x: number, y: number };
    onClose: () => void;
    onCopy: (text: string) => void;
    onDeleteForMe: (messageId: string | number) => void;
    language: 'vi' | 'en';
}

const translations = {
    vi: {
        copy: 'Sao chép',
        deleteForMe: 'Xóa tin nhắn',
    },
    en: {
        copy: 'Copy',
        deleteForMe: 'Delete message',
    }
};

const MessageContextMenu: React.FC<ContextMenuProps> = (props) => {
    const { message, position, onClose, onCopy, onDeleteForMe, language } = props;
    const t = translations[language];
    const menuRef = useRef<HTMLDivElement>(null);
    const [adjustedPosition, setAdjustedPosition] = useState({ top: position.y, left: position.x, opacity: 0 });


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    useEffect(() => {
        if (menuRef.current) {
            const menuRect = menuRef.current.getBoundingClientRect();
            const { innerWidth, innerHeight } = window;

            let newTop = position.y;
            let newLeft = position.x;

            if (newLeft + menuRect.width > innerWidth) {
                newLeft = position.x - menuRect.width;
            }

            if (newTop + menuRect.height > innerHeight) {
                newTop = position.y - menuRect.height;
            }

            if (newTop < 0) newTop = 5;
            if (newLeft < 0) newLeft = 5;
            
            setAdjustedPosition({ top: newTop, left: newLeft, opacity: 1 });
        }
    }, [position.x, position.y]);


    const menuStyle: React.CSSProperties = {
        position: 'fixed',
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
        opacity: adjustedPosition.opacity,
        transition: 'opacity 0.05s ease-in-out',
        zIndex: 1000,
    };

    const MenuItem: React.FC<{ onClick: () => void, children: React.ReactNode, className?: string }> = ({ onClick, children, className }) => (
        <button
            onClick={() => { onClick(); onClose(); }}
            className={`w-full text-left px-4 py-2 text-sm text-text-main hover:bg-background-light ${className}`}
        >
            {children}
        </button>
    );

    return (
        <div ref={menuRef} style={menuStyle} className="bg-background-panel rounded-md shadow-xl w-48 py-1 border border-border-color">
            <MenuItem onClick={() => onCopy(message.text)}>{t.copy}</MenuItem>
            <div className="my-1 border-t border-border-color" />
            <MenuItem onClick={() => onDeleteForMe(message.id!)} className="text-accent-red">{t.deleteForMe}</MenuItem>
        </div>
    );
};

export default MessageContextMenu;