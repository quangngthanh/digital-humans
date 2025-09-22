# Speech-to-Text Integration

## Tổng Quan

Tích hợp thành công tính năng Speech-to-Text vào Digital Avatar Frontend với các đặc điểm:

- **Auto-send**: Tự động gửi tin nhắn sau khi speech kết thúc
- **Tiếng Việt**: Tối ưu hóa cho ngôn ngữ Việt Nam (vi-VN)
- **Dual Modes**: Hỗ trợ cả Push-to-Talk và Continuous listening
- **Browser Support**: Chỉ hoạt động trên browser có hỗ trợ Web Speech API (Chrome, Edge)

## Cấu Trúc Files

```
src/
├── hooks/
│   └── useSpeechToText.ts       # Core speech recognition hook
├── components/
│   ├── UI.tsx                   # Modified - tích hợp voice button
│   ├── VoiceButton.tsx          # Voice button component
│   └── SpeechDemo.tsx           # Demo component (optional)
├── types/
│   └── speech.ts                # Speech-related TypeScript types
├── utils/
│   └── speechUtils.ts           # Helper functions
└── vite-env.d.ts               # Web Speech API type declarations
```

## Tính Năng

### 1. useSpeechToText Hook
- **Mode switching**: Push-to-Talk ↔ Continuous
- **Language**: Tiếng Việt (vi-VN)
- **Confidence filtering**: Lọc kết quả theo độ tin cậy
- **Auto-send**: Tích hợp với `sendMessage()` function
- **Error handling**: Xử lý lỗi và hiển thị message

### 2. VoiceButton Component
- **Visual states**: Recording animation, mode indicators
- **Keyboard shortcuts**: 
  - Space: Push-to-talk
  - Escape: Cancel/stop
- **Mode toggle**: PTT/Continuous button
- **Status display**: Transcript preview, error messages

### 3. UI Integration
- **Seamless**: Tích hợp vào existing UI component
- **Auto-clear**: Xóa input text khi voice message được gửi
- **Disabled states**: Tương ứng với chat loading states

## Cách Sử Dụng

### Push-to-Talk Mode
1. Click nút PTT để switch mode
2. Giữ Space hoặc click và giữ microphone button
3. Nói câu muốn gửi
4. Thả button để dừng và auto-send

### Continuous Mode  
1. Click nút CONT để switch mode
2. Click microphone button để bắt đầu nghe
3. Nói bình thường, hệ thống sẽ auto-detect khi kết thúc
4. Click lại để dừng hoặc để tự động stop

## API Reference

### useSpeechToText Hook

```typescript
const { state, controls } = useSpeechToText({
  mode: 'push-to-talk' | 'continuous',
  language: 'vi-VN',
  confidenceThreshold: 0.7,
  autoSend: true,
  onTranscriptComplete: (transcript: string) => void,
  onError: (error: string) => void
});
```

### State
- `isListening`: Có đang nghe không
- `isSupported`: Browser có hỗ trợ không  
- `transcript`: Final transcript
- `interimTranscript`: Real-time transcript preview
- `confidence`: Độ tin cậy (0-1)
- `error`: Error message nếu có
- `mode`: Current mode

### Controls
- `startListening()`: Bắt đầu nghe
- `stopListening()`: Dừng nghe
- `toggleMode()`: Chuyển đổi mode
- `setMode(mode)`: Set mode cụ thể
- `clearTranscript()`: Xóa transcript

## Browser Support

### Fully Supported
- ✅ Chrome (Desktop & Mobile)
- ✅ Edge (Desktop & Mobile)
- ✅ Safari (macOS - limited)

### Not Supported
- ❌ Firefox
- ❌ Internet Explorer
- ❌ Older browsers

## Testing

### 1. Basic Test
```bash
yarn dev
```
Navigate to app và test voice button

### 2. Demo Component (Optional)
Uncomment SpeechDemo in App.tsx để có detailed testing interface

### 3. Browser Console
Check console for detailed speech events:
- 🎤 Speech recognition started
- 🎤 Final transcript: ...
- 🎤 Speech recognition ended

## Configuration

### Default Config (speechUtils.ts)
```typescript
export const defaultSpeechConfig = {
  mode: 'push-to-talk',
  language: 'vi-VN', 
  continuous: false,
  interimResults: true,
  maxAlternatives: 1,
  confidenceThreshold: 0.7,
  autoSend: true,
};
```

### Customization
Modify `VoiceButton` props hoặc `useSpeechToText` options để customize behavior.

## Troubleshooting

### Common Issues

1. **"Trình duyệt không hỗ trợ"**
   - Sử dụng Chrome hoặc Edge
   - Enable microphone permissions

2. **"Không thể truy cập microphone"**
   - Check browser permissions (chrome://settings/content/microphone)
   - Reload page sau khi grant permission

3. **"Không phát hiện giọng nói"**  
   - Check microphone hardware
   - Speak louder/closer to microphone
   - Reduce background noise

4. **Low confidence scores**
   - Speak clearly và slowly
   - Reduce background noise
   - Lower confidenceThreshold setting

### Debug Mode
Enable console logging in hook để see detailed speech events.

## Next Steps

### Enhancements (Future)
1. **Visual improvements**: Waveform visualization, better animations
2. **Voice commands**: Commands không chỉ chat (e.g., "clear chat", "switch mode")
3. **Multi-language**: Support thêm ngôn ngữ
4. **Offline support**: Cache models cho offline recognition
5. **Custom vocabulary**: Train cho domain-specific terms

### Performance
- Debouncing optimized cho real-time usage
- Memory cleanup when component unmounts
- Minimal re-renders với proper dependencies

---

**Status**: ✅ Phase 1 Complete - Core functionality implemented và tested
**Next**: Phase 2 - UX enhancements và advanced features