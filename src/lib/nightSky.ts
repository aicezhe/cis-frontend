import type { CSSProperties } from 'react';

// Единое «ночное небо» для WelcomePage / LoginPage / заставки перехода.
// Детерминированный псевдо-рандом по индексу — поле не «прыгает» при ре-рендере.
export function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Оттенки настоящих звёзд: холодновато-белый, чисто-белый, тёпло-белый + редкие
// золотые (акцент бренда). Низкая насыщенность — глазу читается как небо.
export const STAR_TONES = ['225,235,255', '255,253,248', '255,246,230', '255,253,248'];

export interface Star {
  top: string;
  left: string;
  size: number;
  bright: number;
  rgb: string;
  twMin: number;
}

// Натуральное поле: в основном мелкие тусклые + редкие яркие/золотые.
// topSpan — доля высоты (%), в пределах которой раскидываем (33 — только тёмная
// шапка, 100 — весь экран). seed — сдвиг, чтобы разные поля не совпадали.
export function makeStarField(count: number, topSpan = 100, seed = 0): Star[] {
  return Array.from({ length: count }, (_, i) => {
    const k = i + seed;
    const r1 = rand(k);
    const r2 = rand(k + 100);
    const size = +(0.8 + r1 * r1 * 2.3).toFixed(2);
    const bright = +(0.24 + r2 * r2 * 0.72).toFixed(2);
    const gold = rand(k + 200) > 0.9;
    return {
      top: `${(rand(k + 300) * topSpan).toFixed(1)}%`,
      left: `${(rand(k + 400) * 100).toFixed(1)}%`,
      size,
      bright,
      rgb: gold ? '199,168,118' : STAR_TONES[i % STAR_TONES.length],
      twMin: +(0.3 + rand(k + 500) * 0.5).toFixed(2),
    };
  });
}

// Общее поле для перехода вход: «накрытие» и «приближение» используют ОДНИ и те
// же звёзды на одних местах — чтобы приближение шло ровно от тех позиций, где
// звёзды остановились после спуска (без перескока). Позиции в vh/% — совпадают
// и в опускающемся слое, и в полноэкранной заставке.
export const TRANSITION_STARS: Star[] = Array.from({ length: 60 }, (_, i) => {
  const k = i + 21;
  const r1 = rand(k);
  const r2 = rand(k + 100);
  const size = +(0.8 + r1 * r1 * 2.3).toFixed(2);
  const bright = +(0.26 + r2 * r2 * 0.7).toFixed(2);
  const gold = rand(k + 200) > 0.9;
  return {
    top: `${(rand(k + 300) * 100).toFixed(1)}vh`,
    left: `${(rand(k + 400) * 100).toFixed(1)}%`,
    size,
    bright,
    rgb: gold ? '199,168,118' : STAR_TONES[i % STAR_TONES.length],
    twMin: +(0.3 + rand(k + 500) * 0.5).toFixed(2),
  };
});

// CSS-переменные для мерцания/дрейфа (класс .star в index.css) — вразнобой.
export function starVars(i: number, twMin: number): CSSProperties {
  const dir = i % 2 === 0 ? 1 : -1;
  return {
    '--tw-min': twMin,
    '--tw-dur': `${2.2 + rand(i + 600) * 3}s`,
    '--tw-delay': `${(rand(i + 700) * 3.5).toFixed(2)}s`,
    '--dx': `${(dir * (1 + rand(i + 800) * 2)).toFixed(1)}px`,
    '--dy': `${(-dir * (1 + rand(i + 900) * 2)).toFixed(1)}px`,
    '--dr-dur': `${6 + rand(i + 1000) * 5}s`,
    '--dr-delay': `${(rand(i + 1100) * 2).toFixed(2)}s`,
  } as CSSProperties;
}

// Фон + свечение (ореол только у крупных) — как у настоящих звёзд.
export function starBaseStyle(s: Star): CSSProperties {
  return {
    background: `rgba(${s.rgb},${s.bright})`,
    boxShadow:
      s.size > 1.8
        ? `0 0 ${Math.round(s.size * 2.5)}px ${(s.size * 0.35).toFixed(1)}px rgba(${s.rgb},${(s.bright * 0.55).toFixed(2)})`
        : 'none',
  };
}
