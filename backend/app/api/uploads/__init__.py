from flask import Blueprint

bp = Blueprint('uploads', __name__)

from . import routes 

__all__ = ['routes']
