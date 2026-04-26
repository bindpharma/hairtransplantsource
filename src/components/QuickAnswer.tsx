export default function QuickAnswer({ text }: { text: string }) {
  return (
    <aside className="qa-box mt-6" aria-label="Quick answer">
      <div className="qa-label">Quick answer</div>
      <p className="text-gray-800 leading-relaxed m-0">{text}</p>
    </aside>
  );
}
