import os
from dotenv import load_dotenv

if not os.environ.get("DATABASE_URL"): 
    load_dotenv()

from app import create_app

config_name = os.environ.get('FLASK_ENV', 'production')
app = create_app(config_name)

if __name__ == "__main__":
    app.run()
