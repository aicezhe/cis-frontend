import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, FileDown, Plus, X } from 'lucide-react';
import TabBar from '../components/TabBar';
import { AddExpenseSheet } from '../components/AddExpenseSheet';
import { EditPriceSheet } from '../components/EditPriceSheet';
import { sectionsData, parsePrice } from '../lib/sectionsData';
import { useUniCosts } from '../hooks/useCosts';
import { useExpenses } from '../hooks/useExpenses';
import { usePriceOverrides } from '../hooks/usePriceOverrides';
import type { Expense, ExpenseCategory } from '../lib/expenses';
import { useCurrency } from '../hooks/useCurrency';
import { formatPrice } from '../utils/formatPrice';

const PAID_KEY = 'cispr_paid_expenses';

const SECTIONS_ORDER: ExpenseCategory[] = ['uni', 'visa', 'travel', 'parma'];

interface LineItem {
  id: string;
  label: string;
  eur: number;      // отображаемая цена (с учётом override)
  baseEur?: number; // эталон из сида — к нему возвращает «Сбросить»
  approx?: boolean; // показываем «~» — оценка, а не точный тариф
  edited?: boolean; // юзер подставил свою цену (override поверх сида)
  note?: string;
}

// Медицина в Парме — выбор юзера: частная страховка (~€150/год) или запись в
// госмедицину SSN (€700/год — тариф для студентов с 2024, подтверждён AUSL Parma).
function healthItem(ssn: boolean): LineItem {
  return ssn
    ? { id: 'parma-health', label: 'Медицина: SSN (год)', eur: 700 }
    : { id: 'parma-health', label: 'Медицина: частная страховка (год)', eur: 150, approx: true };
}

// Разворачиваем шаги раздела в отдельные позиции. Новая структура — плоские
// строки с id (для override) и флагом approx. Нулевые убираем.
function staticItems(id: 'visa' | 'travel' | 'parma'): LineItem[] {
  const items: LineItem[] = [];
  sectionsData[id].steps.forEach((step: any) => {
    if (step.substeps && step.substeps.length > 0) {
      step.substeps.forEach((sub: any, i: number) => {
        const eur = parsePrice(sub.price);
        if (eur > 0) items.push({ id: `${id}-${step.num}-${i}`, label: sub.title, eur });
      });
    } else {
      const eur = parsePrice(step.price);
      if (eur > 0) items.push({ id: step.id, label: step.title, eur, approx: step.approx });
    }
  });
  return items;
}

