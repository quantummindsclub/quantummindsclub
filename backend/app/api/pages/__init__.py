from flask import Blueprint

bp = Blueprint('pages', __name__)

from . import routes

__all__ = ['routes']