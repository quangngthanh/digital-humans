import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder } from '@react-three/drei';
import { Group, Mesh } from 'three';
import type { AudioData } from '../../types';

interface SimpleAvatarProps {
  audioData?: AudioData | null;
}

/**
 * Simple geometric avatar with working lip sync animation
 * Used as fallback when Ready Player Me models fail to load
 */
export function SimpleAvatar({ audioData }: SimpleAvatarProps) {
  const headRef = useRef<Group>(null);
  const mouthRef = useRef<Mesh>(null);
  const jawRef = useRef<Group>(null);

  // Animate based on audio data
  useFrame(() => {
    if (!headRef.current) return;

    // Head slight movement (always)
    headRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
    headRef.current.rotation.x = Math.sin(Date.now() * 0.0015) * 0.05;
    
    // Audio-based animation
    if (audioData) {
      const volume = audioData.volume;
      
      // Mouth opening animation
      if (mouthRef.current) {
        const mouthScale = 1 + (volume * 3); // Increased multiplier for more visible effect
        mouthRef.current.scale.y = Math.max(0.2, Math.min(mouthScale, 3));
        console.log(`🎭 Simple Avatar mouth scale: ${mouthRef.current.scale.y.toFixed(2)} (volume: ${volume.toFixed(3)})`);
      }
      
      // Jaw movement
      if (jawRef.current) {
        const jawRotation = -volume * 0.5; // Increased rotation for more visible effect
        jawRef.current.rotation.x = jawRotation;
        console.log(`🦴 Simple Avatar jaw rotation: ${jawRotation.toFixed(3)}`);
      }
    } else {
      // Reset when no audio data
      if (mouthRef.current) {
        mouthRef.current.scale.y = 0.3;
      }
      if (jawRef.current) {
        jawRef.current.rotation.x = 0;
      }
    }
  });

  return (
    <group ref={headRef} position={[0, -0.5, 0]}>
      {/* Head */}
      <Sphere args={[0.8, 32, 32]} position={[0, 1.2, 0]}>
        <meshStandardMaterial color="#fdbcb4" /> {/* Skin color */}
      </Sphere>
      
      {/* Eyes */}
      <Sphere args={[0.1, 16, 16]} position={[-0.25, 1.3, 0.6]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      <Sphere args={[0.1, 16, 16]} position={[0.25, 1.3, 0.6]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      
      {/* Nose */}
      <Sphere args={[0.05, 8, 8]} position={[0, 1.15, 0.65]}>
        <meshStandardMaterial color="#faa898" />
      </Sphere>
      
      {/* Mouth - This will animate */}
      <group ref={jawRef} position={[0, 0.9, 0.6]}>
        <Sphere ref={mouthRef} args={[0.15, 16, 8]} scale={[1, 0.3, 1]}>
          <meshStandardMaterial color="#8B0000" /> {/* Dark red for mouth */}
        </Sphere>
      </group>
      
      {/* Body */}
      <Cylinder args={[0.4, 0.6, 1.8]} position={[0, -0.4, 0]}>
        <meshStandardMaterial color="#4A5568" /> {/* Gray shirt */}
      </Cylinder>
      
      {/* Arms */}
      <Cylinder args={[0.15, 0.12, 1.2]} position={[-0.8, -0.2, 0]} rotation={[0, 0, 0.3]}>
        <meshStandardMaterial color="#fdbcb4" />
      </Cylinder>
      <Cylinder args={[0.15, 0.12, 1.2]} position={[0.8, -0.2, 0]} rotation={[0, 0, -0.3]}>
        <meshStandardMaterial color="#fdbcb4" />
      </Cylinder>
    </group>
  );
}
