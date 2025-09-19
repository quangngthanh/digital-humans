import { FacialExpressions } from "@/types/avatar";

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

/**
 * 🎛️ EMOTION INTENSITY LEVELS
 * 
 * Multipliers for creating subtle to extreme variations
 */
export const emotionIntensities = {
  /** Very subtle, barely noticeable */
  micro: 0.2,
  /** Subtle but visible */
  subtle: 0.4,
  /** Normal everyday expression */
  mild: 0.6,
  /** Moderate intensity */
  moderate: 0.8,
  /** Normal full expression */
  normal: 1.0,
  /** Strong, pronounced */
  strong: 1.2,
  /** Very intense */
  intense: 1.4,
  /** Extreme, exaggerated */
  extreme: 1.6,
  /** Over-the-top, cartoonish */
  theatrical: 2.0,
};

/**
 * ⏱️ EXPRESSION TIMING GUIDELINES
 * 
 * Recommended durations for natural-looking animations (in milliseconds)
 */
export const expressionTimings = {
  /** Quick micro-expressions */
  microExpressions: {
    wink: 300,
    eyeRoll: 600,
    smirk: 400,
    blink: 150,
  },
  
  /** Standard expressions */
  normalExpressions: {
    smile: 800,
    frown: 1000,
    surprised: 500,
    confused: 1200,
    thinking: 1500,
  },
  
  /** Extended emotional states */
  sustainedExpressions: {
    sad: 2500,
    angry: 2000,
    laughing: 3000,
    crying: 4000,
    concentrating: 3000,
  },
  
  /** Animation transitions */
  transitions: {
    /** Blend between expressions */
    blend: 500,
    /** Fade in new expression */
    fadeIn: 300,
    /** Fade out expression */
    fadeOut: 400,
    /** Hold expression duration */
    hold: 1000,
    /** Quick snap to expression */
    snap: 100,
  }
};

/**
 * 🎯 CONTEXTUAL INTENSITY MODIFIERS
 * 
 * Adjust expression intensity based on social context
 */
export const contextualIntensities = {
  /** Social situations */
  social: {
    public: 0.7,        // More reserved in public
    intimate: 1.0,      // Full expression in private
    professional: 0.6,  // Controlled in work settings
    casual: 0.9,        // Natural with friends
    formal: 0.5,        // Very controlled in formal settings
  },
  
  /** Emotional contexts */
  emotional: {
    joy: 1.2,      // Can be expressive
    sadness: 0.8,  // Often suppressed
    anger: 0.7,    // Usually controlled
    surprise: 1.0, // Natural reaction
    fear: 1.1,     // Hard to suppress
    disgust: 0.6,  // Often politely hidden
  },
  
  /** Age-based modifiers */
  age: {
    child: 1.4,    // More exaggerated
    teenager: 1.1, // Slightly more expressive
    adult: 1.0,    // Baseline
    elderly: 0.7,  // More subtle due to muscle changes
  },
  
  /** Personality types */
  personality: {
    extrovert: 1.2,   // More expressive
    introvert: 0.8,   // More subtle
    dramatic: 1.5,    // Exaggerated
    stoic: 0.6,      // Very controlled
    animated: 1.3,    // Lively expressions
  }
};

/**
 * 🎲 RANDOM EXPRESSION GENERATOR
 * 
 * Arrays for generating idle animations and random expressions
 */
export const randomExpressions = {
  /** Subtle idle expressions for background animation */
  idle: [
    'default', 'thinking', 'curious', 'contemplating', 'relaxed',
    'lookLeft', 'lookRight', 'lookUp', 'bored', 'dreamy'
  ],
  
  /** Positive expressions */
  positive: [
    'smile', 'joy', 'laughing', 'giggling', 'content', 'proud',
    'playful', 'welcoming', 'flirtatious', 'cheeky'
  ],
  
  /** Negative expressions */
  negative: [
    'sad', 'angry', 'frustrated', 'disgusted', 'annoyed',
    'worried', 'ashamed', 'uncomfortable', 'pain'
  ],
  
  /** Neutral expressions */
  neutral: [
    'default', 'thinking', 'curious', 'focused', 'alert',
    'contemplating', 'neutral', 'cool'
  ]
};

