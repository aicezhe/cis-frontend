// Шрифты дизайн-системы «Маршрут» — локально через @fontsource, без CDN.
//
// Подключаем ровно те начертания и подмножества, что используются в макете:
// лишний вес — это лишние килобайты, которые пользователь тянет по мобильному
// интернету где-нибудь в очереди в квестуру.
//
// EB Garamond берём ТОЛЬКО латиницей: он набирает итальянские глоссы
// («Dove si presenta»), кириллица в нём не нужна ни в одном месте макета.
//
// У @fontsource в этих пакетах font-display: swap уже прописан.

// Дисплей — только h1 страницы
import '@fontsource/unbounded/latin-500.css';
import '@fontsource/unbounded/cyrillic-500.css';

// Основной текст и UI
import '@fontsource/golos-text/latin-400.css';
import '@fontsource/golos-text/latin-500.css';
import '@fontsource/golos-text/latin-600.css';
import '@fontsource/golos-text/cyrillic-400.css';
import '@fontsource/golos-text/cyrillic-500.css';
import '@fontsource/golos-text/cyrillic-600.css';

// Мета, номера станций, моно-метки
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource/ibm-plex-mono/cyrillic-400.css';
import '@fontsource/ibm-plex-mono/cyrillic-500.css';

// Итальянские глоссы — только латиница, только курсив
import '@fontsource/eb-garamond/latin-400-italic.css';
import '@fontsource/eb-garamond/latin-500-italic.css';
