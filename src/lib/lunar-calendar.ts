/**
 * 🌙 Selene Sacred Lunar Engine & Astronomical Calendar
 *
 * Computes exact synodic lunar phases, illumination percentages,
 * classical Greek nomenclature, and poetic Orphic hymns for Selene,
 * the Titaness of the Moon.
 */

export interface LunarPhaseInfo {
  phase:
    | "new"
    | "waxing-crescent"
    | "first-quarter"
    | "waxing-gibbous"
    | "full"
    | "waning-gibbous"
    | "third-quarter"
    | "waning-crescent";
  icon: string;
  name: string;
  greekName: string;
  greekTransliteration: string;
  illuminationPct: number;
  ageDays: number;
  hymnVerse: string;
  statusBadge: string;
}

// Synodic lunar month in solar days (average time between consecutive new moons)
const SYNODIC_MONTH = 29.53058867;

// Known reference New Moon epoch: Jan 6, 2000, 18:14 UTC
const KNOWN_NEW_MOON_EPOCH_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

/**
 * Calculates current lunar phase and mythological lore for a given date.
 */
export function getLunarPhase(date: Date = new Date()): LunarPhaseInfo {
  const diffMs = date.getTime() - KNOWN_NEW_MOON_EPOCH_MS;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  // Normalize age in synodic cycle [0, SYNODIC_MONTH)
  const ageDays = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;

  // Fraction of cycle [0, 1)
  const cycleFraction = ageDays / SYNODIC_MONTH;

  // Illumination percentage: 0% at new moon, 100% at full moon
  // Uses cosine approximation: 0.5 * (1 - cos(2 * pi * fraction))
  const illuminationPct = Math.round(
    0.5 * (1 - Math.cos(2 * Math.PI * cycleFraction)) * 100
  );

  // 8 distinct lunar phases (each ~3.69 days)
  if (ageDays < 1.84 || ageDays >= 27.68) {
    return {
      phase: "new",
      icon: "🌑",
      name: "New Moon",
      greekName: "Νουμηνία",
      greekTransliteration: "Noumenia",
      illuminationPct,
      ageDays: Math.round(ageDays * 10) / 10,
      hymnVerse:
        "In the quiet of the dark sky, Selene rests within the streams of Oceanus before her renewal.",
      statusBadge: "🌑 Noumenia (New Moon) • Selene's Sacred Renewal",
    };
  } else if (ageDays < 7.38) {
    return {
      phase: "waxing-crescent",
      icon: "🌒",
      name: "Waxing Crescent",
      greekName: "Μηνίσκος Ἀνατολικός",
      greekTransliteration: "Meniskos Anatolikos",
      illuminationPct,
      ageDays: Math.round(ageDays * 10) / 10,
      hymnVerse:
        "The crescent Meniskos crowns her immortal brow as the silver steeds take to the heavens.",
      statusBadge: "🌒 Meniskos (Waxing Crescent) • The Silver Crown Ascends",
    };
  } else if (ageDays < 9.23) {
    return {
      phase: "first-quarter",
      icon: "🌓",
      name: "First Quarter",
      greekName: "Διχότομος Πρώτου",
      greekTransliteration: "Dichotomos Protou",
      illuminationPct,
      ageDays: Math.round(ageDays * 10) / 10,
      hymnVerse:
        "Half-crowned in radiance, her nocturnal torch brings equilibrium between shadow and light.",
      statusBadge: "🌓 Dichotomos (First Quarter) • Celestial Equilibrium",
    };
  } else if (ageDays < 14.77) {
    return {
      phase: "waxing-gibbous",
      icon: "🌔",
      name: "Waxing Gibbous",
      greekName: "Ἀμφίκυρτος Αὐξόμενος",
      greekTransliteration: "Amphikyrtos Auxomenos",
      illuminationPct,
      ageDays: Math.round(ageDays * 10) / 10,
      hymnVerse:
        "Radiant goddess queen, diffusing silver light across the firmament, blessing late-night thinkers.",
      statusBadge: "🌔 Amphikyrtos (Waxing Gibbous) • Radiant Nocturnal Surge",
    };
  } else if (ageDays < 16.61) {
    return {
      phase: "full",
      icon: "🌕",
      name: "Full Moon",
      greekName: "Πανσέληνος",
      greekTransliteration: "Panselinos",
      illuminationPct,
      ageDays: Math.round(ageDays * 10) / 10,
      hymnVerse:
        "And from her immortal head a radiance is shown from heaven and embraces earth in splendor.",
      statusBadge: "🌕 Panselinos (Full Moon) • Selene at Supreme Zenith",
    };
  } else if (ageDays < 22.15) {
    return {
      phase: "waning-gibbous",
      icon: "🌖",
      name: "Waning Gibbous",
      greekName: "Ἀμφίκυρτος Φθίνων",
      greekTransliteration: "Amphikyrtos Phthinon",
      illuminationPct,
      ageDays: Math.round(ageDays * 10) / 10,
      hymnVerse:
        "With majestic composure, her silver chariot journeys toward the western edge of the world.",
      statusBadge: "🌖 Amphikyrtos (Waning Gibbous) • Wisdom of the Midnight Chariot",
    };
  } else if (ageDays < 23.99) {
    return {
      phase: "third-quarter",
      icon: "🌗",
      name: "Third Quarter",
      greekName: "Διχότομος Δευτέρου",
      greekTransliteration: "Dichotomos Deuterou",
      illuminationPct,
      ageDays: Math.round(ageDays * 10) / 10,
      hymnVerse:
        "The tranquil watch of the night deepens as mortal toil gives way to profound philosophical peace.",
      statusBadge: "🌗 Dichotomos (Third Quarter) • The Nocturnal Sentinel",
    };
  } else {
    return {
      phase: "waning-crescent",
      icon: "🌘",
      name: "Waning Crescent",
      greekName: "Μηνίσκος Ἀπόκρουσης",
      greekTransliteration: "Meniskos Apokrousis",
      illuminationPct,
      ageDays: Math.round(ageDays * 10) / 10,
      hymnVerse:
        "A slender silver sliver before dawn, whispering secrets to the architects of the quiet morning.",
      statusBadge: "🌘 Meniskos (Waning Crescent) • Whispers Before the Dawn",
    };
  }
}
