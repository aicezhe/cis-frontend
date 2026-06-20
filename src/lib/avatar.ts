// Утилиты для аватарки: чтение файла → центральная квадратная обрезка → JPEG base64.
// Плюс кэш в localStorage для мгновенного отображения до загрузки профиля с бэка.

const AVATAR_KEY = 'cispr_avatar';
const SIZE = 200; // px
const QUALITY = 0.85;

export function loadCachedAvatar(): string | null {
  return localStorage.getItem(AVATAR_KEY);
}

export function cacheAvatar(b64: string | null): void {
  if (b64) localStorage.setItem(AVATAR_KEY, b64);
  else localStorage.removeItem(AVATAR_KEY);
}

/**
 * Прочитать File (из <input type="file">), обрезать по центру до квадрата,
 * уменьшить до 200×200 пикселей и вернуть data:image/jpeg;base64,...
 */
export async function fileToAvatarB64(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Это не изображение');
  }
  // ~5MB лимит на исходник — больше не имеет смысла, всё равно сожмём
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Файл больше 5 МБ — выбери поменьше');
  }

  // Шаг 1: FileReader → dataURL → Image
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Не удалось загрузить изображение'));
    i.src = dataUrl;
  });

  // Шаг 2: canvas — центральная квадратная обрезка → 200×200
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas не поддерживается');

  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);

  // Шаг 3: экспорт в JPEG base64
  return canvas.toDataURL('image/jpeg', QUALITY);
}
