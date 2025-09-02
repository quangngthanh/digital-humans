import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { SimpleAvatar } from './SimpleAvatar';
import { useAvatarStore } from '../../stores/avatarStore';
import { LoadingSpinner } from '../UI/LoadingSpinner';

export function AvatarScene() {
  const { currentAvatar, audioData, isLoading } = useAvatarStore();
  const [webglError, setWebglError] = useState(false);

  if (!currentAvatar) {
    return (
      <div className="avatar-container flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">No avatar selected</p>
          <p className="text-gray-500 text-xs">Choose an avatar from the left panel</p>
        </div>
      </div>
    );
  }

  const handleWebGLError = () => {
    setWebglError(true);
  };

  if (webglError) {
    return (
      <div className="avatar-container flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-2">WebGL Error</p>
          <p className="text-gray-500 text-xs mb-2">Please refresh the page or try a different browser</p>
          <div className="space-y-2">
            <button 
              onClick={() => setWebglError(false)}
              className="block mx-auto px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="avatar-container relative">
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <LoadingSpinner size="lg" text="Loading Avatar..." />
        </div>
      )}
      
      <Canvas
        camera={{ 
          position: [0, 0, 3], 
          fov: 50 
        }}
        shadows
        className="w-full h-full"
        onError={handleWebGLError}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[2, 4, 2]}
            intensity={1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight
            position={[-2, 2, -2]}
            intensity={0.3}
          />

          {/* Environment */}
          <Environment preset="studio" />

          {/* Simple Avatar */}
          <Suspense fallback={null}>
            <SimpleAvatar audioData={audioData} />
          </Suspense>

          {/* Ground Shadow */}
          <ContactShadows
            position={[0, -1.6, 0]}
            scale={3}
            blur={2}
            far={2}
            resolution={256}
            color="#000000"
            opacity={0.3}
          />

          {/* Camera Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            target={[0, 0, 0]}
            minPolarAngle={Math.PI / 2.5}
            maxPolarAngle={Math.PI / 1.8}
            minAzimuthAngle={-Math.PI / 4}
            maxAzimuthAngle={Math.PI / 4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
