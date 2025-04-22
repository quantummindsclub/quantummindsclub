import click
from flask import g
from flask.cli import with_appcontext
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime

db = SQLAlchemy()

class AdminCredential(db.Model):
    __tablename__ = 'admin_credentials'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)

class Page(db.Model):
    __tablename__ = 'pages'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    slug = db.Column(db.String, unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_blog = db.Column(db.Boolean, nullable=False, default=False)
    excerpt = db.Column(db.Text)
    featured = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.String, nullable=False)
    updated_at = db.Column(db.String, nullable=False)
    published_date = db.Column(db.String)
    comments_disabled = db.Column(db.Boolean, nullable=False, default=False)
    comments = db.relationship('Comment', backref='page', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'content': self.content,
            'is_blog': 1 if self.is_blog else 0,
            'excerpt': self.excerpt,
            'featured': 1 if self.featured else 0,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'published_date': self.published_date,
            'comment_count': len(self.comments) if hasattr(self, 'comments') else 0,
            'comments_disabled': 1 if self.comments_disabled else 0
        }

class Comment(db.Model):
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer, primary_key=True)
    author_name = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.String, nullable=False)
    page_id = db.Column(db.Integer, db.ForeignKey('pages.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'author_name': self.author_name,
            'content': self.content,
            'created_at': self.created_at,
        }
    
    def to_admin_dict(self):
        return self.to_dict()

class Setting(db.Model):
    __tablename__ = 'settings'
    
    key = db.Column(db.String(128), primary_key=True)
    value = db.Column(db.String, nullable=False)

class TeamMember(db.Model):
    __tablename__ = 'team_members'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    bio = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(255), nullable=False)
    leadership = db.Column(db.Boolean, nullable=False, default=False)
    github = db.Column(db.String(255))
    linkedin = db.Column(db.String(255))
    email = db.Column(db.String(255))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'role': self.role,
            'bio': self.bio,
            'image': self.image,
            'leadership': self.leadership,
            'github': self.github,
            'linkedin': self.linkedin,
            'email': self.email
        }

class GalleryImage(db.Model):
    __tablename__ = 'gallery_images'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255))
    description = db.Column(db.Text)
    url = db.Column(db.String(500), nullable=False)
    public_id = db.Column(db.String(255), nullable=False, unique=True)
    featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'url': self.url,
            'public_id': self.public_id,
            'featured': self.featured,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def get_all(cls, featured_only=False):
        query = cls.query
        if featured_only:
            query = query.filter_by(featured=True)
        return query.order_by(cls.created_at.desc()).all()
    
    @classmethod
    def get_by_id(cls, image_id):
        return cls.query.get(image_id)
    
    @classmethod
    def get_by_public_id(cls, public_id):
        return cls.query.filter_by(public_id=public_id).first()
    
    @classmethod
    def update_featured_status(cls, image_id, featured):
        image = cls.get_by_id(image_id)
        if image:
            image.featured = featured
            db.session.commit()
            return True
        return False
    
    @classmethod
    def delete_by_public_id(cls, public_id):
        image = cls.get_by_public_id(public_id)
        if image:
            db.session.delete(image)
            db.session.commit()
            return True
        return False

class Contact(db.Model):
    __tablename__ = 'contacts'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.String, nullable=False)
    read = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'subject': self.subject,
            'message': self.message,
            'created_at': self.created_at,
            'read': self.read
        }

class Event(db.Model):
    __tablename__ = 'events'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    event_date = db.Column(db.String(10), nullable=False)
    accepting_submissions = db.Column(db.Boolean, default=True)
    instructor = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    participants = db.relationship('Participant', backref='event', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'event_date': self.event_date,
            'accepting_submissions': self.accepting_submissions,
            'instructor': self.instructor,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'participant_count': len(self.participants) if hasattr(self, 'participants') else 0
        }
    
    @classmethod
    def generate_id(cls, name, event_date):
        import re
        
        name_part = re.sub(r'[^a-zA-Z0-9]', '-', name.lower())
        name_part = re.sub(r'-+', '-', name_part)
        name_part = name_part[:30].strip('-')
        
        date_part = event_date.replace('-', '')
        
        return f"{name_part}-{date_part}"

class Participant(db.Model):
    __tablename__ = 'participants'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    department = db.Column(db.String(50), nullable=False)
    academic_year = db.Column(db.String(20), nullable=False)
    college_code = db.Column(db.String(20), nullable=False)
    student_id = db.Column(db.String(20), nullable=False)
    attended = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    event_id = db.Column(db.String(50), db.ForeignKey('events.id'), nullable=False)
    
    __table_args__ = (db.UniqueConstraint('student_id', 'event_id', name='unique_participant_per_event'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'department': self.department,
            'academic_year': self.academic_year,
            'college_code': self.college_code,
            'student_id': self.student_id,
            'participant_id': f"{self.college_code}{self.student_id}",
            'attended': self.attended,
            'event_id': self.event_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

def get_db():
    if 'db_session' not in g:
        g.db_session = db.session
    return g.db_session

def close_db(e=None):
    db_session = g.pop('db_session', None)
    if db_session is not None:
        db_session.close()

def init_db():
    db.create_all()
    
    admin = AdminCredential.query.filter_by(username='admin').first()
    if not admin:
        admin = AdminCredential(
            username='admin',
            password_hash=generate_password_hash('admin')
        )
        db.session.add(admin)
    
    default_settings = {
        'site_title': 'My Blog',
        'site_description': 'A simple blog created with Flask',
        'posts_per_page': '5',
        'introduction': 'Welcome to my blog',
        'instagram_url': '',
        'linkedin_url': '',
        'twitter_url': '',
    }
    
    for key, value in default_settings.items():
        setting = Setting.query.filter_by(key=key).first()
        if not setting:
            setting = Setting(key=key, value=value)
            db.session.add(setting)
    
    db.session.commit()

@click.command('init-db')
@with_appcontext
def init_db_command():
    init_db()
    click.echo('Initialized the database.')

def init_app(app):
    database_url = os.environ.get('DATABASE_URL') or app.config.get('DATABASE_URL')
    
    if database_url:
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
        app.logger.info('Using PostgreSQL database')
        
        from app.utils.db_connection_manager import configure_connection_pool, register_db_shutdown_handlers
        
        app.config.setdefault('DB_POOL_SIZE', 5)
        app.config.setdefault('DB_MAX_OVERFLOW', 10)
        app.config.setdefault('DB_POOL_TIMEOUT', 30)
        app.config.setdefault('DB_POOL_RECYCLE', 280)
        
        configure_connection_pool(app)
    else:
        sqlite_path = app.config.get('DATABASE', 'sqlite:///instance/blog.sqlite')
        if sqlite_path.startswith('sqlite:///'):
            app.config['SQLALCHEMY_DATABASE_URI'] = sqlite_path
        else:
            app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.abspath(sqlite_path)}"
        app.logger.info('Using SQLite database')
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    app.cli.add_command(init_db_command)
    
    if database_url:
        conn_manager = register_db_shutdown_handlers(app, db)
        app.extensions['db_connection_manager'] = conn_manager
    
    app.teardown_appcontext(close_db)
    
    with app.app_context():
        db.create_all()
