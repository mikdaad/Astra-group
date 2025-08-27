🚀 Lottery Platform API Specification
📋 API Overview
This document outlines the complete API specification for the lottery platform backend. All endpoints use Supabase Auth for authentication and follow RESTful conventions.

🔐 Authentication Endpoints
POST /api/auth/register
Purpose: Register new user with email/password
Auth: None
Request Body:
jsonCopy{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone_number": "+91XXXXXXXXXX"
}
Response:
jsonCopy{
  "success": true,
  "user": { "id": "uuid", "email": "...", "email_confirmed_at": null },
  "session": { "access_token": "...", "refresh_token": "..." }
}
Logic:

Call Supabase auth.signUp() with email/password
Profile auto-created via database trigger
Send email verification
Return session tokens

TODO: Add phone verification workflow

POST /api/auth/login
Purpose: Login existing user
Auth: None
Request Body:
jsonCopy{
  "email": "user@example.com",
  "password": "password123"
}
Response:
jsonCopy{
  "success": true,
  "user": { "id": "uuid", "email": "..." },
  "session": { "access_token": "...", "refresh_token": "..." }
}
Logic:

Call Supabase auth.signInWithPassword()
Return session data
Handle email not confirmed case


POST /api/auth/phone/send-otp
Purpose: Send OTP for phone verification
Auth: Bearer token
Request Body:
jsonCopy{
  "phone_number": "+91XXXXXXXXXX"
}
Response:
jsonCopy{
  "success": true,
  "message": "OTP sent successfully",
  "otp_id": "temp_id_for_verification"
}
Logic:

Validate phone number format
Generate 6-digit OTP
Store OTP with expiry (5 mins) in cache/temp table
Send SMS via third-party service OTP SMS Whatsapp (MSG91)

TODO:

Integrate SMS provider
Add WhatsApp option
Rate limiting for OTP requests


POST /api/auth/phone/verify-otp
Purpose: Verify phone OTP and update profile
Auth: Bearer token
Request Body:
jsonCopy{
  "phone_number": "+91XXXXXXXXXX",
  "otp": "123456",
  "otp_id": "temp_id_for_verification"
}
Response:
jsonCopy{
  "success": true,
  "message": "Phone verified successfully"
}
Logic:

Validate OTP against stored value
Check expiry time
Update user_profiles.phone_verified = true
Clear OTP from cache


POST /api/auth/google
Purpose: Google OAuth authentication
Auth: None
Request Body:
jsonCopy{
  "id_token": "google_id_token"
}
Response: Same as login response
Logic:

Call Supabase auth.signInWithIdToken()
Auto-create profile if new user
Return session data

TODO: Configure Google OAuth in Supabase dashboard

👤 User Management APIs
GET /api/user/profile
Purpose: Get current user profile
Auth: Bearer token
Response:
jsonCopy{
  "success": true,
  "profile": {
    "id": "uuid",
    "full_name": "John Doe",
    "email": "user@example.com",
    "phone_number": "+91XXXXXXXXXX",
    "phone_verified": true,
    "kyc_verified": false,
    "country": "India",
    "state": "Maharashtra",
    "bank_account_holder_name": "John Doe",
    "bank_account_number": "1234567890",
    "bank_ifsc_code": "HDFC0000123",
    "profile_image_url": null,
    "notification_preferences": {...}
  }
}
Logic:

Get user ID from auth token
Query user_profiles table with RLS
Return profile data (sensitive bank details only for owner)


PUT /api/user/profile
Purpose: Update user profile
Auth: Bearer token
Request Body:
jsonCopy{
  "full_name": "John Updated",
  "state": "Karnataka",
  "district": "Bangalore",
  "street_address": "123 Main St",
  "postal_code": "560001",
  "bank_account_holder_name": "John Updated",
  "bank_account_number": "9876543210",
  "bank_ifsc_code": "ICIC0000123",
  "bank_name": "ICICI Bank",
  "bank_branch": "Koramangala",
  "bank_account_type": "savings"
}
Response:
jsonCopy{
  "success": true,
  "message": "Profile updated successfully"
}
Logic:

Validate bank details format (IFSC, account number)
Update user_profiles table
Trigger re-verification if bank details changed
Log audit trail

Validation Rules:

IFSC: 11 characters, format validation
Account number: 9-18 digits
Phone number: E.164 format