/**
 * 🔧 UTILITY FUNCTIONS
 */

/** Check if expression name exists */
export const isValidExpression = (expressionName: string): boolean => {
  return expressionName in facialExpressions;
};

/** Get all expression names */
export const getAllExpressionNames = (): string[] => {
  return Object.keys(facialExpressions);
};

/** Get expressions by category */
export const getExpressionsByCategory = (category: keyof typeof expressionCategories): string[] => {
  return expressionCategories[category] || [];
};

/** Create expression with custom intensity */
export const createExpressionWithIntensity = (
  expressionName: string, 
  intensity: number = 1.0
): any => {
  const baseExpression = facialExpressions[expressionName];
  if (!baseExpression) return {};
  
  const modifiedExpression: any = {};
  Object.entries(baseExpression).forEach(([key, value]) => {
    modifiedExpression[key] = Math.max(0, Math.min(1, value * intensity));
  });
  
  return modifiedExpression;
};

/** Blend two expressions together */
export const blendExpressions = (
  expression1: string, 
  expression2: string, 
  blendFactor: number = 0.5
): any => {
  const expr1 = facialExpressions[expression1] || {};
  const expr2 = facialExpressions[expression2] || {};
  
  const blended: any = {};
  const allKeys = new Set([...Object.keys(expr1), ...Object.keys(expr2)]);
  
  allKeys.forEach(key => {
    const value1 = expr1[key] || 0;
    const value2 = expr2[key] || 0;
    blended[key] = value1 * (1 - blendFactor) + value2 * blendFactor;
  });
  
  return blended;
};

/** Get random expression from category */
export const getRandomExpressionFromCategory = (category: keyof typeof expressionCategories): string => {
  const expressions = expressionCategories[category];
  if (!expressions || expressions.length === 0) return 'default';
  return expressions[Math.floor(Math.random() * expressions.length)];
};

/** Get random expression from mood */
export const getRandomExpressionFromMood = (mood: keyof typeof randomExpressions): string => {
  const expressions = randomExpressions[mood];
  if (!expressions || expressions.length === 0) return 'default';
  return expressions[Math.floor(Math.random() * expressions.length)];
};

/**
 * 🎭 EXPRESSION COMBINATIONS
 * 
 * Pre-defined blends for complex emotions
 */
export const expressionCombinations = {
  /** Happy but trying to hide it */
  shySmile: () => blendExpressions('smile', 'embarrassed', 0.6),
  
  /** Sad but trying to smile */
  bittersweet: () => blendExpressions('smile', 'sad', 0.3),
  
  /** Laughing nervously */
  nervousLaughter: () => blendExpressions('giggling', 'worried', 0.3),
  
  /** Angry but controlled */
  restrainedAnger: () => createExpressionWithIntensity('angry', 0.6),
  
  /** Surprised and happy */
  delightedSurprise: () => blendExpressions('surprised', 'joy', 0.4),
  
  /** Confused but amused */
  bewilderedAmusement: () => blendExpressions('confused', 'smile', 0.5),
  
  /** Tired but content */
  peacefulTiredness: () => blendExpressions('tired', 'content', 0.7),
  
  /** Mischievous smile */
  wickedGrin: () => blendExpressions('mischievous', 'grin', 0.6),
  
  /** Polite but not genuine smile */
  politeness: () => createExpressionWithIntensity('smile', 0.5),
  
  /** Relieved sigh */
  relief: () => blendExpressions('sigh', 'content', 0.8),
  
  /** Sympathetic sadness */
  empathy: () => blendExpressions('concerned', 'sad', 0.4),
  
  nostalgia: () => blendExpressions('melancholy', 'smile', 0.3),
  
  /** Grudging respect */
  reluctantAdmiration: () => blendExpressions('skeptical', 'impressed', 0.7),
  
  /** Playful annoyance */
  teasingIrritation: () => blendExpressions('annoyed', 'playful', 0.6),
  
  /** Confident smirk */
  smugSatisfaction: () => blendExpressions('smirk', 'proud', 0.5),
};

