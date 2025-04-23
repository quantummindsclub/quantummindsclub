from flask import request, jsonify
from app.models.database import db, SentEmail
from app.utils.email_utils import send_email
import os
from . import bp

@bp.route('/sent', methods=['GET'])
def get_sent():
    try:
        emails = SentEmail.query.filter_by(is_deleted=False).order_by(SentEmail.sent_at.desc()).all()
        return jsonify([email.to_dict() for email in emails]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/sent/<int:email_id>', methods=['GET'])
def get_sent_email(email_id):
    try:
        email = SentEmail.query.get(email_id)
        if email is None:
            return jsonify({"error": "Sent email not found"}), 404
            
        return jsonify(email.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<int:email_id>', methods=['DELETE'])
def delete_email(email_id):
    try:
        email = SentEmail.query.get(email_id)
        if email is None:
            return jsonify({"error": "Email not found"}), 404
        
        email.is_deleted = True
        db.session.commit()
        return jsonify({"message": "Email deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/send', methods=['POST'])
def send_new_email():
    try:
        data = request.json
        
        if not data.get('to') or not data.get('subject') or not data.get('content'):
            return jsonify({"error": "Missing required fields: to, subject, content"}), 400
        
        success, result = send_email(
            recipient_list=data.get('to'),
            subject=data.get('subject'),
            html_content=data.get('content'),
            cc_list=data.get('cc'),
            bcc_list=data.get('bcc'),
            sender_email=os.environ.get('EMAIL_USERNAME', 'noreply@example.com')
        )
        
        if success:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500