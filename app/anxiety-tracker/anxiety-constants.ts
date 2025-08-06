import { AnxietyTypeOption, CopingStrategy } from './anxiety-types'

// Anxiety Types with caring descriptions
export const ANXIETY_TYPES: AnxietyTypeOption[] = [
  {
    value: 'generalized',
    label: 'Generalized Anxiety',
    emoji: '😰',
    description: 'General worry and unease',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    value: 'social',
    label: 'Social Anxiety',
    emoji: '😳',
    description: 'Anxiety around people or social situations',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    value: 'panic-attack',
    label: 'Panic Attack',
    emoji: '😱',
    description: 'Intense fear with physical symptoms',
    color: 'bg-red-100 text-red-800'
  },
  {
    value: 'meltdown',
    label: 'Meltdown',
    emoji: '🌪️',
    description: 'Overwhelming sensory/emotional overload',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    value: 'shutdown',
    label: 'Shutdown',
    emoji: '🔇',
    description: 'Withdrawal and inability to function',
    color: 'bg-gray-100 text-gray-800'
  },
  {
    value: 'anticipatory',
    label: 'Anticipatory Anxiety',
    emoji: '⏰',
    description: 'Worry about future events',
    color: 'bg-orange-100 text-orange-800'
  },
  {
    value: 'performance',
    label: 'Performance Anxiety',
    emoji: '🎭',
    description: 'Fear of being judged or failing',
    color: 'bg-pink-100 text-pink-800'
  },
  {
    value: 'health',
    label: 'Health Anxiety',
    emoji: '🏥',
    description: 'Worry about illness or medical issues',
    color: 'bg-green-100 text-green-800'
  }
]

// Physical Symptoms
export const PHYSICAL_SYMPTOMS = [
  'Racing heart/palpitations',
  'Sweating',
  'Shaking/trembling',
  'Shortness of breath',
  'Chest tightness',
  'Nausea',
  'Dizziness',
  'Hot/cold flashes',
  'Muscle tension',
  'Headache',
  'Stomach upset',
  'Fatigue',
  'Restlessness',
  'Tingling/numbness'
]

// Mental/Emotional Symptoms
export const MENTAL_SYMPTOMS = [
  'Racing thoughts',
  'Catastrophic thinking',
  'Mind going blank',
  'Difficulty concentrating',
  'Feeling detached',
  'Fear of losing control',
  'Fear of dying',
  'Feeling overwhelmed',
  'Irritability',
  'Sense of doom',
  'Memory problems',
  'Indecisiveness',
  'Hypervigilance',
  'Emotional numbness'
]

// Common Triggers
export const COMMON_TRIGGERS = [
  'Work stress',
  'Social situations',
  'Health concerns',
  'Financial worries',
  'Relationship issues',
  'Loud noises',
  'Crowds',
  'Being late',
  'Uncertainty',
  'Conflict',
  'Sensory overload',
  'Lack of sleep',
  'Caffeine',
  'Hormonal changes',
  'Weather changes',
  'Technology issues',
  'Unexpected changes',
  'Being judged',
  'Perfectionism',
  'Past trauma reminders'
]

