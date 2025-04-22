from flask import Blueprint, jsonify, current_app, request
from app.models.database import get_db

bp = Blueprint('health', __name__, url_prefix='/health')

@bp.route('', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'service': 'neuralwired-backend',
    })

@bp.route('/db', methods=['GET'])
def db_health():
    try:
        db = get_db()
        result = db.execute('SELECT 1').fetchone() is not None
        
        response = {
            'status': 'ok' if result else 'error',
            'message': 'Database connection successful' if result else 'Database query failed'
        }
        
        if 'db_connection_manager' in current_app.extensions:
            conn_manager = current_app.extensions['db_connection_manager']
            response['connections'] = conn_manager.get_active_connections()
            
        return jsonify(response)
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Database connection error: {str(e)}'
        }), 500

@bp.route('/db/terminate-idle', methods=['POST'])
def terminate_idle_connections():
    api_key = request.headers.get('X-API-Key')
    admin_key = current_app.config.get('ADMIN_API_KEY')
    
    if not api_key or api_key != admin_key:
        return jsonify({
            'status': 'error',
            'message': 'Unauthorized'
        }), 401
        
    try:
        if 'db_connection_manager' not in current_app.extensions:
            return jsonify({
                'status': 'error',
                'message': 'Connection manager not available'
            }), 400
            
        conn_manager = current_app.extensions['db_connection_manager']
        terminated = conn_manager.terminate_idle_connections(idle_time_seconds=300)
        
        return jsonify({
            'status': 'ok',
            'terminated': terminated,
            'connections': conn_manager.get_active_connections()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error terminating connections: {str(e)}'
        }), 500
