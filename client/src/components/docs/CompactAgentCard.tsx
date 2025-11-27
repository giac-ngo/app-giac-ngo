// client/src/components/docs/CompactAgentCard.tsx
import React from 'react';
import { Card, Badge } from "@/components/ui";
import { type BuddhistAgent, vehicleInfo } from "@/shared/buddhistAgents";
import { ArrowRight } from "lucide-react";

interface CompactAgentCardProps {
  agent: BuddhistAgent;
  onClick: (agent: BuddhistAgent) => void;
  language: 'vi' | 'en';
}

export const CompactAgentCard: React.FC<CompactAgentCardProps> = ({ agent, onClick, language }) => {
  const vehicle = vehicleInfo[agent.vehicle];
  const vehicleName = (language === 'en' && vehicle.nameEn) ? vehicle.nameEn : vehicle.name;

  return (
    <Card 
      className="p-6 space-y-4 cursor-pointer group hover-elevate transition-all bg-[#e8d6a4]"
      onClick={() => onClick(agent)}
      data-testid={`agent-card-${agent.id}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold ">{agent.name}</h3>
        <Badge style={{ backgroundColor: vehicle.color, color: 'white', border: `1px solid ${vehicle.color}` }}>
          {vehicleName}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground h-10">{agent.tagline}<br></br>{agent.purpose}</p>  <br></br>    
      <div className="flex items-center justify-between text-xs">
        <span className="bg-muted/50 px-2 py-1 rounded">{agent.model}</span>
        <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
          <span>{language === 'vi' ? 'Xem chi tiết' : 'View Details'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Card>
  );
};
