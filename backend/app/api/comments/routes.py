import datetime
from flask import jsonify, request, current_app
from sqlalchemy.exc import SQLAlchemyError
from app.models.database import db, Comment, Page
from app.api.auth.routes import login_required
from . import bp

def comments_enabled():
    return True

@bp.route('/post/<int:post_id>', methods=['GET'])
def get_comments(post_id):
    try:
        comments = Comment.query.filter_by(page_id=post_id).order_by(Comment.created_at.desc()).all()
        
        result = [comment.to_dict() for comment in comments]
        return jsonify(result)
    
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/post/<slug>', methods=['POST'])
def add_comment(slug):
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    data = request.get_json()
    
    if not data or 'name' not in data or 'content' not in data:
        return jsonify({"error": "Missing required fields"}), 400
    
    if len(data['content']) < 3:
        return jsonify({"error": "Comment is too short"}), 400
    
    if len(data['content']) > 2000:
        return jsonify({"error": "Comment is too long (max 2000 characters)"}), 400
    
    if len(data['name']) < 2:
        return jsonify({"error": "Name is too short"}), 400
    
    try:
        page = Page.query.filter_by(slug=slug).first()
        
        if not page:
            return jsonify({"error": "Post not found"}), 404
        
        if not page.is_blog:
            return jsonify({"error": "Comments can only be added to blog posts"}), 400
            
        if page.comments_disabled:
            return jsonify({"error": "Comments are disabled for this post"}), 403
        
        now = datetime.datetime.now().isoformat()
        
        comment = Comment(
            author_name=data['name'],
            content=data['content'],
            created_at=now,
            page_id=page.id
        )

        db.session.add(comment)
        db.session.commit()
        
        response = comment.to_dict()
        
        return jsonify(response), 201
    
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/admin', methods=['GET'])
@login_required
def get_all_comments():
    try:
        comments = Comment.query.order_by(Comment.created_at.desc()).all()
        
        result = []
        for comment in comments:
            comment_dict = comment.to_dict()
            
            page = Page.query.get(comment.page_id)
            comment_dict['post_title'] = page.title if page else 'Unknown'
            comment_dict['post_slug'] = page.slug if page else ''
            
            result.append(comment_dict)
            
        return jsonify(result)
    
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/<int:comment_id>', methods=['DELETE'])
@login_required
def delete_comment(comment_id):
    try:
        comment = Comment.query.get(comment_id)
        
        if not comment:
            return jsonify({"error": "Comment not found"}), 404
            
        db.session.delete(comment)
        db.session.commit()
        
        return jsonify({"success": True, "message": "Comment deleted"}), 200
    
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
