"""
HEAD PAIN ANALYTICS MODULE 🧠
Medical-grade head pain analytics for migraine patterns, trigger analysis, aura detection, treatment effectiveness.

Because migraines are NOT just headaches!
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

class HeadPainAnalytics:
    """
    Specialized head pain analytics for migraine warriors.
    Tracks patterns, triggers, auras, and treatment effectiveness.
    """
    
    def analyze_head_pain(self, entries: List[Dict[str, Any]], date_range: int = 30) -> Dict[str, Any]:
        """
        Medical-grade head pain analytics 🧠
        Migraine patterns, trigger analysis, aura detection, treatment effectiveness
        """
        try:
            print(f"🧠 Head pain analytics received {len(entries)} entries")
            if not entries:
                print("🧠 No entries provided, returning fallback")
                return self._get_fallback_head_pain_analytics()

            # Filter out NOPE entries and recent entries
            end_date = datetime.now()
            start_date = end_date - timedelta(days=date_range)

            analytics_entries = []
            for entry in entries:
                # Skip NOPE entries
                if entry.get('tags', []) and 'NOPE' in entry.get('tags', []):
                    continue

                # Parse date safely
                entry_date_str = entry.get('date', '')
                if not entry_date_str:
                    continue

                try:
                    # Try different date formats
                    if 'T' in entry_date_str:
                        entry_date = datetime.fromisoformat(entry_date_str.replace('Z', '+00:00'))
                    else:
                        # Handle YYYY-MM-DD format
                        entry_date = datetime.strptime(entry_date_str, '%Y-%m-%d')

                    # Convert to date for comparison (ignore time)
                    entry_date_only = entry_date.date()
                    start_date_only = start_date.date()

                    if entry_date_only >= start_date_only:
                        analytics_entries.append(entry)
                        print(f"🧠 Added entry from {entry_date_str}")
                    else:
                        print(f"🧠 Skipped entry from {entry_date_str} (outside date range)")
                except (ValueError, TypeError) as e:
                    print(f"🧠 Skipping entry with invalid date format: {entry_date_str} - {e}")
                    continue

            print(f"🧠 After filtering: {len(analytics_entries)} valid entries for analysis")
            if not analytics_entries:
                print("🧠 No valid entries after filtering, returning fallback")
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
        """Analyze pain intensity patterns"""
        intensity_counts = {}
        intensity_values = []
        
        for entry in entries:
            intensity = entry.get('painIntensity')
            if intensity:
                intensity_counts[intensity] = intensity_counts.get(intensity, 0) + 1
                # Convert to numeric for analysis
                intensity_map = {
                    'mild': 1, 'moderate': 2, 'severe': 3, 'very_severe': 4
                }
                if intensity in intensity_map:
                    intensity_values.append(intensity_map[intensity])

        avg_intensity = np.mean(intensity_values) if intensity_values else 0

        return {
            'intensity_distribution': intensity_counts,
            'average_intensity': round(avg_intensity, 1),
            'total_episodes': len(entries)
        }

    def _analyze_pain_locations(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze pain location patterns"""
        location_counts = {}
        
        for entry in entries:
            locations = entry.get('painLocation', [])
            if isinstance(locations, list):
                for location in locations:
                    location_counts[location] = location_counts.get(location, 0) + 1

        return {
            'location_frequency': location_counts,
            'total_locations': sum(location_counts.values()),
            'unique_locations': len(location_counts)
        }

    def _analyze_headache_triggers(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze headache triggers"""
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

    def _analyze_headache_treatments(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
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
                effectiveness_map = {
                    'very_effective': 4, 'effective': 3, 
                    'somewhat_effective': 2, 'not_effective': 1
                }
                if effectiveness in effectiveness_map:
                    effectiveness_scores.append(effectiveness_map[effectiveness])

        avg_effectiveness = np.mean(effectiveness_scores) if effectiveness_scores else 0

        return {
            'treatment_frequency': treatment_counts,
            'average_effectiveness': round(avg_effectiveness, 1),
            'total_treatments': sum(treatment_counts.values())
        }

    def _analyze_aura_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze aura patterns"""
        aura_count = 0
        aura_types = {}
        
        for entry in entries:
            if entry.get('auraPresent'):
                aura_count += 1
                aura_type = entry.get('auraType', 'unknown')
                aura_types[aura_type] = aura_types.get(aura_type, 0) + 1

        aura_percentage = (aura_count / len(entries)) * 100 if entries else 0

        return {
            'aura_episodes': aura_count,
            'aura_percentage': round(aura_percentage, 1),
            'aura_types': aura_types,
            'total_episodes': len(entries)
        }

    def _analyze_functional_impact(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze functional impact"""
        impact_counts = {}
        impact_values = []
        
        for entry in entries:
            impact = entry.get('functionalImpact')
            if impact:
                impact_counts[impact] = impact_counts.get(impact, 0) + 1
                # Convert to numeric
                impact_map = {
                    'none': 0, 'mild': 1, 'moderate': 2, 'severe': 3, 'disabling': 4
                }
                if impact in impact_map:
                    impact_values.append(impact_map[impact])

        avg_impact = np.mean(impact_values) if impact_values else 0

        return {
            'impact_distribution': impact_counts,
            'average_impact': round(avg_impact, 1),
            'total_episodes': len(entries)
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
        if pain_analysis.get('average_intensity', 0) > 0:
            avg_intensity = pain_analysis['average_intensity']
            if avg_intensity >= 3:
                insights.append(f"🔴 High average pain intensity: {avg_intensity:.1f}/4")
            elif avg_intensity <= 2:
                insights.append(f"🟡 Moderate average pain intensity: {avg_intensity:.1f}/4")

        # Aura insight
        if aura_analysis.get('aura_percentage', 0) > 0:
            insights.append(f"✨ Aura present in {aura_analysis['aura_percentage']}% of episodes")

        # Top trigger insight
        triggers = trigger_analysis.get('trigger_frequency', {})
        if triggers:
            top_trigger = max(triggers.items(), key=lambda x: x[1])
            insights.append(f"⚡ Most common trigger: {top_trigger[0]} ({top_trigger[1]} times)")

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
            intensity_counts = {'Mild': 0, 'Moderate': 0, 'Severe': 0, 'Very Severe': 0}

            for entry in entries:
                intensity = entry.get('painIntensity', '')
                if intensity in intensity_counts:
                    intensity_counts[intensity] += 1

            if sum(intensity_counts.values()) == 0:
                return None

            # Create chart
            labels = list(intensity_counts.keys())
            counts = list(intensity_counts.values())
            colors = ['#4ade80', '#fbbf24', '#f97316', '#ef4444']

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
        """Fallback analytics when no data available"""
        return {
            'period': {
                'start': datetime.now().isoformat(),
                'end': datetime.now().isoformat(),
                'days': 30
            },
            'total_episodes': 0,
            'pain_intensity': {'intensity_distribution': {}, 'average_intensity': 0},
            'locations': {'location_frequency': {}, 'total_locations': 0},
            'triggers': {'trigger_frequency': {}, 'total_triggers': 0},
            'treatments': {'treatment_frequency': {}, 'average_effectiveness': 0},
            'aura': {'aura_episodes': 0, 'aura_percentage': 0, 'aura_types': {}},
            'functional_impact': {'impact_distribution': {}, 'average_impact': 0},
            'insights': ['No head pain data available for analysis'],
            'charts': {}
        }
