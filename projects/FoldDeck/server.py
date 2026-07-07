import asyncio
import websockets
import json
from pybooklid import LidSensor

async def handler(websocket):
    print("Web App connected! Ready to DJ.")
    try:
        with LidSensor() as sensor:
            # Send initial angle immediately so UI updates
            initial_angle = sensor.read_angle()
            await websocket.send(json.dumps({"angle": initial_angle}))
            
            # We use monitor to send data exactly when the lid moves
            for angle in sensor.monitor(interval=0.03):
                # Send the raw angle to the frontend
                await websocket.send(json.dumps({"angle": angle}))
    except websockets.ConnectionClosed:
        print("Web App disconnected.")
    except Exception as e:
        print(f"Error reading sensor: {e}")

async def main():
    print("========================================")
    print("   🎛️  FOLDDECK BACKEND ONLINE  🎛️    ")
    print("========================================")
    print("Waiting for web app on ws://localhost:8765...\n")
    
    async with websockets.serve(handler, "127.0.0.1", 8765):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nShutting down FoldDeck backend.")
