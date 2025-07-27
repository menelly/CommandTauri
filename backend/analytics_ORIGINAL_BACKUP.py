"""
BACKUP OF ORIGINAL ANALYTICS ENGINE - DO NOT DELETE!
This is the full 2053-line analytics beast that contains ALL the working analytics.
Renamed to prevent accidental deletion during modularization.

Original Analytics Engine for Chaos Command Center
Generates insights, patterns, and dashboard data
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

class AnalyticsEngine:
    def __init__(self):
        # Set up plotting style
        plt.style.use('default')
        sns.set_palette("husl")
        
    def generate_dashboard(self, user_data: Dict[str, Any], date_range: int = 30) -> Dict[str, Any]:
        """Generate dashboard analytics from user data"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=date_range)
            
            dashboard = {
                'period': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat(),
                    'days': date_range
                },
                'summary': self._generate_summary(user_data, date_range),
                'trends': self._analyze_trends(user_data, date_range),
                'patterns': self._find_patterns(user_data, date_range),
                'insights': self._generate_insights(user_data, date_range),
                'charts': self._generate_charts(user_data, date_range)
            }
            
            return dashboard

        except Exception as e:
            logger.error(f"Error generating dashboard: {str(e)}")
            return {
                'error': f'Dashboard generation failed: {str(e)}',
                'period': {'start': '', 'end': '', 'days': date_range},
                'summary': {},
                'trends': {},
                'patterns': {},
                'insights': ['Dashboard temporarily unavailable'],
                'charts': {}
            }

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
            logger.error(f"Error analyzing diabetes data: {str(e)}")
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
    
    def _generate_summary(self, user_data: Dict[str, Any], date_range: int) -> Dict[str, Any]:
        """Generate summary statistics"""
        summary = {
            'total_entries': 0,
            'active_days': 0,
            'avg_daily_activity': 0,
            'top_categories': [],
            'health_score': 0
        }
        
        # Survival button stats
        if 'survival_data' in user_data:
            survival_data = user_data['survival_data']
            if isinstance(survival_data, list) and survival_data:
                summary['total_survival_clicks'] = sum(survival_data[-date_range:])
                summary['avg_survival_per_day'] = summary['total_survival_clicks'] / date_range
                summary['survival_trend'] = self._calculate_trend(survival_data[-date_range:])
        
        # Health tracking stats
        if 'health_entries' in user_data:
            health_entries = user_data['health_entries']
            summary['total_entries'] = len(health_entries)
            summary['active_days'] = len(set(entry.get('date', '') for entry in health_entries))
            
            # Calculate health score (simplified)
            if health_entries:
                pain_scores = [entry.get('pain_level', 5) for entry in health_entries if 'pain_level' in entry]
                if pain_scores:
                    avg_pain = sum(pain_scores) / len(pain_scores)
                    summary['health_score'] = max(0, 10 - avg_pain)  # Invert pain to health score
        
        return summary
    
    def _analyze_trends(self, user_data: Dict[str, Any], date_range: int) -> Dict[str, Any]:
        """Analyze trends in the data"""
        trends = {
            'survival_trend': 'stable',
            'pain_trend': 'stable',
            'mood_trend': 'stable',
            'activity_trend': 'stable'
        }
        
        # Survival button trend
        if 'survival_data' in user_data:
            survival_data = user_data['survival_data'][-date_range:]
            if len(survival_data) >= 7:
                recent_avg = np.mean(survival_data[-7:])
                older_avg = np.mean(survival_data[-14:-7]) if len(survival_data) >= 14 else recent_avg
                
                if recent_avg > older_avg * 1.1:
                    trends['survival_trend'] = 'increasing'
                elif recent_avg < older_avg * 0.9:
                    trends['survival_trend'] = 'decreasing'
        
        # Pain trend (if available)
        if 'health_entries' in user_data:
            health_entries = user_data['health_entries']
            pain_scores = []
            dates = []
            
            for entry in health_entries:
                if 'pain_level' in entry and 'date' in entry:
                    pain_scores.append(entry['pain_level'])
                    dates.append(entry['date'])
            
            if len(pain_scores) >= 7:
                # Simple trend analysis
                recent_pain = np.mean(pain_scores[-7:])
                older_pain = np.mean(pain_scores[-14:-7]) if len(pain_scores) >= 14 else recent_pain
                
                if recent_pain > older_pain * 1.1:
                    trends['pain_trend'] = 'increasing'
                elif recent_pain < older_pain * 0.9:
                    trends['pain_trend'] = 'decreasing'
        
        return trends
    
    def _find_patterns(self, user_data: Dict[str, Any], date_range: int) -> List[Dict[str, Any]]:
        """Find patterns in user behavior"""
        patterns = []
        
        # Weekly patterns
        if 'survival_data' in user_data:
            survival_data = user_data['survival_data'][-date_range:]
            if len(survival_data) >= 14:  # Need at least 2 weeks
                weekly_pattern = self._analyze_weekly_pattern(survival_data)
                if weekly_pattern:
                    patterns.append(weekly_pattern)
        
        # Time-of-day patterns (if timestamp data available)
        if 'timed_entries' in user_data:
            time_pattern = self._analyze_time_patterns(user_data['timed_entries'])
            if time_pattern:
                patterns.append(time_pattern)
        
        return patterns
    
    def _analyze_weekly_pattern(self, data: List[float]) -> Optional[Dict[str, Any]]:
        """Analyze weekly patterns in data"""
        if len(data) < 14:
            return None
        
        # Group by day of week (assuming daily data)
        days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        weekly_averages = []
        
        for day_idx in range(7):
            day_values = [data[i] for i in range(day_idx, len(data), 7)]
            if day_values:
                weekly_averages.append(np.mean(day_values))
            else:
                weekly_averages.append(0)
        
        # Find highest and lowest days
        max_day_idx = np.argmax(weekly_averages)
        min_day_idx = np.argmin(weekly_averages)
        
        if weekly_averages[max_day_idx] > weekly_averages[min_day_idx] * 1.3:
            return {
                'type': 'weekly_pattern',
                'description': f'Higher activity on {days_of_week[max_day_idx]}, lower on {days_of_week[min_day_idx]}',
                'confidence': 0.7,
                'data': {
                    'high_day': days_of_week[max_day_idx],
                    'low_day': days_of_week[min_day_idx],
                    'averages': dict(zip(days_of_week, weekly_averages))
                }
            }
        
        return None
    
    def _generate_insights(self, user_data: Dict[str, Any], date_range: int) -> List[str]:
        """Generate actionable insights"""
        insights = []
        
        # Survival button insights
        if 'survival_data' in user_data:
            survival_data = user_data['survival_data'][-date_range:]
            if survival_data:
                avg_survival = np.mean(survival_data)
                if avg_survival > 5:
                    insights.append("Your survival button usage is higher than average. Consider adding more self-care activities to your routine.")
                elif avg_survival < 2:
                    insights.append("Great job! Your survival button usage is low, indicating good coping strategies.")
                
                # Streak analysis
                current_streak = self._calculate_current_streak(survival_data)
                if current_streak > 7:
                    insights.append(f"You've maintained consistent tracking for {current_streak} days. Keep up the great work!")
        
        # Health insights
        if 'health_entries' in user_data:
            health_entries = user_data['health_entries']
            if len(health_entries) > 10:
                insights.append(f"You've logged {len(health_entries)} health entries. This data will help identify patterns over time.")
        
        # Default insight if no specific ones found
        if not insights:
            insights.append("Keep tracking your daily activities to build a comprehensive picture of your health patterns.")
        
        return insights
    
    def _generate_charts(self, user_data: Dict[str, Any], date_range: int) -> Dict[str, str]:
        """Generate base64-encoded chart images"""
        charts = {}
        
        try:
            # Survival button trend chart
            if 'survival_data' in user_data:
                survival_chart = self._create_survival_chart(user_data['survival_data'][-date_range:])
                if survival_chart:
                    charts['survival_trend'] = survival_chart
            
            # Weekly pattern chart
            if 'survival_data' in user_data and len(user_data['survival_data']) >= 14:
                weekly_chart = self._create_weekly_pattern_chart(user_data['survival_data'][-date_range:])
                if weekly_chart:
                    charts['weekly_pattern'] = weekly_chart
                    
        except Exception as e:
            print(f"Chart generation error: {e}")
        
        return charts
    
    def _create_survival_chart(self, data: List[float]) -> Optional[str]:
        """Create survival button trend chart"""
        if not data:
            return None
        
        try:
            plt.figure(figsize=(10, 6))
            plt.plot(range(len(data)), data, marker='o', linewidth=2, markersize=4)
            plt.title('Survival Button Usage Trend', fontsize=16, fontweight='bold')
            plt.xlabel('Days')
            plt.ylabel('Clicks')
            plt.grid(True, alpha=0.3)
            
            # Add trend line
            if len(data) > 1:
                z = np.polyfit(range(len(data)), data, 1)
                p = np.poly1d(z)
                plt.plot(range(len(data)), p(range(len(data))), "--", alpha=0.7, color='red')
            
            plt.tight_layout()
            
            # Convert to base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            chart_data = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
            return f"data:image/png;base64,{chart_data}"
            
        except Exception as e:
            print(f"Survival chart error: {e}")
            plt.close()
            return None
    
    def _create_weekly_pattern_chart(self, data: List[float]) -> Optional[str]:
        """Create weekly pattern chart"""
        if len(data) < 14:
            return None
        
        try:
            days_of_week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            weekly_averages = []
            
            for day_idx in range(7):
                day_values = [data[i] for i in range(day_idx, len(data), 7)]
                weekly_averages.append(np.mean(day_values) if day_values else 0)
            
            plt.figure(figsize=(10, 6))
            bars = plt.bar(days_of_week, weekly_averages, color='skyblue', alpha=0.7)
            plt.title('Weekly Pattern Analysis', fontsize=16, fontweight='bold')
            plt.xlabel('Day of Week')
            plt.ylabel('Average Activity')
            plt.grid(True, alpha=0.3, axis='y')
            
            # Highlight highest and lowest days
            max_idx = np.argmax(weekly_averages)
            min_idx = np.argmin(weekly_averages)
            bars[max_idx].set_color('lightgreen')
            bars[min_idx].set_color('lightcoral')
            
            plt.tight_layout()
            
            # Convert to base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            chart_data = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
            return f"data:image/png;base64,{chart_data}"
            
        except Exception as e:
            print(f"Weekly chart error: {e}")
            plt.close()
            return None
    
    def _calculate_trend(self, data: List[float]) -> str:
        """Calculate simple trend direction"""
        if len(data) < 2:
            return 'stable'
        
        recent_avg = np.mean(data[-len(data)//3:])
        older_avg = np.mean(data[:len(data)//3])
        
        if recent_avg > older_avg * 1.1:
            return 'increasing'
        elif recent_avg < older_avg * 0.9:
            return 'decreasing'
        else:
            return 'stable'
    
    def _calculate_current_streak(self, data: List[float]) -> int:
        """Calculate current tracking streak"""
        streak = 0
        for value in reversed(data):
            if value > 0:  # Assuming any activity counts as tracking
                streak += 1
            else:
                break
        return streak
    
    def analyze_dysautonomia(self, entries: List[Dict[str, Any]], date_range: int = 30) -> Dict[str, Any]:
        """
        Medical-grade dysautonomia analytics 🩺
        POTS detection, BP analysis, trigger patterns, intervention effectiveness
        """
        try:
            if not entries:
                return self._get_fallback_dysautonomia_analytics()

            # Filter out NOPE entries and recent entries
            end_date = datetime.now()
            start_date = end_date - timedelta(days=date_range)

            analytics_entries = [
                entry for entry in entries
                if not (entry.get('tags', []) and 'NOPE' in entry.get('tags', []))
                and datetime.fromisoformat(entry.get('date', '')) >= start_date
            ]

            if not analytics_entries:
                return self._get_fallback_dysautonomia_analytics()

            # Core analytics
            heart_rate_analysis = self._analyze_heart_rate_patterns(analytics_entries)
            blood_pressure_analysis = self._analyze_blood_pressure_patterns(analytics_entries)
            episode_analysis = self._analyze_episode_patterns(analytics_entries)
            trigger_analysis = self._analyze_trigger_patterns(analytics_entries)
            intervention_analysis = self._analyze_intervention_effectiveness(analytics_entries)
            severity_analysis = self._analyze_severity_patterns(analytics_entries)

            # SpO2 analysis - Because oxygen is NOT optional! 💨
            spo2_analysis = self._analyze_spo2_patterns(analytics_entries)

            # Generate insights
            insights = self._generate_dysautonomia_insights(
                analytics_entries, heart_rate_analysis, blood_pressure_analysis,
                spo2_analysis, trigger_analysis, intervention_analysis
            )

            # Generate charts
            charts = self._generate_dysautonomia_charts(analytics_entries)

            return {
                'period': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat(),
                    'days': date_range
                },
                'total_episodes': len(analytics_entries),
                'heart_rate': heart_rate_analysis,
                'blood_pressure': blood_pressure_analysis,
                'spo2': spo2_analysis,
                'episodes': episode_analysis,
                'triggers': trigger_analysis,
                'interventions': intervention_analysis,
                'severity': severity_analysis,
                'insights': insights,
                'charts': charts
            }

        except Exception as e:
            print(f"Dysautonomia analytics error: {e}")
            return self._get_fallback_dysautonomia_analytics()

    def _analyze_heart_rate_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze heart rate patterns for POTS detection"""
        hr_entries = [e for e in entries if e.get('restingHeartRate') and e.get('standingHeartRate')]

        if not hr_entries:
            return {'has_data': False}

        # Extract heart rate data
        resting_hrs = [e['restingHeartRate'] for e in hr_entries]
        standing_hrs = [e['standingHeartRate'] for e in hr_entries]
        hr_increases = [e.get('heartRateIncrease', s - r) for e, r, s in zip(hr_entries, resting_hrs, standing_hrs)]

        # Calculate averages
        avg_resting = np.mean(resting_hrs)
        avg_standing = np.mean(standing_hrs)
        avg_increase = np.mean(hr_increases)

        # POTS Detection (≥30 bpm increase)
        pots_episodes = [e for e in hr_entries if e.get('heartRateIncrease', 0) >= 30]
        severe_pots_episodes = [e for e in hr_entries if e.get('heartRateIncrease', 0) >= 50]

        # Calculate POTS percentage
        pots_percentage = (len(pots_episodes) / len(hr_entries)) * 100 if hr_entries else 0

        return {
            'has_data': True,
            'total_readings': len(hr_entries),
            'avg_resting_hr': round(avg_resting, 1),
            'avg_standing_hr': round(avg_standing, 1),
            'avg_hr_increase': round(avg_increase, 1),
            'pots_episodes': len(pots_episodes),
            'severe_pots_episodes': len(severe_pots_episodes),
            'pots_percentage': round(pots_percentage, 1),
            'max_hr_increase': max(hr_increases) if hr_increases else 0,
            'min_hr_increase': min(hr_increases) if hr_increases else 0
        }

    def _analyze_blood_pressure_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze blood pressure patterns for orthostatic hypotension"""
        bp_entries = [e for e in entries if e.get('bloodPressureSitting') and e.get('bloodPressureStanding')]

        if not bp_entries:
            return {'has_data': False}

        # Parse blood pressure readings (format: "120/80")
        sitting_systolic = []
        sitting_diastolic = []
        standing_systolic = []
        standing_diastolic = []

        for entry in bp_entries:
            try:
                sitting_parts = entry['bloodPressureSitting'].split('/')
                standing_parts = entry['bloodPressureStanding'].split('/')

                sitting_systolic.append(int(sitting_parts[0]))
                sitting_diastolic.append(int(sitting_parts[1]))
                standing_systolic.append(int(standing_parts[0]))
                standing_diastolic.append(int(standing_parts[1]))
            except (ValueError, IndexError):
                continue

        if not sitting_systolic:
            return {'has_data': False}

        # Calculate drops
        systolic_drops = [sit - stand for sit, stand in zip(sitting_systolic, standing_systolic)]
        diastolic_drops = [sit - stand for sit, stand in zip(sitting_diastolic, standing_diastolic)]

        # Orthostatic hypotension detection (≥20 mmHg systolic or ≥10 mmHg diastolic drop)
        orthostatic_episodes = [
            i for i, (sys_drop, dia_drop) in enumerate(zip(systolic_drops, diastolic_drops))
            if sys_drop >= 20 or dia_drop >= 10
        ]

        return {
            'has_data': True,
            'total_readings': len(bp_entries),
            'avg_sitting_systolic': round(np.mean(sitting_systolic), 1),
            'avg_sitting_diastolic': round(np.mean(sitting_diastolic), 1),
            'avg_standing_systolic': round(np.mean(standing_systolic), 1),
            'avg_standing_diastolic': round(np.mean(standing_diastolic), 1),
            'avg_systolic_drop': round(np.mean(systolic_drops), 1),
            'avg_diastolic_drop': round(np.mean(diastolic_drops), 1),
            'orthostatic_episodes': len(orthostatic_episodes),
            'orthostatic_percentage': round((len(orthostatic_episodes) / len(bp_entries)) * 100, 1)
        }

    def _analyze_spo2_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze SpO2 patterns for desaturation episodes - Because oxygen is NOT optional! 💨"""
        spo2_entries = [e for e in entries if e.get('restingSpO2') or e.get('standingSpO2') or e.get('lowestSpO2')]

        if not spo2_entries:
            return {'has_data': False}

        # Extract SpO2 data
        resting_spo2 = [e['restingSpO2'] for e in spo2_entries if e.get('restingSpO2')]
        standing_spo2 = [e['standingSpO2'] for e in spo2_entries if e.get('standingSpO2')]
        lowest_spo2 = [e['lowestSpO2'] for e in spo2_entries if e.get('lowestSpO2')]

        # Calculate averages
        avg_resting_spo2 = round(np.mean(resting_spo2), 1) if resting_spo2 else None
        avg_standing_spo2 = round(np.mean(standing_spo2), 1) if standing_spo2 else None
        avg_lowest_spo2 = round(np.mean(lowest_spo2), 1) if lowest_spo2 else None

        # Calculate SpO2 drops (resting to standing)
        spo2_drops = []
        for entry in spo2_entries:
            if entry.get('restingSpO2') and entry.get('standingSpO2'):
                drop = entry['restingSpO2'] - entry['standingSpO2']
                spo2_drops.append(drop)

        avg_spo2_drop = round(np.mean(spo2_drops), 1) if spo2_drops else None

        # Desaturation analysis
        critical_episodes = [e for e in spo2_entries if e.get('lowestSpO2', 100) < 90]  # <90% is critical
        severe_episodes = [e for e in spo2_entries if e.get('lowestSpO2', 100) < 85]   # <85% is severe

        # Position-related desaturation (significant drop >4%)
        position_desats = [e for e in spo2_entries
                          if e.get('restingSpO2') and e.get('standingSpO2')
                          and (e['restingSpO2'] - e['standingSpO2']) > 4]

        return {
            'has_data': True,
            'total_readings': len(spo2_entries),
            'avg_resting_spo2': avg_resting_spo2,
            'avg_standing_spo2': avg_standing_spo2,
            'avg_lowest_spo2': avg_lowest_spo2,
            'avg_spo2_drop': avg_spo2_drop,
            'critical_episodes': len(critical_episodes),
            'severe_episodes': len(severe_episodes),
            'position_desats': len(position_desats),
            'critical_percentage': round((len(critical_episodes) / len(spo2_entries)) * 100, 1) if spo2_entries else 0,
            'position_desat_percentage': round((len(position_desats) / len(spo2_entries)) * 100, 1) if spo2_entries else 0,
            'min_spo2_recorded': min(lowest_spo2) if lowest_spo2 else None,
            'max_spo2_drop': max(spo2_drops) if spo2_drops else None
        }

    def _get_fallback_dashboard(self, date_range: int) -> Dict[str, Any]:
        """Fallback dashboard when data processing fails"""
        return {
            'period': {
                'start': (datetime.now() - timedelta(days=date_range)).isoformat(),
                'end': datetime.now().isoformat(),
                'days': date_range
            },
            'summary': {
                'total_entries': 0,
                'active_days': 0,
                'message': 'Start tracking to see your analytics!'
            },
            'trends': {},
            'patterns': [],
            'insights': ['Begin your tracking journey to unlock personalized insights!'],
            'charts': {}
        }

    def _analyze_episode_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze episode type patterns and frequency"""
        episode_types = {}
        for entry in entries:
            episode_type = entry.get('episodeType', 'general')
            episode_types[episode_type] = episode_types.get(episode_type, 0) + 1

        # Calculate frequency metrics
        total_episodes = len(entries)
        last_30_days = [e for e in entries if (datetime.now() - datetime.fromisoformat(e.get('date', ''))).days <= 30]
        last_7_days = [e for e in entries if (datetime.now() - datetime.fromisoformat(e.get('date', ''))).days <= 7]

        return {
            'episode_types': episode_types,
            'total_episodes': total_episodes,
            'last_30_days': len(last_30_days),
            'last_7_days': len(last_7_days),
            'weekly_average': round(len(last_30_days) / 4.3, 1),
            'daily_average': round(len(last_30_days) / 30, 1)
        }

    def _analyze_trigger_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze trigger patterns and correlations"""
        trigger_counts = {}
        trigger_severity = {}

        for entry in entries:
            triggers = entry.get('triggers', [])
            severity = entry.get('severity', 5)

            for trigger in triggers:
                trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1
                if trigger not in trigger_severity:
                    trigger_severity[trigger] = []
                trigger_severity[trigger].append(severity)

        # Calculate average severity per trigger
        trigger_avg_severity = {
            trigger: round(np.mean(severities), 1)
            for trigger, severities in trigger_severity.items()
        }

        # Sort triggers by frequency
        top_triggers = sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:10]

        # Find most severe triggers
        severe_triggers = sorted(
            [(trigger, avg_sev) for trigger, avg_sev in trigger_avg_severity.items()],
            key=lambda x: x[1], reverse=True
        )[:5]

        return {
            'trigger_counts': trigger_counts,
            'top_triggers': top_triggers,
            'severe_triggers': severe_triggers,
            'total_unique_triggers': len(trigger_counts)
        }

    def _analyze_intervention_effectiveness(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze intervention effectiveness patterns"""
        intervention_data = {}

        for entry in entries:
            interventions = entry.get('interventions', [])
            effectiveness = entry.get('interventionEffectiveness')

            if interventions and effectiveness is not None:
                for intervention in interventions:
                    if intervention not in intervention_data:
                        intervention_data[intervention] = []
                    intervention_data[intervention].append(effectiveness)

        # Calculate average effectiveness per intervention
        intervention_effectiveness = {}
        for intervention, scores in intervention_data.items():
            intervention_effectiveness[intervention] = {
                'avg_effectiveness': round(np.mean(scores), 1),
                'usage_count': len(scores),
                'max_effectiveness': max(scores),
                'min_effectiveness': min(scores)
            }

        # Sort by effectiveness
        most_effective = sorted(
            intervention_effectiveness.items(),
            key=lambda x: x[1]['avg_effectiveness'], reverse=True
        )[:10]

        return {
            'intervention_data': intervention_effectiveness,
            'most_effective': most_effective,
            'total_interventions_tried': len(intervention_effectiveness)
        }

    def _analyze_severity_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze severity patterns and trends"""
        severities = [entry.get('severity', 5) for entry in entries]

        if not severities:
            return {'has_data': False}

        # Severity distribution
        severity_distribution = {
            'mild': len([s for s in severities if s <= 3]),
            'moderate': len([s for s in severities if 4 <= s <= 6]),
            'severe': len([s for s in severities if 7 <= s <= 8]),
            'critical': len([s for s in severities if s >= 9])
        }

        # Recent trend analysis
        if len(severities) >= 7:
            recent_avg = np.mean(severities[-7:])
            older_avg = np.mean(severities[-14:-7]) if len(severities) >= 14 else recent_avg

            if recent_avg > older_avg * 1.1:
                trend = 'worsening'
            elif recent_avg < older_avg * 0.9:
                trend = 'improving'
            else:
                trend = 'stable'
        else:
            trend = 'insufficient_data'

        return {
            'has_data': True,
            'avg_severity': round(np.mean(severities), 1),
            'max_severity': max(severities),
            'min_severity': min(severities),
            'distribution': severity_distribution,
            'trend': trend,
            'total_entries': len(severities)
        }

    def _generate_dysautonomia_insights(self, entries, hr_analysis, bp_analysis, spo2_analysis, trigger_analysis, intervention_analysis) -> List[str]:
        """Generate medical insights for dysautonomia patterns"""
        insights = []

        # Heart rate insights
        if hr_analysis.get('has_data'):
            pots_percentage = hr_analysis.get('pots_percentage', 0)
            if pots_percentage > 50:
                insights.append(f"⚠️ {pots_percentage:.1f}% of your episodes show POTS criteria (≥30 bpm HR increase). Consider discussing with your healthcare provider.")
            elif pots_percentage > 25:
                insights.append(f"📊 {pots_percentage:.1f}% of episodes meet POTS criteria. Monitor patterns and discuss with your doctor.")

            avg_increase = hr_analysis.get('avg_hr_increase', 0)
            if avg_increase > 40:
                insights.append(f"💓 Your average heart rate increase is {avg_increase:.1f} bpm, which is significant. Track position changes carefully.")

        # Blood pressure insights
        if bp_analysis.get('has_data'):
            ortho_percentage = bp_analysis.get('orthostatic_percentage', 0)
            if ortho_percentage > 30:
                insights.append(f"🩸 {ortho_percentage:.1f}% of readings show orthostatic hypotension. Focus on hydration and gradual position changes.")

        # SpO2 insights - Because oxygen is NOT optional! 💨
        if spo2_analysis.get('has_data'):
            critical_percentage = spo2_analysis.get('critical_percentage', 0)
            min_spo2 = spo2_analysis.get('min_spo2_recorded')
            position_desat_percentage = spo2_analysis.get('position_desat_percentage', 0)

            if critical_percentage > 20:
                insights.append(f"🚨 {critical_percentage:.1f}% of episodes show critical desaturation (<90%). This needs immediate medical attention!")
            elif critical_percentage > 0:
                insights.append(f"⚠️ {critical_percentage:.1f}% of episodes show desaturation <90%. Monitor closely and discuss with your doctor.")

            if min_spo2 and min_spo2 < 85:
                insights.append(f"🆘 Lowest SpO2 recorded: {min_spo2}% - This is dangerously low! Seek immediate medical evaluation.")

            if position_desat_percentage > 25:
                insights.append(f"💨 {position_desat_percentage:.1f}% of episodes show position-related desaturation (>4% drop). Consider slower position changes.")

        # Trigger insights
        if trigger_analysis.get('top_triggers'):
            top_trigger = trigger_analysis['top_triggers'][0]
            insights.append(f"🎯 Your most common trigger is '{top_trigger[0]}' ({top_trigger[1]} episodes). Consider avoidance strategies.")

        # Intervention insights
        if intervention_analysis.get('most_effective'):
            best_intervention = intervention_analysis['most_effective'][0]
            effectiveness = best_intervention[1]['avg_effectiveness']
            insights.append(f"✅ '{best_intervention[0]}' is your most effective intervention (avg {effectiveness}/5). Use it consistently.")

        # General insights
        total_episodes = len(entries)
        if total_episodes > 20:
            insights.append(f"📈 You've tracked {total_episodes} episodes. This rich data helps identify patterns for better management.")

        return insights[:6]  # Limit to 6 insights

    def _generate_dysautonomia_charts(self, entries: List[Dict[str, Any]]) -> Dict[str, str]:
        """Generate dysautonomia-specific charts"""
        charts = {}

        try:
            # Heart rate trend chart
            hr_chart = self._create_heart_rate_chart(entries)
            if hr_chart:
                charts['heart_rate_trend'] = hr_chart

            # Episode frequency chart
            episode_chart = self._create_episode_frequency_chart(entries)
            if episode_chart:
                charts['episode_frequency'] = episode_chart

            # Trigger analysis chart
            trigger_chart = self._create_trigger_chart(entries)
            if trigger_chart:
                charts['trigger_analysis'] = trigger_chart

        except Exception as e:
            print(f"Dysautonomia chart generation error: {e}")

        return charts

    def _get_fallback_dysautonomia_analytics(self) -> Dict[str, Any]:
        """Fallback analytics when dysautonomia data processing fails"""
        return {
            'total_episodes': 0,
            'heart_rate': {'has_data': False},
            'blood_pressure': {'has_data': False},
            'spo2': {'has_data': False},
            'episodes': {'total_episodes': 0},
            'triggers': {'total_unique_triggers': 0},
            'interventions': {'total_interventions_tried': 0},
            'severity': {'has_data': False},
            'insights': ['Start tracking dysautonomia episodes to see medical-grade analytics!'],
            'charts': {}
        }

    def _create_heart_rate_chart(self, entries: List[Dict[str, Any]]) -> Optional[str]:
        """Create heart rate pattern chart"""
        hr_entries = [e for e in entries if e.get('restingHeartRate') and e.get('standingHeartRate')]

        if len(hr_entries) < 3:
            return None

        try:
            dates = [datetime.fromisoformat(e['date']) for e in hr_entries]
            resting_hrs = [e['restingHeartRate'] for e in hr_entries]
            standing_hrs = [e['standingHeartRate'] for e in hr_entries]
            hr_increases = [e.get('heartRateIncrease', s - r) for e, r, s in zip(hr_entries, resting_hrs, standing_hrs)]

            plt.figure(figsize=(12, 8))

            # Create subplots
            fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))

            # Top plot: Resting vs Standing HR
            ax1.plot(dates, resting_hrs, marker='o', label='Resting HR', color='blue', linewidth=2)
            ax1.plot(dates, standing_hrs, marker='s', label='Standing HR', color='red', linewidth=2)
            ax1.axhline(y=100, color='orange', linestyle='--', alpha=0.7, label='Tachycardia Threshold')
            ax1.set_title('Heart Rate Patterns', fontsize=16, fontweight='bold')
            ax1.set_ylabel('Heart Rate (bpm)')
            ax1.legend()
            ax1.grid(True, alpha=0.3)

            # Bottom plot: HR Increase with POTS threshold
            ax2.bar(dates, hr_increases, alpha=0.7, color=['red' if inc >= 30 else 'lightblue' for inc in hr_increases])
            ax2.axhline(y=30, color='red', linestyle='--', linewidth=2, label='POTS Threshold (30 bpm)')
            ax2.axhline(y=50, color='darkred', linestyle='--', linewidth=2, label='Severe POTS (50 bpm)')
            ax2.set_title('Heart Rate Increase (Standing - Resting)', fontsize=14, fontweight='bold')
            ax2.set_ylabel('HR Increase (bpm)')
            ax2.set_xlabel('Date')
            ax2.legend()
            ax2.grid(True, alpha=0.3)

            plt.tight_layout()

            # Convert to base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            chart_data = base64.b64encode(buffer.getvalue()).decode()
            plt.close()

            return f"data:image/png;base64,{chart_data}"

        except Exception as e:
            print(f"Heart rate chart error: {e}")
            plt.close()
            return None

    def _create_episode_frequency_chart(self, entries: List[Dict[str, Any]]) -> Optional[str]:
        """Create episode frequency and type distribution chart"""
        if len(entries) < 3:
            return None

        try:
            # Episode type distribution
            episode_types = {}
            for entry in entries:
                episode_type = entry.get('episodeType', 'general')
                episode_types[episode_type] = episode_types.get(episode_type, 0) + 1

            # Create figure with subplots
            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

            # Left plot: Episode type pie chart
            colors = ['#ff9999', '#66b3ff', '#99ff99', '#ffcc99', '#ff99cc']
            wedges, texts, autotexts = ax1.pie(
                episode_types.values(),
                labels=episode_types.keys(),
                autopct='%1.1f%%',
                colors=colors[:len(episode_types)],
                startangle=90
            )
            ax1.set_title('Episode Types Distribution', fontsize=14, fontweight='bold')

            # Right plot: Episodes over time
            dates = [datetime.fromisoformat(e['date']) for e in entries]
            severities = [e.get('severity', 5) for e in entries]

            # Create scatter plot with severity as color
            scatter = ax2.scatter(dates, [1] * len(dates), c=severities, cmap='Reds', s=100, alpha=0.7)
            ax2.set_title('Episodes Timeline by Severity', fontsize=14, fontweight='bold')
            ax2.set_ylabel('Episodes')
            ax2.set_xlabel('Date')
            ax2.set_ylim(0.5, 1.5)
            ax2.set_yticks([1])
            ax2.set_yticklabels(['Episodes'])

            # Add colorbar for severity
            cbar = plt.colorbar(scatter, ax=ax2)
            cbar.set_label('Severity (1-10)')

            plt.tight_layout()

            # Convert to base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            chart_data = base64.b64encode(buffer.getvalue()).decode()
            plt.close()

            return f"data:image/png;base64,{chart_data}"

        except Exception as e:
            print(f"Episode frequency chart error: {e}")
            plt.close()
            return None

    def _create_trigger_chart(self, entries: List[Dict[str, Any]]) -> Optional[str]:
        """Create trigger analysis chart"""
        trigger_counts = {}
        trigger_severity = {}

        for entry in entries:
            triggers = entry.get('triggers', [])
            severity = entry.get('severity', 5)

            for trigger in triggers:
                trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1
                if trigger not in trigger_severity:
                    trigger_severity[trigger] = []
                trigger_severity[trigger].append(severity)

        if len(trigger_counts) < 2:
            return None

        try:
            # Get top 10 triggers
            top_triggers = sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:10]
            trigger_names = [t[0] for t in top_triggers]
            trigger_freq = [t[1] for t in top_triggers]
            trigger_avg_sev = [np.mean(trigger_severity[t[0]]) for t in top_triggers]

            # Create figure with subplots
            fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))

            # Top plot: Trigger frequency
            bars1 = ax1.barh(trigger_names, trigger_freq, color='lightcoral', alpha=0.7)
            ax1.set_title('Most Common Triggers', fontsize=14, fontweight='bold')
            ax1.set_xlabel('Frequency')

            # Add frequency labels on bars
            for i, bar in enumerate(bars1):
                width = bar.get_width()
                ax1.text(width + 0.1, bar.get_y() + bar.get_height()/2,
                        f'{int(width)}', ha='left', va='center')

            # Bottom plot: Average severity per trigger
            bars2 = ax2.barh(trigger_names, trigger_avg_sev, color='lightblue', alpha=0.7)
            ax2.set_title('Average Severity by Trigger', fontsize=14, fontweight='bold')
            ax2.set_xlabel('Average Severity (1-10)')
            ax2.set_xlim(0, 10)

            # Add severity labels on bars
            for i, bar in enumerate(bars2):
                width = bar.get_width()
                ax2.text(width + 0.1, bar.get_y() + bar.get_height()/2,
                        f'{width:.1f}', ha='left', va='center')

            plt.tight_layout()

            # Convert to base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            chart_data = base64.b64encode(buffer.getvalue()).decode()
            plt.close()

            return f"data:image/png;base64,{chart_data}"

        except Exception as e:
            print(f"Trigger chart error: {e}")
            plt.close()
            return None

    def analyze_upper_digestive(self, entries: List[Dict[str, Any]], date_range: int = 30) -> Dict[str, Any]:
        """
        Medical-grade upper digestive analytics 🤢
        Symptom patterns, trigger analysis, treatment effectiveness
        """
        try:
            if not entries:
                return self._get_fallback_upper_digestive_analytics()

            # Filter out NOPE entries and recent entries
            end_date = datetime.now()
            start_date = end_date - timedelta(days=date_range)

            analytics_entries = [
                entry for entry in entries
                if not (entry.get('tags', []) and 'NOPE' in entry.get('tags', []))
                and datetime.fromisoformat(entry.get('date', '')) >= start_date
            ]

            if not analytics_entries:
                return self._get_fallback_upper_digestive_analytics()

            # Core analytics
            symptom_analysis = self._analyze_digestive_symptoms(analytics_entries)
            trigger_analysis = self._analyze_digestive_triggers(analytics_entries)
            treatment_analysis = self._analyze_digestive_treatments(analytics_entries)
            severity_analysis = self._analyze_digestive_severity(analytics_entries)
            time_patterns = self._analyze_digestive_time_patterns(analytics_entries)

            # Generate insights
            insights = self._generate_digestive_insights(
                analytics_entries, symptom_analysis, trigger_analysis, treatment_analysis
            )

            # Generate charts
            charts = self._generate_digestive_charts(analytics_entries)

            return {
                'period': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat(),
                    'days': date_range
                },
                'total_episodes': len(analytics_entries),
                'symptoms': symptom_analysis,
                'triggers': trigger_analysis,
                'treatments': treatment_analysis,
                'severity': severity_analysis,
                'time_patterns': time_patterns,
                'insights': insights,
                'charts': charts
            }

        except Exception as e:
            print(f"Upper digestive analytics error: {e}")
            return self._get_fallback_upper_digestive_analytics()

    def _analyze_digestive_symptoms(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze digestive symptom patterns"""
        all_symptoms = []
        for entry in entries:
            symptoms = entry.get('symptoms', [])
            if isinstance(symptoms, list):
                all_symptoms.extend(symptoms)

        if not all_symptoms:
            return {'has_data': False}

        # Count symptom frequency
        symptom_counts = {}
        for symptom in all_symptoms:
            symptom_counts[symptom] = symptom_counts.get(symptom, 0) + 1

        # Get top symptoms
        top_symptoms = sorted(symptom_counts.items(), key=lambda x: x[1], reverse=True)[:10]

        return {
            'has_data': True,
            'total_symptoms': len(all_symptoms),
            'unique_symptoms': len(symptom_counts),
            'frequency': symptom_counts,
            'top_symptoms': [{'symptom': s, 'count': c} for s, c in top_symptoms]
        }

    def _analyze_digestive_triggers(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze digestive trigger patterns"""
        all_triggers = []
        for entry in entries:
            triggers = entry.get('triggers', [])
            if isinstance(triggers, list):
                all_triggers.extend(triggers)

        if not all_triggers:
            return {'has_data': False}

        # Count trigger frequency
        trigger_counts = {}
        for trigger in all_triggers:
            trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1

        # Get top triggers
        top_triggers = sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:8]

        return {
            'has_data': True,
            'total_triggers': len(all_triggers),
            'unique_triggers': len(trigger_counts),
            'frequency': trigger_counts,
            'top_triggers': [{'trigger': t, 'count': c} for t, c in top_triggers]
        }

    def _analyze_digestive_treatments(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze digestive treatment effectiveness"""
        all_treatments = []
        for entry in entries:
            treatments = entry.get('treatments', [])
            if isinstance(treatments, list):
                all_treatments.extend(treatments)

        if not all_treatments:
            return {'has_data': False}

        # Count treatment frequency
        treatment_counts = {}
        for treatment in all_treatments:
            treatment_counts[treatment] = treatment_counts.get(treatment, 0) + 1

        # Get top treatments
        top_treatments = sorted(treatment_counts.items(), key=lambda x: x[1], reverse=True)[:8]

        return {
            'has_data': True,
            'total_treatments': len(all_treatments),
            'unique_treatments': len(treatment_counts),
            'frequency': treatment_counts,
            'top_treatments': [{'treatment': t, 'count': c} for t, c in top_treatments]
        }

    def _analyze_digestive_severity(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze digestive severity patterns"""
        severities = []
        for entry in entries:
            severity = entry.get('severity', '')
            if severity:
                # Convert severity to number
                if severity.lower() == 'mild':
                    severities.append(3)
                elif severity.lower() == 'moderate':
                    severities.append(6)
                elif severity.lower() == 'severe':
                    severities.append(9)

        if not severities:
            return {'has_data': False}

        avg_severity = np.mean(severities)
        severity_distribution = {
            'mild': len([s for s in severities if s <= 3]),
            'moderate': len([s for s in severities if 4 <= s <= 6]),
            'severe': len([s for s in severities if s >= 7])
        }

        return {
            'has_data': True,
            'average': round(avg_severity, 1),
            'distribution': severity_distribution,
            'max_severity': max(severities),
            'min_severity': min(severities)
        }

    def _analyze_digestive_time_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze time patterns for digestive episodes"""
        time_counts = {}
        for entry in entries:
            time_str = entry.get('time', '')
            if time_str:
                try:
                    hour = int(time_str.split(':')[0])
                    time_period = self._get_time_period(hour)
                    time_counts[time_period] = time_counts.get(time_period, 0) + 1
                except:
                    continue

        return {
            'has_data': bool(time_counts),
            'by_period': time_counts
        }

    def _generate_digestive_insights(self, entries, symptom_analysis, trigger_analysis, treatment_analysis) -> List[str]:
        """Generate insights for digestive patterns"""
        insights = []

        # Episode frequency insight
        if len(entries) > 0:
            avg_per_week = (len(entries) / 30) * 7
            if avg_per_week > 7:
                insights.append(f"⚠️ High episode frequency: {avg_per_week:.1f} episodes per week")
            elif avg_per_week < 1:
                insights.append(f"✅ Low episode frequency: {avg_per_week:.1f} episodes per week")

        # Top symptom insight
        if symptom_analysis.get('has_data') and symptom_analysis['top_symptoms']:
            top_symptom = symptom_analysis['top_symptoms'][0]
            insights.append(f"🔍 Most common symptom: {top_symptom['symptom']} ({top_symptom['count']} times)")

        # Top trigger insight
        if trigger_analysis.get('has_data') and trigger_analysis['top_triggers']:
            top_trigger = trigger_analysis['top_triggers'][0]
            insights.append(f"⚡ Most common trigger: {top_trigger['trigger']} ({top_trigger['count']} times)")

        # Treatment insight
        if treatment_analysis.get('has_data') and treatment_analysis['top_treatments']:
            top_treatment = treatment_analysis['top_treatments'][0]
            insights.append(f"💊 Most used treatment: {top_treatment['treatment']} ({top_treatment['count']} times)")

        return insights[:5]  # Limit to 5 insights

    def _generate_digestive_charts(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate charts for digestive analytics"""
        return {
            'symptom_frequency': self._create_digestive_symptom_chart(entries),
            'trigger_frequency': self._create_digestive_trigger_chart(entries),
            'severity_trend': self._create_digestive_severity_chart(entries)
        }

    def _create_digestive_symptom_chart(self, entries: List[Dict[str, Any]]) -> Optional[str]:
        """Create symptom frequency chart"""
        try:
            # Count symptoms
            symptom_counts = {}
            for entry in entries:
                symptoms = entry.get('symptoms', [])
                if isinstance(symptoms, list):
                    for symptom in symptoms:
                        symptom_counts[symptom] = symptom_counts.get(symptom, 0) + 1

            if not symptom_counts:
                return None

            # Get top 8 symptoms
            top_symptoms = sorted(symptom_counts.items(), key=lambda x: x[1], reverse=True)[:8]
            symptoms, counts = zip(*top_symptoms)

            # Create chart
            plt.figure(figsize=(10, 6))
            bars = plt.bar(range(len(symptoms)), counts, color='#ff6b6b')
            plt.title('Most Common Digestive Symptoms', fontsize=14, fontweight='bold')
            plt.xlabel('Symptoms')
            plt.ylabel('Frequency')
            plt.xticks(range(len(symptoms)), symptoms, rotation=45, ha='right')

            # Add value labels on bars
            for bar, count in zip(bars, counts):
                plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1,
                        str(count), ha='center', va='bottom')

            plt.tight_layout()

            # Convert to base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            chart_data = base64.b64encode(buffer.getvalue()).decode()
            plt.close()

            return f"data:image/png;base64,{chart_data}"

        except Exception as e:
            print(f"Digestive symptom chart error: {e}")
            plt.close()
            return None

    def _create_digestive_trigger_chart(self, entries: List[Dict[str, Any]]) -> Optional[str]:
        """Create trigger frequency chart"""
        try:
            # Count triggers
            trigger_counts = {}
            for entry in entries:
                triggers = entry.get('triggers', [])
                if isinstance(triggers, list):
                    for trigger in triggers:
                        trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1

            if not trigger_counts:
                return None

            # Get top 6 triggers
            top_triggers = sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:6]
            triggers, counts = zip(*top_triggers)

            # Create chart
            plt.figure(figsize=(8, 8))
            colors = plt.cm.Set3(np.linspace(0, 1, len(triggers)))
            plt.pie(counts, labels=triggers, autopct='%1.1f%%', colors=colors, startangle=90)
            plt.title('Most Common Digestive Triggers', fontsize=14, fontweight='bold')
            plt.axis('equal')

            # Convert to base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            chart_data = base64.b64encode(buffer.getvalue()).decode()
            plt.close()

            return f"data:image/png;base64,{chart_data}"

        except Exception as e:
            print(f"Digestive trigger chart error: {e}")
            plt.close()
            return None

    def _create_digestive_severity_chart(self, entries: List[Dict[str, Any]]) -> Optional[str]:
        """Create severity trend chart"""
        try:
            # Group by date and calculate average severity
            daily_severity = {}
            for entry in entries:
                date = entry.get('date', '')
                severity = entry.get('severity', '')
                if date and severity:
                    severity_num = 3 if severity.lower() == 'mild' else 6 if severity.lower() == 'moderate' else 9
                    if date not in daily_severity:
                        daily_severity[date] = []
                    daily_severity[date].append(severity_num)

            if not daily_severity:
                return None

            # Calculate daily averages
            dates = sorted(daily_severity.keys())
            avg_severities = [np.mean(daily_severity[date]) for date in dates]

            # Create chart
            plt.figure(figsize=(12, 6))
            plt.plot(range(len(dates)), avg_severities, marker='o', linewidth=2, markersize=6, color='#ff6b6b')
            plt.title('Digestive Severity Trend', fontsize=14, fontweight='bold')
            plt.xlabel('Date')
            plt.ylabel('Average Severity')
            plt.xticks(range(0, len(dates), max(1, len(dates)//10)),
                      [dates[i] for i in range(0, len(dates), max(1, len(dates)//10))],
                      rotation=45)
            plt.grid(True, alpha=0.3)
            plt.tight_layout()

            # Convert to base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            chart_data = base64.b64encode(buffer.getvalue()).decode()
            plt.close()

            return f"data:image/png;base64,{chart_data}"

        except Exception as e:
            print(f"Digestive severity chart error: {e}")
            plt.close()
            return None

    def _get_fallback_upper_digestive_analytics(self) -> Dict[str, Any]:
        """Fallback analytics when no data available"""
        return {
            'period': {
                'start': (datetime.now() - timedelta(days=30)).isoformat(),
                'end': datetime.now().isoformat(),
                'days': 30
            },
            'total_episodes': 0,
            'symptoms': {'has_data': False},
            'triggers': {'has_data': False},
            'treatments': {'has_data': False},
            'severity': {'has_data': False},
            'time_patterns': {'has_data': False},
            'insights': ['No digestive episodes recorded in the selected time period'],
            'charts': {
                'symptom_frequency': None,
                'trigger_frequency': None,
                'severity_trend': None
            }
        }

    def analyze_head_pain(self, entries: List[Dict[str, Any]], date_range: int = 30) -> Dict[str, Any]:
        """
        Medical-grade head pain analytics 🧠
        Migraine patterns, trigger analysis, aura detection, treatment effectiveness
        """
        try:
            if not entries:
                return self._get_fallback_head_pain_analytics()

            # Filter out NOPE entries and recent entries
            end_date = datetime.now()
            start_date = end_date - timedelta(days=date_range)

            analytics_entries = [
                entry for entry in entries
                if not (entry.get('tags', []) and 'NOPE' in entry.get('tags', []))
                and datetime.fromisoformat(entry.get('date', '')) >= start_date
            ]

            if not analytics_entries:
                return self._get_fallback_head_pain_analytics()

            # Core analytics
            pain_analysis = self._analyze_pain_intensity_patterns(analytics_entries)
            location_analysis = self._analyze_pain_locations(analytics_entries)
            trigger_analysis = self._analyze_headache_triggers(analytics_entries)
            treatment_analysis = self._analyze_headache_treatments(analytics_entries)
            aura_analysis = self._analyze_aura_patterns(analytics_entries)
            functional_impact_analysis = self._analyze_functional_impact(analytics_entries)

            # Generate insights
            insights = self._generate_headache_insights(
                analytics_entries, pain_analysis, trigger_analysis, aura_analysis
            )

            # Generate charts
            charts = self._generate_headache_charts(analytics_entries)

            return {
                'period': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat(),
                    'days': date_range
                },
                'total_episodes': len(analytics_entries),
                'pain_intensity': pain_analysis,
                'locations': location_analysis,
                'triggers': trigger_analysis,
                'treatments': treatment_analysis,
                'aura': aura_analysis,
                'functional_impact': functional_impact_analysis,
                'insights': insights,
                'charts': charts
            }

        except Exception as e:
            print(f"Head pain analytics error: {e}")
            return self._get_fallback_head_pain_analytics()

    def _analyze_pain_intensity_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze pain intensity patterns for headaches"""
        intensities = []
        for entry in entries:
            intensity = entry.get('painIntensity', 0)
            if isinstance(intensity, (int, float)) and 0 <= intensity <= 10:
                intensities.append(intensity)

        if not intensities:
            return {'has_data': False}

        avg_intensity = np.mean(intensities)

        # Categorize pain levels
        mild_episodes = len([i for i in intensities if 1 <= i <= 3])
        moderate_episodes = len([i for i in intensities if 4 <= i <= 6])
        severe_episodes = len([i for i in intensities if 7 <= i <= 10])

        distribution = {
            'mild': mild_episodes,
            'moderate': moderate_episodes,
            'severe': severe_episodes
        }

        return {
            'has_data': True,
            'average': round(avg_intensity, 1),
            'distribution': distribution,
            'total_readings': len(intensities),
            'severe_percentage': round((severe_episodes / len(intensities)) * 100, 1) if intensities else 0
        }

    def _analyze_pain_locations(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze pain location patterns"""
        all_locations = []
        for entry in entries:
            locations = entry.get('painLocation', [])
            if isinstance(locations, list):
                all_locations.extend(locations)

        if not all_locations:
            return {'has_data': False}

        # Count location frequency
        location_counts = {}
        for location in all_locations:
            location_counts[location] = location_counts.get(location, 0) + 1

        # Get top locations
        top_locations = sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:8]

        return {
            'has_data': True,
            'frequency': location_counts,
            'top_locations': [{'location': l, 'count': c} for l, c in top_locations]
        }

    def _analyze_headache_triggers(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze headache trigger patterns"""
        all_triggers = []
        for entry in entries:
            triggers = entry.get('triggers', [])
            if isinstance(triggers, list):
                all_triggers.extend(triggers)

        if not all_triggers:
            return {'has_data': False}

        # Count trigger frequency
        trigger_counts = {}
        for trigger in all_triggers:
            trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1

        # Get top triggers
        top_triggers = sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:8]

        return {
            'has_data': True,
            'frequency': trigger_counts,
            'top_triggers': [{'trigger': t, 'count': c} for t, c in top_triggers]
        }

    def _analyze_headache_treatments(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze headache treatment effectiveness"""
        all_treatments = []
        effectiveness_data = []

        for entry in entries:
            treatments = entry.get('treatments', [])
            effectiveness = entry.get('treatmentEffectiveness', 0)

            if isinstance(treatments, list):
                all_treatments.extend(treatments)

            if isinstance(effectiveness, (int, float)) and effectiveness > 0:
                effectiveness_data.append(effectiveness)

        if not all_treatments:
            return {'has_data': False}

        # Count treatment frequency
        treatment_counts = {}
        for treatment in all_treatments:
            treatment_counts[treatment] = treatment_counts.get(treatment, 0) + 1

        # Get top treatments
        top_treatments = sorted(treatment_counts.items(), key=lambda x: x[1], reverse=True)[:8]

        # Calculate average effectiveness
        avg_effectiveness = np.mean(effectiveness_data) if effectiveness_data else 0

        return {
            'has_data': True,
            'frequency': treatment_counts,
            'top_treatments': [{'treatment': t, 'count': c} for t, c in top_treatments],
            'average_effectiveness': round(avg_effectiveness, 1),
            'effectiveness_readings': len(effectiveness_data)
        }

    def _analyze_aura_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze aura patterns in headaches"""
        aura_episodes = []
        total_episodes = len(entries)

        for entry in entries:
            if entry.get('auraPresent', False):
                aura_episodes.append(entry)

        if total_episodes == 0:
            return {'has_data': False}

        aura_rate = (len(aura_episodes) / total_episodes) * 100

        # Analyze aura symptoms
        aura_symptoms = []
        for episode in aura_episodes:
            symptoms = episode.get('auraSymptoms', [])
            if isinstance(symptoms, list):
                aura_symptoms.extend(symptoms)

        symptom_counts = {}
        for symptom in aura_symptoms:
            symptom_counts[symptom] = symptom_counts.get(symptom, 0) + 1

        top_aura_symptoms = sorted(symptom_counts.items(), key=lambda x: x[1], reverse=True)[:5]

        return {
            'has_data': True,
            'aura_episodes': len(aura_episodes),
            'aura_rate': round(aura_rate, 1),
            'top_aura_symptoms': [{'symptom': s, 'count': c} for s, c in top_aura_symptoms]
        }

    def _analyze_functional_impact(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze functional impact of headaches"""
        impact_counts = {}
        for entry in entries:
            impact = entry.get('functionalImpact', 'none')
            impact_counts[impact] = impact_counts.get(impact, 0) + 1

        if not impact_counts:
            return {'has_data': False}

        # Calculate severe impact percentage
        severe_impacts = impact_counts.get('severe', 0) + impact_counts.get('disabling', 0)
        severe_percentage = (severe_impacts / len(entries)) * 100 if entries else 0

        return {
            'has_data': True,
            'distribution': impact_counts,
            'severe_percentage': round(severe_percentage, 1)
        }

    def _generate_headache_insights(self, entries, pain_analysis, trigger_analysis, aura_analysis) -> List[str]:
        """Generate insights for headache patterns"""
        insights = []

        # Episode frequency insight
        if len(entries) > 0:
            avg_per_week = (len(entries) / 30) * 7
            if avg_per_week > 4:
                insights.append(f"⚠️ High headache frequency: {avg_per_week:.1f} episodes per week")
            elif avg_per_week < 1:
                insights.append(f"✅ Low headache frequency: {avg_per_week:.1f} episodes per week")

        # Pain intensity insight
        if pain_analysis.get('has_data'):
            avg_intensity = pain_analysis['average']
            if avg_intensity >= 7:
                insights.append(f"🔴 High average pain intensity: {avg_intensity}/10")
            elif avg_intensity <= 4:
                insights.append(f"🟡 Moderate average pain intensity: {avg_intensity}/10")

        # Aura insight
        if aura_analysis.get('has_data') and aura_analysis['aura_rate'] > 0:
            insights.append(f"✨ Aura present in {aura_analysis['aura_rate']}% of episodes")

        # Top trigger insight
        if trigger_analysis.get('has_data') and trigger_analysis['top_triggers']:
            top_trigger = trigger_analysis['top_triggers'][0]
            insights.append(f"⚡ Most common trigger: {top_trigger['trigger']} ({top_trigger['count']} times)")

        return insights[:5]  # Limit to 5 insights

    def _generate_headache_charts(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate charts for headache analytics"""
        return {
            'pain_intensity': self._create_headache_intensity_chart(entries),
            'location_frequency': self._create_headache_location_chart(entries),
            'trigger_frequency': self._create_headache_trigger_chart(entries)
        }

    def _create_headache_intensity_chart(self, entries: List[Dict[str, Any]]) -> Optional[str]:
        """Create pain intensity distribution chart"""
        try:
            # Count intensity levels
            intensity_counts = {'Mild (1-3)': 0, 'Moderate (4-6)': 0, 'Severe (7-10)': 0}

            for entry in entries:
                intensity = entry.get('painIntensity', 0)
                if isinstance(intensity, (int, float)):
                    if 1 <= intensity <= 3:
                        intensity_counts['Mild (1-3)'] += 1
                    elif 4 <= intensity <= 6:
                        intensity_counts['Moderate (4-6)'] += 1
                    elif 7 <= intensity <= 10:
                        intensity_counts['Severe (7-10)'] += 1

            if sum(intensity_counts.values()) == 0:
                return None

            # Create chart
            labels = list(intensity_counts.keys())
            counts = list(intensity_counts.values())
            colors = ['#4ade80', '#fbbf24', '#ef4444']

            plt.figure(figsize=(8, 8))
            plt.pie(counts, labels=labels, autopct='%1.1f%%', colors=colors, startangle=90)
            plt.title('Headache Pain Intensity Distribution', fontsize=14, fontweight='bold')
            plt.axis('equal')

            # Convert to base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            chart_data = base64.b64encode(buffer.getvalue()).decode()
            plt.close()

            return f"data:image/png;base64,{chart_data}"

        except Exception as e:
            print(f"Headache intensity chart error: {e}")
            plt.close()
            return None

    def _create_headache_location_chart(self, entries: List[Dict[str, Any]]) -> Optional[str]:
        """Create pain location frequency chart"""
        try:
            # Count locations
            location_counts = {}
            for entry in entries:
                locations = entry.get('painLocation', [])
                if isinstance(locations, list):
                    for location in locations:
                        location_counts[location] = location_counts.get(location, 0) + 1

            if not location_counts:
                return None

            # Get top 8 locations
            top_locations = sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:8]
            locations, counts = zip(*top_locations)

            # Create chart
            plt.figure(figsize=(10, 6))
            bars = plt.bar(range(len(locations)), counts, color='#8b5cf6')
            plt.title('Most Common Headache Locations', fontsize=14, fontweight='bold')
            plt.xlabel('Location')
            plt.ylabel('Frequency')
            plt.xticks(range(len(locations)), locations, rotation=45, ha='right')

            # Add value labels on bars
            for bar, count in zip(bars, counts):
                plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1,
                        str(count), ha='center', va='bottom')

            plt.tight_layout()

            # Convert to base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            chart_data = base64.b64encode(buffer.getvalue()).decode()
            plt.close()

            return f"data:image/png;base64,{chart_data}"

        except Exception as e:
            print(f"Headache location chart error: {e}")
            plt.close()
            return None

    def _create_headache_trigger_chart(self, entries: List[Dict[str, Any]]) -> Optional[str]:
        """Create trigger frequency chart"""
        try:
            # Count triggers
            trigger_counts = {}
            for entry in entries:
                triggers = entry.get('triggers', [])
                if isinstance(triggers, list):
                    for trigger in triggers:
                        trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1

            if not trigger_counts:
                return None

            # Get top 6 triggers
            top_triggers = sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:6]
            triggers, counts = zip(*top_triggers)

            # Create chart
            plt.figure(figsize=(8, 8))
            colors = plt.cm.Set3(np.linspace(0, 1, len(triggers)))
            plt.pie(counts, labels=triggers, autopct='%1.1f%%', colors=colors, startangle=90)
            plt.title('Most Common Headache Triggers', fontsize=14, fontweight='bold')
            plt.axis('equal')

            # Convert to base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            chart_data = base64.b64encode(buffer.getvalue()).decode()
            plt.close()

            return f"data:image/png;base64,{chart_data}"

        except Exception as e:
            print(f"Headache trigger chart error: {e}")
            plt.close()
            return None

    def _get_fallback_head_pain_analytics(self) -> Dict[str, Any]:
        """Fallback analytics when no head pain data available"""
        return {
            'period': {
                'start': (datetime.now() - timedelta(days=30)).isoformat(),
                'end': datetime.now().isoformat(),
                'days': 30
            },
            'total_episodes': 0,
            'pain_intensity': {'has_data': False},
            'locations': {'has_data': False},
            'triggers': {'has_data': False},
            'treatments': {'has_data': False},
            'aura': {'has_data': False},
            'functional_impact': {'has_data': False},
            'insights': ['No headache episodes recorded in the selected time period'],
            'charts': {
                'pain_intensity': None,
                'location_frequency': None,
                'trigger_frequency': None
            }
        }
