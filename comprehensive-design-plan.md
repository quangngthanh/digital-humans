# 🎯 Thiết Kế Tổng Thể - Digital Humans Expression System

## 📋 **Tổng Quan Kiến Trúc**

### **Nguyên Tắc Thiết Kế Core**
- **AI quyết định Emotional Intent** (10-15 emotions cơ bản)
- **Frontend mapping thông minh** → Rich expressions (60+) + Animations
- **Separation of Concerns**: AI expert về ngôn ngữ/tâm lý, Frontend expert về visual
- **Scalable**: Dễ thêm expressions/animations mà không ảnh hưởng AI

### **Kiến Trúc 3-Layer**
```
🧠 AI Agent Layer     → Emotional Intent + Context + Intensity
🔄 Intelligence Layer → Context Analysis + Mapping Rules  
🎭 Visual Layer       → Expression Selection + Animation Coordination
```

---

## 🏗️ **Kiến Trúc Chi Tiết**

### **Layer 1: AI Agent (Emotional Intent)**
**Responsibility**: Hiểu ngữ cảnh và quyết định ý định cảm xúc

```typescript
interface EmotionalIntent {
  primary: EmotionType;      // Cảm xúc chính
  intensity: number;         // Cường độ 0.1-1.0
  context: ContextType;      // Ngữ cảnh cuộc trói chuyện
  duration: DurationType;    // Thời gian biểu hiện
}

enum EmotionType {
  // Basic emotions (Ekman + expanded)
  HAPPY = 'happy',
  SAD = 'sad', 
  EXCITED = 'excited',
  ROMANTIC = 'romantic',
  PLAYFUL = 'playful',
  SERIOUS = 'serious',
  SURPRISED = 'surprised',
  CONFUSED = 'confused',
  CARING = 'caring',
  MISCHIEVOUS = 'mischievous',
  THOUGHTFUL = 'thoughtful',
  CONFIDENT = 'confident',
  SHY = 'shy',
  FRUSTRATED = 'frustrated',
  CURIOUS = 'curious'
}
```

### **Layer 2: Intelligence Layer (Context Analysis)**
**Responsibility**: Phân tích context và áp dụng mapping rules

```typescript
interface ConversationContext {
  messageType: 'greeting' | 'question' | 'compliment' | 'story' | 'goodbye';
  relationshipTone: 'casual' | 'romantic' | 'playful' | 'intimate' | 'supportive';
  conversationMood: 'light' | 'deep' | 'flirty' | 'serious' | 'comfort';
  userEmotionalState: 'positive' | 'negative' | 'neutral' | 'mixed';
}

interface MappingRules {
  expressionGroups: ExpressionGroupMap;
  animationGroups: AnimationGroupMap; 
  transitionRules: TransitionRuleMap;
  contextOverrides: ContextOverrideMap;
}
```

### **Layer 3: Visual Layer (Expression + Animation)**
**Responsibility**: Render biểu cảm và animation phù hợp

```typescript
interface AvatarState {
  expression: ExpressionName;
  animation: AnimationName;
  transitionDuration: number;
  blendingRatio?: number;  // Cho complex expressions
}
```

---

## 📊 **Data Models**

### **AI Response Format**
```typescript
interface AIMessage {
  text: string;
  emotionalIntent: {
    primary: EmotionType;
    intensity: number;        // 0.1 - 1.0
    context: ContextType;
    secondaryEmotion?: EmotionType;  // Cho mixed emotions
  };
  metadata: {
    messageLength: number;
    estimatedDuration: number;
    conversationTurn: number;
  };
}
```

### **Expression Mapping System**
```typescript
interface ExpressionGroup {
  category: 'basic' | 'complex' | 'social' | 'cognitive' | 'micro';
  intensityLevels: {
    low: ExpressionName[];
    medium: ExpressionName[];
    high: ExpressionName[];
  };
  contextualVariants: {
    [context: string]: ExpressionName[];
  };
  animationCompatibility: AnimationName[];
}

// Example:
const HAPPY_GROUP: ExpressionGroup = {
  category: 'basic',
  intensityLevels: {
    low: ['smile', 'content'],
    medium: ['joy', 'cheerful'],
    high: ['euphoric', 'laughing']
  },
  contextualVariants: {
    romantic: ['flirtatious', 'loving'],
    playful: ['mischievous', 'cheeky'],
    casual: ['smile', 'welcoming']
  },
  animationCompatibility: ['Talking_1', 'Talking_2', 'Laughing', 'Heart_Gesture']
};
```

