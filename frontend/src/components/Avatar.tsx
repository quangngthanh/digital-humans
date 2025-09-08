import { useGLTF, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import { useChat } from "@/hooks/useChat";
import type { AvatarProps } from "@/types";
import { avatarModel } from "@/constants";
import { GLTFResult } from "@/types/avatar";
import { ExpressionMapper } from "@/intelligence/ExpressionMapper";
import { TransitionManager, BlendedExpression } from "@/intelligence/TransitionManager";
import { AnimationCoordinator } from "@/intelligence/AnimationCoordinator";
import type { AvatarState } from "@/types";

// Import new systems
import MessageSyncManager from "@/intelligence/MessageSyncManager";
import EnhancedAnimationManager from "@/intelligence/EnhancedAnimationManager";
import LipsyncCompatibleExpressionManager from "@/intelligence/LipsyncCompatibleExpressionManager";

let setupMode = false;

export function Avatar(props: AvatarProps) {
  
  const gltfData = useGLTF(avatarModel) as GLTFResult;   
  const { nodes, materials, scene } = gltfData;

  // Chat context
  const chatContext = useChat() as any;
  const { message, onMessagePlayed, sendMessage } = chatContext;
  
  // States
  const [blink, setBlink] = useState<boolean>(false);
  const [winkLeft, setWinkLeft] = useState<boolean>(false);
  const [winkRight, setWinkRight] = useState<boolean>(false);
  const [currentAvatarState, setCurrentAvatarState] = useState<AvatarState>({
    expression: 'default',
    animation: 'Standing Idle',
    transitionDuration: 800
  });
  
  // Refs for new systems
  const group = useRef<THREE.Group>(null);
  const animationManagerRef = useRef<EnhancedAnimationManager | null>(null);
  const messageSyncManagerRef = useRef<MessageSyncManager | null>(null);
  const expressionManagerRef = useRef<LipsyncCompatibleExpressionManager | null>(null);
  const transitionManagerRef = useRef<TransitionManager | null>(null);
  const currentMessageIdRef = useRef<string | null>(null);
  
  // Morphing utility function
  const lerpMorphTarget = useCallback((target: string, value: number, speed = 0.1): void => {
    if (!scene) return;
    
    try {
      scene.traverse((child) => {
        const mesh = child as unknown as THREE.SkinnedMesh;
        if (mesh.isSkinnedMesh && mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          const index = mesh.morphTargetDictionary[target];
          if (index !== undefined && mesh.morphTargetInfluences[index] !== undefined) {
            mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
              mesh.morphTargetInfluences[index],
              value,
              speed
            );
          }
        }
      });
    } catch (error: any) {
      console.error('Error in lerpMorphTarget:', error);
    }
  }, [scene]);

  // Initialize Enhanced Animation Manager
  useEffect(() => {
    if (!group.current) return;
    
    try {
      const animManager = new EnhancedAnimationManager(group.current, {
        onAnimationStart: (animation) => {
          console.log('🎬 Animation started:', animation);
        },
        onAnimationEnd: (animation) => {
          console.log('🎬 Animation ended:', animation);
        },
        onSequenceComplete: () => {
          console.log('✅ Animation sequence completed');
        },
        onError: (error) => {
          console.error('❌ Animation manager error:', error);
        }
      });
      
      animationManagerRef.current = animManager;
      
      // Preload common animations
      AnimationCoordinator.preloadCommonAnimations();
      
      return () => {
        animManager.destroy();
      };
    } catch (error: any) {
      console.error('Error initializing animation manager:', error);
    }
  }, [group.current]);

  // Initialize Expression Manager
  useEffect(() => {
    if (!scene) return;
    
    try {
      const expressionManager = new LipsyncCompatibleExpressionManager({
        onExpressionChange: (expression) => {
          console.log('😊 Expression changed:', expression);
        },
        onMorphTargetUpdate: (morphTargets) => {
          // Apply morph targets to scene
          Object.entries(morphTargets).forEach(([target, value]) => {
            lerpMorphTarget(target, value, 1.0);
          });
        }
      });
      
      expressionManagerRef.current = expressionManager;
      
      return () => {
        expressionManager.destroy();
      };
    } catch (error: any) {
      console.error('Error initializing expression manager:', error);
    }
  }, [scene, lerpMorphTarget]);

  // Initialize Message Sync Manager
  useEffect(() => {
    if (!animationManagerRef.current || !expressionManagerRef.current) return;
    
    try {
      const messageSyncManager = new MessageSyncManager({
        onAnimationChange: async (animation) => {
          console.log('🎯 MessageSync requesting animation:', animation);
          if (animationManagerRef.current) {
            await animationManagerRef.current.playAnimation(animation);
          }
        },
        onExpressionChange: (expression) => {
          console.log('🎯 MessageSync requesting expression:', expression);
          if (expressionManagerRef.current) {
            expressionManagerRef.current.setExpression(expression);
          }
        },
        onSequenceComplete: () => {
          console.log('🎯 MessageSync sequence completed');
          onMessagePlayed?.();
        },
        onError: (error) => {
          console.error('🎯 MessageSync error:', error);
          onMessagePlayed?.();
        },
        onStateChange: (state) => {
        }
      });
      
      messageSyncManagerRef.current = messageSyncManager;
      
      return () => {
        messageSyncManager.destroy();
      };
    } catch (error: any) {
      console.error('Error initializing message sync manager:', error);
    }
  }, [animationManagerRef.current, expressionManagerRef.current, onMessagePlayed]);

  // Initialize TransitionManager (backup for manual expression control)
  useEffect(() => {
    if (!transitionManagerRef.current && scene) {
      try {
        const applyMorphTargetsCallback = (expression: BlendedExpression) => {
          Object.entries(expression).forEach(([key, value]) => {
            lerpMorphTarget(key, value, 1.0);
          });
        };
        
        const tm = new TransitionManager(applyMorphTargetsCallback);
        transitionManagerRef.current = tm;
        tm.startBreathingEffect('default');
        console.log('TransitionManager initialized successfully');
      } catch (error: any) {
        console.error('Error initializing TransitionManager:', error);

      }
    }
  }, [scene, lerpMorphTarget]);
  
  // Handle message changes with new MessageSyncManager
  useEffect(() => {
    if (!message) {
      // Reset to idle state
      setCurrentAvatarState({
        expression: 'default',
        animation: 'Standing Idle',
        transitionDuration: 800
      });

      currentMessageIdRef.current = null;
      return;
    }
    
    // Check if this is a new message
    const messageId = `${message.text.substring(0, 20)}_${Date.now()}`;
    if (currentMessageIdRef.current === messageId) {
      console.log('Skipping duplicate message');
      return;
    }
    currentMessageIdRef.current = messageId;
    
    console.log('🎯 Processing NEW message with MessageSyncManager:', message.text.substring(0, 50));
    
    try {
      // Use MessageSyncManager to handle the entire message processing
      if (messageSyncManagerRef.current) {
        messageSyncManagerRef.current.processMessage(message);

      } else {
        console.warn('⚠️ MessageSyncManager not ready, falling back to old system');
        // Fallback to old system if MessageSyncManager not ready
        handleMessageFallback(message);
      }
      
    } catch (error: any) {
      console.error('Error processing message:', error);

      onMessagePlayed?.();
    }
    
  }, [message, onMessagePlayed]);

  // Fallback message handling (old system)
  const handleMessageFallback = useCallback((message: any) => {
    console.log('🔄 Using fallback message handling');
    
    try {
      // Map emotional intent to avatar state
      const avatarState = ExpressionMapper.mapToAvatarState({
        text: message.text,
        emotionalIntent: message.emotionalIntent,
        metadata: message.metadata
      });
      
      // Apply facial expression transition
      if (transitionManagerRef.current) {
        transitionManagerRef.current.transitionTo(
          avatarState.expression, 
          avatarState.transitionDuration
        );
      }
      
      // Play animation
      if (animationManagerRef.current && avatarState.animation) {
        animationManagerRef.current.playAnimation(avatarState.animation);
      }
      
      setCurrentAvatarState(avatarState);
      
      // Simple audio handling
      if (message.audio) {
        const audioElement = new Audio("data:audio/mp3;base64," + message.audio);
        audioElement.onended = () => onMessagePlayed?.();
        audioElement.play().catch(console.error);
      } else {
        setTimeout(() => onMessagePlayed?.(), 100);
      }
      
    } catch (error: any) {
      console.error('Fallback message handling error:', error);
      onMessagePlayed?.();
    }
  }, [onMessagePlayed]);
  
  // Main animation loop
  useFrame((state, delta) => {
    try {
      if (!nodes?.EyeLeft?.morphTargetDictionary) return;
      
      // Update animation system
      if (animationManagerRef.current) {
        animationManagerRef.current.update(delta);
      }
      
      // Handle blinking (independent of other systems)
      lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
      lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);
      
      
    } catch (error: any) {
      console.error('Error in useFrame:', error);
    }
  });
  
  // Development controls - enhanced
  const [avatarPosition, setAvatarPosition] = useState([0, -0.5, -2.4]);
  const [avatarScale, setAvatarScale] = useState([1.5, 1.5, 1.5]);
  
  useControls("Debug Info", {
    forceReload: button(() => {
      window.location.reload();
    }),
  });
  
  useControls("Avatar Control", {
    testMessage: button(() => {
      if (sendMessage) {
        sendMessage("Hello! This is a test message with the new system.");
      }
    }),
    testVietnamese: button(() => {
      if (sendMessage) {
        sendMessage("Chào em! Hôm nay em thế nào? Anh rất nhớ em!");
      }
    }),
    testLongMessage: button(() => {
      if (sendMessage) {
        sendMessage("This is a longer test message to see how the animation sequence system works. It should create multiple animations to match the audio duration and provide smooth transitions between them. The system should be intelligent about selecting appropriate animations based on the emotional context and ensure perfect audio synchronization.");
      }
    }),
    testEmotional: button(() => {
      if (sendMessage) {
        sendMessage("Wow! I'm so excited about this new animation system! 😄🎉");
      }
    }),
  });

  useControls("Manual Animation Control", {
    playTalking1: button(async () => {
      if (animationManagerRef.current) {
        await animationManagerRef.current.playAnimation('Talking_1');
      }
    }),
    playLaughing: button(async () => {
      if (animationManagerRef.current) {
        await animationManagerRef.current.playAnimation('Laughing');
      }
    }),
    playDancing: button(async () => {
      if (animationManagerRef.current) {
        await animationManagerRef.current.playAnimation('Hip Hop Dancing');
      }
    }),
    playIdle: button(async () => {
      if (animationManagerRef.current) {
        await animationManagerRef.current.playAnimation('Standing Idle');
      }
    }),
    stopAll: button(() => {
      if (animationManagerRef.current) {
        animationManagerRef.current.stopAll();
      }
    }),
  });

  useControls("Expression Control", {
    setHappy: button(() => {
      if (expressionManagerRef.current) {
        expressionManagerRef.current.setExpression('happy', 1.0);
      }
    }),
    setSad: button(() => {
      if (expressionManagerRef.current) {
        expressionManagerRef.current.setExpression('sad', 1.0);
      }
    }),
    setExcited: button(() => {
      if (expressionManagerRef.current) {
        expressionManagerRef.current.setExpression('excited', 1.0);
      }
    }),
    setDefault: button(() => {
      if (expressionManagerRef.current) {
        expressionManagerRef.current.setExpression('default', 1.0);
      }
    }),
    testLipsync: button(() => {
      if (expressionManagerRef.current) {
        // Mock lipsync test
        const mockLipsync = {
          mouthCues: [
            { start: 0, end: 0.5, value: 'A' },
            { start: 0.5, end: 1.0, value: 'E' },
            { start: 1.0, end: 1.5, value: 'O' }
          ]
        };
        const mockAudio = new Audio();
        expressionManagerRef.current.startLipsync(mockLipsync as any, mockAudio);
        
        setTimeout(() => {
          expressionManagerRef.current?.stopLipsync();
        }, 3000);
      }
    }),
  });
  
  useControls("Avatar Transform", {
    positionX: { 
      value: avatarPosition[0], 
      min: -5, 
      max: 5, 
      step: 0.1,
      onChange: (val: number) => setAvatarPosition([val, avatarPosition[1], avatarPosition[2]])
    },
    positionY: { 
      value: avatarPosition[1], 
      min: -5, 
      max: 5, 
      step: 0.1,
      onChange: (val: number) => setAvatarPosition([avatarPosition[0], val, avatarPosition[2]])
    },
    positionZ: { 
      value: avatarPosition[2], 
      min: -5, 
      max: 5, 
      step: 0.1,
      onChange: (val: number) => setAvatarPosition([avatarPosition[0], avatarPosition[1], val])
    },
    scale: { 
      value: avatarScale[0], 
      min: 0.1, 
      max: 3, 
      step: 0.1,
      onChange: (val: number) => setAvatarScale([val, val, val])
    },
  });
  
  useControls("Interaction", {
    winkLeft: button(() => {
      setWinkLeft(true);
      setTimeout(() => setWinkLeft(false), 300);
    }),
    winkRight: button(() => {
      setWinkRight(true);
      setTimeout(() => setWinkRight(false), 300);
    }),
  });
  
  useControls("MorphTarget Setup", () =>
    Object.assign(
      {},
      ...Object.keys(nodes?.EyeLeft?.morphTargetDictionary || {}).map((key) => {
        return {
          [key]: {
            label: key,
            value: 0,
            min: 0,
            max: 1,
            onChange: (val: number) => {
              if (setupMode) {
                lerpMorphTarget(key, val, 1);
              }
            },
          },
        };
      })
    )
  );
  
  useControls("Setup Mode", {
    enableSetupMode: button(() => {
      setupMode = true;
    }),
    disableSetupMode: button(() => {
      setupMode = false;
    }),
  });
  
  // Blinking effect
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    
    const nextBlink = (): void => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 200);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (animationManagerRef.current) {
        animationManagerRef.current.destroy();
      }
      if (messageSyncManagerRef.current) {
        messageSyncManagerRef.current.destroy();
      }
      if (expressionManagerRef.current) {
        expressionManagerRef.current.destroy();
      }
    };
  }, []);
  
  // Debug effect
  useEffect(() => {

  }, [nodes, scene, materials]);

  return (
    <group {...props} dispose={null} ref={group} position={avatarPosition as [number, number, number]} scale={avatarScale as [number, number, number]}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="Wolf3D_Body"
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Bottom"
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Footwear"
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Top"
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Hair"
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
    </group>
  );
}

useGLTF.preload(avatarModel);