/**
 * 🔄 EXPRESSION TRANSITIONS
 * 
 * Smooth animation sequences between expressions
 */
export const expressionTransitions = {
  /** From neutral to emotions */
  fromNeutral: {
    toSmile: ['default', 'smile'],
    toSad: ['default', 'concerned', 'sad'],
    toAngry: ['default', 'annoyed', 'frustrated', 'angry'],
    toSurprised: ['default', 'alert', 'surprised'],
    toFear: ['default', 'concerned', 'worried', 'fear'],
    toJoy: ['default', 'smile', 'content', 'joy'],
  },
  
  /** Emotional escalations */
  escalation: {
    happinessScale: ['content', 'smile', 'joy', 'laughing', 'euphoric'],
    sadnessScale: ['melancholy', 'sad', 'crying', 'sobbing'],
    angerScale: ['annoyed', 'frustrated', 'angry', 'terrified'],
    surpriseScale: ['curious', 'alert', 'surprised', 'shocked'],
    fearScale: ['concerned', 'worried', 'fear', 'terrified'],
  },
  
  /** Micro-expression sequences */
  microSequences: {
    quickWink: ['default', 'wink', 'default'],
    doubleEyeRoll: ['default', 'eyeRoll', 'default', 'eyeRoll', 'default'],
    thoughtProcess: ['default', 'thinking', 'puzzled', 'enlightened', 'smile'],
    realization: ['confused', 'thinking', 'curious', 'enlightened', 'joy'],
  },
  
  /** Social interaction sequences */
  socialSequences: {
    greeting: ['default', 'smile', 'welcoming', 'content'],
    goodbye: ['content', 'smile', 'sad', 'default'],
    flirtation: ['shy', 'smile', 'flirtatious', 'wink'],
    embarrassment: ['surprised', 'embarrassed', 'shy', 'lookDown'],
  },
  
  /** Return to neutral */
  toNeutral: {
    fromAny: (fromExpression: string) => [fromExpression, 'relaxed', 'default'],
    fadeOut: (fromExpression: string) => [fromExpression, 'default'],
    gradual: (fromExpression: string) => [fromExpression, 'neutral', 'relaxed', 'default'],
  }
};

/**
 * 🎪 EXPRESSION COMPATIBILITY MATRIX
 * 
 * Defines which expressions work well together for blending
 */
export const expressionCompatibility = {
  smile: {
    compatible: ['wink', 'curious', 'content', 'proud', 'welcoming'],
    incompatible: ['sad', 'angry', 'crying', 'terrified', 'disgusted'],
    neutral: ['thinking', 'lookLeft', 'lookRight', 'alert']
  },
  sad: {
    compatible: ['crying', 'worried', 'melancholy', 'ashamed', 'tired'],
    incompatible: ['smile', 'laughing', 'joy', 'playful', 'euphoric'],
    neutral: ['lookDown', 'thinking', 'contemplating']
  },
  angry: {
    compatible: ['frustrated', 'determined', 'annoyed', 'disgusted'],
    incompatible: ['smile', 'laughing', 'joy', 'peaceful', 'content'],
    neutral: ['focused', 'lookDown', 'skeptical']
  },
  surprised: {
    compatible: ['curious', 'alert', 'shocked', 'confused'],
    incompatible: ['sleepy', 'bored', 'tired', 'peaceful'],
    neutral: ['thinking', 'stare', 'lookUp']
  },
  thinking: {
    compatible: ['curious', 'puzzled', 'contemplating', 'focused'],
    incompatible: ['laughing', 'terrified', 'euphoric'],
    neutral: ['lookUp', 'neutral', 'alert']
  }
};

/**
 * 🎨 EXPRESSION MOOD MAPPING
 * 
 * Map abstract moods to specific expressions
 */
