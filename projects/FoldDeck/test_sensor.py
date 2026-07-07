import time
from pybooklid import LidSensor

def main():
    print("Initializing LidSensor...")
    try:
        with LidSensor() as sensor:
            print("LidSensor initialized successfully!")
            print("Reading angle 5 times (polling)...")
            for _ in range(5):
                angle = sensor.read_angle()
                print(f"Lid Angle: {angle:.2f}°")
                time.sleep(0.1)
    except Exception as e:
        print(f"FAILED to initialize or read LidSensor: {e}")

if __name__ == "__main__":
    main()