POST /api/user/upload-avatar
Purpose: Upload profile picture
Auth: Bearer token
Request: Multipart form with image file
Response:
jsonCopy{
  "success": true,
  "image_url": "https://storage.url/avatar.jpg"
}
Logic:

Validate image format (JPG, PNG, max 2MB)
Upload to Supabase Storage
Update profile with image URL
Delete old avatar if exists


🆔 KYC Management APIs
GET /api/kyc/status
Purpose: Get KYC verification status
Auth: Bearer token
Response:
jsonCopy{
  "success": true,
  "kyc_status": {
    "pan_verification_status": "verified",
    "aadhar_verification_status": "pending",
    "overall_status": "partial",
    "pan_last4": "1234",
    "aadhar_last4": "5678",
    "verified_at": "2024-01-15T10:30:00Z"
  }
}
Logic:

Query kyc_documents table
Return verification status
Show last 4 digits only for privacy


POST /api/kyc/verify-pan
Purpose: Initiate PAN verification
Auth: Bearer token
Request Body:
jsonCopy{
  "pan_number": "ABCDE1234F",
  "full_name": "John Doe"
}
Response:
jsonCopy{
  "success": true,
  "verification_id": "sandbox_txn_id",
  "status": "pending"
}
Logic:

Hash PAN number for duplicate check
Call Sandbox.co.in PAN verification API
Store encrypted PAN and verification ID
Update status to 'pending'

TODO:

Integrate with Sandbox.co.in API
Set up webhook for status updates
Add encryption for sensitive data


POST /api/kyc/verify-aadhar
Purpose: Initiate Aadhar verification
Auth: Bearer token
Request Body:
jsonCopy{
  "aadhar_number": "123456789012",
  "consent": true
}
Response: Similar to PAN verification
Logic: Same as PAN with Aadhar-specific validation

POST /api/kyc/webhook
Purpose: Receive verification status updates from Sandbox.co.in
Auth: Webhook signature validation
Request Body: Provider-specific payload
Logic:

Validate webhook signature
Parse verification result
Update kyc_documents status
Update user_profiles.kyc_verified if both verified
Send notification to user

TODO:

Implement webhook signature validation
Add retry mechanism for failed updates


💳 Card Management APIs
GET /api/cards
Purpose: Get user's cards
Auth: Bearer token
Response:
jsonCopy{
  "success": true,
  "cards": [
    {
      "id": "uuid",
      "card_name": "Primary Card",
      "cardholder_name": "John Doe",
      "phone_number": "+91XXXXXXXXXX",
      "referral_code": "ABC12345",
      "total_wallet_balance": 1500.00,
      "commission_wallet_balance": 250.00,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "referral_stats": {
        "direct_referrals": 5,
        "total_commissions": 1250.00
      }
    }
  ]
}
Logic:

Query cards table for current user
Join with referral stats
Return card list with balances


POST /api/cards
Purpose: Create new card
Auth: Bearer token
Request Body:
jsonCopy{
  "card_name": "Secondary Card",
  "cardholder_name": "John Doe",
  "phone_number": "+91XXXXXXXXXX",
  "referring_code": "XYZ67890"
}
Response:
jsonCopy{
  "success": true,
  "card": {
    "id": "uuid",
    "referral_code": "DEF54321",
    "message": "Card created successfully"
  }
}
Logic:

Validate referring code exists and is active
Check user limits (max 3 cards per user)
Generate unique referral code
Create card record
Build referral tree via trigger
Send welcome notification

Validation:

Max 3 cards per user
Unique referral code generation
Valid referring code check


PUT /api/cards/
Purpose: Update card details
Auth: Bearer token (owner only)
Request Body:
jsonCopy{
  "card_name": "Updated Name",
  "phone_number": "+91XXXXXXXXXX"
}
Response: Success message
Logic:

Verify card ownership
Update allowed fields only
Validate phone number format


DELETE /api/cards/
Purpose: Deactivate card (soft delete)
Auth: Bearer token (owner only)
Logic:

Check for active subscriptions
Set is_active = false
Cancel active subscriptions
Preserve referral tree for commission tracking


GET /api/cards//referrals
Purpose: Get referral tree for card
Auth: Bearer token (owner only)
Query Params: ?levels=3&page=1&limit=50
Response:
jsonCopy{
  "success": true,
  "referral_tree": [
    {
      "level": 1,
      "card_id": "uuid",
      "card_name": "Referred Card",
      "referred_date": "2024-01-15T00:00:00Z",
      "commission_earned": 150.00,
      "is_active": true
    }
  ],
  "stats": {
    "total_referrals": 25,
    "active_referrals": 20,
    "total_commission_earned": 5000.00
  }
}
Logic:

