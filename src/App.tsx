import { useEffect, useRef, useState } from 'react';
import './App.css';
import logisnextLogo from '../Imagenes/logo.PNG';
import florcliftImage from '../Imagenes/FLORCLIFT_XL.PNG';
import norwayFlag from '../Imagenes/bandera.PNG';
import { getChatResponse } from './services/gemini';
import PlcConfig from './PlcConfig';
import BaslerCamera from './BaslerCamera';
import { useTranslation } from './i18n';
import ImageMeasurement from './ImageMeasurement';

interface Detection {
  id: number;
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface VideoMapping {
  id: string;
  label: string;
  videoFile: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}


function App() {
  const { t, language, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState<'live' | 'mapping' | 'chat' | 'plc' | 'camera' | 'medicion'>('live');
  const [fps, setFps] = useState(0);
  const [confidenceAvg, setConfidenceAvg] = useState(94);
  const [modelActive, setModelActive] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);



  const [mappings, setMappings] = useState<VideoMapping[]>([
    { id: '1', label: 'Montacargas', videoFile: 'Bastidores.mp4' },
    { id: '2', label: 'Operario', videoFile: 'Mastiles.mp4' }
  ]);
  const [activePlaybackUrl, setActivePlaybackUrl] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);



  useEffect(() => {
    // Simulating camera feed via webcam
    async function initCamera() {
      if (!cameraEnabled) {
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.warn('Cannot access webcam, continuing with UI mock', e);
      }
    }
    initCamera();

    // Cleanup on unmount
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraEnabled]);

