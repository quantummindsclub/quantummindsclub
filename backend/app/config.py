import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    CORS_ORIGINS = [origin.strip() for origin in os.environ.get('CORS_ORIGINS', '').split(',') if origin.strip()]
    
    CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', '')
    CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY', '')
    CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET', '')
    
    PERMANENT_SESSION_LIFETIME = timedelta(days=1)
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'None'
    
    SESSION_TYPE = 'redis'
    SESSION_REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
    SESSION_REDIS_PORT = int(os.environ.get('REDIS_PORT', 6379))
    SESSION_REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD', None)
    SESSION_REDIS_SSL = os.environ.get('REDIS_SSL', 'False').lower() == 'true'
    SESSION_USE_SIGNER = True

class DevelopmentConfig(Config):
    DEBUG = True
    DATABASE = os.path.join('instance', 'app.sqlite')
    DATABASE_URL = os.environ.get('DATABASE_URL')

class ProductionConfig(Config):
    DEBUG = False
    DATABASE_URL = os.environ.get('DATABASE_URL')

class TestingConfig(Config):
    TESTING = True
    DATABASE = 'sqlite:///:memory:'
    DATABASE_URL = None
    SESSION_COOKIE_SECURE = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
