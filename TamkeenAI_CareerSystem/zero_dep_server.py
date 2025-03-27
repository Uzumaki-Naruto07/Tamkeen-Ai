#!/usr/bin/env python3
"""
Zero-dependency HTTP server for diagnostics.
This uses only the Python standard library.
"""
import http.server
import socketserver
import json
import sys
import os
import platform
import traceback

PORT = 5070

class DiagnosticHandler(http.server.SimpleHTTPRequestHandler):
    """Handler that adds diagnostic JSON endpoints"""
    
    def do_GET(self):
        """Handle GET requests"""
        # Add CORS headers to all responses
        self.send_cors_headers()
        
        if self.path == '/api/ping':
            self.send_json({"status": "ok", "message": "pong"})
        elif self.path == '/api/info':
            try:
                info = {
                    "status": "ok",
                    "python_version": sys.version,
                    "platform": platform.platform(),
                    "working_dir": os.getcwd(),
                    "python_path": sys.path,
                    "env_vars": {k: v for k, v in os.environ.items() 
                                 if k in ['PATH', 'PYTHONPATH', 'HOME', 'USER']}
                }
                self.send_json(info)
            except Exception as e:
                self.send_error_json(str(e), traceback.format_exc())
        else:
            # Serve static files from current directory
            super().do_GET()
    
    def send_cors_headers(self):
        """Add CORS headers to allow all origins"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_json(self, data):
        """Send a JSON response"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode())
    
    def send_error_json(self, error, traceback_str=None):
        """Send an error as JSON"""
        self.send_response(500)
        self.send_header('Content-type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        error_data = {
            "status": "error",
            "error": error
        }
        if traceback_str:
            error_data["traceback"] = traceback_str
            
        self.wfile.write(json.dumps(error_data, indent=2).encode())
        
        # Also print to console
        print(f"ERROR: {error}")
        if traceback_str:
            print(traceback_str)

if __name__ == "__main__":
    try:
        # Create a simple HTML page for testing
        with open('diagnostic_test.html', 'w') as f:
            f.write('''
            <!DOCTYPE html>
            <html>
            <head>
                <title>Zero-Dependency Server Test</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                    pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
                    button { padding: 8px 16px; background: #4a90e2; color: white; border: none;
                            border-radius: 4px; cursor: pointer; margin-right: 10px; }
                </style>
            </head>
            <body>
                <h1>Zero-Dependency Server Test</h1>
                <div>
                    <button onclick="testPing()">Test Ping</button>
                    <button onclick="testInfo()">Test Info</button>
                </div>
                <h2>Response:</h2>
                <pre id="response">Click a button to test an endpoint</pre>
                
                <script>
                    async function testEndpoint(url) {
                        document.getElementById('response').textContent = 'Loading...';
                        try {
                            const response = await fetch(url);
                            const data = await response.json();
                            document.getElementById('response').textContent = JSON.stringify(data, null, 2);
                        } catch (error) {
                            document.getElementById('response').textContent = 'Error: ' + error.message;
                        }
                    }
                    
                    function testPing() {
                        testEndpoint('/api/ping');
                    }
                    
                    function testInfo() {
                        testEndpoint('/api/info');
                    }
                </script>
            </body>
            </html>
            ''')
        
        # Start the server
        handler = DiagnosticHandler
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at http://localhost:{PORT}")
            print("Test URLs:")
            print(f" - http://localhost:{PORT}/diagnostic_test.html (Test Page)")
            print(f" - http://localhost:{PORT}/api/ping (Simple Ping)")
            print(f" - http://localhost:{PORT}/api/info (System Info)")
            print("Press Ctrl+C to stop the server")
            httpd.serve_forever()
    
    except Exception as e:
        print(f"Server error: {e}")
        traceback.print_exc() 