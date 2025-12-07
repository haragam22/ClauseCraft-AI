import { ai, MODELS } from './client';
import { Modality } from "@google/genai";

/**
 * TTS Generator Module (Phase 5)
 * Converts text into spoken audio using Gemini.
 * Handles PCM -> WAV conversion for browser playback.
 */

export const ttsGenerator = {
  /**
   * Generates a Blob URL (WAV format) for the provided text and style.
   */
  generateAudioUrl: async (text: string, voiceStyle: string = 'studio'): Promise<string | null> => {
    // Map generic styles to specific Gemini voices
    const voiceMap: Record<string, string> = {
      'studio': 'Kore',
      'warm': 'Puck',
      'professional': 'Fenrir',
      'conversational': 'Zephyr'
    };
    const voiceName = voiceMap[voiceStyle] || 'Kore';

    try {
      const prompt = `
Read the following text aloud in a clear professional tone.

Text:
${text}
`;

      const response = await ai.models.generateContent({
        model: MODELS.TTS,
        contents: prompt,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (!base64Audio) {
        throw new Error("No audio data returned");
      }

      // Convert Base64 to Uint8Array (PCM Data)
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const pcmBytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        pcmBytes[i] = binaryString.charCodeAt(i);
      }
      
      // Gemini returns raw PCM (24kHz, 1 channel, 16-bit signed usually).
      // Browsers need a WAV header to play this in an <audio> tag.
      const wavBytes = createWavFile(pcmBytes, 24000);
      const blob = new Blob([wavBytes], { type: 'audio/wav' });
      return URL.createObjectURL(blob);

    } catch (error) {
      console.error("TTS Generation failed:", error);
      return null;
    }
  },

  // Legacy method kept for compatibility if needed, though UI uses generateAudioUrl now
  generate: async (text: string): Promise<AudioBuffer | null> => {
    // ... (existing logic could remain, but we focus on Phase 5 requirement)
    return null; 
  },
  
  play: (buffer: AudioBuffer): void => {
     // ...
  }
};

/**
 * Helper: Adds a standard RIFF/WAV header to raw PCM data.
 * @param pcmData Raw PCM bytes
 * @param sampleRate e.g. 24000
 * @returns Uint8Array containing the full WAV file
 */
function createWavFile(pcmData: Uint8Array, sampleRate: number): Uint8Array {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // ChunkSize
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true); // Subchunk2Size

  // Write PCM data
  const headerBytes = new Uint8Array(buffer, 0, headerSize);
  const result = new Uint8Array(totalSize);
  result.set(headerBytes, 0);
  result.set(pcmData, headerSize);

  return result;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}