export const moodToExpressions = {
  /** Positive moods */
  happy: ['smile', 'joy', 'content', 'laughing', 'giggling'],
  excited: ['joy', 'surprised', 'euphoric', 'alert', 'playful'],
  calm: ['peaceful', 'content', 'relaxed', 'contemplating'],
  confident: ['proud', 'cool', 'determined', 'smirk'],
  playful: ['playful', 'mischievous', 'cheeky', 'goofy', 'tongueOut'],
  
  /** Negative moods */
  sad: ['sad', 'melancholy', 'crying', 'ashamed'],
  angry: ['angry', 'frustrated', 'annoyed', 'disgusted'],
  worried: ['worried', 'concerned', 'anxious', 'fear'],
  tired: ['tired', 'sleepy', 'bored', 'sigh'],
  uncomfortable: ['uncomfortable', 'nauseous', 'pain', 'sick'],
  
  /** Neutral moods */
  neutral: ['default', 'neutral', 'thinking', 'alert'],
  curious: ['curious', 'thinking', 'puzzled', 'interested'],
  focused: ['focused', 'concentrating', 'determined']
};

/**
 * 🎯 EXPRESSION INTENSITY RECOMMENDATIONS
 * 
 * Suggested intensity levels for different use cases
 */
export const intensityRecommendations = {
  /** UI/Interface animations */
  ui: {
    hover: 0.3,
    click: 0.5,
    error: 0.7,
    success: 0.6,
    loading: 0.4
  },
  
  /** Character dialogue */
  dialogue: {
    narrator: 0.6,
    protagonist: 0.8,
    antagonist: 0.9,
    comic_relief: 1.2,
    background_character: 0.5
  },
  
  /** Game states */
  gaming: {
    idle: 0.3,
    interaction: 0.7,
    combat: 1.0,
    cutscene: 0.9,
    menu: 0.4
  },
  
  /** Video call scenarios */
  videocall: {
    professional: 0.6,
    casual: 0.8,
    presentation: 0.7,
    personal: 1.0
  }
};

/**
 * 🔄 PROCEDURAL EXPRESSION GENERATION
 * 
 * Functions for generating dynamic expressions
 */
export const proceduralExpressions = {
  /** Generate random idle expression */
  generateIdle: (): string => {
    return getRandomExpressionFromMood('idle');
  },
  
  /** Generate expression based on sentiment score (-1 to 1) */
  generateFromSentiment: (sentiment: number): string => {
    if (sentiment > 0.7) return getRandomExpressionFromMood('positive');
    if (sentiment < -0.7) return getRandomExpressionFromMood('negative');
    return getRandomExpressionFromMood('neutral');
  },
  
  /** Generate contextual expression */
  generateContextual: (
    mood: keyof typeof moodToExpressions,
    intensity: number = 1.0,
    social_context: keyof typeof contextualIntensities.social = 'casual'
  ): any => {
    const expressions = moodToExpressions[mood];
    if (!expressions || expressions.length === 0) return facialExpressions.default;
    
    const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
    const contextIntensity = contextualIntensities.social[social_context];
    const finalIntensity = intensity * contextIntensity;
    
    return createExpressionWithIntensity(randomExpression, finalIntensity);
  },
  
  /** Generate expression sequence for animation */
  generateSequence: (
    startExpression: string,
    endExpression: string,
    steps: number = 3
  ): string[] => {
    if (steps <= 2) return [startExpression, endExpression];
    
    const sequence = [startExpression];
    
    for (let i = 1; i < steps - 1; i++) {
      const blendedName = `${startExpression}_to_${endExpression}_${i}`;
      sequence.push(blendedName); // Would need to generate this dynamically
    }
    
    sequence.push(endExpression);
    return sequence;
  }
};

/**
 * 📊 EXPRESSION ANALYTICS
 * 
 * Helper functions for analyzing and organizing expressions
 */
