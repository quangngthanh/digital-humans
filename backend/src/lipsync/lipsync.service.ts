import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

@Injectable()
export class LipsyncService {
  private readonly logger = new Logger(LipsyncService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateLipsync(audioFilePath: string, transcriptText?: string, outputJsonPath?: string ): Promise<any> {
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
      await this.runRhubarb(wavFilePath, finalOutputPath, transcriptText);
      
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

  private async runRhubarb(wavFilePath: string, outputJsonPath: string, transcriptText?: string): Promise<void> {
    const rhubarbPath = this.configService.get<string>('app.paths.rhubarbPath');
    
    // Sử dụng thư mục temp của hệ thống thay vì /tmp
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `transcript_${Date.now()}.txt`);

    // Đảm bảo thư mục temp tồn tại
    await fs.mkdir(tempDir, { recursive: true });

    // Ghi text vào file tạm
    await fs.writeFile(tempFile, transcriptText || '');
    // Tốt nhất cho tiếng Việt
    const rhubarbCommand = transcriptText 
    ? `"${rhubarbPath}" -f json -o "${outputJsonPath}" "${wavFilePath}" -d "${tempFile}"`
    : `"${rhubarbPath}" -f json -o "${outputJsonPath}" "${wavFilePath}"`;
    
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
    } finally {
      // Xóa file tạm một cách an toàn
      try {
        await fs.unlink(tempFile);
      } catch (error) {
        this.logger.warn(`Failed to delete temp file ${tempFile}: ${error.message}`);
      }
    }
  }

  private async readLipsyncJson(jsonFilePath: string): Promise<any> {
    try {
      const jsonContent = await fs.readFile(jsonFilePath, 'utf8');
      const lipsyncData = JSON.parse(jsonContent);
      return this.processLipsyncData(lipsyncData);
    } catch (error) {
      this.logger.error(`Failed to read lipsync JSON: ${error.message}`);
      throw new Error(`Failed to read lipsync data: ${error.message}`);
    }
  }

  // TODO: Check and update data visemes in the future
  private processLipsyncData(lipsyncData: any): any {
    delete lipsyncData.metadata.soundFile;
    return lipsyncData;
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
