import os
from flask import jsonify, request, current_app, send_from_directory
from werkzeug.utils import secure_filename
from app.api.auth.routes import login_required
import cloudinary
import cloudinary.uploader
from app.utils.cloudinary_utils import get_uploaded_files, delete_uploaded_file, save_uploaded_image
from app.models.database import db, GalleryImage
from . import bp

@bp.route('', methods=['POST'])
@login_required
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    add_to_gallery = request.form.get('add_to_gallery', 'false').lower() == 'true'
    is_featured = request.form.get('featured', 'false').lower() == 'true'
    title = request.form.get('title', '')
    description = request.form.get('description', '')
    
    try:
        if current_app.config['CLOUDINARY_CLOUD_NAME']:
            result = None
            if add_to_gallery:
                file_url = save_uploaded_image(file)
                if not file_url:
                    return jsonify({"error": "Failed to upload file to Cloudinary"}), 500
                
                path_parts = file_url.split('/')
                try:
                    folder_idx = path_parts.index('upload') + 1
                    public_id = '/'.join(path_parts[folder_idx:])
                    if '.' in public_id:
                        public_id = public_id.split('.')[0]
                except (ValueError, IndexError):
                    public_id = None
                
                if public_id:
                    gallery_image = GalleryImage(
                        title=title,
                        description=description,
                        url=file_url,
                        public_id=public_id,
                        featured=is_featured
                    )
                    db.session.add(gallery_image)
                    db.session.commit()
                    
                    return jsonify({
                        "url": file_url,
                        "success": True,
                        "gallery_id": gallery_image.id,
                        "added_to_gallery": True
                    })
                
                result = {"secure_url": file_url}
            else:
                result = cloudinary.uploader.upload(file)
            
            return jsonify({
                "url": result['secure_url'],
                "success": True
            })
        else:
            filename = secure_filename(file.filename)
            uploads_dir = os.path.join(current_app.instance_path, 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)
            file.save(os.path.join(uploads_dir, filename))
            return jsonify({
                "url": f"/api/uploads/{filename}",
                "success": True
            })
    except Exception as e:
        current_app.logger.error(f"Upload error: {str(e)}")
        return jsonify({"error": "Failed to upload file"}), 500

@bp.route('/list', methods=['GET'])
def list_files():
    if not current_app.config.get('CLOUDINARY_CLOUD_NAME') or not current_app.config.get('CLOUDINARY_API_KEY'):
        return jsonify([]), 200
    
    files = get_uploaded_files()
    return jsonify(files), 200

@bp.route('/<path:identifier>', methods=['DELETE'])
@login_required
def delete_file(identifier):
    if not current_app.config.get('CLOUDINARY_CLOUD_NAME') or not current_app.config.get('CLOUDINARY_API_KEY'):
        return jsonify({'error': 'Image uploads are not configured properly'}), 500
    
    if identifier.startswith('http') and 'cloudinary.com' in identifier:
        path_parts = identifier.split('/')
        try:
            folder_idx = path_parts.index('upload') + 1
            public_id = '/'.join(path_parts[folder_idx:])
            if '.' in public_id:
                public_id = public_id.split('.')[0]
                
            GalleryImage.delete_by_public_id(public_id)
        except (ValueError, IndexError):
            pass
    elif identifier.startswith('blog_uploads/'):
        GalleryImage.delete_by_public_id(identifier)
    
    if delete_uploaded_file(identifier):
        return jsonify({
            'success': True,
            'message': 'File deleted successfully from Cloudinary'
        }), 200
    else:
        return jsonify({'error': 'File not found or could not be deleted'}), 404

@bp.route('/<filename>')
def serve_file(filename):
    if current_app.config['CLOUDINARY_CLOUD_NAME']:
        return jsonify({"error": "File not found"}), 404
    return send_from_directory(
        os.path.join(current_app.instance_path, 'uploads'),
        filename
    )
