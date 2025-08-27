// lib/rpc.ts
// Complete, typed RPC wrapper for your app’s Postgres functions.
// Works in both client and server contexts with the public anon key (user must be signed in to hit RLS-protected RPCs).

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// -----------------------------
// Supabase client (default)
// -----------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
if (!supabaseUrl || !supabaseAnon) {
  // eslint-disable-next-line no-console
  console.warn('[rpc] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
}
export const sb: SupabaseClient = createClient(supabaseUrl, supabaseAnon)

// -----------------------------
// Common types
// -----------------------------
export type UUID = string
export type WalletType = 'main' | 'commission'
export type Currency = string // e.g., 'INR'
export type TxStatus = 'completed' | 'pending' | 'failed'
export type TxType =
  | 'subscription_payment'
  | 'commission'
  | 'milestone_reward'
  | 'transfer'
  | 'other'

// -----------------------------
// Small helpers
// -----------------------------
async function rpc<T>(fn: string, params?: Record<string, unknown>, client: SupabaseClient = sb): Promise<T> {
  const { data, error } = await client.rpc(fn, params ?? {})
  if (error) throw error
  return data as T
}

async function getAuthUserId(client: SupabaseClient = sb): Promise<UUID> {
  const { data: { user }, error } = await client.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('Not authenticated')
  return user.id
}

// -----------------------------
// Return shapes
// -----------------------------
export type CheckoutCartRow = {
  period_index: number
  invoice_id: UUID
  tx_id: UUID
}

export type DirtyFlagsRow = {
  referral_update_flag: boolean | null
  referral2_update_flag: boolean | null
  transactions_update_flag: boolean | null
}

export type TransactionRow = {
  id: UUID
  from_card_id: UUID | null
  to_card_id: UUID | null
  from_wallet_type: WalletType | null
  to_wallet_type: WalletType | null
  tx_type: TxType
  status: TxStatus
  amount: string // numeric as string
  currency: Currency | null
  scheme_id: UUID | null
  invoice_id: UUID | null
  description: string | null
  created_at: string // ISO ts
}

export type ReferralCardRow = {
  id: UUID
  cardholder_name: string | null
  referral_code: string | null
  created_at: string
}

export type DashboardStats = {
  wallet_main: string
  wallet_commission: string
  team_income: string
  total_income: string
  direct_referral_count: number
  indirect_referral_count: number
  l1_active_users: number
  l1_inactive_users: number
  direct_income: string
  indirect_commission: string
  team_paid: number
  team_progress: number
  team_unpaid: number
}

export type MyMilestone = {
  milestone_id: UUID
  code: string
  title: string
  l1_required: number | null
  l2_required: number | null
  reward_amount: string
  reward_currency: string
  reward_wallet_type: WalletType
  achieved: boolean
  achieved_at: string | null
  reward_tx_id: UUID | null
}

export type ResolveDestination2 = {
  // rows returned by resolve_commission_destination2
  // ('card', card_id, null, 'commission') OR ('user', null, user_id, 'commission')
  f1: 'card' | 'user' // kind
  f2: UUID | null     // card_id
  f3: UUID | null     // user_id
  f4: WalletType      // wallet_type
}

export type MilestoneAwardResult = {
  milestone_id: UUID
  reward_tx_id: UUID | null
}

// -----------------------------
// RPC wrappers (alphabetical)
// -----------------------------

/** Assign referral L1/L2 to a user by referral code. Throws on invalid/self-referral per DB. */
export async function attachUserReferralByCode(params: {
  userId: UUID
  referralCode: string
}, client: SupabaseClient = sb): Promise<void> {
  await rpc('attach_user_referral_by_code', {
    p_user_id: params.userId,
    p_referral_code: params.referralCode
  }, client)
}

/** Build + post a cart of installment invoices and record completed tx for each period index. */
export async function checkoutInstallmentCart(params: {
  cardId: UUID
  schemeId: UUID
  periodIndices: number[]
  amountPerInstallment: number
  currency: Currency
  initiatedBy: UUID
  gatewayTotal?: number | null
}, client: SupabaseClient = sb): Promise<CheckoutCartRow[]> {
  return rpc<CheckoutCartRow[]>('checkout_installment_cart', {
    p_card_id: params.cardId,
    p_scheme_id: params.schemeId,
    p_period_indices: params.periodIndices,
    p_amount_per_installment: params.amountPerInstallment,
    p_currency: params.currency,
    p_initiated_by: params.initiatedBy,
    p_gateway_total: params.gatewayTotal ?? null
  }, client)
}

/** Read & optionally clear the user’s dirty flags (requires userId). */
export async function consumeUserUpdateFlags(params?: {
  userId?: UUID
  clearReferral?: boolean
  clearReferral2?: boolean
  clearTransactions?: boolean
}, client: SupabaseClient = sb): Promise<DirtyFlagsRow> {
  const uid = params?.userId ?? await getAuthUserId(client)
  const data = await rpc<DirtyFlagsRow[]>('consume_user_update_flags', {
    p_user_id: uid,
    p_clear_referral: !!params?.clearReferral,
    p_clear_referral2: !!params?.clearReferral2,
    p_clear_transactions: !!params?.clearTransactions
  }, client)
  // function returns a SELECT * FROM current_flags; often as a single row
  return Array.isArray(data) ? (data[0] ?? { referral_update_flag: null, referral2_update_flag: null, transactions_update_flag: null }) : (data as unknown as DirtyFlagsRow)
}

/** Create first card if user has none; returns new card id or null. */
export async function createFirstCardIfMissing(userId?: UUID, client: SupabaseClient = sb): Promise<UUID | null> {
  const uid = userId ?? await getAuthUserId(client)
  return rpc<UUID | null>('create_first_card_if_missing', { p_user_id: uid }, client)
}

/** Admin/staff creation behind access key; returns true on success. */
export async function createStaffProfile(params: {
  userId: UUID
  fullName: string
  phoneNumber?: string | null
  accessKey: string
}, client: SupabaseClient = sb): Promise<boolean> {
  return rpc<boolean>('create_staff_profile', {
    user_id: params.userId,
    full_name: params.fullName,
    phone_number: params.phoneNumber ?? null,
    access_key: params.accessKey
  }, client)
}

/** Ensure profile row; optionally attach referral code (silently ignored if invalid). */
function isPgrst202(err: unknown) {
  return !!err && typeof err === 'object' && (err as any).code === 'PGRST202'
}

export async function ensureProfile(params: {
  fullName: string
  phone?: string | null
  referralCode?: string | null
  schemeId?: string | null
  userId?: string | null // UUID; optional if function uses auth.uid()
}, client: SupabaseClient = sb): Promise<void> {
  const baseArgs = {
    p_full_name: params.fullName,
    p_phone: params.phone ?? null,
    p_referral_code: params.referralCode ?? null,
    p_user_id: params.userId ?? null,
  }

  // Try new signature (with p_scheme_id)
  try {
    const { error } = await client.rpc('ensure_profile2', {
      ...baseArgs,
      p_scheme_id: params.schemeId ?? null,
    })
    if (error) throw error
    return
  } catch (e) {
    // If the DB doesn't have p_scheme_id, retry with legacy signature
    if (isPgrst202(e)) {
      const { error } = await client.rpc('ensure_profile2', baseArgs)
      if (error) throw error
      return
    }
    throw e
  }
}
/** Create (once) and return registration invoice for a user. */
export async function ensureRegistrationFeeInvoice(params: {
  userId: UUID
  attachCardId: UUID
  schemeId: UUID
  amount: number
}, client: SupabaseClient = sb): Promise<UUID> {
  return rpc<UUID>('ensure_registration_fee_invoice', {
    p_user_id: params.userId,
    p_attach_card_id: params.attachCardId,
    p_scheme_id: params.schemeId,
    p_amount: params.amount
  }, client)
}

/** Ensure (upsert) a subscription invoice for a specific period index. */
export async function ensureSubscriptionInvoice(params: {
  cardId: UUID
  schemeId: UUID
  periodIndex: number
  amount: number
  paymentMethodHint?: string | null
}, client: SupabaseClient = sb): Promise<UUID> {
  return rpc<UUID>('ensure_subscription_invoice', {
    p_card_id: params.cardId,
    p_scheme_id: params.schemeId,
    p_period_index: params.periodIndex,
    p_amount: params.amount,
    p_payment_method_hint: params.paymentMethodHint ?? 'upi_one_time'
  }, client)
}

/** Generate an 8-char unique referral code (server-side helper). */
export async function generateReferralCode(client: SupabaseClient = sb): Promise<string> {
  return rpc<string>('generate_referral_code', {}, client)
}

/** Admin overview MV passthrough. Shape depends on your mv_admin_overview definition. */
export async function getAdminOverview<T = unknown>(client: SupabaseClient = sb): Promise<T[]> {
  return rpc<T[]>('get_admin_overview', {}, client)
}

/** Page through transactions for a card (owner-aware variant). */
export async function getCardTransactionsPage(params: {
  cardId: UUID
  limit: number
  onlyCompleted?: boolean
  afterCreatedAt?: string | null
  afterId?: UUID | null
}, client: SupabaseClient = sb): Promise<TransactionRow[]> {
  return rpc<TransactionRow[]>('get_card_transactions_page', {
    p_card_id: params.cardId,
    p_limit: params.limit,
    p_only_completed: !!params.onlyCompleted,
    p_after_created_at: params.afterCreatedAt ?? null,
    p_after_id: params.afterId ?? null
  }, client)
}

/** Direct (L1) referrals page for a parent user. */
export async function getL1ReferralsPageByUser(params: {
  parentUserId: UUID
  limit: number
  afterCreatedAt?: string | null
  afterId?: UUID | null
}, client: SupabaseClient = sb): Promise<ReferralCardRow[]> {
  return rpc<ReferralCardRow[]>('get_l1_referrals_page_by_user', {
    p_parent_user_id: params.parentUserId,
    p_limit: params.limit,
    p_after_created_at: params.afterCreatedAt ?? null,
    p_after_id: params.afterId ?? null
  }, client)
}

/** Indirect (L2) referrals page for a parent user. */
export async function getL2ReferralsPageByUser(params: {
  parentUserId: UUID
  limit: number
  afterCreatedAt?: string | null
  afterId?: UUID | null
}, client: SupabaseClient = sb): Promise<ReferralCardRow[]> {
  return rpc<ReferralCardRow[]>('get_l2_referrals_page_by_user', {
    p_parent_user_id: params.parentUserId,
    p_limit: params.limit,
    p_after_created_at: params.afterCreatedAt ?? null,
    p_after_id: params.afterId ?? null
  }, client)
}

/** Aggregated dashboard stats for a user. */
export async function getUserDashboardStats(params?: { userId?: UUID }, client: SupabaseClient = sb): Promise<DashboardStats[]> {
  const uid = params?.userId ?? await getAuthUserId(client)
  console.log('uid', uid);
  return rpc<DashboardStats[]>('get_user_dashboard_stats', { p_user_id: uid }, client)
}

/** Issue a card for user under a scheme (enforces KYC & scheme window). Returns new card id. */
export async function issueCard(params: {
  userId: UUID
  schemeId: UUID
  paymentMethod: string
  setAsCommissionDestination?: boolean
  cardholderName?: string | null
  phone?: string | null
}, client: SupabaseClient = sb): Promise<UUID> {
  return rpc<UUID>('issue_card', {
    p_user_id: params.userId,
    p_scheme_id: params.schemeId,
    p_payment_method: params.paymentMethod,
    p_set_as_commission_destination: !!params.setAsCommissionDestination,
    p_cardholder_name: params.cardholderName ?? null,
    p_phone: params.phone ?? null
  }, client)
}

/** Pay the next N installments for a card (fires commissions, updates invoices). */
export async function payNextNInstallments(params: {
  cardId: UUID
  n: number
  amountPerInstallment: number
  currency: Currency
  initiatedBy: UUID
}, client: SupabaseClient = sb): Promise<CheckoutCartRow[]> {
  return rpc<CheckoutCartRow[]>('pay_next_n_installments', {
    p_card_id: params.cardId,
    p_n: params.n,
    p_amount_per_installment: params.amountPerInstallment,
    p_currency: params.currency,
    p_initiated_by: params.initiatedBy
  }, client)
}

/** Recompute referral stats for a user (also triggers milestone evaluation as per your hook). */
export async function recomputeUserReferralStats(userId?: UUID, client: SupabaseClient = sb): Promise<void> {
  const uid = userId ?? await getAuthUserId(client)
  await rpc('recompute_user_referral_stats', { p_user_id: uid }, client)
}

/** Record a single completed subscription payment (auto-commissions via trigger). */
export async function recordSubscriptionPayment(params: {
  fromCardId: UUID
  schemeId: UUID
  invoiceId: UUID
  amount: number
  currency: Currency
  paymentMethod: string
  initiatedBy: UUID
}, client: SupabaseClient = sb): Promise<UUID> {
  return rpc<UUID>('record_subscription_payment', {
    p_from_card_id: params.fromCardId,
    p_scheme_id: params.schemeId,
    p_invoice_id: params.invoiceId,
    p_amount: params.amount,
    p_currency: params.currency,
    p_payment_method: params.paymentMethod,
    p_initiated_by: params.initiatedBy
  }, client)
}

/** Process all users with dirty flags: recompute stats & clear flags. (Service role recommended) */
export async function refreshCountersForDirtyUsers(client: SupabaseClient = sb): Promise<void> {
  await rpc('refresh_counters_for_dirty_users', {}, client)
}

/** Resolve commission destination (legacy single-UUID). */
export async function resolveCommissionDestination(userId: UUID, client: SupabaseClient = sb): Promise<UUID | null> {
  return rpc<UUID | null>('resolve_commission_destination', { p_user_id: userId }, client)
}

/** Resolve commission destination (rich form). */
export async function resolveCommissionDestination2(userId: UUID, client: SupabaseClient = sb): Promise<ResolveDestination2[]> {
  // returns a setof (kind, card_id, user_id, wallet_type)
  return rpc<ResolveDestination2[]>('resolve_commission_destination2', { p_user_id: userId }, client)
}

/** Set a specific card as commission destination for a user. */
export async function setCommissionDestinationCard(params: {
  userId: UUID
  cardId: UUID
}, client: SupabaseClient = sb): Promise<void> {
  await rpc('set_commission_destination_card', {
    p_user_id: params.userId,
    p_card_id: params.cardId
  }, client)
}

/** List active milestones with achieved status for current auth user. */
export async function getMyMilestones(client: SupabaseClient = sb): Promise<MyMilestone[]> {
  return rpc<MyMilestone[]>('get_my_milestones', {}, client)
}

/** Manually evaluate + award milestones for a user (usually called via recompute hook). */
export async function evaluateUserMilestones(userId?: UUID, initiatedBy?: UUID, client: SupabaseClient = sb): Promise<MilestoneAwardResult[]> {
  const uid = userId ?? await getAuthUserId(client)
  return rpc<MilestoneAwardResult[]>('evaluate_user_milestones', {
    p_user_id: uid,
    p_initiated_by: initiatedBy ?? uid
  }, client)
}


export type TeamTxRow = {
  id: string
  level: 1 | 2
  payer_user_id: string
  payer_card_id: string
  payer_name: string | null
  amount: string
  currency: string | null
  scheme_id: string | null
  invoice_id: string | null
  tx_type: 'subscription_payment'
  status: 'completed' | 'pending' | 'failed'
  description: string | null
  created_at: string
  commission_tx_id: string | null
  commission_amount: string | null
  commission_currency: string | null
}

export type DownlinePaymentRow = {
  child_name: string
  payment_method: string | null
  payment_status: string
  payment_date: string | null
  total_count: number
}

export async function getTeamTransactionsPage(params: {
  levels?: (1|2)[]
  onlyCompleted?: boolean
  limit?: number
  afterCreatedAt?: string | null
  afterId?: string | null
  schemeId?: string | null
  dateFrom?: string | null
  dateTo?: string | null
}, client: import('@supabase/supabase-js').SupabaseClient = sb): Promise<TeamTxRow[]> {
  const { data, error } = await client.rpc('get_team_transactions_page', {
    p_levels: params.levels ?? [1,2],
    p_only_completed: params.onlyCompleted ?? true,
    p_limit: params.limit ?? 25,
    p_after_created_at: params.afterCreatedAt ?? null,
    p_after_id: params.afterId ?? null,
    p_scheme_id: params.schemeId ?? null,
    p_date_from: params.dateFrom ?? null,
    p_date_to: params.dateTo ?? null
  })
  if (error) throw error
  return data ?? []
}

/** Get downline payment status for current period of a specific scheme */
export async function getDownlinePaymentsCurrentPeriod(params: {
  userId?: UUID
  schemeId: UUID
  page?: number
}, client: SupabaseClient = sb): Promise<DownlinePaymentRow[]> {
  const uid = params.userId ?? await getAuthUserId(client)
  const { data, error } = await client.rpc('fn_downline_payments_current_period', {
    p_user_id: uid,
    p_scheme_id: params.schemeId,
    p_page: params.page ?? 1
  })
  if (error) throw error
  return data ?? []
}

export type SchemePeriod = {
  period_index: number
  period_start: string
  period_end: string
  draw_date: string | null
  rewards_count: number
  cover_image_url: string | null
}

export type SchemePeriodReward = {
  reward_id: string
  period_index: number
  title: string | null
  description: string | null
  image_url: string
  quantity: number
  position: number
  created_at: string
}

// Public scheme summary for selection lists
export type SchemeSummary = {
  id: string
  name: string
  status: string | null
  image_url: string | null
  subscription_amount: number
}

// List schemes visible to anon/user clients (relies on RLS policies)
export async function listSchemesPublic(client: SupabaseClient = sb): Promise<SchemeSummary[]> {
  const { data, error } = await client
    .from('schemes')
    .select('id,name,status,image_url,subscription_amount')
    .order('created_at', { ascending: false })

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[rpc] listSchemesPublic error:', error.message)
    return []
  }
  return (data ?? []) as SchemeSummary[]
}


