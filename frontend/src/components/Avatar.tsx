import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useChat } from "@/hooks/useChat";
import type { GLTF } from "three-stdlib";
import type { AvatarProps } from "@/types";
import { FacialExpression, GLTFResult, LipsyncData } from "@/types/avatar";
import { avatarModel, facialExpressions, corresponding, animationsModel } from "@/constant";

let setupMode = false;

export function Avatar(props: AvatarProps) {
  const { nodes, materials, scene } = useGLTF(
      avatarModel
  ) as GLTFResult;

  const chatContext = useChat() as any;
  const { message, onMessagePlayed, sendMessage } = chatContext;

  const [lipsync, setLipsync] = useState<LipsyncData | undefined>();

  useEffect(() => {
    
    if (!message) {
      setAnimation("Idle");
      return;
    }
    setAnimation(message.animation);
    setFacialExpression(message.facialExpression);
    setLipsync(message.lipsync);
    
    if (message.audio) {
      const audio = new Audio("data:audio/mp3;base64," + message.audio);
      audio.play().catch(console.error);
      setAudio(audio);
      audio.onended = onMessagePlayed;
    }
  }, [message, onMessagePlayed]);

  const { animations } = useGLTF(animationsModel) as GLTF & {
    animations: THREE.AnimationClip[];
  };

  const group = useRef<THREE.Group>(null);
  const { actions, mixer } = useAnimations(animations, group);
  const [animation, setAnimation] = useState<string>(
    animations.find((a) => a.name === "Idle") ? "Idle" : animations[0]?.name || "Idle"
  );

  useEffect(() => {
    if (actions[animation]) {
      actions[animation]
        .reset()
        .fadeIn(mixer.time === 0 ? 0 : 0.5)
        .play();
      return () => {
        if (actions[animation]) {
          actions[animation].fadeOut(0.5);
        }
      };
    }
  }, [animation, actions, mixer]);

  const lerpMorphTarget = (target: string, value: number, speed = 0.1): void => {
    scene.traverse((child) => {
      const skinnedMesh = child as THREE.SkinnedMesh;
      if (skinnedMesh.isSkinnedMesh && skinnedMesh.morphTargetDictionary) {
        const index = skinnedMesh.morphTargetDictionary[target];
        if (
          index === undefined ||
          skinnedMesh.morphTargetInfluences?.[index] === undefined
        ) {
          return;
        }
        skinnedMesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          skinnedMesh.morphTargetInfluences[index],
          value,
          speed
        );

        if (!setupMode) {
          try {
            set({
              [target]: value,
            });
          } catch (e) {
            // Ignore errors in production mode
          }
        }
      }
    });
  };

  const [blink, setBlink] = useState<boolean>(false);
  const [winkLeft, setWinkLeft] = useState<boolean>(false);
  const [winkRight, setWinkRight] = useState<boolean>(false);
  const [facialExpression, setFacialExpression] = useState<string>("");
  const [audio, setAudio] = useState<HTMLAudioElement | undefined>();

  useFrame(() => {
    if (!setupMode && nodes.EyeLeft?.morphTargetDictionary) {
      Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
        const mapping = facialExpressions[facialExpression];
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return; // eyes wink/blink are handled separately
        }

        if (mapping && mapping[key]) {
          lerpMorphTarget(key, mapping[key], 0.1);
        } else {
          lerpMorphTarget(key, 0, 0.1);
        }
      });
    }

    lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);

    // LIPSYNC
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
      if (
        currentAudioTime >= mouthCue.start &&
        currentAudioTime <= mouthCue.end
      ) {
        const morphTarget = corresponding[mouthCue.value];
        if (morphTarget) {
          appliedMorphTargets.push(morphTarget);
          lerpMorphTarget(morphTarget, 1, 0.2);
        }
        break;
      }
    }

    Object.values(corresponding).forEach((value) => {
      if (appliedMorphTargets.includes(value)) {
        return;
      }
      lerpMorphTarget(value, 0, 0.1);
    });
  });

  useControls("FacialExpressions", {
    chat: button(() => sendMessage("Hello!")),
    winkLeft: button(() => {
      setWinkLeft(true);
      setTimeout(() => setWinkLeft(false), 300);
    }),
    winkRight: button(() => {
      setWinkRight(true);
      setTimeout(() => setWinkRight(false), 300);
    }),
    animation: {
      value: animation,
      options: animations.map((a) => a.name),
      onChange: (value: string) => setAnimation(value),
    },
    facialExpression: {
      options: Object.keys(facialExpressions),
      onChange: (value: string) => setFacialExpression(value),
    },
    enableSetupMode: button(() => {
      setupMode = true;
    }),
    disableSetupMode: button(() => {
      setupMode = false;
    }),
    logMorphTargetValues: button(() => {
      if (!nodes.EyeLeft?.morphTargetDictionary || !nodes.EyeLeft?.morphTargetInfluences) return;
      
      const emotionValues: FacialExpression = {};
      Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return; // eyes wink/blink are handled separately
        }
        const index = nodes.EyeLeft.morphTargetDictionary![key];
        const value = nodes.EyeLeft.morphTargetInfluences![index];
        if (value && value > 0.01) {
          emotionValues[key] = value;
        }
      });
      console.log(JSON.stringify(emotionValues, null, 2));
    }),
  });

  const [, set] = useControls("MorphTarget", () => {
    if (!nodes.EyeLeft?.morphTargetDictionary || !nodes.EyeLeft?.morphTargetInfluences) return {};
    
    return Object.assign(
      {},
      ...Object.keys(nodes.EyeLeft.morphTargetDictionary).map((key) => {
        const index = nodes.EyeLeft.morphTargetDictionary![key];
        const currentValue = nodes.EyeLeft.morphTargetInfluences![index] || 0;
        
        return {
          [key]: {
            label: key,
            value: 0,
            min: currentValue,
            max: 1,
            onChange: (val: number) => {
              if (setupMode) {
                lerpMorphTarget(key, val, 1);
              }
            },
          },
        };
      })
    );
  });

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
}

useGLTF.preload(avatarModel);
useGLTF.preload(animationsModel);
