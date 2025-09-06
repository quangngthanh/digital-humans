# 🇻🇳 Thiết Kế Tổng Thể - Vietnamese LLM-based Expression System

## 📋 **Tổng Quan Dự Án**

### **Vấn Đề Hiện Tại**
- ❌ Hệ thống expression hiện tại dùng keyword detection tiếng Anh
- ❌ Không hiểu được ngữ cảnh tiếng Việt phức tạp  
- ❌ Keywords/patterns hard-coded trong code
- ❌ Không handle được slang, informal Vietnamese
- ❌ Context analysis chưa chính xác cho văn hóa Việt

### **Mục Tiêu Cải Tiến**
- ✅ **Multi-language Support**: Config-driven language system
- ✅ **LLM-based Analysis**: Intelligent context understanding  
- ✅ **Vietnamese Optimization**: Native support cho tiếng Việt
- ✅ **Maintainable Config**: Easy to update without code changes
- ✅ **Cultural Context**: Understand Vietnamese relationship dynamics

---

## 🏗️ **Kiến Trúc Tổng Thể**

### **New Architecture Overview**
```
🌐 User Input (Vietnamese)
    ↓
📝 Config-based Language Detection
    ↓
🤖 LLM Context Analysis (Gemini)
    ↓
🧠 Structured Emotional Intent
    ↓
🎭 Expression Mapping (Existing System)
    ↓
🎬 Avatar Rendering
```

### **3-Layer Config System**
```
📁 Config Layer
├── 🇻🇳 Language Configs     → Keywords, patterns, culture-specific
├── 🎭 Emotion Configs       → Emotion definitions, mappings  
└── 🤖 Prompt Configs        → LLM prompts, templates

🧠 Analysis Layer  
├── 📊 LLM Context Analyzer  → Gemini-based analysis
├── 🔄 Config Loader         → Dynamic config management
└── 🛡️ Fallback System       → Backup keyword matching

🎯 Application Layer
├── 🎭 Expression Mapper     → (Existing) Intent to expressions
├── 🎬 Animation Coordinator → (Existing) Animation selection
└── 🔄 Transition Manager    → (Existing) Smooth transitions
```

---

## 📁 **Config File Structure**

### **Directory Layout**
```
backend/src/config/
├── languages/
│   ├── vietnamese.json           # Main Vietnamese config
│   ├── english.json              # English fallback
│   ├── common.json               # Shared patterns
│   └── index.ts                  # Language loader utility
├── emotions/
│   ├── emotion-definitions.json  # Core emotion mappings
│   ├── context-rules.json        # Context detection rules
│   ├── intensity-modifiers.json  # Intensity calculation
│   └── cultural-context.json     # Vietnamese cultural nuances
├── prompts/
│   ├── analysis-prompts.json     # LLM analysis prompts
│   ├── system-prompts.json       # AI system prompts
│   ├── few-shot-examples.json    # Training examples
│   └── fallback-templates.json   # Error recovery templates
└── app-config.json               # Global app configuration
```

