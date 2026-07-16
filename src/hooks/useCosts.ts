// Динамический расчёт расходов по стране и программе.
// Читает /data/costs_seed.json и возвращает разбивку + итог для раздела «Универ».
import { useEffect, useState } from 'react';

type CountryCode = 'ru' | 'ua' | 'by' | 'kz';
type ProgramKey = 'foundation' | 'bachelor' | 'master';

export interface CostItem {
  id: string;
  label_ru: string;
  eur: number;
  note_ru?: string;
  optional?: boolean;
}

export interface UniCosts {
  country: CountryCode;
  program: ProgramKey;
  items: CostItem[];
  total_eur: number;
  has_visa_waiver: boolean; // UA с временной защитой
  loading: boolean;
}

let _cache: any | null = null;

async function loadCostsSeed(): Promise<any> {
  if (_cache) return _cache;
  const r = await fetch('/data/costs_seed.json');
  if (!r.ok) throw new Error('costs_seed not found');
  _cache = await r.json();
  return _cache;
}

function calcCosts(seed: any, country: CountryCode, program: ProgramKey): Omit<UniCosts, 'loading'> {
  const countryData = seed.countries[country];
  const programData = seed.programs[program];
  const docs = countryData.documents;
  const visa = countryData.visa;
  const items: CostItem[] = [];

  // Документы нужные программе
  const needed: string[] = programData.documents_needed || [];
  const optional: string[] = programData.documents_optional || [];

  [...needed, ...optional].forEach((key) => {
    const d = docs[key];
    if (!d) return;
    const isOptional = optional.includes(key);
    const labelMap: Record<string, string> = {
      apostille: 'Апостиль документа об образовании',
      translation_to_italian: 'Перевод на итальянский',
      cimea: 'CIMEA (признание диплома)',
      ddv: 'DDV — Dichiarazione di Valore',
      language_test_italian_b2: 'Языковой тест B2 итальянского',
      language_test_english_b2: 'Языковой тест B2 английского',
      passport_biometric: 'Биометрический загранпаспорт',
    };
    items.push({
      id: `uni:${key}`,
      label_ru: labelMap[key] || key,
      eur: d.eur,
      note_ru: d.note_ru,
      optional: isOptional,
    });
  });

  // Стоимость курса (Foundation) — полная цена курса, а не только депозит
  // (депозит — это первый взнос ИЗ этой суммы, а не отдельная статья расхода).
  if (program === 'foundation') {
    items.push({
      id: 'uni:foundation_fee',
      label_ru: 'Курс Foundation Year',
      eur: programData.course_fee_eur,
      note_ru: `Депозит ${programData.deposit_eur}€ — первый взнос из этой суммы, возвращается при отказе в визе. С Dante — ${programData.course_fee_dante_eur}€.`,
    });
  }

  // Минимальный взнос при зачислении (бакалавр/маги)
  if ((program === 'bachelor' || program === 'master') && programData.enrollment_min_eur > 0) {
    items.push({
      id: 'uni:enrollment_min',
      label_ru: 'Минимальный взнос (no tax area, ISEE ≤27 000€)',
      eur: programData.enrollment_min_eur,
      note_ru: 'С ISEE parificato — 156€/год. Без ISEE — до 2 500€/год.',
    });
  }

  // ВИЗА здесь НЕ считается: у визовых расходов свой раздел-владелец «Виза»
  // (sectionsData.visa). Раньше consular/service/insurance попадали и сюда, и
  // туда — итог двоился. См. правило «каждый расход ровно в одном разделе».
  const hasWaiver = !!(visa.special_status?.active);

  const total_eur = items.reduce((sum, i) => sum + i.eur, 0);

  return {
    country,
    program,
    items,
    total_eur,
    has_visa_waiver: hasWaiver,
  };
}

export function useUniCosts(): UniCosts {
  const country = (localStorage.getItem('cispr_country') || 'ru') as CountryCode;
  const stored = localStorage.getItem('cispr_program');
  const program: ProgramKey =
    stored === 'foundation' ? 'foundation'
    : stored === 'master' ? 'master'
    : 'bachelor';

  const [result, setResult] = useState<UniCosts>({
    country, program, items: [], total_eur: 0, has_visa_waiver: false, loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    loadCostsSeed()
      .then((seed) => {
        if (cancelled) return;
        const c = calcCosts(seed, country, program);
        setResult({ ...c, loading: false });
      })
      .catch(() => {
        if (!cancelled) setResult((prev) => ({ ...prev, loading: false }));
      });
    return () => { cancelled = true; };
  }, [country, program]);

  return result;
}
