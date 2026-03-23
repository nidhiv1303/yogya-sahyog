# translator.py
from deep_translator import GoogleTranslator

def translate_to_hindi(text: str) -> str:
    try:
        chunks = [text[i:i+4500] for i in range(0, len(text), 4500)]
        return " ".join(
            GoogleTranslator(source='en', target='hi').translate(c)
            for c in chunks
        )
    except:
        return text

def translate_result(result: dict) -> dict:
    # Translates any text fields found in result
    # Works no matter what shape teammate returns
    def translate_value(v):
        if isinstance(v, str):
            return translate_to_hindi(v)
        elif isinstance(v, list):
            return [translate_value(i) for i in v]
        elif isinstance(v, dict):
            return {k: translate_value(val) for k, val in v.items()}
        return v

    return translate_value(result)