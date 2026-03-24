import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { t, language, setLanguage, profile, getUserId } = useApp();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const email = localStorage.getItem('yogya_email') || '';

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5"
      style={{
        height: '60px',
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.85)',
        boxShadow: '0 1px 20px rgba(26,35,126,0.06)',
      }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 flex-shrink-0">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
          style={{ background: 'linear-gradient(135deg, #FF6F00, #EAB308)' }}
        >
          <span className="text-white font-black text-sm">य</span>
        </div>
        <span className="font-black text-lg gradient-text">Yogya</span>
      </Link>

      {/* Center — email pill */}
      {isDashboard && email && (
        <div className="flex-1 flex justify-center px-4">
          <span
            className="text-xs font-semibold truncate max-w-[220px] px-3 py-1 rounded-full"
            style={{
              background: 'rgba(26,35,126,0.06)',
              color: '#1a237e',
              border: '1px solid rgba(26,35,126,0.1)',
            }}
          >
            {email}
          </span>
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {!isDashboard && (
          <Link
            to="/dashboard"
            className="btn-glow-blue hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs"
          >
            {t.dashboard}
          </Link>
        )}

        {/* Language toggle — EN | HI pill */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="flex items-center rounded-full overflow-hidden text-xs font-bold"
          style={{
            border: '1.5px solid rgba(255,111,0,0.3)',
            background: 'rgba(255,255,255,0.8)',
          }}
        >
          <span
            className="px-2.5 py-1 transition-all"
            style={{
              background: language === 'en' ? 'linear-gradient(135deg,#FF6F00,#EAB308)' : 'transparent',
              color: language === 'en' ? '#fff' : '#1a237e',
            }}
          >
            EN
          </span>
          <span
            className="px-2.5 py-1 transition-all"
            style={{
              background: language === 'hi' ? 'linear-gradient(135deg,#FF6F00,#EAB308)' : 'transparent',
              color: language === 'hi' ? '#fff' : '#1a237e',
            }}
          >
            HI
          </span>
        </button>

        {/* Profile avatar */}
        {isDashboard && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs transition-all hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, #1a237e, #FF6F00)',
              boxShadow: '0 2px 12px rgba(255,111,0,0.3)',
            }}
          >
            {initials}
          </div>
        )}
      </div>
    </nav>
  );
}
