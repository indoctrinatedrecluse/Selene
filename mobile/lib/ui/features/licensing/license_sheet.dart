import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:selene_mobile/data/services/license_service.dart';
import 'package:selene_mobile/ui/core/theme.dart';

class LicenseSheet extends StatefulWidget {
  final bool isDismissible;

  const LicenseSheet({super.key, this.isDismissible = true});

  @override
  State<LicenseSheet> createState() => _LicenseSheetState();
}

class _LicenseSheetState extends State<LicenseSheet> {
  final TextEditingController _keyController = TextEditingController();
  final TextEditingController _userController = TextEditingController();
  final TextEditingController _passController = TextEditingController();

  bool _isMasked = true;
  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void dispose() {
    _keyController.dispose();
    _userController.dispose();
    _passController.dispose();
    super.dispose();
  }

  bool get _requiresCredentials {
    final upper = _keyController.text.trim().toUpperCase();
    return upper.startsWith('DEV-') || upper.startsWith('USER-');
  }

  Future<void> _handleActivate() async {
    final licenseService = context.read<LicenseService>();
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final res = await licenseService.activateLicense(
        licenseKey: _keyController.text,
        username: _userController.text,
        password: _passController.text,
      );

      if (mounted) {
        setState(() {
          if (res.success) {
            _successMessage = res.message;
            _keyController.clear();
            _userController.clear();
            _passController.clear();
          } else {
            _errorMessage = res.message;
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Activation error: ${e.toString()}';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handleDeactivate() async {
    final licenseService = context.read<LicenseService>();
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: SeleneTheme.surfaceElevated,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: SeleneTheme.roseDanger),
        ),
        title: const Row(
          children: [
            Text('⚠️', style: TextStyle(fontSize: 18)),
            SizedBox(width: 8),
            Text('Revert to Trial?', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 16)),
          ],
        ),
        content: const Text(
          'This will remove your current commercial license from this device and restore the tamper-protected 60-Day Trial mode.',
          style: TextStyle(color: SeleneTheme.textSecondary, fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: SeleneTheme.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: SeleneTheme.roseDanger,
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Remove License'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      setState(() => _isLoading = true);
      await licenseService.deactivateLicense();
      if (mounted) {
        setState(() {
          _isLoading = false;
          _successMessage = 'License removed. Reverted to 60-Day Evaluation Trial.';
        });
      }
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'active':
        return SeleneTheme.emeraldSuccess;
      case 'trial':
        return SeleneTheme.lunarCyan;
      case 'expired':
        return SeleneTheme.goldAccent;
      case 'tampered':
      default:
        return SeleneTheme.roseDanger;
    }
  }

  String _getTierBadge(LicenseTier tier) {
    switch (tier) {
      case LicenseTier.admin:
        return 'ENTERPRISE ADMIN';
      case LicenseTier.dev:
        return 'DEVELOPER SUITE';
      case LicenseTier.user:
        return 'USER SEAT';
      case LicenseTier.trial:
        return 'TITAN EVALUATION TRIAL';
    }
  }

  @override
  Widget build(BuildContext context) {
    final licenseService = context.watch<LicenseService>();
    final status = licenseService.currentStatus;
    final statusColor = _getStatusColor(status.status);
    final maxHeight = MediaQuery.of(context).size.height * 0.90;

    return PopScope(
      canPop: widget.isDismissible && !status.isLocked,
      child: Container(
        constraints: BoxConstraints(maxHeight: maxHeight),
        padding: EdgeInsets.fromLTRB(16, 12, 16, MediaQuery.of(context).viewInsets.bottom + 24),
        decoration: const BoxDecoration(
          color: SeleneTheme.surfaceElevated,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drag handle
              if (widget.isDismissible && !status.isLocked)
                Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: SeleneTheme.borderHighlight,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),

              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: SeleneTheme.goldAccent.withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: SeleneTheme.goldAccent.withValues(alpha: 0.4)),
                    ),
                    child: const Text('🛡️', style: TextStyle(fontSize: 20)),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Selene License & Device Vault',
                          style: TextStyle(
                            color: SeleneTheme.textPrimary,
                            fontSize: 16.5,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Cryptographic Node-Lock & Attestation Manager',
                          style: TextStyle(color: SeleneTheme.textSecondary, fontSize: 11.5),
                        ),
                      ],
                    ),
                  ),
                  if (widget.isDismissible && !status.isLocked)
                    IconButton(
                      icon: const Icon(Icons.close, size: 20, color: SeleneTheme.textSecondary),
                      onPressed: () => Navigator.pop(context),
                    ),
                ],
              ),

              const SizedBox(height: 16),

              // Current License Status Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: SeleneTheme.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: statusColor.withValues(alpha: 0.5)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Tier & Status Dot
                    Row(
                      children: [
                        Container(
                          width: 9,
                          height: 9,
                          margin: const EdgeInsets.only(right: 8),
                          decoration: BoxDecoration(
                            color: statusColor,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(color: statusColor.withValues(alpha: 0.5), blurRadius: 6),
                            ],
                          ),
                        ),
                        Text(
                          _getTierBadge(status.type),
                          style: TextStyle(
                            color: statusColor,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                          ),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: statusColor.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                          ),
                          child: Text(
                            status.status.toUpperCase(),
                            style: TextStyle(
                              color: statusColor,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 12),

                    // License Key
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Key:', style: TextStyle(color: SeleneTheme.textSecondary, fontSize: 12)),
                        Row(
                          children: [
                            SelectableText(
                              _isMasked ? status.maskedKey : status.key,
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                color: SeleneTheme.textPrimary,
                                fontSize: 12.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            IconButton(
                              icon: Icon(_isMasked ? Icons.visibility : Icons.visibility_off, size: 16, color: SeleneTheme.textSecondary),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                              onPressed: () => setState(() => _isMasked = !_isMasked),
                            ),
                          ],
                        ),
                      ],
                    ),

                    // Device HWID
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('HWID:', style: TextStyle(color: SeleneTheme.textSecondary, fontSize: 12)),
                        Row(
                          children: [
                            SelectableText(
                              status.hwid,
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                color: SeleneTheme.lunarCyan,
                                fontSize: 11.5,
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.copy, size: 14, color: SeleneTheme.textSecondary),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(minWidth: 26, minHeight: 26),
                              onPressed: () {
                                Clipboard.setData(ClipboardData(text: status.hwid));
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('HWID copied to clipboard'), duration: Duration(seconds: 1)),
                                );
                              },
                            ),
                          ],
                        ),
                      ],
                    ),

                    // Duration / Expiration
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Lease / Remaining:', style: TextStyle(color: SeleneTheme.textSecondary, fontSize: 12)),
                        Text(
                          status.type == LicenseTier.trial
                              ? '${status.daysRemaining} days (Trial Window)'
                              : (status.expiresAt == 'never' ? 'Lifetime Perpetual' : '${status.daysRemaining} days remaining'),
                          style: const TextStyle(color: SeleneTheme.textPrimary, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),

                    if (status.tamperReason != null) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: SeleneTheme.roseDanger.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: SeleneTheme.roseDanger.withValues(alpha: 0.4)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline, size: 16, color: SeleneTheme.roseDanger),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                status.tamperReason!,
                                style: const TextStyle(color: SeleneTheme.roseDanger, fontSize: 11),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: 8),
                    Text(
                      status.message,
                      style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 11, fontStyle: FontStyle.italic),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Activation Form
              const Text(
                'Activate Commercial License',
                style: TextStyle(
                  color: SeleneTheme.textPrimary,
                  fontSize: 13.5,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Enter your Enterprise Admin (ADM-), Developer (DEV-), or User (USER-) license key.',
                style: TextStyle(color: SeleneTheme.textSecondary, fontSize: 11.5),
              ),
              const SizedBox(height: 10),

              // Key Field
              TextField(
                controller: _keyController,
                textCapitalization: TextCapitalization.characters,
                style: const TextStyle(color: SeleneTheme.textPrimary, fontSize: 13, fontFamily: 'monospace'),
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  hintText: 'ADM-XXXX-XXXX-XXXX',
                  hintStyle: const TextStyle(color: SeleneTheme.textMuted, fontSize: 12),
                  filled: true,
                  fillColor: SeleneTheme.surface,
                  prefixIcon: const Icon(Icons.key, size: 16, color: SeleneTheme.goldAccent),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: SeleneTheme.border)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: SeleneTheme.goldAccent)),
                ),
              ),

              // Optional Username and Password if DEV or USER
              if (_requiresCredentials) ...[
                const SizedBox(height: 8),
                TextField(
                  controller: _userController,
                  style: const TextStyle(color: SeleneTheme.textPrimary, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'Assigned Username (required for seat)',
                    hintStyle: const TextStyle(color: SeleneTheme.textMuted, fontSize: 12),
                    filled: true,
                    fillColor: SeleneTheme.surface,
                    prefixIcon: const Icon(Icons.person, size: 16, color: SeleneTheme.lunarCyan),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: SeleneTheme.border)),
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _passController,
                  obscureText: true,
                  style: const TextStyle(color: SeleneTheme.textPrimary, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'Seat Password',
                    hintStyle: const TextStyle(color: SeleneTheme.textMuted, fontSize: 12),
                    filled: true,
                    fillColor: SeleneTheme.surface,
                    prefixIcon: const Icon(Icons.lock, size: 16, color: SeleneTheme.lunarCyan),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: SeleneTheme.border)),
                  ),
                ),
              ],

              // Feedback messages
              if (_errorMessage != null) ...[
                const SizedBox(height: 10),
                Text(_errorMessage!, style: const TextStyle(color: SeleneTheme.roseDanger, fontSize: 12)),
              ],
              if (_successMessage != null) ...[
                const SizedBox(height: 10),
                Text(_successMessage!, style: const TextStyle(color: SeleneTheme.emeraldSuccess, fontSize: 12)),
              ],

              const SizedBox(height: 14),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      icon: _isLoading
                          ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: SeleneTheme.background))
                          : const Icon(Icons.check_circle_outline, size: 16),
                      label: Text(_isLoading ? 'Activating...' : 'Activate Device'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: SeleneTheme.goldAccent,
                        foregroundColor: SeleneTheme.background,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: _isLoading ? null : _handleActivate,
                    ),
                  ),
                  if (status.type != LicenseTier.trial) ...[
                    const SizedBox(width: 10),
                    OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: SeleneTheme.roseDanger,
                        side: const BorderSide(color: SeleneTheme.roseDanger),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: _isLoading ? null : _handleDeactivate,
                      child: const Text('Revert to Trial', style: TextStyle(fontSize: 12)),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
