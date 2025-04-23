from flask import jsonify, current_app
from app.models.database import db
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