### **Vietnamese.json Structure**
```json
{
  "language": "vietnamese",
  "locale": "vi-VN",
  "culturalContext": {
    "formalityLevels": ["casual", "formal", "intimate"],
    "relationshipTerms": {
      "romantic": ["anh", "em", "yêu", "iu"],
      "casual": ["bạn", "mình", "tao", "may"],
      "formal": ["anh/chị", "quý khách"]
    }
  },
  "emotionKeywords": {
    "happy": {
      "primary": ["vui", "hạnh phúc", "phấn khích", "tuyệt vời"],
      "slang": ["cool", "xịn", "đỉnh", "ngon"],
      "expressions": ["hihi", "hehe", "yayyy", "wow"]
    },
    "sad": {
      "primary": ["buồn", "khóc", "đau khổ", "cô đơn"],
      "slang": ["emo", "blue", "tệ"],
      "expressions": ["huhu", "wuwu", "T.T", ":'("]
    },
    "romantic": {
      "primary": ["yêu", "tình yêu", "thương", "nhớ"],
      "intimate": ["em yêu anh", "anh yêu em", "yêu thương", "trái tim"],
      "expressions": ["❤️", "💕", "😘", "🥰"]
    },
    "playful": {
      "primary": ["vui nhộn", "tinh nghịch", "đùa", "chơi"],
      "slang": ["lầy", "hài", "troll", "vui tính"],
      "expressions": ["haha", "lol", "😂", "🤣"]
    },
    "frustrated": {
      "primary": ["bực", "tức", "khó chịu", "phiền"],
      "strong": ["điên", "tức giận", "ghét", "cáu"],
      "expressions": ["ờm", "hức", "😠", "😡"]
    }
  },
  "contextPatterns": {
    "greeting": {
      "morning": ["chào buổi sáng", "sáng tốt lành", "morning"],
      "general": ["chào", "xin chào", "hello", "hi", "chào bạn"],
      "casual": ["yo", "hí", "alo"]
    },
    "goodbye": {
      "formal": ["tạm biệt", "chào tạm biệt", "hẹn gặp lại"],
      "casual": ["bye", "bai bai", "see you", "về đây"],
      "romantic": ["ngủ ngon", "yêu em", "hẹn gặp lại anh"]
    },
    "question": {
      "patterns": ["\\?", "tại sao", "làm sao", "như thế nào", "khi nào", "ở đâu"],
      "casual": ["mà", "hả", "dzậy", "sao vậy"],
      "seeking_help": ["giúp", "hướng dẫn", "chỉ", "bảo"]
    },
    "compliment": {
      "appearance": ["đẹp", "xinh", "đẹp trai", "cute", "dễ thương"],
      "personality": ["tốt", "dễ thương", "ngoan", "hiền"],
      "general": ["tuyệt vời", "amazing", "perfect", "tốt quá"]
    },
    "flirting": {
      "direct": ["em đẹp quá", "anh đẹp trai", "crush", "thích"],
      "subtle": ["dễ thương", "cute", "😘", "💕"],
      "playful": ["tán", "thả thính", "😏", "😉"]
    }
  },
  "intensityModifiers": {
    "amplifiers": {
      "high": ["rất", "cực kỳ", "vô cùng", "siêu", "mega", "ultra"],
      "medium": ["khá", "tương đối", "phần nào"],
      "emphasis": ["!!!", "!!!", "thật sự", "thực sự"]
    },
    "diminishers": {
      "low": ["hơi", "một chút", "có phần", "khá là", "hình như"],
      "uncertain": ["có lẽ", "chắc", "có thể", "maybe"]
    },
    "punctuationPatterns": {
      "excitement": ["!!!", "!+", "💥"],
      "questioning": ["???", "\\?+", "🤔"],
      "love": ["❤️+", "💕+", "😘+"]
    }
  },
  "culturalNuances": {
    "relationshipStages": {
      "stranger": {
        "terms": ["bạn", "anh/chị"],
        "emotionMapping": "formal_polite"
      },
      "friend": {
        "terms": ["bạn", "mình", "cậu"],
        "emotionMapping": "casual_friendly"
      },
      "romantic": {
        "terms": ["em", "anh", "yêu"],
        "emotionMapping": "intimate_romantic"
      }
    },
    "ageBasedCommunication": {
      "young": {
        "slang": ["lầy", "xịn", "cool", "dzui"],
        "expressions": ["bruh", "oke", "fine"]
      },
      "mature": {
        "formal": ["ạ", "dạ", "thưa"],
        "polite": ["xin lỗi", "cảm ơn", "cho phép"]
      }
    }
  }
}
```

