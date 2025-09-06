import { useGLTF, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useChat } from "@/hooks/useChat";
import type { AvatarProps } from "@/types";
import { avatarModel, facialExpressions, corresponding } from "@/constant";
import { GLTFResult, LipsyncData } from "@/types/avatar";
import { ExpressionMapper } from "@/intelligence/ExpressionMapper";
import { TransitionManager, BlendedExpression } from "@/intelligence/TransitionManager";
import type { AvatarState } from "@/types";

let setupMode = false;

// Simple Animation Manager for debugging
class SimpleAnimationManager {
  private mixer: THREE.AnimationMixer | null = null;
  private currentAction: THREE.AnimationAction | null = null;
  private isInitialized: boolean = false;
  
  constructor(group: THREE.Group) {
    try {
      this.mixer = new THREE.AnimationMixer(group);
      this.isInitialized = true;
      console.log('SimpleAnimationManager initialized successfully');
    } catch (error: any) {
      console.error('Failed to initialize SimpleAnimationManager:', error);
    }
  }
  
  update(deltaTime: number): void {
    if (this.mixer && this.isInitialized) {
      this.mixer.update(deltaTime);
    }
  }
  
  playIdleAnimation(): void {
    console.log('Playing idle animation (placeholder)');
    // For now, just log. We'll add actual animation later
  }
  
  stopAll(): void {
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
    this.currentAction = null;
  }
  
  isReady(): boolean {
    return this.isInitialized;
  }
}

