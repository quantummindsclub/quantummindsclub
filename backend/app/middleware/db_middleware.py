import logging
import time
from functools import wraps
from flask import current_app
from sqlalchemy.exc import OperationalError, SQLAlchemyError

logger = logging.getLogger(__name__)

def db_connection_handler(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        max_retries = 3
        retry_count = 0
        retry_delay = 1  
        
        while retry_count < max_retries:
            try:
                if retry_count > 0 and 'db_connection_manager' in current_app.extensions:
                    conn_manager = current_app.extensions['db_connection_manager']
                    terminated = conn_manager.terminate_idle_connections(idle_time_seconds=60)
                    if terminated:
                        logger.info(f"Terminated {terminated} idle connections before retry")
                
                return f(*args, **kwargs)
                
            except (OperationalError, SQLAlchemyError) as e:
                error_msg = str(e)
                
                if "max clients reached" in error_msg:
                    retry_count += 1
                    
                    if retry_count >= max_retries:
                        logger.error(f"Max retries ({max_retries}) reached. Connection error: {error_msg}")
                        raise
                    
                    logger.warning(f"Connection pool full, retrying in {retry_delay}s ({retry_count}/{max_retries})...")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    raise
        
        raise Exception("Unexpected error in db_connection_handler")
    
    return decorated_function