// Coping Strategies organized by category
export const COPING_STRATEGIES: CopingStrategy[] = [
  // Breathing
  { value: 'deep-breathing', label: 'Deep breathing', category: 'breathing', emoji: '🫁', description: '4-7-8 or box breathing' },
  { value: 'breath-counting', label: 'Counting breaths', category: 'breathing', emoji: '🔢', description: 'Focus on counting each breath' },
  
  // Grounding
  { value: '5-4-3-2-1', label: '5-4-3-2-1 technique', category: 'grounding', emoji: '👀', description: '5 things you see, 4 hear, 3 feel, 2 smell, 1 taste' },
  { value: 'cold-water', label: 'Cold water on face/hands', category: 'grounding', emoji: '❄️', description: 'Activates dive response' },
  { value: 'grounding-objects', label: 'Grounding objects', category: 'grounding', emoji: '🪨', description: 'Fidget toys, stress balls, textures' },
  
  // Movement
  { value: 'walking', label: 'Walking/pacing', category: 'movement', emoji: '🚶', description: 'Gentle movement to release energy' },
  { value: 'stretching', label: 'Stretching', category: 'movement', emoji: '🤸', description: 'Release muscle tension' },
  { value: 'exercise', label: 'Exercise', category: 'movement', emoji: '💪', description: 'Burn off anxious energy' },
  
  // Cognitive
  { value: 'positive-self-talk', label: 'Positive self-talk', category: 'cognitive', emoji: '💭', description: 'Reassuring yourself' },
  { value: 'reality-check', label: 'Reality checking', category: 'cognitive', emoji: '🔍', description: 'Is this thought realistic?' },
  { value: 'mindfulness', label: 'Mindfulness', category: 'cognitive', emoji: '🧘', description: 'Present moment awareness' },
  
  // Social
  { value: 'call-someone', label: 'Call someone', category: 'social', emoji: '📞', description: 'Reach out for support' },
  { value: 'remove-from-situation', label: 'Leave the situation', category: 'social', emoji: '🚪', description: 'Take a break from triggers' },
  
  // Sensory
  { value: 'music', label: 'Calming music', category: 'sensory', emoji: '🎵', description: 'Soothing sounds' },
  { value: 'weighted-blanket', label: 'Weighted blanket', category: 'sensory', emoji: '🛏️', description: 'Deep pressure comfort' },
  { value: 'aromatherapy', label: 'Aromatherapy', category: 'sensory', emoji: '🌸', description: 'Calming scents' },
  
  // Emergency
  { value: 'medication', label: 'PRN medication', category: 'emergency', emoji: '💊', description: 'As-needed anxiety medication' },
  { value: 'crisis-hotline', label: 'Crisis hotline', category: 'emergency', emoji: '🆘', description: 'Professional support' },
  { value: 'safe-space', label: 'Go to safe space', category: 'emergency', emoji: '🏠', description: 'Your comfort zone' }
]

// Duration Options
export const DURATION_OPTIONS = [
  'Less than 5 minutes',
  '5-15 minutes', 
  '15-30 minutes',
  '30 minutes - 1 hour',
  '1-2 hours',
  '2-4 hours',
  'Most of the day',
  'All day',
  'Multiple days'
]

// Onset Speed
export const ONSET_SPEED = [
  'Gradual (built up slowly)',
  'Moderate (noticed within minutes)',
  'Sudden (hit like a wave)',
  'Instant (0 to panic immediately)'
]

// Social Context
export const SOCIAL_CONTEXT = [
  'Alone',
  'With family',
  'With friends', 
  'With strangers',
  'In a crowd',
  'At work/school',
  'Online/social media',
  'On the phone',
  'In a meeting',
  'Public speaking'
]

// After Effects
export const AFTER_EFFECTS = [
  'Exhausted',
  'Relieved',
  'Embarrassed',
  'Ashamed',
  'Proud (handled it well)',
  'Confused',
  'Angry',
  'Sad',
  'Numb',
  'Grateful for support',
  'More anxious',
  'Physically drained',
  'Emotionally raw',
  'Hopeful'
]

// Caring Goblinisms for anxiety tracking
export const ANXIETY_GOBLINISMS = [
  "Anxiety entry saved! The worry sprites are organizing your feelings with care! 💜✨",
  "Your brave tracking has been logged! The anxiety angels are cheering for your self-awareness! 🌟",
  "Panic documented with love! The overwhelm pixies are taking gentle notes! 🧚‍♀️💖",
  "Meltdown recorded! The sensory goblins understand and are sending virtual hugs! 🤗",
  "Your anxiety journey is being witnessed with compassion! The support sprites approve! 💫",
  "Entry saved! The coping strategy elves are proud of your efforts! 🧝‍♀️✨",
  "Anxiety data logged! Your brain goblins are grateful for the attention and care! 🧠💜",
  "Tracking complete! The mental health fairies are dancing for your courage! 🧚‍♂️🌈"
]
