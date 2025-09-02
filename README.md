# Digital Humans - AI Avatar with Real-time Lip Sync

Một dự án AI Avatar với khả năng đồng bộ môi (lip sync) thời gian thực, sử dụng React Three Fiber và Web Speech API.

## ✨ Tính năng chính

- **3D Avatar**: Avatar 3D đơn giản với khả năng biểu cảm
- **Real-time Lip Sync**: Đồng bộ môi với audio từ AI response
- **AI Chat**: Tích hợp Google Gemini AI cho cuộc trò chuyện thông minh
- **Text-to-Speech**: Chuyển đổi văn bản thành giọng nói với lip sync
- **Voice Controls**: Điều khiển giọng nói và lip sync

## 🚀 Khởi chạy dự án

```bash
# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev

# Build production
npm run build
```

## 🎯 Cách sử dụng

1. **Chọn Avatar**: Sử dụng Avatar Selector ở panel bên trái
2. **Bật Lip Sync**: Toggle "Lip Sync" trong Voice Controls
3. **Chat với AI**: Gửi tin nhắn trong chat interface
4. **Xem Lip Sync**: Avatar sẽ tự động đồng bộ môi với AI response

## 🏗️ Kiến trúc dự án

```
src/
├── components/
│   ├── Avatar/           # Avatar components
│   │   ├── SimpleAvatar.tsx    # Avatar 3D đơn giản với lip sync
│   │   ├── AvatarScene.tsx     # Scene 3D chính
│   │   └── AvatarSelector.tsx  # Chọn avatar
│   ├── Chat/             # Chat interface
│   │   ├── ChatContainer.tsx   # Container chính
│   │   ├── ChatInput.tsx       # Input chat với lip sync
│   │   └── ChatHistory.tsx     # Lịch sử chat
│   └── UI/               # UI components
│       ├── VoiceControls.tsx   # Điều khiển giọng nói
│       └── LoadingSpinner.tsx  # Loading spinner
├── services/
│   ├── lipSyncService.ts # Service lip sync chính
│   ├── speechService.ts  # Text-to-speech
│   └── geminiService.ts  # AI service
├── stores/
│   ├── avatarStore.ts    # State avatar
│   └── chatStore.ts      # State chat
└── types/
    └── index.ts          # Type definitions
```

## 🔧 Lip Sync Technology

### Cách hoạt động

1. **Audio Analysis**: `lipSyncService` phân tích audio data
2. **Morph Targets**: Sử dụng morph targets cho facial animation
3. **Real-time Sync**: Đồng bộ 60fps với speech synthesis
4. **Fallback Animation**: Jaw bone animation khi không có morph targets

### Các phương pháp lip sync

- **ARKit Morphs**: `mouthOpen`, `jawOpen`, `mouthSmile_L/R`
- **Oculus Visemes**: `viseme_aa`, `viseme_E`, `viseme_I`, etc.
- **Custom Morphs**: Tìm kiếm morph targets liên quan đến mouth
- **Jaw Bone**: Animation xương hàm làm backup

## 🎨 UI/UX Features

- **Modern Design**: Gradient background với glassmorphism
- **Responsive Layout**: Grid layout 3 cột cho desktop
- **Real-time Feedback**: Loading states và error handling
- **Accessibility**: Keyboard navigation và screen reader support

## 🚫 Đã loại bỏ

Dự án đã được dọn dẹp, loại bỏ các component debug không cần thiết:

- ❌ AudioDebugger
- ❌ AvatarDebugger  
- ❌ ConnectionTester
- ❌ MorphTargetTester
- ❌ MorphTargetsGuide
- ❌ ErrorBoundary
- ❌ TestService
- ❌ AudioService (cũ)

## 🔮 Roadmap

- [ ] Tích hợp Ready Player Me models
- [ ] Advanced facial expressions
- [ ] Emotion detection từ text
- [ ] Multi-language support
- [ ] Voice recognition
- [ ] Gesture controls

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **3D Graphics**: React Three Fiber + Three.js
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **AI Service**: Google Gemini AI
- **Speech**: Web Speech API

## 📝 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 🤝 Contributing

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

**Lưu ý**: Dự án này tập trung vào việc đồng bộ môi với audio response từ AI. Tất cả debug code không cần thiết đã được loại bỏ để tối ưu hiệu suất và dễ bảo trì.
