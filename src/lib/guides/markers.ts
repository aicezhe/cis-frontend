// Вырезание маркеров достоверности из тела текста.
//
// В сидах живут два маркера: [TTL] — «протухает со временем», и [УТОЧНИТЬ] —
// «мы сами не уверены». Оба означают одно для читателя: без похода на
// официальный сайт этой строке верить нельзя. Поэтому оба дают
// confidence: 'verify', а разница сохраняется в тексте примечания.
//
// В теле текста они выглядят техническим мусором, поэтому вырезаются
// и переезжают в ttlNote под блоком.

const MARKER = /\s*\[(TTL|УТОЧНИТЬ)(?::\s*)?([^\]]*)\]/g;

export interface Stripped {
  /** Текст без маркеров, с подчищенными двойными пробелами. */
  text: string;
  /** Пояснения из маркеров, по одному на маркер. Пустые отброшены. */
  notes: string[];
  /** Был ли в тексте хоть один маркер. */
  flagged: boolean;
}

export function stripMarkers(input: string): Stripped {
  const notes: string[] = [];
  let flagged = false;
  const text = input
    .replace(MARKER, (_m, kind: string, note: string) => {
      flagged = true;
      const n = note.trim();
      // В [УТОЧНИТЬ актуального оператора] глагол сидит внутри самого маркера,
      // и без него остаток повисает («актуального оператора на сайте»).
      // Возвращаем глагол в примечание, чужих слов не добавляя.
      if (n) notes.push(kind === 'УТОЧНИТЬ' ? `уточнить ${n}` : n);
      return '';
    })
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
  return { text, notes, flagged };
}

/** То же для массива строк: тексты по порядку, примечания склеены без повторов. */
export function stripMany(inputs: string[]): { texts: string[]; notes: string[]; flagged: boolean } {
  const texts: string[] = [];
  const notes: string[] = [];
  let flagged = false;
  for (const s of inputs) {
    const r = stripMarkers(s);
    texts.push(r.text);
    r.notes.forEach((n) => {
      if (!notes.includes(n)) notes.push(n);
    });
    flagged = flagged || r.flagged;
  }
  return { texts, notes, flagged };
}

/** Примечание под блоком: несколько маркеров склеиваем в одну строку. */
export function toTtlNote(notes: string[]): string | undefined {
  return notes.length ? notes.join(' · ') : undefined;
}
