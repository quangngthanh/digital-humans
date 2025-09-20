import { VisemeMapping } from "@/types/avatar";

/**
 * 👄 COMPREHENSIVE RHUBARB LIP SYNC MAPPING
 * 
 * Maps Rhubarb's 9 mouth shapes (A-H, X) to Ready Player Me's Oculus visemes
 * Based on official documentation and phonetic analysis
 * 
 * References:
 * - Rhubarb: https://github.com/DanielSWolf/rhubarb-lip-sync
 * - Ready Player Me: https://docs.readyplayer.me/ready-player-me/api-reference/avatars/morph-targets/oculus-ovr-libsync
 */
export const corresponding: VisemeMapping = {
    /** 🅰️ Closed mouth for P, B, M sounds - bilabial closure with slight pressure */
    A: "viseme_PP",
    
    /** 🅱️ Clenched teeth for consonants K, S, T, etc. - mouth slightly open */
    B: "viseme_kk",
    
    /** 🅲 Open mouth for EH, AE vowels - medium opening for transitions */
    C: "viseme_I",
    
    /** 🅳 Wide open mouth for AA vowels - maximum jaw opening */
    D: "viseme_aa",
    
    /** 🅴 Rounded mouth for AO, ER vowels - slight rounding for back vowels */
    E: "viseme_O",
    
    /** 🅵 Puckered lips for UW, OW, W sounds - lips pushed forward */
    F: "viseme_U",
    
    /** 🅶 Teeth on lip for F, V sounds - labiodental contact (optional) */
    G: "viseme_FF",
    
    /** 🅷 Tongue raised for L sounds - dental/alveolar position (optional) */
    H: "viseme_TH",
    
    /** ❌ Silence/rest position - relaxed mouth during pauses (optional) */
    X: "viseme_sil",
  };
  
