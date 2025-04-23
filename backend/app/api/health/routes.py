from flask import jsonify, current_app
from app.models.database import db
from app.utils.redis_utils import get_redis_client
from . import bp

@bp.route('', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'service': 'quantummindsclub-backend',
    })

@bp.route('/db', methods=['GET'])
def db_health():
    try:
        result = db.session.execute('SELECT 1').scalar() is not None
        
        response = {
            'status': 'ok' if result else 'error',
            'message': 'Database connection successful' if result else 'Database query failed'
        }
        
        return jsonify(response)
    except Exception as e:
        current_app.logger.error(f"Database health check failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Database connection error: {str(e)}'
        }), 500

@bp.route('/redis', methods=['GET'])
def redis_health():
    try:
        redis_client = get_redis_client()
        test_key = 'health-check-test'
        test_value = 'redis-is-working'
        
        redis_client.set(test_key, test_value, ex=60)  
        retrieved_value = redis_client.get(test_key)
        
        status = 'ok' if retrieved_value and retrieved_value.decode('utf-8') == test_value else 'error'
        message = 'Redis connection successful' if status == 'ok' else 'Redis connection test failed: value mismatch'
        
        connection_info = {
            'host': current_app.config.get('SESSION_REDIS_HOST', 'unknown'),
            'port': current_app.config.get('SESSION_REDIS_PORT', 'unknown'),
            'ssl': current_app.config.get('SESSION_REDIS_SSL', 'unknown')
        }
        
        return jsonify({
            'status': status,
            'message': message,
            'connection': connection_info
        }), 200 if status == 'ok' else 500
    except Exception as e:
        current_app.logger.error(f"Redis health check failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Redis connection error: {str(e)}'
        }), 500