

// src/types/subscription.ts

// Define string literal types as fallback if Prisma types aren't generated yet
export type SubscriptionPlan = 'FREE' | 'PROFESSIONAL' | 'ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL';
export type BillingCycle = 'MONTHLY' | 'ANNUALLY';
export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'NONE';
export type InvoiceStatus = 'PAID' | 'PENDING' | 'FAILED';

// Try to import from Prisma, but fallback to our definitions
// import type { 
//   SubscriptionPlan as PrismaSubscriptionPlan,
//   SubscriptionStatus as PrismaSubscriptionStatus,
//   BillingCycle as PrismaBillingCycle,
//   PaymentMethod as PrismaPaymentMethod,
//   InvoiceStatus as PrismaInvoiceStatus
// } from '@prisma/client';

// Subscription interface
export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  startDate: Date | string;
  endDate: Date | string;
  trialEndDate?: Date | string | null;
  autoRenew: boolean;
  paymentMethod?: PaymentMethod | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Optional relations
  invoices?: Invoice[];
}

export interface PlanFeatures {
  maxCases: number | 'unlimited';
  maxDocuments: number | 'unlimited';
  aiAnalysesPerMonth: number | 'unlimited';
  storageGb: number | 'unlimited';
  prioritySupport: boolean;
  apiAccess: boolean;
  customBranding: boolean;
  multiUser: boolean;
  advancedReports: boolean;
}

export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnually: number;
  features: PlanFeatures;
  popular?: boolean;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  invoiceDate: Date | string;
  dueDate: Date | string;
  paidDate?: Date | string | null;
  paymentMethod?: PaymentMethod | null;
  invoiceUrl?: string | null;
  createdAt: Date | string;
  
  // Optional relation
  subscription?: Subscription;
}

export interface UsageStats {
  casesCount: number;
  documentsCount: number;
  storageUsedGb: number;
  aiAnalysesUsed: number;
  periodStart: Date | string;
  periodEnd: Date | string;
}

// Plan configuration constants
export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  FREE: {
    maxCases: 5,
    maxDocuments: 20,
    aiAnalysesPerMonth: 10,
    storageGb: 1,
    prioritySupport: false,
    apiAccess: false,
    customBranding: false,
    multiUser: false,
    advancedReports: false,
  },
  PROFESSIONAL: {
    maxCases: 100,
    maxDocuments: 1000,
    aiAnalysesPerMonth: 500,
    storageGb: 50,
    prioritySupport: true,
    apiAccess: true,
    customBranding: false,
    multiUser: true,
    advancedReports: true,
  },
  ENTERPRISE: {
    maxCases: 'unlimited',
    maxDocuments: 'unlimited',
    aiAnalysesPerMonth: 'unlimited',
    storageGb: 'unlimited',
    prioritySupport: true,
    apiAccess: true,
    customBranding: true,
    multiUser: true,
    advancedReports: true,
  },
};

export const PLAN_DETAILS: Record<SubscriptionPlan, PlanDetails> = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    description: 'Perfect for trying out LawMate',
    priceMonthly: 0,
    priceAnnually: 0,
    features: PLAN_FEATURES.FREE,
  },
  PROFESSIONAL: {
    id: 'PROFESSIONAL',
    name: 'Professional',
    description: 'For individual advocates and small firms',
    priceMonthly: 2999,
    priceAnnually: 29990, // ~16% discount
    features: PLAN_FEATURES.PROFESSIONAL,
    popular: true,
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'For large firms with advanced needs',
    priceMonthly: 9999,
    priceAnnually: 99990, // ~16% discount
    features: PLAN_FEATURES.ENTERPRISE,
  },
};
//To use after npx generate 

// // src/types/subscription.ts
// import { 
//   User,
//   SubscriptionPlan as PrismaSubscriptionPlan,
//   SubscriptionStatus as PrismaSubscriptionStatus,
//   BillingCycle as PrismaBillingCycle,
//   PaymentMethod as PrismaPaymentMethod,
//   InvoiceStatus as PrismaInvoiceStatus
// } from '@prisma/client';

