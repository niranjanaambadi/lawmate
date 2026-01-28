# backend/app.py (complete updated version with cases management)
import os
import io
import json
import jwt
import bcrypt
import uuid
from typing import Dict, Any, Optional, List
from pathlib import Path
from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import anthropic
from pdf2image import convert_from_bytes
from PIL import Image
import pytesseract
import PyPDF2
import re

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = Path('uploads')
PROCESSED_FOLDER = Path('processed')
CASES_FOLDER = Path('cases')
USERS_DB = Path('users.json')
CASES_DB = Path('cases.json')

UPLOAD_FOLDER.mkdir(exist_ok=True)
PROCESSED_FOLDER.mkdir(exist_ok=True)
CASES_FOLDER.mkdir(exist_ok=True)

app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'lexocr-secret-key-change-in-production')
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}

ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
if not ANTHROPIC_API_KEY:
    print("⚠️  Warning: ANTHROPIC_API_KEY not set. Summarization will use mock responses.")


# User Database Management
class UserDB:
    @staticmethod
    def load_users():
        if USERS_DB.exists():
            with open(USERS_DB, 'r') as f:
                return json.load(f)
        return {}
    
    @staticmethod
    def save_users(users):
        with open(USERS_DB, 'w') as f:
            json.dump(users, f, indent=2)
    
    @staticmethod
    def create_user(email: str, password: str, full_name: str, firm: str = "") -> Dict:
        users = UserDB.load_users()
        
        if email in users:
            return {"success": False, "error": "User already exists"}
        
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        users[email] = {
            "email": email,
            "password_hash": password_hash,
            "full_name": full_name,
            "firm": firm,
            "created_at": datetime.now().isoformat(),
            "last_login": None
        }
        
        UserDB.save_users(users)
        return {"success": True, "user": {"email": email, "full_name": full_name, "firm": firm}}
    
    @staticmethod
    def verify_user(email: str, password: str) -> Dict:
        users = UserDB.load_users()
        
        if email not in users:
            return {"success": False, "error": "Invalid credentials"}
        
        user = users[email]
        
        if bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            users[email]['last_login'] = datetime.now().isoformat()
            UserDB.save_users(users)
            
            return {
                "success": True,
                "user": {
                    "email": user['email'],
                    "full_name": user['full_name'],
                    "firm": user['firm']
                }
            }
        
        return {"success": False, "error": "Invalid credentials"}
    
    @staticmethod
    def get_user(email: str) -> Optional[Dict]:
        users = UserDB.load_users()
        if email in users:
            user = users[email].copy()
            user.pop('password_hash', None)
            return user
        return None


# Cases Database Management
class CasesDB:
    @staticmethod
    def load_cases():
        if CASES_DB.exists():
            with open(CASES_DB, 'r') as f:
                return json.load(f)
        return {}
    
    @staticmethod
    def save_cases(cases):
        with open(CASES_DB, 'w') as f:
            json.dump(cases, f, indent=2)
    
    @staticmethod
    def create_case(user_email: str, case_data: Dict) -> Dict:
        cases = CasesDB.load_cases()
        
        case_id = str(uuid.uuid4())
        case_data['id'] = case_id
        case_data['user_email'] = user_email
        case_data['created_at'] = datetime.now().isoformat()
        case_data['updated_at'] = datetime.now().isoformat()
        
        if user_email not in cases:
            cases[user_email] = {}
        
        cases[user_email][case_id] = case_data
        CasesDB.save_cases(cases)
        
        return {"success": True, "case_id": case_id, "case": case_data}
    
    @staticmethod
    def get_user_cases(user_email: str) -> List[Dict]:
        cases = CasesDB.load_cases()
        
        if user_email not in cases:
            return []
        
        # Return cases in reverse chronological order
        user_cases = list(cases[user_email].values())
        user_cases.sort(key=lambda x: x['created_at'], reverse=True)
        
        return user_cases
    
    @staticmethod
    def get_case(user_email: str, case_id: str) -> Optional[Dict]:
        cases = CasesDB.load_cases()
        
        if user_email in cases and case_id in cases[user_email]:
            return cases[user_email][case_id]
        
        return None
    
    @staticmethod
    def update_case(user_email: str, case_id: str, updates: Dict) -> Dict:
        cases = CasesDB.load_cases()
        
        if user_email not in cases or case_id not in cases[user_email]:
            return {"success": False, "error": "Case not found"}
        
        cases[user_email][case_id].update(updates)
        cases[user_email][case_id]['updated_at'] = datetime.now().isoformat()
        
        CasesDB.save_cases(cases)
        
        return {"success": True, "case": cases[user_email][case_id]}


# JWT Token Management
def generate_token(email: str) -> str:
    payload = {
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=7),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')


