import datetime
from flask import jsonify, request, current_app
from sqlalchemy.exc import SQLAlchemyError
from app.models.database import db, Contact
from app.api.auth.routes import login_required
from . import bp

@bp.route('', methods=['POST'])
def submit_contact():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    data = request.get_json()
    
    required_fields = ['name', 'email', 'subject', 'message']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({
            "error": f"Missing required fields: {', '.join(missing_fields)}"
        }), 400
    
    if len(data['name']) < 2:
        return jsonify({"error": "Name is too short"}), 400
        
    if len(data['message']) < 10:
        return jsonify({"error": "Message is too short"}), 400
        
    if len(data['message']) > 5000:
        return jsonify({"error": "Message is too long (max 5000 characters)"}), 400
    
    try:
        contact = Contact(
            name=data['name'],
            email=data['email'],
            subject=data['subject'],
            message=data['message'],
            created_at=datetime.datetime.now().isoformat(),
            read=False
        )
        
        db.session.add(contact)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Contact form submitted successfully"
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('', methods=['GET'])
@login_required
def get_contacts():
    try:
        contacts = Contact.query.order_by(Contact.created_at.desc()).all()
        return jsonify([contact.to_dict() for contact in contacts])
        
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/<int:contact_id>', methods=['DELETE'])
@login_required
def delete_contact(contact_id):
    try:
        contact = Contact.query.get(contact_id)
        
        if not contact:
            return jsonify({"error": "Contact not found"}), 404
            
        db.session.delete(contact)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Contact deleted successfully"
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/<int:contact_id>/read', methods=['PUT'])
@login_required
def mark_read(contact_id):
    try:
        contact = Contact.query.get(contact_id)
        
        if not contact:
            return jsonify({"error": "Contact not found"}), 404
            
        contact.read = True
        db.session.commit()
        
        return jsonify(contact.to_dict()), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/<int:contact_id>', methods=['GET'])
@login_required
def get_contact(contact_id):
    try:
        contact = Contact.query.get(contact_id)
        
        if not contact:
            return jsonify({"error": "Contact not found"}), 404
            
        return jsonify(contact.to_dict()), 200
        
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
