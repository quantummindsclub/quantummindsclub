import re
import uuid
from flask import current_app
import cloudinary
import cloudinary.uploader
import cloudinary.api

def slugify(text):
    text = text.lower().replace(' ', '-')
    text = re.sub(r'[^a-z0-9\-]', '', text)
    text = re.sub(r'\-+', '-', text)
    return text.strip('-')

def generate_excerpt(content, max_length=150):
    plain_text = re.sub(r'<[^>]*>', '', content)
    
    if len(plain_text) > max_length:
        return plain_text[:max_length].rsplit(' ', 1)[0] + '...'
    return plain_text

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def init_cloudinary():
    if (current_app.config['CLOUDINARY_CLOUD_NAME'] and 
        current_app.config['CLOUDINARY_API_KEY'] and 
        current_app.config['CLOUDINARY_API_SECRET']):
        
        cloudinary.config(
            cloud_name=current_app.config['CLOUDINARY_CLOUD_NAME'],
            api_key=current_app.config['CLOUDINARY_API_KEY'],
            api_secret=current_app.config['CLOUDINARY_API_SECRET'],
            secure=True
        )
        return True
    
    current_app.logger.error("Cloudinary credentials not configured properly")
    return False

def save_uploaded_image(file):
    if not file or not allowed_file(file.filename):
        return None
        
    if not init_cloudinary():
        current_app.logger.error("Cannot upload - Cloudinary not initialized")
        return None
        
    try:
        folder = "blog_uploads"
        public_id = f"{folder}/{uuid.uuid4().hex}"
        
        result = cloudinary.uploader.upload(
            file,
            public_id=public_id,
            folder=folder,
            resource_type="auto"
        )
        
        current_app.logger.info(f"File uploaded to Cloudinary: {result['secure_url']}")
        return result['secure_url']
    except Exception as e:
        current_app.logger.error(f"Cloudinary upload error: {str(e)}")
        return None

def get_uploaded_files():
    files = []
    
    if not init_cloudinary():
        current_app.logger.error("Cannot list files - Cloudinary not initialized")
        return files
        
    try:
        result = cloudinary.api.resources(
            type="upload",
            prefix="blog_uploads",
            max_results=500
        )
        
        for resource in result.get('resources', []):
            files.append({
                'filename': resource['public_id'].split('/')[-1],
                'url': resource['secure_url'],
                'size': resource.get('bytes', 0),
                'created': resource.get('created_at'),
                'public_id': resource['public_id']
            })
        
        return files
    except Exception as e:
        current_app.logger.error(f"Cloudinary list error: {str(e)}")
        return files

def delete_uploaded_file(identifier):
    if not init_cloudinary():
        current_app.logger.error("Cannot delete - Cloudinary not initialized")
        return False
    
    public_id = None
    
    if identifier.startswith('http') and 'cloudinary.com' in identifier:
        path_parts = identifier.split('/')
        try:
            folder_idx = path_parts.index('upload') + 1
            public_id = '/'.join(path_parts[folder_idx:])
            if '.' in public_id:
                public_id = public_id.split('.')[0]
        except (ValueError, IndexError):
            current_app.logger.error(f"Could not extract public_id from URL: {identifier}")
            return False
    
    elif identifier.startswith('blog_uploads/'):
        public_id = identifier
    
    elif '/' not in identifier:
        try:
            result = cloudinary.api.resources(
                type="upload",
                prefix="blog_uploads",
                max_results=500
            )
            
            for resource in result.get('resources', []):
                if resource['public_id'].endswith(identifier):
                    public_id = resource['public_id']
                    break
        except Exception as e:
            current_app.logger.error(f"Error searching for file {identifier}: {str(e)}")
            return False
    
    if not public_id:
        current_app.logger.error(f"Could not determine public_id for: {identifier}")
        return False
    
    try:
        result = cloudinary.uploader.destroy(public_id)
        success = result.get('result') == 'ok'
        if success:
            current_app.logger.info(f"Successfully deleted {public_id} from Cloudinary")
        else:
            current_app.logger.warning(f"Cloudinary reported non-OK result: {result}")
        return success
    except Exception as e:
        current_app.logger.error(f"Cloudinary delete error: {str(e)}")
        return False

def extract_first_image_url(html_content):
    if not html_content:
        return None
        
    match = re.search(r'<img[^>]+src=["\'](.*?)["\']', html_content)
    if match:
        return match.group(1)
    return None

def update_image_metadata(public_id, metadata):
    if not init_cloudinary():
        current_app.logger.error("Cannot update - Cloudinary not initialized")
        return False
    
    try:
        tags = []
        for key, value in metadata.items():
            if isinstance(value, bool) and value:
                tags.append(key)
            elif not isinstance(value, bool):
                tags.append(f"{key}_{value}")
        
        result = cloudinary.uploader.explicit(
            public_id,
            type="upload",
            tags=tags
        )
        
        success = result.get('tags') is not None
        if success:
            current_app.logger.info(f"Successfully updated metadata for {public_id}")
        else:
            current_app.logger.warning(f"Cloudinary metadata update returned unexpected result: {result}")
        return success
    except Exception as e:
        current_app.logger.error(f"Cloudinary metadata update error: {str(e)}")
        return False
