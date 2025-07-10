"""
PDF Generation Module for Chaos Command Center
Generates beautiful, accessible PDF reports
"""

import os
import tempfile
from datetime import datetime, timedelta
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
        
    def setup_custom_styles(self):
        """Setup custom styles for chaos-themed PDFs"""
        # Chaos header style
        self.styles.add(ParagraphStyle(
            name='ChaosHeader',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#8B5CF6'),  # Purple
            alignment=TA_CENTER
        ))
        
        # Section header
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceBefore=20,
            spaceAfter=12,
            textColor=colors.HexColor('#6366F1'),  # Indigo
            borderWidth=1,
            borderColor=colors.HexColor('#E5E7EB'),
            borderPadding=8
        ))
        
        # Data point style
        self.styles.add(ParagraphStyle(
            name='DataPoint',
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=6,
            leftIndent=20
        ))
        
        # Insight style
        self.styles.add(ParagraphStyle(
            name='Insight',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#059669'),  # Green
            leftIndent=15,
            rightIndent=15,
            spaceBefore=10,
            spaceAfter=10,
            borderWidth=1,
            borderColor=colors.HexColor('#D1FAE5'),
            borderPadding=10
        ))

    def generate_report(self, report_type, data):
        """Generate PDF report based on type and data"""
        try:
            # Create temporary file
            temp_dir = tempfile.gettempdir()
            filename = f"chaos_report_{report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            filepath = os.path.join(temp_dir, filename)
            
            # Create PDF document
            doc = SimpleDocTemplate(filepath, pagesize=letter,
                                  rightMargin=72, leftMargin=72,
                                  topMargin=72, bottomMargin=18)
            
            # Build content based on report type
            story = []
            
            if report_type == 'health_summary':
                story = self._build_health_summary(data)
            elif report_type == 'weekly_review':
                story = self._build_weekly_review(data)
            elif report_type == 'patterns_analysis':
                story = self._build_patterns_analysis(data)
            elif report_type == 'survival_stats':
                story = self._build_survival_stats(data)
            else:
                story = self._build_generic_report(data)
            
            # Build PDF
            doc.build(story)
            
            return filepath
            
        except Exception as e:
            print(f"PDF generation error: {str(e)}")
            return None

    def _build_health_summary(self, data):
        """Build health summary report"""
        story = []
        
        # Title
        story.append(Paragraph("🏥 Health Summary Report", self.styles['ChaosHeader']))
        story.append(Spacer(1, 20))
        
        # Date range
        date_range = data.get('dateRange', 'Last 30 days')
        story.append(Paragraph(f"<b>Period:</b> {date_range}", self.styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Health metrics
        if 'metrics' in data:
            story.append(Paragraph("📊 Health Metrics", self.styles['SectionHeader']))
            
            metrics_data = [['Metric', 'Average', 'Trend', 'Notes']]
            for metric in data['metrics']:
                metrics_data.append([
                    metric.get('name', ''),
                    str(metric.get('average', 'N/A')),
                    metric.get('trend', '→'),
                    metric.get('notes', '')
                ])
            
            table = Table(metrics_data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F3F4F6')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
            story.append(Spacer(1, 20))
        
        # Insights
        if 'insights' in data:
            story.append(Paragraph("💡 Key Insights", self.styles['SectionHeader']))
            for insight in data['insights']:
                story.append(Paragraph(f"• {insight}", self.styles['Insight']))
            story.append(Spacer(1, 20))
        
        return story

    def _build_weekly_review(self, data):
        """Build weekly review report"""
        story = []
        
        story.append(Paragraph("📅 Weekly Review", self.styles['ChaosHeader']))
        story.append(Spacer(1, 20))
        
        # Week info
        week_info = data.get('weekInfo', {})
        story.append(Paragraph(f"<b>Week of:</b> {week_info.get('startDate', 'N/A')}", self.styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Daily summaries
        if 'dailySummaries' in data:
            story.append(Paragraph("📋 Daily Summaries", self.styles['SectionHeader']))
            
            for day_summary in data['dailySummaries']:
                day_name = day_summary.get('day', 'Unknown')
                story.append(Paragraph(f"<b>{day_name}</b>", self.styles['Normal']))
                
                # Survival count
                survival_count = day_summary.get('survivalCount', 0)
                story.append(Paragraph(f"Survival clicks: {survival_count}", self.styles['DataPoint']))
                
                # Activities
                activities = day_summary.get('activities', [])
                if activities:
                    story.append(Paragraph("Activities:", self.styles['DataPoint']))
                    for activity in activities:
                        story.append(Paragraph(f"  • {activity}", self.styles['Normal']))
                
                story.append(Spacer(1, 10))
        
        return story

    def _build_patterns_analysis(self, data):
        """Build patterns analysis report"""
        story = []
        
        story.append(Paragraph("🔍 Patterns Analysis", self.styles['ChaosHeader']))
        story.append(Spacer(1, 20))
        
        # Analysis period
        period = data.get('period', 'Last 30 days')
        story.append(Paragraph(f"<b>Analysis Period:</b> {period}", self.styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Patterns found
        if 'patterns' in data:
            story.append(Paragraph("🎯 Identified Patterns", self.styles['SectionHeader']))
            
            for pattern in data['patterns']:
                pattern_name = pattern.get('name', 'Unknown Pattern')
                confidence = pattern.get('confidence', 0)
                description = pattern.get('description', '')
                
                story.append(Paragraph(f"<b>{pattern_name}</b> (Confidence: {confidence}%)", self.styles['Normal']))
                story.append(Paragraph(description, self.styles['DataPoint']))
                story.append(Spacer(1, 10))
        
        return story

    def _build_survival_stats(self, data):
        """Build survival statistics report"""
        story = []
        
        story.append(Paragraph("🎯 Survival Statistics", self.styles['ChaosHeader']))
        story.append(Spacer(1, 20))
        
        # Total stats
        total_clicks = data.get('totalClicks', 0)
        total_days = data.get('totalDays', 0)
        average_per_day = total_clicks / max(total_days, 1)
        
        story.append(Paragraph("📊 Overall Statistics", self.styles['SectionHeader']))
        story.append(Paragraph(f"Total survival clicks: <b>{total_clicks}</b>", self.styles['DataPoint']))
        story.append(Paragraph(f"Days tracked: <b>{total_days}</b>", self.styles['DataPoint']))
        story.append(Paragraph(f"Average per day: <b>{average_per_day:.1f}</b>", self.styles['DataPoint']))
        story.append(Spacer(1, 20))
        
        # Streaks
        if 'streaks' in data:
            story.append(Paragraph("🔥 Streaks", self.styles['SectionHeader']))
            streaks = data['streaks']
            story.append(Paragraph(f"Current streak: <b>{streaks.get('current', 0)} days</b>", self.styles['DataPoint']))
            story.append(Paragraph(f"Longest streak: <b>{streaks.get('longest', 0)} days</b>", self.styles['DataPoint']))
            story.append(Spacer(1, 20))
        
        return story

    def _build_generic_report(self, data):
        """Build generic report for unknown types"""
        story = []
        
        story.append(Paragraph("📄 Chaos Report", self.styles['ChaosHeader']))
        story.append(Spacer(1, 20))
        
        story.append(Paragraph("Generated on: " + datetime.now().strftime("%Y-%m-%d %H:%M"), self.styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Raw data dump (formatted)
        story.append(Paragraph("📋 Data Summary", self.styles['SectionHeader']))
        
        for key, value in data.items():
            if isinstance(value, (str, int, float)):
                story.append(Paragraph(f"<b>{key}:</b> {value}", self.styles['DataPoint']))
            elif isinstance(value, list):
                story.append(Paragraph(f"<b>{key}:</b> {len(value)} items", self.styles['DataPoint']))
            elif isinstance(value, dict):
                story.append(Paragraph(f"<b>{key}:</b> {len(value)} properties", self.styles['DataPoint']))
        
        return story
