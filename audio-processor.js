/**
 * audio-processor.js
 * وحدة معالجة وتصفية الصوت وإزالة الضوضاء المتقدمة باستخدام Web Audio API
 */

export class AudioProcessor {
  constructor() {
    this.audioCtx = null;
    this.micStream = null;
    this.sourceNode = null;
    this.analyserNode = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.recordedBlob = null;
    this.cleanedBlob = null;
    
    // فلاتر التصفية الحية
    this.highpassFilter = null;
    this.notchFilter = null;
    this.voiceBoostFilter = null;
    this.compressorNode = null;
    this.streamDestination = null;

    this.isRecording = false;
    this.isPaused = false;
  }

  /**
   * تهيئة بيئة Web Audio
   */
  async ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: 16000 });
    }
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * بدء تسجيل الميكروفون المباشر مع تطبيق الفلاتر
   */
  async startLiveRecording({ enableHallFilter = true, enableVoiceBoost = true, onDataAvailable, onStop }) {
    await this.ensureAudioContext();

    // طلب إذن الميكروفون مع تفعيل ميزات المتصفح للأمان الصوتي
    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
        sampleRate: 16000
      }
    });

    this.sourceNode = this.audioCtx.createMediaStreamSource(this.micStream);

    // 1. فلتر High-Pass (110Hz) لإلغاء صوت اهتزاز البنجات وصوت التكييف
    this.highpassFilter = this.audioCtx.createBiquadFilter();
    this.highpassFilter.type = 'highpass';
    this.highpassFilter.frequency.value = enableHallFilter ? 120 : 80;
    this.highpassFilter.Q.value = 0.7;

    // 2. فلتر Notch (50Hz) لإلغاء همهمة الكهرباء وشواحن اللابتوب
    this.notchFilter = this.audioCtx.createBiquadFilter();
    this.notchFilter.type = 'notch';
    this.notchFilter.frequency.value = 50;
    this.notchFilter.Q.value = 5.0;

    // 3. فلتر Peaking لتعزيز صوت المحاضر (2.4kHz)
    this.voiceBoostFilter = this.audioCtx.createBiquadFilter();
    this.voiceBoostFilter.type = 'peaking';
    this.voiceBoostFilter.frequency.value = 2400;
    this.voiceBoostFilter.Q.value = 1.2;
    this.voiceBoostFilter.gain.value = enableVoiceBoost ? 4.5 : 0;

    // 4. ضاغط ديناميكي (DynamicsCompressor) لموازنة الصوت الهادئ والعالي
    this.compressorNode = this.audioCtx.createDynamicsCompressor();
    this.compressorNode.threshold.value = -24;
    this.compressorNode.knee.value = 10;
    this.compressorNode.ratio.value = 4;
    this.compressorNode.attack.value = 0.003;
    this.compressorNode.release.value = 0.25;

    // 5. محلل الترددات للرسم البياني
    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 256;

    // 6. مخرج التسجيل
    this.streamDestination = this.audioCtx.createMediaStreamDestination();

    // ربط خط المعالجة (Audio Processing Pipeline)
    this.sourceNode.connect(this.highpassFilter);
    this.highpassFilter.connect(this.notchFilter);
    this.notchFilter.connect(this.voiceBoostFilter);
    this.voiceBoostFilter.connect(this.compressorNode);
    this.compressorNode.connect(this.analyserNode);
    this.compressorNode.connect(this.streamDestination);

    // إعداد الـ MediaRecorder
    this.recordedChunks = [];
    const mimeType = this.getSupportedMimeType();
    this.mediaRecorder = new MediaRecorder(this.streamDestination.stream, {
      mimeType: mimeType || undefined,
      audioBitsPerSecond: 64000
    });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
        if (onDataAvailable) onDataAvailable(e.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.recordedBlob = new Blob(this.recordedChunks, { type: mimeType || 'audio/webm' });
      if (onStop) onStop(this.recordedBlob);
    };

    this.mediaRecorder.start(1000); // إرسال بيانات كل ثانية
    this.isRecording = true;
    this.isPaused = false;

    return this.analyserNode;
  }

  /**
   * إيقاف التسجيل
   */
  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
    }
    this.isRecording = false;
    this.isPaused = false;
  }

  /**
   * إيقاف مؤقت / استئناف التسجيل
   */
  togglePauseRecording() {
    if (!this.mediaRecorder) return false;
    if (this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.isPaused = true;
      return true; // الآن في حالة إيقاف مؤقت
    } else if (this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isPaused = false;
      return false; // استأنف التسجيل
    }
    return false;
  }

  /**
   * دعم أفضل صيغة تسجيل في المتصفح
   */
  getSupportedMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }

  /**
   * تصفية ملف صوتي مسجل مسبقاً عبر OfflineAudioContext
   * يطبق فلاتر الترددات وإزالة تشويش القاعة
   */
  async cleanAudioOffline(audioBlob, onProgress) {
    if (onProgress) onProgress(15, 'تحليل وفك تشفير ملف الصوت...');
    const ctx = await this.ensureAudioContext();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    if (onProgress) onProgress(40, 'تطبيق فلاتر عزل صدى القاعات وضوضاء التكييف...');
    const targetSampleRate = 16000;
    const offlineCtx = new OfflineAudioContext(1, Math.ceil(audioBuffer.duration * targetSampleRate), targetSampleRate);

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;

    // فلتر إلغاء الترددات الخفيضة (110Hz High-pass)
    const hp = offlineCtx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 110;
    hp.Q.value = 0.7;

    // فلتر نوتش لطنين الكهرباء (50Hz Notch)
    const notch = offlineCtx.createBiquadFilter();
    notch.type = 'notch';
    notch.frequency.value = 50;

    // فلتر تعزيز صوت المحاضر (2.2kHz Peaking)
    const voicePeak = offlineCtx.createBiquadFilter();
    voicePeak.type = 'peaking';
    voicePeak.frequency.value = 2200;
    voicePeak.gain.value = 4.0;

    // ضاغط لتقليل الفروقات الصوتية الصادمة
    const compressor = offlineCtx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.ratio.value = 3.5;

    source.connect(hp);
    hp.connect(notch);
    notch.connect(voicePeak);
    voicePeak.connect(compressor);
    compressor.connect(offlineCtx.destination);

    source.start();

    if (onProgress) onProgress(70, 'معالجة وتنقية الإشارة الصوتية...');
    const renderedBuffer = await offlineCtx.startRendering();

    if (onProgress) onProgress(90, 'تجهيز الصوت بصيغة WAV نقية ومضغوطة...');
    const wavBlob = this.audioBufferToWav(renderedBuffer);
    this.cleanedBlob = wavBlob;
    return wavBlob;
  }

  /**
   * تحويل AudioBuffer إلى ملف WAV 16-bit PCM أحادي القناة
   */
  audioBufferToWav(buffer) {
    const numChannels = 1;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const samples = buffer.getChannelData(0);
    const dataSize = samples.length * (bitDepth / 8);
    const bufferSize = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    // كتابة ترويسة ملف WAV القياسية
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // كتابة بيانات العينات
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7FFF;
      view.setInt16(offset, s, true);
      offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  /**
   * تحويل كائن Blob إلى سلسلة Base64 لنقلها عبر API
   */
  static async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * تنسيق الثواني إلى دقيقة وثانية
   */
  static formatDuration(totalSeconds) {
    const sec = Math.floor(totalSeconds % 60);
    const min = Math.floor((totalSeconds / 60) % 60);
    const hrs = Math.floor(totalSeconds / 3600);
    const pad = (n) => String(n).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(min)}:${pad(sec)}`;
    }
    return `${pad(min)}:${pad(sec)}`;
  }
}
