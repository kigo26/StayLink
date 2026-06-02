import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/property_model.dart';
import '../models/booking_model.dart';

class FirebaseService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Stream of authenticated user state changes
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Get current user UID
  String? get currentUid => _auth.currentUser?.uid;

  // Sign in using email & password
  Future<UserCredential> signIn(String email, String password) async {
    try {
      return await _auth.signInWithEmailAndPassword(email: email, password: password);
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    }
  }

  // Create new Tenant/Landlord account with strict verification defaults matching firestore.rules
  Future<UserCredential> signUp(String email, String password, String fullName, String role) async {
    try {
      UserCredential credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (credential.user != null) {
        // Send verification email - Required for isVerifiedUser() helper in firestore.rules
        await credential.user!.sendEmailVerification();

        // Write initial profile matching our Firestore rule schema validations
        await _db.collection('users').doc(credential.user!.uid).set({
          'uid': credential.user!.uid,
          'name': fullName,
          'email': email,
          'role': role == 'landlord' ? 'landlord' : 'tenant', // Prevent unauthorized admin roles
          'isVerified': false, // Verification managed by Admin node only
          'walletBalance': 0.0, // Initial balance locked at zero
        });
      }
      return credential;
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    }
  }

  // Sign out operation
  Future<void> signOut() async {
    await _auth.signOut();
  }

  // Get active properties stream - automatically filtering flagged items via query matching security spec
  Stream<List<PropertyModel>> streamProperties() {
    return _db.collection('properties')
        .where('isFlagged', ==: false) // Matches default query constraints for general public
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => PropertyModel.fromMap(doc.data(), doc.id))
            .toList());
  }

  // Create listing block - asserts owner matches authentication to pass firestore.rules
  Future<void> createListing(PropertyModel property) async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) throw Exception("User not authenticated.");

    // Strict validation: Ensure landlord setting matches authenticated UID (Prevents spoofing)
    _validatePropertyOwnership(property, uid);

    try {
      await _db.collection('properties').doc(property.id).set(property.toMap());
    } catch (e) {
      throw Exception("Listing Creation Blocked by Rule Engine: ${e.toString()}");
    }
  }

  // Create Escrow booking matching validation bounds
  Future<void> createEscrowBooking(BookingModel booking) async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) throw Exception("User not authenticated.");

    if (booking.tenantId != uid) {
      throw Exception("Vulnerability Blocked: Cannot book listings on behalf of other users.");
    }

    try {
      await _db.collection('bookings').doc(booking.id).set(booking.toMap());
    } catch (e) {
      throw Exception("Booking Denied by Security Rules: ${e.toString()}");
    }
  }

  // Helper validation matching firestore.rules schemas
  void _validatePropertyOwnership(PropertyModel property, String currentUid) {
    if (property.landlordId != currentUid) {
      throw SecurityException("Vulnerability Threat P5 Detected: Landlord identity mismatch. Action Blocked.");
    }
    if (property.aiQualityScore > 100) {
      throw SecurityException("Rule Validation Failure: Maximum score limit exceeded.");
    }
  }

  // Map and interpret common FirebaseAuth error codes
  Exception _handleAuthException(FirebaseAuthException exception) {
    switch (exception.code) {
      case 'user-not-found':
        return Exception('Error: No active account matches this email addresses.');
      case 'wrong-password':
        return Exception('Error: Incorrect credentials, please check and try again.');
      case 'email-already-in-use':
        return Exception('Error: An account is already registered with this email.');
      default:
        return Exception('Authorization Failure: ${exception.message}');
    }
  }
}

class SecurityException implements Exception {
  final String message;
  SecurityException(this.message);
  @override
  String toString() => "SecurityException: $message";
}
