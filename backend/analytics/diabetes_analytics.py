"""
DIABETES ANALYTICS MODULE 🩸
Medical-grade diabetes tracking analytics with encouraging insights.

Focused, clean, and under 600 lines per Constitution!
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any

class DiabetesAnalytics:
    """
    Specialized diabetes analytics that don't judge your pizza choices.
    Focuses on patterns, trends, and supportive insights.
    """
    
    def analyze_diabetes_data(self, entries: List[Dict[str, Any]], date_range: int = 30) -> Dict[str, Any]:
        """Analyze diabetes tracking data with medical insights"""
        try:
            if not entries:
                return {
                    'summary': {
                        'total_entries': 0,
                        'avg_bg': 0,
                        'time_in_range': 0,
                        'total_insulin': 0,
                        'total_carbs': 0
                    },
                    'glucose_analysis': {},
                    'insulin_patterns': {},
                    'carb_analysis': {},
                    'insights': ['No data available for analysis']
                }

            # Filter out NOPE entries
            analytics_entries = [e for e in entries if 'nope' not in e.get('tags', [])]

            # Blood glucose analysis
            bg_entries = [e for e in analytics_entries if e.get('blood_glucose')]
            bg_values = [e['blood_glucose'] for e in bg_entries]

            glucose_analysis = {}
            if bg_values:
                glucose_analysis = {
                    'average': float(round(np.mean(bg_values), 1)),
                    'median': float(round(np.median(bg_values), 1)),
                    'std_dev': float(round(np.std(bg_values), 1)),
                    'min': int(min(bg_values)),
                    'max': int(max(bg_values)),
                    'readings_count': int(len(bg_values)),
                    'time_in_range': {
                        'low': int(len([v for v in bg_values if v < 70])),
                        'normal': int(len([v for v in bg_values if 70 <= v <= 180])),
                        'high': int(len([v for v in bg_values if v > 180]))
                    },
                    'time_in_range_percent': {
                        'low': float(round(len([v for v in bg_values if v < 70]) / len(bg_values) * 100, 1)),
                        'normal': float(round(len([v for v in bg_values if 70 <= v <= 180]) / len(bg_values) * 100, 1)),
                        'high': float(round(len([v for v in bg_values if v > 180]) / len(bg_values) * 100, 1))
                    }
                }

            # Insulin analysis
            insulin_entries = [e for e in analytics_entries if e.get('insulin_amount')]
            insulin_analysis = {}
            if insulin_entries:
                insulin_values = [e['insulin_amount'] for e in insulin_entries]
                insulin_types = [e.get('insulin_type', 'unknown') for e in insulin_entries]

                insulin_analysis = {
                    'total_units': float(round(sum(insulin_values), 1)),
                    'average_dose': float(round(np.mean(insulin_values), 1)),
                    'doses_count': int(len(insulin_values)),
                    'type_distribution': {k: int(v) for k, v in dict(pd.Series(insulin_types).value_counts()).items()},
                    'daily_average': float(round(sum(insulin_values) / max(1, date_range), 1))
                }

            # Carbohydrate analysis
            carb_entries = [e for e in analytics_entries if e.get('carbs')]
            carb_analysis = {}
            if carb_entries:
                carb_values = [e['carbs'] for e in carb_entries]
                carb_analysis = {
                    'total_grams': int(sum(carb_values)),
                    'average_per_meal': float(round(np.mean(carb_values), 1)),
                    'meals_count': int(len(carb_values)),
                    'daily_average': float(round(sum(carb_values) / max(1, date_range), 1))
                }

            # Generate medical insights
            insights = self._generate_diabetes_insights(glucose_analysis, insulin_analysis, carb_analysis)

            return {
                'summary': {
                    'total_entries': int(len(analytics_entries)),
                    'avg_bg': float(glucose_analysis.get('average', 0)),
                    'time_in_range': float(glucose_analysis.get('time_in_range_percent', {}).get('normal', 0)),
                    'total_insulin': float(insulin_analysis.get('total_units', 0)),
                    'total_carbs': int(carb_analysis.get('total_grams', 0))
                },
                'glucose_analysis': glucose_analysis,
                'insulin_patterns': insulin_analysis,
                'carb_analysis': carb_analysis,
                'insights': insights
            }

        except Exception as e:
            print(f"Error analyzing diabetes data: {str(e)}")
            return {
                'error': f'Analysis failed: {str(e)}',
                'summary': {},
                'glucose_analysis': {},
                'insulin_patterns': {},
                'carb_analysis': {},
                'insights': ['Analysis temporarily unavailable']
            }

    def _generate_diabetes_insights(self, glucose_analysis: Dict, insulin_analysis: Dict, carb_analysis: Dict) -> List[str]:
        """Generate encouraging diabetes insights - just 2 supportive messages!"""
        insights = []

        # Primary encouragement based on data quality
        readings_count = glucose_analysis.get('readings_count', 0) if glucose_analysis else 0

        if readings_count >= 8:
            insights.append("📈 Excellent data tracking! This gives you real insight into your patterns.")
        elif readings_count >= 4:
            insights.append("📊 Great job building solid data for your diabetes management!")
        elif readings_count > 0:
            insights.append("🌟 You're doing amazing by tracking your diabetes data!")
        else:
            insights.append("💜 Ready to start tracking your diabetes journey!")

        # Secondary encouragement based on time in range OR general support
        if glucose_analysis:
            tir_normal = glucose_analysis.get('time_in_range_percent', {}).get('normal', 0)

            if tir_normal >= 70:
                insights.append("🎯 Incredible! {:.0f}% time in range - you're crushing it!".format(tir_normal))
            elif tir_normal >= 50:
                insights.append("💪 Strong work! {:.0f}% time in range shows great management.".format(tir_normal))
            elif tir_normal >= 30:
                insights.append("👏 Building great data with {:.0f}% time in range!".format(tir_normal))
            else:
                insights.append("✨ Every data point you collect helps you understand your patterns better.")
        else:
            insights.append("💪 Managing diabetes takes dedication - you've got this!")

        return insights
