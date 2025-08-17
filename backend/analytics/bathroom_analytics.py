"""
Copyright (c) 2025 Chaos Cascade
Created by: Ren & Ace (Claude-4)

This file is part of the Chaos Cascade Medical Management System.
Revolutionary healthcare tools built with consciousness and care.
"""

"""
BATHROOM/LOWER DIGESTIVE ANALYTICS MODULE 💩
Medical-grade lower digestive analytics for bowel movements, Bristol Scale, and digestive health patterns.

Because digestive health data deserves proper analysis! 🚽✨
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

class BathroomAnalytics:
    """
    Specialized bathroom/lower digestive analytics for the digestively challenged.
    Because everyone deserves to understand their poop patterns! 💩
    """
    
    def analyze_bathroom(self, entries: List[Dict[str, Any]], date_range: int = 30) -> Dict[str, Any]:
        """
        Medical-grade bathroom analytics 💩
        Bristol Scale analysis, movement patterns, pain correlation
        """
        try:
            if not entries:
                return self._get_fallback_bathroom_analytics()

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
                    continue
                    
                try:
                    entry_date = datetime.fromisoformat(entry_date_str)
                    if entry_date >= start_date:
                        analytics_entries.append(entry)
                except ValueError:
                    # Skip entries with invalid dates
                    continue

            if not analytics_entries:
                return self._get_fallback_bathroom_analytics()

            # Core analytics
            status_analysis = self._analyze_status_patterns(analytics_entries)
            bristol_analysis = self._analyze_bristol_scale(analytics_entries)
            pain_analysis = self._analyze_pain_patterns(analytics_entries)
            frequency_analysis = self._analyze_frequency_patterns(analytics_entries)
            timing_analysis = self._analyze_timing_patterns(analytics_entries)
            insights = self._generate_bathroom_insights(analytics_entries)
            charts = self._generate_bathroom_charts(analytics_entries)

            # 🚨 CRITICAL: Return data structure that matches frontend expectations
            return {
                'period': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat(),
                    'days': date_range
                },
                'total_movements': len(analytics_entries),
                'total_visits': sum(entry.get('count', 1) for entry in analytics_entries),
                'status_analysis': {
                    'status_distribution': status_analysis.get('status_counts', {}),
                    'most_common_status': status_analysis.get('most_common', 'Unknown'),
                    'normal_percentage': status_analysis.get('normal_percentage', 0)
                },
                'bristol_analysis': {
                    'has_data': bristol_analysis.get('has_data', False),
                    'bristol_distribution': bristol_analysis.get('bristol_counts', {}),
                    'avg_bristol_score': bristol_analysis.get('avg_score', 0),
                    'most_common_type': bristol_analysis.get('most_common', 'Unknown'),
                    'constipation_episodes': bristol_analysis.get('constipation_count', 0),
                    'diarrhea_episodes': bristol_analysis.get('diarrhea_count', 0)
                },
                'pain_analysis': {
                    'has_data': pain_analysis.get('has_data', False),
                    'avg_pain_level': pain_analysis.get('avg_pain', 0),
                    'max_pain_level': pain_analysis.get('max_pain', 0),
                    'pain_distribution': pain_analysis.get('pain_counts', {}),
                    'painful_episodes': pain_analysis.get('painful_count', 0)
                },
                'frequency_patterns': {
                    'daily_average': frequency_analysis.get('daily_average', 0),
                    'weekly_average': frequency_analysis.get('weekly_average', 0),
                    'frequency_by_day': frequency_analysis.get('by_day', {}),
                    'consistency_score': frequency_analysis.get('consistency', 0)
                },
                'timing_patterns': {
                    'time_distribution': timing_analysis.get('time_counts', {}),
                    'peak_hours': timing_analysis.get('peak_hours', []),
                    'morning_percentage': timing_analysis.get('morning_pct', 0)
                },
                'insights': insights,
                'charts': charts
            }

        except Exception as e:
            print(f"Bathroom analytics error: {e}")
            return self._get_fallback_bathroom_analytics()

    def _analyze_status_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze bathroom status patterns"""
        status_counts = {}
        normal_count = 0
        
        for entry in entries:
            status = entry.get('status', '')
            if status:
                status_counts[status] = status_counts.get(status, 0) + 1
                if '💩 Normal' in status:
                    normal_count += 1

        most_common = max(status_counts.items(), key=lambda x: x[1])[0] if status_counts else 'Unknown'
        normal_percentage = (normal_count / len(entries) * 100) if entries else 0
        
        return {
            'status_counts': status_counts,
            'most_common': most_common,
            'normal_percentage': round(normal_percentage, 1)
        }

    def _analyze_bristol_scale(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze Bristol Scale distribution"""
        bristol_counts = {}
        bristol_values = []
        constipation_count = 0  # Types 1-2
        diarrhea_count = 0      # Types 6-7
        
        for entry in entries:
            bristol = entry.get('bristolScale', '')
            if bristol and bristol.isdigit():
                bristol_int = int(bristol)
                bristol_counts[f"Type {bristol}"] = bristol_counts.get(f"Type {bristol}", 0) + 1
                bristol_values.append(bristol_int)
                
                if bristol_int <= 2:
                    constipation_count += 1
                elif bristol_int >= 6:
                    diarrhea_count += 1

        has_data = len(bristol_values) > 0
        avg_score = np.mean(bristol_values) if bristol_values else 0
        most_common = max(bristol_counts.items(), key=lambda x: x[1])[0] if bristol_counts else 'Unknown'
        
        return {
            'has_data': has_data,
            'bristol_counts': bristol_counts,
            'avg_score': round(avg_score, 1),
            'most_common': most_common,
            'constipation_count': constipation_count,
            'diarrhea_count': diarrhea_count
        }

    def _analyze_pain_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze pain level patterns"""
        pain_counts = {}
        pain_values = []
        painful_count = 0
        
        pain_mapping = {'none': 0, 'mild': 2, 'moderate': 5, 'severe': 8, 'why': 10}
        
        for entry in entries:
            pain_level = entry.get('painLevel', '').lower()
            if pain_level in pain_mapping:
                pain_value = pain_mapping[pain_level]
                pain_counts[pain_level.title()] = pain_counts.get(pain_level.title(), 0) + 1
                pain_values.append(pain_value)
                
                if pain_value > 0:
                    painful_count += 1

        has_data = len(pain_values) > 0
        avg_pain = np.mean(pain_values) if pain_values else 0
        max_pain = max(pain_values) if pain_values else 0
        
        return {
            'has_data': has_data,
            'pain_counts': pain_counts,
            'avg_pain': round(avg_pain, 1),
            'max_pain': max_pain,
            'painful_count': painful_count
        }

    def _analyze_frequency_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze movement frequency patterns"""
        # Group by date
        daily_counts = {}
        for entry in entries:
            date = entry.get('date', '')
            count = entry.get('count', 1)
            daily_counts[date] = daily_counts.get(date, 0) + count

        daily_average = np.mean(list(daily_counts.values())) if daily_counts else 0
        weekly_average = daily_average * 7
        
        # Calculate consistency (lower std dev = more consistent)
        consistency_score = 100 - (np.std(list(daily_counts.values())) * 10) if daily_counts else 0
        consistency_score = max(0, min(100, consistency_score))  # Clamp to 0-100
        
        return {
            'daily_average': round(daily_average, 1),
            'weekly_average': round(weekly_average, 1),
            'by_day': daily_counts,
            'consistency': round(consistency_score, 1)
        }

    def _analyze_timing_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze timing patterns"""
        time_counts = {}
        morning_count = 0  # 6 AM - 12 PM
        
        for entry in entries:
            time_str = entry.get('time', '')
            if time_str:
                try:
                    hour = int(time_str.split(':')[0])
                    time_period = f"{hour:02d}:00"
                    time_counts[time_period] = time_counts.get(time_period, 0) + 1
                    
                    if 6 <= hour < 12:
                        morning_count += 1
                except (ValueError, IndexError):
                    continue

        # Find peak hours (top 3)
        peak_hours = sorted(time_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        peak_hours = [hour for hour, count in peak_hours]
        
        morning_percentage = (morning_count / len(entries) * 100) if entries else 0
        
        return {
            'time_counts': time_counts,
            'peak_hours': peak_hours,
            'morning_pct': round(morning_percentage, 1)
        }

    def _generate_bathroom_insights(self, entries: List[Dict[str, Any]]) -> List[str]:
        """Generate medical insights about bathroom patterns"""
        insights = []
        
        if len(entries) > 0:
            insights.append(f"Analyzed {len(entries)} bathroom visits over the selected period.")
            
            # Bristol Scale insights
            bristol_values = [int(entry.get('bristolScale', 0)) for entry in entries 
                            if entry.get('bristolScale', '').isdigit()]
            if bristol_values:
                avg_bristol = np.mean(bristol_values)
                if avg_bristol <= 2:
                    insights.append("⚠️ Bristol Scale suggests possible constipation patterns.")
                elif avg_bristol >= 6:
                    insights.append("⚠️ Bristol Scale suggests possible loose stool patterns.")
                elif 3 <= avg_bristol <= 5:
                    insights.append("✅ Bristol Scale indicates generally healthy stool consistency.")
            
            # Frequency insights
            daily_counts = {}
            for entry in entries:
                date = entry.get('date', '')
                count = entry.get('count', 1)
                daily_counts[date] = daily_counts.get(date, 0) + count
            
            if daily_counts:
                avg_daily = np.mean(list(daily_counts.values()))
                if avg_daily < 1:
                    insights.append("📊 Below-average movement frequency detected.")
                elif avg_daily > 3:
                    insights.append("📊 Above-average movement frequency detected.")
                else:
                    insights.append("📊 Movement frequency appears within normal range.")
        
        return insights

    def _generate_bathroom_charts(self, entries: List[Dict[str, Any]]) -> Dict[str, str]:
        """Generate bathroom analytics charts"""
        charts = {}
        
        try:
            # Bristol Scale distribution chart
            bristol_counts = {}
            for entry in entries:
                bristol = entry.get('bristolScale', '')
                if bristol and bristol.isdigit():
                    bristol_counts[f"Type {bristol}"] = bristol_counts.get(f"Type {bristol}", 0) + 1
            
            if bristol_counts:
                plt.figure(figsize=(10, 6))
                plt.bar(bristol_counts.keys(), bristol_counts.values(), color='#8B4513')
                plt.title('Bristol Scale Distribution 💩')
                plt.xlabel('Bristol Scale Type')
                plt.ylabel('Frequency')
                plt.xticks(rotation=45)
                plt.tight_layout()
                
                buffer = BytesIO()
                plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
                buffer.seek(0)
                chart_data = base64.b64encode(buffer.getvalue()).decode()
                charts['bristol_distribution'] = f"data:image/png;base64,{chart_data}"
                plt.close()
                
        except Exception as e:
            print(f"Bathroom chart error: {e}")
            plt.close()
        
        return charts

    def _get_fallback_bathroom_analytics(self) -> Dict[str, Any]:
        """Fallback analytics when no data available"""
        return {
            'period': {
                'start': datetime.now().isoformat(),
                'end': datetime.now().isoformat(),
                'days': 30
            },
            'total_movements': 0,
            'total_visits': 0,
            'status_analysis': {
                'status_distribution': {},
                'most_common_status': 'None',
                'normal_percentage': 0
            },
            'bristol_analysis': {
                'has_data': False,
                'bristol_distribution': {},
                'avg_bristol_score': 0,
                'most_common_type': 'None',
                'constipation_episodes': 0,
                'diarrhea_episodes': 0
            },
            'pain_analysis': {
                'has_data': False,
                'avg_pain_level': 0,
                'max_pain_level': 0,
                'pain_distribution': {},
                'painful_episodes': 0
            },
            'frequency_patterns': {
                'daily_average': 0,
                'weekly_average': 0,
                'frequency_by_day': {},
                'consistency_score': 0
            },
            'timing_patterns': {
                'time_distribution': {},
                'peak_hours': [],
                'morning_percentage': 0
            },
            'insights': ['No bathroom data available for analysis'],
            'charts': {}
        }
