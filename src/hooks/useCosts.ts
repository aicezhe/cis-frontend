// Динамический расчёт расходов по стране и программе.
// Читает /data/costs_seed.json и возвращает разбивку + итог для раздела «Универ».
import { useEffect, useState } from 'react';

type CountryCode = 'ru' | 'ua' | 'by' | 'kz';
type ProgramKey = 'foundation' | 'bachelor' | 'master';

export interface CostItem {
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
      label_ru: labelMap[key] || key,
      eur: d.eur,
      note_ru: d.note_ru,
      optional: isOptional,
    });
  });

  // Стоимость курса (Foundation)
  if (program === 'foundation') {
    items.push({
      label_ru: 'Курс Foundation Year (депозит)',
      eur: programData.deposit_eur,
      note_ru: 'Депозит 600€ возвращается при отказе в визе. Остаток оплачивается по графику.',
    });
  }

  // Минимальный взнос при зачислении (бакалавр/маги)
  if ((program === 'bachelor' || program === 'master') && programData.enrollment_min_eur > 0) {
    items.push({
      label_ru: 'Минимальный взнос (no tax area, ISEE ≤27 000€)',
      eur: programData.enrollment_min_eur,
      note_ru: 'С ISEE parificato — 156€/год. Без ISEE — до 2 500€/год.',
    });
  }

  // Виза (если не waiver)
  const hasWaiver = !!(visa.special_status?.active);
  if (!hasWaiver) {
    items.push({
      label_ru: 'Консульский сбор (виза D)',
      eur: visa.consular_fee.eur,
    });
    items.push({
      label_ru: 'Сервисный сбор визового центра',
      eur: visa.service_fee.eur,
    });
    items.push({
      label_ru: 'Медицинская страховка (год)',
      eur: visa.insurance_year.eur,
      note_ru: 'Приближённая стоимость. Страховка нужна для визы.',
    });
  }

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
