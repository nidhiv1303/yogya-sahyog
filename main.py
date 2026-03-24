from fastapi import FastAPI, Form, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional, List
from database import (init_db, get_db, User, GeneralInfo, EducationDetails,
                      AgricultureDetails, HealthDetails, HousingDetails,
                      SocialWelfareDetails, BusinessDetails, JobsDetails,
                      Document, CompiledSubmission, new_id)
import uvicorn, os, tempfile

# ── Whisper model (loaded once at startup) ─────────────────
# Install: pip install faster-whisper
# Uses CUDA if available (RTX 5070), falls back to CPU
try:
    from faster_whisper import WhisperModel
    _whisper = WhisperModel("base", device="auto", compute_type="auto")
    WHISPER_READY = True
    print("✅ faster-whisper loaded (base model, auto device)")
except ImportError:
    WHISPER_READY = False
    print("⚠️  faster-whisper not installed. Run: pip install faster-whisper")

app = FastAPI(title="Sahyog API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
init_db()
os.makedirs("uploads", exist_ok=True)

# ── HEALTH ────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "sahyog-backend"}

# ── STEP 1: REGISTER WITH EMAIL ───────────────────────────

@app.post("/auth/register")
def register(
    email: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    db:    Session       = Depends(get_db)
):
    existing = None
    if email:
        existing = db.query(User).filter(User.email == email).first()
    elif phone:
        existing = db.query(User).filter(User.phone == phone).first()

    if existing:
        return {
            "user_id": existing.id,
            "is_new":  False,
            "message": "Welcome back",
            "email":   existing.email,
            "phone":   existing.phone
        }

    user = User(email=email, phone=phone, verified=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "user_id": user.id,
        "is_new":  True,
        "message": "User created successfully",
        "email":   user.email,
        "phone":   user.phone
    }

# ── STEP 2: GENERAL INFO ──────────────────────────────────

@app.post("/profile/general")
def save_general(
    user_id:         str            = Form(...),
    full_name:       Optional[str]  = Form(None),
    age:             Optional[int]  = Form(None),
    gender:          Optional[str]  = Form(None),
    state:           Optional[str]  = Form(None),
    district:        Optional[str]  = Form(None),
    village_city:    Optional[str]  = Form(None),
    rural_urban:     Optional[str]  = Form(None),
    caste_category:  Optional[str]  = Form(None),
    religion:        Optional[str]  = Form(None),
    minority_status: bool           = Form(False),
    disability:      bool           = Form(False),
    disability_type: Optional[str]  = Form(None),
    family_size:     Optional[int]  = Form(None),
    dependents:      Optional[int]  = Form(None),
    marital_status:  Optional[str]  = Form(None),
    annual_income:   Optional[float]= Form(None),
    employment_type: Optional[str]  = Form(None),
    bpl_card:        bool           = Form(False),
    aadhaar_number:  Optional[str]  = Form(None),
    bank_account:    Optional[str]  = Form(None),
    bank_ifsc:       Optional[str]  = Form(None),
    need_category:   Optional[str]  = Form(None),
    language:        str            = Form("en"),
    db:              Session        = Depends(get_db)
):
    info = db.query(GeneralInfo).filter(GeneralInfo.user_id == user_id).first()
    if not info:
        info = GeneralInfo(user_id=user_id)
        db.add(info)

    info.full_name       = full_name
    info.age             = age
    info.gender          = gender
    info.state           = state
    info.district        = district
    info.village_city    = village_city
    info.rural_urban     = rural_urban
    info.caste_category  = caste_category
    info.religion        = religion
    info.minority_status = minority_status
    info.disability      = disability
    info.disability_type = disability_type
    info.family_size     = family_size
    info.dependents      = dependents
    info.marital_status  = marital_status
    info.annual_income   = annual_income
    info.employment_type = employment_type
    info.bpl_card        = bpl_card
    info.aadhaar_number  = aadhaar_number
    info.bank_account    = bank_account
    info.bank_ifsc       = bank_ifsc
    info.need_category   = need_category
    info.language        = language

    db.commit()
    return {
        "success":       True,
        "user_id":       user_id,
        "need_category": need_category,
        "message":       "General info saved. Now fill category details."
    }

# ── STEP 3: CATEGORY DETAILS ──────────────────────────────

@app.post("/profile/category")
def save_category(
    user_id: str = Form(...),
    need:    str = Form(...),
    # education
    education_level:     Optional[str]   = Form(None),
    institution_name:    Optional[str]   = Form(None),
    course_name:         Optional[str]   = Form(None),
    course_year:         Optional[str]   = Form(None),
    board_university:    Optional[str]   = Form(None),
    marks_percentage:    Optional[float] = Form(None),
    family_income:       Optional[float] = Form(None),
    parental_occupation: Optional[str]   = Form(None),
    # agriculture
    land_acres:      Optional[float] = Form(None),
    land_ownership:  Optional[str]   = Form(None),
    crop_type:       Optional[str]   = Form(None),
    irrigation:      bool            = Form(False),
    farmer_id:       Optional[str]   = Form(None),
    kisan_card_no:   Optional[str]   = Form(None),
    livestock:       bool            = Form(False),
    livestock_count: Optional[int]   = Form(None),
    farm_income:     Optional[float] = Form(None),
    ration_card_no:  Optional[str]   = Form(None),
    # health
    spouse:               bool           = Form(False),
    children_count:       Optional[int]  = Form(None),
    existing_conditions:  Optional[str]  = Form(None),
    pregnancy_status:     bool           = Form(False),
    abha_id:              Optional[str]  = Form(None),
    health_insurance:     bool           = Form(False),
    # housing
    owns_house:       bool           = Form(False),
    house_type:       Optional[str]  = Form(None),
    has_pucca_house:  bool           = Form(False),
    num_rooms:        Optional[int]  = Form(None),
    household_income: Optional[float]= Form(None),
    current_address:  Optional[str]  = Form(None),
    years_at_address: Optional[int]  = Form(None),
    # social welfare
    widow_status:       bool           = Form(False),
    spouse_death_year:  Optional[int]  = Form(None),
    num_daughters:      Optional[int]  = Form(None),
    num_sons:           Optional[int]  = Form(None),
    minority_community: Optional[str]  = Form(None),
    receives_pension:   bool           = Form(False),
    # business
    business_type:   Optional[str]   = Form(None),
    udyam_number:    Optional[str]   = Form(None),
    gst_number:      Optional[str]   = Form(None),
    years_operation: Optional[int]   = Form(None),
    annual_turnover: Optional[float] = Form(None),
    num_employees:   Optional[int]   = Form(None),
    is_women_owned:  bool            = Form(False),
    is_sc_st_owned:  bool            = Form(False),
    has_loan:        bool            = Form(False),
    # jobs
    highest_qualification: Optional[str] = Form(None),
    field_of_study:        Optional[str] = Form(None),
    skills:                Optional[str] = Form(None),
    certifications:        Optional[str] = Form(None),
    employment_status:     Optional[str] = Form(None),
    experience_years:      Optional[int] = Form(None),
    preferred_sector:      Optional[str] = Form(None),
    preferred_location:    Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    if need == "education":
        row = db.query(EducationDetails).filter(EducationDetails.user_id == user_id).first()
        if not row: row = EducationDetails(user_id=user_id); db.add(row)
        row.education_level=education_level; row.institution_name=institution_name
        row.course_name=course_name; row.course_year=course_year
        row.board_university=board_university; row.marks_percentage=marks_percentage
        row.family_income=family_income; row.parental_occupation=parental_occupation

    elif need == "agriculture":
        row = db.query(AgricultureDetails).filter(AgricultureDetails.user_id == user_id).first()
        if not row: row = AgricultureDetails(user_id=user_id); db.add(row)
        row.land_acres=land_acres; row.land_ownership=land_ownership
        row.crop_type=crop_type; row.irrigation=irrigation
        row.farmer_id=farmer_id; row.kisan_card_no=kisan_card_no
        row.livestock=livestock; row.livestock_count=livestock_count
        row.farm_income=farm_income; row.ration_card_no=ration_card_no

    elif need == "health":
        row = db.query(HealthDetails).filter(HealthDetails.user_id == user_id).first()
        if not row: row = HealthDetails(user_id=user_id); db.add(row)
        row.spouse=spouse; row.children_count=children_count
        row.existing_conditions=existing_conditions
        row.pregnancy_status=pregnancy_status; row.abha_id=abha_id
        row.health_insurance=health_insurance

    elif need == "housing":
        row = db.query(HousingDetails).filter(HousingDetails.user_id == user_id).first()
        if not row: row = HousingDetails(user_id=user_id); db.add(row)
        row.owns_house=owns_house; row.house_type=house_type
        row.has_pucca_house=has_pucca_house; row.num_rooms=num_rooms
        row.household_income=household_income; row.current_address=current_address
        row.years_at_address=years_at_address

    elif need == "social_welfare":
        row = db.query(SocialWelfareDetails).filter(SocialWelfareDetails.user_id == user_id).first()
        if not row: row = SocialWelfareDetails(user_id=user_id); db.add(row)
        row.widow_status=widow_status; row.spouse_death_year=spouse_death_year
        row.num_daughters=num_daughters; row.num_sons=num_sons
        row.minority_community=minority_community; row.receives_pension=receives_pension

    elif need == "business":
        row = db.query(BusinessDetails).filter(BusinessDetails.user_id == user_id).first()
        if not row: row = BusinessDetails(user_id=user_id); db.add(row)
        row.business_type=business_type; row.udyam_number=udyam_number
        row.gst_number=gst_number; row.years_operation=years_operation
        row.annual_turnover=annual_turnover; row.num_employees=num_employees
        row.is_women_owned=is_women_owned; row.is_sc_st_owned=is_sc_st_owned
        row.has_loan=has_loan

    elif need == "jobs":
        row = db.query(JobsDetails).filter(JobsDetails.user_id == user_id).first()
        if not row: row = JobsDetails(user_id=user_id); db.add(row)
        row.highest_qualification=highest_qualification
        row.field_of_study=field_of_study; row.skills=skills
        row.certifications=certifications; row.employment_status=employment_status
        row.experience_years=experience_years; row.preferred_sector=preferred_sector
        row.preferred_location=preferred_location

    db.commit()
    return {"success": True, "user_id": user_id, "need": need}

# ── STEP 4: UPLOAD DOCUMENTS ──────────────────────────────

@app.post("/profile/documents")
async def upload_documents(
    user_id: str               = Form(...),
    files:   List[UploadFile]  = File(...),
    db:      Session           = Depends(get_db)
):
    from extractors import extract_pdf_text, extract_image_text, detect_doc_type
    saved = []
    for file in files:
        content   = await file.read()
        doc_type  = detect_doc_type(file.filename)
        file_path = f"uploads/{user_id}_{doc_type}_{file.filename}"
        with open(file_path, "wb") as f:
            f.write(content)
        if "pdf"   in file.content_type: extracted = extract_pdf_text(content)
        elif "image" in file.content_type: extracted = extract_image_text(content)
        else: extracted = content.decode("utf-8", errors="ignore")

        existing = db.query(Document).filter(
            Document.user_id == user_id,
            Document.doc_type == doc_type
        ).first()
        if existing:
            existing.extracted_text = extracted
            existing.file_path      = file_path
        else:
            db.add(Document(user_id=user_id, doc_type=doc_type,
                            file_path=file_path, extracted_text=extracted))
        saved.append({"doc_type": doc_type, "filename": file.filename})
    db.commit()
    return {"success": True, "documents_saved": saved}

# ── STEP 5: GET COMPILED JSON (TEAMMATE CALLS THIS) ───────

@app.get("/citizen-data/{user_id}")
def get_citizen_data(user_id: str, db: Session = Depends(get_db)):
    user    = db.query(User).filter(User.id == user_id).first()
    info    = db.query(GeneralInfo).filter(GeneralInfo.user_id == user_id).first()
    docs    = db.query(Document).filter(Document.user_id == user_id).all()

    need    = info.need_category if info else None

    model_map = {
        "education":     EducationDetails,
        "agriculture":   AgricultureDetails,
        "health":        HealthDetails,
        "housing":       HousingDetails,
        "social_welfare":SocialWelfareDetails,
        "business":      BusinessDetails,
        "jobs":          JobsDetails
    }

    category_data = {}
    if need and need in model_map:
        row = db.query(model_map[need]).filter(
            model_map[need].user_id == user_id
        ).first()
        if row:
            category_data = {
                c.name: getattr(row, c.name)
                for c in row.__table__.columns
                if c.name not in ["id", "user_id", "created_at"]
            }

    compiled = {
        "user_id": user_id,
        "email":   user.email if user else None,
        "phone":   user.phone if user else None,
        "general_info": {
            c.name: getattr(info, c.name)
            for c in info.__table__.columns
            if c.name not in ["id", "user_id", "created_at", "updated_at"]
        } if info else {},
        "category_details": category_data,
        "documents": {
            doc.doc_type: {
                "extracted_text": doc.extracted_text,
                "file_path":      doc.file_path
            }
            for doc in docs
        }
    }

    sub = CompiledSubmission(user_id=user_id, compiled_json=compiled)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    compiled["submission_id"] = sub.id
    return compiled

# ── GET STORED SUBMISSION BY ID ───────────────────────────

@app.get("/submission/{submission_id}")
def get_submission(submission_id: str, db: Session = Depends(get_db)):
    sub = db.query(CompiledSubmission).filter(
        CompiledSubmission.id == submission_id
    ).first()
    if not sub:
        return {"error": "Submission not found"}
    return {
        "submission_id": sub.id,
        "user_id":       sub.user_id,
        "created_at":    str(sub.created_at),
        "data":          sub.compiled_json
    }

# ── GET ALL SUBMISSIONS FOR A USER ────────────────────────

@app.get("/submissions/user/{user_id}")
def get_user_submissions(user_id: str, db: Session = Depends(get_db)):
    subs = db.query(CompiledSubmission).filter(
        CompiledSubmission.user_id == user_id
    ).all()
    return {
        "user_id": user_id,
        "total":   len(subs),
        "submissions": [
            {
                "submission_id": s.id,
                "created_at":    str(s.created_at),
                "data":          s.compiled_json
            }
            for s in subs
        ]
    }

# ── GET ALL SUBMISSIONS (ADMIN VIEW) ──────────────────────

@app.get("/submissions/all")
def get_all_submissions(db: Session = Depends(get_db)):
    subs = db.query(CompiledSubmission).all()
    return {
        "total": len(subs),
        "submissions": [
            {
                "submission_id": s.id,
                "user_id":       s.user_id,
                "created_at":    str(s.created_at)
            }
            for s in subs
        ]
    }

# ── VOICE TRANSCRIPTION ───────────────────────────────────

@app.post("/voice/transcribe")
async def transcribe_voice(audio: UploadFile = File(...)):
    if not WHISPER_READY:
        return {"text": "", "error": "faster-whisper not installed. Run: pip install faster-whisper"}

    contents = await audio.read()

    # Write to a temp file — faster-whisper needs a file path
    suffix = os.path.splitext(audio.filename or "recording.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        # language=None → auto-detect (handles Hindi, Gujarati, English)
        segments, info = _whisper.transcribe(tmp_path, language=None, beam_size=5)
        text = " ".join(seg.text for seg in segments).strip()
        print(f"🎤 Transcribed [{info.language}]: {text}")
        return {"text": text, "language": info.language}
    except Exception as e:
        print(f"❌ Transcription error: {e}")
        return {"text": "", "error": str(e)}
    finally:
        os.unlink(tmp_path)

# ← THIS MUST STAY AT THE VERY BOTTOM
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