export const expressionAnalytics = {
  /** Get most complex expressions (most morph targets) */
  getMostComplex: (limit: number = 5): string[] => {
    return Object.entries(facialExpressions)
      .sort(([,a], [,b]) => Object.keys(b).length - Object.keys(a).length)
      .slice(0, limit)
      .map(([name]) => name);
  },
  
  /** Get expressions using specific morph target */
  getExpressionsUsing: (morphTarget: string): string[] => {
    return Object.entries(facialExpressions)
      .filter(([, expression]) => morphTarget in expression)
      .map(([name]) => name);
  },
  
  /** Get expression statistics */
  getStats: () => ({
    total: Object.keys(facialExpressions).length,
    categories: Object.keys(expressionCategories).length,
    morphTargetsUsed: new Set(
      Object.values(facialExpressions)
        .flatMap(expr => Object.keys(expr))
    ).size,
    averageComplexity: Object.values(facialExpressions)
      .reduce((sum, expr) => sum + Object.keys(expr).length, 0) / 
      Object.keys(facialExpressions).length
  }),
  
  /** Find similar expressions */
  findSimilar: (expressionName: string, threshold: number = 0.7): string[] => {
    const baseExpression = facialExpressions[expressionName];
    if (!baseExpression) return [];
    
    const baseKeys = new Set(Object.keys(baseExpression));
    
    return Object.entries(facialExpressions)
      .filter(([name, expression]) => {
        if (name === expressionName) return false;
        
        const exprKeys = new Set(Object.keys(expression));
        const intersection = new Set([...baseKeys].filter(x => exprKeys.has(x)));
        const union = new Set([...baseKeys, ...exprKeys]);
        
        return intersection.size / union.size >= threshold;
      })
      .map(([name]) => name);
  }
};

/**
 * 🚀 QUICK ACCESS HELPERS
 * 
 * Commonly used expression sets for rapid development
 */
export const quickAccess = {
  /** Essential expressions for basic avatar */
  minimal: ['default', 'smile', 'sad', 'surprised', 'wink'],
  
  /** Core emotional set */
  emotional: ['joy', 'sad', 'angry', 'fear', 'surprised', 'disgusted'],
  
  /** Social interaction set */
  social: ['smile', 'wink', 'embarrassed', 'proud', 'welcoming', 'flirtatious'],
  
  /** Thinking and cognitive set */
  cognitive: ['thinking', 'curious', 'puzzled', 'focused', 'enlightened'],
  
  /** Fun and playful set */
  playful: ['playful', 'mischievous', 'cheeky', 'goofy', 'tongueOut', 'crazy'],
  
  /** Professional/formal set */
  professional: ['default', 'smile', 'focused', 'alert', 'content', 'confident'],
  
  /** Gaming/entertainment set */
  gaming: ['determined', 'frustrated', 'euphoric', 'shocked', 'cool', 'defiant']
};

/**
 * 🎛️ EXPORT SHORTCUTS
 * 
 * Pre-configured combinations for common use cases
 */
export const presets = {
  /** Chatbot personality presets */
  chatbot: {
    friendly: { expressions: quickAccess.social, intensity: 0.7 },
    professional: { expressions: quickAccess.professional, intensity: 0.6 },
    playful: { expressions: quickAccess.playful, intensity: 0.9 },
    minimal: { expressions: quickAccess.minimal, intensity: 0.8 }
  },
  
  /** Game character presets */
  gameCharacter: {
    protagonist: { expressions: quickAccess.emotional, intensity: 0.9 },
    npc: { expressions: quickAccess.minimal, intensity: 0.6 },
    villain: { expressions: ['angry', 'smirk', 'contempt', 'defiant'], intensity: 1.0 },
    comic: { expressions: quickAccess.playful, intensity: 1.2 }
  },
  
  /** Video call avatar presets */
  videoCall: {
    casual: { expressions: quickAccess.social, intensity: 0.8 },
    business: { expressions: quickAccess.professional, intensity: 0.6 },
    presentation: { expressions: quickAccess.cognitive, intensity: 0.7 }
  }
};

// Final export statement to ensure everything is properly exported
export default {
  facialExpressions,
  expressionCategories,
  emotionIntensities,
  expressionTimings,
  contextualIntensities,
  randomExpressions,
  expressionCombinations,
  expressionTransitions,
  expressionCompatibility,
  moodToExpressions,
  intensityRecommendations,
  proceduralExpressions,
  expressionAnalytics,
  quickAccess,
  presets,
  // Utility functions
  isValidExpression,
  getAllExpressionNames,
  getExpressionsByCategory,
  createExpressionWithIntensity,
  blendExpressions,
  getRandomExpressionFromCategory,
  getRandomExpressionFromMood
};
