export default function FAQBlock({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section className="mt-10" aria-label="Frequently asked questions">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
      <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
        {items.map((item, i) => (
          <details key={i} className="group py-4">
            <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
              <span className="font-medium text-gray-900">{item.q}</span>
              <span className="text-gray-400 group-open:rotate-45 transition" aria-hidden>+</span>
            </summary>
            <p className="text-gray-700 mt-2 leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
