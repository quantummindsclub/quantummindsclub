from flask import jsonify, request, current_app
from sqlalchemy.exc import SQLAlchemyError

from app.models.database import db, TeamMember
from app.api.auth.routes import login_required
from app.api.team import bp

@bp.route('/', methods=['GET'])
def get_team_members():
    try:
        leadership_filter = request.args.get('leadership')
        
        if leadership_filter:
            is_leadership = leadership_filter.lower() == 'true'
            team_members = TeamMember.query.filter_by(leadership=is_leadership).all()
        else:
            team_members = TeamMember.query.all()
        
        result = [member.to_dict() for member in team_members]
        return jsonify(result)
    
    except Exception as e:
        current_app.logger.error(f"Error getting team members: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/<int:member_id>', methods=['GET'])
def get_team_member(member_id):
    try:
        member = TeamMember.query.get(member_id)
        
        if not member:
            return jsonify({"error": "Team member not found"}), 404
            
        return jsonify(member.to_dict())
    
    except Exception as e:
        current_app.logger.error(f"Error getting team member: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('', methods=['POST'])
@login_required
def create_team_member():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    data = request.get_json()
    
    required_fields = ['name', 'role', 'bio', 'image']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({
            "error": f"Missing required fields: {', '.join(missing_fields)}"
        }), 400
    
    try:
        team_member = TeamMember(
            name=data['name'],
            role=data['role'],
            bio=data['bio'],
            image=data['image'],
            leadership=data.get('leadership', False),
            github=data.get('github', ''),
            linkedin=data.get('linkedin', ''),
            email=data.get('email', '')
        )
        
        db.session.add(team_member)
        db.session.commit()
        
        return jsonify(team_member.to_dict()), 201
    
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/<int:member_id>', methods=['PUT'])
@login_required
def update_team_member(member_id):
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    data = request.get_json()
    
    try:
        member = TeamMember.query.get(member_id)
        
        if not member:
            return jsonify({"error": "Team member not found"}), 404
        
        if 'name' in data:
            member.name = data['name']
        if 'role' in data:
            member.role = data['role']
        if 'bio' in data:
            member.bio = data['bio']
        if 'image' in data:
            member.image = data['image']
        if 'leadership' in data:
            member.leadership = data['leadership']
        if 'github' in data:
            member.github = data['github']
        if 'linkedin' in data:
            member.linkedin = data['linkedin']
        if 'email' in data:
            member.email = data['email']
            
        db.session.commit()
        
        return jsonify(member.to_dict())
    
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/<int:member_id>', methods=['DELETE'])
@login_required
def delete_team_member(member_id):
    try:
        member = TeamMember.query.get(member_id)
        
        if not member:
            return jsonify({"error": "Team member not found"}), 404
            
        db.session.delete(member)
        db.session.commit()
        
        return jsonify({"success": True, "message": "Team member deleted"})
    
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/order', methods=['POST'])
@login_required
def update_team_order():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    data = request.get_json()
    
    if not isinstance(data, list):
        return jsonify({"error": "Expected an array of objects"}), 400
    
    try:
        for item in data:
            if 'id' not in item or 'newId' not in item:
                return jsonify({"error": "Each item must have 'id' and 'newId' fields"}), 400
            
            member = TeamMember.query.get(item['id'])
            if not member:
                return jsonify({"error": f"Team member with ID {item['id']} not found"}), 404
            
            existing = TeamMember.query.filter_by(id=item['newId']).first()
            if existing and existing.id != member.id:
                return jsonify({"error": f"ID {item['newId']} is already in use"}), 409
        
        temp_id_base = 10000
        
        for i, item in enumerate(data):
            member = TeamMember.query.get(item['id'])
            member.id = temp_id_base + i
        
        db.session.flush()
        
        for i, item in enumerate(data):
            member = TeamMember.query.filter_by(id=temp_id_base + i).first()
            member.id = item['newId']
        
        db.session.commit()
        
        return jsonify({"success": True, "message": "Team order updated successfully"})
    
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
