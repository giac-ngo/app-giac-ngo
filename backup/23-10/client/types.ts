// client/types.ts

export interface Message {
  id?: string | number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
  imageUrl?: string;
}

export type ModelType = 'gemini' | 'gpt' | 'grok';

export interface AIConfig {
  id: string | number;
  name: string;
  description?: string;
  avatarUrl?: string;
  modelType: ModelType;
  modelName: string;
  trainingContent: string;
  suggestedQuestions: string[];
  tags: string[];
  isPublic: boolean;
  ownerId: number;
  isTrialAllowed: boolean;
  requiresSubscription: boolean;
}

export interface User {
  id: number | 'new';
  email: string;
  name:string;
  avatarUrl: string;
  isAdmin: boolean;
  isActive: boolean;
  coins: number | null; // null for unlimited
  apiToken?: string;
  apiKeys?: {
    gemini?: string;
    gpt?: string;
    grok?: string;
  };
  subscriptionPlanId?: number | string | null;
  subscriptionExpiresAt?: string | null;
  roleIds?: number[];
  permissions?: string[];
}

export interface Role {
    id: number | 'new';
    name: string;
    permissions: string[];
}

export interface Transaction {
    id: number;
    userId: number;
    userName?: string;
    adminId: number;
    adminName?: string;
    coins: number;
    timestamp: number;
    type: 'manual' | 'payment' | 'daily' | 'subscription' | 'crypto';
}

export type TemplateName = 'w5g' | 'giacngo';

export interface SystemConfig {
    guestMessageLimit: number;
    systemKeys: {
// FIX: Made properties optional to align with usage and fix type error.
        gemini?: string;
        gpt?: string;
        grok?: string;
    };
    template: TemplateName;
    templateSettings: {
        [key in TemplateName]: {
            logoUrl: string;
        }
    };
}

export interface Conversation {
    id: number;
    userId: number | null; // null for guest
    userName: string;
    aiConfigId: string | number;
    aiName?: string;
    startTime: number;
    messages: Message[];
}

export interface PricingPlan {
    id: number | string;
    planName: string;
    price: string;
    coinCost: number;
    durationDays: number | null; // null for enterprise/unlimited
    features: string[];
    isActive: boolean;
}

export interface DashboardStats {
    totalUsers: number;
    totalAiConfigs: number;
    totalConversations: number;
    interactingUsers: number;
    topAIs: {
        name: string;
        avatarUrl: string;
        conversationCount: string;
    }[];
    recentConversations: {
        id: number;
        userName: string;
        aiName: string;
        startTime: number;
    }[];
}

// ADD: Interface for Training Data Sources
export interface TrainingDataSource {
    id: number | 'new';
    aiConfigId: number | string;
    type: 'qa' | 'file';
    question?: string;
    answer?: string;
    fileUrl?: string;
    fileName?: string;
    description?: string;
    createdAt?: string;
    isTrained?: boolean;
}

export interface FineTuningJob {
    id: string;
    status: 'VALIDATING_FILES' | 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
    fineTunedModelId?: string;
    createdAt: string;
}
