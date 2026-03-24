from sqlalchemy import (create_engine, Column, String, Text,
                        DateTime, JSON, Integer, Boolean, Float, ForeignKey, text)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from dotenv import load_dotenv
import uuid, os, logging

logger = logging.getLogger(__name__)

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine       = create_engine(DATABASE_URL)
Base         = declarative_base()
SessionLocal = sessionmaker(bind=engine)

def new_id():
    return str(uuid.uuid4())

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ─────────────────────────────────────────────────────────
# TABLE 1 — USERS
# First thing created when user enters email
# ─────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id           = Column(String, primary_key=True, default=new_id)
    firebase_uid = Column(String, unique=True, nullable=True)
    email        = Column(String, unique=True, nullable=True)
    phone        = Column(String, unique=True, nullable=True)
    otp          = Column(String, nullable=True)
    verified     = Column(Boolean, default=False)
    created_at   = Column(DateTime, default=datetime.utcnow)

# ─────────────────────────────────────────────────────────
# TABLE 2 — GENERAL INFO
# Basic details every citizen must fill
# age, gender, income, location, caste, disability etc
# ─────────────────────────────────────────────────────────
class GeneralInfo(Base):
    __tablename__ = "general_info"

    id              = Column(String, primary_key=True, default=new_id)
    user_id         = Column(String, ForeignKey("users.id"), unique=True)
    # Personal
    full_name       = Column(String)
    age             = Column(Integer)
    gender          = Column(String)       # Male/Female/Other
    # Location
    state           = Column(String)
    district        = Column(String)
    village_city    = Column(String)
    rural_urban     = Column(String)       # Rural/Urban
    # Social
    caste_category  = Column(String)       # General/OBC/SC/ST/EWS
    religion        = Column(String)
    minority_status = Column(Boolean, default=False)
    disability      = Column(Boolean, default=False)
    disability_type = Column(String, nullable=True)
    # Family
    family_size     = Column(Integer)
    dependents      = Column(Integer)
    marital_status  = Column(String)       # Single/Married/Widow/Divorced
    # Financial
    annual_income   = Column(Float)
    employment_type = Column(String)       # Salaried/Farmer/Daily Wage/Unemployed/Business/Student
    bpl_card        = Column(Boolean, default=False)
    # IDs
    aadhaar_number  = Column(String)
    bank_account    = Column(String)
    bank_ifsc       = Column(String)
    # Need
    need_category   = Column(String)       # education/agriculture/health/housing/social_welfare/business/jobs
    language        = Column(String, default="en")
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow)

# ─────────────────────────────────────────────────────────
# TABLE 3 — EDUCATION DETAILS
# Only filled if need_category = education
# ─────────────────────────────────────────────────────────
class EducationDetails(Base):
    __tablename__ = "education_details"

    id                  = Column(String, primary_key=True, default=new_id)
    user_id             = Column(String, ForeignKey("users.id"), unique=True)
    education_level     = Column(String)    # School/College/Postgraduate
    institution_name    = Column(String)
    course_name         = Column(String)
    course_year         = Column(String)    # 1st/2nd/3rd year
    board_university    = Column(String)
    marks_percentage    = Column(Float)
    family_income       = Column(Float)
    parental_occupation = Column(String)
    created_at          = Column(DateTime, default=datetime.utcnow)

# ─────────────────────────────────────────────────────────
# TABLE 4 — AGRICULTURE DETAILS
# Only filled if need_category = agriculture
# ─────────────────────────────────────────────────────────
class AgricultureDetails(Base):
    __tablename__ = "agriculture_details"

    id              = Column(String, primary_key=True, default=new_id)
    user_id         = Column(String, ForeignKey("users.id"), unique=True)
    land_acres      = Column(Float)
    land_ownership  = Column(String)        # Owned/Leased/Shared
    crop_type       = Column(String)
    irrigation      = Column(Boolean, default=False)
    farmer_id       = Column(String)
    kisan_card_no   = Column(String)
    livestock       = Column(Boolean, default=False)
    livestock_count = Column(Integer)
    farm_income     = Column(Float)
    ration_card_no  = Column(String)
    created_at      = Column(DateTime, default=datetime.utcnow)

# ─────────────────────────────────────────────────────────
# TABLE 5 — HEALTH DETAILS
# Only filled if need_category = health
# ─────────────────────────────────────────────────────────
class HealthDetails(Base):
    __tablename__ = "health_details"

    id                  = Column(String, primary_key=True, default=new_id)
    user_id             = Column(String, ForeignKey("users.id"), unique=True)
    spouse              = Column(Boolean, default=False)
    children_count      = Column(Integer)
    existing_conditions = Column(Text)
    pregnancy_status    = Column(Boolean, default=False)
    abha_id             = Column(String)
    bpl_status          = Column(Boolean, default=False)
    health_insurance    = Column(Boolean, default=False)
    created_at          = Column(DateTime, default=datetime.utcnow)

