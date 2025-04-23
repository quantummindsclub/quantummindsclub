from flask import Blueprint

bp = Blueprint('team', __name__, url_prefix='/api/team')

from . import routes  

__all__ = ['routes']