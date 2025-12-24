#!/usr/bin/env python3
"""
Mutual Fund AI/ML Backend Server
Run this file to start the FastAPI server
"""

import uvicorn
import os

if __name__ == "__main__":
    # Get configuration from environment variables
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    print("🚀 Starting Mutual Fund AI/ML Backend API")
    print(f"📡 Server: http://{host}:{port}")
    print(f"📚 Docs: http://{host}:{port}/docs")
    print("=" * 50)
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )