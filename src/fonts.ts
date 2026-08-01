// Шрифты, подключённые локально через @fontsource, без CDN.
//
// Golos Text — основной текст и UI. Раньше он приходил с Google Fonts вместе
// с остальными; теперь локально, поэтому из CDN-ссылки в index.html убран.
//
// Unbounded, IBM Plex Mono и EB Garamond из макета «Маршрута» намеренно НЕ
// подключены: раздел собран на фирменной антикве Playfair, чтобы не выпадать
// из остального приложения. Пакеты остались в зависимостях — если решим
// вернуть макетные гарнитуры, это три строчки импорта и правка fontFamily
// в tailwind.config (см. MIGRATION-TODO.md).

import '@fontsource/golos-text/latin-400.css';
import '@fontsource/golos-text/latin-500.css';
import '@fontsource/golos-text/latin-600.css';
import '@fontsource/golos-text/cyrillic-400.css';
import '@fontsource/golos-text/cyrillic-500.css';
import '@fontsource/golos-text/cyrillic-600.css';
