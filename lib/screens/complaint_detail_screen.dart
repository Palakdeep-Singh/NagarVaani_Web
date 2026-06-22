import 'package:flutter/material.dart';
import '../models/complaint.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class ComplaintDetailScreen extends StatefulWidget {
  final Complaint complaint;
  final UserProfile user;

  const ComplaintDetailScreen({Key? key, required this.complaint, required this.user}) : super(key: key);

  @override
  State<ComplaintDetailScreen> createState() => _ComplaintDetailScreenState();
}

class _ComplaintDetailScreenState extends State<ComplaintDetailScreen> {
  final _remarkController = TextEditingController();
  bool _isUpdating = false;
  String? _errorMessage;

  late Complaint _currentComplaint;

  @override
  void initState() {
    super.initState();
    _currentComplaint = widget.complaint;
  }

  @override
  void dispose() {
    _remarkController.dispose();
    super.dispose();
  }

  Future<void> _updateStatus(String status, String actionLabel) async {
    final remark = _remarkController.text.trim();
    if (remark.isEmpty) {
      setState(() {
        _errorMessage = 'Remarks are mandatory for performing status modifications.';
      });
      return;
    }

    setState(() {
      _isUpdating = true;
      _errorMessage = null;
    });

    final updated = await ApiService.updateComplaintStatus(
      id: _currentComplaint.id,
      status: status,
      remarkText: remark,
      actor: 'Chief Minister Office (${widget.user.username})',
      action: actionLabel,
    );

    setState(() {
      _isUpdating = false;
    });

    if (updated != null) {
      setState(() {
        _currentComplaint = updated;
        _remarkController.clear();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Grievance status successfully updated to $status.')),
      );
    } else {
      setState(() {
        _errorMessage = 'Failed to execute status update on backend. Verify connection.';
      });
    }
  }

  void _escalateToCS() async {
    final remark = _remarkController.text.trim();
    final remarkText = remark.isNotEmpty
        ? remark
        : 'Chief Minister Direct Directive: Transmitted directly to Chief Secretary for instant departmental accountability.';

    setState(() {
      _isUpdating = true;
      _errorMessage = null;
    });

    final updated = await ApiService.updateComplaintStatus(
      id: _currentComplaint.id,
      status: 'Escalated',
      remarkText: remarkText,
      actor: 'Chief Minister Office',
      action: 'Chief Minister Direct Directive',
    );

    setState(() {
      _isUpdating = false;
    });

    if (updated != null) {
      setState(() {
        _currentComplaint = updated;
        _remarkController.clear();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Case escalated directly to the Chief Secretary (CS).')),
      );
    } else {
      setState(() {
        _errorMessage = 'Failed to escalate to Chief Secretary.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    Color statusColor;
    switch (_currentComplaint.status) {
      case 'Pending':
        statusColor = Colors.amber;
        break;
      case 'Active':
        statusColor = Colors.blue;
        break;
      case 'Escalated':
        statusColor = Colors.red;
        break;
      case 'Resolved':
        statusColor = Colors.green;
        break;
      default:
        statusColor = Colors.grey;
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Detail: ${_currentComplaint.id}',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ),
      body: _isUpdating
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Status & Priority Banner
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, py: 4),
                                decoration: BoxDecoration(
                                  color: statusColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: statusColor.withOpacity(0.4)),
                                ),
                                child: Text(
                                  _currentComplaint.status.toUpperCase(),
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: statusColor),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, py: 4),
                                decoration: BoxDecoration(
                                  color: _currentComplaint.priority == 'Emergency'
                                      ? Colors.red.shade50
                                      : Colors.grey.shade100,
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(
                                    color: _currentComplaint.priority == 'Emergency'
                                        ? Colors.red.shade200
                                        : Colors.grey.shade300,
                                  ),
                                ),
                                child: Text(
                                  'PRIORITY: ${_currentComplaint.priority.toUpperCase()}',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: _currentComplaint.priority == 'Emergency' ? Colors.red : Colors.black87,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _currentComplaint.title,
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _currentComplaint.description,
                            style: const TextStyle(fontSize: 13, height: 1.4, color: Colors.black54),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Metadata Details Card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'METADATA DETAILS',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey, letterSpacing: 0.5),
                          ),
                          const Divider(),
                          _buildMetaRow('Category', _currentComplaint.category),
                          _buildMetaRow('District', _currentComplaint.district),
                          _buildMetaRow('Department', _currentComplaint.department),
                          _buildMetaRow('Ward/Location', _currentComplaint.ward),
                          _buildMetaRow('Citizen Name', _currentComplaint.citizenName),
                          _buildMetaRow('Citizen Contact', _currentComplaint.citizenPhone),
                          _buildMetaRow('Filed On', _currentComplaint.dateFiled),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Timeline Events Tracking
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'RESOLUTION TIMELINE',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey, letterSpacing: 0.5),
                          ),
                          const Divider(),
                          const SizedBox(height: 8),
                          ...List.generate(_currentComplaint.timeline.length, (index) {
                            final ev = _currentComplaint.timeline[index];
                            final isLast = index == _currentComplaint.timeline.length - 1;
                            return IntrinsicHeight(
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Column(
                                    children: [
                                      Container(
                                        width: 10,
                                        height: 10,
                                        decoration: BoxDecoration(
                                          color: isLast ? Colors.indigo.shade900 : Colors.indigo.shade300,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      if (!isLast)
                                        Expanded(
                                          child: Container(
                                            width: 2,
                                            color: Colors.indigo.shade200,
                                          ),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Padding(
                                      padding: const EdgeInsets.only(bottom: 16.0),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            ev.action,
                                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                                          ),
                                          Text(
                                            '${ev.date} · Actor: ${ev.actor}',
                                            style: const TextStyle(fontSize: 11, color: Colors.grey),
                                          ),
                                          if (ev.notes != null && ev.notes!.isNotEmpty) ...[
                                            const SizedBox(height: 4),
                                            Text(
                                              'Notes: ${ev.notes!}',
                                              style: const TextStyle(fontSize: 12, color: Colors.black87),
                                            ),
                                          ],
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Update Status & Command Box
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'OFFICIAL COMMAND WORKSPACE',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey, letterSpacing: 0.5),
                          ),
                          const Divider(),
                          if (_errorMessage != null) ...[
                            Text(_errorMessage!, style: const TextStyle(color: Colors.red, fontSize: 11.5)),
                            const SizedBox(height: 8),
                          ],
                          TextField(
                            controller: _remarkController,
                            maxLines: 3,
                            decoration: const InputDecoration(
                              labelText: 'Official Remarks (Mandary for updates)',
                              alignLabelWithHint: true,
                              border: OutlineInputBorder(),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: () => _updateStatus('Active', 'Investigation Initiated'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.blue.shade800,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                                  ),
                                  child: const Text('Active', style: TextStyle(fontSize: 12)),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: () => _updateStatus('Resolved', 'Grievance Redressed'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.green.shade800,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                                  ),
                                  child: const Text('Resolve', style: TextStyle(fontSize: 12)),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: () => _updateStatus('Escalated', 'Departmental Escalation'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.orange.shade800,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                                  ),
                                  child: const Text('Escalate', style: TextStyle(fontSize: 12)),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          ElevatedButton.icon(
                            onPressed: _escalateToCS,
                            icon: const Icon(Icons.arrow_upward, size: 16),
                            label: const Text('Escalate to Chief Secretary (CS)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red.shade900,
                              foregroundColor: Colors.white,
                              minimumSize: const Size(double.infinity, 40),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),
                ],
              ),
            ),
      onWillPop: () async {
        Navigator.pop(context, true);
        return false;
      },
    );
  }

  Widget _buildMetaRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5, color: Colors.black54),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 12.5, color: Colors.black87),
            ),
          ),
        ],
      ),
    );
  }
}
