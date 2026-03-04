import sys
try:
    from pypylon import pylon
    tl_factory = pylon.TlFactory.GetInstance()
    devices_info = tl_factory.EnumerateDevices()
    for i, dev in enumerate(devices_info):
        try:
            print(f'Device {i}:')
            print(f'  Model: {dev.GetModelName()}')
            print(f'  Serial: {dev.GetSerialNumber()}')
            print(f'  Class: {dev.GetDeviceClass()}')
            print(f'  IP: {dev.GetIpAddress() if hasattr(dev, "GetIpAddress") else "N/A"}')
            print(f'  Subnet: {dev.GetSubnetMask() if hasattr(dev, "GetSubnetMask") else "N/A"}')
            print(f'  MAC: {dev.GetMacAddress() if hasattr(dev, "GetMacAddress") else "N/A"}')
            print(f'  FW: {dev.GetDeviceVersion() if hasattr(dev, "GetDeviceVersion") else "N/A"}')
        except Exception as e:
            print(f'  ERROR parsing: {e}')
except Exception as e:
    print(f'FATAL: {e}')
