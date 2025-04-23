from flask import Blueprint

bp = Blueprint('events', __name__)

from . import routes  

__all__ = ['routes']