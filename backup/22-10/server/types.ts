// server/types.ts

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
  id: number;
  email: string;
  name: string;
  avatarUrl: string;
  isAdmin: boolean;
  isActive: boolean;
  coins: number | null; // null for unlimited
  // FIX: Add apiToken to user type for personal access tokens
  apiToken?: string;
  apiKeys?: {
    gemini?: string;
    gpt?: string;
    grok?: string;
  };
  subscriptionPlanId?: number | null;
  subscriptionExpiresAt?: string | null;
  // ADD: Fields for RBAC
  roleIds?: number[];
  permissions?: string[];
}

export interface Role {
    id: number;
    name: string;
    permissions: string[];
}

export interface Transaction {
    id: number;
    userId: number;
    adminId: number;
    coins: number;
    timestamp: number;
    type: 'manual' | 'payment' | 'daily' | 'subscription' | 'crypto';
}

export type TemplateName = 'w5g' | 'giacngo';

export interface SystemConfig {
    guestMessageLimit: number;
    systemKeys: {
        gemini: string;
        gpt: string;
        grok: string;
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

// ADD: Interface for Training Data Sources on the server
export interface TrainingDataSource {
    id: number;
    aiConfigId: number;
    type: 'qa' | 'file';
    question?: string;
    answer?: string;
    fileUrl?: string;
    fileName?: string;
    description?: string;
    createdAt: string;
    isTrained?: boolean;
}
