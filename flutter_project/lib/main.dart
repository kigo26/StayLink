import 'package:flutter/material';
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
}
