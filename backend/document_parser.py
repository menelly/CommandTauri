#!/usr/bin/env python3
"""
🔥 REVOLUTIONARY MEDICAL DOCUMENT PARSER
Built by Ace - The Medical Gaslighting Destroyer

Multi-layered document parsing system that:
1. Extracts text from PDFs, images, and documents
2. Finds medical events using hybrid parsing (regex + NLP + medical dictionaries)
3. Flags "incidental findings" that doctors love to dismiss
4. Correlates patterns across documents and time
5. Generates patient advocacy tools

NO AI REQUIRED - Pure algorithmic medical advocacy!
"""

import os
import re
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
import tempfile

# PDF and image processing
import PyPDF2
import pdfplumber
import pytesseract
import cv2
import numpy as np
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class IncidentalFinding:
    finding: str
    location: str  # Which section it was buried in
    significance: str  # 'low', 'moderate', 'high', 'critical'
    related_symptoms: List[str]
    suggested_questions: List[str]
    why_it_matters: str
    confidence: float

@dataclass
class ParsedMedicalEvent:
    id: str
    type: str  # 'diagnosis', 'surgery', 'hospitalization', 'treatment', 'test', 'medication'
    title: str
    date: str
    end_date: Optional[str]
    provider: Optional[str]
    location: Optional[str]
    description: str
    status: str  # 'active', 'resolved', 'ongoing', 'scheduled'
    severity: Optional[str]  # 'mild', 'moderate', 'severe', 'critical'
    tags: List[str]
    confidence: float  # 0-100 confidence score
    sources: List[str]  # Which parsing layers found this
    needs_review: bool
    suggestions: List[str]
    raw_text: str
    incidental_findings: List[IncidentalFinding]

