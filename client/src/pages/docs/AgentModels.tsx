import { useState } from "react";
import { Input } from "@/components/ui";
import { CompactAgentCard } from "@/components/docs/CompactAgentCard";
import { AgentDialog } from "@/components/docs/AgentDialog";
import { Search, Filter } from "lucide-react";
import { buddhistAgents, type BuddhistAgent, type BuddhistVehicle, vehicleInfo } from "@/shared/buddhistAgents";
import { useOutletContext } from "react-router-dom";

const translations = {
  vi: {
    title: "Khám phá Agent của bạn",
    subtitle: "Khám phá các AI agent Phật giáo từ các chùa và trung tâm tu học thuộc nhiều truyền thống khác nhau. Mỗi agent được thiết kế cẩn thận với các chỉ dẫn hệ thống và phương pháp cụ thể.",
    searchPlaceholder: "Tìm kiếm agent...",
    filterTitle: "Lọc Agent",
    vehicleTitle: "Phật Thừa",
    resultsFound: "{count} agent được tìm thấy",
    noResults: "Không tìm thấy agent nào",
    tryAdjusting: "Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn"
  },
  en: {
    title: "Discover Your Agent",
    subtitle: "Explore Buddhist AI agents from monasteries and centers across traditions. Each agent is carefully designed with specific system prompts and methodologies.",
    searchPlaceholder: "Search agents...",
    filterTitle: "Filter Agents",
    vehicleTitle: "Buddhist Vehicle",
    resultsFound: "{count} agent(s) found",
    noResults: "No agents found",
    tryAdjusting: "Try adjusting your search or filters"
  }
};

export default function AgentModels() {
  const { language } = useOutletContext<{ language: 'vi' | 'en' }>();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicles, setSelectedVehicles] = useState<Set<BuddhistVehicle>>(new Set());
  const [selectedAgent, setSelectedAgent] = useState<BuddhistAgent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredAgents = buddhistAgents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.monastery && agent.monastery.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesVehicle = selectedVehicles.size === 0 || selectedVehicles.has(agent.vehicle);
    
    return matchesSearch && matchesVehicle;
  });

  const handleViewDetails = (agent: BuddhistAgent) => {
    setSelectedAgent(agent);
    setDialogOpen(true);
  };

  const toggleVehicle = (vehicle: BuddhistVehicle) => {
    setSelectedVehicles(prev => {
      const next = new Set(prev);
      if (next.has(vehicle)) {
        next.delete(vehicle);
      } else {
        next.add(vehicle);
      }
      return next;
    });
  };

  // Dynamically generate vehicle options from the imported vehicleInfo object keys
  const vehicleOptions = Object.keys(vehicleInfo) as BuddhistVehicle[];

  return (
    <div className="min-h-screen  font-sans">
      {/* Header Section */}
      <div className="text-center pt-16 pb-12 px-4 sm:px-8 max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-[#4B3226]" data-testid="heading-agent-models">
          {t.title}
        </h1>
        <p className="text-lg text-[#8c7b75] leading-relaxed max-w-2xl mx-auto">
          {t.subtitle}
        </p>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mt-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
          <Input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-12 py-6 rounded-full border-[#e6dec8] bg-white shadow-sm text-lg focus:ring-[#991b1b] focus:border-[#991b1b] transition-all hover:shadow-md placeholder:text-[#d1d5db]"
            data-testid="input-search-agents"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pb-20">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
            <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#e6dec8]">
                    <Filter className="w-4 h-4 text-[#991b1b]" />
                    <h3 className="text-lg font-bold text-[#4B3226]">{t.filterTitle}</h3>
                </div>
                
                <div className="space-y-4">
                    <p className="text-xs font-bold text-[#8c7b75] uppercase tracking-wider mb-2">{t.vehicleTitle}</p>
                    <div className="space-y-2">
                        {vehicleOptions.map(vehicleKey => {
                            const info = vehicleInfo[vehicleKey];
                            const isSelected = selectedVehicles.has(vehicleKey);
                            const displayVehicleName = (language === 'en' && info.nameEn) ? info.nameEn : info.name;

                            return (
                                <button
                                    key={vehicleKey}
                                    onClick={() => toggleVehicle(vehicleKey)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left group ${isSelected ? 'bg-white shadow-sm border border-[#e6dec8]' : 'hover:bg-[#f4efe6]'}`}
                                >
                                    <div 
                                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'border-transparent' : 'border-[#d1d5db] bg-white'}`}
                                        style={{ backgroundColor: isSelected ? info.color : undefined }}
                                    >
                                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                    </div>
                                    <span className={`text-sm ${isSelected ? 'text-[#4B3226] font-semibold' : 'text-[#5d4a3a] group-hover:text-[#4B3226]'}`}>
                                        {displayVehicleName}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
          </aside>

          {/* Grid Results */}
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-baseline border-b border-[#e6dec8] pb-2">
               <span className="text-sm text-[#8c7b75] italic">
                {t.resultsFound.replace('{count}', String(filteredAgents.length))}
              </span>
            </div>

            {filteredAgents.length === 0 ? (
              <div className="text-center py-20 bg-[#f9f6ee] rounded-2xl border border-dashed border-[#dcd5bc]">
                <p className="text-xl text-[#8c7b75] italic mb-2">{t.noResults}</p>
                <p className="text-sm text-[#9ca3af]">{t.tryAdjusting}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredAgents.map((agent) => (
                  <CompactAgentCard
                    key={agent.id}
                    agent={agent}
                    onClick={handleViewDetails}
                    language={language}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AgentDialog
        agent={selectedAgent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        language={language}
      />
    </div>
  );
}
