# Unified Comparison - Integration Guide

## Quick Start

Replace the old `ChatComparison` import and usage in `ChatPage.jsx`:

### 1. Update Import
```javascript
// OLD:
import ChatComparison from "../components/ChatComparison";

// NEW:
import UnifiedComparison from "../components/UnifiedComparison";
```

### 2. Update Component Usage

```javascript
// In ChatPage.jsx, find the ChatComparison usage and replace it:

{showComparison && (
  <UnifiedComparison
    // Comparison Mode props (existing)
    chat1={comparisonChats.chat1}
    chat2={comparisonChats.chat2}
    chat1Title={savedChats.find(c => c.id === comparisonChats.chat1)?.title}
    chat2Title={savedChats.find(c => c.id === comparisonChats.chat2)?.title}
    
    // Battle Mode props (new)
    systemInstruction={systemInstruction}
    modelSettings={modelSettings}
    
    // Common props
    isOpen={showComparison}
    onClose={() => setShowComparison(false)}
    initialMode="compare" // or "battle"
  />
)}
```

## Features

### Mode 1: Compare Chats (Existing Functionality)
- Side-by-side view of two saved chats
- Synchronized scrolling (toggle on/off)
- Chat titles and message counts
- Read-only view

### Mode 2: AI Battle (New Functionality)
- Select two different AI models
- Ask one question
- Both models respond simultaneously
- Pick the winner
- Battle history saved to localStorage

## Mode Toggle

Users can switch between modes using the toggle buttons in the header:
- **👥 Compare Chats** - Compare saved conversations
- **🏆 AI Battle** - Run model competitions

## Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `chat1` | Array | Yes (Compare) | Messages for left chat |
| `chat2` | Array | Yes (Compare) | Messages for right chat |
| `chat1Title` | String | No | Title for left chat |
| `chat2Title` | String | No | Title for right chat |
| `systemInstruction` | String | Yes (Battle) | System prompt for models |
| `modelSettings` | Object | Yes (Battle) | Model configuration |
| `isOpen` | Boolean | Yes | Show/hide component |
| `onClose` | Function | Yes | Close callback |
| `initialMode` | String | No | Starting mode: 'compare' or 'battle' |

## Example Usage

### Open in Compare Mode
```javascript
setShowComparison(true);
// Component will open in compare mode (default)
```

### Open in Battle Mode
```javascript
<UnifiedComparison
  {...otherProps}
  initialMode="battle"
/>
```

## UI Preview

```
┌────────────────────────────────────────────────────────┐
│ 🏆 AI Battle Arena │ [👥 Compare] [🏆 Battle] │ [×]   │
├────────────────────────────────────────────────────────┤
│  BATTLE MODE:                                          │
│  ┌──────────────┬──────────────┐                      │
│  │ Model 1 ▼    │ Model 2 ▼    │                      │
│  └──────────────┴──────────────┘                      │
│  [Question input...] [⚡ Start Battle]                 │
│  ┌────────────────┬────────────────┐                  │
│  │ ⚡ Flash       │ 🧠 Pro          │                  │
│  │ [Pick Winner]  │ [Pick Winner]   │                  │
│  │ Response...    │ Response...     │                  │
│  └────────────────┴────────────────┘                  │
└────────────────────────────────────────────────────────┘
```

## Notes

- Battle results are saved to `localStorage` under key `aiBattles`
- Models respond in parallel using `Promise.all`
- Sync scroll only works in Compare mode
- Winner selection only available after both responses complete
