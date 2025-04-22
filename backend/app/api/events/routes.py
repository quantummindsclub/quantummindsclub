from flask import jsonify, request, current_app, send_file
from sqlalchemy.exc import SQLAlchemyError
from app.models.database import db, Event, Participant
from app.api.auth.routes import login_required
from . import bp
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import qrcode
import os
import datetime


@bp.route('', methods=['GET'])
def get_events():
    try:
        events = Event.query.order_by(Event.event_date.desc()).all()
        return jsonify([event.to_dict() for event in events])
        
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/<event_id>', methods=['GET'])
def get_event(event_id):
    try:
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({"error": "Event not found"}), 404
            
        return jsonify(event.to_dict())
        
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('', methods=['POST'])
@login_required
def create_event():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    data = request.get_json()
    
    if not data or 'name' not in data or 'event_date' not in data:
        return jsonify({"error": "Name and event date are required"}), 400
    
    try:
        event_id = Event.generate_id(data['name'], data['event_date'])
        
        existing_event = Event.query.get(event_id)
        if (existing_event):
            return jsonify({"error": "An event with this name and date already exists"}), 409
            
        new_event = Event(
            id=event_id,
            name=data['name'],
            description=data.get('description', ''),
            event_date=data['event_date'],
            accepting_submissions=data.get('accepting_submissions', True),
            instructor=data.get('instructor', None)
        )
        
        db.session.add(new_event)
        db.session.commit()
        
        return jsonify(new_event.to_dict()), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/<event_id>', methods=['PUT'])
@login_required
def update_event(event_id):
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No update data provided"}), 400
    
    try:
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({"error": "Event not found"}), 404
            
        if 'name' in data:
            event.name = data['name']
        if 'description' in data:
            event.description = data['description']
        if 'event_date' in data:
            event.event_date = data['event_date']
        if 'accepting_submissions' in data:
            event.accepting_submissions = data['accepting_submissions']
        if 'instructor' in data:
            event.instructor = data['instructor']
            
        db.session.commit()
        
        return jsonify(event.to_dict())
        
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/<event_id>', methods=['DELETE'])
@login_required
def delete_event(event_id):
    try:
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({"error": "Event not found"}), 404
            
        db.session.delete(event)
        db.session.commit()
        
        return jsonify({"success": True, "message": "Event deleted successfully"})
        
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@bp.route('/<event_id>/participants', methods=['GET'])
@login_required
def get_participants(event_id):
    try:
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({"error": "Event not found"}), 404
            
        participants = Participant.query.filter_by(event_id=event_id).all()
        return jsonify([participant.to_dict() for participant in participants])
        
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/<event_id>/participants', methods=['POST'])
def register_participant(event_id):
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    data = request.get_json()
    
    required_fields = ['name', 'email', 'department', 'academic_year', 'college_code', 'student_id']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"{field.replace('_', ' ').title()} is required"}), 400
    
    email = data['email']
    if '@' not in email or '.' not in email:
        return jsonify({"error": "Invalid email format"}), 400
    
    try:
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({"error": "Event not found"}), 404
            
        if not event.accepting_submissions:
            return jsonify({"error": "This event is no longer accepting registrations"}), 403
        
        existing_participant = Participant.query.filter_by(
            event_id=event_id,
            student_id=data['student_id']
        ).first()
        
        if existing_participant:
            existing_participant.name = data['name']
            existing_participant.email = data['email']
            existing_participant.phone = data.get('phone', '')
            existing_participant.department = data['department']
            existing_participant.academic_year = data['academic_year']
            existing_participant.college_code = data['college_code']
            
            db.session.commit()
            return jsonify(existing_participant.to_dict()), 200
        else:
            new_participant = Participant(
                name=data['name'],
                email=data['email'],
                phone=data.get('phone', ''),
                department=data['department'],
                academic_year=data['academic_year'],
                college_code=data['college_code'],
                student_id=data['student_id'],
                event_id=event_id
            )
            
            db.session.add(new_participant)
            db.session.commit()
            
            return jsonify(new_participant.to_dict()), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/participants/<int:participant_id>', methods=['PUT'])