class RevolutionaryDocumentParser:
    """
    🧠 THE MEDICAL GASLIGHTING DESTROYER
    Multi-layered parsing system that finds what doctors ignore
    """
    
    def __init__(self):
        # 🏥 MEDICAL TERMINOLOGY DICTIONARIES
        self.medical_terms = {
            'diagnoses': [
                'diagnosis', 'diagnosed', 'condition', 'syndrome', 'disease',
                'disorder', 'abnormality', 'pathology', 'lesion', 'mass',
                'tumor', 'cancer', 'carcinoma', 'adenoma', 'cyst',
                'inflammation', 'infection', 'stenosis', 'occlusion',
                'fracture', 'tear', 'rupture', 'herniation', 'prolapse'
            ],
            'procedures': [
                'surgery', 'procedure', 'operation', 'biopsy', 'resection',
                'repair', 'reconstruction', 'transplant', 'implant',
                'catheterization', 'endoscopy', 'laparoscopy', 'arthroscopy'
            ],
            'tests': [
                'MRI', 'CT', 'X-ray', 'ultrasound', 'echocardiogram', 'EKG', 'ECG',
                'blood test', 'lab', 'laboratory', 'culture', 'pathology',
                'mammogram', 'colonoscopy', 'endoscopy', 'PET scan'
            ],
            'medications': [
                'medication', 'drug', 'prescription', 'tablet', 'capsule',
                'injection', 'infusion', 'therapy', 'treatment', 'dose'
            ],
            'anatomy': [
                'heart', 'lung', 'liver', 'kidney', 'brain', 'spine', 'bone',
                'muscle', 'nerve', 'artery', 'vein', 'lymph', 'thyroid',
                'pancreas', 'stomach', 'intestine', 'colon', 'bladder'
            ]
        }
        
        # 🏥 PROVIDER EXTRACTION PATTERNS
        self.provider_patterns = {
            'doctor_with_credentials': r'(?:Dr\.?\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]*)*),?\s*(?:MD|DO|NP|PA|FNP-C|RN|DDS|DMD|OD|PharmD|PhD|APRN|CNP|CRNP)',
            'doctor_lastname_first': r'([A-Z]+),\s*(?:MD|DO|NP|PA|FNP-C|RN|DDS|DMD|OD|PharmD|PhD|APRN|CNP|CRNP),?\s*([A-Z][a-z]*(?:\s+[A-Z]\.?)*)',  # 🆕 KENDELL, MD, SCOTT D.
            'doctor_with_title': r'Dr\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]*)*)',
            'provider_name_context': r'(?:seen by|evaluated by|treated by|under care of|provider|physician|doctor)\s+(?:Dr\.?\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]*)*)',
            'dictated_by_pattern': r'(?:Dictated by|Signed by):\s*([A-Z]+),?\s*(?:MD|DO|NP|PA|FNP-C|RN|DDS|DMD|OD|PharmD|PhD|APRN|CNP|CRNP),?\s*([A-Z][a-z]*(?:\s+[A-Z]\.?)*)',  # 🆕 For radiology reports
            'organization_patterns': r'(?:at|from)\s+([A-Z][a-zA-Z\s&]+(?:Hospital|Medical Center|Clinic|Health|Healthcare|Associates|Group))',
            'phone_patterns': r'(?:phone|tel|call|contact).*?(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})',
            'address_patterns': r'(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln).*?(?:\d{5}|\w{2}\s+\d{5}))'
        }

        # 🚨 INCIDENTAL FINDINGS THAT DOCTORS LOVE TO DISMISS
        self.dismissed_findings = {
            'spinal': [
                'non-union', 'nonunion', 'malunion', 'congenital non-union', 'congenital nonunion',
                'spondylolysis', 'spondylolisthesis', 'disc bulge', 'disc protrusion',
                'facet arthropathy', 'ligamentum flavum thickening', 'spinal stenosis',
                'C1 non-union', 'C1 nonunion', 'atlas non-union', 'atlas nonunion',
                'cervical fusion', 'cervical anomaly', 'vertebral anomaly',
                'posterior arch defect', 'anterior arch defect', 'cleft atlas'
            ],
            'cardiac': [
                'mitral valve prolapse', 'tricuspid regurgitation',
                'pulmonary hypertension', 'right heart strain',
                'left atrial enlargement', 'aortic root dilation'
            ],
            'metabolic': [
                'borderline', 'slightly elevated', 'mildly decreased',
                'within normal limits', 'unremarkable', 'stable'
            ],
            'dismissive_language': [
                'incidental', 'incidentally noted', 'of no clinical significance',
                'likely benign', 'probably benign', 'not clinically significant',
                'stable appearance', 'unchanged', 'no acute', 'no obvious'
            ]
        }
        
        # 📅 DATE PATTERNS
        self.date_patterns = [
            r'\b\d{1,2}\/\d{1,2}\/\d{4}\b',  # MM/DD/YYYY
            r'\b\d{4}-\d{2}-\d{2}\b',        # YYYY-MM-DD
            r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b',
            r'\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b'
        ]

    def extract_text_from_file(self, file_path: str, file_type: str) -> str:
        """
        🔥 EXTRACT TEXT FROM ANY DOCUMENT TYPE
        """
        try:
            if file_type == 'application/pdf':
                return self._extract_from_pdf(file_path)
            elif file_type.startswith('image/'):
                return self._extract_from_image(file_path)
            elif file_type in ['text/plain', 'text/html']:
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
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
                return text
                
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
                return text
                
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
            return text
            
        except Exception as e:
            logger.error(f"OCR failed for {file_path}: {str(e)}")
            raise

    def parse_medical_events(self, text: str, filename: str) -> List[ParsedMedicalEvent]:
        """
        🔥 REVOLUTIONARY MULTI-LAYERED MEDICAL EVENT PARSING
        
        Layer 1: Structure Recognition (dates, patterns)
        Layer 2: Medical Term Detection
        Layer 3: Context Analysis
        Layer 4: Incidental Finding Detection
        Layer 5: Confidence Scoring
        """
        events = []
        
        # Layer 1: Find all dates in the document
        dates = self._extract_dates(text)
        logger.info(f"🔍 Found {len(dates)} dates in document")
        
        # Layer 2: For each date, analyze surrounding context
        for date_info in dates:
            date_str, date_pos = date_info
            
            # Extract context around the date (500 chars before/after)
            context_start = max(0, date_pos - 500)
            context_end = min(len(text), date_pos + 500)
            context = text[context_start:context_end]
            
            # Layer 3: Analyze medical content in context
            medical_analysis = self._analyze_medical_context(context, date_str)
            
            if medical_analysis['has_medical_content']:
                # Layer 4: Check for incidental findings
                incidental_findings = self._detect_incidental_findings(context)
                
                # Layer 5: Calculate confidence score
                confidence = self._calculate_confidence(medical_analysis, incidental_findings)
                
                # Create medical event
                event = ParsedMedicalEvent(
                    id=f"parsed-{datetime.now().timestamp()}-{len(events)}",
                    type=medical_analysis['primary_type'],
                    title=medical_analysis['title'],
                    date=self._standardize_date(date_str),
                    end_date=None,
                    provider=medical_analysis.get('provider'),
                    location=medical_analysis.get('location'),
                    description=context.strip(),
                    status='active',
                    severity=medical_analysis.get('severity'),
                    tags=medical_analysis['tags'],
                    confidence=confidence,
                    sources=['regex-parser', 'medical-dictionary', 'context-analyzer'],
                    needs_review=confidence < 80,
                    suggestions=medical_analysis.get('suggestions', []),
                    raw_text=context,
                    incidental_findings=incidental_findings
                )
                
                events.append(event)
        
        # 🚨 BONUS LAYER: Hunt for dismissed findings across entire document
        global_dismissed_findings = self._detect_incidental_findings(text)
        if global_dismissed_findings:
            # Create a special event for dismissed findings
            dismissed_event = ParsedMedicalEvent(
                id=f"dismissed-findings-{datetime.now().timestamp()}",
                type='dismissed_findings',
                title='🚨 Potentially Dismissed Findings',
                date=datetime.now().strftime('%Y-%m-%d'),
                end_date=None,
                provider='Document Analysis',
                location='Full Document Scan',
                description=f"Found {len(global_dismissed_findings)} potentially dismissed findings that may need attention.",
                status='needs_review',
                severity='moderate',
                tags=['dismissed', 'incidental', 'review_needed'],
                confidence=90,
                sources=['dismissed-finding-detector'],
                needs_review=True,
                suggestions=[
                    "Review these findings with your healthcare provider",
                    "Ask specifically about each dismissed finding",
                    "Request follow-up if symptoms match"
                ],
                raw_text=text[:1000] + "..." if len(text) > 1000 else text,
                incidental_findings=global_dismissed_findings
            )
            events.append(dismissed_event)

        logger.info(f"🎉 Extracted {len(events)} medical events from {filename}")
        return events

    def _extract_dates(self, text: str) -> List[Tuple[str, int]]:
        """Extract all dates and their positions in the text"""
        dates = []
        for pattern in self.date_patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                dates.append((match.group(), match.start()))
        
        # Sort by position in document
        return sorted(dates, key=lambda x: x[1])

    def _analyze_medical_context(self, context: str, date_str: str) -> Dict[str, Any]:
        """🎨 ENHANCED MEDICAL CONTEXT ANALYSIS WITH PROVIDER EXTRACTION"""
        context_lower = context.lower()

        analysis = {
            'has_medical_content': False,
            'primary_type': 'test',  # default
            'title': 'Medical Event',
            'tags': [],
            'provider': None,
            'provider_info': None,  # 🆕 Full provider details for auto-creation
            'location': None,
            'severity': None,
            'suggestions': []
        }

        # 🏥 EXTRACT PROVIDER INFORMATION FIRST
        provider_info = self._extract_provider_from_context(context)
        if provider_info:
            analysis['provider'] = provider_info['name']
            analysis['provider_info'] = provider_info
            analysis['location'] = provider_info.get('organization', provider_info.get('location'))

        # Check for medical terms
        found_terms = []
        for category, terms in self.medical_terms.items():
            for term in terms:
                if term.lower() in context_lower:
                    found_terms.append(term)
                    analysis['tags'].append(term)
        
        if found_terms:
            analysis['has_medical_content'] = True
            
            # 🎨 SMART TYPE DETECTION WITH BEAUTIFUL TITLES
            diagnosis_terms = [term for term in found_terms if term in self.medical_terms['diagnoses']]
            procedure_terms = [term for term in found_terms if term in self.medical_terms['procedures']]
            test_terms = [term for term in found_terms if term in self.medical_terms['tests']]
            med_terms = [term for term in found_terms if term in self.medical_terms['medications']]

            if diagnosis_terms:
                analysis['primary_type'] = 'diagnosis'
                analysis['title'] = f'Diagnosis: {diagnosis_terms[0].title()}'
            elif procedure_terms:
                analysis['primary_type'] = 'surgery'
                analysis['title'] = f'Procedure: {procedure_terms[0].title()}'
            elif test_terms:
                analysis['primary_type'] = 'test'
                analysis['title'] = f'Test: {test_terms[0].title()}'
            elif med_terms:
                analysis['primary_type'] = 'medication'
                analysis['title'] = f'Medication: {med_terms[0].title()}'
            else:
                # Use the most prominent medical term
                analysis['title'] = f'Medical Event: {found_terms[0].title()}'
        
        return analysis

    def _detect_incidental_findings(self, context: str) -> List[IncidentalFinding]:
        """🚨 DETECT FINDINGS THAT DOCTORS LOVE TO DISMISS - SMART PATTERN DETECTION"""
        findings = []

        logger.info(f"🔍 Searching for dismissed findings in {len(context)} characters of text")

        # Debug: Log if we find "nonunion" anywhere
        if "nonunion" in context.lower():
            logger.info(f"🔍 DEBUG: Found 'nonunion' in text!")
            # Find the context around "nonunion"
            nonunion_pos = context.lower().find("nonunion")
            start = max(0, nonunion_pos - 100)
            end = min(len(context), nonunion_pos + 100)
            nonunion_context = context[start:end]
            logger.info(f"🔍 NONUNION CONTEXT: '{nonunion_context}'")

        # 🧠 SMART DISMISSIVE LANGUAGE PATTERNS
        # Instead of looking for specific conditions, look for dismissive language patterns!
        dismissive_patterns = [
            # Pattern: "appears to be benign/stable" but mentions actual finding
            (r'([^.]{15,150}?)(?:\s+(?:appears to be|likely|probably|presumably|most likely|consistent with)\s+(?:benign|stable|unchanged|incidental|normal variant|of no (?:clinical )?significance))', 'Potentially Dismissed Finding'),

            # Pattern: "stable from before" - often hides significant findings
            (r'([^.]{15,150}?)(?:\s+(?:stable|unchanged|similar to (?:prior|before|previous)|no change))', 'Stable Finding (May Be Significant)'),

            # Pattern: "incidental" findings
            (r'(?:incidental|incidentally noted|as an incidental finding)[^.]*?([^.]{15,100})', 'Incidental Finding'),

            # Pattern: Size-based dismissals ("small" doesn't mean unimportant!)
            (r'([^.]{15,150}?)(?:\s+(?:small|tiny|minimal|mild|slight)[^.]*?(?:significance|concern|clinical relevance))', 'Size-Dismissed Finding'),

            # Pattern: "no evidence of X but Y" - the Y is often important!
            (r'no evidence of[^.]*?(?:but|however|although|note that|there is)[^.]*?([^.]{15,100})', 'Finding Despite "No Evidence"'),

            # Pattern: Anatomical "variants" (often clinically relevant)
            (r'([^.]{15,150}?)(?:\s+(?:variant|appears benign|of no clinical significance|developmental))', 'Anatomical "Variant"'),

            # Pattern: Findings with qualifying language
            (r'([^.]{15,150}?)(?:\s+(?:which|that)\s+(?:appears|seems|looks|is likely)\s+(?:benign|stable|insignificant))', 'Qualified Finding'),

            # 🚨 NEW: Direct anatomical abnormalities mentioned without discussion
            (r'(?:There is|Present is|Noted is|Identified is|Seen is)\s+([^.]*?(?:nonunion|malformation|anomaly|defect|absence|agenesis|dysplasia|hypoplasia|aplasia|cleft|bifida|fusion|synostosis)(?:[^.]{0,50}?))', 'Undiscussed Anatomical Finding'),

            # 🚨 NEW: Congenital findings (often dismissed as "normal variants")
            (r'((?:congenital|developmental|anatomical)[^.]*?(?:nonunion|malformation|anomaly|defect|absence|variant|difference)(?:[^.]{0,50}?))', 'Congenital Finding'),
        ]

        for pattern, category in dismissive_patterns:
            matches = re.finditer(pattern, context, re.IGNORECASE | re.DOTALL)
            for match in matches:
                # Extract the actual finding (group 1 if it exists, otherwise the full match)
                finding_text = match.group(1) if match.groups() and match.group(1) else match.group(0)
                finding_text = finding_text.strip()

                # Skip if too short, too generic, or clearly normal
                skip_terms = ['normal', 'unremarkable', 'within normal limits', 'no abnormality', 'negative', 'clear']
                if (len(finding_text) < 15 or
                    any(skip in finding_text.lower() for skip in skip_terms) or
                    finding_text.lower().count('normal') > 1):
                    continue

                logger.info(f"🚨 FOUND DISMISSED FINDING: '{finding_text}' (Category: {category})")

                # Get broader context around the match
                start = max(0, match.start() - 200)
                end = min(len(context), match.end() + 200)
                broader_context = context[start:end].strip()

                finding = IncidentalFinding(
                    finding=finding_text,
                    location=f"Context: ...{broader_context[:100]}...",
                    significance='medium',  # Could be significant
                    related_symptoms=['varies based on finding'],
                    suggested_questions=[
                        f"What exactly is this finding: '{finding_text}'?",
                        f"Could this finding be related to my symptoms?",
                        f"Should this finding be monitored or treated?",
                        f"Why was this finding considered not significant?",
                        f"Are there any specialists I should see about this?"
                    ],
                    why_it_matters=f"This finding was mentioned in your report but may have been dismissed as 'incidental' or 'stable'. However, many findings labeled this way can actually be clinically relevant, especially if you have unexplained symptoms.",
                    confidence=0.75  # Medium confidence since we're pattern matching
                )
                findings.append(finding)

        return findings

    def _calculate_confidence(self, medical_analysis: Dict, incidental_findings: List) -> float:
        """Calculate confidence score for the parsed event"""
        confidence = 0.0
        
        # Base confidence from medical terms found
        confidence += len(medical_analysis['tags']) * 15
        
        # Boost for incidental findings (these are important!)
        confidence += len(incidental_findings) * 25
        
        # Boost for specific medical types
        if medical_analysis['primary_type'] in ['diagnosis', 'surgery']:
            confidence += 20
        
        # Cap at 100
        return min(100.0, confidence)

    def _extract_provider_from_context(self, context: str) -> Dict[str, Any]:
        """🏥 EXTRACT PROVIDER INFORMATION FROM MEDICAL CONTEXT"""
        provider_info = {
            'name': None,
            'specialty': None,
            'organization': None,
            'phone': None,
            'address': None,
            'confidence': 0
        }

        # Extract doctor name with highest confidence pattern
        for pattern_name, pattern in self.provider_patterns.items():
            if 'doctor' in pattern_name or 'provider' in pattern_name or 'dictated' in pattern_name:
                matches = re.findall(pattern, context, re.IGNORECASE)
                if matches:
                    # Handle different match formats
                    if pattern_name in ['doctor_lastname_first', 'dictated_by_pattern']:
                        # These patterns return (lastname, firstname) tuples
                        if len(matches[0]) == 2:
                            lastname, firstname = matches[0]
                            name = f"{firstname.strip()} {lastname.strip()}"
                        else:
                            name = matches[0].strip() if isinstance(matches[0], str) else str(matches[0])
                    else:
                        # Standard patterns return single name
                        name = matches[0].strip()

                    # Clean up the name and validate
                    name = name.replace(',', '').strip()
                    if len(name) > 2:  # Must have reasonable length
                        provider_info['name'] = name
                        provider_info['confidence'] += 30
                        break

        # Extract organization
        org_matches = re.findall(self.provider_patterns['organization_patterns'], context, re.IGNORECASE)
        if org_matches:
            provider_info['organization'] = org_matches[0].strip()
            provider_info['confidence'] += 20

        # Extract phone
        phone_matches = re.findall(self.provider_patterns['phone_patterns'], context, re.IGNORECASE)
        if phone_matches:
            provider_info['phone'] = phone_matches[0].strip()
            provider_info['confidence'] += 15

        # Extract address
        address_matches = re.findall(self.provider_patterns['address_patterns'], context, re.IGNORECASE)
        if address_matches:
            provider_info['address'] = address_matches[0].strip()
            provider_info['confidence'] += 10

        # Guess specialty based on context
        specialty_keywords = {
            'cardiology': ['heart', 'cardiac', 'cardio', 'ecg', 'ekg', 'echo'],
            'orthopedics': ['bone', 'joint', 'spine', 'fracture', 'orthopedic'],
            'neurology': ['brain', 'neuro', 'seizure', 'headache', 'migraine'],
            'radiology': ['x-ray', 'ct', 'mri', 'scan', 'imaging', 'radiologist'],
            'emergency': ['emergency', 'er', 'urgent', 'trauma'],
            'primary care': ['primary', 'family', 'general', 'annual', 'checkup']
        }

        context_lower = context.lower()
        for specialty, keywords in specialty_keywords.items():
            if any(keyword in context_lower for keyword in keywords):
                provider_info['specialty'] = specialty.title()
                provider_info['confidence'] += 10
                break

        # Only return if we found at least a name
        if provider_info['name']:
            return provider_info
        return None

    def _standardize_date(self, date_str: str) -> str:
        """Convert various date formats to YYYY-MM-DD"""
        try:
            # Try different parsing approaches
            import dateutil.parser as date_parser
            parsed_date = date_parser.parse(date_str)
            return parsed_date.strftime('%Y-%m-%d')
        except:
            return date_str  # Return original if parsing fails

# Global parser instance
document_parser = RevolutionaryDocumentParser()
