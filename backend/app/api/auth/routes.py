from flask import request, jsonify, session, current_app, make_response
from functools import wraps
from . import bp
from app.models.database import db, AdminCredential
from werkzeug.security import check_password_hash, generate_password_hash
from app.utils.limiter_utils import limiter
from app.utils.redis_utils import get_redis_client

def login_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if not session.get('logged_in'):
            return jsonify({'error': 'Authentication required'}), 401
        return view(*args, **kwargs)
    return wrapped_view

@bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute, 30 per hour")
def login():
    if not request.is_json:
        return jsonify({"error": "Missing JSON"}), 400
        
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Missing username or password"}), 400
    
    client_ip = request.remote_addr
    redis_client = get_redis_client()
    
    if data.get('username') == 'admin':
        admin_attempt_key = f"login:admin:{client_ip}"
        admin_attempt_count = redis_client.get(admin_attempt_key)
        admin_attempt_count = int(admin_attempt_count) if admin_attempt_count else 0
        
        if admin_attempt_count >= 5:  
            redis_client.incr(admin_attempt_key)
            redis_client.expire(admin_attempt_key, 60 * 30)  
            
            redis_client.sadd("potential_malicious_ips", client_ip)
            current_app.logger.warning(f"Potential brute force attack from IP: {client_ip}")
            
            return jsonify({
                "error": "Too many failed login attempts. Try again later."
            }), 429
    
    ip_key = f"login:ip:{client_ip}"
    ip_attempt_count = redis_client.get(ip_key)
    ip_attempt_count = int(ip_attempt_count) if ip_attempt_count else 0
    
    if ip_attempt_count >= 15:  
        return jsonify({
            "error": "Too many login attempts. Please try again later."
        }), 429
    
    admin = AdminCredential.query.filter_by(username=data['username']).first()
    
    if admin and check_password_hash(admin.password_hash, data['password']):
        session.clear()
        session.permanent = True
        session['logged_in'] = True
        session['user_id'] = admin.username
        
        redis_client.delete(f"login:ip:{client_ip}")
        if data.get('username') == 'admin':
            redis_client.delete(f"login:admin:{client_ip}")
        
        response = make_response(jsonify({"success": True, "message": "Login successful"}))
        
        current_app.logger.info(f"Admin logged in successfully from IP: {client_ip}")
        return response
    
    redis_client.incr(ip_key)
    redis_client.expire(ip_key, 60 * 60)  
    
    if data.get('username') == 'admin':
        admin_key = f"login:admin:{client_ip}"
        redis_client.incr(admin_key)
        redis_client.expire(admin_key, 60 * 60 * 2)  
    
    current_app.logger.warning(f"Failed login attempt from IP: {client_ip}, username: {data.get('username')}")
    return jsonify({"error": "Invalid credentials"}), 401

@bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logout successful'}), 200

@bp.route('/status', methods=['GET'])
def auth_status():
    authenticated = session.get('logged_in', False)
    response = {'authenticated': authenticated}
    
    if authenticated:
        response['user'] = session.get('user_id', 'admin')
    
    return jsonify(response), 200

@bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    current_password = request.json.get('current_password')
    new_password = request.json.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({'error': 'Current and new passwords are required'}), 400
    
    if len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    username = session.get('user_id', 'admin')
    admin = AdminCredential.query.filter_by(username=username).first()
    
    if not admin or not check_password_hash(admin.password_hash, current_password):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    admin.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    current_app.logger.info(f"User {username} changed password successfully")
    return jsonify({'success': True, 'message': 'Password changed successfully'}), 200

@bp.route('/admin-info', methods=['GET'])
@login_required
def get_admin_info():
    username = session.get('user_id', 'admin')
    admin = AdminCredential.query.filter_by(username=username).first()
    
    if not admin:
        return jsonify({'error': 'Admin user not found'}), 404
    
    return jsonify({'username': admin.username}), 200

@bp.route('/update-username', methods=['POST'])
@login_required
def update_username():
    new_username = request.json.get('username')
    password = request.json.get('password')
    
    if not new_username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    
    if len(new_username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters'}), 400
    
    current_username = session.get('user_id', 'admin')
    user = AdminCredential.query.filter_by(username=current_username).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Password is incorrect'}), 401
    
    existing_user = AdminCredential.query.filter(
        AdminCredential.username == new_username, 
        AdminCredential.username != current_username
    ).first()
    
    if existing_user:
        return jsonify({'error': 'Username already exists'}), 409
    
    user.username = new_username
    db.session.commit()
    
    session['user_id'] = new_username
    
    current_app.logger.info(f"Admin username changed from {current_username} to {new_username}")
    return jsonify({'success': True, 'message': 'Username updated successfully'}), 200

@bp.route('/debug-cookies', methods=['GET'])
def debug_cookies():
    cookie_config = {
        'SESSION_COOKIE_SECURE': current_app.config.get('SESSION_COOKIE_SECURE'),
        'SESSION_COOKIE_HTTPONLY': current_app.config.get('SESSION_COOKIE_HTTPONLY'),
        'SESSION_COOKIE_SAMESITE': current_app.config.get('SESSION_COOKIE_SAMESITE'),
        'PERMANENT_SESSION_LIFETIME': str(current_app.config.get('PERMANENT_SESSION_LIFETIME')),
        'CORS_ORIGINS': current_app.config.get('CORS_ORIGINS'),
    }
    
    session_info = {
        'logged_in': session.get('logged_in'),
        'user_id': session.get('user_id'),
    }
    
    return jsonify({
        'cookie_config': cookie_config,
        'session_info': session_info,
        'request_headers': dict(request.headers),
    })
