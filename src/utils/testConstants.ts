// Test URLs để debug avatar morph targets
export const TEST_AVATARS = [
  {
    id: 'simple_test',
    name: '🎭 Simple Avatar (Always Works)',
    url: 'simple_avatar'
  },
  {
    id: 'rpm_test_basic',
    name: '🧪 RPM Basic Test (No Morphs)',
    url: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb'
  },
  {
    id: 'rpm_test_morphs',
    name: '🔬 RPM With Morphs Test',
    url: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit&textureSizeLimit=1024'
  }
];

// Test morph target names
export const COMMON_MORPH_TARGETS = [
  // ARKit standard morphs
  'mouthOpen',
  'jawOpen',
  'mouthClose',
  'mouthSmile_L',
  'mouthSmile_R',
  
  // Oculus Visemes
  'viseme_aa',
  'viseme_E',
  'viseme_I',
  'viseme_O',
  'viseme_U',
  
  // Alternative names
  'Mouth_Open',
  'Jaw_Open',
  'mouth_open',
  'jaw_open'
];
