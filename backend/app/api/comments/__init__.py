from flask import Blueprint

bp = Blueprint('comments', __name__, url_prefix='/api/comments')

from . import routes  

__all__ = ['routes']