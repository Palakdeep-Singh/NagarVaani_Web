class UserProfile {
  final String id;
  final String username;
  final String role;
  final String? district;
  final String? department;

  UserProfile({
    required this.id,
    required this.username,
    required this.role,
    this.district,
    this.department,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] ?? json['_id'] ?? '',
      username: json['username'] ?? '',
      role: json['role'] ?? '',
      district: json['district'],
      department: json['department'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'role': role,
      'district': district,
      'department': department,
    };
  }
}
