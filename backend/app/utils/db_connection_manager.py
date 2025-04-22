import logging
import time
import functools
from sqlalchemy import text
from sqlalchemy.exc import OperationalError, SQLAlchemyError

logger = logging.getLogger(__name__)

def with_retry(max_attempts=3, retry_delay=1):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            attempts = 0
            last_error = None
            
            while attempts < max_attempts:
                try:
                    return func(*args, **kwargs)
                except (OperationalError, SQLAlchemyError) as e:
                    last_error = e
                    error_message = str(e)
                    if "max clients reached" in error_message or "connection to server" in error_message:
                        attempts += 1
                        if attempts < max_attempts:
                            logger.warning(f"Connection pool full, retrying ({attempts}/{max_attempts})...")
                            time.sleep(retry_delay * attempts)
                        else:
                            logger.error(f"Max retry attempts reached: {error_message}")
                            raise
                    else:
                        raise
            
            raise last_error
        return wrapper
    return decorator

class PostgresConnectionManager:
    
    def __init__(self, db, app=None):
        self.db = db
        self.app = app
        self.connection_attempts = 0
        self.max_retries = 3
        self.retry_delay = 2
    
    @with_retry()
    def execute_with_retry(self, query, params=None):
        self.connection_attempts = 0
        while self.connection_attempts < self.max_retries:
            try:
                with self.db.engine.connect() as connection:
                    if params:
                        return connection.execute(text(query), params)
                    else:
                        return connection.execute(text(query))
            except Exception as e:
                self.connection_attempts += 1
                if self.connection_attempts >= self.max_retries:
                    logger.error(f"Max retry attempts reached: {str(e)}")
                    raise
                logger.warning(f"Database query failed, retrying ({self.connection_attempts}/{self.max_retries}): {str(e)}")
                time.sleep(self.retry_delay)
    
    def terminate_idle_connections(self, idle_time_seconds=300):
        if not self._is_postgres():
            logger.debug("Not using PostgreSQL, skipping idle connection termination")
            return 0
            
        try:
            terminate_query = """
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE state = 'idle'
              AND usename = current_user
              AND pid <> pg_backend_pid()
              AND NOW() - state_change > make_interval(secs => :idle_seconds)
            """
            
            with self.db.engine.connect() as connection:
                with connection.begin():
                    result = connection.execute(text(terminate_query), {"idle_seconds": idle_time_seconds})
                    terminated = result.rowcount if hasattr(result, 'rowcount') else 0
                    
            if terminated > 0:
                logger.info(f"Terminated {terminated} idle database connections")
            return terminated
            
        except Exception as e:
            logger.error(f"Error terminating idle connections: {str(e)}")
            self.db.session.rollback()
            return 0
    
    def get_active_connections(self):
        if not self._is_postgres():
            return {"active": 0, "idle": 0, "total": 0}
            
        try:
            query = """
            SELECT state, COUNT(*) as count
            FROM pg_stat_activity
            WHERE usename = current_user
            GROUP BY state
            """
            
            result = self.execute_with_retry(query)
            stats = {"active": 0, "idle": 0, "total": 0}
            
            for row in result:
                if row[0] == 'active':
                    stats["active"] = row[1]
                elif row[0] == 'idle':
                    stats["idle"] = row[1]
            
            stats["total"] = stats["active"] + stats["idle"]
            return stats
        except Exception as e:
            logger.error(f"Error getting connection statistics: {str(e)}")
            return {"active": -1, "idle": -1, "total": -1, "error": str(e)}
    
    def check_connection_health(self):
        try:
            self.execute_with_retry("SELECT 1")
            return True
        except Exception as e:
            logger.error(f"Database connection health check failed: {str(e)}")
            return False
    
    def cleanup(self):
        try:
            if hasattr(self.db, 'session') and self.db.session:
                self.db.session.close()
                logger.info("Database session closed")
        except Exception as e:
            logger.error(f"Error during database cleanup: {str(e)}")
    
    def _is_postgres(self):
        if not self.app:
            return False
            
        try:
            db_uri = self.app.config.get('SQLALCHEMY_DATABASE_URI', '')
            return db_uri.startswith('postgresql')
        except RuntimeError:
            return False
    
def configure_connection_pool(app):
    db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', '')
    if not db_uri.startswith('postgresql'):
        return
    
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_size': app.config.get('DB_POOL_SIZE', 3),
        'max_overflow': app.config.get('DB_MAX_OVERFLOW', 5),
        'pool_timeout': app.config.get('DB_POOL_TIMEOUT', 30),
        'pool_recycle': app.config.get('DB_POOL_RECYCLE', 240),
        'pool_pre_ping': True,
    }
    
    app.logger.info(f"PostgreSQL connection pool configured: "
                    f"size={app.config['SQLALCHEMY_ENGINE_OPTIONS']['pool_size']}, "
                    f"recycle={app.config['SQLALCHEMY_ENGINE_OPTIONS']['pool_recycle']}s")

def register_db_shutdown_handlers(app, db):
    conn_manager = PostgresConnectionManager(db, app=app)
    
    @app.teardown_appcontext
    def shutdown_db_session(exception=None):
        if hasattr(db, 'session') and db.session:
            db.session.remove()
    
    app.extensions['db_connection_manager'] = conn_manager
    
    return conn_manager
