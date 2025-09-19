import {
  CameraControls,
  ContactShadows,
  Environment,
} from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useChatContext } from "@/hooks/useChatContext";
import { Avatar } from "./Avatar";


export const Experience = () => {
  const cameraControls = useRef<CameraControls>(null);
  const  { cameraZoomed } = useChatContext();

  useEffect(() => {
    if (cameraControls.current) {
      cameraControls.current.setLookAt(0, 2, 5, 0, 1.5, 0);
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
       <Avatar />
      <ContactShadows opacity={0.7} />
    </>
  );
};
