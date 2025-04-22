from flask import Blueprint

bp = Blueprint('gallery', __name__)

from . import routes 