### **Animation Coordination System**
```typescript
interface AnimationGroup {
  category: 'conversation' | 'emotional' | 'social' | 'reactive';
  duration: 'short' | 'medium' | 'long' | 'loop';
  emotionCompatibility: EmotionType[];
  transitionFrom: AnimationName[];
  transitionTo: AnimationName[];
}

// Example:
const ANIMATION_GROUPS = {
  conversation: {
    short: ['Talking_0', 'Nod', 'Slight_Gesture'],
    medium: ['Talking_1', 'Talking_2', 'Explaining'],
    long: ['Storytelling', 'Detailed_Explanation']
  },
  emotional: {
    positive: ['Laughing', 'Excited_Jump', 'Happy_Dance'],
    negative: ['Crying', 'Sad_Slump', 'Worried_Fidget'],
    dramatic: ['Surprised_Jump', 'Shocked_Step_Back', 'Angry_Gesture']
  }
};
```

---

## 🔄 **Core Workflows**

### **1. Message Processing Flow**
```
User Input 
    ↓
AI Analysis (Gemini)
    ↓
Emotional Intent + Context
    ↓
Intelligence Layer (Mapping)
    ↓
Expression + Animation Selection
    ↓
Visual Rendering (Avatar)
```

### **2. Expression Selection Algorithm**
```typescript
function selectExpression(emotionalIntent: EmotionalIntent, context: ConversationContext): string {
  // 1. Get base expression group
  const expressionGroup = EXPRESSION_GROUPS[emotionalIntent.primary];
  
  // 2. Apply intensity filter
  const intensityLevel = categorizeIntensity(emotionalIntent.intensity);
  const candidates = expressionGroup.intensityLevels[intensityLevel];
  
  // 3. Apply contextual overrides
  const contextualCandidates = expressionGroup.contextualVariants[context.relationshipTone];
  const finalCandidates = contextualCandidates || candidates;
  
  // 4. Select best match
  return selectOptimalExpression(finalCandidates, context);
}
```

### **3. Animation Coordination Algorithm**
```typescript
function selectAnimation(expression: string, messageData: any, context: ConversationContext): string {
  // 1. Get expression category
  const expressionCategory = getExpressionCategory(expression);
  
  // 2. Consider message characteristics
  const messageLength = messageData.text.length;
  const isQuestion = messageData.text.includes('?');
  const hasEmphasis = /[!]{2,}/.test(messageData.text);
  
  // 3. Select animation group
  const animationGroup = selectAnimationGroup(expressionCategory, messageLength, context);
  
  // 4. Apply special rules
  if (isQuestion) return selectQuestionAnimation(animationGroup);
  if (hasEmphasis) return selectEmphasisAnimation(animationGroup);
  
  return selectDefaultAnimation(animationGroup);
}
```

---

## 🛠️ **Implementation Plan**

### **Phase 1: Foundation (2 weeks)**

#### **Week 1: Backend Restructure**
- [ ] Update `ChatResponseDto` để support emotional intent
- [ ] Modify `AiService` để output emotional intent thay vì specific expression
- [ ] Update Gemini prompt với emotional intent framework
- [ ] Implement basic emotion validation

#### **Week 2: Frontend Intelligence Layer**
- [ ] Tạo `ExpressionMapper` class
- [ ] Implement expression group mappings
- [ ] Basic intensity-based selection logic
- [ ] Update `Avatar` component để sử dụng mapping layer

### **Phase 2: Intelligence Enhancement (2 weeks)**

#### **Week 3: Context Analysis**
- [ ] Implement conversation context detection
- [ ] Create contextual override rules
- [ ] Add message type classification
- [ ] User emotional state tracking

#### **Week 4: Animation Coordination**
- [ ] Design animation group system
- [ ] Implement expression-animation compatibility matrix
- [ ] Create transition rules engine
- [ ] Animation sequence coordination

