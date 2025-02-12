import os
from flask import Flask
from app.extensions import db, session, init_db_events
from app.routes import home_routes, verify_routes, contact_routes, events_routes, explore_routes, static_routes
from app.config import Config

def create_app():
    app = Flask(__name__, template_folder=os.path.join(os.getcwd(), 'templates'), static_folder=os.path.join(os.getcwd(), 'static'))
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    session.init_app(app)
    
    with app.app_context():
        init_db_events()

    # Register blueprints
    app.register_blueprint(home_routes.bp)
    app.register_blueprint(events_routes.bp)
    app.register_blueprint(verify_routes.bp)
    app.register_blueprint(contact_routes.bp)
    app.register_blueprint(explore_routes.bp)
    app.register_blueprint(static_routes.bp)

    return app

