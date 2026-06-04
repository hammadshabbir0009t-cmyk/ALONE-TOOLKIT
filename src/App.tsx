import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './hooks/useApi';
import UserPanel from './components/UserPanel';
import AdminPanel from './components/AdminPanel';
import NotificationPanel from './components/NotificationPanel';

/* ============== TYPES ============== */
interface Tool {
  id: number;
  title: string;
  link: string;
  image: string;
  date: string;
  downloads: number;
  isNew: boolean;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
  push?: boolean;
}

interface SocialLinks {
  whatsapp: string;
  youtube: string;
  telegram: string;
  community: string;
}

interface ToastMsg {
  id: number;
  message: string;
  type: 'success' | 'error';
}

/* ============== MATRIX RAIN COMPONENT ============== */
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const chars = '01010101アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    let columns = Math.floor(w / fontSize);
    let drops: number[] = Array(columns).fill(1);

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      columns = Math.floor(w / fontSize);
      drops = Array(columns).fill(1);
    };
    window.addEventListener('resize', onResize);

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#00ff41';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > h && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: 0.25,
        pointerEvents: 'none',
      }}
    />
  );
}

/* ============== PARTICLES COMPONENT ============== */
function Particles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.style.position = 'absolute';
      p.style.width = Math.random() > 0.5 ? '2px' : '3px';
      p.style.height = p.style.width;
      p.style.background = Math.random() > 0.5 ? '#00ff41' : '#00f0ff';
      p.style.borderRadius = '50%';
      p.style.opacity = '0';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.pointerEvents = 'none';
      p.style.animation = `floatUp ${Math.random() * 8 + 8}s ease-in-out infinite`;
      p.style.animationDelay = Math.random() * 5 + 's';
      container.appendChild(p);
      particles.push(p);
    }

    return () => {
      particles.forEach(p => p.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    />
  );
}

