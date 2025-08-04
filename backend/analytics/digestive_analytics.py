"""
UPPER DIGESTIVE ANALYTICS MODULE 🤢
Medical-grade upper digestive analytics for nausea, heartburn, reflux, and upper GI symptoms.

Symptom patterns, trigger analysis, treatment effectiveness.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64

class DigestiveAnalytics:
    """
    Specialized upper digestive analytics for the chronically nauseous.
    Because nobody should have to suffer through reflux without data!
    """
    
    def analyze_upper_digestive(self, entries: List[Dict[str, Any]], date_range: int = 30) -> Dict[str, Any]:
        """
        Medical-grade upper digestive analytics 🤢
        Symptom patterns, trigger analysis, treatment effectiveness
        """
        try:
            if not entries:
                return self._get_fallback_upper_digestive_analytics()

            print(f"🔍 DEBUG: Received {len(entries)} entries")
            if entries:
                print(f"🔍 DEBUG: Sample entry: {entries[0]}")

            # Filter out NOPE entries and recent entries
            end_date = datetime.now()
            start_date = end_date - timedelta(days=date_range)

            analytics_entries = []
            for entry in entries:
                # Skip NOPE entries
                if entry.get('tags', []) and 'NOPE' in entry.get('tags', []):
                    continue

                # Handle date parsing safely
                entry_date_str = entry.get('date', '')
                if not entry_date_str:
                    print(f"🔍 DEBUG: Entry missing date: {entry}")
                    continue

                try:
                    entry_date = datetime.fromisoformat(entry_date_str)
                    if entry_date >= start_date:
                        analytics_entries.append(entry)
                    else:
                        print(f"🔍 DEBUG: Entry too old: {entry_date_str} < {start_date}")
                except ValueError as e:
                    print(f"🔍 DEBUG: Date parse error for '{entry_date_str}': {e}")
                    continue

            if not analytics_entries:
                return self._get_fallback_upper_digestive_analytics()

            # Core analytics
            symptom_analysis = self._analyze_symptom_patterns(analytics_entries)
            severity_analysis = self._analyze_severity_patterns(analytics_entries)
            trigger_analysis = self._analyze_trigger_patterns(analytics_entries)
            treatment_analysis = self._analyze_treatment_effectiveness(analytics_entries)
            timing_analysis = self._analyze_timing_patterns(analytics_entries)

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
                'symptom_analysis': {
                    'avg_severity': severity_analysis.get('avg_severity', 0),
                    'max_severity': severity_analysis.get('max_severity', 0),
                    'severity_distribution': severity_analysis.get('severity_distribution', {}),
                    'symptom_types': symptom_analysis.get('symptom_counts', {}),
                    'most_common_symptom': symptom_analysis.get('most_common', 'Unknown')
                },
                'duration': {
                    'has_data': False,  # Add duration tracking later
                    'avg_duration': 0,
                    'total_minutes': 0,
                    'longest_episode': 0,
                    'shortest_episode': 0
                },
                'triggers': {
                    'trigger_counts': trigger_analysis.get('trigger_counts', {}),
                    'top_triggers': trigger_analysis.get('top_triggers', [])
                },
                'foods': {
                    'food_counts': {},  # Add food tracking later
                    'problematic_foods': []
                },
                'medications': {
                    'medication_counts': treatment_analysis.get('treatment_counts', {}),
                    'effectiveness_avg': treatment_analysis.get('effectiveness_avg', {}),
                    'most_effective': treatment_analysis.get('most_effective', [])
                },
                'patterns': {
                    'episodes_by_day': timing_analysis.get('episodes_by_day', {}),
                    'episodes_by_hour': timing_analysis.get('episodes_by_hour', {}),
                    'weekly_average': timing_analysis.get('weekly_average', 0),
                    'daily_average': timing_analysis.get('daily_average', 0)
                },
                'relief': {
                    'relief_methods': treatment_analysis.get('treatment_counts', {}),
                    'avg_effectiveness': treatment_analysis.get('avg_effectiveness', 0)
                },
                'insights': insights,
                'charts': charts
            }

        except Exception as e:
            print(f"Upper digestive analytics error: {e}")
            return self._get_fallback_upper_digestive_analytics()

    def _analyze_symptom_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze symptom frequency and patterns"""
        symptom_counts = {}
        
        for entry in entries:
            symptoms = entry.get('symptoms', [])
            if isinstance(symptoms, list):
                for symptom in symptoms:
                    symptom_counts[symptom] = symptom_counts.get(symptom, 0) + 1

        most_common = max(symptom_counts.items(), key=lambda x: x[1])[0] if symptom_counts else 'None'

        return {
            'symptom_counts': symptom_counts,
            'total_symptoms': sum(symptom_counts.values()),
            'unique_symptoms': len(symptom_counts),
            'most_common': most_common
        }

    def _analyze_severity_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze severity distribution"""
        severity_counts = {}
        severity_values = []
        
        for entry in entries:
            severity = entry.get('severity')
            if severity:
                severity_counts[severity] = severity_counts.get(severity, 0) + 1
                # Convert severity to numeric for analysis
                if severity == 'mild':
                    severity_values.append(1)
                elif severity == 'moderate':
                    severity_values.append(2)
                elif severity == 'severe':
                    severity_values.append(3)

        avg_severity = np.mean(severity_values) if severity_values else 0

        max_severity = max(severity_values) if severity_values else 0

        return {
            'severity_distribution': severity_counts,
            'avg_severity': round(avg_severity, 1),
            'max_severity': max_severity,
            'total_episodes': len(entries)
        }

    def _analyze_trigger_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze common triggers"""
        trigger_counts = {}
        
        for entry in entries:
            triggers = entry.get('triggers', [])
            if isinstance(triggers, list):
                for trigger in triggers:
                    trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1

        return {
            'trigger_frequency': trigger_counts,
            'total_triggers': sum(trigger_counts.values()),
            'unique_triggers': len(trigger_counts)
        }

    def _analyze_treatment_effectiveness(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze treatment effectiveness"""
        treatment_counts = {}
        effectiveness_scores = []
        
        for entry in entries:
            treatments = entry.get('treatments', [])
            effectiveness = entry.get('treatmentEffectiveness')
            
            if isinstance(treatments, list):
                for treatment in treatments:
                    treatment_counts[treatment] = treatment_counts.get(treatment, 0) + 1
            
            if effectiveness:
                # Convert effectiveness to numeric
                if effectiveness == 'very_effective':
                    effectiveness_scores.append(4)
                elif effectiveness == 'effective':
                    effectiveness_scores.append(3)
                elif effectiveness == 'somewhat_effective':
                    effectiveness_scores.append(2)
                elif effectiveness == 'not_effective':
                    effectiveness_scores.append(1)

        avg_effectiveness = np.mean(effectiveness_scores) if effectiveness_scores else 0

        return {
            'treatment_frequency': treatment_counts,
            'average_effectiveness': round(avg_effectiveness, 1),
            'total_treatments': sum(treatment_counts.values())
        }

    def _analyze_timing_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze timing patterns of episodes"""
        time_of_day_counts = {}
        
        for entry in entries:
            time_str = entry.get('time', '')
            if time_str:
                try:
                    hour = int(time_str.split(':')[0])
                    if 6 <= hour < 12:
                        period = 'morning'
                    elif 12 <= hour < 18:
                        period = 'afternoon'
                    elif 18 <= hour < 22:
                        period = 'evening'
                    else:
                        period = 'night'
                    
                    time_of_day_counts[period] = time_of_day_counts.get(period, 0) + 1
                except (ValueError, IndexError):
                    continue

        return {
            'time_of_day_distribution': time_of_day_counts,
            'peak_time': max(time_of_day_counts.items(), key=lambda x: x[1])[0] if time_of_day_counts else None
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
        symptoms = symptom_analysis.get('symptom_frequency', {})
        if symptoms:
            top_symptom = max(symptoms.items(), key=lambda x: x[1])
            insights.append(f"🔍 Most common symptom: {top_symptom[0]} ({top_symptom[1]} times)")

        # Top trigger insight
        triggers = trigger_analysis.get('trigger_frequency', {})
        if triggers:
            top_trigger = max(triggers.items(), key=lambda x: x[1])
            insights.append(f"⚡ Most common trigger: {top_trigger[0]} ({top_trigger[1]} times)")

        # Treatment insight
        treatments = treatment_analysis.get('treatment_frequency', {})
        if treatments:
            top_treatment = max(treatments.items(), key=lambda x: x[1])
            insights.append(f"💊 Most used treatment: {top_treatment[0]} ({top_treatment[1]} times)")

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
                'start': datetime.now().isoformat(),
                'end': datetime.now().isoformat(),
                'days': 30
            },
            'total_episodes': 0,
            'symptom_analysis': {
                'avg_severity': 0,
                'max_severity': 0,
                'severity_distribution': {},
                'symptom_types': {},
                'most_common_symptom': 'None'
            },
            'duration': {
                'has_data': False,
                'avg_duration': 0,
                'total_minutes': 0,
                'longest_episode': 0,
                'shortest_episode': 0
            },
            'triggers': {
                'trigger_counts': {},
                'top_triggers': []
            },
            'foods': {
                'food_counts': {},
                'problematic_foods': []
            },
            'medications': {
                'medication_counts': {},
                'effectiveness_avg': {},
                'most_effective': []
            },
            'patterns': {
                'episodes_by_day': {},
                'episodes_by_hour': {},
                'weekly_average': 0,
                'daily_average': 0
            },
            'relief': {
                'relief_methods': {},
                'avg_effectiveness': 0
            },
            'insights': ['No upper digestive data available for analysis'],
            'charts': {}
        }
