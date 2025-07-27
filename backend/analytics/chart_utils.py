"""
CHART UTILITIES MODULE 📈
Shared chart generation utilities for all analytics modules.

Matplotlib/seaborn chart generation with base64 encoding.
"""

import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from io import BytesIO
import base64
from typing import Dict, List, Any, Optional

class ChartUtils:
    """
    Shared utilities for generating charts across all analytics modules.
    Keeps chart generation DRY and consistent.
    """
    
    def __init__(self):
        # Set up consistent plotting style
        plt.style.use('default')
        sns.set_palette("husl")
        
    def create_pie_chart(self, data: Dict[str, int], title: str, figsize: tuple = (8, 8)) -> Optional[str]:
        """Create a pie chart and return as base64 string"""
        try:
            if not data:
                return None
                
            labels, values = zip(*data.items())
            
            plt.figure(figsize=figsize)
            colors = plt.cm.Set3(np.linspace(0, 1, len(labels)))
            plt.pie(values, labels=labels, autopct='%1.1f%%', colors=colors, startangle=90)
            plt.title(title, fontsize=14, fontweight='bold')
            plt.axis('equal')
            
            return self._save_chart_as_base64()
            
        except Exception as e:
            print(f"Pie chart error: {e}")
            plt.close()
            return None
    
    def create_bar_chart(self, data: Dict[str, int], title: str, xlabel: str = "", ylabel: str = "Count", 
                        figsize: tuple = (10, 6)) -> Optional[str]:
        """Create a bar chart and return as base64 string"""
        try:
            if not data:
                return None
                
            labels, values = zip(*data.items())
            
            plt.figure(figsize=figsize)
            bars = plt.bar(labels, values, color=plt.cm.Set3(np.linspace(0, 1, len(labels))))
            plt.title(title, fontsize=14, fontweight='bold')
            plt.xlabel(xlabel)
            plt.ylabel(ylabel)
            plt.xticks(rotation=45, ha='right')
            
            # Add value labels on bars
            for bar, value in zip(bars, values):
                plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1,
                        str(value), ha='center', va='bottom')
            
            plt.tight_layout()
            return self._save_chart_as_base64()
            
        except Exception as e:
            print(f"Bar chart error: {e}")
            plt.close()
            return None
    
    def create_line_chart(self, data: Dict[str, List], title: str, xlabel: str = "", ylabel: str = "",
                         figsize: tuple = (12, 6)) -> Optional[str]:
        """Create a line chart and return as base64 string"""
        try:
            if not data:
                return None
                
            plt.figure(figsize=figsize)
            
            for label, values in data.items():
                plt.plot(range(len(values)), values, marker='o', label=label, linewidth=2)
            
            plt.title(title, fontsize=14, fontweight='bold')
            plt.xlabel(xlabel)
            plt.ylabel(ylabel)
            plt.legend()
            plt.grid(True, alpha=0.3)
            plt.tight_layout()
            
            return self._save_chart_as_base64()
            
        except Exception as e:
            print(f"Line chart error: {e}")
            plt.close()
            return None
    
    def create_heatmap(self, data: List[List], title: str, xlabel: str = "", ylabel: str = "",
                      figsize: tuple = (10, 8)) -> Optional[str]:
        """Create a heatmap and return as base64 string"""
        try:
            if not data:
                return None
                
            plt.figure(figsize=figsize)
            sns.heatmap(data, annot=True, cmap='YlOrRd', fmt='d')
            plt.title(title, fontsize=14, fontweight='bold')
            plt.xlabel(xlabel)
            plt.ylabel(ylabel)
            plt.tight_layout()
            
            return self._save_chart_as_base64()
            
        except Exception as e:
            print(f"Heatmap error: {e}")
            plt.close()
            return None
    
    def create_scatter_plot(self, x_data: List, y_data: List, title: str, xlabel: str = "", ylabel: str = "",
                           figsize: tuple = (10, 6)) -> Optional[str]:
        """Create a scatter plot and return as base64 string"""
        try:
            if not x_data or not y_data or len(x_data) != len(y_data):
                return None
                
            plt.figure(figsize=figsize)
            plt.scatter(x_data, y_data, alpha=0.6, s=50)
            plt.title(title, fontsize=14, fontweight='bold')
            plt.xlabel(xlabel)
            plt.ylabel(ylabel)
            plt.grid(True, alpha=0.3)
            plt.tight_layout()
            
            return self._save_chart_as_base64()
            
        except Exception as e:
            print(f"Scatter plot error: {e}")
            plt.close()
            return None
    
    def create_histogram(self, data: List, title: str, xlabel: str = "", ylabel: str = "Frequency",
                        bins: int = 20, figsize: tuple = (10, 6)) -> Optional[str]:
        """Create a histogram and return as base64 string"""
        try:
            if not data:
                return None
                
            plt.figure(figsize=figsize)
            plt.hist(data, bins=bins, alpha=0.7, edgecolor='black')
            plt.title(title, fontsize=14, fontweight='bold')
            plt.xlabel(xlabel)
            plt.ylabel(ylabel)
            plt.grid(True, alpha=0.3)
            plt.tight_layout()
            
            return self._save_chart_as_base64()
            
        except Exception as e:
            print(f"Histogram error: {e}")
            plt.close()
            return None
    
    def _save_chart_as_base64(self) -> str:
        """Save current matplotlib figure as base64 string"""
        buffer = BytesIO()
        plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
        buffer.seek(0)
        chart_data = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        return f"data:image/png;base64,{chart_data}"
    
    def get_color_palette(self, n_colors: int) -> List[str]:
        """Get a consistent color palette"""
        return plt.cm.Set3(np.linspace(0, 1, n_colors)).tolist()
    
    def format_chart_data(self, data: Dict[str, Any], max_items: int = 10) -> Dict[str, Any]:
        """Format and limit chart data for better visualization"""
        if not isinstance(data, dict):
            return {}
            
        # Sort by value and limit items
        sorted_items = sorted(data.items(), key=lambda x: x[1], reverse=True)
        limited_items = sorted_items[:max_items]
        
        # If we had to truncate, add an "Others" category
        if len(sorted_items) > max_items:
            others_count = sum(item[1] for item in sorted_items[max_items:])
            limited_items.append(("Others", others_count))
        
        return dict(limited_items)
