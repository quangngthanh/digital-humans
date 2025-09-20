import { FacialExpressions } from "@/types/avatar";
import { corresponding as VISEME_MAP } from './visemeMapping';

export const avatarModel = "/models/68bafcdfc11cea25ec03e4f1.glb";

export * from './animations';

export const facialExpressions: FacialExpressions = {
  /** Neutral/rest state - completely relaxed face */
  default: {},
  
  /** 😊 Natural smile - warm and genuine */
  smile: {
    browInnerUp: 0.15,
    eyeSquintLeft: 0.35,
    eyeSquintRight: 0.35,
    mouthSmileLeft: 0.8,
    mouthSmileRight: 0.8,
    mouthDimpleLeft: 0.4,
    mouthDimpleRight: 0.4,
    cheekSquintLeft: 0.3,
    cheekSquintRight: 0.3,
  },
  
  /** 😢 Deep sadness - downturned features */
  sad: {
    browInnerUp: 0.8,
    browDownLeft: 0.4,
    browDownRight: 0.4,
    eyeSquintLeft: 0.6,
    eyeSquintRight: 0.6,
    eyeLookDownLeft: 0.7,
    eyeLookDownRight: 0.7,
    mouthFrownLeft: 1.0,
    mouthFrownRight: 1.0,
    mouthLowerDownLeft: 0.6,
    mouthLowerDownRight: 0.6,
    mouthShrugLower: 0.4,
  },
  
  /** 😠 Controlled anger - furrowed brow and tense features */
  angry: {
    browDownLeft: 1.0,
    browDownRight: 1.0,
    eyeSquintLeft: 0.8,
    eyeSquintRight: 0.8,
    noseSneerLeft: 0.7,
    noseSneerRight: 0.7,
    mouthFrownLeft: 0.6,
    mouthFrownRight: 0.6,
    jawForward: 0.3,
    cheekSquintLeft: 0.5,
    cheekSquintRight: 0.5,
  },
  
  /** 😮 Surprise - wide eyes and open mouth */
  surprised: {
    eyeWideLeft: 1.0,
    eyeWideRight: 1.0,
    browInnerUp: 1.0,
    browOuterUpLeft: 0.8,
    browOuterUpRight: 0.8,
    jawOpen: 0.6,
    mouthFunnel: 0.4,
    mouthUpperUpLeft: 0.5,
    mouthUpperUpRight: 0.5,
  },
  
  /** 😨 Fear - wide eyes, raised brows, tense mouth */
  fear: {
    eyeWideLeft: 1.0,
    eyeWideRight: 1.0,
    browInnerUp: 1.0,
    browOuterUpLeft: 1.0,
    browOuterUpRight: 1.0,
    jawOpen: 0.4,
    mouthFunnel: 0.3,
    mouthUpperUpLeft: 0.8,
    mouthUpperUpRight: 0.8,
    eyeLookUpLeft: 0.2,
    eyeLookUpRight: 0.2,
  },
  
  /** 🤢 Disgust - wrinkled nose and raised upper lip */
  disgusted: {
    noseSneerLeft: 1.0,
    noseSneerRight: 1.0,
    mouthShrugUpper: 0.8,
    eyeSquintLeft: 0.7,
    eyeSquintRight: 0.7,
    browDownLeft: 0.5,
    browDownRight: 0.5,
    mouthFrownLeft: 0.4,
    mouthFrownRight: 0.4,
    cheekSquintLeft: 0.6,
    cheekSquintRight: 0.6,
  },
  
  /** 😄 Pure joy - big smile with squinted eyes */
  joy: {
    mouthSmileLeft: 0.8,
    mouthSmileRight: 0.8,
    eyeSquintLeft: 0.9,
    eyeSquintRight: 0.9,
    cheekSquintLeft: 0.8,
    cheekSquintRight: 0.8,
    mouthDimpleLeft: 0.8,
    mouthDimpleRight: 0.8,
    browOuterUpLeft: 0.4,
    browOuterUpRight: 0.4,
    jawOpen: 0.3,
  },

  // ============= 👁️ EYE EXPRESSIONS (12) =============
  
  /** 😉 Left eye wink */
  wink: {
    eyeBlinkLeft: 1.0,
    mouthSmileLeft: 0.3,
    mouthSmileRight: 0.3,
  },
  
  /** 😉 Right eye wink */
  winkRight: {
    eyeBlinkRight: 1.0,
    mouthSmileLeft: 0.3,
    mouthSmileRight: 0.3,
  },
  
  /** 😴 Sleepy - drooping eyelids */
  sleepy: {
    eyeBlinkLeft: 0.7,
    eyeBlinkRight: 0.7,
    browDownLeft: 0.5,
    browDownRight: 0.5,
    eyeLookDownLeft: 0.3,
    eyeLookDownRight: 0.3,
  },

  /** 😴 Closed eyes - drooping eyelids */
  closedEyes: {
    eyeBlinkLeft: 1,
    eyeBlinkRight: 1,
    browDownLeft: 0.5,
    browDownRight: 0.5,
    eyeLookDownLeft: 0.3,
    eyeLookDownRight: 0.3,
  },
  
  /** 😑 Tired - heavy eyelids and drooping features */
  tired: {
    eyeBlinkLeft: 0.6,
    eyeBlinkRight: 0.6,
    browDownLeft: 0.8,
    browDownRight: 0.8,
    eyeLookDownLeft: 0.4,
    eyeLookDownRight: 0.4,
    mouthFrownLeft: 0.3,
    mouthFrownRight: 0.3,
  },
  
  /** 👀 Alert - wide open eyes */
  alert: {
    eyeWideLeft: 0.8,
    eyeWideRight: 0.8,
    browOuterUpLeft: 0.5,
    browOuterUpRight: 0.5,
  },
  
  /** ⬆️ Looking up */
  lookUp: {
    eyeLookUpLeft: 1.0,
    eyeLookUpRight: 1.0,
    browOuterUpLeft: 0.3,
    browOuterUpRight: 0.3,
  },
  
  /** ⬇️ Looking down */
  lookDown: {
    eyeLookDownLeft: 1.0,
    eyeLookDownRight: 1.0,
    browDownLeft: 0.2,
    browDownRight: 0.2,
  },
  
  /** ⬅️ Looking left */
  lookLeft: {
    eyeLookOutLeft: 1.0,
    eyeLookInRight: 1.0,
  },
  
  /** ➡️ Looking right */
  lookRight: {
    eyeLookInLeft: 1.0,
    eyeLookOutRight: 1.0,
  },
  
  /** 🙄 Eye roll - looking up with slight squint */
  eyeRoll: {
    eyeLookUpLeft: 1.0,
    eyeLookUpRight: 1.0,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
    browDownLeft: 0.3,
    browDownRight: 0.3,
  },
  
  /** 👁️‍🗨️ Cross-eyed */
  crossEyed: {
    eyeLookInLeft: 1.0,
    eyeLookInRight: 1.0,
  },
  
  /** 😲 Wide-eyed stare */
  stare: {
    eyeWideLeft: 1.0,
    eyeWideRight: 1.0,
    browInnerUp: 0.3,
    browOuterUpLeft: 0.4,
    browOuterUpRight: 0.4,
  },

  // ============= 🤨 BROW EXPRESSIONS (8) =============
  
  /** 😕 Confused - asymmetrical brow raise */
  confused: {
    browInnerUp: 0.6,
    browDownLeft: 0.3,
    browOuterUpRight: 0.7,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
    mouthLeft: 0.4,
  },
  
  /** 🤨 Skeptical - one eyebrow raised */
  skeptical: {
    browDownLeft: 0.6,
    browOuterUpRight: 1.0,
    eyeSquintLeft: 0.5,
    mouthLeft: 0.3,
  },
  
  /** 😟 Worried - inner brows raised */
  worried: {
    browInnerUp: 1.0,
    browDownLeft: 0.2,
    browDownRight: 0.2,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.4,
    mouthFrownLeft: 0.4,
    mouthFrownRight: 0.4,
  },
  
  /** 🤔 Thoughtful - slight brow furrow */
  thoughtful: {
    browDownLeft: 0.4,
    browDownRight: 0.4,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
    mouthLeft: 0.2,
  },
  
  /** 😤 Determined - lowered brows */
  determined: {
    browDownLeft: 1.0,
    browDownRight: 1.0,
    eyeSquintLeft: 0.5,
    eyeSquintRight: 0.5,
    mouthPressLeft: 0.7,
    mouthPressRight: 0.7,
    jawForward: 0.2,
  },
  
  /** 🧐 Focused - concentrated brow position */
  focused: {
    browDownLeft: 0.7,
    browDownRight: 0.7,
    eyeSquintLeft: 0.6,
    eyeSquintRight: 0.6,
    mouthPressLeft: 0.3,
    mouthPressRight: 0.3,
  },
  
  /** 😧 Concerned - worried brow with slight frown */
  concerned: {
    browInnerUp: 0.8,
    browDownLeft: 0.4,
    browDownRight: 0.4,
    eyeSquintLeft: 0.5,
    eyeSquintRight: 0.5,
    mouthFrownLeft: 0.5,
    mouthFrownRight: 0.5,
  },
  
  /** 😌 Relaxed - slightly raised outer brows */
  relaxed: {
    browOuterUpLeft: 0.3,
    browOuterUpRight: 0.3,
    eyeBlinkLeft: 0.2,
    eyeBlinkRight: 0.2,
    mouthSmileLeft: 0.2,
    mouthSmileRight: 0.2,
  },

  // ============= 👄 MOUTH EXPRESSIONS (15) =============
  
  /** 😗 Kiss - puckered lips */
  kiss: {
    mouthPucker: 1.0,
    mouthFunnel: 0.3,
    eyeBlinkLeft: 0.4,
    eyeBlinkRight: 0.4,
  },
  
  /** 🎵 Whistle - pursed lips with opening */
  whistle: {
    mouthPucker: 0.8,
    mouthFunnel: 0.6,
    jawOpen: 0.2,
    cheekSquintLeft: 0.2,
    cheekSquintRight: 0.2,
  },
  
  /** 😏 Smirk - one-sided smile */
  smirk: {
    mouthSmileLeft: 0.8,
    mouthDimpleLeft: 0.6,
    eyeSquintLeft: 0.3,
  },
  
  /** 😊 Grin - wide smile showing teeth */
  grin: {
    mouthSmileLeft: 1.0,
    mouthSmileRight: 1.0,
    mouthStretchLeft: 0.5,
    mouthStretchRight: 0.5,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.4,
    jawOpen: 0.2,
  },
  
  /** 😤 Pout - protruding lower lip */
  pout: {
    mouthPucker: 0.5,
    mouthLowerDownLeft: 0.8,
    mouthLowerDownRight: 0.8,
    browInnerUp: 0.3,
    mouthFrownLeft: 0.3,
    mouthFrownRight: 0.3,
  },
  
  /** 😮 Ooh - rounded mouth opening */
  ooh: {
    mouthFunnel: 1.0,
    jawOpen: 0.4,
    eyeWideLeft: 0.2,
    eyeWideRight: 0.2,
  },
  
  /** 😯 Ahh - wide mouth opening */
  ahh: {
    jawOpen: 1.0,
    mouthOpen: 0.8,
    browOuterUpLeft: 0.2,
    browOuterUpRight: 0.2,
  },
  
  /** 🥱 Yawn - wide open with tired eyes */
  yawn: {
    jawOpen: 1.0,
    mouthFunnel: 0.3,
    eyeBlinkLeft: 0.8,
    eyeBlinkRight: 0.8,
    browDownLeft: 0.5,
    browDownRight: 0.5,
  },
  
  /** 😬 Grimace - showing teeth tensely */
  grimace: {
    mouthStretchLeft: 0.8,
    mouthStretchRight: 0.8,
    eyeSquintLeft: 0.6,
    eyeSquintRight: 0.6,
    browDownLeft: 0.4,
    browDownRight: 0.4,
  },
  
  /** 🤐 Sealed lips - mouth pressed shut */
  sealed: {
    mouthPressLeft: 0.5,
    mouthPressRight: 0.5,
    mouthClose: 0.19,
  },
  
  /** 😋 Tongue out - playful expression */
  tongueOut: {
    jawOpen: 0.8,
    tongueOut: 0.5,
    mouthSmileLeft: 0.4,
    mouthSmileRight: 0.4,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
    mouthClose: 0.19,
  },
  
  /** 🤤 Drool - open mouth, relaxed */
  drool: {
    jawOpen: 0.6,
    mouthOpen: 0.5,
    eyeBlinkLeft: 0.4,
    eyeBlinkRight: 0.4,
  },
  
  /** 😪 Sigh - slight mouth opening with exhale */
  sigh: {
    jawOpen: 0.3,
    mouthFunnel: 0.4,
    eyeBlinkLeft: 0.3,
    eyeBlinkRight: 0.3,
    browDownLeft: 0.2,
    browDownRight: 0.2,
  },
  
  /** 🤫 Shush - finger to lips gesture implied */
  shush: {
    mouthPucker: 0.6,
    eyeWideLeft: 0.3,
    eyeWideRight: 0.3,
    browInnerUp: 0.2,
  },
  
  /** 😝 Raspberry - tongue out with squint */
  raspberry: {
    jawOpen: 0.8,
    mouthClose: 0.19,
    tongueOut: 0.9,
    eyeSquintLeft: 0.8,
    eyeSquintRight: 0.8,
    mouthStretchLeft: 0.5,
    mouthStretchRight: 0.5,
  },

  // ============= 😊 CHEEK EXPRESSIONS (4) =============
  
  /** 🐿️ Chipmunk - puffed cheeks */
  chipmunk: {
    cheekPuff: 0.8,
    mouthClose: 0.4,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
  },
  
  
  /** 😗 Sucked cheeks - hollow cheeks */
  suckedCheeks: {
    cheekSquintLeft: 1.0,
    cheekSquintRight: 1.0,
    mouthPucker: 0.4,
  },
  
  /** 😊 Dimpled smile - emphasized cheek dimples */
  dimples: {
    mouthSmileLeft: 0.8,
    mouthSmileRight: 0.8,
    mouthDimpleLeft: 0.6,
    mouthDimpleRight: 0.6,
    cheekSquintLeft: 0.5,
    cheekSquintRight: 0.5,
  },

  // ============= 🎭 COMPLEX EMOTIONS (12) =============
  
  /** 😂 Laughing - intense joy with open mouth */
  laughing: {
    mouthSmileLeft: 1.0,
    mouthSmileRight: 1.0,
    jawOpen: 0.8,
    eyeSquintLeft: 1.0,
    eyeSquintRight: 1.0,
    cheekSquintLeft: 1.0,
    cheekSquintRight: 1.0,
    mouthDimpleLeft: 1.0,
    mouthDimpleRight: 1.0,
    browOuterUpLeft: 0.4,
    browOuterUpRight: 0.4,
  },
  
  /** 🤭 Giggling - restrained laughter */
  giggling: {
    mouthSmileLeft: 0.7,
    mouthSmileRight: 0.7,
    jawOpen: 0.3,
    eyeSquintLeft: 0.6,
    eyeSquintRight: 0.6,
    cheekSquintLeft: 0.5,
    cheekSquintRight: 0.5,
    mouthDimpleLeft: 0.6,
    mouthDimpleRight: 0.6,
  },
  
  /** 😭 Crying - intense sadness with mouth open */
  crying: {
    mouthFrownLeft: 1.0,
    mouthFrownRight: 1.0,
    browInnerUp: 1.0,
    eyeSquintLeft: 1.0,
    eyeSquintRight: 1.0,
    jawOpen: 0.5,
    mouthShrugLower: 0.8,
    mouthLowerDownLeft: 1.0,
    mouthLowerDownRight: 1.0,
  },
  
  /** 😱 Terrified - extreme fear */
  terrified: {
    eyeWideLeft: 1.0,
    eyeWideRight: 1.0,
    browInnerUp: 1.0,
    browOuterUpLeft: 1.0,
    browOuterUpRight: 1.0,
    jawOpen: 1.0,
    mouthFunnel: 0.3,
    mouthUpperUpLeft: 1.0,
    mouthUpperUpRight: 1.0,
  },
  
  /** 😖 Frustrated - tense and annoyed */
  frustrated: {
    browDownLeft: 0.8,
    browDownRight: 0.8,
    eyeSquintLeft: 0.7,
    eyeSquintRight: 0.7,
    mouthFrownLeft: 0.6,
    mouthFrownRight: 0.6,
    jawForward: 0.4,
    noseSneerLeft: 0.5,
    noseSneerRight: 0.5,
  },
  
  /** 😴 Peaceful - content and relaxed */
  peaceful: {
    eyeBlinkLeft: 0.8,
    eyeBlinkRight: 0.8,
    mouthSmileLeft: 0.3,
    mouthSmileRight: 0.3,
    browOuterUpLeft: 0.2,
    browOuterUpRight: 0.2,
  },
  
  /** 🥺 Pleading - big eyes with slight pout */
  pleading: {
    eyeWideLeft: 0.8,
    eyeWideRight: 0.8,
    browInnerUp: 0.8,
    mouthPucker: 0.3,
    mouthLowerDownLeft: 0.4,
    mouthLowerDownRight: 0.4,
  },
  
  /** 😤 Defiant - strong and resistant */
  defiant: {
    browDownLeft: 1.0,
    browDownRight: 1.0,
    eyeSquintLeft: 0.6,
    eyeSquintRight: 0.6,
    jawForward: 0.5,
    mouthPressLeft: 0.8,
    mouthPressRight: 0.8,
    noseSneerLeft: 0.4,
    noseSneerRight: 0.4,
  },
  
  /** 😌 Content - satisfied and happy */
  content: {
    mouthSmileLeft: 0.5,
    mouthSmileRight: 0.5,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
    browOuterUpLeft: 0.2,
    browOuterUpRight: 0.2,
  },
  
  /** 🤗 Euphoric - extreme happiness */
  euphoric: {
    mouthSmileLeft: 1.0,
    mouthSmileRight: 1.0,
    eyeSquintLeft: 0.9,
    eyeSquintRight: 0.9,
    browInnerUp: 0.5,
    browOuterUpLeft: 0.6,
    browOuterUpRight: 0.6,
    cheekSquintLeft: 0.8,
    cheekSquintRight: 0.8,
    jawOpen: 0.4,
  },
  
  /** 😞 Melancholy - deep thoughtful sadness */
  melancholy: {
    browInnerUp: 0.6,
    eyeLookDownLeft: 0.8,
    eyeLookDownRight: 0.8,
    mouthFrownLeft: 0.5,
    mouthFrownRight: 0.5,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.4,
  },
  
  /** 🤯 Overwhelmed - too much stimulation */
  overwhelmed: {
    eyeWideLeft: 1.0,
    eyeWideRight: 1.0,
    browInnerUp: 1.0,
    browDownLeft: 0.3,
    browDownRight: 0.3,
    jawOpen: 0.5,
    mouthFunnel: 0.4,
  },

  // ============= 🤝 SOCIAL EXPRESSIONS (8) =============
  
  /** 😏 Flirtatious - coy and inviting */
  flirtatious: {
    eyeBlinkLeft: 0.6,
    mouthSmileLeft: 0.6,
    mouthSmileRight: 0.8,
    mouthDimpleLeft: 0.4,
    mouthDimpleRight: 0.6,
    eyeLookDownLeft: 0.3,
    eyeLookDownRight: 0.3,
  },
  
  /** 😈 Mischievous - playfully devious */
  mischievous: {
    mouthSmileLeft: 0.8,
    mouthSmileRight: 0.5,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.6,
    browDownRight: 0.3,
    mouthDimpleLeft: 0.7,
  },
  
  /** 🙃 Playful - fun and energetic */
  playful: {
    mouthSmileLeft: 0.7,
    mouthSmileRight: 0.7,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
    browOuterUpLeft: 0.4,
    browOuterUpRight: 0.4,
    tongueOut: 0.2,
  },
  
  /** 😳 Embarrassed - shy and self-conscious */
  embarrassed: {
    eyeLookDownLeft: 0.8,
    eyeLookDownRight: 0.8,
    mouthSmileLeft: 0.3,
    mouthSmileRight: 0.3,
    browInnerUp: 0.3,
    cheekPuff: 0.2,
  },
  
  /** 😤 Proud - confident and accomplished */
  proud: {
    browOuterUpLeft: 0.4,
    browOuterUpRight: 0.4,
    mouthSmileLeft: 0.6,
    mouthSmileRight: 0.6,
    jawForward: 0.2,
    eyeSquintLeft: 0.2,
    eyeSquintRight: 0.2,
  },
  
  /** 😔 Ashamed - guilt and regret */
  ashamed: {
    eyeLookDownLeft: 1.0,
    eyeLookDownRight: 1.0,
    browInnerUp: 0.6,
    browDownLeft: 0.4,
    browDownRight: 0.4,
    mouthFrownLeft: 0.5,
    mouthFrownRight: 0.5,
  },
  
  /** 🤨 Judgmental - disapproving look */
  judgmental: {
    browDownLeft: 0.8,
    browOuterUpRight: 0.6,
    eyeSquintLeft: 0.7,
    eyeSquintRight: 0.4,
    mouthLeft: 0.4,
    noseSneerLeft: 0.3,
  },
  
  /** 😊 Welcoming - warm and inviting */
  welcoming: {
    mouthSmileLeft: 0.7,
    mouthSmileRight: 0.7,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.4,
    browOuterUpLeft: 0.3,
    browOuterUpRight: 0.3,
    mouthDimpleLeft: 0.5,
    mouthDimpleRight: 0.5,
  },

  // ============= 🧠 COGNITIVE STATES (6) =============
  
  /** 🤔 Thinking - deep concentration */
  thinking: {
    eyeLookUpLeft: 0.6,
    eyeLookUpRight: 0.6,
    browInnerUp: 0.3,
    mouthLeft: 0.3,
    mouthPucker: 0.2,
  },
  
  /** 🤯 Puzzled - trying to understand */
  puzzled: {
    browInnerUp: 0.6,
    browDownLeft: 0.3,
    browDownRight: 0.3,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.4,
    mouthLeft: 0.5,
    mouthPucker: 0.3,
  },
  
  /** 🎯 Concentrating - intense focus */
  concentrating: {
    browDownLeft: 0.8,
    browDownRight: 0.8,
    eyeSquintLeft: 0.6,
    eyeSquintRight: 0.6,
    mouthPressLeft: 0.5,
    mouthPressRight: 0.5,
  },
  
  /** 🧘 Contemplating - deep reflection */
  contemplating: {
    eyeLookDownLeft: 0.4,
    eyeLookDownRight: 0.4,
    browInnerUp: 0.3,
    mouthLeft: 0.3,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
  },
  
  /** 🤓 Curious - interested and inquisitive */
  curious: {
    browInnerUp: 0.6,
    browOuterUpLeft: 0.4,
    browOuterUpRight: 0.4,
    eyeWideLeft: 0.4,
    eyeWideRight: 0.4,
    mouthOpen: 0.2,
  },
  
  /** 💡 Enlightened - sudden understanding */
  enlightened: {
    eyeWideLeft: 0.6,
    eyeWideRight: 0.6,
    browInnerUp: 0.5,
    browOuterUpLeft: 0.6,
    browOuterUpRight: 0.6,
    mouthSmileLeft: 0.4,
    mouthSmileRight: 0.4,
    jawOpen: 0.2,
  },

  // ============= 🤕 PHYSICAL STATES (5) =============
  
  /** 😣 Pain - physical discomfort */
  pain: {
    browDownLeft: 1.0,
    browDownRight: 1.0,
    eyeSquintLeft: 1.0,
    eyeSquintRight: 1.0,
    mouthFrownLeft: 0.8,
    mouthFrownRight: 0.8,
    noseSneerLeft: 0.6,
    noseSneerRight: 0.6,
  },
  
  /** 🤒 Sick - feeling unwell */
  sick: {
    eyeBlinkLeft: 0.6,
    eyeBlinkRight: 0.6,
    browDownLeft: 0.5,
    browDownRight: 0.5,
    mouthFrownLeft: 0.4,
    mouthFrownRight: 0.4,
    noseSneerLeft: 0.3,
    noseSneerRight: 0.3,
  },
  
  /** 🤢 Nauseous - feeling queasy */
  nauseous: {
    noseSneerLeft: 0.8,
    noseSneerRight: 0.8,
    mouthShrugUpper: 0.6,
    browDownLeft: 0.5,
    browDownRight: 0.5,
    eyeSquintLeft: 0.6,
    eyeSquintRight: 0.6,
    cheekSquintLeft: 0.4,
    cheekSquintRight: 0.4,
  },
  
  /** 😵 Dizzy - disoriented */
  dizzy: {
    eyeLookUpLeft: 0.5,
    eyeLookUpRight: 0.3,
    eyeLookInLeft: 0.4,
    eyeLookOutRight: 0.4,
    browInnerUp: 0.4,
    jawOpen: 0.3,
    mouthFunnel: 0.2,
  },
  
  /** 🥵 Hot - overheated */
  hot: {
    jawOpen: 0.4,
    mouthFunnel: 0.3,
    eyeBlinkLeft: 0.3,
    eyeBlinkRight: 0.3,
    browDownLeft: 0.3,
    browDownRight: 0.3,
  },

  // ============= 😐 MICRO EXPRESSIONS (8) =============
  
  /** 😐 Neutral - completely blank */
  neutral: {},
  
  /** 😑 Bored - disinterested */
  bored: {
    eyeBlinkLeft: 0.4,
    eyeBlinkRight: 0.4,
    browDownLeft: 0.3,
    browDownRight: 0.3,
    eyeLookDownLeft: 0.3,
    eyeLookDownRight: 0.3,
  },
  
  /** 🙄 Annoyed - mildly irritated */
  annoyed: {
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.4,
    browDownLeft: 0.5,
    browDownRight: 0.5,
    mouthLeft: 0.3,
  },
  
  /** 😒 Unimpressed - not convinced */
  unimpressed: {
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
    browDownLeft: 0.4,
    browDownRight: 0.4,
    mouthFrownLeft: 0.2,
    mouthFrownRight: 0.2,
  },
  
  /** 🤷 Indifferent - don't care */
  indifferent: {
    browOuterUpLeft: 0.3,
    browOuterUpRight: 0.3,
    eyeBlinkLeft: 0.2,
    eyeBlinkRight: 0.2,
  },
  
  /** 😕 Uncomfortable - slightly uneasy */
  uncomfortable: {
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.4,
    mouthLeft: 0.3,
    browDownLeft: 0.2,
    browDownRight: 0.2,
  },
  
  /** 😎 Cool - confident and relaxed */
  cool: {
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
    mouthSmileLeft: 0.3,
    mouthSmileRight: 0.3,
    browOuterUpLeft: 0.2,
    browOuterUpRight: 0.2,
  },
  
  /** 🤤 Dreamy - lost in thought */
  dreamy: {
    eyeLookUpLeft: 0.4,
    eyeLookUpRight: 0.4,
    eyeBlinkLeft: 0.3,
    eyeBlinkRight: 0.3,
    mouthSmileLeft: 0.2,
    mouthSmileRight: 0.2,
    browOuterUpLeft: 0.2,
    browOuterUpRight: 0.2,
  },

  // ============= 🎪 SPECIAL/FUNNY EXPRESSIONS (4) =============
  
  /** 🤪 Crazy - wild and unhinged */
  crazy: {
    browInnerUp: 0.9,
    noseSneerLeft: 0.6,
    noseSneerRight: 0.5,
    eyeLookDownLeft: 0.4,
    eyeLookUpRight: 0.4,
    eyeLookInLeft: 0.8,
    eyeLookInRight: 0.8,
    jawOpen: 0.8,
    mouthDimpleLeft: 0.8,
    mouthDimpleRight: 0.8,
    mouthStretchLeft: 0.3,
    mouthStretchRight: 0.3,
    mouthSmileLeft: 0.6,
    mouthSmileRight: 0.4,
    tongueOut: 0.6,
    eyeWideLeft: 0.8,
    eyeWideRight: 0.8,
  },
  
  /** 🤡 Funny face - exaggerated silly */
  funnyFace: {
    jawLeft: 0.4,
    mouthPucker: 0.5,
    noseSneerLeft: 1.0,
    noseSneerRight: 0.4,
    mouthLeft: 0.6,
    eyeLookUpLeft: 1.0,
    eyeLookUpRight: 1.0,
    cheekPuff: 0.8,
    mouthDimpleLeft: 0.4,
    mouthRollLower: 0.3,
    mouthSmileLeft: 0.4,
    mouthSmileRight: 0.4,
    browInnerUp: 0.8,
    tongueOut: 0.3,
  },
  
  /** 🤭 Cheeky - mischievously cute */
  cheeky: {
    mouthSmileLeft: 0.6,
    mouthSmileRight: 0.8,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.5,
    mouthDimpleLeft: 0.4,
    mouthDimpleRight: 0.6,
    cheekPuff: 0.3,
    tongueOut: 0.2,
  },
  
  /** 😵‍💫 Goofy - silly and endearing */
  goofy: {
    eyeLookInLeft: 0.6,
    eyeLookOutRight: 0.6,
    mouthSmileLeft: 0.8,
    mouthSmileRight: 0.8,
    browOuterUpLeft: 0.5,
    browOuterUpRight: 0.5,
    jawOpen: 0.4,
    tongueOut: 0.4,
  },
};

