// Адаптер: сид визы D Казахстана → единая схема Guide.
//
// Сам JSON не трогаем. Здесь только раскладка существующих полей по станциям
// маршрута и вырезание маркеров [TTL]/[УТОЧНИТЬ] в примечания.
//
// Что НЕ попадает на эту страницу и почему: docs_specifics_ru живёт на
// /path/visa/steps, rejection_note_ru — на /path/visa/rejections. Обзорная
// страница их не показывала и раньше; переносить контент между страницами
// задача запрещает.

import type { Guide, GuideSection } from '../../types/guide';
import type { VisaKzSeed } from '../../types/visa';
import { stripMany, stripMarkers, toTtlNote } from './markers';

/** Домен из URL — для подписи ссылки в тёмном блоке. */
function domain(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export function buildVisaKzGuide(kz: VisaKzSeed): Guide {
  const ch = kz.channel_ru;
  const sections: GuideSection[] = [];

  // ── 01. Канал подачи ──
  // Заголовок сида — «Куда подаёшься (сначала проверь — тут всё нестабильно)».
  // Разбиваем его на заголовок станции и метку тёмного блока: это разделение
  // уже существующего заголовка, а не новый текст.
  const lead = stripMarkers(ch.lead_ru);
  const titleMatch = ch.title_ru.match(/^(.*?)\s*\((.*)\)\s*$/);
  sections.push({
    id: 'channel',
    index: 1,
    title: titleMatch ? titleMatch[1] : ch.title_ru,
    gloss: 'Dove si presenta',
    confidence: 'verify',
    ttlNote: toTtlNote(lead.notes),
    body: [
      {
        kind: 'band',
        label: titleMatch ? titleMatch[2] : 'сначала проверь',
        paragraphs: [lead.text],
        link: { href: ch.website, label: domain(ch.website) },
      },
    ],
  });

  // ── 02. Что известно на сейчас ──
  const known = stripMany(ch.known_ru);
  sections.push({
    id: 'known',
    index: 2,
    title: ch.known_title_ru,
    gloss: 'Stato attuale',
    confidence: 'verify',
    ttlNote: toTtlNote(known.notes),
    body: [{ kind: 'card', items: known.texts }],
  });

  // ── 03…N. Шаги в посольстве ──
  // Каждый шаг — своя станция: заголовки у шагов в сиде уже есть, выдумывать
  // общий заголовок для группы не из чего.
  const steps = kz.embassy_steps_ru.steps;
  steps.forEach((step, i) => {
    const isLast = i === steps.length - 1;
    const desc = stripMarkers(step.description_ru ?? '');
    const details = stripMany(step.details_ru ?? []);
    const notes = [...desc.notes, ...details.notes];
    // Дисклеймер группы про ориентировочные сроки вешаем на последний шаг —
    // он как раз про ожидание решения.
    if (isLast && kz.embassy_steps_ru.disclaimer_ru) {
      notes.push(stripMarkers(kz.embassy_steps_ru.disclaimer_ru).text);
    }
    sections.push({
      id: `step-${i}`,
      index: 3 + i,
      title: step.title_ru,
      // Итальянского термина для шагов в данных нет — не выдумываем.
      gloss: '',
      confidence: desc.flagged || details.flagged || isLast ? 'verify' : 'confirmed',
      ttlNote: toTtlNote(notes),
      body: [
        {
          kind: 'card' as const,
          paragraphs: desc.text ? [desc.text] : undefined,
          items: details.texts.length ? details.texts : undefined,
        },
      ],
    });
  });

  return {
    eyebrow: `${kz.meta.country_name_ru} · ${kz.meta.academic_year}`,
    title: 'Виза D',
    gloss: 'Visto nazionale · studio',
    lead: 'Для учёбы в Италии нужна виза дольше 90 дней категории D.',
    sections,
    // Строки «что дальше» в данных нет — см. MIGRATION-TODO.md.
  };
}
