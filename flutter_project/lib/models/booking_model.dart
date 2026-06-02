class BookingModel {
  final String id;
  final String propertyId;
  final String tenantId;
  final String landlordId;
  final double amountPaid;
  final double payoutAmount;      // 90% of amountPaid
  final double commissionAmount;  // 10% of amountPaid
  final String status;            // 'pending', 'active', 'completed', 'cancelled'
  final String escrowStatus;      // 'held', 'released', 'refunded'
  final DateTime createdAt;

  BookingModel({
    required this.id,
    required this.propertyId,
    required this.tenantId,
    required this.landlordId,
    required this.amountPaid,
    required this.payoutAmount,
    required this.commissionAmount,
    required this.status,
    required this.escrowStatus,
    required this.createdAt,
  }) {
    // Validate the critical 10% commission invariant locally before pushing to Firestore
    assert((payoutAmount + commissionAmount - amountPaid).abs() < 0.01, 
        "Financial split breakdown is mathematically inconsistent: payout ($payoutAmount) + commission ($commissionAmount) must equal amountPaid ($amountPaid)");
  }

  factory BookingModel.fromMap(Map<String, dynamic> map, String docId) {
    return BookingModel(
      id: docId,
      propertyId: map['propertyId'] ?? '',
      tenantId: map['tenantId'] ?? '',
      landlordId: map['landlordId'] ?? '',
      amountPaid: (map['amountPaid'] ?? 0.0).toDouble(),
      payoutAmount: (map['payoutAmount'] ?? 0.0).toDouble(),
      commissionAmount: (map['commissionAmount'] ?? 0.0).toDouble(),
      status: map['status'] ?? 'pending',
      escrowStatus: map['escrowStatus'] ?? 'held',
      createdAt: map['createdAt'] != null 
          ? DateTime.parse(map['createdAt']) 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'propertyId': propertyId,
      'tenantId': tenantId,
      'landlordId': landlordId,
      'amountPaid': amountPaid,
      'payoutAmount': payoutAmount,
      'commissionAmount': commissionAmount,
      'status': status,
      'escrowStatus': escrowStatus,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
