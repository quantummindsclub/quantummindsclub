import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app
from datetime import datetime
from app.models.database import db, SentEmail

def send_email(recipient_list, subject, html_content, sender_email=None, sender_password=None, cc_list=None, bcc_list=None, store_record=True):
    try:
        smtp_server = os.environ.get('EMAIL_SMTP_SERVER')
        smtp_port = int(os.environ.get('EMAIL_SMTP_PORT'))
        sender_email = sender_email or os.environ.get('EMAIL_USERNAME')
        sender_password = sender_password or os.environ.get('EMAIL_PASSWORD')
        
        if isinstance(recipient_list, str):
            recipient_list = [email.strip() for email in recipient_list.split(',') if email.strip()]
        elif recipient_list is None:
            recipient_list = []
        
        if isinstance(cc_list, str):
            cc_list = [email.strip() for email in cc_list.split(',') if email.strip()]
        elif cc_list is None:
            cc_list = []
            
        if isinstance(bcc_list, str):
            bcc_list = [email.strip() for email in bcc_list.split(',') if email.strip()]
        elif bcc_list is None:
            bcc_list = []
            
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = sender_email
        
        if recipient_list:
            msg['To'] = ', '.join(recipient_list)
        else:
            msg['To'] = "Undisclosed Recipients"
            
        if cc_list:
            msg['Cc'] = ', '.join(cc_list)
            
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        all_recipients = []
        all_recipients.extend(recipient_list)
        all_recipients.extend(cc_list)
        all_recipients.extend(bcc_list)
        
        if not all_recipients:
            return False, {"success": False, "error": "No recipients specified"}
        
        current_app.logger.info(f"Attempting to connect to SMTP server: {smtp_server}:{smtp_port}")
        
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
        server.ehlo()  
        
        server.starttls()
        server.ehlo()  
        
        current_app.logger.info(f"Logging in with username: {sender_email}")
        server.login(sender_email, sender_password)
        
        server.sendmail(sender_email, all_recipients, msg.as_string())
        server.quit()
        
        if store_record:
            sent_email = SentEmail(
                from_address=sender_email,
                to_addresses=', '.join(recipient_list) if recipient_list else '',
                cc_addresses=', '.join(cc_list) if cc_list else None,
                bcc_addresses=', '.join(bcc_list) if bcc_list else None,
                subject=subject,
                content=html_content,
                sent_at=datetime.utcnow()
            )
            db.session.add(sent_email)
            db.session.commit()
        
        recipient_count = len(all_recipients)
        current_app.logger.info(f"Email sent successfully to {recipient_count} recipients")
        
        return True, {
            "success": True, 
            "message": f"Email sent successfully to {recipient_count} recipient(s)", 
            "recipients": recipient_count
        }
        
    except Exception as e:
        current_app.logger.error(f"Email sending error: {str(e)}")
        return False, {"success": False, "error": str(e)}