  useEffect(() => {
    let animationId: number;
    let frames = 0;
    let lastTime = performance.now();
    let xOffset = 0;
    let dir = 1;

    // Simulate drawing bounding boxes
    const draw = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const width = canvasRef.current.width;
      const height = canvasRef.current.height;

      ctx.clearRect(0, 0, width, height);

      if (modelActive) {
        // Mock Detections testing (change to empty array in production)
        const detections: Detection[] = [
          // { id: 1, label: 'Bastidor', confidence: 0.98, x: 200 + xOffset, y: 150, width: 180, height: 160, color: '#34C759' }
        ];

        // Check for mappings
        if (detections.length > 0) {
          const match = mappings.find(m => m.label.toLowerCase() === detections[0].label.toLowerCase());
          if (match) {
            setActivePlaybackUrl(`/videos/${match.videoFile}`);
          }
        }

        detections.forEach(d => {
          ctx.strokeStyle = d.color;
          ctx.lineWidth = 3;
          ctx.strokeRect(d.x, d.y, d.width, d.height);

          // Background for text
          ctx.fillStyle = d.color;
          ctx.fillRect(d.x, d.y - 25, d.width, 25);

          // Text
          ctx.fillStyle = '#000';
          ctx.font = 'bold 14px Inter, sans-serif';
          ctx.fillText(`${d.label} ${(d.confidence * 100).toFixed(1)}%`, d.x + 5, d.y - 8);
        });

        // Simple animation
        xOffset += 1.5 * dir;
        if (xOffset > 100 || xOffset < -50) dir *= -1;
      }

      // FPS calc
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(modelActive ? Math.floor(Math.random() * 5 + 28) : 0);
        setConfidenceAvg(modelActive ? Math.floor(Math.random() * 5 + 92) : 0);
        frames = 0;
        lastTime = now;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [modelActive]);

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="brand">
          <img src={logisnextLogo} alt="Logisnext Logo" className="logo-image" />
        </div>
        <div className="nav-links">
          <button className={`nav-btn ${activeTab === 'live' ? 'active' : ''}`} onClick={() => setActiveTab('live')}>{t('liveInference')}</button>
          <button className={`nav-btn ${activeTab === 'camera' ? 'active' : ''}`} onClick={() => setActiveTab('camera')}>{t('camera')}</button>
          <button className={`nav-btn ${activeTab === 'mapping' ? 'active' : ''}`} onClick={() => setActiveTab('mapping')}>{t('mapping')}</button>
          <button className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>{t('chat')}</button>
          <button className={`nav-btn ${activeTab === 'plc' ? 'active' : ''}`} onClick={() => setActiveTab('plc')}>{t('plc')}</button>
          <button className={`nav-btn ${activeTab === 'medicion' ? 'active' : ''}`} onClick={() => setActiveTab('medicion')}>Medición</button>
        </div>
        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', marginLeft: '16px', gap: '16px' }}>
          <img
            src={norwayFlag}
            alt="Norway Flag"
            title={t('switchLangTip')}
            onClick={() => setLanguage(language === 'es' ? 'no' : 'es')}
            style={{
              height: '32px',
              borderRadius: '4px',
              objectFit: 'cover',
              border: language === 'no' ? '2px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.2)',
              boxShadow: language === 'no' ? '0 0 10px var(--primary-color)' : '0 2px 4px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: language === 'no' ? 1 : 0.7
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
            onMouseOut={(e) => e.currentTarget.style.opacity = language === 'no' ? '1' : '0.7'}
          />
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'live' ? (
          <>
            {/* Left Side: Video Stream */}
            <div className="video-section">
              <div className="video-wrapper">
                {/* Video Feed or Static Image */}
                <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                  <img
                    src={florcliftImage}
                    alt="Static View"
                    className="live-video"
                    style={{ position: 'absolute', opacity: cameraEnabled ? 0 : 1, transition: 'opacity 0.3s' }}
                  />
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="live-video"
                    style={{ position: 'absolute', opacity: cameraEnabled ? 1 : 0, transition: 'opacity 0.3s', pointerEvents: cameraEnabled ? 'auto' : 'none' }}
                  />
                </div>
                <canvas ref={canvasRef} width="800" height="500" className="overlay-canvas" />

                {/* Video Controls Overlay */}
                <div className="video-controls-overlay">
                  <div className={`status-indicator ${cameraEnabled ? 'live' : ''}`} style={{ backgroundColor: cameraEnabled ? 'rgba(0,0,0,0.6)' : 'rgba(255,149,0,0.8)' }}>
                    {cameraEnabled ? <span className="dot pulse"></span> : <span style={{ marginRight: 8 }}>⚠️</span>}
                    {cameraEnabled ? t('camLive') : t('camOffline')}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="model-toggle">
                      <span>{cameraEnabled ? t('camOn') : t('camOff')}</span>
                      <label className="switch">
                        <input type="checkbox" checked={cameraEnabled} onChange={(e) => setCameraEnabled(e.target.checked)} />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    <div className="model-toggle">
                      <span>{modelActive ? t('modelActive') : t('modelPaused')}</span>
                      <label className="switch">
                        <input type="checkbox" checked={modelActive} onChange={(e) => setModelActive(e.target.checked)} />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
                {!modelActive && (
                  <div className="paused-overlay">
                    <h2>{t('infPaused')}</h2>
                    <p>{t('waitingReactivation')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Telemetry, Alerts, and Playback */}
            <aside className="telemetry-panel">

              {activePlaybackUrl && (
                <div className="playback-section" style={{ marginBottom: '24px' }}>
                  <div className="alerts-header">
                    <h2>{t('vidRefTriggered')}</h2>
                    <button
                      onClick={() => setActivePlaybackUrl(null)}
                      style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {t('close')}
                    </button>
                  </div>
                  <video
                    src={activePlaybackUrl}
                    className="playback-video"
                    controls
                    autoPlay
                    style={{ width: '100%', borderRadius: '8px', border: '1px solid #30363d', marginTop: '12px' }}
                  />
                </div>
              )}

              <div className="telemetry-cards">
                <div className="telemetry-card">
                  <h3>{t('sysFps')}</h3>
                  <div className="val">{fps} <span className="unit">fps</span></div>
                </div>
                <div className="telemetry-card">
                  <h3>{t('avgConf')}</h3>
                  <div className="val">{confidenceAvg} <span className="unit">%</span></div>
                </div>
                <div className="telemetry-card connection">
                  <h3>{t('roboflowServer')}</h3>
                  <div className="status-badge connected">{t('connected')}</div>
                </div>
              </div>



            </aside>
          </>
        ) : activeTab === 'camera' ? (
          <BaslerCamera />
        ) : activeTab === 'plc' ? (
          <PlcConfig />
        ) : activeTab === 'medicion' ? (
          <ImageMeasurement />
        ) : activeTab === 'mapping' ? (
          <div className="mapping-container">
            <div className="mapping-header">
              <h2>{t('mapConfig')}</h2>
              <p>{t('mapDesc')}</p>
            </div>
            <div className="mapping-grid">
              {mappings.map(map => (
                <div key={map.id} className="mapping-card">
                  <div className="mapping-field">
                    <label>{t('classDet')}</label>
                    <input
                      type="text"
                      value={map.label}
                      onChange={(e) => setMappings(mappings.map(m => m.id === map.id ? { ...m, label: e.target.value } : m))}
                      placeholder="Ej: Montacargas"
                    />
                  </div>
                  <div className="mapping-field">
                    <label>{t('vidFile')}</label>
                    <input
                      type="text"
                      value={map.videoFile}
                      onChange={(e) => setMappings(mappings.map(m => m.id === map.id ? { ...m, videoFile: e.target.value } : m))}
                      placeholder="Ej: Bastidores.mp4"
                    />
                  </div>
                </div>
              ))}
              <button
                className="add-mapping-btn"
                onClick={() => setMappings([...mappings, { id: Date.now().toString(), label: '', videoFile: '' }])}
              >
                {t('addMap')}
              </button>
            </div>
          </div>
        ) : activeTab === 'chat' ? (
          <div className="chat-container">
            <div className="chat-header">
              <h2>{t('chatTitle')}</h2>
              <p>{t('chatDesc')}</p>
            </div>
            <div className="chat-messages-area">
              {chatMessages.length === 0 && (
                <div className="chat-empty">
                  <h3>{t('chatHelp')}</h3>
                  <p>{t('chatHelpSub')}</p>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble-wrapper ${msg.role}`}>
                  <div className="chat-bubble">
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="chat-bubble-wrapper model">
                  <div className="chat-bubble loading">
                    <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                  </div>
                </div>
              )}
            </div>
            <div className="chat-input-area">
              <input
                type="text"
                placeholder={t('placeholder')}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatInput.trim() && !isChatLoading) {
                    const userMessage = { role: 'user' as const, text: chatInput };
                    setChatMessages(prev => [...prev, userMessage]);
                    setChatInput('');
                    setIsChatLoading(true);
                    getChatResponse(chatMessages, chatInput).then(reply => {
                      setChatMessages(prev => [...prev, { role: 'model', text: reply || '' }]);
                      setIsChatLoading(false);
                    }).catch(err => {
                      setChatMessages(prev => [...prev, { role: 'model', text: t('errReq') + String(err) }]);
                      setIsChatLoading(false);
                    });
                  }
                }}
              />
              <button
                disabled={!chatInput.trim() || isChatLoading}
                onClick={() => {
                  const userMessage = { role: 'user' as const, text: chatInput };
                  setChatMessages(prev => [...prev, userMessage]);
                  setChatInput('');
                  setIsChatLoading(true);
                  getChatResponse(chatMessages, chatInput).then(reply => {
                    setChatMessages(prev => [...prev, { role: 'model', text: reply || '' }]);
                    setIsChatLoading(false);
                  }).catch(err => {
                    setChatMessages(prev => [...prev, { role: 'model', text: t('errReq') + String(err) }]);
                    setIsChatLoading(false);
                  });
                }}
              >
                {t('send')}
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;
