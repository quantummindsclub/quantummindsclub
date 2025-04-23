from flask import Blueprint

bp = Blueprint('contact', __name__, url_prefix='/api/contact')

from . import routes  

__all__ = ['routes']