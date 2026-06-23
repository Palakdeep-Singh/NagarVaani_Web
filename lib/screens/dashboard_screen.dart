import 'package:flutter/material.dart';
import '../models/complaint.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import 'complaint_detail_screen.dart';
import 'login_screen.dart';

class DashboardScreen extends StatefulWidget {
  final UserProfile user;

  const DashboardScreen({Key? key, required this.user}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;
  List<Complaint> _allComplaints = [];
  bool _isLoading = false;

  // Filters
  String _filterDistrict = 'All';
  String _filterStatus = 'All';
  String _filterPriority = 'All';
  String _searchQuery = '';

  final List<String> _districts = [
    'All', 'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi',
    'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'
  ];

  final List<String> _statuses = ['All', 'Pending', 'Active', 'Escalated', 'Resolved'];
  final List<String> _priorities = ['All', 'Emergency', 'High', 'Medium', 'Low'];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });
    final fetched = await ApiService.fetchComplaints();
    setState(() {
      _allComplaints = fetched;
      _isLoading = false;
    });
  }

  void _handleLogout() async {
    await ApiService.logout();
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  int get _totalCount => _allComplaints.length;
  int get _pendingCount => _allComplaints.where((c) => c.status == 'Pending').length;
  int get _activeCount => _allComplaints.where((c) => c.status == 'Active').length;
  int get _escalatedCount => _allComplaints.where((c) => c.status == 'Escalated').length;
  int get _resolvedCount => _allComplaints.where((c) => c.status == 'Resolved').length;

  int _getDaysOpen(String dateStr) {
    try {
      final parsed = DateTime.parse(dateStr);
      return DateTime.now().difference(parsed).inDays;
    } catch (_) {
      return 1;
    }
  }

  int get _slaBreachCount =>
      _allComplaints.where((c) => c.status != 'Resolved' && _getDaysOpen(c.dateFiled) > 21).length;

  int get _emergencyCount =>
      _allComplaints.where((c) => c.priority == 'Emergency' && c.status != 'Resolved').length;

  List<Complaint> get _filteredComplaints {
    return _allComplaints.where((c) {
      bool matchesDistrict = _filterDistrict == 'All' || c.district == _filterDistrict;
      bool matchesStatus = _filterStatus == 'All' || c.status == _filterStatus;
      bool matchesPriority = _filterPriority == 'All' || c.priority == _filterPriority;
      bool matchesSearch = _searchQuery.isEmpty ||
          c.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          c.id.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          c.description.toLowerCase().contains(_searchQuery.toLowerCase());

      return matchesDistrict && matchesStatus && matchesPriority && matchesSearch;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: SafeArea(
        child: Column(
          children: [
            // Tricolor Strip
            Row(
              children: [
                Expanded(child: Container(height: 4, color: const Color(0xFFFF9933))),
                Expanded(child: Container(height: 4, color: Colors.white)),
                Expanded(child: Container(height: 4, color: const Color(0xFF128807))),
              ],
            ),
            // Header Gov Bar
            Container(
              color: const Color(0xFF071534),
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Text('🇮🇳  ', style: TextStyle(fontSize: 12)),
                      Text(
                        'Government of National Capital Territory of Delhi',
                        style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  Text(
                    'CLASSIFICATION: RESTRICTED',
                    style: TextStyle(color: Colors.amber, fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                ],
              ),
            ),
            // Main Top Bar
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEEF2F6),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: const Text(
                          'EXECUTIVE COMMAND CENTER',
                          style: TextStyle(color: Color(0xFF4F46E5), fontSize: 9, fontWeight: FontWeight.extrabold, letterSpacing: 0.5),
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Grievance Command Cockpit',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.extrabold, color: Color(0xFF0F172A)),
                      ),
                    ],
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.refresh, color: Color(0xFF2563EB)),
                    onPressed: _loadData,
                  ),
                  IconButton(
                    icon: const Icon(Icons.logout, color: Colors.redAccent),
                    onPressed: _handleLogout,
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: Color(0xFFE2E8F0)),
            // Body Area
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : RefreshIndicator(
                      onRefresh: _loadData,
                      child: IndexedStack(
                        index: _currentIndex,
                        children: [
                          _buildOverviewTab(),
                          _buildRegisterTab(),
                          _buildAiSuggestionsTab(),
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        selectedItemColor: const Color(0xFFF59E0B),
        unselectedItemColor: Colors.white60,
        backgroundColor: const Color(0xFF071534),
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'Overview',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.format_list_bulleted),
            activeIcon: Icon(Icons.format_list_bulleted_sharp),
            label: 'Register',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.psychology_outlined),
            activeIcon: Icon(Icons.psychology),
            label: 'AI Insights',
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() {
    final double slaPct = _totalCount > 0 ? (_slaBreachCount / _totalCount) * 100 : 0.0;

    // Calculate District Risk Scores
    final Map<String, int> pendingByDistrict = {};
    final Map<String, int> criticalByDistrict = {};
    for (var d in _districts.where((name) => name != 'All')) {
      pendingByDistrict[d] = 0;
      criticalByDistrict[d] = 0;
    }

    for (var c in _allComplaints) {
      if (c.status != 'Resolved') {
        pendingByDistrict[c.district] = (pendingByDistrict[c.district] ?? 0) + 1;
        if (c.priority == 'Emergency' || c.priority == 'High') {
          criticalByDistrict[c.district] = (criticalByDistrict[c.district] ?? 0) + 1;
        }
      }
    }

    final List<Map<String, dynamic>> riskList = [];
    pendingByDistrict.forEach((district, pendingCount) {
      final critCount = criticalByDistrict[district] ?? 0;
      final score = (pendingCount * 2) + (critCount * 5);
      riskList.add({
        'district': district,
        'pending': pendingCount,
        'score': score,
      });
    });
    riskList.sort((a, b) => b['score'].compareTo(a['score']));

    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Emergency Alert Banner
          if (_emergencyCount > 0)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFCA5A5), width: 1.5),
              ),
              child: Stack(
                children: [
                  Positioned(
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: 4,
                    child: Container(color: const Color(0xFFDC2626)),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(width: 8),
                        const Icon(Icons.warning, color: Color(0xFFDC2626), size: 24),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Text(
                                    'CRITICAL ESCALATION ALERT',
                                    style: TextStyle(
                                      color: Color(0xFF991B1B),
                                      fontWeight: FontWeight.extrabold,
                                      fontSize: 12,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  SizedBox(width: 8),
                                  Icon(Icons.circle, size: 6, color: Color(0xFFDC2626)),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '$_emergencyCount emergency grievances remain unresolved. Immediate intervention mandated within 2 hours.',
                                style: const TextStyle(color: Color(0xFFB91C1C), fontSize: 11, height: 1.3),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          // Premium KPI Grid (6 Cards, identical to web theme color accents)
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.45,
            children: [
              _buildStatCard('Total Volume', '$_totalCount', const Color(0xFF2563EB), Icons.insert_drive_file_outlined),
              _buildStatCard('Pending Triage', '$_pendingCount', const Color(0xFFF59E0B), Icons.access_time),
              _buildStatCard('Active Work', '$_activeCount', const Color(0xFF2563EB), Icons.autorenew),
              _buildStatCard('Escalated', '$_escalatedCount', const Color(0xFFF59E0B), Icons.security),
              _buildStatCard('SLA Breach Rate', '${slaPct.toStringAsFixed(0)}%', const Color(0xFFDC2626), Icons.warning_amber_rounded),
              _buildStatCard('Emergency', '$_emergencyCount', const Color(0xFFDC2626), Icons.check_circle_outline),
            ],
          ),
          const SizedBox(height: 20),

          // Status Distribution Card (Rendered identical to segmented horizontal bar in web UI)
          Card(
            color: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.insert_chart_outlined_outlined, size: 16, color: Color(0xFF4F46E5)),
                      SizedBox(width: 8),
                      Text(
                        'GRIEVANCE STATUS DISTRIBUTION',
                        style: TextStyle(fontWeight: FontWeight.extrabold, fontSize: 11, letterSpacing: 0.5, color: Color(0xFF1E293B)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Segmented Horizontal Bar Chart
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: SizedBox(
                      height: 16,
                      child: Row(
                        children: [
                          if (_pendingCount > 0)
                            Expanded(
                              flex: _pendingCount,
                              child: Container(color: const Color(0xFFF59E0B)),
                            ),
                          if (_activeCount > 0)
                            Expanded(
                              flex: _activeCount,
                              child: Container(color: const Color(0xFF2563EB)),
                            ),
                          if (_escalatedCount > 0)
                            Expanded(
                              flex: _escalatedCount,
                              child: Container(color: const Color(0xFFDC2626)),
                            ),
                          if (_resolvedCount > 0)
                            Expanded(
                              flex: _resolvedCount,
                              child: Container(color: const Color(0xFF16A34A)),
                            ),
                          if (_totalCount == 0)
                            Expanded(
                              child: Container(color: Colors.grey.shade300),
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Horizontal Legend Grid
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildLegendItem('Pending', _pendingCount, const Color(0xFFF59E0B)),
                      _buildLegendItem('Active', _activeCount, const Color(0xFF2563EB)),
                      _buildLegendItem('Escalated', _escalatedCount, const Color(0xFFDC2626)),
                      _buildLegendItem('Resolved', _resolvedCount, const Color(0xFF16A34A)),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Priority Action List (Risk Score) Card (matches web overview dashboard layout)
          Card(
            color: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.shield_outlined, size: 16, color: Color(0xFFF59E0B)),
                      SizedBox(width: 8),
                      Text(
                        'PRIORITY ACTION LIST (RISK SCORE)',
                        style: TextStyle(fontWeight: FontWeight.extrabold, fontSize: 11, letterSpacing: 0.5, color: Color(0xFF1E293B)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: riskList.take(5).length,
                    separatorBuilder: (context, index) => const Divider(height: 1, color: Color(0xFFF1F5F9)),
                    itemBuilder: (context, index) {
                      final item = riskList[index];
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 12.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item['district'],
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${item['pending']} pending issues',
                                  style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFFBEB),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: const Color(0xFFFDE68A)),
                              ),
                              child: Text(
                                'Score: ${item['score']}',
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.extrabold, color: Color(0xFFB45309)),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color, IconData icon) {
    return Card(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      child: Stack(
        children: [
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            child: Container(color: color),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.06),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(icon, color: color, size: 18),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      value,
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.extrabold, color: Color(0xFF0F172A), letterSpacing: -0.5),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      label.toUpperCase(),
                      style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 0.5),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, int count, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(width: 8, height: 8, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2))),
            const SizedBox(width: 4),
            Text(
              label,
              style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          '$count',
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.extrabold, color: Color(0xFF1E293B)),
        ),
      ],
    );
  }

  Widget _buildRegisterTab() {
    final complaints = _filteredComplaints;

    return Column(
      children: [
        // Search & Filter Panel
        Container(
          color: Colors.white,
          padding: const EdgeInsets.all(12),
          child: Column(
            children: [
              TextField(
                onChanged: (val) {
                  setState(() {
                    _searchQuery = val;
                  });
                },
                decoration: InputDecoration(
                  hintText: 'Search by Ref ID, Title, Description...',
                  prefixIcon: const Icon(Icons.search, size: 18, color: Color(0xFF64748B)),
                  fillColor: const Color(0xFFF8FAFC),
                  filled: true,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                ),
              ),
              const SizedBox(height: 8),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildDropdownFilter('District', _filterDistrict, _districts, (val) {
                      setState(() {
                        _filterDistrict = val!;
                      });
                    }),
                    const SizedBox(width: 6),
                    _buildDropdownFilter('Status', _filterStatus, _statuses, (val) {
                      setState(() {
                        _filterStatus = val!;
                      });
                    }),
                    const SizedBox(width: 6),
                    _buildDropdownFilter('Priority', _filterPriority, _priorities, (val) {
                      setState(() {
                        _filterPriority = val!;
                      });
                    }),
                  ],
                ),
              ),
            ],
          ),
        ),
        const Divider(height: 1, color: Color(0xFFE2E8F0)),

        // Table Rows Styled Register List
        Expanded(
          child: complaints.isEmpty
              ? const Center(child: Text('No grievances found.'))
              : ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: complaints.length,
                  itemBuilder: (context, index) {
                    final c = complaints[index];
                    return _buildComplaintCard(c);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildDropdownFilter(String label, String value, List<String> items, ValueChanged<String?> onChanged) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          onChanged: onChanged,
          icon: const Icon(Icons.arrow_drop_down, size: 16),
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
          items: items.map((item) {
            return DropdownMenuItem<String>(
              value: item,
              child: Text(item == 'All' ? 'All ${label}s' : item),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildComplaintCard(Complaint c) {
    Color cardColor;
    Color statusColor;
    switch (c.status) {
      case 'Pending':
        cardColor = const Color(0xFFFFFBEB); // light amber
        statusColor = const Color(0xFFD97706);
        break;
      case 'Active':
        cardColor = const Color(0xFFEFF6FF); // light blue
        statusColor = const Color(0xFF2563EB);
        break;
      case 'Escalated':
        cardColor = const Color(0xFFFEF2F2); // light red
        statusColor = const Color(0xFFDC2626);
        break;
      case 'Resolved':
        cardColor = const Color(0xFFF0FDF4); // light green
        statusColor = const Color(0xFF16A34A);
        break;
      default:
        cardColor = Colors.white;
        statusColor = Colors.grey;
    }

    return Card(
      color: cardColor,
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: statusColor.withOpacity(0.15)),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () async {
          final updated = await Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => ComplaintDetailScreen(complaint: c, user: widget.user),
            ),
          );
          if (updated == true) {
            _loadData();
          }
        },
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    c.id,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'monospace', color: Color(0xFF1E293B)),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: statusColor.withOpacity(0.3)),
                    ),
                    child: Text(
                      c.status.toUpperCase(),
                      style: TextStyle(fontSize: 8, fontWeight: FontWeight.extrabold, color: statusColor),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                c.title,
                style: const TextStyle(fontWeight: FontWeight.extrabold, fontSize: 13, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 4),
              Text(
                c.description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 11, color: Color(0xFF475569)),
              ),
              const SizedBox(height: 10),
              const Divider(height: 1, color: Color(0x1F000000)),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.location_on, size: 11, color: Color(0xFF64748B)),
                  const SizedBox(width: 4),
                  Text(c.district, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                  const SizedBox(width: 12),
                  const Icon(Icons.corporate_fare, size: 11, color: Color(0xFF64748B)),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      c.department,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAiSuggestionsTab() {
    final waterSewageCount = _allComplaints.where((c) => c.category == 'Water & Sewage' && c.status != 'Resolved').length;
    final infraCount = _allComplaints.where((c) => c.category == 'Civic Infrastructure' && c.status != 'Resolved').length;
    final powerCount = _allComplaints.where((c) => c.category == 'Electricity & Power' && c.status != 'Resolved').length;

    final List<Map<String, String>> suggestions = [];
    if (waterSewageCount > 2) {
      suggestions.add({
        'rule': 'Water Infrastructure Alert',
        'desc': 'System has detected high volume of pending water/drainage issues. Recommend directing Delhi Jal Board to initiate pipeline inspections.',
      });
    }
    if (infraCount > 2) {
      suggestions.add({
        'rule': 'Road & Pavement Mandate',
        'desc': 'Infra issues showing spike in density. Suggest triggering targeted repair funds for municipal wards with high public density.',
      });
    }
    if (powerCount > 1) {
      suggestions.add({
        'rule': 'Power Load Optimization',
        'desc': 'Frequent power failure reports resolved slowly. Flagging for load balancing intervention prior to summer peak.',
      });
    }

    if (suggestions.length < 2) {
      suggestions.add({
        'rule': 'General SLA Optimization Directive',
        'desc': 'Automated analysis suggests resolving pending triage issues within 48 hours to prevent overall citizen rating degradation.',
      });
      suggestions.add({
        'rule': 'Inter-Departmental Coordination',
        'desc': 'Sync pending cross-department files to expedite SLA redressal across PWD and Municipal Councils.',
      });
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: suggestions.length,
      itemBuilder: (context, index) {
        final sug = suggestions[index];
        return Card(
          color: const Color(0xFFEEF2F6),
          margin: const EdgeInsets.only(bottom: 12),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: Color(0xFFC7D2FE)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.psychology, color: Color(0xFF4F46E5), size: 18),
                    const SizedBox(width: 8),
                    Text(
                      sug['rule']!.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.extrabold,
                        color: Color(0xFF312E81),
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  sug['desc']!,
                  style: const TextStyle(fontSize: 12, height: 1.4, color: Color(0xFF1E293B)),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
