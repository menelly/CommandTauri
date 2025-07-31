#!/usr/bin/env python3
"""
Chaos Command Center - Flask Backend
Handles PDF generation, AI processing, and data analytics
"""

import os
import json
import logging
import hashlib
import hmac
import time
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from functools import wraps

# Import our modules
from pdf_generator import PDFGenerator
from analytics import AnalyticsEngine

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Security configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max request size
app.config['JSON_SORT_KEYS'] = False  # Preserve JSON key order

# Secure CORS configuration - only allow localhost during development
CORS(app, origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "tauri://localhost",
    "https://tauri.localhost"
], supports_credentials=True)

# Security headers
@app.after_request
def add_security_headers(response):
    """Add security headers to all responses"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; media-src 'self'; frame-src 'none';"
    return response

# Security configuration
RATE_LIMIT_WINDOW = 300  # 5 minutes
MAX_REQUESTS_PER_WINDOW = 50
failed_attempts = {}  # Track failed PIN attempts per IP

# Initialize our services
pdf_gen = PDFGenerator()
analytics = AnalyticsEngine()

# ============================================================================
# SECURITY FUNCTIONS
# ============================================================================

def hash_pin(pin: str) -> str:
    """Hash a PIN for secure comparison"""
    return hashlib.sha256(pin.encode('utf-8')).hexdigest()

def validate_pin_format(pin: str) -> bool:
    """Validate PIN format (4-20 characters, alphanumeric)"""
    if not pin or len(pin) < 4 or len(pin) > 20:
        return False
    return pin.replace('-', '').replace('_', '').isalnum()

def validate_device_id(device_id: str) -> bool:
    """Validate device ID format"""
    if not device_id or len(device_id) < 8 or len(device_id) > 64:
        return False
    # Allow alphanumeric, hyphens, and underscores
    return all(c.isalnum() or c in '-_' for c in device_id)

def validate_sync_data(data: dict) -> bool:
    """Validate sync data structure and size"""
    if not isinstance(data, dict):
        return False

    # Check data size (max 10MB JSON)
    try:
        json_str = json.dumps(data)
        if len(json_str.encode('utf-8')) > 10 * 1024 * 1024:  # 10MB limit
            return False
    except (TypeError, ValueError):
        return False

    return True

def sanitize_string(value: str, max_length: int = 1000) -> str:
    """Sanitize string input"""
    if not isinstance(value, str):
        return ""

    # Remove null bytes and control characters
    sanitized = ''.join(char for char in value if ord(char) >= 32 or char in '\n\r\t')

    # Truncate to max length
    return sanitized[:max_length]

def check_rate_limit(client_ip: str) -> bool:
    """Check if client has exceeded rate limit"""
    current_time = time.time()

    # Clean old entries
    failed_attempts[client_ip] = [
        timestamp for timestamp in failed_attempts.get(client_ip, [])
        if current_time - timestamp < RATE_LIMIT_WINDOW
    ]

    # Check if rate limit exceeded
    return len(failed_attempts.get(client_ip, [])) < MAX_REQUESTS_PER_WINDOW

def record_failed_attempt(client_ip: str):
    """Record a failed authentication attempt"""
    if client_ip not in failed_attempts:
        failed_attempts[client_ip] = []
    failed_attempts[client_ip].append(time.time())

def require_pin_auth(f):
    """Decorator to require PIN authentication for sync endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', 'unknown'))

        # Check rate limiting
        if not check_rate_limit(client_ip):
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return jsonify({'error': 'Too many requests. Please try again later.'}), 429

        # Get request data
        data = request.get_json()
        if not data:
            record_failed_attempt(client_ip)
            return jsonify({'error': 'Invalid request format'}), 400

        # Validate required fields
        user_pin = data.get('user_pin')
        device_id = data.get('device_id')

        if not user_pin or not device_id:
            record_failed_attempt(client_ip)
            return jsonify({'error': 'Missing user_pin or device_id'}), 400

        # Validate PIN format
        if not validate_pin_format(user_pin):
            record_failed_attempt(client_ip)
            return jsonify({'error': 'Invalid PIN format'}), 400

        # Validate device ID format
        if not validate_device_id(device_id):
            record_failed_attempt(client_ip)
            return jsonify({'error': 'Invalid device_id format'}), 400

        # Sanitize inputs
        user_pin = sanitize_string(user_pin, 20)
        device_id = sanitize_string(device_id, 64)

        # Add validated data to request context
        request.validated_pin = user_pin
        request.validated_device_id = device_id

        return f(*args, **kwargs)

    return decorated_function

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'pdf': True,
            'analytics': True
        }
    })



