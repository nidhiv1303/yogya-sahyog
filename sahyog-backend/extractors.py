import pytesseract
import pdfplumber
import io

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_pdf_text(file_bytes: bytes) -> str:
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception as e:
        return f"PDF extraction failed: {str(e)}"

def extract_image_text(file_bytes: bytes) -> str:
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(file_bytes))
        return pytesseract.image_to_string(img, lang="eng+hin")
    except Exception as e:
        return f"Image extraction failed: {str(e)}"

def extract_plain_text(file_bytes: bytes) -> str:
    return file_bytes.decode("utf-8", errors="ignore")

def detect_doc_type(filename: str) -> str:
    fname = filename.lower()
    if "aadhaar" in fname or "aadhar" in fname: return "aadhaar"
    if "pan" in fname:                           return "pan"
    if "income" in fname:                        return "income_certificate"
    if "caste" in fname:                         return "caste_certificate"
    if "land" in fname or "khata" in fname:      return "land_record"
    if "ration" in fname:                        return "ration_card"
    if "bank" in fname or "passbook" in fname:   return "bank_passbook"
    if "disability" in fname:                    return "disability_certificate"
    if "death" in fname:                         return "death_certificate"
    if "marksheet" in fname or "marks" in fname: return "marksheet"
    if "udyam" in fname or "msme" in fname:      return "udyam_certificate"
    return "other"