/**
 * 📂 EXPRESSION CATEGORIES
 * 
 * Organized groupings for easy navigation and selection
 */
export const expressionCategories = {
  /** Basic human emotions */
  basic: [
    'default', 'smile', 'sad', 'angry', 'surprised', 'fear', 'disgusted', 'joy'
  ],
  
  /** Eye-focused expressions */
  eyeExpressions: [
    'wink', 'winkRight', 'sleepy', 'tired', 'alert', 'lookUp', 'lookDown', 
    'lookLeft', 'lookRight', 'eyeRoll', 'crossEyed', 'stare'
  ],
  
  /** Eyebrow movements and positions */
  browExpressions: [
    'confused', 'skeptical', 'worried', 'thoughtful', 'determined', 
    'focused', 'concerned', 'relaxed'
  ],
  
  /** Mouth shapes and movements */
  mouthExpressions: [
    'kiss', 'whistle', 'smirk', 'grin', 'pout', 'ooh', 'ahh', 'yawn', 
    'grimace', 'sealed', 'tongueOut', 'drool', 'sigh', 'shush', 'raspberry'
  ],
  
  /** Cheek deformations */
  cheekExpressions: [
    'chipmunk', 'puffedCheeks', 'suckedCheeks', 'dimples'
  ],
  
  /** Complex emotional states */
  complexEmotions: [
    'laughing', 'giggling', 'crying', 'terrified', 'frustrated', 
    'peaceful', 'pleading', 'defiant', 'content', 'euphoric', 
    'melancholy', 'overwhelmed'
  ],
  
  /** Social interaction expressions */
  socialExpressions: [
    'flirtatious', 'mischievous', 'playful', 'embarrassed', 'proud', 
    'ashamed', 'judgmental', 'welcoming'
  ],
  
  /** Mental and cognitive states */
  cognitiveExpressions: [
    'thinking', 'puzzled', 'concentrating', 'contemplating', 'curious', 'enlightened'
  ],
  
  /** Physical discomfort and states */
  physicalStates: [
    'pain', 'sick', 'nauseous', 'dizzy', 'hot'
  ],
  
  /** Subtle micro-expressions */
  microExpressions: [
    'neutral', 'bored', 'annoyed', 'unimpressed', 'indifferent', 
    'uncomfortable', 'cool', 'dreamy'
  ],
  
  /** Fun and silly expressions */
  funExpressions: [
    'crazy', 'funnyFace', 'cheeky', 'goofy'
  ]
};




