#!/usr/bin/env python3
"""
Simple test servers to simulate Domain Schema Service and Backend Service
"""
from flask import Flask, jsonify
import threading
import time

def create_app(name, port):
    app = Flask(name)
    
    @app.route('/actuator/health')
    def health():
        return jsonify({
            "status": "UP",
            "service": name,
            "port": port,
            "timestamp": time.time()
        })
    
    @app.route('/')
    def root():
        return jsonify({
            "service": name,
            "port": port,
            "message": f"Test {name} is running on port {port}"
        })
    
    return app

def run_domain_schema_service():
    app = create_app("Domain Schema Service", 8083)
    app.run(host='0.0.0.0', port=8083, debug=False)

def run_backend_service():
    app = create_app("Backend Service", 8084)
    app.run(host='0.0.0.0', port=8084, debug=False)

if __name__ == "__main__":
    print("Starting test servers...")
    
    # Start Domain Schema Service in a thread
    domain_thread = threading.Thread(target=run_domain_schema_service)
    domain_thread.daemon = True
    domain_thread.start()
    
    # Start Backend Service in a thread
    backend_thread = threading.Thread(target=run_backend_service)
    backend_thread.daemon = True
    backend_thread.start()
    
    print("Test servers started:")
    print("- Domain Schema Service: http://localhost:8083")
    print("- Backend Service: http://localhost:8084")
    print("Press Ctrl+C to stop...")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down test servers...")