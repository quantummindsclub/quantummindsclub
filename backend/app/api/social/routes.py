from flask import jsonify, current_app
from sqlalchemy.exc import SQLAlchemyError
from app.models.database import Setting
from . import bp

@bp.route('', methods=['GET'])
def get_social_urls():
    try:
        social_keys = ['instagram_url', 'linkedin_url', 'twitter_url']
        settings = Setting.query.filter(Setting.key.in_(social_keys)).all()
        
        social_urls = {}
        for setting in settings:
            social_urls[setting.key] = setting.value
            
        for key in social_keys:
            if key not in social_urls:
                social_urls[key] = ''
                
        return jsonify(social_urls)
        
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/<key>', methods=['GET'])
def get_social_url(key):
    try:
        if key not in ['instagram_url', 'linkedin_url', 'twitter_url']:
            return jsonify({"error": "Invalid social URL key"}), 400
            
        setting = Setting.query.filter_by(key=key).first()
        if setting:
            return jsonify({key: setting.value})
        return jsonify({key: ''})
        
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500