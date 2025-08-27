// Scheme Management Types

/*
  PRIZES TABLE SCHEMA:

  create table public.prizes (
    id uuid not null default extensions.uuid_generate_v4(),
    scheme_id uuid not null,
    name text not null,
    description text null,
    rank integer not null,
    image_url text null,
    prize_type text not null default 'product'::text,
    cash_amount numeric(12,2) null,
    product_details jsonb null,
    is_active boolean null default true,
    created_at timestamp with time zone null default now(),
    updated_at timestamp with time zone null default now(),
    constraint prizes_pkey primary key (id),
    constraint prizes_scheme_id_fkey foreign key (scheme_id) references schemes (id) on delete cascade,
    constraint prizes_rank_unique unique (scheme_id, rank),
    constraint prizes_rank_positive check (rank > 0),
    constraint prizes_prize_type_check check (
      prize_type = any (array['product'::text, 'money'::text, 'both'::text])
    ),
    constraint prizes_cash_amount_positive check (cash_amount > 0)
  ) tablespace pg_default;

  -- Create index for better query performance
  create index idx_prizes_scheme_id on public.prizes(scheme_id);
  create index idx_prizes_rank on public.prizes(rank);

  WINNERS TABLE SCHEMA:

  create table public.winners (
    id uuid not null default extensions.uuid_generate_v4(),
    scheme_id uuid not null,
    prize_id uuid not null,
    card_id uuid not null,
    user_id uuid not null,
    user_name text not null,
    user_email text null,
    user_phone text null,
    rank integer not null,
    prize_name text not null,
    prize_value numeric(12,2) not null,
    win_date timestamp with time zone not null default now(),
    status text not null default 'pending'::text,
    claimed_at timestamp with time zone null,
    delivered_at timestamp with time zone null,
    delivery_address text null,
    notes text null,
    is_active boolean null default true,
    created_at timestamp with time zone null default now(),
    updated_at timestamp with time zone null default now(),
    created_by uuid null,
    constraint winners_pkey primary key (id),
    constraint winners_scheme_id_fkey foreign key (scheme_id) references schemes (id) on delete cascade,
    constraint winners_prize_id_fkey foreign key (prize_id) references prizes (id) on delete cascade,
    constraint winners_card_id_fkey foreign key (card_id) references cards (id) on delete cascade,
    constraint winners_user_id_fkey foreign key (user_id) references user_profiles (id),
    constraint winners_created_by_fkey foreign key (created_by) references user_profiles (id),
    constraint winners_rank_positive check (rank > 0),
    constraint winners_prize_value_positive check (prize_value >= 0),
    constraint winners_status_check check (
      status = any (array['pending'::text, 'claimed'::text, 'delivered'::text, 'cancelled'::text])
    )
  ) tablespace pg_default;

  -- Create index for better query performance
  create index idx_winners_scheme_id on public.winners(scheme_id);
  create index idx_winners_card_id on public.winners(card_id);
  create index idx_winners_status on public.winners(status);
  create index idx_winners_created_at on public.winners(created_at);
*/

export interface Scheme {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  type: "monthly" | "quarterly" | "yearly";
  prizeType: "product" | "money" | "both";
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  maxParticipants: number;
  subscriptionAmount: number;
  totalPrizes: number;
  numberOfWinners: number;
  registeredUsers: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Prize {
  id: string;
  schemeId: string;
  name: string;
  description: string;
  rank: number;
  imageUrl?: string;
  prizeType: 'product' | 'money' | 'both';
  cashAmount?: number;
  productDetails?: {
    model?: string;
    brand?: string;
    category?: string;
    specifications?: Record<string, string>;
    estimatedValue?: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SchemeStats {
  totalSchemes: number;
  activeSchemes: number;
  draftSchemes: number;
  inactiveSchemes: number;
  totalPrizes: number;
  totalParticipants: number;
  totalPrizeValue: number;
}

export interface Winner {
  id: string;
  schemeId: string;
  prizeId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  rank: number;
  prizeName: string;
  prizeValue: number;
  winDate: string;
  status: "pending" | "claimed" | "delivered" | "cancelled";
  claimedAt?: string;
  deliveredAt?: string;
  deliveryAddress?: string;
  notes?: string;
}

export interface EligibleCard {
  id: string;
  userId: string;
  cardholderName: string;
  phoneNumber: string;
  schemeId: string;
  schemeName: string;
  subscriptionStatus: string;
  totalPaymentsMade: number;
  isActive: boolean;
  createdAt: string;
}

export interface SchemeParticipant {
  id: string;
  schemeId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  registrationDate: string;
  isEligible: boolean;
  entryCount: number;
  lastEntryDate: string;
}

// Form types for creating/editing
export interface CreateSchemeRequest {
  name: string;
  description: string;
  type: Scheme['type'];
  prizeType: Scheme['prizeType'];
  status: Scheme['status'];
  startDate: string;
  endDate: string;
  totalPrizes: number;
}

export interface UpdateSchemeRequest extends Partial<CreateSchemeRequest> {
  id: string;
}

export interface CreatePrizeRequest {
  schemeId: string;
  name: string;
  description: string;
  rank: number;
  imageUrl?: string;
  prizeType: Prize['prizeType'];
  cashAmount?: number;
  productDetails?: Prize['productDetails'];
}

export interface UpdatePrizeRequest extends Partial<CreatePrizeRequest> {
  id: string;
}

// API Response types
export interface SchemeListResponse {
  schemes: Scheme[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: SchemeStats;
}

export interface PrizeListResponse {
  prizes: Prize[];
  schemeId: string;
  schemeName: string;
}

export interface WinnerListResponse {
  winners: Winner[];
  schemeId: string;
  schemeName: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ParticipantListResponse {
  participants: SchemeParticipant[];
  schemeId: string;
  schemeName: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter and search types
export interface SchemeFilters {
  type?: Scheme['type'][];
  prizeType?: Scheme['prizeType'][];
  status?: Scheme['status'][];
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  search?: string;
}

export interface PrizeFilters {
  prizeType?: Prize['prizeType'][];
  rankMin?: number;
  rankMax?: number;
  category?: string[];
  brand?: string[];
  search?: string;
}

export interface WinnerFilters {
  status?: Winner['status'][];
  winDateFrom?: string;
  winDateTo?: string;
  rank?: number[];
  search?: string;
}

// Constants
export const SCHEME_TYPES: Record<Scheme['type'], string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly'
};

export const PRIZE_TYPES: Record<Scheme['prizeType'], string> = {
  product: 'Product Prizes',
  money: 'Cash Prizes',
  both: 'Products & Cash'
};

export const SCHEME_STATUSES: Record<Scheme['status'], { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'yellow' },
  active: { label: 'Active', color: 'green' },
  paused: { label: 'Paused', color: 'orange' },
  completed: { label: 'Completed', color: 'blue' },
  cancelled: { label: 'Cancelled', color: 'red' }
};

export const WINNER_STATUSES: Record<Winner['status'], { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'yellow' },
  claimed: { label: 'Claimed', color: 'blue' },
  delivered: { label: 'Delivered', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' }
};

// Utility types
export type SchemeFormData = Omit<Scheme, 'id' | 'registeredUsers' | 'createdAt' | 'updatedAt'>;
export type PrizeFormData = Omit<Prize, 'id' | 'schemeId' | 'isActive' | 'createdAt' | 'updatedAt'>;
