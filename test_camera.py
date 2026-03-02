"""
test_camera.py — Diagnóstico rápido de cámara Basler
Ejecutar: python test_camera.py
"""
import sys, io
if sys.platform == 'win32':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    except: pass

print("=" * 50)
print("  Diagnostico Basler acA1920-48gm")
print("=" * 50)

# 1. Comprobar pypylon
try:
    from pypylon import pylon
    print("[OK] pypylon importado correctamente")
except ImportError as e:
    print(f"[ERROR] pypylon no disponible: {e}")
    sys.exit(1)

# 2. Enumerar dispositivos
try:
    factory = pylon.TlFactory.GetInstance()
    devices = factory.EnumerateDevices()
    print(f"\n[INFO] Dispositivos encontrados: {len(devices)}")
    for i, d in enumerate(devices):
        print(f"  [{i}] Modelo : {d.GetModelName()}")
        print(f"       SN     : {d.GetSerialNumber()}")
        try: print(f"       IP     : {d.GetIpAddress()}")
        except: pass
        print()
except Exception as e:
    print(f"[ERROR] Enumerando dispositivos: {e}")
    sys.exit(1)

if len(devices) == 0:
    print("[WARN] No se encontraron camaras.")
    print("  -> Comprueba que el cable Ethernet esta conectado")
    print("  -> La NIC debe estar en el rango 192.168.0.x / 255.255.255.0")
    sys.exit(1)

# 3. Intentar conectar y capturar 3 frames
print("[INFO] Intentando conectar...")
try:
    cam = pylon.InstantCamera(factory.CreateFirstDevice())
    cam.Open()
    print(f"[OK] Conectado: {cam.GetDeviceInfo().GetModelName()}")

    # Configurar parametros minimos
    cam.Width.Value  = 640   # reducido para test rapido
    cam.Height.Value = 480
    try:
        cam.ExposureAuto.Value = "Off"
        cam.ExposureTimeAbs.Value = 10000  # 10ms
    except:
        try:
            cam.ExposureTime.Value = 10000
        except: pass
    try:
        cam.AcquisitionFrameRateEnable.Value = True
        cam.AcquisitionFrameRateAbs.Value = 5.0
    except: pass

    cam.StartGrabbing(pylon.GrabStrategy_LatestImageOnly)
    converter = pylon.ImageFormatConverter()
    converter.OutputPixelFormat = pylon.PixelType_BGR8packed

    import cv2
    frames_ok = 0
    for i in range(5):
        result = cam.RetrieveResult(3000, pylon.TimeoutHandling_ThrowException)
        if result.GrabSucceeded():
            img = converter.Convert(result)
            arr = img.GetArray()
            frames_ok += 1
            print(f"[OK] Frame {i+1}: shape={arr.shape}  dtype={arr.dtype}")
            # Guardar primer frame como JPEG de prueba
            if i == 0:
                cv2.imwrite("test_frame.jpg", arr)
                print("     -> Guardado como test_frame.jpg")
        else:
            print(f"[WARN] Frame {i+1} fallido: {result.ErrorDescription}")
        result.Release()

    cam.StopGrabbing()
    cam.Close()
    print(f"\n[OK] Test completado: {frames_ok}/5 frames capturados")
    if frames_ok > 0:
        print("[OK] La camara esta funcionando correctamente")
        print("[OK] Ahora puedes usar camera_server.py + la app React")
    else:
        print("[ERROR] No se capturaron frames validos")

except Exception as e:
    print(f"[ERROR] {e}")
    import traceback; traceback.print_exc()
