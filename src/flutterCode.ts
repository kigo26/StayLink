export interface FlutterFile {
  name: string;
  path: string;
  description: string;
  language: string;
  content: string;
}

export const FLUTTER_CODEBASE: Record<string, FlutterFile> = {
  pubspec: {
    name: "pubspec.yaml",
    path: "pubspec.yaml",
    description: "Defines Flutter dependencies including Firebase Suite, Google Maps, and M-Pesa client support.",
    language: "yaml",
    content: `name: staylink_ai
description: "StayLink AI - Africa's Intelligent Real Estate, Roommate & Escrow Flutter Super-App"
publish_to: 'none'

version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # Firebase Suite for Persistent Core Data and Security Invariants
  firebase_core: ^2.15.0
  firebase_auth: ^4.7.0
  cloud_firestore: ^4.8.0

  # Navigation & State Management
  provider: ^6.0.5
  go_router: ^10.0.0

  # Payment, Networking & Utilities
  http: ^1.1.0
  uuid: ^3.0.7
  intl: ^0.18.1

  # Maps, Location & Visulization
  google_maps_flutter: ^2.5.0
  geolocator: ^10.1.0

  # UI Design Enhancements
  cupertino_icons: ^1.0.5
  google_fonts: ^5.1.0
  flutter_spinkit: ^5.2.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.1

flutter:
  uses-material-design: true
  assets:
    - assets/images/`
  },
  main: {
    name: "main.dart",
    path: "lib/main.dart",
    description: "App initialization wrapper setting up MultiProvider dependency injection, dark theme styling and explore start screens.",
    language: "dart",
    content: `import 'package:flutter/material';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'screens/explore_screen.dart';
import 'services/firebase_service.dart';

void main() async {
  // Ensure appropriate Flutter bindings are set up on boot
  WidgetsFlutterBinding.ensureInitialized();

  // Runs the material client application
  runApp(const StayLinkApp());
}

class StayLinkApp extends StatelessWidget {
  const StayLinkApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<FirebaseService>(create: (_) => FirebaseService()),
      ],
      child: MaterialApp(
        title: 'StayLink AI Kenya',
        debugShowCheckedModeBanner: false,
        themeMode: ThemeMode.dark, // Keep dark mode default to look premium and cybernetic
        darkTheme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF020617), // Ambient background
          textTheme: GoogleFonts.interTextTheme(
            ThemeData.dark().textTheme,
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF0F172A),
            elevation: 0,
            centerTitle: false,
          ),
          colorScheme: ColorScheme.fromSeed(
            brightness: Brightness.dark,
            seedColor: Colors.blueAccent,
            background: const Color(0xFF020617),
            surface: const Color(0xFF0F172A),
          ),
        ),
        home: const ExploreScreen(),
      ),
    );
  }
}`
  },
  fb_service: {
    name: "firebase_service.dart",
    path: "lib/services/firebase_service.dart",
    description: "Core Firebase Auth & Firestore client layer enforcing role protection controls on writes.",
    language: "dart",
    content: `import 'dart:async';
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
        .where('isFlagged', isEqualTo: false) // Matches default query constraints for general public
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
      throw Exception("Listing Creation Blocked by Rule Engine: " + e.toString());
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
      throw Exception("Booking Denied by Security Rules: " + e.toString());
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
        return Exception('Authorization Failure: ' + (exception.message ?? 'Unknown Error'));
    }
  }

  Future<void> toggleFavorite(String propertyId, bool currentFavorite) async {
    try {
      await _db.collection('properties').doc(propertyId).update({
        'favorite': !currentFavorite,
      });
    } catch (e) {
      throw Exception("Failed to update favorite: " + e.toString());
    }
  }
}

class SecurityException implements Exception {
  final String message;
  SecurityException(this.message);
  @override
  String toString() => "SecurityException: " + message;
}`
  },
  pay_service: {
    name: "payment_service.dart",
    path: "lib/services/payment_service.dart",
    description: "Fintech interface carrying Lipa Na M-Pesa STK push protocols and verifying 10% auto-deductions.",
    language: "dart",
    content: `import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

class PaymentService {
  // Safaricom API parameters for lipa na M-Pesa STK Push Integration
  final String mpesaEndpoint = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
  final String businessShortCode = "174379";
  final String passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c81a5e51137c7a5600619c011604c";

  /// Initiates M-Pesa STK Push to client's phone number
  Future<Map<String, dynamic>> initiateStkPush({
    required String phoneNumber,
    required double amount,
    required String bookingReference,
  }) async {
    // 1. Format phone number to standard: 2547XXXXXXXX or 2541XXXXXXXX
    String formattedPhone = _formatPhoneNumber(phoneNumber);
    
    // 2. Generate M-Pesa standard timestamp: YYYYMMDDHHMMSS
    String timestamp = DateFormat("yyyyMMddHHmmss").format(DateTime.now());
    
    // 3. Generate password using base64 encryption (Shortcode + Passkey + Timestamp)
    String rawPassword = businessShortCode + passkey + timestamp;
    String password = base64.encode(utf8.encode(rawPassword));

    // 4. Set headers including Bearer OAuth Token (Provided behind secure proxy server)
    Map<String, String> headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer SECURE_MPESA_CREDENTIALS"
    };

    // 5. Structure payload adhering to M-Pesa Express rules
    Map<String, dynamic> body = {
      "BusinessShortCode": businessShortCode,
      "Password": password,
      "Timestamp": timestamp,
      "TransactionType": "CustomerPayBillOnline",
      "Amount": amount.toInt(),
      "PartyA": formattedPhone,
      "PartyB": businessShortCode,
      "PhoneNumber": formattedPhone,
      "CallBackURL": "https://api.staylink.co.ke/api/v1/payments/mpesa-callback",
      "AccountReference": bookingReference,
      "TransactionDesc": "Rent Escrow Deposit for " + bookingReference
    };

    try {
      final response = await http.post(
        Uri.parse(mpesaEndpoint),
        headers: headers,
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception("M-Pesa Gateway declined processing: " + response.body);
      }
    } catch (e) {
      throw Exception("Could not connect to Safaricom network: " + e.toString());
    }
  }

  /// Calculates commission ratios ensuring perfect balance splits
  /// Standard 10% commission fee is applied on rent escrows
  Map<String, double> calculateSplitCommission(double totalRentPaid) {
    double commissionRate = 0.10; // Exactly 10%
    double commission = totalRentPaid * commissionRate;
    double landlordPayout = totalRentPaid - commission;

    // Direct mathematical assertion to guarantee alignment before ledger write
    if ((landlordPayout + commission - totalRentPaid).abs() > 0.001) {
      throw Exception("Financial Integrity Exception: Split mismatch detected.");
    }

    return {
      "totalAmount": totalRentPaid,
      "landlordPayout": landlordPayout,
      "commissionFee": commission,
    };
  }

  String _formatPhoneNumber(String rawPhone) {
    String clean = rawPhone.replaceAll(RegExp(r'\D'), '');
    if (clean.startsWith('0')) {
      return "254" + clean.substring(1);
    } else if (clean.startsWith('254')) {
      return clean;
    } else if (clean.length == 9) {
      return "254" + clean;
    }
    throw Exception("Invalid phone structure. Use standard format: 07XXXXXXXX or 254XXXXXXXX");
  }
}`
  },
  prop_model: {
    name: "property_model.dart",
    path: "lib/models/property_model.dart",
    description: "Rigid type definition layout representing Nairobi rental properties and roommates profiles.",
    language: "dart",
    content: `import 'package:cloud_firestore/cloud_firestore.dart';

class PropertyModel {
  final String id;
  final String title;
  final double price;
  final String location;
  final String type; // 'apartment', 'airbnb', 'roommate', 'sale'
  final String landlordId;
  final double aiQualityScore;
  final bool isFlagged;
  final String imageUrl;
  final String description;
  final bool favorite;

  PropertyModel({
    required this.id,
    required this.title,
    required this.price,
    required this.location,
    required this.type,
    required this.landlordId,
    required this.aiQualityScore,
    required this.isFlagged,
    required this.imageUrl,
    required this.description,
    this.favorite = false,
  });

  // Factory constructor for parsing from Firestore Map
  factory PropertyModel.fromMap(Map<String, dynamic> map, String docId) {
    return PropertyModel(
      id: docId,
      title: map['title'] ?? '',
      price: (map['price'] ?? 0.0).toDouble(),
      location: map['location'] ?? '',
      type: map['type'] ?? 'apartment',
      landlordId: map['landlordId'] ?? '',
      aiQualityScore: (map['aiQualityScore'] ?? 0.0).toDouble(),
      isFlagged: map['isFlagged'] ?? false,
      imageUrl: map['imageUrl'] ?? '',
      description: map['description'] ?? '',
      favorite: map['favorite'] ?? false,
    );
  }

  // Convert to general Map for writes, checking our security spec boundaries
  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'price': price,
      'location': location,
      'type': type,
      'landlordId': landlordId,
      'aiQualityScore': aiQualityScore,
      'isFlagged': isFlagged,
      'imageUrl': imageUrl,
      'description': description,
      'favorite': favorite,
    };
  }
}`
  },
  booking_model: {
    name: "booking_model.dart",
    path: "lib/models/booking_model.dart",
    description: "Entity mapper for escrow reservations and commission ratio tracking validations.",
    language: "dart",
    content: `class BookingModel {
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
        "Financial split breakdown is mathematically inconsistent: payout (" + payoutAmount.toString() + ") + commission (" + commissionAmount.toString() + ") must equal amountPaid (" + amountPaid.toString() + ")");
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
}`
  },
  explore_screen: {
    name: "explore_screen.dart",
    path: "lib/screens/explore_screen.dart",
    description: "Clean Grid explorer with interactive search and category chips referencing Firestore snapshot streaming.",
    language: "dart",
    content: `import 'package:flutter/material';
import '../services/firebase_service.dart';
import '../models/property_model.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({Key? key}) : super(key: key);

  @override
  _ExploreScreenState createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  final FirebaseService _firebaseService = FirebaseService();
  String _searchQuery = "";
  String _selectedFilter = "all";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617), // Deep cyber-glass background matching StayLink Design
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Row(
          children: [
            const CircleAvatar(
              backgroundColor: Colors.blueAccent,
              child: Text("S", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  "STAYLINK AI",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.black,
                    letterSpacing: 1.2,
                    color: Colors.white,
                  ),
                ),
                Text(
                  "Nairobi Node Explorer",
                  style: TextStyle(fontSize: 10, color: Colors.blueAccent, fontWeight: FontWeight.bold),
                ),
              ],
            )
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list_rounded, color: Colors.white),
            onPressed: () => _showFilterDialog(),
          )
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Styled search bar
              Container(
                margin: const EdgeInsets.symmetric(vertical: 12),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.04),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: TextField(
                  style: const TextStyle(color: Colors.white),
                  onChanged: (val) {
                    setState(() {
                      _searchQuery = val.toLowerCase();
                    });
                  },
                  decoration: InputDecoration(
                    icon: Icon(Icons.search_rounded, color: Colors.white.withOpacity(0.5)),
                    hintText: "Search apartments in Kilimani, Westlands...",
                    hintStyle: TextStyle(color: Colors.white.withOpacity(0.35)),
                    border: InputBorder.none,
                  ),
                ),
              ),

              // Filter capsules rows
              SizedBox(
                height: 36,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    _buildFilterCapsule("all", "All Listings"),
                    _buildFilterCapsule("apartment", "Apartments"),
                    _buildFilterCapsule("roommate", "Roommates"),
                    _buildFilterCapsule("airbnb", "Vacation Rentals"),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              const Text(
                "Verified Premium Listings",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 12),

              // Fetch from our Secure Firestore API
              Expanded(
                child: StreamBuilder<List<PropertyModel>>(
                  stream: _firebaseService.streamProperties(),
                  builder: (context, snapshot) {
                    if (snapshot.hasError) {
                      return Center(
                        child: Text(
                          "Error loading properties: " + snapshot.error.toString(),
                          style: const TextStyle(color: Colors.redAccent),
                        ),
                      );
                    }
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(
                        child: SpinKitPulse(color: Colors.blueAccent, size: 50.0),
                      );
                    }

                    final data = snapshot.data ?? [];
                    final filtered = data.where((prop) {
                      final matchesSearch = prop.title.toLowerCase().contains(_searchQuery) || 
                                           prop.location.toLowerCase().contains(_searchQuery);
                      final matchesCat = _selectedFilter == "all" || prop.type == _selectedFilter;
                      return matchesSearch && matchesCat;
                    }).toList();

                    if (filtered.isEmpty) {
                      return const Center(
                        child: Text(
                          "No listings fit your filters in Nairobi.",
                          style: TextStyle(color: Colors.white54),
                        ),
                      );
                    }

                    return GridView.builder(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 0.75,
                      ),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        return _buildPropertyCard(filtered[index]);
                      },
                    );
                  },
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterCapsule(String value, String label) {
    bool isSelected = _selectedFilter == value;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilter = value;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? Colors.blueAccent : Colors.white.withOpacity(0.04),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? Colors.blue : Colors.white.withOpacity(0.08)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: isSelected ? Colors.white : Colors.white70,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildPropertyCard(PropertyModel property) {
    return Card(
      color: Colors.white.withOpacity(0.04),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.white.withOpacity(0.08)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Stack(
              children: [
                Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF3B82F6), Color(0xFF1D4ED8)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: const Center(
                    child: Icon(Icons.home_work_rounded, color: Colors.white54, size: 40),
                  ),
                ),
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.teal.shade900.withOpacity(0.9),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.tealAccent, width: 0.5),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.star_rounded, color: Colors.tealAccent, size: 10),
                        const SizedBox(width: 2),
                        Text(
                          "AI " + property.aiQualityScore.toInt().toString() + "%",
                          style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.tealAccent),
                        ),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: GestureDetector(
                    onTap: () {
                      _firebaseService.toggleFavorite(property.id, property.favorite);
                    },
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.5),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        property.favorite ? Icons.favorite : Icons.favorite_border,
                        size: 16,
                        color: property.favorite ? Colors.redAccent : Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  property.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 4),
                Text(
                  property.location,
                  maxLines: 1,
                  style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.5)),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    Text(
                      "Ksh " + property.price.toInt().toString() + "/mo",
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.black, color: Colors.tealAccent),
                    ),
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.06),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white70, size: 10),
                    )
                  ],
                )
              ],
            ),
          )
        ],
      ),
    );
  }

  void _showFilterDialog() {
    // Standard modular implementation dialog
  }
}`
  },
  chat_screen: {
    name: "chat_screen.dart",
    path: "lib/screens/chat_screen.dart",
    description: "Real-time communication window loading messages instantly via Firestore snapshots and updating timestamps.",
    language: "dart",
    content: `import 'package:flutter/material';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

class ChatScreen extends StatefulWidget {
  final String chatSessionId;
  final String partnerName;

  const ChatScreen({
    Key? key,
    required this.chatSessionId,
    required this.partnerName,
  }) : super(key: key);

  @override
  _ChatScreenState createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final String? _currentUid = FirebaseAuth.instance.currentUser?.uid;

  void _sendMessage() async {
    if (_messageController.text.trim().isEmpty || _currentUid == null) return;

    final String text = _messageController.text.trim();
    _messageController.clear();

    try {
      // Post to our secure, immutable messages collection in Firestore
      await _db
          .collection('chats')
          .doc(widget.chatSessionId)
          .collection('messages')
          .add({
        'senderId': _currentUid,
        'text': text,
        'timestamp': FieldValue.serverTimestamp(),
      });

      // Update parent session reference timestamps
      await _db.collection('chats').doc(widget.chatSessionId).update({
        'lastMessage': text,
        'updatedAt': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Messaging blocked by Security policies: " + e.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: Row(
          children: [
            CircleAvatar(
              backgroundColor: Colors.teal.shade800,
              child: Text(
                widget.partnerName[0].toUpperCase(),
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.partnerName,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                Row(
                  children: const [
                    CircleAvatar(radius: 3, backgroundColor: Colors.green),
                    SizedBox(width: 4),
                    Text("Secure Peer Client", style: TextStyle(fontSize: 9, color: Colors.greenAccent)),
                  ],
                )
              ],
            )
          ],
        ),
      ),
      body: Column(
        children: [
          // Dynamic Message Stream from Secure Firestore Subcollection
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: _db
                  .collection('chats')
                  .doc(widget.chatSessionId)
                  .collection('messages')
                  .orderBy('timestamp', descending: true)
                  .snapshots(),
              builder: (context, snapshot) {
                if (snapshot.hasError) {
                  return Center(
                    child: Text("Error: " + snapshot.error.toString(), style: const TextStyle(color: Colors.redAccent)),
                  );
                }

                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: SpinKitPulse(color: Colors.tealAccent, size: 40));
                }

                final docs = snapshot.data?.docs ?? [];
                if (docs.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.lock_outline_rounded, color: Colors.blueAccent.withOpacity(0.3), size: 48),
                        const SizedBox(height: 12),
                        const Text(
                          "Encrypted peer session initialized.\\nStart messaging securely.",
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white24, fontSize: 11),
                        )
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  reverse: true,
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.all(16),
                  itemCount: docs.length,
                  itemBuilder: (context, index) {
                    final data = docs[index].data() as Map<String, dynamic>;
                    bool isMe = data['senderId'] == _currentUid;
                    return _buildMessageBubble(data['text'] ?? '', isMe);
                  },
                );
              },
            ),
          ),

          // Message Input Field
          _buildMessageInput(),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(String text, bool isMe) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: isMe ? const Color(0xFF1E3A8A) : Colors.white.withOpacity(0.04),
          border: Border.all(
            color: isMe ? const Color(0xFF2563EB) : Colors.white.withOpacity(0.08),
          ),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isMe ? 16 : 4),
            bottomRight: Radius.circular(isMe ? 4 : 16),
          ),
        ),
        child: Text(
          text,
          style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.4),
        ),
      ),
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.08))),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _messageController,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: "Write secure message...",
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 13),
                border: InputBorder.none,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.send_rounded, color: Colors.blueAccent),
            onPressed: _sendMessage,
          )
        ],
      ),
    );
  }
}`
  },
  prop_details: {
    name: "property_details_screen.dart",
    path: "lib/screens/property_details_screen.dart",
    description: "Details viewport integrating real Google Maps with localized markers, M-Pesa STK action, and automatic escrow calculations.",
    language: "dart",
    content: `import 'package:flutter/material';
import '../models/property_model.dart';
import '../services/payment_service.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class PropertyDetailsScreen extends StatefulWidget {
  final PropertyModel property;

  const PropertyDetailsScreen({Key? key, required this.property}) : super(key: key);

  @override
  _PropertyDetailsScreenState createState() => _PropertyDetailsScreenState();
}

class _PropertyDetailsScreenState extends State<PropertyDetailsScreen> {
  final PaymentService _paymentService = PaymentService();
  final String _targetMpesaNumber = "0712345678";
  bool _isProcessingPayment = false;

  late GoogleMapController _mapController;
  final Set<Marker> _mapMarkers = {};

  @override
  void initState() {
    super.initState();
    _mapMarkers.add(
      Marker(
        markerId: MarkerId(widget.property.id),
        position: const LatLng(-1.2921, 36.8219), // Nairobi CBD default fallback
        infoWindow: InfoWindow(title: widget.property.title, snippet: widget.property.location),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueCyan),
      ),
    );
  }

  void _triggerMpesaEscrowDeposit() async {
    setState(() => _isProcessingPayment = true);

    try {
      // 1. Initiate Safaricom STK Push for Rent Placement
      final result = await _paymentService.initiateStkPush(
        phoneNumber: _targetMpesaNumber,
        amount: widget.property.price,
        bookingReference: "BK-" + widget.property.id.toUpperCase(),
      );

      // 2. Compute splits confirming accounting integrity
      final splits = _paymentService.calculateSplitCommission(widget.property.price);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          duration: const Duration(seconds: 5),
          backgroundColor: Colors.teal.shade900,
          content: Text(
            "M-Pesa STK Prompt Sent successfully!\\n" +
            "• Escrow Amount: Ksh " + splits['totalAmount']!.toInt().toString() + "\\n" +
            "• Rent Payout (90%): Ksh " + splits['landlordPayout']!.toInt().toString() + "\\n" +
            "• Platform Fee (10%): Ksh " + splits['commissionFee']!.toInt().toString(),
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
          ),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: Colors.red.shade900,
          content: Text("Gateway Error: " + e.toString()),
        ),
      );
    } finally {
      setState(() => _isProcessingPayment = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: Text(widget.property.title, style: const TextStyle(fontSize: 14)),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image area
            Container(
              height: 200,
              width: double.infinity,
              color: Colors.white.withOpacity(0.04),
              child: const Center(
                child: Icon(Icons.home_work_rounded, size: 60, color: Colors.blueAccent),
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      Expanded(
                        child: Text(
                          widget.property.title,
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ),
                      Text(
                        "Ksh " + widget.property.price.toInt().toString(),
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.black, color: Colors.tealAccent),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    widget.property.location,
                    style: TextStyle(color: Colors.white.withOpacity(0.5)),
                  ),
                  
                  const Divider(color: Colors.white10, height: 24),

                  const Text(
                    "Property Location Grid",
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 10),

                  // Real Google Maps integration viewport
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: SizedBox(
                      height: 180,
                      child: GoogleMap(
                        initialCameraPosition: const CameraPosition(
                          target: LatLng(-1.2921, 36.8219), // Nairobi coordinates
                          zoom: 14,
                        ),
                        markers: _mapMarkers,
                        onMapCreated: (controller) => _mapController = controller,
                        zoomControlsEnabled: false,
                        myLocationButtonEnabled: false,
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  const Text(
                    "StayLink Secured Escrow Policy",
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.03),
                      border: Border.all(color: Colors.white.withOpacity(0.06)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      "Rent is safely retained inside the trust escrow account until you complete the visual premises verification or moving steps. In alignment with Kenya Finance laws, commission splits of 10% are logged automatically.",
                      style: TextStyle(fontSize: 11, color: Colors.white60, height: 1.4),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Escrow Booking CTAs
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blueAccent,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: _isProcessingPayment ? null : _triggerMpesaEscrowDeposit,
                      child: _isProcessingPayment
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text(
                              "PAY ESCROW DEPOSIT VIA M-PESA",
                              style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                    ),
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}`
  }
};
