#!/usr/bin/env python3
"""
Proxy Server to nopaystation.com with CORS disabled
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import urllib.error
import json
import ssl

class ProxyRequestHandler(http.server.BaseHTTPRequestHandler):
    TARGET_HOST = "nopaystation.com"
    TARGET_SCHEME = "https"
    TARGET_URL = None  # Will be set by run_server function
    
    def send_cors_headers(self):
        """Add CORS headers to allow cross-origin requests"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Access-Control-Allow-Credentials', 'true')
    
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests by proxying to nopaystation.com"""
        self.proxy_request()
    
    def do_POST(self):
        """Handle POST requests by proxying to nopaystation.com"""
        self.proxy_request()
    
    def do_PUT(self):
        """Handle PUT requests by proxying to nopaystation.com"""
        self.proxy_request()
    
    def do_DELETE(self):
        """Handle DELETE requests by proxying to nopaystation.com"""
        self.proxy_request()
    
    def proxy_request(self):
        """Proxy the request to the target URL"""
        try:
            # Use custom target URL if provided, otherwise use default
            if self.TARGET_URL:
                parsed_target = urllib.parse.urlparse(self.TARGET_URL)
                target_host = parsed_target.netloc
                target_scheme = parsed_target.scheme
                base_path = parsed_target.path.rstrip('/')
                target_url = f"{target_scheme}://{target_host}{base_path}{self.path}"
            else:
                target_url = f"{self.TARGET_SCHEME}://{self.TARGET_HOST}{self.path}"
            
            # Get request body if it exists
            content_length = int(self.headers.get('Content-Length', 0))
            request_body = self.rfile.read(content_length) if content_length > 0 else None
            
            # Create the request
            req = urllib.request.Request(target_url, data=request_body, method=self.command)
            
            # Copy headers (excluding some that might cause issues)
            skip_headers = {'host', 'connection', 'content-length'}
            for header_name, header_value in self.headers.items():
                if header_name.lower() not in skip_headers:
                    req.add_header(header_name, header_value)
            
            # Set User-Agent if not present
            if 'User-Agent' not in self.headers:
                req.add_header('User-Agent', 'NPSReact-Proxy/1.0')
            
            # Create SSL context that doesn't verify certificates (for development)
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            # Make the request
            with urllib.request.urlopen(req, context=ssl_context, timeout=30) as response:
                # Send response status
                self.send_response(response.getcode())
                
                # Copy response headers and add CORS headers
                for header_name, header_value in response.headers.items():
                    if header_name.lower() not in {'connection', 'transfer-encoding'}:
                        self.send_header(header_name, header_value)
                
                self.send_cors_headers()
                self.end_headers()
                
                # Copy response body
                response_data = response.read()
                self.wfile.write(response_data)
                
        except urllib.error.HTTPError as e:
            # Handle HTTP errors
            self.send_response(e.code)
            self.send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            error_response = {
                'error': f'HTTP {e.code}',
                'message': str(e.reason),
                'url': target_url
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
            
        except urllib.error.URLError as e:
            # Handle URL errors (network issues, etc.)
            self.send_response(502)
            self.send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            error_response = {
                'error': 'Bad Gateway',
                'message': str(e.reason),
                'url': target_url
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
            
        except Exception as e:
            # Handle other errors
            self.send_response(500)
            self.send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            error_response = {
                'error': 'Internal Server Error',
                'message': str(e),
                'url': target_url if 'target_url' in locals() else 'unknown'
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def log_message(self, format, *args):
        """Custom logging"""
        print(f"[{self.address_string()}] {format % args}")

def run_server(port=8000, target_url=None):
    """
    Run a proxy server with CORS disabled
    
    Args:
        port (int): Port number to run the server on (default: 8000)
        target_url (str): Target URL to proxy requests to (default: https://nopaystation.com)
    """
    # Set the target URL for the handler class
    if target_url:
        ProxyRequestHandler.TARGET_URL = target_url
        parsed_url = urllib.parse.urlparse(target_url)
        display_url = target_url
    else:
        ProxyRequestHandler.TARGET_URL = None
        display_url = f"{ProxyRequestHandler.TARGET_SCHEME}://{ProxyRequestHandler.TARGET_HOST}"
    
    handler = ProxyRequestHandler
    
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"Proxy server running at http://localhost:{port}/")
        print(f"Proxying requests to {display_url}")
        print("Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Proxy Server with CORS disabled')
    parser.add_argument('--port', '-p', type=int, default=8000, 
                        help='Port to run the server on (default: 8000)')
    parser.add_argument('--target', '-t', type=str, default=None,
                        help='Target URL to proxy requests to (default: https://nopaystation.com)')
    
    args = parser.parse_args()
    
    run_server(args.port, args.target)
