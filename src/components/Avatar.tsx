// Универсальный аватар: если есть картинка — рисуем её, иначе золотая буква на navy-фоне.

type Props = {
  src?: string | null;
  name?: string | null;
  size?: number; // px
  className?: string;
};

export function Avatar({ src, name, size = 48, className = '' }: Props) {
  const letter = (name || '?').trim().charAt(0).toUpperCase() || '?';
  const fontSize = Math.round(size * 0.42);

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        width={size}
        height={size}
        className={'rounded-full object-cover ' + className}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={'rounded-full bg-navy flex items-center justify-center flex-shrink-0 ' + className}
      style={{ width: size, height: size }}
    >
      <span className="font-serif text-gold leading-none" style={{ fontSize }}>
        {letter}
      </span>
    </div>
  );
}
