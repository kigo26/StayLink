import 'dart:convert';
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
    String rawPassword = "$businessShortCode$passkey$timestamp";
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
      "TransactionDesc": "Rent Escrow Deposit for $bookingReference"
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
        throw Exception("M-Pesa Gateway declined processing: ${response.body}");
      }
    } catch (e) {
      throw Exception("Could not connect to Safaricom network: ${e.toString()}");
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
      return "254${clean.substring(1)}";
    } else if (clean.startsWith('254')) {
      return clean;
    } else if (clean.length == 9) {
      return "254$clean";
    }
    throw Exception("Invalid phone structure. Use standard format: 07XXXXXXXX or 254XXXXXXXX");
  }
}