// Общая таблица «Стоимость» по всем 4 разделам пути (Универ/Виза/Переезд/
// В Парме) — та же цифра «Расходы» с главной страницы Path, только развёрнуто
// построчно. Тап по разделу разворачивает его подробную разбивку. Плюс можно
// добавить свой расход (долгий тап по карточке «Расходы» на Path или кнопка
// «+» здесь) и отредактировать/удалить уже добавленный тапом по строке.
export default function ExpensesPage() {
  const navigate = useNavigate();
  const uniCosts = useUniCosts();
  const { expenses, totalByCategory, removeExpense } = useExpenses();
  const { overrides } = usePriceOverrides();
  const { currency } = useCurrency();
  const fmt = (eur: number) => formatPrice(eur, currency);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [editingPrice, setEditingPrice] = useState<{ id: string; label: string; baseEur: number } | null>(null);
  const [expanded, setExpanded] = useState<ExpenseCategory | 'all' | null>(null);
  const [healthSsn, setHealthSsn] = useState(() => localStorage.getItem('cispr_health_ssn') === 'true');

  // Отметки «уже оплачено». Хранятся так же, как галочки прогресса, — массив
  // id в localStorage. Ручные расходы тоже отмечаются: человек добавил строку
  // и вправе сказать, что уже её закрыл.
  const [paid, setPaid] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(PAID_KEY) || '[]'); } catch { return []; }
  });
  const isPaid = (id: string) => paid.includes(id);
  function togglePaid(id: string) {
    setPaid((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(PAID_KEY, JSON.stringify(next));
      return next;
    });
  }

  function chooseHealth(ssn: boolean) {
    localStorage.setItem('cispr_health_ssn', String(ssn));
    setHealthSsn(ssn);
  }

  // Персональная правка поверх сида: если для строки есть override — берём его
  // (и это уже не «оценка», а точная цифра юзера), эталон остаётся в baseEur.
  const applyOverride = (i: LineItem): LineItem =>
    i.id in overrides
      ? { ...i, baseEur: i.eur, eur: overrides[i.id], approx: false, edited: true }
      : { ...i, baseEur: i.eur };

  const sectionItems = (id: ExpenseCategory): LineItem[] => {
    const raw =
      id === 'uni'
        ? uniCosts.items.map((i) => ({ id: i.id, label: i.label_ru, eur: i.eur, note: i.note_ru }))
        : id === 'parma'
        ? [...staticItems(id), healthItem(healthSsn)]
        : staticItems(id);
    return raw.map(applyOverride);
  };

  // База раздела = сумма его статей (заголовок = разбивка). Универ на время
  // загрузки сида — прежняя оценка, чтобы не мигало нулём.
  const sectionBase = (id: ExpenseCategory): number =>
    id === 'uni' && uniCosts.loading
      ? sectionsData.uni.budget
      : sectionItems(id).reduce((sum, i) => sum + i.eur, 0);

  // Заголовок раздела = статьи + добавленные вручную. Раньше ручные в заголовок
  // не входили, а в «Итого» входили — расходилось.
  const sectionTotal = (id: ExpenseCategory): number => sectionBase(id) + totalByCategory[id];

  const total = SECTIONS_ORDER.reduce((sum, id) => sum + sectionTotal(id), 0);

  // Оплачено и остаток. Общий total намеренно оставлен как был: на него
  // завязана сводка расходов на дашборде, и менять его смысл здесь значило бы
  // молча изменить цифру на другом экране.
  const paidTotal = SECTIONS_ORDER.reduce(
    (sum, id) =>
      sum +
      sectionItems(id).filter((i) => isPaid(i.id)).reduce((a, i) => a + i.eur, 0) +
      expenses.filter((e) => e.category === id && isPaid(e.id)).reduce((a, e) => a + e.amount_eur, 0),
    0,
  );
  const remaining = Math.max(0, total - paidTotal);

  // Печать/сохранение в PDF — системный диалог печати браузера (в нём есть
  // «Сохранить как PDF»), без сторонних библиотек. Печатается отдельное чистое
  // представление — таблица (hidden print:block ниже), а не вёрстка экрана.
  function handleExportPdf() {
    window.print();
  }

  return (
    <div className="relative min-h-screen max-w-md md:max-w-2xl mx-auto bg-cream flex flex-col pb-28 md:pb-12 print:max-w-full print:pb-0">
      <div className="px-6 pt-12 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-navy text-2xl">←</button>
          <h1 className="font-serif text-navy text-2xl font-bold">Стоимость</h1>
        </div>
        <button
          onClick={handleExportPdf}
          className="flex items-center gap-1.5 font-serif text-gold text-xs border border-gold/50 rounded-full px-3 py-2"
        >
          <FileDown size={14} /> PDF
        </button>
      </div>
      <h1 className="hidden print:block font-serif text-navy text-2xl font-bold px-8 pt-6">Стоимость</h1>

      <div className="mx-6 mt-5 bg-navy rounded-2xl px-5 py-4 print:hidden">
        <p className="font-serif text-gold text-xs uppercase tracking-widest font-bold">Итого</p>
        <p className="font-serif text-cream text-3xl font-bold mt-1">{fmt(total)}</p>
        {/* Крупной цифрой остаётся общая сумма: на неё завязана сводка расходов
            на дашборде, и подменить её остатком значило бы молча изменить число
            на другом экране. Оплаченное идёт строкой ниже. */}
        {paidTotal > 0 && (
          <div className="mt-2 pt-2 border-t border-cream/15 flex items-baseline justify-between gap-3">
            <span className="font-serif text-gold text-sm font-bold">Оплачено {fmt(paidTotal)}</span>
            <span className="font-serif text-cream/70 text-sm">осталось {fmt(remaining)}</span>
          </div>
        )}
        <p className="font-serif text-cream/60 text-xs mt-1">
          Разовые расходы на старте (универ, виза, переезд) + первый год жизни в Парме. Оценки помечены «~».
        </p>
      </div>

      {/* Печатное представление — чистая таблица, а не скрин экрана. Видна только
          при печати/сохранении в PDF (hidden print:block). */}
      <div className="hidden print:block px-8 pt-4">
        <table className="w-full font-serif text-navy text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="text-left font-bold pb-1" style={{ borderBottom: '2px solid #1C2A48' }}>Статья</th>
              <th className="text-right font-bold pb-1" style={{ borderBottom: '2px solid #1C2A48' }}>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {SECTIONS_ORDER.map((id) => {
              const custom = expenses.filter((e) => e.category === id);
              const perYear = id === 'parma';
              return (
                <Fragment key={id}>
                  <tr style={{ borderBottom: '1.5px solid #1C2A48' }}>
                    <td className="pt-4 pb-1 font-bold uppercase text-xs" style={{ color: '#B89968', letterSpacing: '0.1em' }}>
                      {sectionsData[id].titleFull}{perYear ? ' · в год' : ''}
                    </td>
                    <td className="pt-4 pb-1 font-bold text-right">{fmt(sectionTotal(id))}</td>
                  </tr>
                  {sectionItems(id).map((item) => (
                    <tr key={item.id}>
                      {/* Галочка в печати — символом, а не цветом: PDF часто
                          печатают чёрно-белым, и подсветка исчезла бы. */}
                      <td className="py-1 pl-4" style={{ borderBottom: '1px solid rgba(28,42,72,0.12)' }}>
                        {isPaid(item.id) ? '☑ ' : '☐ '}{item.label}
                      </td>
                      <td className="py-1 text-right" style={{ borderBottom: '1px solid rgba(28,42,72,0.12)' }}>
                        {item.approx ? '~' : ''}{fmt(item.eur)}
                      </td>
                    </tr>
                  ))}
                  {custom.map((e) => (
                    <tr key={e.id}>
                      <td className="py-1 pl-4" style={{ borderBottom: '1px solid rgba(28,42,72,0.12)' }}>
                        {e.label} <span style={{ color: '#B89968' }}>· вручную</span>
                      </td>
                      <td className="py-1 text-right" style={{ borderBottom: '1px solid rgba(28,42,72,0.12)' }}>{fmt(e.amount_eur)}</td>
                    </tr>
                  ))}
                </Fragment>
              );
            })}
            <tr>
              <td className="pt-4 font-bold text-base">ИТОГО</td>
              <td className="pt-4 font-bold text-base text-right">{fmt(total)}</td>
            </tr>
            {paidTotal > 0 && (
              <>
                <tr>
                  <td className="pt-1" style={{ color: '#B89968' }}>Уже оплачено</td>
                  <td className="pt-1 text-right" style={{ color: '#B89968' }}>{fmt(paidTotal)}</td>
                </tr>
                <tr>
                  <td className="font-bold">Осталось</td>
                  <td className="font-bold text-right">{fmt(remaining)}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
        <p className="text-navy/50 text-[11px] italic mt-4">
          Оценки помечены «~» — приблизительно. Разовые расходы (универ, виза, переезд) + первый год
          жизни в Парме{uniCosts.country ? ` · страна ${uniCosts.country.toUpperCase()}` : ''}.
        </p>
      </div>

      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl overflow-hidden print:hidden">
        {SECTIONS_ORDER.map((id, idx) => {
          const custom = expenses.filter((e) => e.category === id);
          const perYear = id === 'parma';
          const isOpen = expanded === id || expanded === 'all';
          const items = sectionItems(id);
          return (
            <div key={id} className={idx > 0 ? 'border-t border-navy/15' : ''}>
              <button
                onClick={() => setExpanded(isOpen ? null : id)}
                className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left"
              >
                <p className="font-serif text-gold text-xs uppercase tracking-widest font-bold flex items-center gap-1.5">
                  {sectionsData[id].titleFull}{perYear ? ' · в год' : ''}
                  {id === 'uni' && uniCosts.loading && <span className="text-navy/40 normal-case font-normal">— считаю…</span>}
                  <ChevronDown size={12} className={'text-navy/40 transition-transform print:hidden ' + (isOpen ? 'rotate-180' : '')} />
                </p>
                <p className="font-serif text-navy text-sm font-bold flex-shrink-0">{fmt(sectionTotal(id))}</p>
              </button>

              {isOpen && (
                <div className="px-4 pb-2 flex flex-col gap-2">
                  {items.length === 0 && custom.length === 0 ? (
                    <p className="font-serif text-navy/50 text-xs italic pb-1">
                      Нет данных для разбивки.
                    </p>
                  ) : (
                    <>
                      {items.map((item) => (
                        <div key={item.id} className="flex items-start gap-2.5">
                          {/* Галочка отдельной кнопкой, а не по тапу на строку:
                              тап по строке уже занят — он открывает правку цены.
                              Свести их в один жест значит сделать оба ненадёжными. */}
                          <button
                            onClick={() => togglePaid(item.id)}
                            aria-label={isPaid(item.id) ? 'Отменить отметку об оплате' : 'Отметить как оплаченное'}
                            className="flex-shrink-0 mt-0.5"
                          >
                            {isPaid(item.id) ? (
                              <span className="w-4 h-4 rounded-full bg-gold flex items-center justify-center text-cream text-[9px]">✓</span>
                            ) : (
                              <span className="block w-4 h-4 rounded-full border-2 border-navy/25" />
                            )}
                          </button>
                          <button
                            onClick={() => setEditingPrice({ id: item.id, label: item.label, baseEur: item.baseEur ?? item.eur })}
                            className="flex items-start justify-between gap-3 text-left flex-1 print:pointer-events-none"
                          >
                            <span className={'font-serif text-sm flex-1 ' + (isPaid(item.id) ? 'text-navy/40 line-through' : 'text-navy/85')}>
                              {item.label}
                            </span>
                            <span className={'font-serif text-sm font-bold flex-shrink-0 ' + (isPaid(item.id) ? 'text-navy/40' : item.edited ? 'text-gold' : 'text-navy/85')}>
                              {item.approx ? '~' : ''}{fmt(item.eur)}
                            </span>
                          </button>
                        </div>
                      ))}

                      {/* Ручные расходы — теми же строками, что seed-разбивка, а не
                          коробкой-плашкой. Отличает только золотая точка-маркер:
                          тап по строке — изменить, крестик — удалить. */}
                      {custom.map((e) => (
                        <div key={e.id} className="flex items-center justify-between gap-3">
                          <button
                            onClick={() => setEditing(e)}
                            className="flex items-center gap-2 flex-1 text-left"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" aria-hidden />
                            <span className="font-serif text-navy/85 text-sm">{e.label}</span>
                          </button>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-serif text-navy/85 text-sm font-bold">{fmt(e.amount_eur)}</span>
                            <span
                              role="button"
                              onClick={() => removeExpense(e.id)}
                              className="text-navy/30 print:hidden"
                              aria-label="Удалить"
                            >
                              <X size={13} />
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Выбор медицины — частная страховка (~€150) или SSN (€700).
                          Меняет строку «медицина» и итог раздела. */}
                      {id === 'parma' && (
                        <div className="mt-1 pt-2 border-t border-navy/10 print:hidden">
                          <p className="font-serif text-navy/50 text-[11px] mb-1.5">Медицина в Парме:</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => chooseHealth(false)}
                              className={
                                'flex-1 font-serif text-xs rounded-full py-1.5 border ' +
                                (!healthSsn ? 'bg-navy text-cream border-navy' : 'text-navy/70 border-navy/25')
                              }
                            >
                              Частная ~{fmt(150)}
                            </button>
                            <button
                              onClick={() => chooseHealth(true)}
                              className={
                                'flex-1 font-serif text-xs rounded-full py-1.5 border ' +
                                (healthSsn ? 'bg-navy text-cream border-navy' : 'text-navy/70 border-navy/25')
                              }
                            >
                              SSN {fmt(700)}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setAdding(true)}
        className="mx-6 mt-3 flex items-center justify-center gap-2 font-serif text-navy border border-navy/20 rounded-full py-2.5 text-sm print:hidden"
      >
        <Plus size={16} /> Добавить расход
      </button>

      {uniCosts.country && (
        <p className="font-serif text-navy/40 text-[11px] italic text-center mt-6 px-6 print:hidden">
          Оценки для {uniCosts.country.toUpperCase()} · меняй валюту в Настройках
        </p>
      )}

      {adding && (
        <AddExpenseSheet defaultCategory="uni" onClose={() => setAdding(false)} />
      )}
      {editing && (
        <AddExpenseSheet
          defaultCategory={editing.category}
          expense={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {editingPrice && (
        <EditPriceSheet
          id={editingPrice.id}
          label={editingPrice.label}
          baseEur={editingPrice.baseEur}
          onClose={() => setEditingPrice(null)}
        />
      )}

      <div className="print:hidden">
        <TabBar active="path" />
      </div>
    </div>
  );
}
