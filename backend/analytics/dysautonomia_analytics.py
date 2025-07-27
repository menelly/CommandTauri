"""
DYSAUTONOMIA ANALYTICS MODULE 🩺
Medical-grade POTS detection, BP analysis, trigger patterns, intervention effectiveness.

Focused on autonomic dysfunction patterns and SpO2 tracking.
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

class DysautonomiaAnalytics:
    """
    Specialized dysautonomia analytics for POTS warriors.
    Because oxygen desaturation episodes are NOT optional to track!
    """
    
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

        # 🧃🔧 FIX: Calculate POTS percentage based on TOTAL episodes, not just HR entries
        # This was showing 100% when it should show the actual percentage of all episodes
        total_episodes = len(entries)  # All dysautonomia episodes
        pots_percentage = (len(pots_episodes) / total_episodes) * 100 if total_episodes > 0 else 0

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

    def _analyze_spo2_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze SpO2 patterns for oxygen desaturation episodes"""
        spo2_entries = [e for e in entries if e.get('spo2')]

        if not spo2_entries:
            return {'has_data': False}

        spo2_values = [e['spo2'] for e in spo2_entries]
        
        # Desaturation episodes (SpO2 < 95%)
        mild_desat = [v for v in spo2_values if 90 <= v < 95]
        moderate_desat = [v for v in spo2_values if 85 <= v < 90]
        severe_desat = [v for v in spo2_values if v < 85]

        return {
            'has_data': True,
            'total_readings': len(spo2_values),
            'avg_spo2': round(np.mean(spo2_values), 1),
            'min_spo2': min(spo2_values),
            'max_spo2': max(spo2_values),
            'desaturation_episodes': {
                'mild': len(mild_desat),      # 90-94%
                'moderate': len(moderate_desat), # 85-89%
                'severe': len(severe_desat)    # <85%
            },
            'normal_readings': len([v for v in spo2_values if v >= 95])
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

    def _analyze_episode_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze episode types and frequency"""
        episode_types = {}
        for entry in entries:
            episode_type = entry.get('episodeType', 'unknown')
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
        """Analyze common triggers"""
        trigger_counts = {}
        for entry in entries:
            triggers = entry.get('triggers', [])
            if isinstance(triggers, list):
                for trigger in triggers:
                    trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1

        return {'trigger_counts': trigger_counts}

    def _analyze_intervention_effectiveness(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze intervention effectiveness"""
        intervention_counts = {}
        for entry in entries:
            interventions = entry.get('interventions', [])
            if isinstance(interventions, list):
                for intervention in interventions:
                    intervention_counts[intervention] = intervention_counts.get(intervention, 0) + 1

        return {'intervention_counts': intervention_counts}

    def _analyze_severity_patterns(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze severity distribution"""
        severity_counts = {}
        for entry in entries:
            severity = entry.get('severity', 'unknown')
            severity_counts[severity] = severity_counts.get(severity, 0) + 1

        return {'severity_distribution': severity_counts}

    def _generate_dysautonomia_insights(self, entries, heart_rate_analysis, blood_pressure_analysis,
                                      spo2_analysis, trigger_analysis, intervention_analysis) -> List[str]:
        """Generate medical insights for dysautonomia patterns"""
        insights = []

        # Heart rate insights
        if heart_rate_analysis.get('has_data'):
            pots_percentage = heart_rate_analysis.get('pots_percentage', 0)
            if pots_percentage > 50:
                insights.append(f"⚠️ {pots_percentage:.1f}% of your episodes show POTS criteria (≥30 bpm HR increase). Consider discussing with your healthcare provider.")
            elif pots_percentage > 25:
                insights.append(f"📊 {pots_percentage:.1f}% of episodes meet POTS criteria. Monitor patterns and discuss with your doctor.")

            avg_increase = heart_rate_analysis.get('avg_hr_increase', 0)
            if avg_increase > 40:
                insights.append(f"💓 Your average heart rate increase is {avg_increase:.1f} bpm, which is significant. Track position changes carefully.")

        # Blood pressure insights
        if blood_pressure_analysis.get('has_data'):
            ortho_percentage = blood_pressure_analysis.get('orthostatic_percentage', 0)
            if ortho_percentage > 30:
                insights.append(f"🩸 {ortho_percentage:.1f}% of readings show orthostatic hypotension. Focus on hydration and gradual position changes.")

        # SpO2 insights - Because oxygen is NOT optional! 💨
        if spo2_analysis.get('has_data'):
            desat_episodes = spo2_analysis.get('desaturation_episodes', {})
            total_desat = sum(desat_episodes.values())
            min_spo2 = spo2_analysis.get('min_spo2', 100)

            if desat_episodes.get('severe', 0) > 0:
                insights.append(f"🆘 {desat_episodes['severe']} episodes with SpO2 <85% - This is dangerously low! Seek immediate medical evaluation.")
            elif total_desat > 0:
                insights.append(f"⚠️ {total_desat} desaturation episodes tracked. Monitor closely and discuss with your doctor.")

            if min_spo2 < 85:
                insights.append(f"🆘 Lowest SpO2 recorded: {min_spo2}% - This is dangerously low! Seek immediate medical evaluation.")

        # Trigger insights
        trigger_counts = trigger_analysis.get('trigger_counts', {})
        if trigger_counts:
            top_trigger = max(trigger_counts.items(), key=lambda x: x[1])
            insights.append(f"🎯 Your most common trigger is '{top_trigger[0]}' ({top_trigger[1]} episodes). Consider avoidance strategies.")

        # General insights
        total_episodes = len(entries)
        if total_episodes > 20:
            insights.append(f"📈 You've tracked {total_episodes} episodes. This rich data helps identify patterns for better management.")
        elif len(insights) == 0:
            insights.append("✨ Every dysautonomia episode you track helps build a clearer picture for treatment!")

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

            # Create pie chart
            plt.figure(figsize=(10, 8))
            colors = plt.cm.Set3(np.linspace(0, 1, len(episode_types)))

            labels, values = zip(*episode_types.items())
            plt.pie(values, labels=labels, autopct='%1.1f%%', colors=colors, startangle=90)
            plt.title('Episode Type Distribution', fontsize=16, fontweight='bold')
            plt.axis('equal')

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
        for entry in entries:
            triggers = entry.get('triggers', [])
            if isinstance(triggers, list):
                for trigger in triggers:
                    trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1

        if not trigger_counts:
            return None

        try:
            # Get top 8 triggers
            top_triggers = sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:8]
            triggers, counts = zip(*top_triggers)

            # Create bar chart
            plt.figure(figsize=(12, 8))
            bars = plt.bar(triggers, counts, color=plt.cm.Set3(np.linspace(0, 1, len(triggers))))
            plt.title('Most Common Dysautonomia Triggers', fontsize=16, fontweight='bold')
            plt.xlabel('Triggers')
            plt.ylabel('Frequency')
            plt.xticks(rotation=45, ha='right')

            # Add value labels on bars
            for bar, count in zip(bars, counts):
                plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1,
                        str(count), ha='center', va='bottom', fontweight='bold')

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

    def _get_fallback_dysautonomia_analytics(self) -> Dict[str, Any]:
        """Fallback analytics when no data available"""
        return {
            'period': {
                'start': datetime.now().isoformat(),
                'end': datetime.now().isoformat(),
                'days': 30
            },
            'total_episodes': 0,
            'heart_rate': {'has_data': False},
            'blood_pressure': {'has_data': False},
            'spo2': {'has_data': False},
            'episodes': {'episode_types': {}, 'total_episodes': 0},
            'triggers': {'trigger_counts': {}},
            'interventions': {'intervention_counts': {}},
            'severity': {'severity_distribution': {}},
            'insights': ['No dysautonomia data available for analysis'],
            'charts': {}
        }
