"""
GENERAL PAIN ANALYTICS MODULE 🔥
Medical-grade general pain analytics for pain levels, locations, triggers, and treatment effectiveness.

Because pain tracking deserves proper analysis! ⚡💪
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

class PainAnalytics:
    """
    Specialized general pain analytics for comprehensive pain pattern analysis.
    Because understanding your pain patterns is the first step to managing them! 🔥
    """
    
    def analyze_pain(self, entries: List[Dict[str, Any]], date_range: int = 30) -> Dict[str, Any]:
        """
        Medical-grade general pain analytics 🔥
        Pain level analysis, location patterns, trigger identification, treatment effectiveness
        """
        try:
            if not entries:
                return self._get_fallback_pain_analytics()

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
                return self._get_fallback_pain_analytics()

            # Core analytics
            pain_level_analysis = self._analyze_pain_levels(analytics_entries)
            location_analysis = self._analyze_pain_locations(analytics_entries)
            trigger_analysis = self._analyze_pain_triggers(analytics_entries)
            treatment_analysis = self._analyze_treatment_effectiveness(analytics_entries)
            pattern_analysis = self._analyze_pain_patterns(analytics_entries)
            insights = self._generate_pain_insights(analytics_entries)
            charts = self._generate_pain_charts(analytics_entries)

            # 🚨 CRITICAL: Return data structure that matches frontend expectations
            return {
                'period': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat(),
                    'days': date_range
                },
                'total_entries': len(analytics_entries),
                'pain_level_analysis': {
                    'avg_pain_level': pain_level_analysis.get('avg_pain', 0),
                    'max_pain_level': pain_level_analysis.get('max_pain', 0),
                    'pain_distribution': pain_level_analysis.get('pain_counts', {}),
                    'high_pain_days': pain_level_analysis.get('high_pain_days', 0),
                    'pain_free_days': pain_level_analysis.get('pain_free_days', 0),
                    'pain_trend': pain_level_analysis.get('trend', 'stable')
                },
                'location_analysis': {
                    'location_frequency': location_analysis.get('location_counts', {}),
                    'most_common_location': location_analysis.get('most_common', 'Unknown'),
                    'affected_areas': location_analysis.get('total_areas', 0),
                    'location_patterns': location_analysis.get('patterns', {})
                },
                'trigger_analysis': {
                    'trigger_frequency': trigger_analysis.get('trigger_counts', {}),
                    'most_common_trigger': trigger_analysis.get('most_common', 'Unknown'),
                    'trigger_patterns': trigger_analysis.get('patterns', {}),
                    'avoidable_triggers': trigger_analysis.get('avoidable', [])
                },
                'treatment_analysis': {
                    'has_data': treatment_analysis.get('has_data', False),
                    'treatment_effectiveness': treatment_analysis.get('effectiveness', {}),
                    'most_effective_treatment': treatment_analysis.get('most_effective', 'Unknown'),
                    'avg_effectiveness': treatment_analysis.get('avg_effectiveness', 0),
                    'treatment_recommendations': treatment_analysis.get('recommendations', [])
                },
                'pattern_analysis': {
                    'pain_consistency': pattern_analysis.get('consistency', 0),
                    'weekly_patterns': pattern_analysis.get('weekly', {}),
                    'severity_trends': pattern_analysis.get('trends', {}),
                    'correlation_insights': pattern_analysis.get('correlations', [])
                },
                'insights': insights,
                'charts': charts
            }

        except Exception as e:
            print(f"Pain analytics error: {e}")
            return self._get_fallback_pain_analytics()

    def _analyze_pain_levels(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze pain level patterns and trends"""
        pain_levels = []
        pain_counts = {}
        high_pain_days = 0
        pain_free_days = 0
        
        for entry in entries:
            pain_level = entry.get('painLevel', 0)
            if isinstance(pain_level, (int, float)):
                pain_levels.append(pain_level)
                pain_counts[str(int(pain_level))] = pain_counts.get(str(int(pain_level)), 0) + 1
                
                if pain_level >= 7:
                    high_pain_days += 1
                elif pain_level == 0:
                    pain_free_days += 1

        avg_pain = np.mean(pain_levels) if pain_levels else 0
        max_pain = max(pain_levels) if pain_levels else 0
        
        # Simple trend analysis
        trend = 'stable'
        if len(pain_levels) >= 7:
            recent_avg = np.mean(pain_levels[-7:])
            older_avg = np.mean(pain_levels[:-7]) if len(pain_levels) > 7 else recent_avg
            
            if recent_avg > older_avg * 1.2:
                trend = 'worsening'
            elif recent_avg < older_avg * 0.8:
                trend = 'improving'
        
        return {
            'avg_pain': round(avg_pain, 1),
            'max_pain': max_pain,
            'pain_counts': pain_counts,
            'high_pain_days': high_pain_days,
            'pain_free_days': pain_free_days,
            'trend': trend
        }

    def _analyze_pain_locations(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze pain location patterns"""
        location_counts = {}
        all_locations = set()
        
        for entry in entries:
            locations = entry.get('painLocations', [])
            if isinstance(locations, list):
                for location in locations:
                    location_counts[location] = location_counts.get(location, 0) + 1
                    all_locations.add(location)

        most_common = max(location_counts.items(), key=lambda x: x[1])[0] if location_counts else 'Unknown'
        
        # Identify patterns (locations that often occur together)
        patterns = {}
        if len(all_locations) > 1:
            # Simple co-occurrence analysis
            for entry in entries:
                locations = entry.get('painLocations', [])
                if len(locations) > 1:
                    combo = ', '.join(sorted(locations))
                    patterns[combo] = patterns.get(combo, 0) + 1
        
        return {
            'location_counts': location_counts,
            'most_common': most_common,
            'total_areas': len(all_locations),
            'patterns': dict(sorted(patterns.items(), key=lambda x: x[1], reverse=True)[:5])
        }

    def _analyze_pain_triggers(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze pain trigger patterns"""
        trigger_counts = {}
        avoidable_triggers = ['stress', 'poor posture', 'dehydration', 'skipped meals', 'overexertion']
        
        for entry in entries:
            triggers = entry.get('painTriggers', [])
            if isinstance(triggers, list):
                for trigger in triggers:
                    trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1

        most_common = max(trigger_counts.items(), key=lambda x: x[1])[0] if trigger_counts else 'Unknown'
        
        # Identify avoidable triggers that are common
        avoidable = [trigger for trigger in avoidable_triggers 
                    if trigger in trigger_counts and trigger_counts[trigger] >= 2]
        
        return {
            'trigger_counts': trigger_counts,
            'most_common': most_common,
            'patterns': trigger_counts,
            'avoidable': avoidable
        }

    def _analyze_treatment_effectiveness(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze treatment effectiveness patterns"""
        treatment_effectiveness = {}
        effectiveness_scores = []
        
        for entry in entries:
            treatments = entry.get('treatments', [])
            effectiveness = entry.get('effectiveness', 0)
            
            if isinstance(treatments, list) and isinstance(effectiveness, (int, float)) and effectiveness > 0:
                effectiveness_scores.append(effectiveness)
                for treatment in treatments:
                    if treatment not in treatment_effectiveness:
                        treatment_effectiveness[treatment] = []
                    treatment_effectiveness[treatment].append(effectiveness)

        has_data = len(effectiveness_scores) > 0
        avg_effectiveness = np.mean(effectiveness_scores) if effectiveness_scores else 0
        
        # Calculate average effectiveness per treatment
        treatment_avgs = {}
        for treatment, scores in treatment_effectiveness.items():
            treatment_avgs[treatment] = round(np.mean(scores), 1)
        
        most_effective = max(treatment_avgs.items(), key=lambda x: x[1])[0] if treatment_avgs else 'Unknown'
        
        # Generate recommendations
        recommendations = []
        if has_data:
            if avg_effectiveness < 5:
                recommendations.append("Consider discussing alternative treatments with your healthcare provider.")
            
            effective_treatments = [t for t, score in treatment_avgs.items() if score >= 7]
            if effective_treatments:
                recommendations.append(f"Most effective treatments: {', '.join(effective_treatments[:3])}")
        
        return {
            'has_data': has_data,
            'effectiveness': treatment_avgs,
            'most_effective': most_effective,
            'avg_effectiveness': round(avg_effectiveness, 1),
            'recommendations': recommendations
        }

    def _analyze_pain_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze temporal and severity patterns"""
        pain_levels = [entry.get('painLevel', 0) for entry in entries if isinstance(entry.get('painLevel'), (int, float))]
        
        # Calculate consistency (lower std dev = more consistent pain levels)
        consistency = 100 - (np.std(pain_levels) * 10) if pain_levels else 0
        consistency = max(0, min(100, consistency))
        
        # Weekly patterns (if we have date info)
        weekly_patterns = {}
        for entry in entries:
            try:
                entry_date = datetime.fromisoformat(entry.get('date', ''))
                day_name = entry_date.strftime('%A')
                pain_level = entry.get('painLevel', 0)
                if day_name not in weekly_patterns:
                    weekly_patterns[day_name] = []
                weekly_patterns[day_name].append(pain_level)
            except (ValueError, TypeError):
                continue
        
        # Average pain by day of week
        weekly_avgs = {day: round(np.mean(levels), 1) for day, levels in weekly_patterns.items()}
        
        return {
            'consistency': round(consistency, 1),
            'weekly': weekly_avgs,
            'trends': {},
            'correlations': []
        }

    def _generate_pain_insights(self, entries: List[Dict[str, Any]]) -> List[str]:
        """Generate medical insights about pain patterns"""
        insights = []
        
        if len(entries) > 0:
            insights.append(f"Analyzed {len(entries)} pain episodes over the selected period.")
            
            # Pain level insights
            pain_levels = [entry.get('painLevel', 0) for entry in entries if isinstance(entry.get('painLevel'), (int, float))]
            if pain_levels:
                avg_pain = np.mean(pain_levels)
                high_pain_count = sum(1 for level in pain_levels if level >= 7)
                
                if avg_pain >= 6:
                    insights.append("⚠️ Average pain levels are high. Consider consulting with your healthcare provider.")
                elif avg_pain <= 3:
                    insights.append("✅ Average pain levels are relatively low and manageable.")
                
                if high_pain_count > len(pain_levels) * 0.3:
                    insights.append("📊 Frequent high-pain episodes detected. Pain management strategies may need adjustment.")
            
            # Location insights
            location_counts = {}
            for entry in entries:
                locations = entry.get('painLocations', [])
                if isinstance(locations, list):
                    for location in locations:
                        location_counts[location] = location_counts.get(location, 0) + 1
            
            if location_counts:
                most_common_location = max(location_counts.items(), key=lambda x: x[1])[0]
                insights.append(f"🎯 Most affected area: {most_common_location}")
        
        return insights

    def _generate_pain_charts(self, entries: List[Dict[str, Any]]) -> Dict[str, str]:
        """Generate pain analytics charts"""
        charts = {}
        
        try:
            # Pain level distribution chart
            pain_levels = [entry.get('painLevel', 0) for entry in entries if isinstance(entry.get('painLevel'), (int, float))]
            
            if pain_levels:
                plt.figure(figsize=(10, 6))
                plt.hist(pain_levels, bins=range(0, 12), alpha=0.7, color='#ef4444', edgecolor='black')
                plt.title('Pain Level Distribution 🔥')
                plt.xlabel('Pain Level (0-10)')
                plt.ylabel('Frequency')
                plt.xticks(range(0, 11))
                plt.grid(True, alpha=0.3)
                plt.tight_layout()
                
                buffer = BytesIO()
                plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
                buffer.seek(0)
                chart_data = base64.b64encode(buffer.getvalue()).decode()
                charts['pain_distribution'] = f"data:image/png;base64,{chart_data}"
                plt.close()
                
        except Exception as e:
            print(f"Pain chart error: {e}")
            plt.close()
        
        return charts

    def _get_fallback_pain_analytics(self) -> Dict[str, Any]:
        """Fallback analytics when no data available"""
        return {
            'period': {
                'start': datetime.now().isoformat(),
                'end': datetime.now().isoformat(),
                'days': 30
            },
            'total_entries': 0,
            'pain_level_analysis': {
                'avg_pain_level': 0,
                'max_pain_level': 0,
                'pain_distribution': {},
                'high_pain_days': 0,
                'pain_free_days': 0,
                'pain_trend': 'stable'
            },
            'location_analysis': {
                'location_frequency': {},
                'most_common_location': 'None',
                'affected_areas': 0,
                'location_patterns': {}
            },
            'trigger_analysis': {
                'trigger_frequency': {},
                'most_common_trigger': 'None',
                'trigger_patterns': {},
                'avoidable_triggers': []
            },
            'treatment_analysis': {
                'has_data': False,
                'treatment_effectiveness': {},
                'most_effective_treatment': 'None',
                'avg_effectiveness': 0,
                'treatment_recommendations': []
            },
            'pattern_analysis': {
                'pain_consistency': 0,
                'weekly_patterns': {},
                'severity_trends': {},
                'correlation_insights': []
            },
            'insights': ['No pain data available for analysis'],
            'charts': {}
        }
