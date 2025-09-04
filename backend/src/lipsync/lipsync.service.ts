import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class LipsyncService {
  private readonly logger = new Logger(LipsyncService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateLipsync(audioFilePath: string, outputJsonPath?: string): Promise<any> {
    const fileName = path.basename(audioFilePath, path.extname(audioFilePath));
    const audiosDir = this.configService.get<string>('app.paths.audiosDir');
    const finalOutputPath = outputJsonPath || path.join(audiosDir, `${fileName}.json`);
    
    try {
      this.logger.debug(`Starting lipsync generation for: ${audioFilePath}`);
      
      // Check if input file exists
      await fs.access(audioFilePath);
      
      // Convert MP3 to WAV if needed
      const wavFilePath = await this.ensureWavFormat(audioFilePath);
      
      // Generate lipsync using Rhubarb
      await this.runRhubarb(wavFilePath, finalOutputPath);
      
      // Read and return the generated JSON
      const lipsyncData = await this.readLipsyncJson(finalOutputPath);
      
      this.logger.debug(`Lipsync generation completed: ${finalOutputPath}`);
      return lipsyncData;
      
    } catch (error) {
      this.logger.error(`Lipsync generation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async ensureWavFormat(audioFilePath: string): Promise<string> {
    const ext = path.extname(audioFilePath).toLowerCase();
    
    if (ext === '.wav') {
      return audioFilePath;
    }
    
    // Convert to WAV
    const baseName = path.basename(audioFilePath, ext);
    const wavFilePath = path.join(path.dirname(audioFilePath), `${baseName}.wav`);
    
    const ffmpegPath = this.configService.get<string>('app.paths.ffmpegPath');
    
    this.logger.debug(`Converting ${audioFilePath} to WAV format`);
    
    const ffmpegCommand = `"${ffmpegPath}" -y -i "${audioFilePath}" "${wavFilePath}"`;
    
    try {
      await execAsync(ffmpegCommand);
      this.logger.debug(`Conversion to WAV completed: ${wavFilePath}`);
      return wavFilePath;
    } catch (error) {
      this.logger.error(`FFmpeg conversion failed: ${error.message}`);
      throw new Error(`Failed to convert audio to WAV: ${error.message}`);
    }
  }

  private async runRhubarb(wavFilePath: string, outputJsonPath: string): Promise<void> {
    const rhubarbPath = this.configService.get<string>('app.paths.rhubarbPath');
    
    const rhubarbCommand = `"${rhubarbPath}" -f json -o "${outputJsonPath}" "${wavFilePath}" -r phonetic`;
    
    this.logger.debug(`Running Rhubarb command: ${rhubarbCommand}`);
    
    try {
      const { stdout, stderr } = await execAsync(rhubarbCommand);
      
      if (stderr && !stderr.includes('Info:')) {
        this.logger.warn(`Rhubarb stderr: ${stderr}`);
      }
      
      if (stdout) {
        this.logger.debug(`Rhubarb stdout: ${stdout}`);
      }
      
    } catch (error) {
      this.logger.error(`Rhubarb execution failed: ${error.message}`);
      throw new Error(`Failed to generate lipsync: ${error.message}`);
    }
  }

  private async readLipsyncJson(jsonFilePath: string): Promise<any> {
    try {
      const jsonContent = await fs.readFile(jsonFilePath, 'utf8');
      return JSON.parse(jsonContent);
    } catch (error) {
      this.logger.error(`Failed to read lipsync JSON: ${error.message}`);
      throw new Error(`Failed to read lipsync data: ${error.message}`);
    }
  }

  async audioFileToBase64(filePath: string): Promise<string> {
    try {
      const data = await fs.readFile(filePath);
      return data.toString('base64');
    } catch (error) {
      this.logger.error(`Failed to convert audio to base64: ${error.message}`);
      throw error;
    }
  }
}