export function Avatar(props: AvatarProps) {
  // Debug state
  const [debugInfo, setDebugInfo] = useState({
    modelLoaded: false,
    nodesLoaded: false,
    sceneReady: false,
    animationManagerReady: false,
    error: null as string | null
  });

  try {
    const { nodes, materials, scene } = useGLTF(avatarModel) as GLTFResult;
    
    const chatContext = useChat() as any;
    const { message, onMessagePlayed, sendMessage } = chatContext;
    
    // States
    const [lipsync, setLipsync] = useState<LipsyncData | undefined>();
    const [audio, setAudio] = useState<HTMLAudioElement | undefined>();
    const [blink, setBlink] = useState<boolean>(false);
    const [winkLeft, setWinkLeft] = useState<boolean>(false);
    const [winkRight, setWinkRight] = useState<boolean>(false);
    const [currentAvatarState, setCurrentAvatarState] = useState<AvatarState>({
      expression: 'default',
      animation: 'Standing Idle',
      transitionDuration: 800
    });
    const [facialExpression, setFacialExpression] = useState<string>("default");
    
    // Refs
    const group = useRef<THREE.Group>(null);
    const animationManagerRef = useRef<SimpleAnimationManager | null>(null);
    const transitionManagerRef = useRef<TransitionManager | null>(null);
    
    // Debug effect
    useEffect(() => {
      setDebugInfo(prev => ({
        ...prev,
        modelLoaded: !!nodes,
        nodesLoaded: !!nodes.EyeLeft,
        sceneReady: !!scene
      }));
    }, [nodes, scene]);
    
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
    
    // Initialize simple animation system
    useEffect(() => {
      if (!group.current) return;
      
      try {
        const animManager = new SimpleAnimationManager(group.current);
        animationManagerRef.current = animManager;
        
        setDebugInfo(prev => ({
          ...prev,
          animationManagerReady: animManager.isReady()
        }));
        
        if (animManager.isReady()) {
          console.log('Animation manager ready, starting idle animation');
          animManager.playIdleAnimation();
        }
        
        return () => {
          animManager.stopAll();
        };
      } catch (error: any) {
        console.error('Error initializing animation manager:', error);
        setDebugInfo(prev => ({
          ...prev,
          error: `Animation manager error: ${error?.message as string}`
        }));
      }
    }, []);
    
    // Initialize TransitionManager
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
        } catch (error:any) {
          console.error('Error initializing TransitionManager:', error);
          setDebugInfo(prev => ({
            ...prev,
            error: `TransitionManager error: ${error?.message as string}`
          }));
        }
      }
    }, [scene, lerpMorphTarget]);
    
    // Handle message changes (simplified)
    useEffect(() => {
      if (!message) {
        setCurrentAvatarState({
          expression: 'default',
          animation: 'Standing Idle',
          transitionDuration: 800
        });
        return;
      }
      
      console.log('Processing message:', message.text.substring(0, 50));
      
      try {
        // Simple expression mapping without complex animation selection
        const avatarState = ExpressionMapper.mapToAvatarState({
          text: message.text,
          emotionalIntent: message.emotionalIntent,
          metadata: message.metadata
        });
        
        console.log('Mapped avatar state:', avatarState);
        
        // Apply facial expression transition
        if (transitionManagerRef.current) {
          transitionManagerRef.current.transitionTo(
            avatarState.expression, 
            avatarState.transitionDuration
          );
        }
        
        setCurrentAvatarState(avatarState);
        setFacialExpression(avatarState.expression);
        
        // Handle audio (simplified)
        if (message.audio) {
          try {
            const audioElement = new Audio("data:audio/mp3;base64," + message.audio);
            audioElement.onloadeddata = () => {
              audioElement.play().catch(console.error);
            };
            audioElement.onended = () => {
              console.log('Audio playback ended');
              onMessagePlayed?.();
            };
            audioElement.onerror = (error) => {
              console.error('Audio playback error:', error);
              onMessagePlayed?.();
            };
            setAudio(audioElement);
          } catch (error: any) {
            console.error('Audio setup error:', error);
          }
        }
        
      } catch (error: any) {
        console.error('Error processing message:', error);
        setDebugInfo(prev => ({
          ...prev,
          error: `Message processing error: ${error?.message as string}`
        }));
      }
      
      if (message.lipsync) {
        setLipsync(message.lipsync);
      }
      
    }, [message, onMessagePlayed]);
    
    // Main animation loop
    useFrame((state, delta) => {
      try {
        if (!nodes.EyeLeft?.morphTargetDictionary) return;
        
        // Update animation system
        if (animationManagerRef.current && animationManagerRef.current.isReady()) {
          animationManagerRef.current.update(delta);
        }
        
        // Apply facial expressions
        if (!setupMode) {
          Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
            if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
              return; // Handle separately
            }
            
            const mapping = facialExpressions[currentAvatarState.expression];
            if (mapping && mapping[key] !== undefined) {
              const speed = 1000 / currentAvatarState.transitionDuration * 0.1;
              lerpMorphTarget(key, mapping[key], speed);
            } else {
              lerpMorphTarget(key, 0, 0.1);
            }
          });
        }
        
        // Handle blinking
        lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
        lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);
        
        // Handle lipsync (simplified)
        if (setupMode || !message || !lipsync || !audio) {
          Object.values(corresponding).forEach((value) => {
            lerpMorphTarget(value, 0, 0.1);
          });
          return;
        }
        
        const appliedMorphTargets: string[] = [];
        const currentAudioTime = audio.currentTime;
        
        for (let i = 0; i < lipsync.mouthCues.length; i++) {
          const mouthCue = lipsync.mouthCues[i];
          if (currentAudioTime >= mouthCue.start && currentAudioTime <= mouthCue.end) {
            const morphTarget = corresponding[mouthCue.value];
            if (morphTarget) {
              appliedMorphTargets.push(morphTarget);
              lerpMorphTarget(morphTarget, 1, 0.2);
            }
            break;
          }
        }
        
        Object.values(corresponding).forEach((value) => {
          if (!appliedMorphTargets.includes(value)) {
            lerpMorphTarget(value, 0, 0.1);
          }
        });
        
      } catch (error: any) {
        console.error('Error in useFrame:', error);
      }
    });
    
    // Development controls
    useControls("Debug Info", {
      modelLoaded: { value: debugInfo.modelLoaded, editable: false },
      nodesLoaded: { value: debugInfo.nodesLoaded, editable: false },
      sceneReady: { value: debugInfo.sceneReady, editable: false },
      animationManagerReady: { value: debugInfo.animationManagerReady, editable: false },
      error: { value: debugInfo.error || 'None', editable: false },
      forceReload: button(() => {
        window.location.reload();
      }),
    });
    
    useControls("Avatar Control", {
      testMessage: button(() => {
        if (sendMessage) {
          sendMessage("Hello! This is a test message.");
        }
      }),
      testVietnamese: button(() => {
        if (sendMessage) {
          sendMessage("Chào em! Hôm nay em thế nào?");
        }
      }),
    });
    
    useControls("Expression Control", {
      facialExpression: {
        value: currentAvatarState.expression,
        options: Object.keys(facialExpressions),
        onChange: (value: string) => {
          setFacialExpression(value);
          setCurrentAvatarState(prev => ({ ...prev, expression: value }));
          if (transitionManagerRef.current) {
            transitionManagerRef.current.transitionTo(value, 1000);
          }
        },
      },
      emotionalContext: {
        value: message?.emotionalIntent ? 
          `${message.emotionalIntent.primary} (${message.emotionalIntent.intensity.toFixed(2)}) - ${message.emotionalIntent.context}` : 
          'No active message',
        editable: false
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
        ...Object.keys(nodes.EyeLeft.morphTargetDictionary || {}).map((key) => {
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
        if (audio) {
          audio.pause();
          audio.src = '';
        }
        if (animationManagerRef.current) {
          animationManagerRef.current.stopAll();
        }
      };
    }, [audio]);
    
    // Log debug info when it changes
    useEffect(() => {
      console.log('Debug Info Updated:', debugInfo);
    }, [debugInfo]);
    
    return (
      <group {...props} dispose={null} ref={group}>
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
    
  } catch (error: any) {
    console.error('Error rendering Avatar:', error);
    
    // Return fallback component
    return (
      <group {...props}>
        <mesh>
          <boxGeometry args={[1, 2, 1]} />
          <meshBasicMaterial color="red" />
        </mesh>
        <Html>
          <div style={{ color: 'red', background: 'white', padding: '10px' }}>
            Avatar Error: {error?.message as string}
          </div>
        </Html>
      </group>
    );
  }
}

useGLTF.preload(avatarModel);