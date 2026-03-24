export default function GlassCard({ children, className = '', dark = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl ${dark ? 'glass-dark' : 'glass'} ${className}`}
    >
      {children}
    </div>
  );
}
