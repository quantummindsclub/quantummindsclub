import sys
import signal
import logging
import threading

logger = logging.getLogger(__name__)

_handlers_installed = False

def install_signal_handlers(app):
    global _handlers_installed
    
    if _handlers_installed:
        return
    
    _handlers_installed = True
    
    shutdown_lock = threading.Lock()
    shutdown_in_progress = False
    
    def signal_handler(sig, frame):
        nonlocal shutdown_in_progress
        
        if not shutdown_lock.acquire(blocking=False):
            return
        
        try:
            if shutdown_in_progress:
                return
                
            shutdown_in_progress = True
            
            if sig == signal.SIGINT:
                logger.info("Received interrupt signal (CTRL+C)")
            elif sig == signal.SIGTERM:
                logger.info("Received termination signal")
            
            logger.info("Initiating graceful shutdown...")
            
            with app.app_context():
                if 'db_connection_manager' in app.extensions:
                    try:
                        conn_manager = app.extensions['db_connection_manager']
                        conn_manager.cleanup()
                    except Exception as e:
                        logger.error(f"Error during database cleanup: {str(e)}")
            
            logger.info("Shutdown complete")
            sys.exit(0)
        finally:
            shutdown_lock.release()
    
    signal.signal(signal.SIGINT, signal_handler)  
    signal.signal(signal.SIGTERM, signal_handler) 
    
    logger.info("Signal handlers installed for graceful shutdown")
