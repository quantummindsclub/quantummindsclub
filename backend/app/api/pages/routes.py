from flask import jsonify, request, current_app
from sqlalchemy import desc
from sqlalchemy.exc import SQLAlchemyError
from app.models.database import db, Page, Comment, Setting
from app.api.auth.routes import login_required
from app.utils.helpers import slugify, generate_excerpt, extract_first_image_url
from . import bp
import datetime

def get_all_pages():
    pages = Page.query.filter(~Page.is_blog).order_by(Page.title).all()
    return [page.to_dict() for page in pages]

def get_blog_posts(limit=None, featured=False, page=None):
    query = Page.query.filter(Page.is_blog)
    
    if featured:
        query = query.filter(Page.featured)
    
    query = query.order_by(desc(Page.published_date))
    
    if page and limit:
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
    elif limit:
        query = query.limit(limit)
    
    posts = query.all()
    result = [post.to_dict() for post in posts]
    
    for post in result:
        post['first_image'] = extract_first_image_url(post['content']) if 'content' in post else None
    
    return result

def get_page_by_slug(slug):
    page = Page.query.filter_by(slug=slug).first()
    
    if page:
        result = page.to_dict()
        if result.get('is_blog') == 1 and 'content' in result:
            result['first_image'] = extract_first_image_url(result['content'])
        return result
    return None

def create_new_page(title, content, is_blog=False, featured=False, excerpt=None, comments_disabled=False):
    slug = slugify(title)
    
    base_slug = slug
    counter = 1
    while Page.query.filter_by(slug=slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    if not excerpt and is_blog:
        excerpt = generate_excerpt(content)
        
    now = datetime.datetime.now().isoformat()
    
    page = Page(
        title=title,
        slug=slug,
        content=content,
        is_blog=is_blog,
        excerpt=excerpt,
        featured=featured,
        created_at=now,
        updated_at=now,
        published_date=now,
        comments_disabled=comments_disabled
    )
    
    db.session.add(page)
    db.session.commit()
    
    return page.to_dict()

def update_existing_page(slug, title=None, content=None, is_blog=None, featured=None, excerpt=None, comments_disabled=None):
    page = Page.query.filter_by(slug=slug).first()
    
    if not page:
        return None
        
    if title is not None:
        page.title = title
        new_slug = slugify(title)
        
        if new_slug != slug:
            existing = Page.query.filter(Page.slug == new_slug, Page.id != page.id).first()
            if existing:
                base_slug = new_slug
                counter = 1
                while Page.query.filter(
                    Page.slug == f"{new_slug}-{counter}",
                    Page.id != page.id
                ).first():
                    counter += 1
                new_slug = f"{base_slug}-{counter}"
            page.slug = new_slug
    
    if content is not None:
        page.content = content
        if page.is_blog and excerpt is None:
            page.excerpt = generate_excerpt(content)
    
    if is_blog is not None:
        page.is_blog = is_blog
        
    if featured is not None:
        page.featured = featured
        
    if excerpt is not None:
        page.excerpt = excerpt
    
    if comments_disabled is not None:
        page.comments_disabled = comments_disabled
        
    page.updated_at = datetime.datetime.now().isoformat()
    
    db.session.commit()
    return page.to_dict()

def delete_page(slug):
    page = Page.query.filter_by(slug=slug).first()
    
    if not page:
        return False
        
    db.session.delete(page)
    db.session.commit()
    return True

@bp.route('', methods=['GET'])
def api_get_pages():
    try:
        page_type = request.args.get('type', None)
        limit = request.args.get('limit', type=int)
        featured = request.args.get('featured') == 'true'
        page_number = request.args.get('page', type=int)
        
        if page_type == 'blog':
            result = get_blog_posts(limit=limit, featured=featured, page=page_number)
        elif page_type == 'page':
            result = get_all_pages()
        else:
            result = get_all_pages() + get_blog_posts()
            
        return jsonify(result)
        
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/<slug>', methods=['GET'])
def api_get_page(slug):
    try:
        page = Page.query.filter_by(slug=slug).first()
        
        if not page:
            return jsonify({"error": "Page not found"}), 404
            
        result = page.to_dict()
        if result.get('is_blog') == 1 and 'content' in result:
            result['first_image'] = extract_first_image_url(result['content'])
            
            setting = Setting.query.filter_by(key='comments_enabled').first()
            result['comments_enabled'] = setting.value.lower() == 'true' if setting else True
            
            comment_count = Comment.query.filter_by(page_id=page.id).count()
            result['comment_count'] = comment_count
            
        return jsonify(result)
        
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('', methods=['POST'])
@login_required
def create_page():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    data = request.get_json()
    
    if not data or 'title' not in data or 'content' not in data:
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        new_page = create_new_page(
            title=data['title'],
            content=data['content'],
            is_blog=bool(data.get('is_blog', False)),
            featured=bool(data.get('featured', False)),
            excerpt=data.get('excerpt'),
            comments_disabled=bool(data.get('comments_disabled', False))
        )
        
        return jsonify(new_page), 201
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating page: {str(e)}")
        return jsonify({"error": "Failed to create page"}), 500

@bp.route('/<slug>', methods=['PUT'])
@login_required
def update_page(slug):
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    data = request.get_json()
    
    if not data or 'title' not in data or 'content' not in data:
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        updated_page = update_existing_page(
            slug=slug,
            title=data['title'],
            content=data['content'],
            is_blog=bool(data.get('is_blog', None)),
            featured=bool(data.get('featured', None)),
            excerpt=data.get('excerpt'),
            comments_disabled=bool(data.get('comments_disabled', None)) if 'comments_disabled' in data else None
        )
        
        if not updated_page:
            return jsonify({"error": "Page not found"}), 404
        
        return jsonify(updated_page), 200
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating page: {str(e)}")
        return jsonify({"error": "Failed to update page"}), 500

@bp.route('/<slug>', methods=['PATCH'])
@login_required
def api_update_page(slug):
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No update data provided"}), 400
        
    try:
        updated_page = update_existing_page(
            slug=slug,
            title=data.get('title'),
            content=data.get('content'),
            is_blog=bool(data.get('is_blog')) if 'is_blog' in data else None,
            featured=bool(data.get('featured')) if 'featured' in data else None,
            excerpt=data.get('excerpt'),
            comments_disabled=bool(data.get('comments_disabled')) if 'comments_disabled' in data else None
        )
        
        if updated_page:
            return jsonify(updated_page)
        else:
            return jsonify({"error": "Page not found"}), 404
    except Exception as e:
        current_app.logger.error(f"Error updating page: {str(e)}")
        return jsonify({"error": "Failed to update page"}), 500

@bp.route('/<slug>', methods=['DELETE'])
@login_required
def api_delete_page(slug):
    try:
        success = delete_page(slug)
        if success:
            return jsonify({"success": True, "message": "Page deleted successfully"}), 200
        else:
            return jsonify({"error": "Page not found"}), 404
    except Exception as e:
        current_app.logger.error(f"Error deleting page: {str(e)}")
        return jsonify({"error": "Failed to delete page"}), 500
