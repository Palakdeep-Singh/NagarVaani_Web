import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'models/user.dart';
import 'screens/dashboard_screen.dart';
import 'screens/login_screen.dart';
import 'services/api_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiService.init();

  final prefs = await SharedPreferences.getInstance();
  final savedUser = prefs.getString('nagarvaani_user');
  UserProfile? initialUser;
  if (savedUser != null) {
    try {
      initialUser = UserProfile.fromJson(jsonDecode(savedUser));
    } catch (e) {
      print('Error parsing saved user: $e');
    }
  }

  runApp(NagarVaaniCMApp(initialUser: initialUser));
}

class NagarVaaniCMApp extends StatelessWidget {
  final UserProfile? initialUser;

  const NagarVaaniCMApp({Key? key, this.initialUser}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NagarVaani CM Portal',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F172A),
          primary: const Color(0xFF0F172A),
          secondary: const Color(0xFFF59E0B),
          background: const Color(0xFFF8FAFC),
        ),
        fontFamily: 'Roboto',
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0F172A),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        cardTheme: CardTheme(
          color: Colors.white,
          elevation: 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
        ),
      ),
      home: initialUser != null && initialUser!.role == 'Chief Minister'
          ? DashboardScreen(user: initialUser!)
          : const LoginScreen(),
    );
  }
}
