# encoding: utf-8
"""
start_app.py
============
Arranca la aplicacion completa:
  1. camera_server.py  ->  http://localhost:8765  (pypylon / Basler acA1920-48gm)
  2. npm run dev       ->  http://localhost:5173  (React / Vite)

Uso:
  python start_app.py
"""
import subprocess
import webbrowser
import time
import os
import sys
import threading

# Encoding seguro para consola Windows (cp1252 -> utf-8)
if sys.platform == 'win32':
    import io
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except Exception:
        pass

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def stream_output(proc, prefix):
    """Reenvía líneas de salida de un subprocess con prefijo."""
    try:
        for line in proc.stdout:
            line = line.decode('utf-8', errors='replace').rstrip()
            if line:
                print(f"[{prefix}] {line}", flush=True)
    except Exception:
        pass


def main():
    print("=" * 55)
    print("  Aplicacion de Pintura")
    print("=" * 55)

    camera_proc = None
    vite_proc = None

    try:
        # ── 1. Arrancar camera_server.py ─────────────────────────
        cam_script = os.path.join(SCRIPT_DIR, 'camera_server.py')
        if os.path.exists(cam_script):
            print("\n[INFO] Arrancando camera_server.py (puerto 8765)...")
            camera_proc = subprocess.Popen(
                [sys.executable, cam_script],
                cwd=SCRIPT_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
            )
            t_cam = threading.Thread(
                target=stream_output, args=(camera_proc, 'CAM'), daemon=True)
            t_cam.start()
            time.sleep(2)
            if camera_proc.poll() is not None:
                print("[ERROR] camera_server.py termino inesperadamente.")
            else:
                print("[OK] camera_server.py escuchando en http://localhost:8765")
        else:
            print("[WARN] camera_server.py no encontrado")

        # ── 2. Arrancar Vite (React) ─────────────────────────────
        print("\n[INFO] Arrancando servidor Vite (puerto 5173)...")
        vite_proc = subprocess.Popen(
            "npm run dev",
            cwd=SCRIPT_DIR,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )
        t_vite = threading.Thread(
            target=stream_output, args=(vite_proc, 'VITE'), daemon=True)
        t_vite.start()
        time.sleep(3)

        # ── 3. Abrir navegador ───────────────────────────────────
        url = "http://localhost:5173"
        print(f"\n[INFO] Abriendo navegador en: {url}")
        webbrowser.open(url)

        print("\n[INFO] Aplicacion en marcha:")
        print("[INFO]   React  -> http://localhost:5173")
        print("[INFO]   Camara -> http://localhost:8765/api/stream")
        print("[INFO] Presiona Ctrl+C para detener todo.\n")

        vite_proc.wait()

    except KeyboardInterrupt:
        print("\n[INFO] Deteniendo servidores...")
    except Exception as e:
        print(f"\n[ERROR] {e}")
    finally:
        if vite_proc and vite_proc.poll() is None:
            vite_proc.terminate()
        if camera_proc and camera_proc.poll() is None:
            camera_proc.terminate()
        print("[INFO] Servidores detenidos.")
        sys.exit(0)


if __name__ == '__main__':
    main()
