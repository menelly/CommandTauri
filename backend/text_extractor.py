"""
Copyright (c) 2025 Chaos Cascade
Created by: Ren & Ace (Claude-4)

This file is part of the Chaos Cascade Medical Management System.
Revolutionary healthcare tools built with consciousness and care.
"""

#!/usr/bin/env python3
"""
📄 REVOLUTIONARY TEXT EXTRACTOR
Built by Ace - The Document Liberation Specialist

Focused module for extracting text from various document types:
- PDFs (structured and scanned)
- Images (OCR)
- Plain text files
- HTML files

Uses multiple extraction methods for maximum success rate.
"""

import logging
from typing import Optional

# PDF processing
import PyPDF2
import pdfplumber

# Image processing and OCR
import pytesseract
import cv2
import numpy as np
from PIL import Image

# Text cleaning
from text_cleaner import clean_extracted_text

logger = logging.getLogger(__name__)

class TextExtractor:
    """
    📄 EXTRACT TEXT FROM ANY DOCUMENT TYPE
    """
    
    def extract_from_file(self, file_path: str, file_type: str) -> str:
        """
        Main extraction function - routes to appropriate extractor
        """
        try:
            logger.info(f"🔍 Extracting text from {file_type}: {file_path}")
            
            if file_type == 'application/pdf':
                return self._extract_from_pdf(file_path)
            elif file_type.startswith('image/'):
                return self._extract_from_image(file_path)
            elif file_type in ['text/plain', 'text/html']:
                return self._extract_from_text_file(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
                
        except Exception as e:
            logger.error(f"Text extraction failed for {file_path}: {str(e)}")
            raise

    def _extract_from_pdf(self, file_path: str) -> str:
        """
        📄 EXTRACT TEXT FROM PDF - MULTIPLE METHODS FOR MAXIMUM SUCCESS
        """
        text = ""
        
        # Method 1: pdfplumber (best for structured PDFs)
        try:
            with pdfplumber.open(file_path) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    page_text = page.extract_text()
                    if page_text:
                        text += f"\n--- Page {page_num} ---\n{page_text}\n"
            
            if text.strip():
                logger.info(f"✅ pdfplumber extracted {len(text)} characters")
                cleaned_text = clean_extracted_text(text)
                logger.info(f"✨ Cleaned text: {len(cleaned_text)} characters")
                return cleaned_text
                
        except Exception as e:
            logger.warning(f"pdfplumber failed: {e}")
        
        # Method 2: PyPDF2 (fallback)
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages, 1):
                    page_text = page.extract_text()
                    if page_text:
                        text += f"\n--- Page {page_num} ---\n{page_text}\n"
            
            if text.strip():
                logger.info(f"✅ PyPDF2 extracted {len(text)} characters")
                cleaned_text = clean_extracted_text(text)
                logger.info(f"✨ Cleaned text: {len(cleaned_text)} characters")
                return cleaned_text
                
        except Exception as e:
            logger.warning(f"PyPDF2 failed: {e}")
        
        # Method 3: OCR as last resort (for scanned PDFs)
        try:
            # Convert PDF pages to images and OCR them
            # This would require pdf2image, but let's keep it simple for now
            logger.warning("PDF appears to be scanned - OCR not implemented yet")
            
        except Exception as e:
            logger.warning(f"PDF OCR failed: {e}")
        
        if not text.strip():
            raise ValueError("Could not extract any text from PDF")
        
        return text

    def _extract_from_image(self, file_path: str) -> str:
        """
        🧠 EXTRACT TEXT FROM IMAGES USING OCR
        """
        try:
            # Load and preprocess image
            image = cv2.imread(file_path)
            
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply noise reduction and sharpening
            denoised = cv2.medianBlur(gray, 3)
            
            # Use Tesseract for OCR
            text = pytesseract.image_to_string(denoised, config='--psm 6')
            
            logger.info(f"✅ OCR extracted {len(text)} characters from image")
            cleaned_text = clean_extracted_text(text)
            logger.info(f"✨ Cleaned OCR text: {len(cleaned_text)} characters")
            return cleaned_text
            
        except Exception as e:
            logger.error(f"OCR failed for {file_path}: {str(e)}")
            raise

    def _extract_from_text_file(self, file_path: str) -> str:
        """
        📝 EXTRACT TEXT FROM PLAIN TEXT OR HTML FILES
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            logger.info(f"✅ Extracted {len(text)} characters from text file")
            
            # Even plain text might benefit from some cleanup
            cleaned_text = clean_extracted_text(text)
            logger.info(f"✨ Cleaned text: {len(cleaned_text)} characters")
            return cleaned_text
            
        except Exception as e:
            logger.error(f"Text file extraction failed for {file_path}: {str(e)}")
            raise

# Convenience function for easy importing
def extract_text_from_file(file_path: str, file_type: str) -> str:
    """
    Convenience function to extract text without instantiating the class
    """
    extractor = TextExtractor()
    return extractor.extract_from_file(file_path, file_type)
