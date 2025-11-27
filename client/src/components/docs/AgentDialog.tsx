import React from 'react';
import { type BuddhistAgent, vehicleInfo } from "@/shared/buddhistAgents";
import { X, Copy, Check } from 'lucide-react';

interface AgentDialogProps {
  agent: BuddhistAgent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: 'vi' | 'en';
}

const translations = {
  vi: {
    purpose: "Mục đích (Purpose)",
    monastery: "Nguồn gốc (Monastery)",
    model: "Mô hình (Model)",
    system: "System Prompt",
    unknown: "Không xác định",
    copy: "Sao chép",
    copied: "Đã sao chép"
  },
  en: {
    purpose: "Purpose",
    monastery: "Monastery",
    model: "Model",
    system: "System Prompt",
    unknown: "Unknown",
    copy: "Copy",
    copied: "Copied"
  }
};

export const AgentDialog: React.FC<AgentDialogProps> = ({ agent, open, onOpenChange, language }) => {
  const [copied, setCopied] = React.useState(false);
  const t = translations[language];

  if (!open || !agent) return null;

  const vehicle = vehicleInfo[agent.vehicle];
  const vehicleName = (language === 'en' && vehicle.nameEn) ? vehicle.nameEn : vehicle.name;

  const handleCopy = () => {
    navigator.clipboard.writeText(agent.system);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex  justify-center bg-[#2c2c2c]/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="bg-[#fdfbf7] rounded-2xl shadow-2xl flex flex-col border border-[#e6dec8] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-[#e6dec8] flex justify-between items-start bg-[#f9f6ee]">
          <div className="space-y-3 pr-8">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className=" text-3xl font-bold text-[#4B3226]">{agent.name}</h2>
              <span 
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm" 
                style={{ backgroundColor: vehicle.color }}
              >
                {vehicleName}
              </span>
            </div>
            <p className=" text-lg italic text-[#8c7b75]">{agent.tagline}</p>
          </div>
          <button 
            onClick={() => onOpenChange(false)} 
            className="p-2 -mt-2 -mr-2 text-[#8c7b75] hover:text-[#991b1b] hover:bg-[#e6dec8]/50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar bg-[#fdfbf7]">
          {/* Purpose Section */}
          <div className="space-y-3">
            <h4 className=" text-xl font-bold text-[#4B3226] flex items-center gap-2">
              <span className="w-1 h-6 bg-[#991b1b] rounded-full"></span>
              {t.purpose}
            </h4>
            <p className="text-[#5d4a3a] leading-relaxed text-base pl-3 border-l-2 border-[#e6dec8]">
              {agent.purpose}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-[#f4efe6] p-4 rounded-xl border border-[#e6dec8]">
                <span className="block text-xs font-bold text-[#8c7b75] uppercase tracking-wide mb-1">{t.monastery}</span>
                <span className=" text-[#4B3226] font-semibold">{agent.monastery || t.unknown}</span>
             </div>
             <div className="bg-[#f4efe6] p-4 rounded-xl border border-[#e6dec8]">
                <span className="block text-xs font-bold text-[#8c7b75] uppercase tracking-wide mb-1">{t.model}</span>
                <span className="font-mono text-sm text-[#4B3226] bg-white/50 px-2 py-0.5 rounded border border-[#dcd5bc]">{agent.model}</span>
             </div>
          </div>

          {/* System Prompt Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className=" text-xl font-bold text-[#4B3226] flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#991b1b] rounded-full"></span>
                    {t.system}
                </h4>
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#8c7b75] hover:text-[#991b1b] transition-colors px-3 py-1.5 rounded-lg border border-[#e6dec8] hover:bg-[#f4efe6]"
                >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? t.copied : t.copy}
                </button>
            </div>
            <div className="bg-[#2c2c2c] text-[#e5e5e5] p-5 rounded-xl font-mono text-sm leading-loose overflow-x-auto shadow-inner border border-[#4a4a4a]">
              <code className="whitespace-pre-wrap break-words">{agent.system}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
