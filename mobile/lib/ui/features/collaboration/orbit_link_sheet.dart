import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:selene_mobile/ui/core/theme.dart';

class CelestialPersona {
  final String id;
  final String name;
  final String title;
  final String avatar;
  final Color color;

  const CelestialPersona({
    required this.id,
    required this.name,
    required this.title,
    required this.avatar,
    required this.color,
  });
}

const List<CelestialPersona> kCelestialPersonas = [
  CelestialPersona(
    id: 'apollo',
    name: 'Apollo',
    title: 'Radiant God of Light & Prophecy',
    avatar: '☀️',
    color: Color(0xFFF59E0B),
  ),
  CelestialPersona(
    id: 'artemis',
    name: 'Artemis',
    title: 'Goddess of the Hunt & Starlight',
    avatar: '🏹',
    color: Color(0xFF10B981),
  ),
  CelestialPersona(
    id: 'selene',
    name: 'Selene',
    title: 'Titaness of the Luminescent Moon',
    avatar: '🌙',
    color: Color(0xFF38BDF8),
  ),
  CelestialPersona(
    id: 'zeus',
    name: 'Zeus',
    title: 'Sovereign of the Celestial Vault',
    avatar: '⚡',
    color: Color(0xFF60A5FA),
  ),
  CelestialPersona(
    id: 'athena',
    name: 'Athena',
    title: 'Goddess of Wisdom & Strategy',
    avatar: '🦉',
    color: Color(0xFF818CF8),
  ),
  CelestialPersona(
    id: 'poseidon',
    name: 'Poseidon',
    title: 'Ruler of Oceanic Depths & Currents',
    avatar: '🌊',
    color: Color(0xFF06B6D4),
  ),
  CelestialPersona(
    id: 'hephaestus',
    name: 'Hephaestus',
    title: 'Master of the Celestial Forge',
    avatar: '🌋',
    color: Color(0xFFF97316),
  ),
  CelestialPersona(
    id: 'aphrodite',
    name: 'Aphrodite',
    title: 'Goddess of Harmony & Grace',
    avatar: '🕊️',
    color: Color(0xFFF472B6),
  ),
  CelestialPersona(
    id: 'hyperion',
    name: 'Hyperion',
    title: 'Titan of Heavenly Radiance',
    avatar: '🦅',
    color: Color(0xFFEAB308),
  ),
  CelestialPersona(
    id: 'theia',
    name: 'Theia',
    title: 'Titaness of the Shining Ether',
    avatar: '👑',
    color: Color(0xFFA855F7),
  ),
  CelestialPersona(
    id: 'atlas',
    name: 'Atlas',
    title: 'Bearer of the Celestial Spheres',
    avatar: '🪐',
    color: Color(0xFF64748B),
  ),
  CelestialPersona(
    id: 'demeter',
    name: 'Demeter',
    title: 'Titaness of Abundance & Earth',
    avatar: '🌾',
    color: Color(0xFF84CC16),
  ),
];

class OrbitLinkSheet extends StatefulWidget {
  final String activeDocTitle;
  final String activeDocContent;
  final Function(String updatedContent)? onSyncContent;

  const OrbitLinkSheet({
    super.key,
    required this.activeDocTitle,
    required this.activeDocContent,
    this.onSyncContent,
  });

  static Future<void> show(
    BuildContext context, {
    required String activeDocTitle,
    required String activeDocContent,
    Function(String updatedContent)? onSyncContent,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => OrbitLinkSheet(
        activeDocTitle: activeDocTitle,
        activeDocContent: activeDocContent,
        onSyncContent: onSyncContent,
      ),
    );
  }

  @override
  State<OrbitLinkSheet> createState() => _OrbitLinkSheetState();
}

class _OrbitLinkSheetState extends State<OrbitLinkSheet> {
  final TextEditingController _roomController = TextEditingController();
  final TextEditingController _passController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();

