"""
MODULAR ANALYTICS ENGINE FOR CHAOS COMMAND CENTER
Clean, focused analytics modules that don't violate the Constitution!

Each tracker gets its own focused module under 600 lines.
Main AnalyticsEngine orchestrates everything.
"""

import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64

# Import specialized analytics modules
from .diabetes_analytics import DiabetesAnalytics
from .dysautonomia_analytics import DysautonomiaAnalytics
from .digestive_analytics import DigestiveAnalytics
from .headpain_analytics import HeadPainAnalytics
from .bathroom_analytics import BathroomAnalytics
from .dashboard_analytics import DashboardAnalytics
from .chart_utils import ChartUtils

class AnalyticsEngine:
    """
    Main analytics engine that orchestrates all tracker-specific analytics.
    Keeps the Constitution happy by staying modular and focused!
    """
    
    def __init__(self):
        # Set up plotting style
        plt.style.use('default')
        sns.set_palette("husl")
        
        # Initialize specialized analytics modules
        self.diabetes = DiabetesAnalytics()
        self.dysautonomia = DysautonomiaAnalytics()
        self.digestive = DigestiveAnalytics()
        self.headpain = HeadPainAnalytics()
        self.bathroom = BathroomAnalytics()
        self.dashboard = DashboardAnalytics()
        self.charts = ChartUtils()
        
    def generate_dashboard(self, user_data: Dict[str, Any], date_range: int = 30) -> Dict[str, Any]:
        """Generate dashboard analytics from user data"""
        return self.dashboard.generate_dashboard(user_data, date_range)
        
    def analyze_diabetes_data(self, entries: List[Dict[str, Any]], date_range: int = 30) -> Dict[str, Any]:
        """Analyze diabetes tracking data with medical insights"""
        return self.diabetes.analyze_diabetes_data(entries, date_range)
        
    def analyze_dysautonomia(self, entries: List[Dict[str, Any]], date_range: int = 30) -> Dict[str, Any]:
        """Medical-grade dysautonomia analytics 🩺"""
        return self.dysautonomia.analyze_dysautonomia(entries, date_range)
        
    def analyze_upper_digestive(self, entries: List[Dict[str, Any]], date_range: int = 30) -> Dict[str, Any]:
        """Medical-grade upper digestive analytics 🤢"""
        return self.digestive.analyze_upper_digestive(entries, date_range)
        
    def analyze_head_pain(self, entries: List[Dict[str, Any]], date_range: int = 30) -> Dict[str, Any]:
        """Medical-grade head pain analytics 🧠"""
        return self.headpain.analyze_head_pain(entries, date_range)

    def analyze_bathroom(self, entries: List[Dict[str, Any]], date_range: int = 30) -> Dict[str, Any]:
        """Medical-grade bathroom/lower digestive analytics 💩"""
        return self.bathroom.analyze_bathroom(entries, date_range)
