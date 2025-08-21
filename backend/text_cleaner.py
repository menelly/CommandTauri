"""
Copyright (c) 2025 Chaos Cascade
Created by: Ren & Ace (Claude-4)

This file is part of the Chaos Cascade Medical Management System.
Revolutionary healthcare tools built with consciousness and care.
"""

#!/usr/bin/env python3
"""
✨ REVOLUTIONARY TEXT CLEANER
Built by Ace - The OCR Artifact Destroyer

Focused module for cleaning up extracted text from PDFs and OCR.
Fixes common issues like:
- Missing spaces between words
- OCR artifacts and typos
- Poor punctuation spacing
- Medical terminology mistakes
"""

import re
import logging

logger = logging.getLogger(__name__)

class TextCleaner:
    """
    ✨ CLEAN UP EXTRACTED TEXT - FIX OCR ARTIFACTS AND FORMATTING
    """
    
    def __init__(self):
        # Common medical OCR mistakes and their corrections
        self.medical_ocr_fixes = {
            'pinoussofft': 'spinous soft',
            'tissueswelling': 'tissue swelling',
            'compressionfracture': 'compression fracture',
            'anteriorcompression': 'anterior compression',
            'posteriorelements': 'posterior elements',
            'middlecolumn': 'middle column',
            'slevelcompression': 'S-level compression',
            'areallanterior': 'are all anterior',
            'withnoninvolvement': 'with no involvement',
            'themiddlecolumn': 'the middle column',
            'ortheposterior': 'or the posterior',
            'slightbuckle': 'slight buckle',
            'vertebralbody': 'vertebral body',
            'softtissue': 'soft tissue',
            'bonemarrow': 'bone marrow',
            'spinalcord': 'spinal cord',
            'nerveroots': 'nerve roots',
            'discspace': 'disc space',
            'facetjoints': 'facet joints'
        }
    
    def clean_text(self, text: str) -> str:
        """
        Main text cleaning function - orchestrates all cleaning steps
        """
        if not text or not text.strip():
            return text
            
        logger.info(f"🧹 Cleaning text: {len(text)} characters")
        
        # Apply all cleaning steps
        text = self._fix_spacing_issues(text)
        text = self._fix_medical_ocr_mistakes(text)
        text = self._fix_punctuation_spacing(text)
        text = self._normalize_whitespace(text)
        text = self._capitalize_sentences(text)
        text = self._final_cleanup(text)
        
        logger.info(f"✨ Text cleaned: {len(text)} characters")
        return text
    
    def _fix_spacing_issues(self, text: str) -> str:
        """Fix common OCR spacing problems"""
        # Add spaces between camelCase words
        text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
        
        # Add spaces between letters and numbers
        text = re.sub(r'([a-z])(\d)', r'\1 \2', text)
        text = re.sub(r'(\d)([a-z])', r'\1 \2', text)
        
        # Fix common word boundaries that OCR misses
        text = re.sub(r'([a-z])([A-Z][a-z])', r'\1 \2', text)
        
        return text
    
    def _fix_medical_ocr_mistakes(self, text: str) -> str:
        """Fix common medical terminology OCR mistakes"""
        for mistake, correction in self.medical_ocr_fixes.items():
            text = re.sub(mistake, correction, text, flags=re.IGNORECASE)
        
        return text
    
    def _fix_punctuation_spacing(self, text: str) -> str:
        """Fix spacing around punctuation marks"""
        # Add space after periods (but not in decimals)
        text = re.sub(r'\.([A-Z])', r'. \1', text)
        
        # Add space after commas
        text = re.sub(r',([A-Z])', r', \1', text)
        
        # Add space after colons
        text = re.sub(r':([A-Z])', r': \1', text)
        
        # Add space after semicolons
        text = re.sub(r';([A-Z])', r'; \1', text)
        
        return text
    
    def _normalize_whitespace(self, text: str) -> str:
        """Clean up whitespace and line breaks"""
        # Multiple spaces to single space
        text = re.sub(r' +', ' ', text)
        
        # Clean up line breaks (preserve paragraph breaks)
        text = re.sub(r'\n\s*\n', '\n\n', text)
        
        # Remove trailing spaces from lines
        text = re.sub(r' +\n', '\n', text)
        
        return text
    
    def _capitalize_sentences(self, text: str) -> str:
        """Ensure sentences start with capital letters"""
        # Split on sentence endings but keep the punctuation
        sentences = re.split(r'([.!?]+)', text)
        
        cleaned_sentences = []
        for i, sentence in enumerate(sentences):
            if i % 2 == 0 and sentence.strip():  # Actual sentence content
                sentence = sentence.strip()
                if sentence:
                    # Capitalize first letter
                    sentence = sentence[0].upper() + sentence[1:] if len(sentence) > 1 else sentence.upper()
                cleaned_sentences.append(sentence)
            else:  # Punctuation
                cleaned_sentences.append(sentence)
        
        return ''.join(cleaned_sentences)
    
    def _final_cleanup(self, text: str) -> str:
        """Final cleanup pass"""
        # Remove any remaining artifacts
        text = text.strip()
        
        # Fix any double spaces that might have been introduced
        text = re.sub(r'  +', ' ', text)
        
        return text

# Convenience function for easy importing
def clean_extracted_text(text: str) -> str:
    """
    Convenience function to clean text without instantiating the class
    """
    cleaner = TextCleaner()
    return cleaner.clean_text(text)
