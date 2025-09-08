/**
 * Animation Metadata Extraction Script
 * Extracts duration and basic info from FBX animation files
 * Run with: node scripts/extract-animation-metadata.js
 */

import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AnimationMetadataExtractor {
  constructor() {
    this.loader = new FBXLoader();
    this.animationsPath = path.join(__dirname, '../public/animations');
    this.outputPath = path.join(__dirname, '../src/constants/animation-metadata.json');
    this.results = {};
  }

  async extractMetadata() {
    console.log('🎬 Starting Animation Metadata Extraction...');
    console.log(`📁 Scanning: ${this.animationsPath}`);

    try {
      const files = fs.readdirSync(this.animationsPath)
        .filter(file => file.endsWith('.fbx'))
        .sort();

      console.log(`📋 Found ${files.length} animation files`);

      for (const file of files) {
        await this.processAnimation(file);
      }

      await this.saveResults();
      this.generateReport();

    } catch (error) {
      console.error('❌ Error during extraction:', error);
      throw error;
    }
  }

  async processAnimation(filename) {
    const animationName = filename.replace('.fbx', '');
    const filePath = path.join(this.animationsPath, filename);

    console.log(`\n🔍 Processing: ${animationName}`);

    try {
      // Load FBX file
      const fbx = await new Promise((resolve, reject) => {
        this.loader.load(
          filePath,
          (object) => resolve(object),
          (progress) => {
            // Progress callback - silent for cleaner output
          },
          (error) => reject(error)
        );
      });

      // Extract animation data
      const animations = fbx.animations || [];
      
      if (animations.length === 0) {
        console.log(`⚠️  No animations found in ${filename}`);
        this.results[animationName] = {
          file: filename,
          duration: 0,
          hasAnimation: false,
          tracks: 0,
          error: 'No animation tracks found'
        };
        return;
      }

      // Get first animation (usually the main one)
      const mainAnimation = animations[0];
      const duration = mainAnimation.duration;
      const tracks = mainAnimation.tracks.length;

      // Classify animation type based on name and duration
      const classification = this.classifyAnimation(animationName, duration);

      this.results[animationName] = {
        file: filename,
        duration: duration,
        hasAnimation: true,
        tracks: tracks,
        classification: classification,
        extractedAt: new Date().toISOString()
      };

      console.log(`✅ ${animationName}: ${duration.toFixed(2)}s, ${tracks} tracks, ${classification.category}`);

    } catch (error) {
      console.error(`❌ Failed to process ${filename}:`, error.message);
      this.results[animationName] = {
        file: filename,
        duration: 0,
        hasAnimation: false,
        tracks: 0,
        error: error.message
      };
    }
  }

  classifyAnimation(name, duration) {
    const nameLower = name.toLowerCase();
    
    // Category classification
    let category = 'other';
    let usage = 'general';
    let intensity = 'medium';
    let emotionCompatibility = [];

    // Conversation animations
    if (nameLower.includes('talking') || nameLower.includes('sitting talking') || nameLower.includes('telling a secret')) {
      category = 'conversation';
      usage = 'speaking';
      emotionCompatibility = ['happy', 'casual', 'serious', 'thoughtful'];
    }
    
    // Emotional animations
    else if (nameLower.includes('laughing')) {
      category = 'emotional';
      usage = 'reaction';
      intensity = 'high';
      emotionCompatibility = ['happy', 'excited', 'playful'];
    }
    else if (nameLower.includes('crying')) {
      category = 'emotional';
      usage = 'reaction';
      intensity = 'high';
      emotionCompatibility = ['sad', 'frustrated'];
    }
    else if (nameLower.includes('terrified')) {
      category = 'emotional';
      usage = 'reaction';
      intensity = 'high';
      emotionCompatibility = ['surprised', 'confused'];
    }
    else if (nameLower.includes('thankful')) {
      category = 'emotional';
      usage = 'reaction';
      intensity = 'medium';
      emotionCompatibility = ['caring', 'happy'];
    }
    
    // Social animations
    else if (nameLower.includes('dancing')) {
      category = 'social';
      usage = 'expressive';
      intensity = 'high';
      if (nameLower.includes('rumba')) {
        emotionCompatibility = ['romantic', 'playful'];
      } else if (nameLower.includes('hip hop')) {
        emotionCompatibility = ['excited', 'confident'];
      } else if (nameLower.includes('chicken')) {
        emotionCompatibility = ['playful', 'mischievous'];
      }
    }
    
    // Idle/Cognitive animations
    else if (nameLower.includes('idle') || nameLower.includes('standing')) {
      category = 'idle';
      usage = 'idle';
      intensity = 'low';
      emotionCompatibility = ['default', 'thoughtful'];
    }
    else if (nameLower.includes('looking')) {
      category = 'cognitive';
      usage = 'idle';
      intensity = 'low';
      emotionCompatibility = ['curious', 'confused'];
    }
    else if (nameLower.includes('thinking')) {
      category = 'cognitive';
      usage = 'idle';
      intensity = 'medium';
      emotionCompatibility = ['thoughtful', 'serious'];
    }
    
    // Movement animations
    else if (nameLower.includes('walk')) {
      category = 'movement';
      usage = 'locomotion';
      intensity = 'medium';
      emotionCompatibility = ['default'];
    }

    // Duration-based classification
    let durationClass = 'medium';
    if (duration < 2) durationClass = 'short';
    else if (duration > 6) durationClass = 'long';

    // Suitability for sequences
    let sequenceCompatible = true;
    if (category === 'movement' || intensity === 'high') {
      sequenceCompatible = false; // These are usually standalone
    }

    return {
      category,
      usage,
      intensity,
      durationClass,
      emotionCompatibility,
      sequenceCompatible,
      loopable: category === 'idle' || nameLower.includes('idle')
    };
  }

  async saveResults() {
    const metadata = {
      extractedAt: new Date().toISOString(),
      totalAnimations: Object.keys(this.results).length,
      successfulExtractions: Object.values(this.results).filter(r => r.hasAnimation).length,
      averageDuration: this.calculateAverageDuration(),
      animations: this.results
    };

    try {
      fs.writeFileSync(this.outputPath, JSON.stringify(metadata, null, 2));
      console.log(`\n💾 Metadata saved to: ${this.outputPath}`);
    } catch (error) {
      console.error('❌ Failed to save metadata:', error);
      throw error;
    }
  }

  calculateAverageDuration() {
    const validDurations = Object.values(this.results)
      .filter(r => r.hasAnimation && r.duration > 0)
      .map(r => r.duration);
    
    if (validDurations.length === 0) return 0;
    
    return validDurations.reduce((sum, duration) => sum + duration, 0) / validDurations.length;
  }

  generateReport() {
    console.log('\n📊 EXTRACTION REPORT');
    console.log('='.repeat(50));
    
    const successful = Object.values(this.results).filter(r => r.hasAnimation);
    const failed = Object.values(this.results).filter(r => !r.hasAnimation);
    
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`📈 Average Duration: ${this.calculateAverageDuration().toFixed(2)}s`);
    
    // Category breakdown
    const categories = {};
    successful.forEach(anim => {
      const cat = anim.classification.category;
      categories[cat] = (categories[cat] || 0) + 1;
    });
    
    console.log('\n📂 By Category:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });
    
    // Duration breakdown
    const durations = {
      short: successful.filter(a => a.classification.durationClass === 'short').length,
      medium: successful.filter(a => a.classification.durationClass === 'medium').length,
      long: successful.filter(a => a.classification.durationClass === 'long').length
    };
    
    console.log('\n⏱️  By Duration:');
    Object.entries(durations).forEach(([dur, count]) => {
      console.log(`   ${dur}: ${count}`);
    });

    if (failed.length > 0) {
      console.log('\n❌ Failed Files:');
      failed.forEach(f => {
        console.log(`   ${f.file}: ${f.error}`);
      });
    }
    
    console.log('\n🎉 Extraction Complete!');
  }
}

// Run extraction
async function main() {
  try {
    const extractor = new AnimationMetadataExtractor();
    await extractor.extractMetadata();
  } catch (error) {
    console.error('💥 Extraction failed:', error);
    process.exit(1);
  }
}

main();
