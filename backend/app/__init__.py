import os
from flask import Flask
from flask_cors import CORS
from .config import config
from app.models.database import init_app as init_db_app

def create_app(config_name='default'):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config[config_name])
    
    os.makedirs(app.instance_path, exist_ok=True)
    
    cors_origins = app.config['CORS_ORIGINS']
    app.logger.info(f"CORS configured for origins: {cors_origins}")
    
    CORS(app, 
         resources={r"/api/*": {"origins": cors_origins}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "Accept"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    init_db_app(app)
    
    from app.utils.shutdown_handler import install_signal_handlers
    install_signal_handlers(app)
    
    from app.api import register_api_blueprints
    register_api_blueprints(app)
    
    if app.config['CLOUDINARY_CLOUD_NAME'] and app.config['CLOUDINARY_API_KEY']:
        app.logger.info("Cloudinary configured for image uploads")
    else:
        app.logger.warning("Cloudinary is not configured - image uploads will not work")
    
    @app.route('/health')
    def health_check():
        return {'status': 'ok'}, 200
    
    return app
