class TimelineEvent {
  final String action;
  final String date;
  final String actor;
  final String? notes;

  TimelineEvent({
    required this.action,
    required this.date,
    required this.actor,
    this.notes,
  });

  factory TimelineEvent.fromJson(Map<String, dynamic> json) {
    return TimelineEvent(
      action: json['action'] ?? '',
      date: json['date'] ?? '',
      actor: json['actor'] ?? '',
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'action': action,
      'date': date,
      'actor': actor,
      'notes': notes,
    };
  }
}

class Complaint {
  final String id;
  final String title;
  final String description;
  final String category;
  final String priority;
  final String district;
  final String department;
  final String citizenName;
  final String citizenPhone;
  final String ward;
  final String status;
  final String dateFiled;
  final List<TimelineEvent> timeline;

  Complaint({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.priority,
    required this.district,
    required this.department,
    required this.citizenName,
    required this.citizenPhone,
    required this.ward,
    required this.status,
    required this.dateFiled,
    required this.timeline,
  });

  factory Complaint.fromJson(Map<String, dynamic> json) {
    var timelineList = json['timeline'] as List? ?? [];
    List<TimelineEvent> timelineEvents = timelineList
        .map((item) => TimelineEvent.fromJson(item))
        .toList();

    return Complaint(
      id: json['id'] ?? json['_id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      priority: json['priority'] ?? '',
      district: json['district'] ?? '',
      department: json['department'] ?? '',
      citizenName: json['citizenName'] ?? '',
      citizenPhone: json['citizenPhone'] ?? '',
      ward: json['ward'] ?? '',
      status: json['status'] ?? '',
      dateFiled: json['dateFiled'] ?? '',
      timeline: timelineEvents,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'priority': priority,
      'district': district,
      'department': department,
      'citizenName': citizenName,
      'citizenPhone': citizenPhone,
      'ward': ward,
      'status': status,
      'dateFiled': dateFiled,
      'timeline': timeline.map((e) => e.toJson()).toList(),
    };
  }
}
