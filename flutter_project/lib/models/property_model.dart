import 'package:cloud_firestore/cloud_firestore.dart';

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
    };
  }
}
