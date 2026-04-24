const ANIMALS = [
  "penguin",
  "tiger",
  "dragon",
  "sheep",
  "rabbit",
  "fox",
  "cat",
  "bear",
  "koala",
  "owl",
  "frog",
  "panda",
] as const;

const ANIMAL_EMOJI: Record<(typeof ANIMALS)[number], string> = {
  penguin: "🐧",
  tiger: "🐯",
  dragon: "🐲",
  sheep: "🐑",
  rabbit: "🐰",
  fox: "🦊",
  cat: "🐱",
  bear: "🐻",
  koala: "🐨",
  owl: "🦉",
  frog: "🐸",
  panda: "🐼",
};

const COLOR_PALETTES = [
  ["#ff6b6b", "#ff9f43"],
  ["#feca57", "#ff9ff3"],
  ["#48dbfb", "#5f27cd"],
  ["#1dd1a1", "#54a0ff"],
  ["#ff9ff3", "#f368e0"],
  ["#ff7f50", "#ffcc00"],
  ["#7bed9f", "#70a1ff"],
  ["#ff4757", "#3742fa"],
  ["#2ed573", "#1e90ff"],
  ["#ffa502", "#ff6348"],
  ["#eccc68", "#ff6b81"],
  ["#70a1ff", "#5352ed"],
] as const;

export type AvatarOption = {
  id: string;
  animal: string;
  image: string;
};

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildSvgDataUri(emoji: string, colorStart: string, colorEnd: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-label="avatar"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${colorStart}"/><stop offset="100%" stop-color="${colorEnd}"/></linearGradient></defs><rect width="256" height="256" rx="64" fill="url(#g)"/><circle cx="70" cy="64" r="32" fill="rgba(255,255,255,0.2)"/><circle cx="208" cy="190" r="42" fill="rgba(255,255,255,0.15)"/><text x="128" y="148" text-anchor="middle" dominant-baseline="middle" font-size="112">${emoji}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateDefaultAvatar(seed: string): string {
  const hash = hashSeed(seed);
  const animal = ANIMALS[hash % ANIMALS.length];
  const palette = COLOR_PALETTES[(hash * 7) % COLOR_PALETTES.length];
  return buildSvgDataUri(ANIMAL_EMOJI[animal], palette[0], palette[1]);
}

export function getAvatarOptions(seed: string, count = 16): AvatarOption[] {
  const hash = hashSeed(seed);
  const options: AvatarOption[] = [];
  const totalCombinations = ANIMALS.length * COLOR_PALETTES.length;
  const safeCount = Math.min(count, totalCombinations);

  // 11 is coprime with 144 (12 animals * 12 palettes), so this walks each combo once.
  const step = 11;
  for (let i = 0; i < safeCount; i += 1) {
    const comboIndex = (hash + i * step) % totalCombinations;
    const animalIndex = Math.floor(comboIndex / COLOR_PALETTES.length);
    const paletteIndex = comboIndex % COLOR_PALETTES.length;

    const animal = ANIMALS[animalIndex];
    const palette = COLOR_PALETTES[paletteIndex];

    options.push({
      id: `${animal}-${paletteIndex}`,
      animal,
      image: buildSvgDataUri(ANIMAL_EMOJI[animal], palette[0], palette[1]),
    });
  }

  return options;
}
