import 'package:flutter/material';
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

  // Real Google Maps integration controller & coordinates mapping
  late GoogleMapController _mapController;
  final Set<Marker> _mapMarkers = {};

  @override
  void initState() {
    super.initState();
    // Add default map marker for the property location
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
        bookingReference: "BK-${widget.property.id.toUpperCase()}",
      );

      // 2. Compute splits confirming accounting integrity
      final splits = _paymentService.calculateSplitCommission(widget.property.price);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          duration: const Duration(seconds: 5),
          backgroundColor: Colors.teal.shade900,
          content: Text(
            "M-Pesa STK Prompt Sent successfully!\n"
            "• Escrow Amount: Ksh ${splits['totalAmount']!.toInt()}\n"
            "• Rent Payout (90%): Ksh ${splits['landlordPayout']!.toInt()}\n"
            "• Platform Fee (10%): Ksh ${splits['commissionFee']!.toInt()}",
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
          ),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: Colors.red.shade900,
          content: Text("Gateway Error: ${e.toString()}"),
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
            // Hero banner area
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
                  // Title and pricing
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
                        "Ksh ${widget.property.price.toInt()}",
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
}
