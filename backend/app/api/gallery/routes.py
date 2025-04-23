from flask import jsonify, request
from app.models.database import db, GalleryImage
from app.api.auth.routes import login_required
from app.utils.cloudinary_utils import delete_uploaded_file, update_image_metadata
from . import bp

@bp.route('/test', methods=['GET'])
def test_gallery_route():
    return jsonify({'message': 'Gallery API is working'}), 200

@bp.route('', methods=['GET'])
def get_gallery_images():
    featured_only = request.args.get('featured', '').lower() == 'true'
    images = GalleryImage.get_all(featured_only=featured_only)
    return jsonify([image.to_dict() for image in images]), 200

@bp.route('/<int:image_id>', methods=['GET'])
def get_gallery_image(image_id):
    image = GalleryImage.get_by_id(image_id)
    if not image:
        return jsonify({'error': 'Image not found'}), 404
    return jsonify(image.to_dict()), 200

@bp.route('', methods=['POST'])
@login_required
def add_gallery_image():
    data = request.json
    
    if not data or not data.get('url') or not data.get('public_id'):
        return jsonify({'error': 'URL and public_id are required'}), 400
    
    existing_image = GalleryImage.get_by_public_id(data['public_id'])
    if existing_image:
        return jsonify({'error': 'Image already exists in the gallery'}), 409
    
    new_image = GalleryImage(
        title=data.get('title', ''),
        description=data.get('description', ''),
        url=data['url'],
        public_id=data['public_id'],
        featured=data.get('featured', False)
    )
    
    db.session.add(new_image)
    db.session.commit()
    
    if new_image.featured:
        update_image_metadata(new_image.public_id, {'featured': True})
    
    return jsonify(new_image.to_dict()), 201

@bp.route('/<int:image_id>', methods=['PUT'])
@login_required
def update_gallery_image(image_id):
    image = GalleryImage.get_by_id(image_id)
    if not image:
        return jsonify({'error': 'Image not found'}), 404
    
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    if 'title' in data:
        image.title = data['title']
    if 'description' in data:
        image.description = data['description']
    if 'featured' in data:
        image.featured = data['featured']
        update_image_metadata(image.public_id, {'featured': image.featured})
    
    db.session.commit()
    return jsonify(image.to_dict()), 200

@bp.route('/<int:image_id>', methods=['DELETE'])
@login_required
def delete_gallery_image(image_id):
    image = GalleryImage.get_by_id(image_id)
    if not image:
        return jsonify({'error': 'Image not found'}), 404
    
    cloudinary_delete_success = delete_uploaded_file(image.public_id)
    
    db.session.delete(image)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'cloudinary_deleted': cloudinary_delete_success,
        'message': 'Image deleted successfully'
    }), 200

@bp.route('/featured/<int:image_id>', methods=['PUT'])
@login_required
def toggle_featured(image_id):
    data = request.json
    if data is None or 'featured' not in data:
        return jsonify({'error': 'Featured status not provided'}), 400
    
    image = GalleryImage.get_by_id(image_id)
    if not image:
        return jsonify({'error': 'Image not found'}), 404
    
    featured = bool(data['featured'])
    image.featured = featured
    db.session.commit()
    
    update_image_metadata(image.public_id, {'featured': featured})
    
    return jsonify({
        'success': True,
        'featured': image.featured,
        'message': f"Image {'featured' if featured else 'unfeatured'} successfully"
    }), 200
