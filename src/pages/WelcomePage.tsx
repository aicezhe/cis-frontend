export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-cream p-8 font-sans text-navy">
      <h1 className="font-serif text-4xl">WelcomePage</h1>

      {/* Sanity-check: Tailwind + проектные цвета + шрифты подключены */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        <div className="rounded-lg bg-cream p-4 ring-1 ring-navy/10">cream</div>
        <div className="rounded-lg bg-soft-cream p-4 ring-1 ring-navy/10">
          soft-cream
        </div>
        <div className="rounded-lg bg-navy p-4 text-cream">navy</div>
        <div className="rounded-lg bg-brick p-4 text-cream">brick</div>
        <div className="rounded-lg bg-gold p-4 text-cream">gold</div>
        <div className="rounded-lg bg-green p-4 text-cream">green</div>
      </div>
    </div>
  );
}
