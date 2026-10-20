/// Astronomical Synodic Lunar Phase Calculator
/// Based on astronomical ephemeris formulas (29.53058867-day synodic cycle).
class LunarPhaseInfo {
  final String englishName;
  final String greekName;
  final String greekAlphabet;
  final double illuminationPercent;
  final double cycleProgress;
  final String symbol;
  final String hymnSnippet;

  const LunarPhaseInfo({
    required this.englishName,
    required this.greekName,
    required this.greekAlphabet,
    required this.illuminationPercent,
    required this.cycleProgress,
    required this.symbol,
    required this.hymnSnippet,
  });
}

class LunarService {
  // Known reference new moon epoch (2000-01-06 18:14 UTC)
  static final DateTime _knownNewMoon = DateTime.utc(2000, 1, 6, 18, 14);
  static const double _synodicMonth = 29.53058867; // Mean synodic cycle in days

  static LunarPhaseInfo calculateCurrentPhase([DateTime? date]) {
    final now = date ?? DateTime.now().toUtc();
    final diffDays = now.difference(_knownNewMoon).inMilliseconds / (1000.0 * 60 * 60 * 24);
    final cycles = diffDays / _synodicMonth;
    final progress = cycles - cycles.floor(); // 0.0 to 1.0

    // Illumination calculation based on phase angle (0.0 at new moon, 1.0 at full moon)
    final illumination = ((1.0 - (progress <= 0.5 ? 1.0 - progress * 2 : (progress - 0.5) * 2)) * 100).clamp(0.0, 100.0);

    if (progress < 0.03 || progress >= 0.97) {
      return LunarPhaseInfo(
        englishName: 'New Moon',
        greekName: 'Noumenia',
        greekAlphabet: 'Νουμηνία',
        illuminationPercent: illumination,
        cycleProgress: progress,
        symbol: '🌑',
        hymnSnippet: 'Hear, Goddess Queen, diffusing silver light, Bull-horned and wandering through the gloomy night...',
      );
    } else if (progress < 0.22) {
      return LunarPhaseInfo(
        englishName: 'Waxing Crescent',
        greekName: 'Meniskos Anatolikos',
        greekAlphabet: 'Μηνίσκος Ἀνατολικός',
        illuminationPercent: illumination,
        cycleProgress: progress,
        symbol: '🌒',
        hymnSnippet: 'With horned orb compelling night to yield, spreading soft radiance o’er the heaven’s field...',
      );
    } else if (progress < 0.28) {
      return LunarPhaseInfo(
        englishName: 'First Quarter',
        greekName: 'Dichotomos Protos',
        greekAlphabet: 'Διχότομος Πρῶτος',
        illuminationPercent: illumination,
        cycleProgress: progress,
        symbol: '🌓',
        hymnSnippet: 'Equi-divided splendor of the celestial dome, guiding nocturnal travelers safely home...',
      );
    } else if (progress < 0.47) {
      return LunarPhaseInfo(
        englishName: 'Waxing Gibbous',
        greekName: 'Amphikyrtos Auxomenos',
        greekAlphabet: 'Ἀμφίκυρτος Αὐξόμενος',
        illuminationPercent: illumination,
        cycleProgress: progress,
        symbol: '🌔',
        hymnSnippet: 'Swelling with celestial light, daughter of Hyperion, illuminating deep mysteries of night...',
      );
    } else if (progress < 0.53) {
      return LunarPhaseInfo(
        englishName: 'Full Moon',
        greekName: 'Panselinos',
        greekAlphabet: 'Πανσέληνος',
        illuminationPercent: illumination,
        cycleProgress: progress,
        symbol: '🌕',
        hymnSnippet: 'Splendid in golden diadem, nocturnal torch divine, o’er sleepless thinkers let thy silver shine...',
      );
    } else if (progress < 0.72) {
      return LunarPhaseInfo(
        englishName: 'Waning Gibbous',
        greekName: 'Amphikyrtos Phthinon',
        greekAlphabet: 'Ἀμφίκυρτος Φθίνων',
        illuminationPercent: illumination,
        cycleProgress: progress,
        symbol: '🌖',
        hymnSnippet: 'Gentle disperser of the twilight shade, in starry robe of radiant peace arrayed...',
      );
    } else if (progress < 0.78) {
      return LunarPhaseInfo(
        englishName: 'Third Quarter',
        greekName: 'Dichotomos Deuteros',
        greekAlphabet: 'Διχότομος Δεύτερος',
        illuminationPercent: illumination,
        cycleProgress: progress,
        symbol: '🌗',
        hymnSnippet: 'Wisdom of measured hours and cycles past, preserving knowledge that will ever last...',
      );
    } else {
      return LunarPhaseInfo(
        englishName: 'Waning Crescent',
        greekName: 'Meniskos Dytikos',
        greekAlphabet: 'Μηνίσκος Δυτικός',
        illuminationPercent: illumination,
        cycleProgress: progress,
        symbol: '🌘',
        hymnSnippet: 'The quiet hours before the dawn’s release, sacred to meditation and to peace...',
      );
    }
  }
}
