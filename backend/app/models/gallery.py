from datetime import datetime
from app.models.database import db

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
