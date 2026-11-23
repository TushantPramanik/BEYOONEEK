"""
BEYOONEEK OTT PLATFORM - RUN SCRIPT
Launches the FastAPI backend and serves the futuristic streaming frontend on localhost.
"""

import sys
import uvicorn
from seed_data import seed_database

if __name__ == "__main__":
    print("=" * 60)
    print("       WELCOME TO BEYOONEEK OTT PLATFORM")
    print("   Futuristic, Next-Gen Cinematic Streaming Experience")
    print("=" * 60)
    print("\n[+] Initializing SQLite database & catalog...")
    seed_database()
    print("[+] Starting FastAPI web server on http://localhost:8000")
    print("[+] Local URL: http://localhost:8000 or http://127.0.0.1:8000\n")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
