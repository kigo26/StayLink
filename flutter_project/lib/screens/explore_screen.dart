import 'package:flutter/material';
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
  Widget build(key) {
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
                          "Error loading properties: ${snapshot.error}",
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
          // Simulated property Image with AI badge
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
                          "AI ${property.aiQualityScore.toInt()}%",
                          style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.tealAccent),
                        ),
                      ],
                    ),
                  ),
                )
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
                      "Ksh ${property.price.toInt()}/mo",
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
    // Standard modular implementation
  }
}
