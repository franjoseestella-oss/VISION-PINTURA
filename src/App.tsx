import { useEffect, useRef, useState, useCallback } from 'react';
import './App.css';
import logisnextLogo from '../Imagenes/logo.PNG';
import florcliftImage from '../Imagenes/FLORCLIFT_XL.PNG';
import norwayFlag from '../Imagenes/bandera.PNG';
import { getChatResponse } from './services/gemini';
import PlcConfig from './PlcConfig';
import BaslerCamera from './BaslerCamera';
import ConfigScreen from './ConfigScreen';
import { useTranslation } from './i18n';


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
  videoBlobUrl?: string; // Uploaded video blob URL
  objFile?: string;      // .obj 3D model filename
  objBlobUrl?: string;   // .obj blob URL for download/preview
  mtlFile?: string;      // .mtl material filename
  mtlBlobUrl?: string;   // .mtl blob URL
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}


function App() {
  const { t, language, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState<'live' | 'config' | 'chat' | 'plc' | 'camera'>('live');
  const [fps, setFps] = useState(0);
  const [confidenceAvg, setConfidenceAvg] = useState(94);
  const [modelActive, setModelActive] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  // ── Uploaded video source for Live Inference ──
  const [liveVideoSrc, setLiveVideoSrc] = useState<string | null>(null);
  const [liveVideoPlaying, setLiveVideoPlaying] = useState(false);
  const [liveVideoLoading, setLiveVideoLoading] = useState(false);
  const [liveVideoError, setLiveVideoError] = useState<string | null>(null);
  const liveUploadedVideoRef = useRef<HTMLVideoElement>(null);
  const liveFileInputRef = useRef<HTMLInputElement>(null);



  const [mappings, setMappings] = useState<VideoMapping[]>(() => {
    const saved = localStorage.getItem('videoMappings');
    if (saved) {
      try { return JSON.parse(saved); } catch (_) { /* ignore */ }
    }
    return [
      { id: '1', label: 'Montacargas', videoFile: 'Bastidores.mp4' },
      { id: '2', label: 'Operario', videoFile: 'Mastiles.mp4' }
    ];
  });
  const [activePlaybackUrl, setActivePlaybackUrl] = useState<string | null>(null);
  const [activePlaybackLabel, setActivePlaybackLabel] = useState<string>('');
  const [videoPopupMinimized, setVideoPopupMinimized] = useState(false);

  // ── Live Roboflow inference state ──
  const [liveDetections, setLiveDetections] = useState<Detection[]>([]);
  const [liveInferring, setLiveInferring] = useState(false);
  const liveInferringRef = useRef(false);
  const liveAnimFrameRef = useRef(0);
  const lastTriggeredLabelRef = useRef<string | null>(null);

  // Persist mappings
  useEffect(() => {
    localStorage.setItem('videoMappings', JSON.stringify(mappings));
  }, [mappings]);

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

  // Helper: set video source and auto-play
  const startLiveVideo = (blobUrl: string) => {
    setLiveVideoSrc(blobUrl);
    setLiveVideoPlaying(false);
    setTimeout(() => {
      const vid = liveUploadedVideoRef.current;
      if (vid) {
        vid.play().then(() => setLiveVideoPlaying(true)).catch(console.error);
      }
    }, 300);
  };

  // ── Handle video upload for Live Inference (same conversion as TEST screen) ──
  const handleLiveVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 500MB
    const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
    if (file.size > MAX_VIDEO_SIZE) {
      setLiveVideoError(`Vídeo demasiado grande (${(file.size / 1024 / 1024).toFixed(0)}MB). Máximo 500MB.`);
      return;
    }

    // Cleanup old video src
    if (liveVideoSrc) URL.revokeObjectURL(liveVideoSrc);
    setLiveVideoError(null);

    // Disable camera if active
    setCameraEnabled(false);
    setLiveDetections([]);
    lastTriggeredLabelRef.current = null;

    // Check if format is browser-compatible
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const browserFormats = ['mp4', 'webm', 'ogg', 'ogv'];

    if (browserFormats.includes(ext)) {
      // Direct playback — validate first
      try {
        const blobUrl = URL.createObjectURL(file);
        const testVideo = document.createElement('video');
        testVideo.preload = 'metadata';
        await new Promise<void>((resolve, reject) => {
          testVideo.onloadedmetadata = () => resolve();
          testVideo.onerror = () => reject(new Error(
            `El navegador no puede reproducir este vídeo (${ext}). Puede que el códec no sea compatible.`
          ));
          setTimeout(() => reject(new Error('Tiempo agotado al cargar el vídeo.')), 10000);
          testVideo.src = blobUrl;
        });
        testVideo.src = '';
        startLiveVideo(blobUrl);
      } catch (err: any) {
        console.error('Video load error:', err);
        setLiveVideoError(err.message);
      }
    } else {
      // AVI, MOV, WMV, MKV etc. → convert via backend
      setLiveVideoLoading(true);
      setLiveVideoError(null);
      try {
        const reader = new FileReader();
        const b64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Error leyendo el archivo de vídeo'));
          reader.readAsDataURL(file);
        });

        const resp = await fetch('http://localhost:8765/api/video/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ video: b64 })
        });

        if (!resp.ok) throw new Error(`Error del servidor: ${resp.status} ${resp.statusText}`);

        const data = await resp.json();
        if (!data.ok) throw new Error(data.error || 'Error desconocido en la conversión');

        // Create blob URL from returned MP4
        const mp4Bytes = Uint8Array.from(atob(data.mp4_base64), c => c.charCodeAt(0));
        const blob = new Blob([mp4Bytes], { type: 'video/mp4' });
        startLiveVideo(URL.createObjectURL(blob));
      } catch (err: any) {
        console.error('Video conversion error:', err);
        setLiveVideoError(`Error convirtiendo vídeo: ${err.message}`);
      } finally {
        setLiveVideoLoading(false);
      }
    }
  };

  const clearLiveVideo = () => {
    if (liveAnimFrameRef.current) cancelAnimationFrame(liveAnimFrameRef.current);
    if (liveVideoSrc) URL.revokeObjectURL(liveVideoSrc);
    setLiveVideoSrc(null);
    setLiveVideoPlaying(false);
    setLiveDetections([]);
    lastTriggeredLabelRef.current = null;
  };

  const toggleLiveVideoPlayPause = () => {
    const vid = liveUploadedVideoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().then(() => setLiveVideoPlaying(true));
    } else {
      vid.pause();
      setLiveVideoPlaying(false);
    }
  };

  // ── Send frame to Roboflow for inference (camera or uploaded video) ──
  const sendCameraFrameToRoboflow = useCallback(async (): Promise<Detection[]> => {
    // Prefer uploaded video, fallback to camera
    const video = (liveUploadedVideoRef.current && liveUploadedVideoRef.current.readyState >= 2)
      ? liveUploadedVideoRef.current
      : videoRef.current;
    if (!video || video.readyState < 2) return [];

    // Capture frame from video
    const tempCanvas = document.createElement('canvas');
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    const MAX_W = 640;
    const downscale = vw > MAX_W ? MAX_W / vw : 1;
    tempCanvas.width = Math.round(vw * downscale);
    tempCanvas.height = Math.round(vh * downscale);
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return [];
    tCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    const frameSrc = tempCanvas.toDataURL('image/jpeg', 0.5);

    try {
      const response = await fetch('http://localhost:8765/api/measure/roboflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: frameSrc })
      });
      const data = await response.json();
      if (!data.ok) return [];
      const preds = Array.isArray(data.predictions) ? data.predictions : [];

      // Convert Roboflow predictions to Detection format with color
      const colors = ['#BD00FF', '#00FFFF', '#FF00FF', '#70FF00', '#FFBD00', '#FF0000', '#0070FF', '#FF00BD', '#00FF70', '#BDFF00'];
      const getColor = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
      };

      return preds.map((p: any, idx: number) => {
        // Scale coordinates back to original video resolution
        const upscale = 1 / downscale;
        return {
          id: idx,
          label: p.class || 'Object',
          confidence: p.confidence ?? 1,
          x: (p.x || 0) * upscale,
          y: (p.y || 0) * upscale,
          width: (p.width || 0) * upscale,
          height: (p.height || 0) * upscale,
          color: getColor(p.class || 'Object'),
        };
      });
    } catch {
      return [];
    }
  }, [liveVideoSrc]);

  // ── Upload a video file for a specific mapping ──
  const handleMappingVideoUpload = (mappingId: string, file: File) => {
    const blobUrl = URL.createObjectURL(file);
    setMappings(prev => prev.map(m =>
      m.id === mappingId ? { ...m, videoFile: file.name, videoBlobUrl: blobUrl } : m
    ));
  };

  // ── Upload an .obj file for a specific mapping ──
  const handleMappingObjUpload = (mappingId: string, file: File) => {
    const blobUrl = URL.createObjectURL(file);
    setMappings(prev => prev.map(m =>
      m.id === mappingId ? { ...m, objFile: file.name, objBlobUrl: blobUrl } : m
    ));
  };

  // ── Upload an .mtl file for a specific mapping ──
  const handleMappingMtlUpload = (mappingId: string, file: File) => {
    const blobUrl = URL.createObjectURL(file);
    setMappings(prev => prev.map(m =>
      m.id === mappingId ? { ...m, mtlFile: file.name, mtlBlobUrl: blobUrl } : m
    ));
  };

  // ── Check mappings: detected active label → trigger associated video ──
  const mappingLogCountRef = useRef(0);
  const checkVideoMappingTrigger = useCallback((dets: Detection[]) => {
    if (dets.length === 0) return;

    // Log detected labels for debugging (every 60th call to avoid spam)
    mappingLogCountRef.current++;
    if (mappingLogCountRef.current % 60 === 1) {
      const detectedLabels = dets.map(d => d.label.trim());
      const mappingsWithVideo = mappings.filter(m => m.videoBlobUrl);
      console.log(`[VIDEO MAPPING] Detected: [${detectedLabels.join(', ')}] | Mappings con vídeo subido: ${mappingsWithVideo.length}/${mappings.length}`);
    }

    // Find the first detected label that has a mapping WITH an uploaded video (videoBlobUrl)
    for (const det of dets) {
      const label = det.label.trim();

      const mapping = mappings.find(
        m => m.label.trim().toLowerCase() === label.toLowerCase() && !!m.videoBlobUrl
      );

      if (mapping && mapping.videoBlobUrl) {
        // Only trigger if this is a new detection (avoid re-triggering the same video)
        if (lastTriggeredLabelRef.current !== label) {
          lastTriggeredLabelRef.current = label;
          setActivePlaybackLabel(label);
          setActivePlaybackUrl(mapping.videoBlobUrl);
          console.log(`[VIDEO MAPPING] ✅ ${label} detected → Loading uploaded video for: ${mapping.videoFile}`);
        }
        return; // Only trigger first match
      }
    }
  }, [mappings]);

  // ── Live inference loop: camera/video → Roboflow → draw overlay + check video mapping ──
  useEffect(() => {
    const hasSource = cameraEnabled || !!liveVideoSrc;
    if (!hasSource || !modelActive || activeTab !== 'live') {
      if (liveAnimFrameRef.current) cancelAnimationFrame(liveAnimFrameRef.current);
      return;
    }

    let animationId: number;
    let frames = 0;
    let lastTime = performance.now();

    const renderLoop = () => {
      const canvas = canvasRef.current;
      const video = (liveUploadedVideoRef.current && liveUploadedVideoRef.current.readyState >= 2)
        ? liveUploadedVideoRef.current
        : videoRef.current;
      if (!canvas || !video) {
        animationId = requestAnimationFrame(renderLoop);
        return;
      }

      // If uploaded video ended, stop loop
      if (liveUploadedVideoRef.current && liveUploadedVideoRef.current.ended) {
        setLiveVideoPlaying(false);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw detections overlay
      liveDetections.forEach(d => {
        // Scale detection coords to canvas
        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 480;
        const scaleX = canvas.width / vw;
        const scaleY = canvas.height / vh;
        const bx = (d.x - d.width / 2) * scaleX;
        const by = (d.y - d.height / 2) * scaleY;
        const bw = d.width * scaleX;
        const bh = d.height * scaleY;

        ctx.strokeStyle = d.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(bx, by, bw, bh);

        // Label background
        const labelText = `${d.label} ${(d.confidence * 100).toFixed(0)}%`;
        ctx.font = 'bold 14px Inter, sans-serif';
        const tw = ctx.measureText(labelText).width;
        ctx.fillStyle = d.color;
        ctx.fillRect(bx - 1, by - 25, tw + 12, 25);
        ctx.fillStyle = '#000';
        ctx.fillText(labelText, bx + 5, by - 8);
      });

      // Send frame for inference when not busy
      if (!liveInferringRef.current) {
        liveInferringRef.current = true;
        setLiveInferring(true);
        sendCameraFrameToRoboflow().then(dets => {
          setLiveDetections(dets);
          checkVideoMappingTrigger(dets);
          liveInferringRef.current = false;
          setLiveInferring(false);
        }).catch(() => {
          liveInferringRef.current = false;
          setLiveInferring(false);
        });
      }

      // FPS calc
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frames);
        const avgConf = liveDetections.length > 0
          ? Math.round(liveDetections.reduce((sum, d) => sum + d.confidence * 100, 0) / liveDetections.length)
          : 0;
        setConfidenceAvg(avgConf);
        frames = 0;
        lastTime = now;
      }

      animationId = requestAnimationFrame(renderLoop);
    };

    animationId = requestAnimationFrame(renderLoop);
    liveAnimFrameRef.current = animationId;

    return () => {
      cancelAnimationFrame(animationId);
      if (liveAnimFrameRef.current) cancelAnimationFrame(liveAnimFrameRef.current);
    };
  }, [cameraEnabled, modelActive, activeTab, liveDetections, liveVideoSrc, sendCameraFrameToRoboflow, checkVideoMappingTrigger]);

  // ── Fallback mock animation when camera is OFF and no uploaded video ──
  useEffect(() => {
    if (cameraEnabled || liveVideoSrc) return; // Real inference handles this

    let animationId: number;
    let frames = 0;
    let lastTime = performance.now();

    const draw = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

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
  }, [cameraEnabled, liveVideoSrc, modelActive]);

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
          <button className={`nav-btn ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>⚙ Configuración</button>
          <button className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>{t('chat')}</button>
          <button className={`nav-btn ${activeTab === 'plc' ? 'active' : ''}`} onClick={() => setActiveTab('plc')}>{t('plc')}</button>

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
            {/* Hidden file input for video upload (outside overlay to avoid z-index issues) */}
            <input
              ref={liveFileInputRef}
              type="file"
              accept="video/*,.avi,.mov,.wmv,.mkv,.flv"
              style={{ display: 'none' }}
              onChange={handleLiveVideoUpload}
            />
            {/* Left Side: Video Stream */}
            <div className="video-section">
              <div className="video-wrapper">
                {/* Video Feed or Static Image or Uploaded Video */}
                <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                  <img
                    src={florcliftImage}
                    alt="Static View"
                    className="live-video"
                    style={{ position: 'absolute', opacity: (cameraEnabled || liveVideoSrc) ? 0 : 1, transition: 'opacity 0.3s' }}
                  />
                  {/* Camera stream */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="live-video"
                    style={{ position: 'absolute', opacity: cameraEnabled && !liveVideoSrc ? 1 : 0, transition: 'opacity 0.3s', pointerEvents: cameraEnabled ? 'auto' : 'none' }}
                  />
                  {/* Uploaded video */}
                  {liveVideoSrc && (
                    <video
                      ref={liveUploadedVideoRef}
                      src={liveVideoSrc}
                      muted
                      playsInline
                      loop
                      className="live-video"
                      style={{ position: 'absolute', opacity: 1, transition: 'opacity 0.3s', objectFit: 'contain', background: '#000' }}
                    />
                  )}
                </div>
                <canvas ref={canvasRef} width="800" height="500" className="overlay-canvas" />

                {/* Video Controls Overlay */}
                <div className="video-controls-overlay">
                  <div className={`status-indicator ${(cameraEnabled || liveVideoSrc) ? 'live' : ''}`} style={{
                    backgroundColor: liveVideoSrc ? 'rgba(31,111,235,0.8)' : cameraEnabled ? 'rgba(0,0,0,0.6)' : 'rgba(255,149,0,0.8)'
                  }}>
                    {liveVideoLoading ? (
                      <><span style={{ marginRight: 8, animation: 'pulse 1s infinite' }}>⏳</span> CONVIRTIENDO VÍDEO...</>
                    ) : liveVideoSrc ? (
                      <><span className="dot pulse" style={{ backgroundColor: '#1f6feb' }}></span> 🎥 VÍDEO CARGADO</>
                    ) : cameraEnabled ? (
                      <><span className="dot pulse"></span> {t('camLive')}</>
                    ) : (
                      <><span style={{ marginRight: 8 }}>⚠️</span> {t('camOffline')}</>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', pointerEvents: 'auto' }}>
                    {/* Upload video button — uses ref to trigger hidden input */}
                    <button
                      onClick={() => liveFileInputRef.current?.click()}
                      style={{
                        padding: '6px 14px', background: 'linear-gradient(135deg, #1f6feb, #388bfd)',
                        color: '#fff', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem',
                        display: 'flex', alignItems: 'center', gap: 6, border: 'none',
                        boxShadow: '0 2px 8px rgba(31,111,235,0.4)', transition: 'all 0.2s',
                      }}
                    >
                      🎥 Cargar Vídeo
                    </button>
                    {/* Play/Pause + Close for uploaded video */}
                    {liveVideoSrc && (
                      <>
                        <button
                          onClick={toggleLiveVideoPlayPause}
                          style={{
                            padding: '6px 12px', background: '#161b22', border: '1px solid #30363d',
                            borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: '1rem',
                          }}
                        >{liveVideoPlaying ? '⏸️' : '▶️'}</button>
                        <button
                          onClick={clearLiveVideo}
                          style={{
                            padding: '6px 12px', background: '#161b22', border: '1px solid #f8514940',
                            borderRadius: 8, color: '#f85149', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                          }}
                        >✕ Cerrar</button>
                      </>
                    )}
                    {!liveVideoSrc && (
                      <div className="model-toggle">
                        <span>{cameraEnabled ? t('camOn') : t('camOff')}</span>
                        <label className="switch">
                          <input type="checkbox" checked={cameraEnabled} onChange={(e) => setCameraEnabled(e.target.checked)} />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    )}
                    <div className="model-toggle">
                      <span>{modelActive ? t('modelActive') : t('modelPaused')}</span>
                      <label className="switch">
                        <input type="checkbox" checked={modelActive} onChange={(e) => setModelActive(e.target.checked)} />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Loading overlay for video conversion */}
                {liveVideoLoading && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.75)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8,
                  }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 16, animation: 'pulse 1.5s infinite' }}>🔄</div>
                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>Convirtiendo vídeo...</div>
                    <div style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 8 }}>El formato se está convirtiendo a MP4 para el navegador</div>
                  </div>
                )}

                {/* Video error banner */}
                {liveVideoError && (
                  <div style={{
                    position: 'absolute', bottom: 8, left: 8, right: 8, zIndex: 21,
                    background: 'rgba(248,81,73,0.15)', border: '1px solid #f85149', borderRadius: 8,
                    padding: '8px 14px', color: '#f85149', fontSize: '0.78rem', fontWeight: 600,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span>⚠ {liveVideoError}</span>
                    <button onClick={() => setLiveVideoError(null)} style={{
                      background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                    }}>✕</button>
                  </div>
                )}
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

              {/* ── Detected Objects Banner ── */}
              {liveDetections.length > 0 && (cameraEnabled || liveVideoSrc) && (
                <div style={{
                  background: '#0d1117', border: '1px solid #30363d', borderRadius: 8,
                  padding: '10px 14px', marginBottom: 12,
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8b949e', marginBottom: 6 }}>
                    🎯 Objetos Detectados ({liveDetections.length})
                    {liveInferring && <span style={{ marginLeft: 8, color: '#ff9500', animation: 'pulse 1s infinite' }}>⏳</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {liveDetections.map((d, i) => (
                      <span key={i} style={{
                        fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: 8,
                        background: `${d.color}20`, border: `1px solid ${d.color}60`,
                        color: d.color,
                      }}>
                        {d.label} {(d.confidence * 100).toFixed(0)}%
                      </span>
                    ))}
                  </div>
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

        ) : activeTab === 'config' ? (
          <ConfigScreen mappings={mappings} setMappings={setMappings} onMappingVideoUpload={handleMappingVideoUpload} onMappingObjUpload={handleMappingObjUpload} onMappingMtlUpload={handleMappingMtlUpload} />
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

      {/* ═══ FLOATING VIDEO POPUP ═══ */}
      {activePlaybackUrl && (
        <>
          {/* Backdrop (only when expanded) */}
          {!videoPopupMinimized && (
            <div
              onClick={() => setVideoPopupMinimized(true)}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.6)', zIndex: 9998,
                backdropFilter: 'blur(4px)',
                animation: 'fadeIn 0.2s ease-out',
              }}
            />
          )}

          {/* Popup container */}
          <div
            onClick={() => setVideoPopupMinimized(!videoPopupMinimized)}
            style={{
              position: 'fixed',
              zIndex: 9999,
              cursor: 'pointer',
              transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(videoPopupMinimized
                ? {
                    bottom: 20, right: 20,
                    width: 220, height: 'auto',
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.8), 0 0 0 2px rgba(31,111,235,0.5)',
                  }
                : {
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60vw', maxWidth: 900, height: 'auto',
                    borderRadius: 16,
                    boxShadow: '0 24px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.1)',
                  }
              ),
              background: '#0d1117',
              border: '1px solid #30363d',
              overflow: 'hidden',
            }}
          >
            {/* Header bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: videoPopupMinimized ? '6px 10px' : '10px 16px',
              background: 'linear-gradient(135deg, #161b22, #0d1117)',
              borderBottom: '1px solid #30363d',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{
                  fontSize: videoPopupMinimized ? '0.6rem' : '0.75rem',
                  fontWeight: 700, color: '#3fb950',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  🎬 {activePlaybackLabel || 'Vídeo'}
                </span>
                {!videoPopupMinimized && (
                  <span style={{
                    fontSize: '0.6rem', color: '#8b949e', background: '#1f6feb30',
                    padding: '2px 6px', borderRadius: 6, fontWeight: 600,
                  }}>
                    1.5x
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setVideoPopupMinimized(!videoPopupMinimized); }}
                  style={{
                    background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer',
                    fontSize: videoPopupMinimized ? '0.7rem' : '0.9rem', padding: '2px 4px',
                  }}
                  title={videoPopupMinimized ? 'Expandir' : 'Minimizar'}
                >
                  {videoPopupMinimized ? '🔲' : '➖'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePlaybackUrl(null);
                    setActivePlaybackLabel('');
                    setVideoPopupMinimized(false);
                    lastTriggeredLabelRef.current = null;
                  }}
                  style={{
                    background: 'none', border: 'none', color: '#f85149', cursor: 'pointer',
                    fontSize: videoPopupMinimized ? '0.7rem' : '0.9rem', padding: '2px 4px',
                  }}
                  title="Cerrar"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Video */}
            <video
              key={activePlaybackUrl}
              src={activePlaybackUrl}
              controls={!videoPopupMinimized}
              autoPlay
              muted
              playsInline
              loop
              style={{
                width: '100%', display: 'block',
                maxHeight: videoPopupMinimized ? 130 : '60vh',
                objectFit: 'contain', background: '#000',
              }}
              onLoadedData={(e) => {
                const vid = e.target as HTMLVideoElement;
                vid.playbackRate = 1.5;
                vid.play().catch(() => {});
                console.log('[VIDEO POPUP] ✅ Video loaded, speed 1.5x');
              }}
              onError={() => {
                console.error('[VIDEO POPUP] Error loading:', activePlaybackUrl);
              }}
            />
          </div>
        </>
      )}

      {/* Popup animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default App;