### **Analysis-Prompts.json Structure**
```json
{
  "contextAnalysisPrompt": {
    "systemMessage": "Bạn là chuyên gia phân tích ngữ cảnh tiếng Việt. Hãy phân tích tin nhắn và trả về JSON với thông tin cảm xúc và ngữ cảnh.",
    "template": "Phân tích tin nhắn tiếng Việt sau đây:\n\nTin nhắn: \"{message}\"\n\nTrash về JSON với format:\n{\n  \"emotion\": \"primary_emotion\",\n  \"intensity\": 0.0-1.0,\n  \"context\": \"conversation_context\",\n  \"relationshipTone\": \"casual|romantic|formal\",\n  \"keywords\": [\"detected\", \"keywords\"],\n  \"culturalContext\": \"vietnamese_specific_context\"\n}",
    "fewShotExamples": [
      {
        "input": "Anh yêu em quá! Em có nhớ anh không? 😘",
        "output": {
          "emotion": "romantic",
          "intensity": 0.9,
          "context": "flirting",
          "relationshipTone": "romantic",
          "keywords": ["yêu", "nhớ"],
          "culturalContext": "vietnamese_romantic_expression"
        }
      },
      {
        "input": "Hôm nay em buồn quá... cần anh an ủi 😢",
        "output": {
          "emotion": "sad",
          "intensity": 0.8,
          "context": "comfort",
          "relationshipTone": "intimate",
          "keywords": ["buồn", "an ủi"],
          "culturalContext": "seeking_emotional_support"
        }
      },
      {
        "input": "Sáng nay thức dậy thấy vui quá! Thời tiết đẹp ghê! 🌞",
        "output": {
          "emotion": "happy",
          "intensity": 0.7,
          "context": "casual",
          "relationshipTone": "casual",
          "keywords": ["vui", "đẹp"],
          "culturalContext": "sharing_daily_mood"
        }
      },
      {
        "input": "Tại sao hôm nay em lại lạnh lùng với anh vậy? 🤔",
        "output": {
          "emotion": "confused",
          "intensity": 0.6,
          "context": "question",
          "relationshipTone": "romantic",
          "keywords": ["tại sao", "lạnh lùng"],
          "culturalContext": "relationship_concern"
        }
      }
    ]
  },
  "fallbackPrompt": {
    "simple": "Tin nhắn: \"{message}\"\nCảm xúc chính (happy/sad/romantic/playful/confused/caring/excited): ",
    "backup": "Analyze emotion in: \"{message}\"\nEmotion: "
  }
}
```

---

## 🤖 **LLM-based Context Analysis**

### **Analysis Workflow**
```
1. Input Preprocessing
   ├── Language Detection
   ├── Text Normalization
   └── Cultural Context Loading

2. LLM Analysis
   ├── Structured Prompt Building
   ├── Few-shot Examples Injection
   ├── Gemini API Call
   └── JSON Response Parsing

3. Result Enhancement
   ├── Confidence Scoring
   ├── Cultural Context Mapping
   ├── Intensity Calibration
   └── Fallback Validation

4. Output Standardization
   ├── Emotion Normalization
   ├── Context Validation
   └── Metadata Enrichment
```

### **LLM Service Architecture**
```typescript
interface LLMContextAnalysis {
  // Input
  message: string;
  language: string;
  previousContext?: ConversationContext;
  
  // LLM Analysis
  llmResponse: {
    emotion: EmotionType;
    intensity: number;
    context: ContextType;
    relationshipTone: RelationshipTone;
    keywords: string[];
    culturalContext: string;
    confidence: number;
  };
  
  // Enhanced Output
  enhancedContext: {
    primary: EmotionType;
    secondary?: EmotionType;
    intensity: number;
    context: ContextType;
    culturalNuances: CulturalContext;
    fallbackUsed: boolean;
  };
}
```

### **Prompt Engineering Strategy**

#### **Core Principles**
- **Vietnamese-first**: Prompts optimized cho tiếng Việt
- **Cultural Awareness**: Understand Vietnamese relationship dynamics
- **Structured Output**: Always return parseable JSON
- **Few-shot Learning**: Rich examples cho accuracy
- **Graceful Degradation**: Fallback prompts nếu complex fail