// Final export statement to ensure everything is properly exported
export default {
  facialExpressions,
  expressionCategories,
};

/**
 * 🎭 MORPH TARGET CATEGORIZATION
 * 
 * Separates morphs into mouth-related and non-mouth categories
 * Essential for preventing conflicts during lip-sync
 */
export const MORPH_CATEGORIES = {
  // Mouth-related morphs (will be excluded during lip-sync)
  mouth: [
    // Basic mouth shapes
    'mouthOpen', 'mouthClose', 'mouthFunnel', 'mouthPucker', 
    'mouthSmileLeft', 'mouthSmileRight', 'mouthFrownLeft', 'mouthFrownRight',
    'mouthDimpleLeft', 'mouthDimpleRight', 'mouthStretchLeft', 'mouthStretchRight',
    'mouthUpperUpLeft', 'mouthUpperUpRight', 'mouthLowerDownLeft', 'mouthLowerDownRight',
    'mouthPressLeft', 'mouthPressRight', 'mouthShrugUpper', 'mouthShrugLower',
    'mouthLeft', 'mouthRight', 'mouthRollUpper', 'mouthRollLower',
    
    // Jaw movements (affects mouth position)
    'jawOpen', 'jawForward', 'jawLeft', 'jawRight',
    
    // Tongue (part of mouth system)
    'tongueOut',
    
    // Viseme morphs (from VISEME_MAP)
    ...Object.values(VISEME_MAP),
  ],
  
  // Non-mouth morphs (safe during lip-sync)
  nonMouth: [
    // Eyes
    'eyeBlinkLeft', 'eyeBlinkRight', 'eyeSquintLeft', 'eyeSquintRight',
    'eyeWideLeft', 'eyeWideRight', 'eyeLookUpLeft', 'eyeLookUpRight',
    'eyeLookDownLeft', 'eyeLookDownRight', 'eyeLookInLeft', 'eyeLookInRight',
    'eyeLookOutLeft', 'eyeLookOutRight',
    
    // Eyebrows
    'browDownLeft', 'browDownRight', 'browInnerUp', 'browOuterUpLeft', 'browOuterUpRight',
    
    // Nose
    'noseSneerLeft', 'noseSneerRight',
    
    // Cheeks
    'cheekPuff', 'cheekSquintLeft', 'cheekSquintRight',
  ]
};

