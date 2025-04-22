from flask import jsonify, request, current_app
from sqlalchemy.exc import SQLAlchemyError
from app.models.database import db, Setting
from app.api.auth.routes import login_required
from . import bp

def get_all_settings():
    settings = Setting.query.all()
    return {setting.key: setting.value for setting in settings}

def get_setting(key, default=None):
    setting = Setting.query.get(key)
    if setting:
        return setting.value
    return default

def update_setting(key, value):
    try:
        setting = Setting.query.filter_by(key=key).first()
        if setting:
            setting.value = value
        else:
            setting = Setting(key=key, value=value)
            db.session.add(setting)
        db.session.commit()
        return True
    except SQLAlchemyError:
        db.session.rollback()
        raise

def delete_setting(key):
    setting = Setting.query.get(key)
    if not setting:
        return False
        
    db.session.delete(setting)
    db.session.commit()
    return True

@bp.route('', methods=['GET'])
def api_get_settings():
    settings = get_all_settings()
    return jsonify(settings)

@bp.route('/<key>', methods=['GET'])
def api_get_setting(key):
    value = get_setting(key)
    if value is not None:
        return jsonify({key: value})
    return jsonify({"error": "Setting not found"}), 404

@bp.route('', methods=['POST', 'PUT'])
@login_required
def api_update_settings():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No settings provided"}), 400
    
    try:
        for key, value in data.items():
            update_setting(key, value)
        
        return jsonify({"success": True, "message": "Settings updated successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating settings: {str(e)}")
        return jsonify({"error": "Failed to update settings"}), 500

@bp.route('/<key>', methods=['PUT'])
@login_required
def api_update_setting(key):
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    data = request.get_json()
    
    if not data or 'value' not in data:
        return jsonify({"error": "No value provided"}), 400
    
    value = data['value']
    
    try:
        update_setting(key, value)
        return jsonify({"success": True, "message": f"Setting '{key}' updated successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating setting: {str(e)}")
        return jsonify({"error": f"Failed to update setting '{key}'"}), 500

@bp.route('/<key>', methods=['DELETE'])
@login_required
def api_delete_setting(key):
    try:
        success = delete_setting(key)
        if success:
            return jsonify({"success": True, "message": f"Setting '{key}' deleted successfully"}), 200
        return jsonify({"error": "Setting not found"}), 404
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting setting: {str(e)}")
        return jsonify({"error": f"Failed to delete setting '{key}'"}), 500

@bp.route('/comments-config', methods=['GET'])
def api_get_comments_config():
    settings_dict = get_all_settings()
    
    comments_config = {
        'comments_enabled': settings_dict.get('comments_enabled', 'true').lower() == 'true',
        'comment_moderation': settings_dict.get('comment_moderation', 'false').lower() == 'true'
    }
    
    return jsonify(comments_config)
