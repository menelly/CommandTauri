'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Search,
  Star,
  BookOpen,
  Brain,
  MessageCircle,
  Heart,
  Sparkles,
  Camera
} from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { RichJournalEditor } from './rich-journal-editor';

// Old editor component removed - now using RichJournalEditor

// Journal tab configuration
export interface JournalTab {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
  placeholder: string;
}

const DEFAULT_TABS: JournalTab[] = [
  {
    id: 'main',
    name: 'Main',
    icon: <BookOpen className="h-4 w-4" />,
    description: 'General journal entries and photo documentation',
    enabled: true,
    placeholder: 'What\'s on your mind today? How are you feeling? What happened?'
  },
  {
    id: 'brain-dump',
    name: 'Brain Dump',
    icon: <Brain className="h-4 w-4" />,
    description: 'Unstructured thought capture for overwhelmed minds',
    enabled: true,
    placeholder: 'Just dump everything out of your brain here. No structure needed - get it all out...'
  },
  {
    id: 'therapy',
    name: 'Therapy',
    icon: <MessageCircle className="h-4 w-4" />,
    description: 'Session notes, insights, and therapeutic work',
    enabled: true,
    placeholder: 'Therapy session notes, insights, homework, or things to discuss next time...'
  },
  {
    id: 'gratitude-wins',
    name: 'Gratitude & Wins',
    icon: <Heart className="h-4 w-4" />,
    description: 'Daily appreciation and celebrating victories big and small',
    enabled: true,
    placeholder: 'What went well today? What are you grateful for? Even tiny wins count...'
  },
  {
    id: 'creative',
    name: 'Creative Writing',
    icon: <Sparkles className="h-4 w-4" />,
    description: 'Stories, poems, creative projects, and artistic expression',
    enabled: false, // Disabled by default, user can enable
    placeholder: 'Let your creativity flow... stories, poems, ideas, or whatever wants to come out...'
  }
];

export default function UnifiedJournal() {
  // Date navigation
  const [currentDate, setCurrentDate] = useState(new Date());

  // Tab management
  const [availableTabs, setAvailableTabs] = useState<JournalTab[]>(DEFAULT_TABS);
  const [activeTab, setActiveTab] = useState('main');

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Get enabled tabs only
  const enabledTabs = availableTabs.filter(tab => tab.enabled);
  
  // Date navigation handlers
  const goToPreviousDay = () => {
    setCurrentDate(prev => subDays(prev, 1));
  };
  
  const goToNextDay = () => {
    setCurrentDate(prev => addDays(prev, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Get current tab info
  const currentTabInfo = availableTabs.find(tab => tab.id === activeTab);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* 🎀✨ GORGEOUS PAGE HEADER */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8 text-purple-500" />
          📖 Journal & Documentation
        </h1>
        <p className="text-lg text-muted-foreground">
          Your unified journaling space with optional subdivisions for thoughts, gratitude, and wins
        </p>
      </header>

      {/* Header with Date Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousDay}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            onClick={goToToday}
            className="text-lg font-semibold min-w-[200px]"
          >
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextDay}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={isBookmarked ? 'text-yellow-500' : ''}
          >
            <Star className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your journal entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Journal Tabs */}
      <Card className="p-1">
        <div className="flex flex-wrap gap-1">
          {enabledTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 text-sm"
            >
              {tab.icon}
              {tab.name}
            </Button>
          ))}
        </div>
      </Card>

      {/* Journal Content Area */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Tab Description */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {currentTabInfo?.icon}
              <span>{currentTabInfo?.description}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              💡 Tip: Paste images directly while typing (Ctrl+V)
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="space-y-4">
            <RichJournalEditor
              date={currentDate}
              tabId={activeTab}
              placeholder={currentTabInfo?.placeholder || ''}
            />
            
            {/* Photo Upload for Main Tab */}
            {activeTab === 'main' && (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Add photos to your journal entry
                </p>
                <Button variant="outline" size="sm">
                  Upload Photos
                </Button>
              </div>
            )}
          </div>
          
          {/* Entry Stats - handled by RichJournalEditor */}
        </div>
      </Card>
    </div>
  );
}
