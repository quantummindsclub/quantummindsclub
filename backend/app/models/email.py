from datetime import datetime
from app.models.database import db

class SentEmail(db.Model):
    __tablename__ = "sent_emails"
    
    id = db.Column(db.Integer, primary_key=True)
    from_address = db.Column(db.String(255), nullable=False)
    to_addresses = db.Column(db.Text, nullable=False) 
    cc_addresses = db.Column(db.Text, nullable=True)  
    bcc_addresses = db.Column(db.Text, nullable=True) 
    subject = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'from': self.from_address,
            'to': self.to_addresses,
            'cc': self.cc_addresses,
            'bcc': self.bcc_addresses,
            'subject': self.subject,
            'content': self.content,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'deleted': self.is_deleted
        }