import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

interface ModelSpecs {
    numSec?: string;
    color?: string;
    referencia?: string;
    modeloMaquina?: string;
    programaRobot?: string;
    cotaX1?: string;
    cotaX2?: string;
}

interface ObjViewerProps {
    objUrl: string;
    mtlUrl?: string;
    fileName: string;
    modelSpecs?: ModelSpecs;
    onSpecsUpdate?: (specs: ModelSpecs) => void;
    onClose: () => void;
}

const ObjViewer: React.FC<ObjViewerProps> = ({ objUrl, mtlUrl, fileName, modelSpecs = {}, onSpecsUpdate, onClose }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const animFrameRef = useRef<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        // ─── Scene setup ───
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);



        // Camera
        const width = container.clientWidth;
        const height = container.clientHeight;
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.set(5, 4, 5);
        camera.lookAt(0, 0, 0);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // ─── Lighting ───
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(5, 10, 5);
        dirLight.castShadow = true;
        scene.add(dirLight);

        const dirLight2 = new THREE.DirectionalLight(0x8888ff, 0.4);
        dirLight2.position.set(-5, 5, -5);
        scene.add(dirLight2);

        const pointLight = new THREE.PointLight(0x1f6feb, 0.5, 30);
        pointLight.position.set(0, 5, 0);
        scene.add(pointLight);

        // ─── Load OBJ (with optional MTL) ───
        const addModelToScene = (obj: THREE.Group) => {
            // Center and scale model
            const box = new THREE.Box3().setFromObject(obj);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 4 / maxDim;
            obj.scale.setScalar(scale);
            obj.position.sub(center.multiplyScalar(scale));

            // Enable shadows on all meshes
            obj.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    (child as THREE.Mesh).castShadow = true;
                    (child as THREE.Mesh).receiveShadow = true;
                }
            });

            scene.add(obj);
            setLoading(false);
        };

        const applyDefaultMaterial = (obj: THREE.Group) => {
            const material = new THREE.MeshPhongMaterial({
                color: 0x58a6ff,
                specular: 0x444444,
                shininess: 60,
                flatShading: false,
            });
            obj.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    (child as THREE.Mesh).material = material;
                }
            });
        };

        const onObjError = (err: unknown) => {
            console.error('Error loading OBJ:', err);
            setError('Error cargando el archivo .obj');
            setLoading(false);
        };

        if (mtlUrl) {
            // Load MTL first, then OBJ with materials
            const mtlLoader = new MTLLoader();
            mtlLoader.load(
                mtlUrl,
                (materials) => {
                    materials.preload();
                    const objLoader = new OBJLoader();
                    objLoader.setMaterials(materials);
                    objLoader.load(
                        objUrl,
                        (obj) => addModelToScene(obj),
                        undefined,
                        onObjError
                    );
                },
                undefined,
                (mtlErr) => {
                    console.warn('MTL load failed, falling back to default material:', mtlErr);
                    // Fallback: load OBJ without MTL
                    const objLoader = new OBJLoader();
                    objLoader.load(
                        objUrl,
                        (obj) => {
                            applyDefaultMaterial(obj);
                            addModelToScene(obj);
                        },
                        undefined,
                        onObjError
                    );
                }
            );
        } else {
            // No MTL: load OBJ with default material
            const objLoader = new OBJLoader();
            objLoader.load(
                objUrl,
                (obj) => {
                    applyDefaultMaterial(obj);
                    addModelToScene(obj);
                },
                undefined,
                onObjError
            );
        }

        // ─── Mouse orbit controls (simple) ───
        let isDragging = false;
        let previousMouse = { x: 0, y: 0 };
        let theta = Math.PI / 4;  // horizontal angle
        let phi = Math.PI / 6;    // vertical angle
        let radius = 8;

        const updateCamera = () => {
            camera.position.x = radius * Math.cos(phi) * Math.sin(theta);
            camera.position.y = radius * Math.sin(phi);
            camera.position.z = radius * Math.cos(phi) * Math.cos(theta);
            camera.lookAt(0, 0, 0);
        };
        updateCamera();

        const onMouseDown = (e: MouseEvent) => {
            isDragging = true;
            previousMouse = { x: e.clientX, y: e.clientY };
        };
        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - previousMouse.x;
            const dy = e.clientY - previousMouse.y;
            theta -= dx * 0.005;
            phi += dy * 0.005;
            phi = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, phi));
            previousMouse = { x: e.clientX, y: e.clientY };
            updateCamera();
        };
        const onMouseUp = () => { isDragging = false; };
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            radius += e.deltaY * 0.01;
            radius = Math.max(2, Math.min(25, radius));
            updateCamera();
        };

        // Touch support
        let touchStart = { x: 0, y: 0 };
        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 1) {
                isDragging = true;
                touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                previousMouse = { ...touchStart };
            }
        };
        const onTouchMove = (e: TouchEvent) => {
            if (!isDragging || e.touches.length !== 1) return;
            const dx = e.touches[0].clientX - previousMouse.x;
            const dy = e.touches[0].clientY - previousMouse.y;
            theta -= dx * 0.005;
            phi += dy * 0.005;
            phi = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, phi));
            previousMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            updateCamera();
        };
        const onTouchEnd = () => { isDragging = false; };

        const canvas = renderer.domElement;
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseleave', onMouseUp);
        canvas.addEventListener('wheel', onWheel, { passive: false });
        canvas.addEventListener('touchstart', onTouchStart, { passive: true });
        canvas.addEventListener('touchmove', onTouchMove, { passive: true });
        canvas.addEventListener('touchend', onTouchEnd);

        // ─── Animation loop ───
        const animate = () => {
            animFrameRef.current = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // ─── Resize handler ───
        const handleResize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        // ─── Cleanup ───
        return () => {
            cancelAnimationFrame(animFrameRef.current);
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousedown', onMouseDown);
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mouseup', onMouseUp);
            canvas.removeEventListener('mouseleave', onMouseUp);
            canvas.removeEventListener('wheel', onWheel);
            canvas.removeEventListener('touchstart', onTouchStart);
            canvas.removeEventListener('touchmove', onTouchMove);
            canvas.removeEventListener('touchend', onTouchEnd);
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [objUrl, mtlUrl]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.75)', zIndex: 10000,
                    backdropFilter: 'blur(6px)',
                    animation: 'fadeIn 0.2s ease-out',
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '95vw', maxWidth: 1600,
                height: '92vh', maxHeight: 1100,
                zIndex: 10001,
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: 16,
                boxShadow: '0 24px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                animation: 'scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 20px',
                    background: 'linear-gradient(135deg, #161b22, #0d1117)',
                    borderBottom: '1px solid #30363d',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '1.3rem' }}>🧊</span>
                        <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e6edf3' }}>
                                Visor 3D
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#8b949e', marginTop: 2 }}>
                                {fileName}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '0.68rem', color: '#484f58', fontStyle: 'italic' }}>
                            Arrastra para rotar · Scroll para zoom
                        </span>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(248,81,73,0.1)',
                                border: '1px solid #f8514940',
                                borderRadius: 8,
                                color: '#f85149',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '1rem',
                                padding: '6px 14px',
                                transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(248,81,73,0.25)';
                                e.currentTarget.style.borderColor = '#f85149';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(248,81,73,0.1)';
                                e.currentTarget.style.borderColor = '#f8514940';
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* 3D Canvas container */}
                <div
                    ref={mountRef}
                    style={{
                        flex: 1,
                        position: 'relative',
                        cursor: 'grab',
                        overflow: 'hidden',
                    }}
                >
                    {/* Specs table overlay */}
                    {!loading && !error && (
                        <div
                            onMouseDown={(e) => e.stopPropagation()}
                            style={{
                                position: 'absolute',
                                bottom: 20,
                                left: 20,
                                zIndex: 10,
                                background: 'rgba(13,17,23,0.92)',
                                border: '1px solid #30363d',
                                borderRadius: 12,
                                padding: '16px 20px',
                                backdropFilter: 'blur(10px)',
                                minWidth: 480,
                                maxWidth: 580,
                                boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
                            }}
                        >
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#8b949e', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                                📋 Especificaciones
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {[
                                        { key: 'numSec' as const, label: 'Nº SEC' },
                                        { key: 'color' as const, label: 'COLOR' },
                                        { key: 'referencia' as const, label: 'REFERENCIA' },
                                        { key: 'modeloMaquina' as const, label: 'MODELO MÁQUINA' },
                                        { key: 'programaRobot' as const, label: 'PROGRAMA ROBOT' },
                                        { key: 'cotaX1' as const, label: 'COTA X1' },
                                        { key: 'cotaX2' as const, label: 'COTA X2' },
                                    ].map((field, i) => (
                                        <tr key={field.key} style={{ borderBottom: i < 6 ? '1px solid #21262d' : 'none' }}>
                                            <td style={{
                                                padding: '8px 12px', fontSize: '0.88rem', fontWeight: 700, color: '#58a6ff',
                                                whiteSpace: 'nowrap', width: '40%', verticalAlign: 'middle',
                                            }}>
                                                {field.label}
                                            </td>
                                            <td style={{ padding: '5px 6px' }}>
                                                <input
                                                    type="text"
                                                    value={modelSpecs[field.key] || ''}
                                                    placeholder="—"
                                                    onChange={(e) => {
                                                        if (onSpecsUpdate) {
                                                            onSpecsUpdate({ ...modelSpecs, [field.key]: e.target.value });
                                                        }
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '7px 10px',
                                                        background: 'rgba(22,27,34,0.8)',
                                                        border: '1px solid #30363d',
                                                        borderRadius: 5,
                                                        color: '#e6edf3',
                                                        fontSize: '0.88rem',
                                                        boxSizing: 'border-box',
                                                        outline: 'none',
                                                        transition: 'border-color 0.2s',
                                                    }}
                                                    onFocus={(e) => e.currentTarget.style.borderColor = '#58a6ff'}
                                                    onBlur={(e) => e.currentTarget.style.borderColor = '#30363d'}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {/* Loading overlay */}
                    {loading && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(13,17,23,0.9)',
                            zIndex: 5,
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: 16, animation: 'pulse 1.5s infinite' }}>🧊</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#58a6ff' }}>
                                Cargando modelo 3D...
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#8b949e', marginTop: 6 }}>
                                {fileName}
                            </div>
                        </div>
                    )}

                    {/* Error overlay */}
                    {error && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(13,17,23,0.95)',
                            zIndex: 5,
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f85149' }}>
                                {error}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#8b949e', marginTop: 6 }}>
                                Verifica que el archivo .obj es válido
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer info */}
                <div style={{
                    padding: '8px 20px',
                    borderTop: '1px solid #21262d',
                    background: '#161b22',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexShrink: 0,
                }}>
                    <span style={{ fontSize: '0.68rem', color: '#484f58' }}>
                        Three.js WebGL Renderer
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#484f58' }}>
                        ESC para cerrar
                    </span>
                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes scaleIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </>
    );
};

export default ObjViewer;
