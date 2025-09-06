import {
  CameraControls,
  ContactShadows,
  Environment,
  Text,
} from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { Avatar } from "./Avatar";

interface DotsProps {
  [key: string]: any;
  'position-x'?: number;
  'position-y'?: number;
  'position-z'?: number;
}

const Dots = (props: DotsProps) => {
  const chatContext = useChat() as any;
  const { loading } = chatContext;
  const [loadingText, setLoadingText] = useState<string>("");

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingText((prevLoadingText) => {
          if (prevLoadingText.length > 2) {
            return ".";
          }
          return prevLoadingText + ".";
        });
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLoadingText("");
    }
  }, [loading]);

  if (!loading) return null;

  return (
    <group {...props}>
      <Text 
        fontSize={0.14} 
        anchorX="left" 
        anchorY="bottom"
      >
        {loadingText}
        <meshBasicMaterial attach="material" color="black" />
      </Text>
    </group>
  );
};

export const Experience = () => {
  const cameraControls = useRef<CameraControls>(null);
  const chatContext = useChat() as any;
  const { cameraZoomed } = chatContext;

  useEffect(() => {
    console.log('Experience component mounted');
    if (cameraControls.current) {
      cameraControls.current.setLookAt(0, 2, 5, 0, 1.5, 0);
      console.log('Camera position set');
    }
  }, []);

  useEffect(() => {
    if (cameraControls.current) {
      if (cameraZoomed) {
        cameraControls.current.setLookAt(0, 1.5, 1.5, 0, 1.5, 0, true);
      } else {
        cameraControls.current.setLookAt(0, 2.2, 5, 0, 1.0, 0, true);
      }
    }
  }, [cameraZoomed]);

  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="sunset" />
      
      {/* Debug lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={1} />
      
      {/* Wrapping Dots into Suspense to prevent Blink when Troika/Font is loaded */}
      <Suspense fallback={null}>
        <Dots position-y={1.75} position-x={-0.02} />
      </Suspense>
      
      {/* Avatar with error boundary */}
      <Suspense fallback={
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshBasicMaterial color="blue" />
        </mesh>
      }>
        <Avatar />
      </Suspense>
      
      <ContactShadows opacity={0.7} />
    </>
  );
};
