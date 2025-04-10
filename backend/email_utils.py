import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def send_email(to_email, subject, body):
    """Send an email using the configured SMTP server"""
    try:
        # Get email configuration from environment variables
        email_service = os.getenv("EMAIL_SERVICE")
        email_user = os.getenv("EMAIL_USER")
        email_password = os.getenv("EMAIL_PASS")
        email_from = os.getenv("EMAIL_FROM")
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = email_from
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add body to email
        msg.attach(MIMEText(body, 'html'))
        
        # Setup SMTP server
        if email_service == 'gmail':
            server = smtplib.SMTP('smtp.gmail.com', 587)
        else:
            raise ValueError(f"Unsupported email service: {email_service}")
        
        server.starttls()
        server.login(email_user, email_password)
        
        # Send email
        text = msg.as_string()
        server.sendmail(email_from, to_email, text)
        server.quit()
        
        return {"success": True, "message": "Email sent successfully"}
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return {"success": False, "message": str(e)}
