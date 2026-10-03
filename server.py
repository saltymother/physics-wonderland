#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys
import subprocess
import webbrowser
import time

PORT = 8765
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Suppress noisy logging
        pass

def is_port_in_use(port):
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def launch_chrome(url):
    chrome_path = "/Applications/Google Chrome.app"
    if os.path.exists(chrome_path):
        try:
            subprocess.run(["open", "-a", "Google Chrome", url], check=True)
            print(f"✅ Successfully opened in Google Chrome: {url}")
            return
        except Exception as e:
            print(f"⚠️ Error opening via open -a: {e}")
    # Fallback to system browser or direct open
    try:
        subprocess.run(["open", url])
    except Exception:
        webbrowser.open(url)

def main():
    global PORT
    while is_port_in_use(PORT):
        print(f"Port {PORT} in use, trying {PORT + 1}...")
        PORT += 1

    url = f"http://localhost:{PORT}/index.html"
    print(f"🚀 Starting Physics Wonderland server at {url}")

    # Launch Chrome shortly after server socket is ready
    import threading
    threading.Timer(0.8, launch_chrome, args=[url]).start()

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f" Serving files from {DIRECTORY}")
        print(" Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
            httpd.shutdown()

if __name__ == "__main__":
    main()