#### **Prompt Components**
1. **System Message**: Define role và context
2. **Task Description**: Clear instructions in Vietnamese  
3. **Output Format**: JSON schema specification
4. **Few-shot Examples**: 10-15 diverse examples
5. **Input Message**: Actual user message
6. **Constraints**: Output validation rules

---

## 🔄 **Implementation Plan**

### **Phase 1: Config Foundation (Week 1)**

#### **Day 1-2: Config Structure**
- [ ] Tạo config directory structure
- [ ] Implement ConfigLoader service
- [ ] Create Vietnamese.json với 100+ keywords
- [ ] Setup language detection utility

#### **Day 3-4: Config Integration**
- [ ] Replace hard-coded keywords với config-based
- [ ] Update ContextAnalyzerService để dùng configs
- [ ] Add config validation và error handling
- [ ] Create config hot-reload capability

#### **Day 5-7: Testing & Validation**
- [ ] Test với Vietnamese inputs
- [ ] Create config validation tests
- [ ] Performance testing với large configs
- [ ] Documentation for config management

### **Phase 2: LLM Analysis (Week 2)**

#### **Day 1-3: LLM Service Implementation**
- [ ] Create LLMContextAnalyzer service
- [ ] Implement structured prompt building
- [ ] Add few-shot example injection
- [ ] Setup Gemini API integration with retry logic

#### **Day 4-5: Prompt Optimization**
- [ ] Create comprehensive Vietnamese examples
- [ ] Test prompt accuracy với real data
- [ ] Optimize for Vietnamese cultural context
- [ ] Implement confidence scoring

#### **Day 6-7: Integration & Fallback**
- [ ] Integrate LLM analysis vào main flow
- [ ] Implement fallback to config-based analysis
- [ ] Add performance monitoring
- [ ] A/B testing framework setup

### **Phase 3: Enhancement & Optimization (Week 3)**

#### **Day 1-3: Cultural Context Enhancement**
- [ ] Add Vietnamese relationship dynamics
- [ ] Implement age-based communication patterns
- [ ] Add regional dialect support
- [ ] Cultural context validation

#### **Day 4-5: Performance Optimization**
- [ ] Implement caching layer
- [ ] Optimize API call patterns
- [ ] Add request batching
- [ ] Performance benchmarking

#### **Day 6-7: Testing & Deployment**
- [ ] Comprehensive integration testing
- [ ] User acceptance testing
- [ ] Production deployment
- [ ] Monitoring setup

---

## 📊 **Performance & Metrics**

### **Target Performance**
- **LLM Analysis**: < 500ms (95th percentile)
- **Config Loading**: < 10ms
- **Fallback Activation**: < 50ms
- **Memory Usage**: < 50MB additional
- **Accuracy Target**: > 85% emotional intent detection

### **Monitoring Metrics**
- **LLM Success Rate**: % of successful LLM calls
- **Fallback Usage**: % of requests using fallback
- **Analysis Accuracy**: Manual validation scores  
- **Response Time**: End-to-end analysis time
- **Cost Tracking**: Gemini API usage và cost

### **Error Handling Strategy**
- **LLM Timeout**: 3s timeout → fallback
- **API Failure**: Retry 2x → fallback
- **Invalid JSON**: Parse error → fallback
- **Config Error**: Missing config → default values
- **Network Issues**: Offline mode với cached patterns

---

## 🔒 **Security & Privacy**

### **Data Protection**
- **Message Privacy**: Messages không stored permanently
- **API Security**: Secure Gemini API key management
- **Config Security**: Sensitive configs encrypted
- **Logging**: No message content in production logs

### **Compliance Considerations**
- **GDPR**: User message processing compliance
- **Vietnamese Law**: Data localization requirements
- **Content Moderation**: Inappropriate content detection
- **Rate Limiting**: Prevent API abuse

---

## 🚀 **Deployment Strategy**