/* ============== TOAST COMPONENT ============== */
function ToastContainer({ toasts }: { toasts: ToastMsg[] }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10002,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            background: 'rgba(10, 10, 15, 0.95)',
            border: `1px solid ${t.type === 'error' ? '#ff0040' : '#00ff41'}`,
            borderRadius: '12px',
            padding: '15px 25px',
            color: '#fff',
            fontSize: '0.9rem',
            boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 20px ${t.type === 'error' ? 'rgba(255,0,64,0.2)' : 'rgba(0,255,65,0.2)'}`,
            animation: 'toastIn 0.4s ease, toastOut 0.4s ease 2.6s forwards',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            pointerEvents: 'auto',
            maxWidth: '90vw',
            fontFamily: "'Share Tech Mono', monospace",
          }}
        >
          <i className={`fas ${t.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`}
             style={{ color: t.type === 'error' ? '#ff0040' : '#00ff41' }} />
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ============== LOADING SCREEN ============== */
function LoadingScreen({ dpImage, onDone }: { dpImage: string; onDone: () => void }) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 12) + 3;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(onDone, 400);
      }
      setPercent(p);
    }, 250);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#050505',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.6s ease',
      }}
    >
      <div
        style={{
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '3px solid #00ff41',
          boxShadow: '0 0 30px #00ff41, 0 0 60px rgba(0,255,65,0.3)',
          animation: 'dpPulse 2s ease-in-out infinite',
          marginBottom: '30px',
          position: 'relative',
        }}
      >
        <img
          src={dpImage}
          alt="DP"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '1.2rem',
          color: '#00ff41',
          textShadow: '0 0 10px #00ff41',
          letterSpacing: '5px',
          marginBottom: '20px',
          animation: 'neonFlicker 3s infinite',
        }}
      >
        INITIALIZING...
      </div>
      <div
        style={{
          width: '260px',
          height: '4px',
          background: 'rgba(0,255,65,0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #00ff41, #00f0ff)',
            width: `${percent}%`,
            transition: 'width 0.2s ease',
            boxShadow: '0 0 10px #00ff41',
          }}
        />
      </div>
      <div style={{ marginTop: '12px', fontSize: '1rem', color: '#00f0ff', fontFamily: "'Orbitron', sans-serif" }}>
        {percent}%
      </div>
      <div style={{ marginTop: '30px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '3px' }}>
        ALONE HACKER TOOLKIT v2.0
      </div>
    </div>
  );
}

/* ============== PASSWORD SCREEN ============== */
function PasswordScreen({ onLogin, showToast }: { onLogin: (type: string) => void; showToast: (m: string, t: 'success' | 'error') => void }) {
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await api.login(password);
      localStorage.setItem('shadow_token', res.token);
      localStorage.setItem('shadow_userType', res.userType);
      onLogin(res.userType);
      showToast(res.userType === 'admin' ? 'Welcome Admin! Access granted.' : 'Welcome to ALONE TOOLKIT!', 'success');
    } catch (e: any) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 3000);
      showToast('Invalid Access Key! Access Denied.', 'error');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#050505',
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'rgba(10,10,15,0.9)',
          border: '1px solid rgba(0,255,65,0.3)',
          borderRadius: '20px',
          padding: '40px 30px',
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(0,255,65,0.1), inset 0 0 40px rgba(0,255,65,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
            background: 'linear-gradient(45deg, #00ff41, #00f0ff, #b026ff, #00ff41)',
            borderRadius: '20px',
            zIndex: -1,
            animation: 'borderRotate 4s linear infinite',
            opacity: 0.5,
          }}
        />
        <div
          style={{
            fontSize: '4rem',
            color: '#00ff41',
            textShadow: '0 0 20px #00ff41',
            marginBottom: '20px',
            animation: 'lockFloat 3s ease-in-out infinite',
          }}
        >
          <i className="fas fa-fingerprint" />
        </div>
        <div
          className="glitch"
          data-text="AUTHENTICATION REQUIRED"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '1.4rem',
            color: '#00ff41',
            textShadow: '0 0 10px #00ff41',
            marginBottom: '10px',
            fontWeight: 900,
          }}
        >
          AUTHENTICATION REQUIRED
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '30px' }}>
          Enter your access key to continue
        </div>

        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <input
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter Access Key..."
            autoComplete="off"
            style={{
              width: '100%',
              padding: '15px 50px 15px 20px',
              background: 'rgba(0,0,0,0.5)',
              border: `2px solid ${error ? '#ff0040' : 'rgba(0,255,65,0.3)'}`,
              borderRadius: '12px',
              color: '#00ff41',
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.3s',
              letterSpacing: '2px',
            }}
          />
          <span
            onClick={() => setShowPass(!showPass)}
            style={{
              position: 'absolute',
              right: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              fontSize: '1.1rem',
            }}
          >
            <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
          </span>
        </div>

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '15px',
            background: 'linear-gradient(135deg, #00ff41, #00f0ff)',
            border: 'none',
            borderRadius: '12px',
            color: '#000',
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            transition: 'all 0.3s',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={e => {
            (e.target as HTMLElement).style.transform = 'translateY(-2px)';
            (e.target as HTMLElement).style.boxShadow = '0 10px 30px rgba(0,255,65,0.4)';
          }}
          onMouseLeave={e => {
            (e.target as HTMLElement).style.transform = 'translateY(0)';
            (e.target as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <i className="fas fa-unlock-alt" /> ACCESS
        </button>

        {error && (
          <div
            style={{
              color: '#ff0040',
              textShadow: '0 0 10px #ff0040',
              marginTop: '15px',
              fontSize: '0.9rem',
              animation: shake ? 'shake 0.5s' : 'none',
            }}
          >
            <i className="fas fa-exclamation-triangle" /> Invalid Access Key!
          </div>
        )}
      </div>
    </div>
  );
}

/* ============== WELCOME MODAL ============== */
function WelcomeModal() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.85)',
        zIndex: 9997,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(5px)',
        animation: 'fadeIn 0.5s ease',
      }}
    >
      <div
        style={{
          background: 'rgba(10,10,15,0.95)',
          border: '2px solid rgba(0,255,65,0.4)',
          borderRadius: '24px',
          padding: '35px 30px',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 0 60px rgba(0,255,65,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(0,255,65,0.08) 0%, transparent 60%)',
            animation: 'glowPulse 4s ease-in-out infinite',
          }}
        />
        <div style={{ fontSize: '3rem', marginBottom: '15px', animation: 'floatUp 3s ease-in-out infinite' }}>👑</div>
        <h2
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '1.4rem',
            color: '#00ff41',
            textShadow: '0 0 15px #00ff41',
            marginBottom: '12px',
          }}
        >
          Welcome to ALONE TOOLKIT!
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
          You now have access to premium tools & resources.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <div
            style={{
              background: 'rgba(0,255,65,0.08)',
              border: '1px solid rgba(0,255,65,0.2)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textAlign: 'left',
            }}
          >
            <i className="fab fa-telegram" style={{ color: '#0088cc', fontSize: '1.2rem' }} />
            <span>Join our Telegram channel for latest updates!</span>
          </div>
          <div
            style={{
              background: 'rgba(37,211,102,0.08)',
              border: '1px solid rgba(37,211,102,0.2)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textAlign: 'left',
            }}
          >
            <i className="fab fa-whatsapp" style={{ color: '#25d366', fontSize: '1.2rem' }} />
            <span>Join WhatsApp Channel for exclusive content!</span>
          </div>
          <div
            style={{
              background: 'rgba(255,0,0,0.08)',
              border: '1px solid rgba(255,0,0,0.2)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textAlign: 'left',
            }}
          >
            <i className="fab fa-youtube" style={{ color: '#ff0000', fontSize: '1.2rem' }} />
            <span>Subscribe on YouTube for tutorials!</span>
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '15px' }}>
          For support, contact us on WhatsApp
        </p>

        <button
          onClick={() => setVisible(false)}
          style={{
            padding: '12px 30px',
            background: 'linear-gradient(135deg, #00ff41, #00f0ff)',
            border: 'none',
            borderRadius: '12px',
            color: '#000',
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
            letterSpacing: '2px',
          }}
        >
          GET STARTED
        </button>
      </div>
    </div>
  );
}

/* ============== MAIN APP ============== */
export default function App() {
  const [screen, setScreen] = useState<'loading' | 'password' | 'user' | 'admin'>('loading');
  const [dpImage, setDpImage] = useState('/images/dp.png');
  const [tools, setTools] = useState<Tool[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    whatsapp: 'https://wa.me/923235248941',
    youtube: 'https://youtube.com/@alonehacker-0009t?si=uDcpQT4xHDH3ZeR-',
    telegram: 'https://t.me/alone_hacker_0009t',
    channel: 'https://whatsapp.com/channel/0029Vb50wllJuyAEmYS7iV1h',
  });
  const [activeUsers, setActiveUsers] = useState(0);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminTab, setAdminTab] = useState('addTool');
  const [lastModified, setLastModified] = useState(0);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // Load DP
  useEffect(() => {
    api.getDp()
      .then(d => { if (d.dpImage) setDpImage(d.dpImage); })
      .catch(() => {});
  }, []);

  // Initial data load + session check
  useEffect(() => {
    const token = localStorage.getItem('shadow_token');
    if (token) {
      api.verify().then(res => {
        if (res.userType) {
          setScreen(res.userType);
          if (res.userType === 'user') setShowWelcome(true);
        } else {
          setScreen('password');
        }
      }).catch(() => setScreen('password'));
    }

    api.getSync().then(data => {
      setTools(data.tools?.tools || []);
      setNotifications(data.notifications?.notifications || []);
      setSocialLinks(data.settings?.socialLinks || socialLinks);
      setActiveUsers(data.activeUsers || 0);
      setLastModified(data.lastModified || 0);
      setUnreadCount((data.notifications?.notifications || []).filter((n: Notification) => !n.read).length);
    }).catch(() => {});
  }, []);

  // Real-time sync every 3 seconds
  useEffect(() => {
    if (screen === 'loading') return;
    const interval = setInterval(() => {
      api.getSync().then(data => {
        if (data.lastModified > lastModified) {
          setLastModified(data.lastModified);
          setTools(data.tools?.tools || []);
          setNotifications(data.notifications?.notifications || []);
          setSocialLinks(data.settings?.socialLinks || socialLinks);
          setActiveUsers(data.activeUsers || 0);
          const newUnread = (data.notifications?.notifications || []).filter((n: Notification) => !n.read).length;
          setUnreadCount(newUnread);

          // Check if DP changed
          if (data.settings?.hasCustomDp && dpImage === '/images/dp.png') {
            api.getDp().then(d => { if (d.dpImage) setDpImage(d.dpImage); });
          }
        }
      }).catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [screen, lastModified, dpImage, socialLinks]);

  const handleLogin = (type: string) => {
    setScreen(type as any);
    if (type === 'user') setShowWelcome(true);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('shadow_token');
    if (token) {
      try { await api.logout(token); } catch (e) {}
    }
    localStorage.removeItem('shadow_token');
    localStorage.removeItem('shadow_userType');
    setScreen('password');
    showToast('Logged out successfully!', 'success');
  };

  const filteredTools = tools.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDownloads = tools.reduce((sum, t) => sum + (t.downloads || 0), 0);

  return (
    <>
      <MatrixRain />
      <Particles />
      <ToastContainer toasts={toasts} />

      {screen === 'loading' && (
        <LoadingScreen dpImage={dpImage} onDone={() => {
          const token = localStorage.getItem('shadow_token');
          if (token) {
            api.verify().then(res => {
              if (res.userType) {
                setScreen(res.userType);
                if (res.userType === 'user') setShowWelcome(true);
              } else {
                setScreen('password');
              }
            }).catch(() => setScreen('password'));
          } else {
            setScreen('password');
          }
        }} />
      )}

      {screen === 'password' && <PasswordScreen onLogin={handleLogin} showToast={showToast} />}

      {screen === 'user' && (
        <UserPanel
          tools={filteredTools}
          allTools={tools}
          notifications={notifications}
          socialLinks={socialLinks}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          unreadCount={unreadCount}
          onLogout={handleLogout}
          onOpenNotifs={() => setNotifPanelOpen(true)}
          totalDownloads={totalDownloads}
          onDownload={async (id) => {
            await api.downloadTool(id);
          }}
        />
      )}

      {screen === 'admin' && (
        <AdminPanel
          tools={tools}
          notifications={notifications}
          socialLinks={socialLinks}
          activeUsers={activeUsers}
          unreadCount={unreadCount}
          adminTab={adminTab}
          setAdminTab={setAdminTab}
          onLogout={handleLogout}
          onOpenNotifs={() => setNotifPanelOpen(true)}
          showToast={showToast}
          onRefresh={async () => {
            const data = await api.getSync();
            setTools(data.tools?.tools || []);
            setNotifications(data.notifications?.notifications || []);
            setSocialLinks(data.settings?.socialLinks || socialLinks);
            setActiveUsers(data.activeUsers || 0);
            setLastModified(data.lastModified || 0);
          }}
          setTools={setTools}
          setNotifications={setNotifications}
          setSocialLinks={setSocialLinks}
          setActiveUsers={setActiveUsers}
          setDpImage={setDpImage}
        />
      )}

      {showWelcome && <WelcomeModal />}

      {notifPanelOpen && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setNotifPanelOpen(false)}
          onClearAll={async () => {
            await api.clearNotifications();
            setNotifications([]);
            setUnreadCount(0);
            showToast('All notifications cleared!', 'success');
          }}
        />
      )}
    </>
  );
}
