from flask import Blueprint

bp = Blueprint('api', __name__, url_prefix='/api')

from app.api.auth import bp as auth_bp
from app.api.pages import bp as pages_bp
from app.api.settings import bp as settings_bp
from app.api.uploads import bp as uploads_bp
from app.api.comments import bp as comments_bp
from app.api.team import bp as team_bp
from app.api.gallery import bp as gallery_bp
from app.api.contact import bp as contact_bp
from app.api.events import bp as events_bp
from app.api.emails import bp as emails_bp
from app.api.health import bp as health_bp
from app.api.social import bp as social_bp

bp.register_blueprint(auth_bp, url_prefix='/auth')
bp.register_blueprint(pages_bp, url_prefix='/pages')
bp.register_blueprint(settings_bp, url_prefix='/settings')
bp.register_blueprint(uploads_bp, url_prefix='/uploads')
bp.register_blueprint(comments_bp, url_prefix='/comments')
bp.register_blueprint(team_bp, url_prefix='/team')
bp.register_blueprint(gallery_bp, url_prefix='/gallery')
bp.register_blueprint(contact_bp, url_prefix='/contact')
bp.register_blueprint(events_bp, url_prefix='/events')
bp.register_blueprint(emails_bp, url_prefix='/emails')
bp.register_blueprint(health_bp, url_prefix='/health')
bp.register_blueprint(social_bp, url_prefix='/social')

def register_api_blueprints(app):
    app.register_blueprint(bp)