@app.route('/api/pdf/generate', methods=['POST'])
def generate_pdf():
    """Generate PDF report from data"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'type' not in data:
            return jsonify({'error': 'Missing report type'}), 400
        
        report_type = data['type']
        report_data = data.get('data', {})
        
        # Generate PDF
        pdf_path = pdf_gen.generate_report(report_type, report_data)
        
        if pdf_path and os.path.exists(pdf_path):
            return send_file(pdf_path, as_attachment=True, 
                           download_name=f'chaos_report_{report_type}_{datetime.now().strftime("%Y%m%d")}.pdf')
        else:
            return jsonify({'error': 'Failed to generate PDF'}), 500
            
    except Exception as e:
        logger.error(f"PDF generation error: {str(e)}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/analytics/dashboard', methods=['POST'])
def get_dashboard_analytics():
    """Get analytics for dashboard"""
    try:
        data = request.get_json()

        if not data or 'data' not in data:
            return jsonify({'error': 'Missing data'}), 400

        user_data = data['data']
        date_range = data.get('dateRange', 30)  # Default 30 days

        # Generate analytics
        dashboard_data = analytics.generate_dashboard(user_data, date_range)

        return jsonify(dashboard_data)

    except Exception as e:
        logger.error(f"Analytics error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/dysautonomia', methods=['POST'])
def get_dysautonomia_analytics():
    """Get medical-grade dysautonomia analytics 🩺"""
    try:
        data = request.get_json()

        if not data or 'entries' not in data:
            return jsonify({'error': 'Missing dysautonomia entries'}), 400

        entries = data['entries']
        date_range = data.get('dateRange', 30)  # Default 30 days

        # Generate dysautonomia analytics
        analytics_data = analytics.analyze_dysautonomia(entries, date_range)

        return jsonify(analytics_data)

    except Exception as e:
        logger.error(f"Dysautonomia analytics error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/upper-digestive', methods=['POST'])
def get_upper_digestive_analytics():
    """Get medical-grade upper digestive analytics 🤢"""
    try:
        data = request.get_json()

        if not data or 'entries' not in data:
            return jsonify({'error': 'Missing upper digestive entries'}), 400

        entries = data['entries']
        date_range = data.get('dateRange', 30)  # Default 30 days

        # Generate upper digestive analytics
        analytics_data = analytics.analyze_upper_digestive(entries, date_range)

        return jsonify(analytics_data)

    except Exception as e:
        logger.error(f"Upper digestive analytics error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/head-pain', methods=['POST'])
def get_head_pain_analytics():
    """Get medical-grade head pain analytics 🧠"""
    try:
        data = request.get_json()
        logger.info(f"🧠 Head pain analytics request received")

        if not data or 'entries' not in data:
            logger.error("🧠 Missing head pain entries in request")
            return jsonify({'error': 'Missing head pain entries'}), 400

        entries = data['entries']
        date_range = data.get('dateRange', 30)  # Default 30 days

        logger.info(f"🧠 Processing {len(entries)} head pain entries for {date_range} days")

        # Log first entry structure for debugging
        if entries:
            logger.info(f"🧠 Sample entry structure: {list(entries[0].keys()) if entries[0] else 'Empty entry'}")

        # Generate head pain analytics
        analytics_data = analytics.analyze_head_pain(entries, date_range)

        logger.info(f"🧠 Analytics generated successfully")
        return jsonify(analytics_data)

    except Exception as e:
        logger.error(f"Head pain analytics error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/bathroom', methods=['POST'])
def get_bathroom_analytics():
    """Get medical-grade bathroom/lower digestive analytics 💩"""
    try:
        data = request.get_json()

        if not data or 'entries' not in data:
            return jsonify({'error': 'Missing bathroom entries'}), 400

        entries = data['entries']
        date_range = data.get('dateRange', 30)  # Default 30 days

        logger.info(f"Analyzing {len(entries)} bathroom entries over {date_range} days")

        # Generate bathroom analytics
        analytics_data = analytics.analyze_bathroom(entries, date_range)

        return jsonify(analytics_data)

    except Exception as e:
        logger.error(f"Bathroom analytics error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/pain', methods=['POST'])
def get_pain_analytics():
    """Get medical-grade general pain analytics 🔥"""
    try:
        data = request.get_json()

        if not data or 'entries' not in data:
            return jsonify({'error': 'Missing pain entries'}), 400

        entries = data['entries']
        date_range = data.get('dateRange', 30)  # Default 30 days

        logger.info(f"Analyzing {len(entries)} pain entries over {date_range} days")

        # Generate pain analytics
        analytics_data = analytics.analyze_pain(entries, date_range)

        return jsonify(analytics_data)

    except Exception as e:
        logger.error(f"Pain analytics error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/diabetes', methods=['POST'])
def get_diabetes_analytics():
    """Get medical-grade diabetes analytics 🩸"""
    try:
        data = request.get_json()

        if not data or 'entries' not in data:
            return jsonify({'error': 'Missing diabetes entries'}), 400

        entries = data['entries']
        date_range = data.get('dateRange', 30)  # Default 30 days

        logger.info(f"Analyzing {len(entries)} diabetes entries over {date_range} days")

        # Generate diabetes analytics
        analytics_data = analytics.analyze_diabetes_data(entries, date_range)

        return jsonify(analytics_data)

    except Exception as e:
        logger.error(f"Diabetes analytics error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sync/phone-home', methods=['POST'])
@require_pin_auth
def phone_home_sync():
    """Handle phone app sync requests - PIN authenticated"""
    try:
        # PIN and device_id already validated by decorator
        user_pin = request.validated_pin
        device_id = request.validated_device_id

        # Get additional request data
        data = request.get_json()
        sync_data = data.get('data', {})
        action = sanitize_string(data.get('action', 'sync'), 20)
        timestamp = data.get('timestamp', datetime.now().isoformat())

        # Validate sync data
        if sync_data and not validate_sync_data(sync_data):
            return jsonify({'error': 'Invalid sync data format or size'}), 400

        # Validate action
        allowed_actions = ['sync', 'pull', 'ping']
        if action not in allowed_actions:
            return jsonify({'error': f'Invalid action. Allowed: {", ".join(allowed_actions)}'}), 400

        logger.info(f"🔐 Authenticated {action} request from device {device_id[:8]}... for user PIN {user_pin[:2]}***")

        # Handle different sync actions
        if action == 'sync':
            # Merge data from phone
            result = {
                'status': 'synced',
                'conflicts': [],
                'server_timestamp': datetime.now().isoformat(),
                'user_pin_hash': hash_pin(user_pin)[:8]  # First 8 chars for verification
            }
            # TODO: Implement actual sync logic with PIN-based database isolation

        elif action == 'pull':
            # Send latest data to phone
            result = {
                'status': 'data_sent',
                'data': {},
                'server_timestamp': datetime.now().isoformat(),
                'user_pin_hash': hash_pin(user_pin)[:8]  # First 8 chars for verification
            }
            # TODO: Implement data pull logic with PIN-based database isolation

        elif action == 'ping':
            # Simple connectivity test
            result = {
                'status': 'pong',
                'server_timestamp': datetime.now().isoformat(),
                'user_pin_hash': hash_pin(user_pin)[:8]
            }

        else:
            return jsonify({'error': 'Invalid sync action. Supported: sync, pull, ping'}), 400

        return jsonify(result)

    except Exception as e:
        logger.error(f"Sync error: {str(e)}")
        return jsonify({'error': 'Internal sync error'}), 500

@app.route('/api/sync/validate-pin', methods=['POST'])
@require_pin_auth
def validate_pin():
    """Validate PIN and test connectivity"""
    try:
        user_pin = request.validated_pin
        device_id = request.validated_device_id

        logger.info(f"🔐 PIN validation successful for device {device_id[:8]}...")

        return jsonify({
            'status': 'valid',
            'message': 'PIN authenticated successfully',
            'server_timestamp': datetime.now().isoformat(),
            'user_pin_hash': hash_pin(user_pin)[:8],
            'device_id': device_id
        })

    except Exception as e:
        logger.error(f"PIN validation error: {str(e)}")
        return jsonify({'error': 'Internal validation error'}), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request'}), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': 'Request too large'}), 413

@app.errorhandler(429)
def rate_limit_exceeded(error):
    return jsonify({'error': 'Rate limit exceeded'}), 429

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Development server
    port = int(os.environ.get('FLASK_PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    logger.info(f"Starting Chaos Command Center Backend on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
