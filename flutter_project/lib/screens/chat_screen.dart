import 'package:flutter/material';
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
        SnackBar(content: Text("Messaging blocked by Security policies: ${e.toString()}")),
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
                    child: Text("Error: ${snapshot.error}", style: const TextStyle(color: Colors.redAccent)),
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
                          "Encrypted peer session initialized.\nStart messaging securely.",
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
}
