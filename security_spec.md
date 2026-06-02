# StayLink AI Security Specifications & Threat Model (TDD)

## 1. Core Data Invariants
1. **User Profiles (`/users/{userId}`)**:
   - A user profile can only be created by the authenticated user whose `request.auth.uid` matches the `{userId}` path.
   - The user cannot elevate their own role to `"admin"`. Initial roles default to `"tenant"` or `"landlord"`.
   - The user cannot self-verify (`isVerified`) or modify their `walletBalance` directly through client modifications.
   - Access to check a user profile is restricted: public profile details (name, avatar, role) can be read, but PII data (phone, email, walletBalance) is strictly restricted to the resource owner or admin.

2. **Properties listings (`/properties/{propertyId}`)**:
   - Only registered landlords or admins can create/update listings.
   - `landlordId` must match the creator's authenticated UID.
   - `aiQualityScore` and `isFlagged` are system-computed and immutable by client writes.
   - Anyone can read properties that are not flagged. Flagged properties are only visible to the listing landlord or admin.

3. **Escrow Bookings (`/bookings/{bookingId}`)**:
   - A booking can only be created if the caller is the tenant (`tenantId == request.auth.uid`).
   - The `status` and `escrowStatus` represent critical money flows. Only the tenant, landlord, or admin can read a booking document.
   - State transition rules:
     - When completed, the escrow amount is released and status is set to `completed`.
     - Once in a terminal status (`completed` or `cancelled`), no further edits can occur.
   - Total amount paid must be validated, and split commissions (exactly 10%) must be reconciled.

4. **Transactions Ledger (`/transactions/{trxId}`)**:
   - Transactions are immutable ledger entries (`allow update, delete: if false`).
   - Transactions can only be created with `userId` matching `request.auth.uid`.

---

## 2. The "Dirty Dozen" Payloads (Vulnerability Scenarios)

These 12 payloads represent attacks trying to bypass rules. All must return `PERMISSION_DENIED`:

### P1: Admin Role Privilege Escalation (Users Bypass)
- **Target**: `/users/attacker_uid`
- **Payload**: `{ "uid": "attacker_uid", "email": "attacker@gmail.com", "name": "Attacker", "role": "admin", "isVerified": false, "walletBalance": 0 }`
- **Result**: `PERMISSION_DENIED` (Cannot write `role: "admin"` directly).

### P2: Fake Self-Verification (Identity Spoofing)
- **Target**: `/users/attacker_uid`
- **Payload**: `{ "uid": "attacker_uid", "email": "attacker@gmail.com", "name": "Attacker", "role": "tenant", "isVerified": true }`
- **Result**: `PERMISSION_DENIED` (Direct self-verification blocked).

### P3: Theft of Wallet Funds (Direct Balance Override)
- **Target**: `/users/attacker_uid` (Updating existing record)
- **Payload**: `{ "walletBalance": 1000000 }`
- **Result**: `PERMISSION_DENIED` (Cannot modify `walletBalance` directly).

### P4: Profile Hijacking (Writing to another User's PID)
- **Target**: `/users/victim_uid`
- **Payload**: `{ "uid": "victim_uid", "name": "Victim Impersonator" }`
- **Result**: `PERMISSION_DENIED` (uid mismatch with `request.auth.uid`).

### P5: Landlord Identity Spoofing (Property Ownership Theft)
- **Target**: `/properties/prop123` (Creating as user `landlord_b`)
- **Payload**: `{ "id": "prop123", "title": "Elite Kilimani Villa", "price": 50000, "location": "Kilimani, Nairobi", "type": "apartment", "landlordId": "victim_landlord", "aiQualityScore": 1.0, "isFlagged": false }`
- **Result**: `PERMISSION_DENIED` (Cannot set `landlordId` to a different user ID than the caller).

### P6: Forged Premium Quality Scores (Bypassing AI Scanners)
- **Target**: `/properties/prop123` (Creating property)
- **Payload**: `{ "id": "prop123", "title": "Standard Room", "price": 10000, "location": "Westlands, Nairobi", "type": "roommate", "landlordId": "attacker_uid", "aiQualityScore": 999.0, "isFlagged": false }`
- **Result**: `PERMISSION_DENIED` (Writing unverified `aiQualityScore`).

### P7: Unflagging Flagged Scams (Cybersecurity Overrides)
- **Target**: `/properties/scam_prop_999` (Updating flagged property)
- **Payload**: `{ "isFlagged": false }`
- **Result**: `PERMISSION_DENIED` (Tenant or landlord cannot manually unflag listings).

### P8: Fraudulent Relational Bookings (Booking on behalf of others)
- **Target**: `/bookings/booking_111`
- **Payload**: `{ "id": "booking_111", "propertyId": "prop_999", "tenantId": "unwitting_victim_uid", "amountPaid": 20000, "status": "pending", "escrowStatus": "held" }`
- **Result**: `PERMISSION_DENIED` (tenantId in write payload does not match caller's uid).

### P9: Illegal Fee Bypassing (Reducing Commisison Amount)
- **Target**: `/bookings/booking_222`
- **Payload**: `{ "id": "booking_222", "propertyId": "prop_a", "tenantId": "attacker_uid", "amountPaid": 50000, "payoutAmount": 49999, "commissionAmount": 1, "status": "pending", "escrowStatus": "held" }`
- **Result**: `PERMISSION_DENIED` (10% split commission layout must equal exactly 10% of amountPaid).

### P10: Escrow State Hijacking (Direct Cash Release Request)
- **Target**: `/bookings/booking_333` (Updating booking to trigger payout without admin/bank logic)
- **Payload**: `{ "escrowStatus": "released" }`
- **Result**: `PERMISSION_DENIED` (Only authorized parties can release escrow, subject to rules).

### P11: Immutable Ledger Corruption (Modifying Transaction)
- **Target**: `/transactions/mpesa_tx_999`
- **Payload**: `{ "status": "success", "amount": 999999 }`
- **Result**: `PERMISSION_DENIED` (Transactions are write-once / immutable).

### P12: Resource Exhaustion ID Poisoning (DOS Attack on Key Fields)
- **Target**: `/users/attacker_uid_with_massive_junk_id_over_128_chars_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Payload**: `{ "uid": "attacker_uid", "email": "attacker@gmail.com", "name": "Attacker" }`
- **Result**: `PERMISSION_DENIED` (ID path parameter length check fails).

---

## 3. Test Runner Design (`firestore.rules.test.ts`)
Below is the unit test template checking these boundaries:

```typescript
// firestore.rules.test.ts
// This details the exact mock test cases executed to secure our production environment.
```