/**
 * 🎯 SPEECH-ADAPTED EXPRESSIONS
 * 
 * Configuration for adapting emotional expressions during speech
 */
export const speechAdaptedExpressions = {
  // Compensation multipliers for non-mouth morphs during speech
  compensationFactors: {
    eyes: 1.2,        // Enhance eye expressions
    eyebrows: 1.15,   // Slightly enhance eyebrows
    cheeks: 1.1,      // Subtle cheek enhancement
    nose: 1.05,       // Minimal nose enhancement
  },
  
  // Alternative expressions for emotions heavily dependent on mouth
  alternatives: {
    // For smile-based emotions, emphasize eyes/cheeks
    smile: {
      eyeSquintLeft: 0.4,
      eyeSquintRight: 0.4,
      cheekSquintLeft: 0.6,
      cheekSquintRight: 0.6,
      browOuterUpLeft: 0.2,
      browOuterUpRight: 0.2,
    },
    
    // For sad emotions, emphasize brows/eyes
    sad: {
      browInnerUp: 1.0,
      eyeSquintLeft: 0.8,
      eyeSquintRight: 0.8,
      eyeLookDownLeft: 0.8,
      eyeLookDownRight: 0.8,
    },
    
    // For joy/happiness, focus on eyes and cheeks
    joy: {
      eyeSquintLeft: 0.9,
      eyeSquintRight: 0.9,
      cheekSquintLeft: 0.8,
      cheekSquintRight: 0.8,
      browOuterUpLeft: 0.4,
      browOuterUpRight: 0.4,
    },
    
    // For anger, emphasize brows and nose
    angry: {
      browDownLeft: 1.0,
      browDownRight: 1.0,
      eyeSquintLeft: 0.8,
      eyeSquintRight: 0.8,
      noseSneerLeft: 0.7,
      noseSneerRight: 0.7,
      cheekSquintLeft: 0.5,
      cheekSquintRight: 0.5,
    },
    
    // For surprise, focus on eyes and brows
    surprised: {
      eyeWideLeft: 1.0,
      eyeWideRight: 1.0,
      browInnerUp: 1.0,
      browOuterUpLeft: 0.8,
      browOuterUpRight: 0.8,
    }
  }
};

