
export enum AppRoute {
  HOME = 'HOME',
  GAME_MEMORY = 'GAME_MEMORY',
  GAME_FOCUS = 'GAME_FOCUS',
  COMIC_CREATOR = 'COMIC_CREATOR',
  ICHING = 'ICHING',
  VIDEO_PUBLISHER = 'VIDEO_PUBLISHER',
  VERSION_RELEASE = 'VERSION_RELEASE'
}

export interface ComicPanel {
  description: string;
  dialogue: string;
  imageUrl?: string;
}

export interface ComicScript {
  title: string;
  panels: ComicPanel[];
}

export interface IChingResult {
  hexagramNumber: number;
  name: string;
  symbol: string; // e.g., "110110" (top to bottom)
  interpretation: string;
}

export enum CoinSide {
  HEADS = 3, // Yangish value for calculation method usually 3
  TAILS = 2  // Yinish value for calculation method usually 2
}
// Traditional method: 3 coins.
// 3 Heads (3+3+3=9) -> Old Yang (Changing) - We will simplify to static for this web app version or standard probability
// For simplicity in this app:
// 2 Tails + 1 Head = 2+2+3 = 7 (Young Yang, solid)
// 2 Heads + 1 Tail = 3+3+2 = 8 (Young Yin, broken)
// 3 Tails = 2+2+2 = 6 (Old Yin, changing) -> Broken
// 3 Heads = 3+3+3 = 9 (Old Yang, changing) -> Solid
