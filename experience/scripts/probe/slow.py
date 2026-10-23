import http.server, time, sys
LOG = sys.argv[1]
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        time.sleep(float(self.path.strip('/') or 6)); self.send_response(200); self.send_header('Content-Type','image/gif'); self.end_headers()
        self.wfile.write(bytes.fromhex('47494638396101000100800000000000ffffff21f90401000000002c00000000010001000002024401003b'))
    def do_POST(self):
        n = int(self.headers.get('Content-Length', 0)); body = self.rfile.read(n).decode()
        if self.path.startswith('/snap/'):
            import base64, os
            name = os.path.basename(self.path[6:])
            open(os.path.join(os.path.dirname(LOG), 'snap-' + name + '.png'), 'wb').write(base64.b64decode(body.split(',', 1)[1]))
            self.send_response(204); self.send_header('Access-Control-Allow-Origin', '*'); self.end_headers(); return
        with open(LOG, 'a') as f: f.write(body + '\n')
        self.send_response(204); self.send_header('Access-Control-Allow-Origin', '*'); self.end_headers()
    def log_message(self,*a): pass
http.server.ThreadingHTTPServer(('127.0.0.1',4322),H).serve_forever()