@login_required
def update_participant(participant_id):
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No update data provided"}), 400
    
    try:
        participant = Participant.query.get(participant_id)
        
        if not participant:
            return jsonify({"error": "Participant not found"}), 404
            
        if 'name' in data:
            participant.name = data['name']
        if 'email' in data:
            participant.email = data['email']
        if 'phone' in data:
            participant.phone = data['phone']
        if 'department' in data:
            participant.department = data['department']
        if 'academic_year' in data:
            participant.academic_year = data['academic_year']
        if 'college_code' in data:
            participant.college_code = data['college_code']
        if 'student_id' in data:
            participant.student_id = data['student_id']
        if 'attended' in data:
            participant.attended = data['attended']
            
        db.session.commit()
        
        return jsonify(participant.to_dict())
        
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/participants/<int:participant_id>', methods=['DELETE'])
@login_required
def delete_participant(participant_id):
    try:
        participant = Participant.query.get(participant_id)
        
        if not participant:
            return jsonify({"error": "Participant not found"}), 404
            
        db.session.delete(participant)
        db.session.commit()
        
        return jsonify({"success": True, "message": "Participant deleted successfully"})
        
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/participants/<int:participant_id>/attendance', methods=['PUT'])
@login_required
def update_attendance(participant_id):
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    data = request.get_json()
    
    if 'attended' not in data:
        return jsonify({"error": "No attendance status provided"}), 400
    
    try:
        participant = Participant.query.get(participant_id)
        
        if not participant:
            return jsonify({"error": "Participant not found"}), 404
            
        participant.attended = data['attended']
        db.session.commit()
        
        return jsonify(participant.to_dict())
        
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/<event_id>+<college_code>+<student_id>', methods=['GET'])
def check_participant_achievement(event_id, college_code, student_id):
    try:
        participant = Participant.query.filter_by(
            event_id=event_id,
            college_code=college_code,
            student_id=student_id
        ).first()
        if participant and getattr(participant, 'attended', False):
            return jsonify({
                "eligible": True,
                "participant": participant.to_dict()
            })
        else:
            return jsonify({"eligible": False}), 404
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@bp.route('/<event_id>/send-emails', methods=['POST'])
@login_required
def send_participant_emails(event_id):
    from app.utils.email_utils import send_email
    
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    data = request.get_json()
    
    if not data or 'subject' not in data or 'message' not in data:
        return jsonify({"error": "Subject and message are required"}), 400
    
    subject = data['subject']
    message = data['message']
    filter_type = data.get('filter', 'all')
    
    try:
        event = Event.query.get(event_id)
        if not event:
            return jsonify({"error": "Event not found"}), 404
            
        participants_query = Participant.query.filter_by(event_id=event_id)
        
        if (filter_type == 'attended'):
            participants_query = participants_query.filter_by(attended=True)
        elif (filter_type == 'absent'):
            participants_query = participants_query.filter_by(attended=False)
            
        participants = participants_query.all()
        
        if not participants:
            return jsonify({"error": "No participants found matching the criteria"}), 404
            
        sent_count = 0
        for p in participants:
            if not p.email:
                continue
            achievement_url = f"https://quantummindsclub.onrender.com/events/{event_id}+{p.college_code}+{p.student_id}"
            personalized_message = message.replace("{event_name}", event.name)
            personalized_message = personalized_message.replace("{event_date}", event.event_date)
            personalized_message = personalized_message.replace("{achievement_url}", achievement_url)
            success, _ = send_email([p.email], subject, personalized_message)
            if success:
                sent_count += 1
        if sent_count > 0:
            return jsonify({
                "success": True,
                "message": f"Emails sent to {sent_count} participants",
                "recipients": sent_count
            })
        else:
            return jsonify({"error": "Failed to send emails to any participants"}), 500
            
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@bp.route('/certificate/download', methods=['POST'])
def download_certificate():
    import traceback
    data = request.get_json()
    required = ['name', 'workshop', 'instructor', 'event_date', 'college_code', 'student_id', 'event_id']
    if not data or not all(k in data for k in required):
        return jsonify({'error': 'Missing required fields'}), 400

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    certgen_dir = os.path.join(base_dir, 'events', 'certificate-templates')
    template_path = os.path.join(certgen_dir, 'images', 'certificate_template.png')
    fonts_dir = os.path.join(certgen_dir, 'fonts')

    try:
        if not os.path.isfile(template_path):
            return jsonify({'error': f'Certificate template not found at {template_path}'}), 500
        template = Image.open(template_path).convert('RGB')
        draw = ImageDraw.Draw(template)

        def font(name, size):
            font_path = os.path.join(fonts_dir, name)
            if not os.path.isfile(font_path):
                raise FileNotFoundError(f"Font not found: {font_path}")
            return ImageFont.truetype(font_path, size)
        fonts = {
            'name': font('Tinos-Bold.ttf', 80),
            'text': font('Poppins-BoldItalic.ttf', 40),
            'date': font('OpenSans-Regular.ttf', 22)
        }

        name = data['name']
        name_bbox = draw.textbbox((0, 0), name, font=fonts['name'])
        name_width = name_bbox[2] - name_bbox[0]
        image_width = template.width
        name_x = (image_width - name_width) // 2
        draw.text((name_x, 500), name, fill="#DDAC00", font=fonts['name'])

        workshop = data['workshop']
        workshop_bbox = draw.textbbox((0, 0), workshop, font=fonts['text'])
        workshop_width = workshop_bbox[2] - workshop_bbox[0]
        workshop_x = (image_width - workshop_width) // 2
        draw.text((workshop_x, 655), workshop, fill="black", font=fonts['text'])

        instructor = data['instructor']
        instructor_bbox = draw.textbbox((0, 0), instructor, font=fonts['text'])
        instructor_width = instructor_bbox[2] - instructor_bbox[0]
        instructor_x = (image_width - instructor_width) // 2
        draw.text((instructor_x, 820), instructor, fill="black", font=fonts['text'])

        try:
            dt = datetime.datetime.strptime(data['event_date'], '%Y-%m-%d')
            date_str = f"Date: {dt.strftime('%d %B, %Y')}"
        except Exception:
            date_str = f"Date of completion: {data['event_date']}"
        draw.text((1722, 1384), date_str, fill="black", font=fonts['date'])

        qr_data = f"https://quantummindsclub.onrender.com/events/{data['event_id']}+{data['college_code']}+{data['student_id']}"
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=8,
            border=2,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        qr_image = qr.make_image(fill='black', back_color='#f2f2f2').resize((124, 124))
        template.paste(qr_image, (947, 1248))

        buffer = BytesIO()
        template.save(buffer, format="PNG")
        buffer.seek(0)

        filename = f"{data['name']}_certificate.png"
        return send_file(buffer, as_attachment=True, download_name=filename, mimetype='image/png')
    except Exception as e:
        print(traceback.format_exc())
        current_app.logger.error(f"Certificate generation failed: {str(e)}\n{traceback.format_exc()}")
        return jsonify({'error': f'Certificate generation failed: {str(e)}'}), 500