export default function ThreeDCard({ children, className = '' }) {
  return (
    <div className={`card-3d ${className}`}>
      {children}
    </div>
  );
}
