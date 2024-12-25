import os
from flask import Flask
from app.extensions import db, session, admin
from app.routes import home_routes, workshop_routes, contact_routes, admin_routes
from app.config import Config

def create_app():
    app = Flask(__name__, template_folder=os.path.join(os.getcwd(), 'templates'), static_folder=os.path.join(os.getcwd(), 'static'))
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    session.init_app(app)
    admin.init_app(app)

    # Register blueprints
    app.register_blueprint(home_routes.bp)
    app.register_blueprint(workshop_routes.bp)
    app.register_blueprint(contact_routes.bp)
    app.register_blueprint(admin_routes.bp)

    # Initialize admin panel automatically by Flask-Admin
    # Admin setup is now directly handled in admin_routes, no need to call init_admin

    # Create tables only for local development
    if os.getenv("FLASK_ENV") == "development":
        with app.app_context():
            db.create_all()

    return app