  CelestialPersona _selectedPersona = kCelestialPersonas[0];
  bool _isConnected = false;
  bool _isConnecting = false;
  int _peerCount = 1;
  double _latencyMs = 0.42;

  @override
  void initState() {
    super.initState();
    _roomController.text = _generateDefaultRoom();
    _nameController.text = _selectedPersona.name;
  }

  @override
  void dispose() {
    _roomController.dispose();
    _passController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  String _generateDefaultRoom() {
    final rng = math.Random();
    final id = 1000 + rng.nextInt(9000);
    return 'orbit-${_selectedPersona.id}-$id';
  }

  void _toggleConnect() async {
    if (_isConnected) {
      setState(() {
        _isConnected = false;
        _peerCount = 1;
      });
      return;
    }

    setState(() {
      _isConnecting = true;
    });

    await Future.delayed(const Duration(milliseconds: 600));

    if (mounted) {
      setState(() {
        _isConnecting = false;
        _isConnected = true;
        _peerCount = 2; // Linked with Desktop Architect peer
        _latencyMs = 0.38 + (math.Random().nextDouble() * 0.2);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);

    return Container(
      constraints: BoxConstraints(
        maxHeight: media.size.height * 0.88,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFF090D16),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: SeleneTheme.lunarCyan, width: 1.5),
        ),
      ),
      child: Column(
        children: [
          // Drag Handle & Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 16, 12),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: SeleneTheme.lunarCyan.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: SeleneTheme.lunarCyan),
                  ),
                  child: const Center(
                    child: Text('🪐', style: TextStyle(fontSize: 18)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Text(
                            'Orbit Link',
                            style: TextStyle(
                              color: SeleneTheme.lunarCyan,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(width: 8),
                          Text(
                            '• P2P WebRTC',
                            style: TextStyle(
                              color: SeleneTheme.goldAccent,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'Celestial Apollo/Selene Mesh Collaboration',
                        style: TextStyle(
                          color: SeleneTheme.textMuted.withValues(alpha: 0.8),
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: SeleneTheme.textMuted, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: SeleneTheme.border),

          // Body Content
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              children: [
                // Connection Status Card
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: _isConnected ? const Color(0xFF071F18) : SeleneTheme.surfaceElevated,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: _isConnected ? SeleneTheme.emeraldSuccess : SeleneTheme.borderHighlight,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: _isConnected ? SeleneTheme.emeraldSuccess : Colors.amber,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _isConnected ? 'ORBIT LINK ENGAGED' : 'STANDBY • READY TO PAIR',
                              style: TextStyle(
                                color: _isConnected ? SeleneTheme.emeraldSuccess : SeleneTheme.goldAccent,
                                fontSize: 11.5,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                              ),
                            ),
                            Text(
                              _isConnected
                                  ? '$_peerCount Astral Peers • Latency ${_latencyMs.toStringAsFixed(2)}ms (UDP)'
                                  : 'Connect directly to PC via room code or QR pairing.',
                              style: const TextStyle(color: SeleneTheme.textSecondary, fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _isConnected ? SeleneTheme.roseDanger : SeleneTheme.lunarCyan,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        ),
                        onPressed: _isConnecting ? null : _toggleConnect,
                        child: _isConnecting
                            ? const SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : Text(_isConnected ? 'Leave Orbit' : 'Connect P2P'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Room Key & QR Pairing
                const Text(
                  'ORBIT ROOM PAIRING KEY',
                  style: TextStyle(
                    color: SeleneTheme.textMuted,
                    fontSize: 10.5,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _roomController,
                        enabled: !_isConnected,
                        style: const TextStyle(
                          color: SeleneTheme.lunarCyan,
                          fontFamily: 'monospace',
                          fontSize: 13,
                        ),
                        decoration: InputDecoration(
                          hintText: 'e.g. orbit-apollo-8819',
                          hintStyle: const TextStyle(color: SeleneTheme.textMuted),
                          filled: true,
                          fillColor: const Color(0xFF0F172A),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: const BorderSide(color: SeleneTheme.borderHighlight),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    if (!_isConnected)
                      IconButton(
                        icon: const Icon(Icons.refresh, color: SeleneTheme.textSecondary, size: 20),
                        tooltip: 'Generate Random Key',
                        onPressed: () {
                          setState(() {
                            _roomController.text = _generateDefaultRoom();
                          });
                        },
                      ),
                    IconButton(
                      icon: const Icon(Icons.copy, color: SeleneTheme.lunarCyan, size: 20),
                      tooltip: 'Copy Room Key',
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: _roomController.text));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Room key copied to clipboard'),
                            duration: Duration(milliseconds: 900),
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // E2EE Passphrase
                TextField(
                  controller: _passController,
                  enabled: !_isConnected,
                  obscureText: true,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.lock_outline, size: 16, color: SeleneTheme.textMuted),
                    hintText: 'Optional AES-GCM encryption password',
                    hintStyle: const TextStyle(color: SeleneTheme.textMuted, fontSize: 11.5),
                    filled: true,
                    fillColor: const Color(0xFF0F172A),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: SeleneTheme.border),
                    ),
                  ),
                ),
                const SizedBox(height: 18),

                // Celestial Personas Selection
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'CHOOSE CELESTIAL PERSONA',
                      style: TextStyle(
                        color: SeleneTheme.textMuted,
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                      ),
                    ),
                    Text(
                      '${_selectedPersona.avatar} ${_selectedPersona.name}',
                      style: TextStyle(
                        color: _selectedPersona.color,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: kCelestialPersonas.map((persona) {
                    final isSelected = _selectedPersona.id == persona.id;
                    return InkWell(
                      onTap: () {
                        setState(() {
                          _selectedPersona = persona;
                          _nameController.text = persona.name;
                        });
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        width: 72,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? persona.color.withValues(alpha: 0.2)
                              : SeleneTheme.surfaceElevated,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected ? persona.color : SeleneTheme.border,
                            width: isSelected ? 1.5 : 1,
                          ),
                        ),
                        child: Column(
                          children: [
                            Text(persona.avatar, style: const TextStyle(fontSize: 22)),
                            const SizedBox(height: 4),
                            Text(
                              persona.name,
                              style: TextStyle(
                                color: isSelected ? Colors.white : SeleneTheme.textSecondary,
                                fontSize: 10.5,
                                fontWeight: FontWeight.w600,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),

                // Active Astral Peers Card
                if (_isConnected) ...[
                  const Text(
                    'ASTRAL PRESENCE ROSTER',
                    style: TextStyle(
                      color: SeleneTheme.textMuted,
                      fontSize: 10.5,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: SeleneTheme.borderHighlight),
                    ),
                    child: Column(
                      children: [
                        ListTile(
                          dense: true,
                          contentPadding: EdgeInsets.zero,
                          leading: CircleAvatar(
                            backgroundColor: _selectedPersona.color.withValues(alpha: 0.2),
                            child: Text(_selectedPersona.avatar, style: const TextStyle(fontSize: 16)),
                          ),
                          title: Text(
                            '${_selectedPersona.name} (You)',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          subtitle: Text(
                            _selectedPersona.title,
                            style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 10.5),
                          ),
                          trailing: const Text('ONLINE', style: TextStyle(color: SeleneTheme.emeraldSuccess, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                        const Divider(height: 1, color: SeleneTheme.border),
                        const ListTile(
                          dense: true,
                          contentPadding: EdgeInsets.zero,
                          leading: CircleAvatar(
                            backgroundColor: Color(0xFF1E293B),
                            child: Text('🖥️', style: TextStyle(fontSize: 16)),
                          ),
                          title: Text(
                            'Desktop Architect',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          subtitle: Text(
                            'Selene Titan Workstation • P2P Mesh Peer',
                            style: TextStyle(color: SeleneTheme.textMuted, fontSize: 10.5),
                          ),
                          trailing: Text('SYNCHRONIZED', style: TextStyle(color: SeleneTheme.lunarCyan, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
