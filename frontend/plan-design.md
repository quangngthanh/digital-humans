# 📋 **Plan Thiết Kế: Animation Sequence Management System**

## **🎯 Overview**
Xây dựng hệ thống quản lý chuỗi animation đảm bảo animation sequence luôn dài hơn audio duration, từ 1 emotional intent tạo ra nhiều animations phù hợp.

---

## **📊 Phase 1: Animation Metadata Collection**

### **Step 1.1: Animation Duration Extraction Tool**
- **Goal:** Tự động đọc thời lượng của tất cả FBX files
- **Method:** Three.js Node.js script
- **Input:** Thư mục `/public/animations/*.fbx`
- **Output:** JSON file chứa duration của từng animation
- **Deliverable:** `scripts/extract-animation-metadata.js`

### **Step 1.2: Animation Classification**
- **Goal:** Phân loại animations theo emotion và usage type
- **Method:** Manual classification + validation script
- **Categories:** 
  - Emotion compatibility (happy, sad, excited, etc.)
  - Usage type (opening, talking, concluding, loopable)
  - Intensity level (low, medium, high)
- **Deliverable:** `animation-classification.json`

### **Step 1.3: Animation Registry Creation**
- **Goal:** Kết hợp duration + classification thành registry hoàn chỉnh
- **Method:** Merge scripts kết hợp data từ step 1.1 và 1.2
- **Output:** `constants/animation-registry.ts`
- **Deliverable:** Complete animation metadata system

---

## **🧠 Phase 2: Sequence Planning Engine**

### **Step 2.1: Emotion-to-Animation Mapping**
- **Goal:** Map emotional intents to compatible animation pools
- **Logic:** 
  - Primary emotion → main animation candidates
  - Intensity level → animation energy matching
  - Context → fine-tuning selection
- **Deliverable:** `intelligence/EmotionAnimationMapper.ts`

### **Step 2.2: Duration-Based Planning Algorithm**
- **Goal:** Logic chọn animation sequence dựa trên audio duration
- **Patterns:**
  - Short audio (<2s): Single animation
  - Medium audio (2-6s): 2-3 animation sequence  
  - Long audio (>6s): Multi-animation with pattern
- **Deliverable:** `intelligence/SequencePlanner.ts`

### **Step 2.3: Timeline Calculation Logic**
- **Goal:** Tính toán timeline chính xác cho animation sequence
- **Features:**
  - Target duration = audio duration + buffer%
  - Crossfade timing between animations
  - Smooth transition points
- **Deliverable:** `intelligence/TimelineCalculator.ts`

### **Step 2.4: Fallback Strategy**
- **Goal:** Backup plans cho edge cases
- **Scenarios:**
  - No compatible animations found
  - Animation files không load được
  - Duration calculation errors
- **Deliverable:** Fallback logic trong Sequence Planner

---

## **⚙️ Phase 3: Execution Engine**

### **Step 3.1: Animation Sequence Executor**
- **Goal:** Thực thi animation sequence theo timeline
- **Features:**
  - Schedule multiple animations với timing chính xác
  - Handle crossfades and transitions
  - Progress tracking và monitoring
- **Deliverable:** `intelligence/SequenceExecutor.ts`

### **Step 3.2: Enhanced Animation Manager Integration**
- **Goal:** Extend existing EnhancedAnimationManager
- **Features:**
  - Multi-animation queuing support
  - Crossfade capabilities
  - State management (idle/speaking/transitioning)
- **Deliverable:** Enhanced `EnhancedAnimationManager` class

### **Step 3.3: Error Handling & Recovery**
- **Goal:** Robust error handling cho production
- **Features:**
  - Animation load failure recovery
  - Timing desync correction
  - Graceful degradation
- **Deliverable:** Error handling layer

---

## **🔄 Phase 4: Coordination & Integration**

### **Step 4.1: Message Sync Manager Redesign**
- **Goal:** Tích hợp sequence system vào message handling
- **Features:**
  - Extract audio duration from metadata
  - Coordinate animation + audio + lipsync + expression
  - State management cho message lifecycle
- **Deliverable:** `MessageSyncManager` class

### **Step 4.2: Lipsync-Expression Compatibility**
- **Goal:** Tách biểu cảm miệng khi lipsync active
- **Features:**
  - Filter mouth morph targets during speech
  - Preserve non-mouth expression elements
  - Smooth transitions between speech/non-speech
- **Deliverable:** `LipsyncCompatibleExpressionManager`

### **Step 4.3: Idle Animation System**
- **Goal:** Random idle animations khi không có message
- **Features:**
  - Random scheduling với intervals
  - Emotion-appropriate idle animations
  - Smooth transitions from/to speaking mode
- **Deliverable:** `IdleAnimationManager`

---

## **🧪 Phase 5: Testing & Optimization**

### **Step 5.1: Unit Testing**
- **Goal:** Test từng component riêng lẻ
- **Scope:**
  - Sequence planning algorithms
  - Timeline calculations
  - Animation registry lookups
- **Deliverable:** Test suites

### **Step 5.2: Integration Testing**
- **Goal:** Test full workflow end-to-end
- **Scenarios:**
  - Various audio durations (short/medium/long)
  - Different emotional intents
  - Edge cases và error conditions
- **Deliverable:** Integration test scenarios

### **Step 5.3: Performance Optimization**
- **Goal:** Ensure smooth performance
- **Areas:**
  - Animation loading và caching
  - Memory management
  - Timeline calculation efficiency
- **Deliverable:** Optimized system

---

## **🚀 Phase 6: Production Integration**

### **Step 6.1: Avatar Component Integration**
- **Goal:** Replace existing animation logic
- **Changes:**
  - Update useEffect hooks cho message handling
  - Integrate new coordination system
  - Maintain backward compatibility
- **Deliverable:** Updated `Avatar.tsx`

### **Step 6.2: Configuration & Debugging**
- **Goal:** Tools cho development và debugging
- **Features:**
  - Leva controls cho testing sequences
  - Debug logging và monitoring
  - Animation metadata viewer
- **Deliverable:** Debug tools và controls

### **Step 6.3: Documentation & Maintenance**
- **Goal:** Documentation cho team
- **Content:**
  - System architecture overview
  - How to add new animations
  - Troubleshooting guide
- **Deliverable:** Technical documentation

---

## **📈 Success Criteria**

### **Technical Metrics:**
- ✅ Animation sequence luôn >= audio duration + buffer
- ✅ Smooth transitions giữa animations (no gaps/jumps)
- ✅ Emotion-appropriate animation selection (>90% accuracy)
- ✅ Error recovery rate (>95% successful fallbacks)
- ✅ Performance: <100ms sequence planning time

### **User Experience:**
- ✅ Natural, fluid animation during speech
- ✅ Appropriate idle behavior khi không nói
- ✅ Mouth morph targets không conflict với lipsync
- ✅ Consistent emotional expression throughout message

### **Maintainability:**
- ✅ Easy to add new animations
- ✅ Configurable emotion-animation mappings
- ✅ Clear debugging và monitoring tools
- ✅ Comprehensive documentation

---
