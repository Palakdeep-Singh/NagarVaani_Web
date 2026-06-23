import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/complaint.dart';
import '../models/user.dart';

class ApiService {
  // 10.0.2.2 is the IP address pointing to host machine's localhost from Android Emulator
  static String baseUrl = 'http://10.0.2.2:5000/api/v1';
  static String? _token;

  static Future<void> _loadToken() async {
    if (_token == null) {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('nagarvaani_token');
    }
  }

  static Future<void> setBaseUrl(String url) async {
    baseUrl = url;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('nagarvaani_base_url', url);
  }

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final savedUrl = prefs.getString('nagarvaani_base_url');
    if (savedUrl != null) {
      baseUrl = savedUrl;
    }
    await _loadToken();
  }

  static Future<UserProfile?> login(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _token = data['token'];
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('nagarvaani_token', _token!);
        await prefs.setString('nagarvaani_user', jsonEncode(data['user']));

        return UserProfile.fromJson(data['user']);
      }
    } catch (e) {
      print('Login error: $e');
    }
    return null;
  }

  static Future<void> logout() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('nagarvaani_token');
    await prefs.remove('nagarvaani_user');
  }

  static Future<List<Complaint>> fetchComplaints() async {
    await _loadToken();
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/complaints'),
        headers: {
          'Content-Type': 'application/json',
          if (_token != null) 'Authorization': 'Bearer $_token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((item) => Complaint.fromJson(item)).toList();
      }
    } catch (e) {
      print('Fetch complaints error: $e');
    }
    return [];
  }

  static Future<Complaint?> updateComplaintStatus({
    required String id,
    required String status,
    required String remarkText,
    required String actor,
    required String action,
    Map<String, dynamic>? additionalFields,
  }) async {
    await _loadToken();
    try {
      final payload = {
        'status': status,
        'remarkText': remarkText,
        'actor': actor,
        'action': action,
        if (additionalFields != null) ...additionalFields,
      };

      final response = await http.patch(
        Uri.parse('$baseUrl/complaints/$id/status'),
        headers: {
          'Content-Type': 'application/json',
          if (_token != null) 'Authorization': 'Bearer $_token',
        },
        body: jsonEncode(payload),
      );

      if (response.statusCode == 200) {
        return Complaint.fromJson(jsonDecode(response.body));
      }
    } catch (e) {
      print('Update status error: $e');
    }
    return null;
  }
}