Query referral_tree table
Join with card details
Calculate commission totals
Paginate results


🎰 Scheme Management APIs
GET /api/schemes
Purpose: Get available schemes
Auth: Bearer token
Query Params: ?status=active&type=lottery&page=1
Response:
jsonCopy{
  "success": true,
  "schemes": [
    {
      "id": "uuid",
      "name": "Weekly Lottery",
      "description": "Win big every week",
      "subscription_amount": 100.00,
      "image_url": "https://...",
      "scheme_type": "lottery",
      "max_participants": 1000,
      "number_of_winners": 5,
      "start_date": "2024-01-01T00:00:00Z",
      "end_date": "2024-12-31T23:59:59Z",
      "draw_date": "2024-01-07T18:00:00Z",
      "subscription_cycle": "weekly",
      "status": "active",
      "current_participants": 450,
      "is_subscribed": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15
  }
}
Logic:

Query schemes table with filters
Join with subscription count
Check user's subscription status
Paginate results


GET /api/schemes/
Purpose: Get scheme details
Auth: Bearer token
Response: Single scheme with detailed info
Logic:

Get scheme details
Get user's subscription status
Get recent winners (if completed)
Get participation stats


POST /api/schemes (Admin Only)
Purpose: Create new scheme
Auth: Bearer token + Admin role
Request Body:
jsonCopy{
  "name": "Monthly Mega Draw",
  "description": "Biggest prizes of the month",
  "subscription_amount": 500.00,
  "scheme_type": "lottery",
  "max_participants": 5000,
  "number_of_winners": 10,
  "start_date": "2024-02-01T00:00:00Z",
  "end_date": "2024-02-29T23:59:59Z",
  "draw_date": "2024-03-01T18:00:00Z",
  "subscription_cycle": "monthly",
  "terms_and_conditions": "..."
}
Response: Created scheme details
Logic:

Validate admin permissions
Validate date ranges
Create scheme record
Log audit trail


🎫 Subscription Management APIs
POST /api/subscriptions
Purpose: Subscribe card to scheme
Auth: Bearer token
Request Body:
jsonCopy{
  "card_id": "uuid",
  "scheme_id": "uuid",
  "payment_method": "upi_mandate"
}
Response:
jsonCopy{
  "success": true,
  "subscription": {
    "id": "uuid",
    "status": "active",
    "next_payment_date": "2024-02-01T00:00:00Z"
  },
  "first_invoice": {
    "id": "uuid",
    "amount_due": 100.00,
    "due_date": "2024-01-20T00:00:00Z"
  }
}
Logic:

Verify card ownership
Check scheme availability
Validate no existing subscription
Create subscription record
Generate first invoice
Initiate payment flow (TODO)

TODO: Payment gateway integration for mandate setup

GET /api/subscriptions
Purpose: Get user's subscriptions
Auth: Bearer token
Query Params: ?card_id=uuid&status=active
Response:
jsonCopy{
  "success": true,
  "subscriptions": [
    {
      "id": "uuid",
      "card_id": "uuid",
      "scheme": {
        "id": "uuid",
        "name": "Weekly Lottery",
        "subscription_amount": 100.00
      },
      "status": "active",
      "next_payment_date": "2024-02-01T00:00:00Z",
      "total_payments_made": 4,
      "last_payment_date": "2024-01-01T00:00:00Z"
    }
  ]
}
Logic:

Query user's cards and subscriptions
Join with scheme details
Filter by status if provided


PUT /api/subscriptions//pause
Purpose: Pause subscription
Auth: Bearer token (card owner)
Response: Success message
Logic:

Verify card ownership
Update status to 'paused'
Clear next payment date
Log action


PUT /api/subscriptions//cancel
Purpose: Cancel subscription
Auth: Bearer token (card owner)
Request Body:
jsonCopy{
  "reason": "financial_constraints"
}
Response: Success message
Logic:

Verify ownership
Update status to 'cancelled'
Record cancellation reason
Process any pending refunds


💰 Wallet Management APIs
GET /api/wallet/balance/
Purpose: Get wallet balances for card
Auth: Bearer token (card owner)
Response:
jsonCopy{
  "success": true,
  "balances": {
    "total_wallet_balance": 1500.00,
    "commission_wallet_balance": 750.00,
    "pending_commissions": 150.00,
    "last_updated": "2024-01-15T10:30:00Z"
  }
}
Logic:

Verify card ownership
Get real-time balances from cards table
Calculate pending commissions from commission_transactions


GET /api/wallet/transactions/
Purpose: Get wallet transaction history
Auth: Bearer token (card owner)
Query Params: ?type=credit&wallet_type=commission&page=1
Response:
jsonCopy{
  "success": true,
  "transactions": [
    {
      "id": "uuid",
      "transaction_type": "credit",
      "wallet_type": "commission",
      "amount": 50.00,
      "balance_after": 750.00,
      "description": "Commission from Level 1 referral",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {...}
}
Logic:

Verify card ownership
Query wallet_transactions with filters
Paginate results


POST /api/wallet/withdraw
Purpose: Request withdrawal
Auth: Bearer token
Request Body:
jsonCopy{
  "card_id": "uuid",
  "amount": 1000.00,
  "wallet_type": "commission",
  "bank_account_number": "1234567890",
  "bank_ifsc_code": "HDFC0000123"
}
Response:
jsonCopy{
  "success": true,
  "withdrawal_request": {
    "id": "uuid",
    "status": "pending",
    "net_amount": 975.00,
    "processing_fee": 25.00
  }
}
Logic:

Verify card ownership and KYC status
Validate sufficient balance
Calculate processing fee
Create withdrawal request
Queue for admin approval

Validations:

Minimum withdrawal: ₹100
Maximum withdrawal: ₹50,000
KYC verification required
Bank details match profile


GET /api/wallet/withdrawals/
Purpose: Get withdrawal history
Auth: Bearer token (card owner)
Response: List of withdrawal requests with status
Logic: Query withdrawal_requests with pagination

🔗 Referral & Commission APIs
GET /api/referrals/stats/
Purpose: Get referral statistics
Auth: Bearer token (card owner)
Response:
jsonCopy{
  "success": true,
  "stats": {
    "direct_referrals": 15,
    "total_network_size": 45,
    "levels": {
      "level_1": 15,
      "level_2": 20,
      "level_3": 8,
      "level_4": 2
    },
    "monthly_growth": 5,
    "active_referrals": 12
  }
}
Logic:

Query referral_tree table
Count referrals by level
Calculate growth metrics
Count active subscriptions


GET /api/commissions/earnings/
Purpose: Get commission earnings
Auth: Bearer token (card owner)
Query Params: ?period=monthly&year=2024&month=1
Response:
jsonCopy{
  "success": true,
  "earnings": {
    "total_earned": 2500.00,
    "period_earnings": 450.00,
    "pending_payout": 150.00,
    "by_level": {
      "level_1": 200.00,
      "level_2": 150.00,
      "level_3": 100.00
    },
    "recent_commissions": [
      {
        "amount": 25.00,
        "level": 1,
        "source_card": "Referral Name",
        "earned_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
Logic:

Query commission_transactions table
Filter by date range
Group by referral level
Calculate totals and pending amounts


GET /api/commissions/history/
Purpose: Get detailed commission history
Auth: Bearer token (card owner)
Logic: Paginated list of all commission transactions

📊 Analytics & Leaderboard APIs
GET /api/analytics/dashboard
Purpose: Get user dashboard analytics
Auth: Bearer token
Response:
jsonCopy{
  "success": true,
  "analytics": {
    "total_cards": 2,
    "active_subscriptions": 3,
    "total_spent": 1200.00,
    "total_commissions": 850.00,
    "recent_activities": [...],
    "upcoming_draws": [...],
    "achievements": [...]
  }
}
Logic:

Aggregate data from multiple tables
Calculate user-specific metrics
Get recent activities and achievements


GET /api/leaderboard/referrals
Purpose: Get referral leaderboard
Auth: Bearer token
Query Params: ?period=monthly&limit=50
Response:
jsonCopy{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "card_name": "Top Referrer***",
      "referral_count": 45,
      "commission_earned": 2250.00,
      "is_current_user": false
    }
  ],
  "user_position": {
    "rank": 15,
    "referral_count": 8
  }
}
Logic:

Query aggregated referral stats
Rank by referral count
Anonymize other users (partial names)
Show current user position


GET /api/leaderboard/commissions
Purpose: Get commission earnings leaderboard
Auth: Bearer token
Logic: Similar to referrals but ranked by commission earnings

🔧 Admin Management APIs
GET /api/admin/users
Purpose: Get user list (Admin only)
Auth: Bearer token + Admin role
Query Params: ?search=john&kyc_status=verified&page=1
Response:
jsonCopy{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone_number": "+91XXXXXXXXXX",
      "kyc_verified": true,
      "total_cards": 2,
      "total_subscriptions": 5,
      "created_at": "2024-01-01T00:00:00Z",
      "last_active": "2024-01-15T10:30:00Z"
    }
  ]
}
Logic:

Verify admin permissions
Query users with search filters
Join with card/subscription counts
Paginate results


GET /api/admin/transactions
Purpose: Get all transactions (Admin only)
Auth: Bearer token + Admin role
Query Params: ?type=subscription_payment&status=failed&date_from=2024-01-01
Logic:

Query transactions table with filters
Join with user/card details
Export functionality for reports


POST /api/admin/users//roles
Purpose: Assign role to user
Auth: Bearer token + Admin role
Request Body:
jsonCopy{
  "role_name": "support",
  "expires_at": "2024-12-31T23:59:59Z"
}
Logic:

Verify admin permissions
Check role hierarchy (can't assign higher roles)
Add to user_roles table
Log audit trail


PUT /api/admin/kyc//verify
Purpose: Manually verify KYC
Auth: Bearer token + Admin role
Request Body:
jsonCopy{
  "verification_notes": "Documents verified manually",
  "pan_verified": true,
  "aadhar_verified": true
}
Logic:

Update verification status
Record admin who verified
Send notification to user


💳 Payment System APIs (TODO - Future Implementation)
POST /api/payments/create-mandate
Purpose: Create UPI mandate for subscription
Auth: Bearer token
Request Body:
jsonCopy{
  "card_id": "uuid",
  "max_amount": 1000.00,
  "frequency": "monthly",
  "start_date": "2024-02-01"
}
TODO Steps:

Integrate with Razorpay/PhonePe Mandate API
Handle mandate creation workflow
Store mandate details
Set up webhook for status updates


POST /api/payments/process-subscription
Purpose: Process subscription payment via mandate
Auth: System (Cron job)
Logic:

Query due invoices
Attempt mandate debit
Update payment status
Handle failed payments
Retry mechanism

TODO Steps:

Set up payment gateway webhooks
Implement retry logic
Failed payment notifications
Grace period handling


POST /api/payments/webhook
Purpose: Handle payment gateway webhooks
Auth: Signature verification
Logic:

Verify webhook signature
Update transaction status
Process successful payments
Handle failures and disputes


🎯 Implementation Roadmap
Phase 1: Core APIs (Week 1-2)

 Authentication endpoints
 User profile management
 Basic card management
 Database triggers and functions

Phase 2: Business Logic (Week 3-4)

 KYC integration with Sandbox.co.in
 Scheme management
 Subscription system
 Referral tree building

Phase 3: Financial Features (Week 5-6)

 Wallet management
 Commission calculation
 Withdrawal system
 Basic invoicing

Phase 4: Advanced Features (Week 7-8)

 Analytics and reporting
 Leaderboards
 Achievement system
 Admin management tools

Phase 5: Payment Integration (Week 9-10)

 Payment gateway setup
 UPI Mandate integration
 Automated payment processing
 Failed payment handling

Phase 6: Optimization (Week 11-12)

 Performance optimization
 Security audit
 Load testing
 Documentation completion


🔒 Security Considerations
API Security

All endpoints use Supabase Auth tokens
Row Level Security (RLS) on all tables
Role-based permissions
Rate limiting on sensitive endpoints

Data Protection

PII encryption for KYC data
Secure bank detail handling
Audit logging for all admin actions
GDPR compliance measures

Payment Security

PCI DSS compliance for payment data
Webhook signature validation
Secure mandate handling
Transaction monitoring


📝 Error Handling Standards
Standard Error Response
jsonCopy{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid phone number format",
    "details": {
      "field": "phone_number",
      "expected": "E.164 format"
    }
  }
}
Common Error Codes

AUTH_REQUIRED: Authentication needed
PERMISSION_DENIED: Insufficient permissions
VALIDATION_ERROR: Request validation failed
NOT_FOUND: Resource not found
RATE_LIMITED: Too many requests
KYC_REQUIRED: KYC verification needed
INSUFFICIENT_BALANCE: Not enough wallet balance
PAYMENT_FAILED: Payment processing failed

This comprehensive API specification provides a solid foundation for implementing the lottery platform backend with proper authentication, business logic, and scalability considerations.