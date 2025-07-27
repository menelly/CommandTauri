"""
DASHBOARD ANALYTICS MODULE 📊
Generates dashboard analytics from user data across all trackers.

Focused on summary stats, trends, patterns, and insights.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any

class DashboardAnalytics:
    """
    Dashboard analytics that pull together data from all trackers.
    Provides high-level insights and trends.
    """
    
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
            print(f"Dashboard generation error: {e}")
            return self._get_fallback_dashboard(date_range)

    def _generate_summary(self, user_data: Dict[str, Any], date_range: int) -> Dict[str, Any]:
        """Generate summary statistics"""
        summary = {
            'total_entries': 0,
            'active_days': 0,
            'avg_daily_activity': 0,
            'top_categories': {},
            'data_quality_score': 0
        }

        # Count entries across all categories
        total_entries = 0
        active_days = set()
        category_counts = {}

        for category, data in user_data.items():
            if isinstance(data, list):
                total_entries += len(data)
                category_counts[category] = len(data)
                
                # Track active days
                for entry in data:
                    if isinstance(entry, dict) and 'date' in entry:
                        active_days.add(entry['date'])

        summary.update({
            'total_entries': total_entries,
            'active_days': len(active_days),
            'avg_daily_activity': round(total_entries / max(1, date_range), 1),
            'top_categories': dict(sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:5]),
            'data_quality_score': min(100, round((len(active_days) / date_range) * 100, 1))
        })

        return summary

    def _analyze_trends(self, user_data: Dict[str, Any], date_range: int) -> Dict[str, Any]:
        """Analyze trends in the data"""
        trends = {
            'activity_trend': 'stable',
            'consistency_score': 0,
            'peak_activity_day': None,
            'trending_categories': []
        }

        # Analyze daily activity patterns
        daily_counts = {}
        for category, data in user_data.items():
            if isinstance(data, list):
                for entry in data:
                    if isinstance(entry, dict) and 'date' in entry:
                        date = entry['date']
                        daily_counts[date] = daily_counts.get(date, 0) + 1

        if daily_counts:
            # Find peak activity day
            peak_day = max(daily_counts.items(), key=lambda x: x[1])
            trends['peak_activity_day'] = peak_day[0]
            
            # Calculate consistency score
            values = list(daily_counts.values())
            if len(values) > 1:
                consistency = 100 - (np.std(values) / np.mean(values) * 100)
                trends['consistency_score'] = max(0, round(consistency, 1))

        return trends

    def _find_patterns(self, user_data: Dict[str, Any], date_range: int) -> Dict[str, Any]:
        """Find patterns in the data"""
        patterns = {
            'common_times': {},
            'weekly_patterns': {},
            'correlation_hints': []
        }

        # Analyze time patterns
        time_counts = {}
        for category, data in user_data.items():
            if isinstance(data, list):
                for entry in data:
                    if isinstance(entry, dict) and 'time' in entry:
                        hour = entry['time'].split(':')[0] if ':' in entry['time'] else None
                        if hour and hour.isdigit():
                            time_counts[int(hour)] = time_counts.get(int(hour), 0) + 1

        # Group into time periods
        if time_counts:
            morning = sum(time_counts.get(h, 0) for h in range(6, 12))
            afternoon = sum(time_counts.get(h, 0) for h in range(12, 18))
            evening = sum(time_counts.get(h, 0) for h in range(18, 22))
            night = sum(time_counts.get(h, 0) for h in range(22, 24)) + sum(time_counts.get(h, 0) for h in range(0, 6))
            
            patterns['common_times'] = {
                'morning': morning,
                'afternoon': afternoon,
                'evening': evening,
                'night': night
            }

        return patterns

    def _generate_insights(self, user_data: Dict[str, Any], date_range: int) -> List[str]:
        """Generate insights from the data"""
        insights = []

        # Data quality insights
        total_entries = sum(len(data) if isinstance(data, list) else 0 for data in user_data.values())
        
        if total_entries >= 50:
            insights.append("🎯 Excellent data collection! You have rich data for pattern analysis.")
        elif total_entries >= 20:
            insights.append("📈 Great tracking consistency! Patterns are becoming visible.")
        elif total_entries >= 5:
            insights.append("🌟 Good start on data tracking! Keep building your health picture.")
        else:
            insights.append("💜 Every data point you track helps build valuable health insights!")

        # Activity insights
        active_categories = len([k for k, v in user_data.items() if isinstance(v, list) and len(v) > 0])
        if active_categories >= 3:
            insights.append(f"🔄 You're actively tracking {active_categories} different areas - comprehensive approach!")
        elif active_categories >= 1:
            insights.append("✨ Focused tracking approach - quality over quantity!")

        return insights[:2]  # Limit to 2 insights

    def _generate_charts(self, user_data: Dict[str, Any], date_range: int) -> Dict[str, Any]:
        """Generate dashboard charts"""
        # Placeholder for chart generation
        return {
            'activity_timeline': None,
            'category_distribution': None,
            'weekly_heatmap': None
        }

    def _get_fallback_dashboard(self, date_range: int) -> Dict[str, Any]:
        """Fallback dashboard when generation fails"""
        return {
            'error': 'Dashboard generation failed',
            'period': {'start': '', 'end': '', 'days': date_range},
            'summary': {},
            'trends': {},
            'patterns': {},
            'insights': ['Dashboard temporarily unavailable'],
            'charts': {}
        }
