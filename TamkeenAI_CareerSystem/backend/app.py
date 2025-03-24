from flask import Flask, request, jsonify
from core.ats_matcher import analyze_resume
from core.resume_parser import extract_text_from_pdf, extract_text_from_docx
# Import other core modules

app = Flask(__name__)

@app.route('/api/ats-analysis', methods=['POST'])
def ats_analysis():
    # Get the uploaded resume and job description
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided"}), 400
        
    resume_file = request.files['resume']
    job_description = request.form.get('job_description', '')
    job_title = request.form.get('job_title', 'Job Position')
    
    # Check file type and extract text
    cv_text = ""
    file_ext = os.path.splitext(resume_file.filename)[1].lower()
    
    try:
        if file_ext == '.pdf':
            cv_text = extract_text_from_pdf(resume_file)
        elif file_ext in ['.docx', '.doc']:
            cv_text = extract_text_from_docx(resume_file)
        else:
            return jsonify({"error": "Unsupported file format"}), 400
            
        # Analyze resume
        result = analyze_resume(cv_text, job_description, job_title)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Other routes...

if __name__ == '__main__':
    app.run(debug=True)