// // Re-export Prisma enums
// export type SubscriptionPlan = PrismaSubscriptionPlan;
// export type SubscriptionStatus = PrismaSubscriptionStatus;
// export type BillingCycle = PrismaBillingCycle;
// export type PaymentMethod = PrismaPaymentMethod;
// export type InvoiceStatus = PrismaInvoiceStatus;

// // Extend Prisma's Subscription type
// export interface Subscription {
//   id: string;
//   userId: string;
//   plan: SubscriptionPlan;
//   status: SubscriptionStatus;
//   billingCycle: BillingCycle;
//   amount: number;
//   currency: string;
//   startDate: Date | string;
//   endDate: Date | string;
//   trialEndDate?: Date | string | null;
//   autoRenew: boolean;
//   paymentMethod?: PaymentMethod | null;
//   createdAt: Date | string;
//   updatedAt: Date | string;
  
//   // Optional relations
//   user?: User;
//   invoices?: Invoice[];
// }

// export interface PlanFeatures {
//   maxCases: number | 'unlimited';
//   maxDocuments: number | 'unlimited';
//   aiAnalysesPerMonth: number | 'unlimited';
//   storageGb: number | 'unlimited';
//   prioritySupport: boolean;
//   apiAccess: boolean;
//   customBranding: boolean;
//   multiUser: boolean;
//   advancedReports: boolean;
// }

// export interface PlanDetails {
//   id: SubscriptionPlan;
//   name: string;
//   description: string;
//   priceMonthly: number;
//   priceAnnually: number;
//   features: PlanFeatures;
//   popular?: boolean;
// }

// export interface Invoice {
//   id: string;
//   subscriptionId: string;
//   amount: number;
//   currency: string;
//   status: InvoiceStatus;
//   invoiceDate: Date | string;
//   dueDate: Date | string;
//   paidDate?: Date | string | null;
//   paymentMethod?: PaymentMethod | null;
//   invoiceUrl?: string | null;
//   createdAt: Date | string;
  
//   // Optional relation
//   subscription?: Subscription;
// }

// export interface UsageStats {
//   casesCount: number;
//   documentsCount: number;
//   storageUsedGb: number;
//   aiAnalysesUsed: number;
//   periodStart: Date | string;
//   periodEnd: Date | string;
// }

// // Plan configuration constants
// export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
//   FREE: {
//     maxCases: 5,
//     maxDocuments: 20,
//     aiAnalysesPerMonth: 10,
//     storageGb: 1,
//     prioritySupport: false,
//     apiAccess: false,
//     customBranding: false,
//     multiUser: false,
//     advancedReports: false,
//   },
//   PROFESSIONAL: {
//     maxCases: 100,
//     maxDocuments: 1000,
//     aiAnalysesPerMonth: 500,
//     storageGb: 50,
//     prioritySupport: true,
//     apiAccess: true,
//     customBranding: false,
//     multiUser: true,
//     advancedReports: true,
//   },
//   ENTERPRISE: {
//     maxCases: 'unlimited',
//     maxDocuments: 'unlimited',
//     aiAnalysesPerMonth: 'unlimited',
//     storageGb: 'unlimited',
//     prioritySupport: true,
//     apiAccess: true,
//     customBranding: true,
//     multiUser: true,
//     advancedReports: true,
//   },
// };

// export const PLAN_DETAILS: Record<SubscriptionPlan, PlanDetails> = {
//   FREE: {
//     id: 'FREE',
//     name: 'Free',
//     description: 'Perfect for trying out LawMate',
//     priceMonthly: 0,
//     priceAnnually: 0,
//     features: PLAN_FEATURES.FREE,
//   },
//   PROFESSIONAL: {
//     id: 'PROFESSIONAL',
//     name: 'Professional',
//     description: 'For individual advocates and small firms',
//     priceMonthly: 2999,
//     priceAnnually: 29990, // ~16% discount
//     features: PLAN_FEATURES.PROFESSIONAL,
//     popular: true,
//   },
//   ENTERPRISE: {
//     id: 'ENTERPRISE',
//     name: 'Enterprise',
//     description: 'For large firms with advanced needs',
//     priceMonthly: 9999,
//     priceAnnually: 99990, // ~16% discount
//     features: PLAN_FEATURES.ENTERPRISE,
//   },
// };