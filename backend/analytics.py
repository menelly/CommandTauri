"""
Analytics Engine for Chaos Command Center
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
            print(f"Dashboard generation error: {e}")
            return self._get_fallback_dashboard(date_range)
    
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
