from flask import Blueprint

bp = Blueprint("emails", __name__)

from . import routes

__all__ = ['routes']