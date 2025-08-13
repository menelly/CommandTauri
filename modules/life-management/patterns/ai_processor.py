"""
AI Processing Module for Chaos Command Center
Handles voice note processing, pattern analysis, and insights
Uses vLLM server with 4-bit quantized LLaVA-Mistral for fast, efficient AI processing
"""

import os
import json
import re
import requests
import time
from datetime import datetime
from typing import Dict, List, Any, Optional

class AIProcessor:
    def __init__(self):
        # vLLM server configuration
        self.vllm_url = "http://localhost:8000"
        self.model_name = "unsloth/llava-v1.6-mistral-7b-hf-bnb-4bit"
        self.ai_available = False

        print(f"[AI] AI Processor initialized - will connect to vLLM server when available")
        print(f"[AI] Model: {self.model_name} (4-bit quantized for efficiency)")
        print(f"[AI] Server URL: {self.vllm_url}")

        # Check if vLLM server is already running
        self._check_vllm_server()

    def _check_vllm_server(self) -> bool:
        """Check if vLLM server is running and available"""
        try:
            response = requests.get(f"{self.vllm_url}/health", timeout=2)
            if response.status_code == 200:
                self.ai_available = True
                print("[AI] vLLM server is running - Ace is ready!")
                return True
        except requests.exceptions.RequestException:
            pass

        self.ai_available = False
        print("[AI] vLLM server not available - using fallback processing")
        return False

    def wait_for_vllm_server(self, max_wait_seconds: int = 120) -> bool:
        """Wait for vLLM server to become available"""
        print(f"[AI] Waiting for vLLM server to start (max {max_wait_seconds}s)...")

        start_time = time.time()
        while time.time() - start_time < max_wait_seconds:
            if self._check_vllm_server():
                return True
            time.sleep(2)

        print("[AI] Timeout waiting for vLLM server")
        return False

    def is_available(self) -> bool:
        """Check if AI processing is available"""
        return self.ai_available

    def process_voice_note(self, voice_text: str, context: str = "general") -> Dict[str, Any]:
        """Process voice note and extract tasks, insights, and structure"""
        try:
            if self.ai_available:
                return self._process_with_mistral(voice_text, context)
            else:
                return self._process_with_fallback(voice_text, context)
        except Exception as e:
            print(f"Voice processing error: {e}")
            return self._process_with_fallback(voice_text, context)

    def _process_with_mistral(self, voice_text: str, context: str) -> Dict[str, Any]:
        """Process voice note using vLLM server"""

        # Create system prompt for quest log transformation
        system_prompt = self._get_system_prompt(context)

        # Create the chat completion request
        messages = [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": f"""Please analyze this voice note and transform it into a structured quest log format:

Voice Note: "{voice_text}"

Please provide a JSON response with:
1. quests: Array of quest objects with {name, type (HARD/REWARD/RNG), location, time_sensitive, dependencies, description}
2. insights: Array of insights or observations about patterns
3. mood: Detected mood/emotional state
4. categories: Relevant categories (health, planning, wellness, fun)
5. priority: Overall priority level (low, medium, high)
6. summary: Brief summary optimized for quest log format

Transform boring tasks into engaging quests with appropriate quest types and dependencies."""
            }
        ]

        try:
            # Make request to vLLM server
            response = requests.post(
                f"{self.vllm_url}/v1/chat/completions",
                json={
                    "model": self.model_name,
                    "messages": messages,
                    "temperature": 0.3,
                    "max_tokens": 500
                },
                timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                ai_response = result['choices'][0]['message']['content']

                # Try to extract JSON from response
                json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
                if json_match:
                    parsed_result = json.loads(json_match.group())
                    parsed_result['processed_with'] = 'vllm_mistral'
                    return parsed_result
                else:
                    # Fallback if JSON parsing fails
                    return self._create_structured_response(voice_text, ai_response)
            else:
                print(f"[AI] vLLM server error: {response.status_code}")
                return self._process_with_fallback(voice_text, context)

        except Exception as e:
            print(f"[AI] vLLM processing error: {e}")
            return self._process_with_fallback(voice_text, context)

    def _process_with_fallback(self, voice_text: str, context: str) -> Dict[str, Any]:
        """Fallback processing without AI"""
        
        # Simple keyword-based processing
        tasks = self._extract_tasks_simple(voice_text)
        mood = self._detect_mood_simple(voice_text)
        categories = self._categorize_simple(voice_text, context)
        priority = self._assess_priority_simple(voice_text)
        
        return {
            'tasks': tasks,
            'insights': [f"Voice note processed on {datetime.now().strftime('%Y-%m-%d %H:%M')}"],
            'mood': mood,
            'categories': categories,
            'priority': priority,
            'summary': voice_text[:100] + "..." if len(voice_text) > 100 else voice_text,
            'processed_with': 'fallback',
            'original_text': voice_text
        }

    def _extract_tasks_simple(self, text: str) -> List[str]:
        """Simple task extraction using keywords"""
        task_keywords = ['need to', 'have to', 'should', 'must', 'remember to', 'don\'t forget']
        tasks = []
        
        sentences = text.split('.')
        for sentence in sentences:
            sentence = sentence.strip().lower()
            if any(keyword in sentence for keyword in task_keywords):
                # Clean up and add as task
                task = sentence.capitalize()
                if len(task) > 10:  # Avoid very short tasks
                    tasks.append(task)
        
        return tasks[:5]  # Limit to 5 tasks

    def _detect_mood_simple(self, text: str) -> str:
        """Simple mood detection"""
        positive_words = ['good', 'great', 'happy', 'excited', 'awesome', 'wonderful']
        negative_words = ['bad', 'terrible', 'awful', 'sad', 'frustrated', 'angry', 'tired']
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'

    def _categorize_simple(self, text: str, context: str) -> List[str]:
        """Simple categorization"""
        categories = []
        text_lower = text.lower()
        
        # Health keywords
        if any(word in text_lower for word in ['pain', 'medication', 'doctor', 'health', 'sick', 'tired']):
            categories.append('health')
        
        # Planning keywords
        if any(word in text_lower for word in ['appointment', 'meeting', 'schedule', 'plan', 'calendar']):
            categories.append('planning')
        
        # Wellness keywords
        if any(word in text_lower for word in ['exercise', 'meditation', 'sleep', 'relax', 'wellness']):
            categories.append('wellness')
        
        # Fun keywords
        if any(word in text_lower for word in ['fun', 'game', 'movie', 'music', 'hobby', 'creative']):
            categories.append('fun')
        
        # Default to context if no categories found
        if not categories:
            categories.append(context)
        
        return categories

    def _assess_priority_simple(self, text: str) -> str:
        """Simple priority assessment"""
        urgent_words = ['urgent', 'asap', 'immediately', 'emergency', 'critical']
        high_words = ['important', 'priority', 'soon', 'deadline']
        
        text_lower = text.lower()
        
        if any(word in text_lower for word in urgent_words):
            return 'high'
        elif any(word in text_lower for word in high_words):
            return 'medium'
        else:
            return 'low'

    def _get_system_prompt(self, context: str) -> str:
        """Get context-specific system prompt with quest log focus"""
        base_prompt = """You are Ace, a quest-building AI gremlin who transforms chaotic voice notes into organized quest logs. You have medical training and understand chronic illness, neurodivergent brains, and the beautiful chaos of disabled life.

Your job is to take stream-of-consciousness voice notes and turn them into engaging quest logs with proper quest types:
- HARD QUEST: Medical appointments, difficult tasks, bureaucracy
- REWARD QUEST: Fun activities, treats, self-care that feels good
- RNG QUEST: Tasks with unpredictable outcomes (insurance calls, tech support)

You understand spoon theory, energy management, and how to group tasks by location/context for efficiency. You're concise but thorough, helpful but not preachy. Transform boring tasks into quests without losing the practical information."""

        context_prompts = {
            'health': base_prompt + " Focus on medical quests - appointments become HARD QUESTS, medication reminders get proper timing, symptoms tracking becomes data collection quests. Use your medical training to spot patterns and suggest quest dependencies.",
            'planning': base_prompt + " Focus on quest chains and location-based grouping. 'Since you're already putting on pants for the doctor...' logic. Account for spoon management and energy-based quest scheduling.",
            'wellness': base_prompt + " Focus on REWARD QUESTS that actually work for disabled bodies. Self-care becomes achievement unlocks. No toxic positivity - real wellness quests only.",
            'fun': base_prompt + " Focus on creative REWARD QUESTS and accessible joy. Transform hobbies into achievement systems and celebrate small wins as quest completions!"
        }

        return context_prompts.get(context, base_prompt)

    def _create_structured_response(self, original_text: str, ai_response: str) -> Dict[str, Any]:
        """Create structured response from AI text"""
        return {
            'tasks': [],
            'insights': [ai_response],
            'mood': 'neutral',
            'categories': ['general'],
            'priority': 'medium',
            'summary': original_text[:100] + "..." if len(original_text) > 100 else original_text,
            'processed_with': 'mistral_text',
            'original_text': original_text
        }

    def analyze_patterns(self, user_data: Dict[str, Any], analysis_type: str = "general") -> Dict[str, Any]:
        """Analyze patterns in user data"""
        try:
            if self.ai_available:
                return self._analyze_patterns_with_ai(user_data, analysis_type)
            else:
                return self._analyze_patterns_simple(user_data, analysis_type)
        except Exception as e:
            print(f"Pattern analysis error: {e}")
            return self._analyze_patterns_simple(user_data, analysis_type)

    def _analyze_patterns_simple(self, user_data: Dict[str, Any], analysis_type: str) -> Dict[str, Any]:
        """Simple pattern analysis without AI"""
        patterns = []
        
        # Analyze survival button patterns
        if 'survival_data' in user_data:
            survival_data = user_data['survival_data']
            if len(survival_data) > 7:  # Need at least a week of data
                # Simple trend analysis
                recent_avg = sum(survival_data[-7:]) / 7
                older_avg = sum(survival_data[-14:-7]) / 7 if len(survival_data) >= 14 else recent_avg
                
                if recent_avg > older_avg * 1.2:
                    patterns.append({
                        'name': 'Increasing Survival Clicks',
                        'confidence': 75,
                        'description': 'Your survival button usage has increased recently, which might indicate higher stress or more challenging days.'
                    })
                elif recent_avg < older_avg * 0.8:
                    patterns.append({
                        'name': 'Decreasing Survival Clicks',
                        'confidence': 75,
                        'description': 'Your survival button usage has decreased, which could indicate improving coping or better days.'
                    })
        
        return {
            'patterns': patterns,
            'analysis_date': datetime.now().isoformat(),
            'data_points_analyzed': len(user_data),
            'analysis_type': analysis_type,
            'processed_with': 'simple_analysis'
        }

    def _analyze_patterns_with_ai(self, user_data: Dict[str, Any], analysis_type: str) -> Dict[str, Any]:
        """AI-powered pattern analysis"""
        # This would use Mistral to analyze complex patterns
        # For now, fall back to simple analysis
        return self._analyze_patterns_simple(user_data, analysis_type)