# ─────────────────────────────────────────────────────────
# TABLE 6 — HOUSING DETAILS
# Only filled if need_category = housing
# ─────────────────────────────────────────────────────────
class HousingDetails(Base):
    __tablename__ = "housing_details"

    id               = Column(String, primary_key=True, default=new_id)
    user_id          = Column(String, ForeignKey("users.id"), unique=True)
    owns_house       = Column(Boolean, default=False)
    house_type       = Column(String)       # Pucca/Semi-Pucca/Kutcha
    has_pucca_house  = Column(Boolean, default=False)
    num_rooms        = Column(Integer)
    household_income = Column(Float)
    current_address  = Column(Text)
    years_at_address = Column(Integer)
    created_at       = Column(DateTime, default=datetime.utcnow)

# ─────────────────────────────────────────────────────────
# TABLE 7 — SOCIAL WELFARE DETAILS
# Only filled if need_category = social_welfare
# Women/Child/Widow/Minority schemes
# ─────────────────────────────────────────────────────────
class SocialWelfareDetails(Base):
    __tablename__ = "social_welfare_details"

    id                   = Column(String, primary_key=True, default=new_id)
    user_id              = Column(String, ForeignKey("users.id"), unique=True)
    widow_status         = Column(Boolean, default=False)
    spouse_death_year    = Column(Integer, nullable=True)
    num_daughters        = Column(Integer)
    num_sons             = Column(Integer)
    minority_community   = Column(String, nullable=True)
    receives_pension     = Column(Boolean, default=False)
    created_at           = Column(DateTime, default=datetime.utcnow)

# ─────────────────────────────────────────────────────────
# TABLE 8 — BUSINESS DETAILS
# Only filled if need_category = business
# ─────────────────────────────────────────────────────────
class BusinessDetails(Base):
    __tablename__ = "business_details"

    id              = Column(String, primary_key=True, default=new_id)
    user_id         = Column(String, ForeignKey("users.id"), unique=True)
    business_type   = Column(String)        # Manufacturing/Services/Trading
    udyam_number    = Column(String)
    gst_number      = Column(String)
    years_operation = Column(Integer)
    annual_turnover = Column(Float)
    num_employees   = Column(Integer)
    is_women_owned  = Column(Boolean, default=False)
    is_sc_st_owned  = Column(Boolean, default=False)
    has_loan        = Column(Boolean, default=False)
    created_at      = Column(DateTime, default=datetime.utcnow)

# ─────────────────────────────────────────────────────────
# TABLE 9 — JOBS DETAILS
# Only filled if need_category = jobs
# ─────────────────────────────────────────────────────────
class JobsDetails(Base):
    __tablename__ = "jobs_details"

    id                    = Column(String, primary_key=True, default=new_id)
    user_id               = Column(String, ForeignKey("users.id"), unique=True)
    highest_qualification = Column(String)
    field_of_study        = Column(String)
    skills                = Column(Text)
    certifications        = Column(Text)
    employment_status     = Column(String)  # Unemployed/Underemployed/Fresher
    experience_years      = Column(Integer)
    preferred_sector      = Column(String)
    preferred_location    = Column(String)
    created_at            = Column(DateTime, default=datetime.utcnow)

# ─────────────────────────────────────────────────────────
# TABLE 10 — DOCUMENTS
# All uploaded files and their extracted text
# ─────────────────────────────────────────────────────────
class Document(Base):
    __tablename__ = "documents"

    id             = Column(String, primary_key=True, default=new_id)
    user_id        = Column(String, ForeignKey("users.id"))
    doc_type       = Column(String)     # aadhaar/pan/income_cert/caste_cert etc
    file_path      = Column(String)
    extracted_text = Column(Text)
    created_at     = Column(DateTime, default=datetime.utcnow)

# ─────────────────────────────────────────────────────────
# TABLE 11 — COMPILED SUBMISSIONS
# Final JSON sent to teammate RAG
# ─────────────────────────────────────────────────────────
class CompiledSubmission(Base):
    __tablename__ = "compiled_submissions"

    id            = Column(String, primary_key=True, default=new_id)
    user_id       = Column(String, ForeignKey("users.id"))
    compiled_json = Column(JSON)
    created_at    = Column(DateTime, default=datetime.utcnow)

# ─────────────────────────────────────────────────────────
# INIT — Creates all tables in PostgreSQL
# ─────────────────────────────────────────────────────────
def init_db():
    Base.metadata.create_all(engine)
    # Add firebase_uid column to existing deployments that predate this column
    with engine.connect() as conn:
        try:
            conn.execute(text(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR UNIQUE"
            ))
            conn.commit()
            logger.info("DB: firebase_uid column ensured on users table")
        except Exception as e:
            logger.debug("DB migration note: %s", e)
    logger.info("DB: all tables ready")