def verify_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['email']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({"error": "Token required"}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            email = verify_token(token)
            if not email:
                return jsonify({"error": "Invalid or expired token"}), 401
            
            request.user_email = email
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": "Token validation failed"}), 401
    
    return decorated


# Case Information Extractor
class CaseInfoExtractor:
    """Extract case information from petition text using patterns and LLM."""
    
    @staticmethod
    def extract_basic_info(text: str) -> Dict:
        """Extract basic information using regex patterns."""
        
        info = {
            "petitioner": None,
            "respondent": None,
            "case_type": None,
            "acts": [],
            "sections": [],
            "court": None
        }
        
        # Extract petitioner
        petitioner_pattern = r"(?:petitioner|plaintiff|appellant)[:\s]+([A-Z][A-Za-z\s\.]+?)(?:\n|vs|v\.|versus)"
        petitioner_match = re.search(petitioner_pattern, text, re.IGNORECASE)
        if petitioner_match:
            info['petitioner'] = petitioner_match.group(1).strip()
        
        # Extract respondent
        respondent_pattern = r"(?:vs|v\.|versus)[:\s]+([A-Z][A-Za-z\s\.]+?)(?:\n|$)"
        respondent_match = re.search(respondent_pattern, text, re.IGNORECASE)
        if respondent_match:
            info['respondent'] = respondent_match.group(1).strip()
        
        # Extract case type
        case_types = ['criminal', 'civil', 'writ', 'appeal', 'petition', 'suit', 'application']
        for case_type in case_types:
            if case_type in text.lower():
                info['case_type'] = case_type.capitalize()
                break
        
        # Extract court
        court_pattern = r"(?:in the|before the)\s+([A-Za-z\s]+(?:court|tribunal))"
        court_match = re.search(court_pattern, text, re.IGNORECASE)
        if court_match:
            info['court'] = court_match.group(1).strip()
        
        # Extract acts
        acts_pattern = r"([A-Za-z\s]+Act,?\s+\d{4})"
        acts_matches = re.findall(acts_pattern, text)
        if acts_matches:
            info['acts'] = list(set(acts_matches))[:5]  # Limit to 5 unique acts
        
        # Extract sections
        sections_pattern = r"[Ss]ection\s+(\d+[A-Z]?)"
        sections_matches = re.findall(sections_pattern, text)
        if sections_matches:
            info['sections'] = list(set(sections_matches))[:10]  # Limit to 10 unique sections
        
        return info
    
    @staticmethod
    def generate_summary(text: str, api_key: Optional[str] = None) -> str:
        """Generate case summary using LLM."""
        
        if not api_key:
            # Mock summary
            return "This case involves legal proceedings between parties. The petition outlines claims and seeks appropriate relief from the court based on applicable laws and precedents."
        
        try:
            client = anthropic.Anthropic(api_key=api_key)
            
            prompt = f"""Generate one paragraph summary for this case with important details.

Petition Text:
{text[:8000]}

Provide a concise one-paragraph summary highlighting:
- The parties involved
- The nature of the dispute
- Key legal issues
- Relief sought

Summary:"""

            message = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=300,
                temperature=0.3,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return message.content[0].text.strip()
            
        except Exception as e:
            print(f"Summary generation error: {e}")
            return "Unable to generate summary. Please review the case details manually."


# OCR Classes (same as before)
class OCRToolSelector:
    @staticmethod
    def select_tool(file_path: Path, file_type: str, file_size: int) -> str:
        if file_type == 'application/pdf':
            try:
                with open(file_path, 'rb') as f:
                    pdf_reader = PyPDF2.PdfReader(f)
                    sample_pages = min(3, len(pdf_reader.pages))
                    total_text = ""
                    
                    for i in range(sample_pages):
                        total_text += pdf_reader.pages[i].extract_text()
                    
                    if len(total_text.strip()) > 100:
                        print(f"✓ Tool Selected: pypdf_text_extract")
                        return 'pypdf_text_extract'
                    else:
                        print(f"✓ Tool Selected: pdf2image_tesseract")
                        return 'pdf2image_tesseract'
            except Exception as e:
                print(f"⚠️  PDF analysis failed: {e}")
                return 'pdf2image_tesseract'
        elif file_type.startswith('image/'):
            print(f"✓ Tool Selected: tesseract_image")
            return 'tesseract_image'
        return 'tesseract_image'


class OCRProcessor:
    @staticmethod
    def extract_text_pypdf(file_path: Path) -> str:
        with open(file_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            text = ""
            for page_num, page in enumerate(pdf_reader.pages):
                text += f"\n--- Page {page_num + 1} ---\n"
                text += page.extract_text()
            return text.strip()
    
    @staticmethod
    def extract_text_tesseract_image(file_path: Path) -> str:
        image = Image.open(file_path)
        if image.mode != 'L':
            image = image.convert('L')
        custom_config = r'--oem 3 --psm 6'
        text = pytesseract.image_to_string(image, config=custom_config)
        return text.strip()
    
    @staticmethod
    def extract_text_pdf2image_tesseract(file_path: Path) -> str:
        with open(file_path, 'rb') as f:
            pdf_bytes = f.read()
        images = convert_from_bytes(pdf_bytes, dpi=300)
        text = ""
        for page_num, image in enumerate(images):
            text += f"\n--- Page {page_num + 1} ---\n"
            if image.mode != 'L':
                image = image.convert('L')
            custom_config = r'--oem 3 --psm 6'
            page_text = pytesseract.image_to_string(image, config=custom_config)
            text += page_text
        return text.strip()
    
    @classmethod
    def process(cls, file_path: Path, tool: str) -> str:
        if tool == 'pypdf_text_extract':
            return cls.extract_text_pypdf(file_path)
        elif tool == 'tesseract_image':
            return cls.extract_text_tesseract_image(file_path)
        elif tool == 'pdf2image_tesseract':
            return cls.extract_text_pdf2image_tesseract(file_path)
        else:
            raise ValueError(f"Unknown OCR tool: {tool}")


class LLMSummarizer:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or ANTHROPIC_API_KEY
        self.client = anthropic.Anthropic(api_key=self.api_key) if self.api_key else None
    
    def summarize(self, text: str, document_name: str) -> Dict[str, Any]:
        if not self.client:
            return self._mock_summary(text)
        
        try:
            prompt = f"""You are a legal document analysis AI assisting lawyers. Analyze the following document and provide a structured summary.

Document Name: {document_name}

Document Text:
{text[:15000]}

Please provide:
1. **Document Type & Classification**
2. **Key Parties**
3. **Critical Dates**
4. **Main Points**
5. **Legal Issues**
6. **Risk Assessment**
7. **Financial Terms**

Format your response in a clear, structured manner."""

            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2000,
                temperature=0.3,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return {
                "success": True,
                "summary": message.content[0].text,
                "model": "claude-3-5-sonnet-20241022",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {"success": False, "error": str(e), "summary": "API Error"}
    
    def _mock_summary(self, text: str) -> Dict[str, Any]:
        return {
            "success": True,
            "summary": "**Document Analysis**: Legal document requiring detailed review.",
            "model": "mock-summarizer",
            "note": "Using mock summary (API key not configured)",
            "timestamp": datetime.now().isoformat()
        }


def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ============ Authentication Routes ============

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "api_configured": bool(ANTHROPIC_API_KEY),
        "timestamp": datetime.now().isoformat()
    })


@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    firm = data.get('firm', '').strip()
    
    if not email or not password or not full_name:
        return jsonify({"error": "Email, password, and full name are required"}), 400
    
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    
    result = UserDB.create_user(email, password, full_name, firm)
    
    if result['success']:
        token = generate_token(email)
        return jsonify({"success": True, "token": token, "user": result['user']}), 201
    else:
        return jsonify({"error": result['error']}), 400


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    result = UserDB.verify_user(email, password)
    
    if result['success']:
        token = generate_token(email)
        return jsonify({"success": True, "token": token, "user": result['user']})
    else:
        return jsonify({"error": result['error']}), 401


@app.route('/api/auth/verify', methods=['GET'])
@token_required
def verify_auth():
    user = UserDB.get_user(request.user_email)
    if user:
        return jsonify({
            "success": True,
            "user": {"email": user['email'], "full_name": user['full_name'], "firm": user['firm']}
        })
    return jsonify({"error": "User not found"}), 404


@app.route('/api/auth/logout', methods=['POST'])
@token_required
def logout():
    return jsonify({"success": True, "message": "Logged out successfully"})


# ============ Cases Routes ============

@app.route('/api/cases', methods=['GET'])
@token_required
def get_cases():
    """Get all cases for the authenticated user."""
    cases = CasesDB.get_user_cases(request.user_email)
    return jsonify({"success": True, "cases": cases})


@app.route('/api/cases/<case_id>', methods=['GET'])
@token_required
def get_case(case_id):
    """Get specific case details."""
    case = CasesDB.get_case(request.user_email, case_id)
    
    if case:
        return jsonify({"success": True, "case": case})
    else:
        return jsonify({"error": "Case not found"}), 404


@app.route('/api/cases/upload-petition', methods=['POST'])
@token_required
def upload_petition():
    """Upload petition and process it to create a case."""
    
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400
    
    try:
        # Save file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        file_path = CASES_FOLDER / unique_filename
        file.save(file_path)
        
        # Determine file type
        file_size = file_path.stat().st_size
        ext = filename.rsplit('.', 1)[1].lower()
        file_type = {
            'pdf': 'application/pdf',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg'
        }.get(ext, 'application/octet-stream')
        
        # Select OCR tool and extract text
        tool_selector = OCRToolSelector()
        selected_tool = tool_selector.select_tool(file_path, file_type, file_size)
        
        processor = OCRProcessor()
        raw_text = processor.process(file_path, selected_tool)
        
        # Extract case information
        extractor = CaseInfoExtractor()
        case_info = extractor.extract_basic_info(raw_text)
        
        # Generate summary
        summary = extractor.generate_summary(raw_text, ANTHROPIC_API_KEY)
        
        # Create case object
        case_data = {
            "petitioner": case_info.get('petitioner', 'Unknown'),
            "respondent": case_info.get('respondent', 'Unknown'),
            "case_type": case_info.get('case_type', 'General'),
            "acts": case_info.get('acts', []),
            "sections": case_info.get('sections', []),
            "court": case_info.get('court', 'Not specified'),
            "status": "Pending",
            "date": datetime.now().strftime('%Y-%m-%d'),
            "summary": summary,
            "raw_text": raw_text,
            "petition_filename": unique_filename,
            "petition_original_name": filename
        }
        
        result = CasesDB.create_case(request.user_email, case_data)
        
        return jsonify({
            "success": True,
            "case_id": result['case_id'],
            "case": result['case'],
            "message": "Case created successfully"
        }), 201
        
    except Exception as e:
        print(f"Error processing petition: {e}")
        return jsonify({"error": f"Failed to process petition: {str(e)}"}), 500


@app.route('/api/cases/<case_id>', methods=['PUT'])
@token_required
def update_case(case_id):
    """Update case details."""
    data = request.json
    
    result = CasesDB.update_case(request.user_email, case_id, data)
    
    if result['success']:
        return jsonify(result)
    else:
        return jsonify({"error": result['error']}), 404


# ============ OCR Routes ============

@app.route('/api/upload', methods=['POST'])
@token_required
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400
    
    try:
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        file_path = UPLOAD_FOLDER / unique_filename
        file.save(file_path)
        
        return jsonify({
            "success": True,
            "filename": unique_filename,
            "original_filename": filename,
            "size": file_path.stat().st_size,
            "type": file.content_type,
            "message": "File uploaded successfully"
        })
    except Exception as e:
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500


@app.route('/api/process-ocr', methods=['POST'])
@token_required
def process_ocr():
    data = request.json
    filename = data.get('filename')
    
    if not filename:
        return jsonify({"error": "Filename required"}), 400
    
    file_path = UPLOAD_FOLDER / filename
    
    if not file_path.exists():
        return jsonify({"error": "File not found"}), 404
    
    try:
        file_size = file_path.stat().st_size
        ext = filename.rsplit('.', 1)[1].lower()
        file_type = {
            'pdf': 'application/pdf',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg'
        }.get(ext, 'application/octet-stream')
        
        tool_selector = OCRToolSelector()
        selected_tool = tool_selector.select_tool(file_path, file_type, file_size)
        
        processor = OCRProcessor()
        ocr_text = processor.process(file_path, selected_tool)
        
        result_filename = f"ocr_{filename.rsplit('.', 1)[0]}.txt"
        result_path = PROCESSED_FOLDER / result_filename
        
        with open(result_path, 'w', encoding='utf-8') as f:
            f.write(ocr_text)
        
        return jsonify({
            "success": True,
            "text": ocr_text,
            "result_filename": result_filename,
            "tool_used": selected_tool,
            "character_count": len(ocr_text),
            "word_count": len(ocr_text.split()),
            "message": "OCR processing completed"
        })
    except Exception as e:
        return jsonify({"error": f"OCR processing failed: {str(e)}"}), 500


@app.route('/api/summarize', methods=['POST'])
@token_required
def summarize_document():
    data = request.json
    text = data.get('text')
    filename = data.get('filename', 'document')
    
    if not text:
        return jsonify({"error": "Text required"}), 400
    
    try:
        summarizer = LLMSummarizer()
        result = summarizer.summarize(text, filename)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/download/<filename>', methods=['GET'])
@token_required
def download_file(filename):
    file_path = PROCESSED_FOLDER / filename
    
    if not file_path.exists():
        return jsonify({"error": "File not found"}), 404
    
    try:
        return send_file(file_path, as_attachment=True, download_name=filename, mimetype='text/plain')
    except Exception as e:
        return jsonify({"error": f"Download failed: {str(e)}"}), 500


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🏛️  LexOCR Backend Server")
    print("="*60)
    print(f"API Key Configured: {bool(ANTHROPIC_API_KEY)}")
    print(f"Upload Folder: {UPLOAD_FOLDER.absolute()}")
    print(f"Cases Folder: {CASES_FOLDER.absolute()}")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