/**
 * 🛠️ EXPRESSION UTILITIES
 * 
 * Helper functions for morph processing and expression adaptation
 */
export const expressionUtils = {
  /**
   * Filter morphs by category
   */
  filterMorphsByCategory: (morphs: Record<string, number>, category: 'mouth' | 'nonMouth') => {
    const allowedMorphs = MORPH_CATEGORIES[category];
    return Object.fromEntries(
      Object.entries(morphs).filter(([morphName]) => 
        allowedMorphs.includes(morphName)
      )
    );
  },
  
  /**
   * Remove mouth morphs from expression
   */
  removeMouthMorphs: (morphs: Record<string, number>) => {
    return Object.fromEntries(
      Object.entries(morphs).filter(([morphName]) => 
        !MORPH_CATEGORIES.mouth.includes(morphName)
      )
    );
  },
  
  /**
   * Enhance non-mouth morphs with compensation factors
   */
  enhanceNonMouthMorphs: (morphs: Record<string, number>) => {
    const enhanced = { ...morphs };
    
    Object.entries(enhanced).forEach(([morphName, value]) => {
      if (morphName.includes('eye') || morphName.includes('Eye')) {
        enhanced[morphName] = value * speechAdaptedExpressions.compensationFactors.eyes;
      } else if (morphName.includes('brow') || morphName.includes('Brow')) {
        enhanced[morphName] = value * speechAdaptedExpressions.compensationFactors.eyebrows;
      } else if (morphName.includes('cheek') || morphName.includes('Cheek')) {
        enhanced[morphName] = value * speechAdaptedExpressions.compensationFactors.cheeks;
      } else if (morphName.includes('nose') || morphName.includes('Nose')) {
        enhanced[morphName] = value * speechAdaptedExpressions.compensationFactors.nose;
      }
    });
    
    return enhanced;
  },
  
  /**
   * Get speech-adapted version of an expression
   */
  adaptExpressionForSpeech: (morphs: Record<string, number>, emotionName?: string) => {
    // First remove mouth morphs
    let adaptedMorphs = expressionUtils.removeMouthMorphs(morphs);
    
    // If we have a specific emotion alternative, use it
    if (emotionName && emotionName in speechAdaptedExpressions.alternatives) {
      const alternative = speechAdaptedExpressions.alternatives[emotionName as keyof typeof speechAdaptedExpressions.alternatives];
      // Merge alternative morphs, prioritizing alternative values
      adaptedMorphs = { ...adaptedMorphs, ...alternative };
    }
    
    // Enhance remaining morphs for better visibility during speech
    adaptedMorphs = expressionUtils.enhanceNonMouthMorphs(adaptedMorphs);
    
    return adaptedMorphs;
  },
  
  /**
   * Check if a morph name is mouth-related
   */
  isMouthMorph: (morphName: string) => {
    return MORPH_CATEGORIES.mouth.includes(morphName);
  },
  
  /**
   * Check if a morph name is non-mouth related
   */
  isNonMouthMorph: (morphName: string) => {
    return MORPH_CATEGORIES.nonMouth.includes(morphName);
  }
};
