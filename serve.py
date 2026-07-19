import http.server

http.server.ThreadingHTTPServer.allow_reuse_address = True
with http.server.ThreadingHTTPServer(('127.0.0.1', 4321), http.server.SimpleHTTPRequestHandler) as httpd:
    print('serving aetherweb on http://127.0.0.1:4321', flush=True)
    httpd.serve_forever()