export async function getSchemePeriods(schemeId: string, client = sb) {
  const { data, error } = await client.rpc('get_scheme_periods', {
    p_scheme_id: schemeId,   // ← REQUIRED
  })
  if (error) throw error
  return data ?? []
}



export async function getSchemePeriodRewards(
  args: { schemeId: string; periodIndex?: number | null; at?: string | null },
  client = sb
) {
  const res = await client.rpc('get_scheme_period_rewards', {
    p_scheme_id: args.schemeId,
    p_period_index: args.periodIndex ?? null,
    //p_at: args.at ?? null,
  })
  if (res.error) throw res.error
  return (res.data ?? []) as SchemePeriodReward[]
}

/* Admin only; call with a service/staff client */
export async function upsertSchemePeriodReward(
  args: {
    schemeId: string
    periodIndex: number
    imageUrl: string
    title?: string | null
    description?: string | null
    quantity?: number
    position?: number | null
  },
  client = sb
) {
  const res = await client.rpc('upsert_scheme_period_reward', {
    p_scheme_id: args.schemeId,
    p_period_index: args.periodIndex,
    p_image_url: args.imageUrl,
    p_title: args.title ?? null,
    p_description: args.description ?? null,
    p_quantity: args.quantity ?? 1,
    p_position: args.position ?? null,
  })
  if (res.error) throw res.error
  return res.data as string
}



export async function getSchemeTopRewards(
  schemeId: string,
  supabase: SupabaseClient
) {
  const { data, error } = await supabase.rpc('get_scheme_top_rewards', {
    p_scheme_id: schemeId
  });

  if (error) throw error;
  return data || [];
  
}

