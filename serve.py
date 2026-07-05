import os, http.server, socketserver
os.chdir('/Users/patj/Documents/aetherweb')
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('127.0.0.1', 4321), http.server.SimpleHTTPRequestHandler) as httpd:
    print('serving aetherweb on http://127.0.0.1:4321')
    httpd.serve_forever()
