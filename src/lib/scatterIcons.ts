import type { CSSProperties } from 'react';
import { rand } from './nightSky';

export interface ScatteredIconSpec {
  top: string;
  left: string;
  size: number;
  style: CSSProperties;
}

/**
 * Раскидывает N мелких иконок разного размера внутри плитки-кнопки — мерцают
 * и слегка дрейфуют/пульсируют, как звёзды на WelcomePage (переиспользуем ту
 * же анимацию мерцания .star/star-twinkle, плюс свой icon-float для
 * дрейфа+пульсации размера). Детерминировано по seed — не «прыгает» при ре-рендере.
 */
export function scatterIcons(seed: number, count = 7): ScatteredIconSpec[] {
  return Array.from({ length: count }, (_, i) => {
    const k = seed * 137 + i * 11;
    const size = 10 + rand(k) * 20; // 10–30px
    const top = `${(6 + rand(k + 1) * 78).toFixed(1)}%`;
    const left = `${(6 + rand(k + 2) * 78).toFixed(1)}%`;
    const twMin = +(0.22 + rand(k + 3) * 0.33).toFixed(2);
    const dx = +((rand(k + 4) - 0.5) * 10).toFixed(1);
    const dy = +((rand(k + 5) - 0.5) * 10).toFixed(1);
    const icMin = +(0.8 + rand(k + 6) * 0.15).toFixed(2);
    const icMax = +(1.05 + rand(k + 7) * 0.2).toFixed(2);
    return {
      top,
      left,
      size,
      style: {
        '--tw-min': twMin,
        '--tw-dur': `${2.2 + rand(k + 8) * 2.4}s`,
        '--tw-delay': `${(rand(k + 9) * 2.5).toFixed(2)}s`,
        '--dr-dur': `${3 + rand(k + 10) * 3}s`,
        '--dr-delay': `${(rand(k + 11) * 2).toFixed(2)}s`,
        '--dx': `${dx}px`,
        '--dy': `${dy}px`,
        '--ic-min': icMin,
        '--ic-max': icMax,
      } as CSSProperties,
    };
  });
}
