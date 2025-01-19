import os
from flask import Flask
from app.extensions import db, session, admin, login_manager, bcrypt
from app.routes import home_routes, verify_routes, contact_routes, admin_routes, events_routes, explore_routes
from app.config import Config
from app.routes.auth_routes import auth_bp
from app.routes.admin_routes import SecureAdminIndexView

def create_app():
    app = Flask(__name__, template_folder=os.path.join(os.getcwd(), 'templates'), static_folder=os.path.join(os.getcwd(), 'static'))
    app.config.from_object(Config)
    
    # Add custom admin static files configuration
    app.config['FLASK_ADMIN_SWATCH'] = 'slate'  # AdminLTE theme
    app.config['FLASK_ADMIN_FLUID_LAYOUT'] = True
    app.config['BOOTSTRAP_SERVE_LOCAL'] = True

    # Initialize extensions
    db.init_app(app)
    session.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    
    # Initialize admin with secure view
    admin.init_app(app)
    admin.name = 'QM Admin'
    admin.index_view = SecureAdminIndexView()
    # Remove custom template settings to use default Flask-Admin templates

    # Initialize admin views
    from app.routes.admin_routes import init_admin_views
    with app.app_context():
        init_admin_views()

    # Register blueprints
    app.register_blueprint(home_routes.bp)
    app.register_blueprint(events_routes.bp)
    app.register_blueprint(verify_routes.bp)
    app.register_blueprint(contact_routes.bp)
    app.register_blueprint(explore_routes.bp)
    app.register_blueprint(admin_routes.bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')

    return app

