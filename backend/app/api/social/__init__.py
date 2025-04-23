from flask import Blueprint

bp = Blueprint('social', __name__)

from . import routes

__all__ = ['routes']