### **Phase 3: Advanced Features (2 weeks)**

#### **Week 5: Mixed Emotions & Transitions**
- [ ] Support secondary emotions
- [ ] Smooth expression transitions
- [ ] Emotion blending for complex states
- [ ] Animation sequence chaining

#### **Week 6: Optimization & Analytics**
- [ ] Performance optimization
- [ ] Expression effectiveness tracking
- [ ] User preference adaptation
- [ ] A/B testing framework

---

## 📁 **File Structure Changes**

### **Backend Changes**
```
src/
├── ai/
│   ├── ai.service.ts              # Modified: Emotional intent logic
│   ├── emotion-mapping.ts         # New: Emotion definitions
│   └── context-analyzer.ts        # New: Context analysis
├── chat/
│   └── dto/
│       ├── chat-response.dto.ts   # Modified: Add emotional intent
│       └── emotional-intent.dto.ts # New: Intent structure
```

### **Frontend Changes**
```
src/
├── intelligence/
│   ├── ExpressionMapper.ts        # New: Core mapping logic
│   ├── AnimationCoordinator.ts    # New: Animation selection
│   ├── ContextAnalyzer.ts         # New: Context detection
│   └── TransitionManager.ts       # New: Smooth transitions
├── constants/
│   ├── emotion-groups.ts          # New: Expression groupings
│   ├── animation-groups.ts        # New: Animation categories
│   └── mapping-rules.ts           # New: Selection rules
├── components/
│   └── Avatar.tsx                 # Modified: Use intelligence layer
```

---

## 🎯 **Success Metrics**

### **Phase 1 Success Criteria**
- ✅ AI output 15 emotional intents instead của 6 expressions
- ✅ Frontend map emotional intent → 60+ expressions
- ✅ No regression trong response quality
- ✅ Expression variety tăng 10x

### **Phase 2 Success Criteria**
- ✅ Context-appropriate expression selection (90%+ accuracy)
- ✅ Animation-expression compatibility (100%)
- ✅ Smooth transitions between expressions
- ✅ User engagement metrics improvement

### **Phase 3 Success Criteria**
- ✅ Complex emotion support (mixed states)
- ✅ User preference adaptation
- ✅ Performance under 100ms for expression selection
- ✅ Expression effectiveness analytics

---

## 🚀 **Future Expansion Opportunities**

### **Animation Library Growth**
- **Gesture Animations**: Hand gestures, body language
- **Interaction Animations**: Pointing, offering, receiving
- **Environment Animations**: Looking around, reacting to sounds
- **Micro-Animations**: Breathing, subtle movements, eye movements

### **Advanced Intelligence**
- **User Behavior Learning**: Adapt expressions to user preferences
- **Conversation Memory**: Remember past interactions to influence expressions
- **Multi-modal Input**: Consider voice tone, text sentiment together
- **Real-time Adaptation**: Adjust based on user responses

### **Integration Possibilities**
- **Voice Analysis**: Match expressions với voice emotion
- **Biometric Integration**: Adapt to user's detected mood
- **Multi-character Support**: Different personalities với different expression tendencies
- **Customization**: User-defined expression preferences

---

## 📝 **Technical Considerations**

### **Performance Requirements**
- Expression selection: < 50ms
- Animation transition: < 200ms  
- Memory usage: < 100MB additional
- Bundle size impact: < 500KB

### **Compatibility & Fallbacks**
- Graceful degradation nếu mapping fails
- Default expression cho unknown emotions
- Animation fallbacks cho missing files
- Browser compatibility cho morph targets

### **Monitoring & Debugging**
- Expression selection logging
- Performance metrics tracking
- User interaction analytics
- Error handling và recovery

---

## 🔧 **Development Guidelines**

### **Code Quality Standards**
- TypeScript strict mode
- Comprehensive unit tests (>80% coverage)
- Performance benchmarks
- Documentation cho all mapping rules

### **Testing Strategy**
- Unit tests cho mapping logic
- Integration tests cho full workflow
- Visual regression tests cho expressions
- Performance tests cho transition smoothness

### **Deployment Strategy**
- Feature flags cho new expression system
- Gradual rollout với monitoring
- A/B testing infrastructure
- Rollback plan trong case of issues