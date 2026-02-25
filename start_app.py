import subprocess
import webbrowser
import time
import os
import sys

def main():
    print("=======================================")
    print("   Iniciando la aplicación de Pintura")
    print("=======================================\n")

    # Ruta actual donde se encuentra este script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    try:
        print("Arrancando el servidor de desarrollo (Vite)...")
        # Es necesario usar shell=True en Windows para ejecutar npm
        vite_process = subprocess.Popen(
            "npm run dev",
            cwd=script_dir,
            shell=True,
            stdout=sys.stdout,
            stderr=sys.stderr
        )

        # Esperar unos segundos para que Vite levante el servidor
        print("Esperando a que el servidor esté listo...")
        time.sleep(3)

        # La url por defecto de Vite
        url = "http://localhost:5173"
        print(f"Abriendo el navegador automáticamente en: {url}\n")
        webbrowser.open(url)

        print("[INFO] Presiona Ctrl+C en esta consola para detener el servidor.\n")
        
        # Mantener el script de Python vivo mientras el proceso de Vite no termine
        vite_process.wait()

    except KeyboardInterrupt:
        print("\n[INFO] Deteniendo el servidor...")
        # Intentamos terminar el proceso
        vite_process.terminate()
        sys.exit(0)
    except Exception as e:
        print(f"\n[ERROR] Ocurrió un problema: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