### **Environment Configuration**
```yaml
# Development
- Language: Vietnamese + English
- LLM: Full Gemini access
- Fallback: Always available
- Logging: Detailed analysis logs

# Staging  
- Language: Vietnamese primary
- LLM: Rate limited Gemini
- Fallback: Config-based only
- Logging: Performance metrics only

# Production
- Language: Vietnamese optimized
- LLM: Optimized Gemini calls
- Fallback: Cached patterns
- Logging: Errors + metrics only
```

### **Rollout Plan**
1. **Beta Testing** (Week 4): 10% traffic với monitoring
2. **Gradual Rollout** (Week 5): 50% traffic 
3. **Full Deployment** (Week 6): 100% traffic
4. **Optimization** (Week 7-8): Performance tuning

---

## 📈 **Success Criteria**

### **Technical Metrics**
- ✅ **95% LLM Success Rate**: Successful analysis calls
- ✅ **<500ms Response Time**: End-to-end analysis time
- ✅ **>85% Accuracy**: Correct emotional intent detection
- ✅ **<5% Fallback Usage**: Minimal fallback activation
- ✅ **Zero Config Downtime**: Hot-reload capability

### **User Experience Metrics**  
- ✅ **Appropriate Expressions**: Vietnamese-appropriate expressions
- ✅ **Cultural Sensitivity**: Correct relationship tone detection
- ✅ **Natural Interactions**: Improved conversation flow
- ✅ **User Satisfaction**: Positive feedback on avatar responses

### **Business Metrics**
- ✅ **Engagement Increase**: Longer conversation sessions
- ✅ **Retention Improvement**: Higher user return rate
- ✅ **Cost Efficiency**: Reasonable LLM API costs
- ✅ **Scalability**: Support for 10x user growth

---

## 🔧 **Development Guidelines**

### **Config Management**
- **Versioning**: Git-based config versioning
- **Validation**: JSON schema validation
- **Testing**: Automated config testing
- **Documentation**: Config change documentation

### **LLM Integration**
- **Prompt Versioning**: Track prompt performance
- **Example Management**: Curated example dataset
- **A/B Testing**: Compare prompt variations
- **Cost Optimization**: Efficient API usage

### **Code Quality**
- **TypeScript**: Strict typing for configs
- **Testing**: 90%+ test coverage
- **Documentation**: Comprehensive API docs
- **Monitoring**: Production health checks

---

## 📚 **Future Enhancements**

### **Short-term (3 months)**
- **Regional Dialects**: Support cho các vùng miền Việt Nam
- **Voice Integration**: Analyze voice tone cùng với text
- **Emoji Analysis**: Advanced emoji interpretation
- **Memory**: Context từ previous conversations

### **Medium-term (6 months)**
- **Custom Models**: Fine-tuned Vietnamese emotion models
- **Real-time Learning**: Adapt based on user interactions
- **Multi-modal**: Text + voice + gesture analysis
- **Personalization**: User-specific emotion patterns

### **Long-term (12 months)**
- **AI Agent Personality**: Distinct personality traits
- **Advanced Relationships**: Complex relationship dynamics
- **Cultural Adaptation**: Adapt to user's cultural background
- **Cross-language**: Seamless Vietnamese-English switching

---

## 📞 **Kết Luận**

Hệ thống mới sẽ cung cấp:
- **Native Vietnamese Support** với cultural understanding
- **Intelligent Context Analysis** thay cho keyword matching
- **Maintainable Config System** cho easy updates
- **Scalable Architecture** cho future enhancements
- **Production-ready Performance** với proper monitoring

**Timeline**: 3 tuần implementation + 1 tuần testing = **4 tuần total**

**Expected Impact**: 
- 🇻🇳 **100% Vietnamese Compatibility**
- 🤖 **3x Higher Context Accuracy** 
- ⚡ **Easy Maintenance** via configs
- 📈 **Better User Experience** với cultural appropriateness

*Hệ thống sẽ truly understand và respond appropriately cho Vietnamese users với cultural sensitivity và linguistic accuracy.*