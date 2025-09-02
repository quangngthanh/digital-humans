import { useEffect } from 'react';
import { AvatarScene } from './components/Avatar/AvatarScene';
import { AvatarSelector } from './components/Avatar/AvatarSelector';
import { ChatContainer } from './components/Chat/ChatContainer';
import { VoiceControls } from './components/UI/VoiceControls';
import { useAvatarStore } from './stores/avatarStore';
import { DEFAULT_AVATARS } from './utils/constants';
import './App.css';

function App() {
  const { currentAvatar, setCurrentAvatar } = useAvatarStore();

  // Set default avatar on first load
  useEffect(() => {
    if (!currentAvatar && DEFAULT_AVATARS.length > 0) {
      setCurrentAvatar(DEFAULT_AVATARS[0]);
    }
  }, [currentAvatar, setCurrentAvatar]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Digital Humans
          </h1>
          <p className="text-center text-gray-300 text-sm mt-1">
            AI Avatar with Real-time Lip Sync
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          
          {/* Left Panel - Avatar Controls */}
          <div className="space-y-4">
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <h2 className="text-lg font-semibold mb-3 text-blue-300">Avatar Controls</h2>
              <AvatarSelector />
            </div>
            
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <h2 className="text-lg font-semibold mb-3 text-green-300">Voice Controls</h2>
              <VoiceControls />
            </div>
          </div>

          {/* Center Panel - 3D Avatar Scene */}
          <div className="lg:col-span-1">
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10 h-full">
              <h2 className="text-lg font-semibold mb-3 text-purple-300">3D Avatar</h2>
              <div className="h-[500px] rounded-lg overflow-hidden">
                <AvatarScene />
              </div>
            </div>
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="lg:col-span-1">
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10 h-full">
              <h2 className="text-lg font-semibold mb-3 text-orange-300">AI Chat</h2>
              <ChatContainer />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-gray-400 text-sm">
          <p>Powered by React Three Fiber • Ready Player Me • Google Gemini AI</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
