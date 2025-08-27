// Card Management Types

export interface Card {
  id: string;
  userId: string;
  cardholderName: string;
  phoneNumber: string;
  refL1UserId?: string;
  refL2UserId?: string;
  schemeId?: string;
  schemeName?: string;
  subscriptionStatus: 'active' | 'paused' | 'cancelled' | 'expired' | 'completed';
  status?: 'active' | 'inactive' | 'suspended' | 'blocked';
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded';
  cardType?: 'debit' | 'credit' | 'prepaid';
  kycStatus?: 'pending' | 'verified' | 'rejected';
  nextPaymentDate?: string;
  paymentMethod: 'upi_mandate' | 'card' | 'bank_transfer';
  mandateId?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  lastPaymentDate?: string;
  totalPaymentsMade: number;
  totalWalletBalance: number;
  commissionWalletBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  userProfile?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    country: string;
    state: string;
    district: string;
    kycVerified: boolean;
    referralCode: string;
    isActive: boolean;
    createdAt: string;
  };
}

export interface Transaction {
  id: string;
  cardId: string;
  amount: number;
  type: 'credit' | 'debit' | 'refund' | 'fee' | 'topup';
  description: string;
  merchant?: string;
  category: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cash';
  transactionDate: string;
  referenceNumber: string;
  balanceAfter: number;
  location?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Invoice {
  id: string;
  cardId: string;
  userId: string;
  invoiceNumber: string;
  amount: number;
  dueAmount: number;
  paidAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partial';
  dueDate: string;
  issueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  description: string;
  items: InvoiceItem[];
  taxes: InvoiceTax[];
  discounts: InvoiceDiscount[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

export interface InvoiceTax {
  id: string;
  name: string;
  rate: number;
  amount: number;
}

export interface InvoiceDiscount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
}

export interface PaymentHistory {
  id: string;
  cardId: string;
  invoiceId?: string;
  amount: number;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cash' | 'cheque';
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  transactionId: string;
  gatewayResponse?: Record<string, any>;
  failureReason?: string;
  paidDate: string;
  createdAt: string;
}

// Statistics types
export interface CardStats {
  totalCards: number;
  activeCards: number;
  blockedCards: number;
  pendingCards: number;
  totalBalance: number;
  totalTransactions: number;
  monthlyTransactionVolume: number;
  overdueInvoices: number;
  totalRevenue: number;
}

// Filter and search types
export interface CardFilters {
  status?: Card['status'][];
  paymentStatus?: Card['paymentStatus'][];
  cardType?: Card['cardType'][];
  kycStatus?: Card['kycStatus'][];
  assignedTo?: string[];
  issueDateFrom?: string;
  issueDateTo?: string;
  balanceMin?: number;
  balanceMax?: number;
  search?: string;
}

export interface TransactionFilters {
  type?: Transaction['type'][];
  status?: Transaction['status'][];
  paymentMethod?: Transaction['paymentMethod'][];
  category?: string[];
  amountMin?: number;
  amountMax?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface InvoiceFilters {
  status?: Invoice['status'][];
  dueDateFrom?: string;
  dueDateTo?: string;
  amountMin?: number;
  amountMax?: number;
  search?: string;
}

// Form types
export interface UpdateCardStatusRequest {
  cardId: string;
  status: Card['status'];
  reason?: string;
  notes?: string;
}

export interface UpdatePaymentStatusRequest {
  cardId: string;
  paymentStatus: Card['paymentStatus'];
  paymentMethod?: string;
  amount?: number;
  notes?: string;
}

export interface UpdateInvoiceStatusRequest {
  invoiceId: string;
  status: Invoice['status'];
  paymentMethod?: string;
  paidAmount?: number;
  notes?: string;
}

export interface UpdateKycStatusRequest {
  cardId: string;
  kycStatus: Card['kycStatus'];
  reason?: string;
  documents?: string[];
}

// API Response types
export interface CardListResponse {
  cards: Card[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: CardStats;
}

export interface CardDetailsResponse {
  card: Card;
  transactions: Transaction[];
  invoices: Invoice[];
  paymentHistory: PaymentHistory[];
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Constants
export const SUBSCRIPTION_STATUSES: Record<Card['subscriptionStatus'], { label: string; color: string }> = {
  active: { label: 'Active', color: 'green' },
  paused: { label: 'Paused', color: 'yellow' },
  cancelled: { label: 'Cancelled', color: 'red' },
  expired: { label: 'Expired', color: 'orange' },
  completed: { label: 'Completed', color: 'blue' }
};

export const KYC_STATUSES: Record<string, { label: string; color: string }> = {
  true: { label: 'Verified', color: 'green' },
  false: { label: 'Pending', color: 'yellow' }
};

export const TRANSACTION_TYPES: Record<Transaction['type'], { label: string; color: string }> = {
  credit: { label: 'Credit', color: 'green' },
  debit: { label: 'Debit', color: 'red' },
  refund: { label: 'Refund', color: 'blue' },
  fee: { label: 'Fee', color: 'orange' },
  topup: { label: 'Top Up', color: 'purple' }
};

export const PAYMENT_METHODS: Record<string, { label: string; icon: string; color: string }> = {
  card: { label: 'Card Payment', icon: 'CreditCard', color: 'blue' },
  upi: { label: 'UPI', icon: 'Smartphone', color: 'green' },
  netbanking: { label: 'Net Banking', icon: 'Building', color: 'purple' },
  wallet: { label: 'Digital Wallet', icon: 'Wallet', color: 'orange' },
  cash: { label: 'Cash', icon: 'Banknote', color: 'gray' },
  cheque: { label: 'Cheque', icon: 'FileText', color: 'yellow' }
};

// Utility types
export type CardFormData = Omit<Card, 'id' | 'createdAt' | 'updatedAt'>;
export type TransactionFormData = Omit<Transaction, 'id' | 'createdAt'>;
export type InvoiceFormData = Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>;
