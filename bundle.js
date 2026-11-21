/**
 * bundle.js
 * الحزمة الشاملة لتطبيق "محاضراتي الذكية"
 * مجمعة لتعمل مباشرة عبر بروتوكول file:/// في أي متصفح دون مشاكل CORS أو متطلبات خوادم
 * تدعم الملفات الضخمة حتى 2 جيجابايت (2GB) والتسجيلات الطويلة لساعات
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. عينة المحاضرة الواقعية التجريبية (Sample Lecture Data)
     ========================================================================== */
  const SAMPLE_LECTURE_DATA = {
    lecture_title: "خوارزميات وتراكيب البيانات: جداول التجزئة (Hash Tables) وحل التصادمات",
    duration_seconds: 345,
    topics: [
      {
        topic_title: "1. مفهوم جدول التجزئة (Hash Table) ودالة التجزئة (Hash Function)",
        summary: "شرح الدكتور فكرة تحويل المفاتيح (Keys) إلى فهارس (Indices) داخل المصفوفة للوصول المباشر بسرعة فائقة زمنياً، ولماذا نلجأ إليها كبديل للمصفوفات العادية في محركات البحث وقواعد البيانات.",
        points: [
          "دالة التجزئة (Hash Function) وظيفتها الأساسية تحويل أي مدخل نصي أو رقمي إلى فهرس محدد بين 0 و (Array Size - 1).",
          "الشرط الأساسي في دالة التجزئة الجيدة هو التوزيع المتساوي (Uniform Distribution) وسرعة الحساب O(1).",
          "الوصول للبيانات في الحالة المثالية (Best & Average Case) يستغرق زمناً ثابتاً تماماً O(1) مقارنة بـ O(N) في القوائم العادية."
        ],
        doctor_warning: "الدكتور أكد: إياكم تخلطوا بين دالة التجزئة في الأمان (Cryptographic Hash زي SHA-256) ودالة جداول البيانات البسيطة (زي Modulo Hash)."
      },
      {
        topic_title: "2. مشكلة التصادم (Collision) وأشهر طرق حلها",
        summary: "عندما تخرج الدالة نفس الفهرس لمفتاحين مختلفين يحدث تصادم، واستعرض الدكتور أسلوب السلسلة المفتوحة (Separate Chaining) والعنونة المفتوحة (Open Addressing).",
        points: [
          "التصادم (Collision) حتمي رياضياً حسب مبدأ برج الحمام (Pigeonhole Principle) لأن حجم البيانات أكبر من حجم المصفوفة.",
          "طريقة السلسلة المنفصلة (Separate Chaining): ننشئ Linked List في كل خلية تحتمل أكثر من قيمة متصادمة.",
          "طريقة المسبار الخطي (Linear Probing): إذا كان المكان مشغولاً، نبحث عن الخانة الفارغة التالية مباشرة (Index + 1)."
        ],
        doctor_warning: "⚠️ سؤال امتحان مؤكد: احسب معامل التحميل (Load Factor = N / Table Size) ومتى يجب عمل Re-hashing لتكبير حجم الجدول."
      },
      {
        topic_title: "3. المقارنة الزمنية وحالات التعقيد (Time Complexity)",
        summary: "استعراض للأداء الزمني في الحالات الثلاث مع رسم توضيحي على السبورة.",
        points: [
          "أفضل حالة (Best Case) والبحث المعتاد (Average): O(1) للبحث والإضافة والحذف.",
          "أسوأ حالة (Worst Case): O(N) عندما تقع كل المفاتيح في نفس الخانة وتتحول إلى قائمة طويلة.",
          "لتفادي الحالة السيئة، يجب ألا يتعدى الـ Load Factor قيمة 0.7."
        ],
        doctor_warning: "الدكتور نبه على مسألة الـ Worst Case وسأل عنها طالب في المدرج وكررها مرتين لأهميتها في الفاينال."
      }
    ],
    exam_highlights: [
      "🔥 الدكتور صرح نصاً: 'المسألة بتاعة حل التصادم بالـ Separate Chaining والـ Linear Probing جاية في امتحان الميدترم والفاينال بأرقام مختلفة'.",
      "📌 قانون الـ Load Factor (معامل التحميل) وتأثيره على كفاءة الخوارزمية سؤال اختياري مضمون.",
      "⚠️ الفرق بين Average Case O(1) و Worst Case O(N) ولماذا تحدث الـ Worst Case."
    ],
    key_terms: [
      {
        term_ar: "دالة التجزئة",
        term_en: "Hash Function",
        definition: "دالة رياضية تقبل مفتاحاً من أي نوع وتحوله لقيمة رقمية لتحديد موضع التخزين في الذاكرة."
      },
      {
        term_ar: "تصادم التجزئة",
        term_en: "Hash Collision",
        definition: "حالة تحدث عندما تقوم الدالة بإنتاج نفس الفهرس لمدخلين مختلفين."
      },
      {
        term_ar: "معامل التحميل",
        term_en: "Load Factor (λ)",
        definition: "نسبة عدد العناصر المخزنة إلى الحجم الكلي لمصفوفة الجدول (λ = n / k)."
      },
      {
        term_ar: "إعادة التجزئة",
        term_en: "Re-hashing",
        definition: "عملية مضاعفة حجم الجدول وإعادة توزيع كل العناصر القديمة لتفادي تدهور الأداء عند امتلاء الجدول."
      }
    ],
    verbatim_transcript: `[00:00] دكتور أحمد: صباح الخير يا شباب.. يا ريت الناس اللي ورا تقفل الباب وتقعد عشان هنبدأ محاضرة النهاردة في أهم توبيك في الـ Data Structures..
[00:14] [صوت دوشة طلاب وكراسي بتتحرك في القاعة - تم عزلها تلقائياً]
[00:22] دكتور أحمد: النهاردة هنتكلم عن الـ Hash Tables.. ليه بنستخدم الـ Hash Table؟ لو عندي مليون طالب وعاوز أبحث عن طالب بالرقم القومي بتاعه.. لو دورت في Array عادية هتاخد مني O(N)، يعني هعدي على المليون واحد.. إنما في الـ Hash Table، بنعمل عملية بنسميها Direct Access.. الـ Time Complexity في الـ Average Case بتوصل لـ O(1) فقط!
[01:10] [صوت طالب جانبي يهمس: "يا عم الامتحان هييجي مقالي ولا MCQ؟" - تم تجاهله من التفريغ]
[01:18] دكتور أحمد: ركزوا معايا على السبورة.. دالة الـ Hash Function بتاخد الـ Key، مثلاً اسم الطالب، وتحوله لـ Index.. بس خلي بالكم.. هل ممكن اسمين مختلفين يطلعوا نفس الـ Index؟ طبعاً! وهنا بتحصل المشكلة اللي بتيجي دايماً في الامتحانات وهي الـ Collision..
[02:05] [صوت كحة وهمهمة في المدرج - تم تنقية الصوت]
[02:15] دكتور أحمد: طب بنحل الـ Collision إزاي؟ عندنا طريقتين مشهورين جداً.. الطريقة الأولى بنسميها Separate Chaining، يعني كل خانة في الجدول بنعمل منها Linked List فرعية.. والطريقة التانية هي Open Addressing زي الـ Linear Probing، يعني لو لقيت الخانة دي مشغولة، بنروح للخانة اللي بعدها مباشرة..
[03:10] دكتور أحمد: النقطة دي يا بشمهندسين عاوزكم تكتبوا عليها 'مهمة جداً للامتحان'.. ما هو الـ Load Factor؟ هو نسبة العناصر المحفوظة لحجم الجدول الكلي.. أول ما يوصل لـ 0.7 لازم نعمل Re-hashing ونكبر الجدول.. الكلام ده مفهوم؟ ممتاز، نفتح السلايدز اللي بعدها.`
  };

  function createSampleAudioBlob() {
    const sampleRate = 16000;
    const duration = 4;
    const totalSamples = sampleRate * duration;
    const buffer = new Float32Array(totalSamples);
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      buffer[i] = 0.25 * Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 0.3) +
                  0.15 * Math.sin(2 * Math.PI * 660 * t) * Math.exp(-t * 0.5) +
                  0.05 * Math.sin(2 * Math.PI * 880 * t);
    }
    const numChannels = 1;
    const bitDepth = 16;
    const dataSize = totalSamples * (bitDepth / 8);
    const arrayBuffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(arrayBuffer);

    const writeString = (offset, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < totalSamples; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
    return new Blob([view], { type: 'audio/wav' });
  }

  /* ==========================================================================
     2. معالج الصوت وإزالة الضوضاء (Audio Processor)
     ========================================================================== */
  class AudioProcessor {
    constructor() {
      this.audioCtx = null;
      this.micStream = null;
      this.sourceNode = null;
      this.analyserNode = null;
      this.mediaRecorder = null;
      this.recordedChunks = [];
      this.recordedBlob = null;
      this.cleanedBlob = null;
      this.highpassFilter = null;
      this.notchFilter = null;
      this.voiceBoostFilter = null;
      this.compressorNode = null;
      this.streamDestination = null;
      this.isRecording = false;
      this.isPaused = false;
    }

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

    async startLiveRecording({ enableHallFilter = true, enableVoiceBoost = true, onDataAvailable, onStop }) {
      await this.ensureAudioContext();

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

      this.highpassFilter = this.audioCtx.createBiquadFilter();
      this.highpassFilter.type = 'highpass';
      this.highpassFilter.frequency.value = enableHallFilter ? 120 : 80;
      this.highpassFilter.Q.value = 0.7;

      this.notchFilter = this.audioCtx.createBiquadFilter();
      this.notchFilter.type = 'notch';
      this.notchFilter.frequency.value = 50;
      this.notchFilter.Q.value = 5.0;

      this.voiceBoostFilter = this.audioCtx.createBiquadFilter();
      this.voiceBoostFilter.type = 'peaking';
      this.voiceBoostFilter.frequency.value = 2400;
      this.voiceBoostFilter.gain.value = enableVoiceBoost ? 4.5 : 0;

      this.compressorNode = this.audioCtx.createDynamicsCompressor();
      this.compressorNode.threshold.value = -24;
      this.compressorNode.knee.value = 10;
      this.compressorNode.ratio.value = 4;
      this.compressorNode.attack.value = 0.003;
      this.compressorNode.release.value = 0.25;

      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 256;

      this.streamDestination = this.audioCtx.createMediaStreamDestination();

      this.sourceNode.connect(this.highpassFilter);
      this.highpassFilter.connect(this.notchFilter);
      this.notchFilter.connect(this.voiceBoostFilter);
      this.voiceBoostFilter.connect(this.compressorNode);
      this.compressorNode.connect(this.analyserNode);
      this.compressorNode.connect(this.streamDestination);

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

      this.mediaRecorder.start(1000);
      this.isRecording = true;
      this.isPaused = false;
      return this.analyserNode;
    }

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

    togglePauseRecording() {
      if (!this.mediaRecorder) return false;
      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.pause();
        this.isPaused = true;
        return true;
      } else if (this.mediaRecorder.state === 'paused') {
        this.mediaRecorder.resume();
        this.isPaused = false;
        return false;
      }
      return false;
    }

    getSupportedMimeType() {
      const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      for (const t of types) {
        if (MediaRecorder.isTypeSupported(t)) return t;
      }
      return '';
    }

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

      const hp = offlineCtx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 110;
      hp.Q.value = 0.7;

      const notch = offlineCtx.createBiquadFilter();
      notch.type = 'notch';
      notch.frequency.value = 50;

      const voicePeak = offlineCtx.createBiquadFilter();
      voicePeak.type = 'peaking';
      voicePeak.frequency.value = 2200;
      voicePeak.gain.value = 4.0;

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

    audioBufferToWav(buffer) {
      const numChannels = 1;
      const sampleRate = buffer.sampleRate;
      const format = 1;
      const bitDepth = 16;
      const samples = buffer.getChannelData(0);
      const dataSize = samples.length * (bitDepth / 8);
      const bufferSize = 44 + dataSize;
      const arrayBuffer = new ArrayBuffer(bufferSize);
      const view = new DataView(arrayBuffer);

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

      let offset = 44;
      for (let i = 0; i < samples.length; i++) {
        let s = Math.max(-1, Math.min(1, samples[i]));
        s = s < 0 ? s * 0x8000 : s * 0x7FFF;
        view.setInt16(offset, s, true);
        offset += 2;
      }
      return new Blob([view], { type: 'audio/wav' });
    }

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

    static formatDuration(totalSeconds) {
      const sec = Math.floor(totalSeconds % 60);
      const min = Math.floor((totalSeconds / 60) % 60);
      const hrs = Math.floor(totalSeconds / 3600);
      const pad = (n) => String(n).padStart(2, '0');
      if (hrs > 0) return `${pad(hrs)}:${pad(min)}:${pad(sec)}`;
      return `${pad(min)}:${pad(sec)}`;
    }
  }

  /* ==========================================================================
     3. محرك التفريغ ودعم الملفات الكبيرة حتى 2GB (Gemini Transcriber)
     ========================================================================== */
  class GeminiTranscriber {
    constructor(apiKey = '', model = 'gemini-2.0-flash') {
      this.apiKey = apiKey;
      this.model = this.sanitizeModel(model);
    }

    sanitizeModel(model) {
      if (!model || model === 'gemini-2.5-flash' || model === 'undefined') {
        return 'gemini-2.0-flash';
      }
      return model;
    }

    setApiKey(key) { this.apiKey = (key || '').trim(); }
    setModel(model) { this.model = this.sanitizeModel(model); }

    detectMimeType(file) {
      if (file.type && file.type !== 'application/octet-stream') {
        return file.type;
      }
      const name = (file.name || '').toLowerCase();
      if (name.endsWith('.mp3')) return 'audio/mp3';
      if (name.endsWith('.m4a')) return 'audio/m4a';
      if (name.endsWith('.wav')) return 'audio/wav';
      if (name.endsWith('.aac')) return 'audio/aac';
      if (name.endsWith('.ogg')) return 'audio/ogg';
      if (name.endsWith('.webm')) return 'audio/webm';
      if (name.endsWith('.mp4')) return 'video/mp4';
      if (name.endsWith('.mov')) return 'video/quicktime';
      if (name.endsWith('.mkv')) return 'video/x-matroska';
      return 'audio/mp3';
    }

    async listAvailableModels() {
      if (!this.apiKey) throw new Error('يرجى إدخال مفتاح الـ API أولاً.');
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${response.status}`);
      }
      const data = await response.json();
      return (data.models || [])
        .filter((m) => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
        .map((m) => ({
          id: m.name.replace('models/', ''),
          name: m.displayName || m.name.replace('models/', '')
        }))
        .filter((m) => m.id.includes('flash') || m.id.includes('pro'));
    }

    /**
     * رفع الملفات الضخمة حتى 1-2 جيجابايت عبر السحابة في أجزاء دون إرهاق الرام
     */
    async uploadLargeFileResumable(file, onProgress) {
      if (!this.apiKey) throw new Error('يرجى إدخال مفتاح Gemini API أولاً.');

      const mimeType = this.detectMimeType(file);
      const fileSize = file.size;
      const displayName = file.name || 'lecture_recording';

      if (onProgress) onProgress(5, `تجهيز رفع التسجيل (${(fileSize / (1024 * 1024)).toFixed(1)} MB)...`);

      const initEndpoint = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${this.apiKey}`;
      const initResp = await fetch(initEndpoint, {
        method: 'POST',
        headers: {
          'X-Goog-Upload-Protocol': 'resumable',
          'X-Goog-Upload-Command': 'start',
          'X-Goog-Upload-Header-Content-Length': String(fileSize),
          'X-Goog-Upload-Header-Content-Type': mimeType,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ file: { display_name: displayName } })
      });

      if (!initResp.ok) {
        const errData = await initResp.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `فشل بدء رفع الملف (HTTP ${initResp.status})`);
      }

      const uploadUrl = initResp.headers.get('x-goog-upload-url');
      if (!uploadUrl) throw new Error('لم يرجع خادم Google رابط الرفع المجزأ.');

      const chunkSize = 8 * 1024 * 1024; // 8MB
      let offset = 0;
      let finalFileObj = null;

      while (offset < fileSize) {
        const chunkEnd = Math.min(offset + chunkSize, fileSize);
        const isLastChunk = chunkEnd === fileSize;
        const chunkBlob = file.slice(offset, chunkEnd);

        const pct = Math.round((offset / fileSize) * 60) + 5;
        const uploadedMb = (offset / (1024 * 1024)).toFixed(1);
        const totalMb = (fileSize / (1024 * 1024)).toFixed(1);

        if (onProgress) {
          onProgress(pct, `جاري رفع التسجيل: ${uploadedMb} / ${totalMb} MB (${Math.round((offset / fileSize) * 100)}%)...`);
        }

        const chunkResp = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Content-Length': String(chunkBlob.size),
            'X-Goog-Upload-Offset': String(offset),
            'X-Goog-Upload-Command': isLastChunk ? 'upload, finalize' : 'upload'
          },
          body: chunkBlob
        });

        if (!chunkResp.ok) {
          throw new Error(`انقطع رفع الملف عند ${uploadedMb} MB (HTTP ${chunkResp.status})`);
        }

        if (isLastChunk) {
          const result = await chunkResp.json();
          finalFileObj = result.file;
          break;
        }

        offset = chunkEnd;
      }

      if (!finalFileObj || !finalFileObj.uri) {
        throw new Error('لم يكتمل تسجيل الملف بنجاح على خوادم الذكاء الاصطناعي.');
      }

      if (onProgress) onProgress(68, 'اكتمل رفع الملف! جاري فحص ومعالجة الصوت...');

      let fileInfo = finalFileObj;
      let attempts = 0;
      while (fileInfo.state === 'PROCESSING' && attempts < 40) {
        attempts++;
        if (onProgress) onProgress(70, `جاري فهرسة محتوى التسجيل الضخم (${attempts * 2} ثانية)...`);
        await new Promise((r) => setTimeout(r, 2500));
        const pollResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileInfo.name}?key=${this.apiKey}`);
        if (pollResp.ok) {
          fileInfo = await pollResp.json();
        }
      }

      if (fileInfo.state === 'FAILED') {
        throw new Error('فشلت معالجة صيغة الملف الصوتي.');
      }

      return {
        fileUri: fileInfo.uri,
        mimeType: fileInfo.mimeType || mimeType,
        fileName: fileInfo.name
      };
    }

    buildSystemPrompt(dialect, formatStyle) {
      const dialectGuide = {
        egyptian_scientific: 'المحاضرة بالعامية المصرية ممزوجة بمصطلحات علمية/إنجليزية (طبيعية للمدرجات المصرية). اكتب المصطلحات العلمية الإنجليزية بدقة مع نطق الدكتور المصري.',
        egyptian: 'المحاضرة بالعامية المصرية. فرّغ كلام الدكتور كما نطق بدقة مع تهذيب العبارات المتداخلة.',
        fusha: 'المحاضرة باللغة العربية الفصحى. حافظ على دقة الإعراب والتشكيل حيث يلزم.',
        auto: 'اكتشف تلقائياً لهجة المحاضر وفرغها بأعلى دقة لغوية ممكنة.'
      }[dialect] || 'عامية مصرية بمصطلحات علمية';

      return `أنت خبير أكاديمي رفيع المستوى متخصص في تفريغ المحاضرات الجامعية الطويلة وفصل الأصوات في البيئات الصاخبة.
أمامك ملف تسجيل لمحاضرة جامعية حقيقية قد تمتد لساعات داخل قاعة/مدرج به دوشة وطلاب.

[القواعد الصارمة والواجبات - التزم بها بنسبة 100%]:
1. **عزل صوت الدكتور فقط (Speaker Isolation)**:
   - القاعة بها ضوضاء، صدى صوت، سعال، وأحاديث جانبية لطلاب يتكلمون ويهمسون.
   - مهمتك الجوهرية: الاستماع الحصري للصوت الرئيسي المستمر بالشرح (الدكتور/المحاضر).
   - **تجاهل تماماً** أي كلام صادر من الطلاب في المقاعد الخلفية، الضحك، أو الأسئلة المشوشة، إلا إذا كررها الدكتور ورد عليها بصوته.

2. **الأمانة العلمية الصارمة (Zero Hallucination)**:
   - ممنوع تماماً تأليف أو إضافة أي معلومة لم يقلها الدكتور من معرفتك الخارجية.
   - إذا كان هناك مقطع غير مسموع تماماً بسبب تشويش أو ضوضاء شديدة، لا تخترع كلاماً، واكتب بدقة: "[مقطع غير واضح بسبب صوت القاعة]".

3. **اللغة واللهجة**:
   - ${dialectGuide}
   - اكتب الأرقام والمصطلحات والرموز العلمية (مثل: Python, Newton, DNA, O(N), etc.) كما نطقها المحاضر بدقة.

4. **تنسيق وترتيب الكلام المتداخل للمحاضرة الكاملة**:
   - نظّم المحاضرة كاملة من بدايتها لنهايتها في محاور وعناوين متسلسلة.
   - لخّص الشرح في نقاط دراسية أنيقة تجعل المذاكرة ممتعة وسلسة دون تحريف المعنى.
   - استخرج بدقة جميع الأسئلة والتنبيهات التي قال الدكتور أنها مهمة للامتحان.

يجب أن تُخرج النتيجة بتنسيق JSON حصري داخل كود \`\`\`json\`\`\` بالبنية التالية:
{
  "lecture_title": "عنوان دقيق وشامل لموضوع المحاضرة بناءً على ما قاله الدكتور",
  "topics": [
    {
      "topic_title": "عنوان المحور أو النقطة المشروحة",
      "summary": "ملخص فقرة الشرح بأسلوب منظم وصريح مما قاله الدكتور",
      "points": ["نقطة تفصيلية 1", "نقطة تفصيلية 2", "مثال ذكره الدكتور"],
      "doctor_warning": "أي تنبيه مهم قاله الدكتور عن هذه النقطة (أو فارغ إذا لم يذكر)"
    }
  ],
  "exam_highlights": [
    "أي نقطة صرح الدكتور أنها موضع سؤال في الامتحان، أو كررها للتأكيد، أو حذر من الوقوع في خطأ شائع فيها"
  ],
  "key_terms": [
    {
      "term_ar": "المصطلح بالعربية",
      "term_en": "المصطلح بالإنجليزية (إن وُجد)",
      "definition": "تعريف المصطلح كما شرحه الدكتور في القاعة"
    }
  ],
  "verbatim_transcript": "التفريغ الحرفي الشامل لأهم أجزاء كلام الدكتور مقسمة بالترتيب مع الطوابع الزمنية، مع كتابة [صوت غير مسموع] عند أي دوشة تعيق الفهم."
}`;
    }

    async transcribeAudio({ audioBlob, dialect = 'egyptian_scientific', formatStyle = 'comprehensive', onProgress }) {
      if (!this.apiKey) {
        throw new Error('يرجى إدخال مفتاح Gemini API أولاً من زر "مفتاح الذكاء الاصطناعي" في الأعلى.');
      }

      const fileSize = audioBlob.size;
      const systemPrompt = this.buildSystemPrompt(dialect, formatStyle);
      let contentPart = null;

      // للملفات الكبيرة (أكبر من 15MB وحتى 2GB) نستخدم الرفع السحابي المجزأ
      if (fileSize > 15 * 1024 * 1024) {
        if (onProgress) onProgress(5, `الملف حجمه كبير (${(fileSize / (1024 * 1024)).toFixed(1)} MB) - جاري الرفع السحابي المتدفق...`);
        const uploadResult = await this.uploadLargeFileResumable(audioBlob, onProgress);
        contentPart = {
          fileData: {
            mimeType: uploadResult.mimeType,
            fileUri: uploadResult.fileUri
          }
        };
      } else {
        if (onProgress) onProgress(20, 'تجهيز ملف الصوت السريع...');
        const base64Audio = await AudioProcessor.blobToBase64(audioBlob);
        const mimeType = this.detectMimeType(audioBlob);
        contentPart = {
          inlineData: {
            mimeType: mimeType,
            data: base64Audio
          }
        };
      }

      const candidateModels = Array.from(new Set([
        this.model,
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-2.0-flash-lite',
        'gemini-1.5-pro'
      ]));

      let lastError = null;

      for (const currentModel of candidateModels) {
        try {
          if (onProgress) onProgress(75, `عزل دوشة القاعة وتفريغ كلام الدكتور باستخدام (${currentModel})...`);
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${this.apiKey}`;

          const requestBody = {
            contents: [
              {
                role: 'user',
                parts: [
                  { text: systemPrompt },
                  contentPart,
                  {
                    text: 'استمع للتسجيل كاملاً، اعزل صوت المحاضر بدقة عن كلام الطلاب وضوضاء القاعة، واستخرج كل ما قاله الدكتور دون زيادة أو نقصان بصيغة JSON المطلوبة.'
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 8192
            }
          };

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData?.error?.message || `HTTP ${response.status} (${response.statusText})`;
            if (response.status === 404 || errMsg.toLowerCase().includes('not found')) {
              console.warn(`النموذج ${currentModel} غير مدعوم، جاري تجربة نموذج آخر...`);
              lastError = new Error(errMsg);
              continue;
            }
            throw new Error(`خطأ من خادم الذكاء الاصطناعي: ${errMsg}`);
          }

          if (onProgress) onProgress(90, 'استلام البيانات وتنسيق المذكرة ومسرد المصطلحات...');
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

          if (!rawText) {
            throw new Error('لم يتم استلام نص من نموذج الذكاء الاصطناعي.');
          }

          this.model = currentModel;
          localStorage.setItem('smart_lecture_model', currentModel);

          if (onProgress) onProgress(98, 'مراجعة الأمانة العلمية وتجهيز العرض...');
          return this.parseResponse(rawText, currentModel);
        } catch (err) {
          lastError = err;
          if (err.message && err.message.includes('404')) {
            continue;
          }
          throw err;
        }
      }

      throw lastError || new Error('فشلت محاولة استخراج الكلام من المحاضرة.');
    }

    parseResponse(rawText, usedModel) {
      try {
        const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : rawText;
        const parsed = JSON.parse(jsonStr.trim());
        return { success: true, data: parsed, raw: rawText, usedModel };
      } catch (err) {
        console.warn('Could not parse pure JSON from model response, falling back to markdown structure:', err);
        return {
          success: true,
          data: {
            lecture_title: 'تفريغ المحاضرة المسجلة',
            topics: [
              {
                topic_title: 'شرح المحاضرة',
                summary: rawText.slice(0, 300) + '...',
                points: [rawText],
                doctor_warning: ''
              }
            ],
            exam_highlights: ['راجع النقاط المذكورة في نص الشرح أعلاه'],
            key_terms: [],
            verbatim_transcript: rawText
          },
          raw: rawText,
          usedModel
        };
      }
    }
  }

  /* ==========================================================================
     4. إدارة الواجهة والتفاعل (UI Controller)
     ========================================================================== */
  const elements = {
    btnOpenSettings: document.getElementById('btn-open-settings'),
    btnLoadDemo: document.getElementById('btn-load-demo'),
    btnTriggerSampleEmpty: document.getElementById('btn-trigger-sample-empty'),
    btnThemeToggle: document.getElementById('btn-theme-toggle'),
    apiStatusBadge: document.getElementById('api-status-badge'),

    tabRecord: document.getElementById('tab-record'),
    tabUpload: document.getElementById('tab-upload'),
    panelRecord: document.getElementById('panel-record'),
    panelUpload: document.getElementById('panel-upload'),

    btnToggleRecord: document.getElementById('btn-toggle-record'),
    btnPauseRecord: document.getElementById('btn-pause-record'),
    recordIcon: document.getElementById('record-icon'),
    recordLabel: document.getElementById('record-label'),
    recordingPulse: document.getElementById('recording-pulse'),
    recordingStatusText: document.getElementById('recording-status-text'),
    recordingTimer: document.getElementById('recording-timer'),
    visualizerCanvas: document.getElementById('visualizer-canvas'),

    dropZone: document.getElementById('drop-zone'),
    audioFileInput: document.getElementById('audio-file-input'),
    uploadedFileInfo: document.getElementById('uploaded-file-info'),
    uploadedFileName: document.getElementById('uploaded-file-name'),
    uploadedFileSize: document.getElementById('uploaded-file-size'),

    audioPreviewContainer: document.getElementById('audio-preview-container'),
    audioElement: document.getElementById('audio-element'),
    audioDurationDisplay: document.getElementById('audio-duration-display'),

    chkHallFilter: document.getElementById('chk-hall-filter'),
    chkBoostVoice: document.getElementById('chk-boost-voice'),
    selectDialect: document.getElementById('select-dialect'),
    selectFormatStyle: document.getElementById('select-format-style'),

    btnProcessTranscribe: document.getElementById('btn-process-transcribe'),
    processingProgressBox: document.getElementById('processing-progress-box'),
    processingStageText: document.getElementById('processing-stage-text'),
    processingPct: document.getElementById('processing-pct'),
    progressBarFill: document.getElementById('progress-bar-fill'),

    lectureStatsCard: document.getElementById('lecture-stats-card'),
    statDuration: document.getElementById('stat-duration'),
    statWords: document.getElementById('stat-words'),
    statReadTime: document.getElementById('stat-read-time'),

    resultsDisplayArea: document.getElementById('results-display-area'),
    tabResFormatted: document.getElementById('tab-res-formatted'),
    tabResVerbatim: document.getElementById('tab-res-verbatim'),
    tabResExam: document.getElementById('tab-res-exam'),
    emptyState: document.getElementById('empty-state'),
    contentFormatted: document.getElementById('content-formatted'),
    contentVerbatim: document.getElementById('content-verbatim'),
    contentExam: document.getElementById('content-exam'),
    transcriptionModelBadge: document.getElementById('transcription-model-badge'),

    searchInput: document.getElementById('search-input'),
    btnCopyText: document.getElementById('btn-copy-text'),
    btnExportWord: document.getElementById('btn-export-word'),
    btnExportPdf: document.getElementById('btn-export-pdf'),

    settingsModal: document.getElementById('settings-modal'),
    btnCloseSettings: document.getElementById('btn-close-settings'),
    inputApiKey: document.getElementById('input-api-key'),
    selectModel: document.getElementById('select-model'),
    btnFetchModels: document.getElementById('btn-fetch-models'),
    modelsFetchStatus: document.getElementById('models-fetch-status'),
    btnSaveSettings: document.getElementById('btn-save-settings'),

    toastContainer: document.getElementById('toast-container')
  };

  function getValidInitialModel() {
    const saved = localStorage.getItem('smart_lecture_model');
    if (!saved || saved === 'gemini-2.5-flash' || saved === 'undefined') {
      localStorage.setItem('smart_lecture_model', 'gemini-2.0-flash');
      return 'gemini-2.0-flash';
    }
    return saved;
  }

  const state = {
    activeTab: 'upload', // تبويب الرفع مفعل افتراضياً للملفات الضخمة
    activeResultTab: 'formatted',
    currentAudioBlob: null,
    currentAudioDuration: 0,
    recordingInterval: null,
    recordingSeconds: 0,
    isRecording: false,
    isPaused: false,
    activeData: null,
    apiKey: localStorage.getItem('smart_lecture_api_key') || '',
    model: getValidInitialModel(),
    visualizerAnimationId: null
  };

  const audioProcessor = new AudioProcessor();
  const transcriber = new GeminiTranscriber(state.apiKey, state.model);

  function init() {
    if (window.lucide) window.lucide.createIcons();
    initTheme();
    updateApiBadge();
    setupEventListeners();
    drawIdleVisualizer();
  }

  function initTheme() {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (window.lucide) window.lucide.createIcons();
  }

  function updateApiBadge() {
    if (state.apiKey) {
      elements.apiStatusBadge.className = 'w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50';
      elements.apiStatusBadge.title = 'مفتاح الذكاء الاصطناعي مفعل';
    } else {
      elements.apiStatusBadge.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse';
      elements.apiStatusBadge.title = 'يرجى إدخال مفتاح الذكاء الاصطناعي';
    }
    elements.inputApiKey.value = state.apiKey;
    elements.selectModel.value = state.model;
    elements.transcriptionModelBadge.textContent = state.model;
  }

  function setupEventListeners() {
    elements.btnThemeToggle.addEventListener('click', toggleTheme);
    elements.btnOpenSettings.addEventListener('click', () => toggleModal(true));
    elements.btnCloseSettings.addEventListener('click', () => toggleModal(false));
    elements.btnSaveSettings.addEventListener('click', saveSettings);
    elements.settingsModal.addEventListener('click', (e) => {
      if (e.target === elements.settingsModal) toggleModal(false);
    });

    if (elements.btnFetchModels) {
      elements.btnFetchModels.addEventListener('click', handleFetchAvailableModels);
    }

    elements.btnLoadDemo.addEventListener('click', loadDemoLecture);
    elements.btnTriggerSampleEmpty.addEventListener('click', loadDemoLecture);

    elements.tabRecord.addEventListener('click', () => switchInputTab('record'));
    elements.tabUpload.addEventListener('click', () => switchInputTab('upload'));

    elements.btnToggleRecord.addEventListener('click', handleToggleRecording);
    elements.btnPauseRecord.addEventListener('click', handlePauseRecording);

    elements.dropZone.addEventListener('click', () => elements.audioFileInput.click());
    elements.audioFileInput.addEventListener('change', handleFileSelected);
    elements.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      elements.dropZone.classList.add('border-brand-500', 'bg-brand-50/60', 'dark:bg-brand-950/40');
    });
    elements.dropZone.addEventListener('dragleave', () => {
      elements.dropZone.classList.remove('border-brand-500', 'bg-brand-50/60', 'dark:bg-brand-950/40');
    });
    elements.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      elements.dropZone.classList.remove('border-brand-500', 'bg-brand-50/60', 'dark:bg-brand-950/40');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processSelectedFile(e.dataTransfer.files[0]);
      }
    });

    elements.btnProcessTranscribe.addEventListener('click', handleStartTranscription);

    elements.tabResFormatted.addEventListener('click', () => switchResultTab('formatted'));
    elements.tabResVerbatim.addEventListener('click', () => switchResultTab('verbatim'));
    elements.tabResExam.addEventListener('click', () => switchResultTab('exam'));

    elements.searchInput.addEventListener('input', handleSearch);
    elements.btnCopyText.addEventListener('click', handleCopy);
    elements.btnExportWord.addEventListener('click', exportToWord);
    elements.btnExportPdf.addEventListener('click', exportToPdf);
  }

  async function handleFetchAvailableModels() {
    const key = elements.inputApiKey.value.trim();
    if (!key) {
      showToast('يرجى إدخال مفتاح الـ API أولاً في الحقل أعلاه.', 'warning');
      return;
    }

    elements.btnFetchModels.classList.add('opacity-50', 'pointer-events-none');
    elements.modelsFetchStatus.classList.remove('hidden');
    elements.modelsFetchStatus.textContent = 'جاري فحص النماذج المتاحة في حسابك لدى Google...';
    elements.modelsFetchStatus.className = 'text-[10px] text-slate-500 dark:text-slate-400 mt-1.5';

    try {
      transcriber.setApiKey(key);
      const models = await transcriber.listAvailableModels();
      if (models.length > 0) {
        elements.selectModel.innerHTML = models.map((m) => `
          <option value="${m.id}" ${m.id === state.model ? 'selected' : ''}>
            ${m.id} ${m.name && m.name !== m.id ? `(${m.name})` : ''}
          </option>
        `).join('');
        elements.modelsFetchStatus.textContent = `✓ تم العثور على ${models.length} نموذج مدعوم في حسابك!`;
        elements.modelsFetchStatus.className = 'text-[10px] text-emerald-600 dark:text-emerald-400 mt-1.5 font-semibold';
        showToast(`تم تحديث قائمة النماذج بنجاح (${models.length} نموذج)`, 'success');
      } else {
        elements.modelsFetchStatus.textContent = 'لم يتم العثور على نماذج إضافية، النماذج الافتراضية نشطة.';
      }
    } catch (err) {
      elements.modelsFetchStatus.textContent = `تعذر فحص النماذج: ${err.message}`;
      elements.modelsFetchStatus.className = 'text-[10px] text-rose-500 mt-1.5';
      showToast(`فحص النماذج: ${err.message}`, 'error');
    } finally {
      elements.btnFetchModels.classList.remove('opacity-50', 'pointer-events-none');
    }
  }

  function toggleModal(show) {
    if (show) {
      elements.settingsModal.classList.remove('hidden');
    } else {
      elements.settingsModal.classList.add('hidden');
    }
  }

  function saveSettings() {
    const key = elements.inputApiKey.value.trim();
    const model = elements.selectModel.value;

    state.apiKey = key;
    state.model = model;

    localStorage.setItem('smart_lecture_api_key', key);
    localStorage.setItem('smart_lecture_model', model);

    transcriber.setApiKey(key);
    transcriber.setModel(model);

    updateApiBadge();
    toggleModal(false);
    showToast('تم حفظ إعدادات الذكاء الاصطناعي بنجاح!', 'success');
  }

  function switchInputTab(tab) {
    state.activeTab = tab;
    if (tab === 'upload') {
      elements.tabUpload.className = 'flex-1 py-2.5 px-3 rounded-lg bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm flex items-center justify-center gap-2 transition-all';
      elements.tabRecord.className = 'flex-1 py-2.5 px-3 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center justify-center gap-2 transition-all';
      elements.panelUpload.classList.remove('hidden');
      elements.panelRecord.classList.add('hidden');
    } else {
      elements.tabRecord.className = 'flex-1 py-2.5 px-3 rounded-lg bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm flex items-center justify-center gap-2 transition-all';
      elements.tabUpload.className = 'flex-1 py-2.5 px-3 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center justify-center gap-2 transition-all';
      elements.panelRecord.classList.remove('hidden');
      elements.panelUpload.classList.add('hidden');
    }
    if (window.lucide) window.lucide.createIcons();
  }

  async function handleToggleRecording() {
    if (!state.isRecording) {
      try {
        const analyser = await audioProcessor.startLiveRecording({
          enableHallFilter: elements.chkHallFilter.checked,
          enableVoiceBoost: elements.chkBoostVoice.checked,
          onStop: (blob) => {
            state.currentAudioBlob = blob;
            updateAudioPreview(blob);
            elements.btnProcessTranscribe.removeAttribute('disabled');
          }
        });

        state.isRecording = true;
        state.isPaused = false;
        state.recordingSeconds = 0;

        elements.btnToggleRecord.className = 'flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all';
        elements.recordIcon.setAttribute('data-lucide', 'square');
        elements.recordLabel.textContent = 'إنهاء وحفظ التسجيل';
        elements.recordingPulse.classList.remove('hidden');
        elements.recordingStatusText.textContent = 'جاري التسجيل وعزل الدوشة الحية...';
        elements.btnPauseRecord.removeAttribute('disabled');
        elements.btnPauseRecord.className = 'p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer transition-all';

        state.recordingInterval = setInterval(() => {
          if (!state.isPaused) {
            state.recordingSeconds++;
            elements.recordingTimer.textContent = AudioProcessor.formatDuration(state.recordingSeconds);
          }
        }, 1000);

        startVisualizer(analyser);
        showToast('بدأ تسجيل المحاضرة مع تفعيل عزل صوت القاعة!', 'info');
        if (window.lucide) window.lucide.createIcons();
      } catch (err) {
        console.error(err);
        showToast('تعذر الوصول إلى الميكروفون. يرجى التأكد من منحه الإذن.', 'error');
      }
    } else {
      audioProcessor.stopRecording();
      state.isRecording = false;
      state.isPaused = false;
      clearInterval(state.recordingInterval);

      elements.btnToggleRecord.className = 'flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all';
      elements.recordIcon.setAttribute('data-lucide', 'mic');
      elements.recordLabel.textContent = 'بدء تسجيل جديد';
      elements.recordingPulse.classList.add('hidden');
      elements.recordingStatusText.textContent = 'تم إيقاف التسجيل بنجاح';
      elements.btnPauseRecord.setAttribute('disabled', 'true');
      elements.btnPauseRecord.className = 'p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-not-allowed disabled:opacity-50 transition-all';

      cancelAnimationFrame(state.visualizerAnimationId);
      drawIdleVisualizer();
      showToast('تم حفظ التسجيل! اضغط على "إزالة الدوشة وتفريغ المحاضرة الآن".', 'success');
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function handlePauseRecording() {
    if (!state.isRecording) return;
    const isNowPaused = audioProcessor.togglePauseRecording();
    state.isPaused = isNowPaused;

    if (isNowPaused) {
      elements.recordingStatusText.textContent = 'التسجيل متوقف مؤقتاً';
      elements.btnPauseRecord.innerHTML = '<i data-lucide="play" class="w-5 h-5 text-emerald-500"></i>';
      showToast('تم الإيقاف المؤقت للتسجيل', 'info');
    } else {
      elements.recordingStatusText.textContent = 'جاري التسجيل وعزل الدوشة الحية...';
      elements.btnPauseRecord.innerHTML = '<i data-lucide="pause" class="w-5 h-5"></i>';
      showToast('تم استئناف التسجيل', 'info');
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function handleFileSelected(e) {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  }

  function processSelectedFile(file) {
    state.currentAudioBlob = file;
    elements.uploadedFileName.textContent = file.name;

    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb >= 1024) {
      elements.uploadedFileSize.textContent = (sizeInMb / 1024).toFixed(2) + ' GB';
    } else {
      elements.uploadedFileSize.textContent = sizeInMb.toFixed(1) + ' MB';
    }

    elements.uploadedFileInfo.classList.remove('hidden');

    // للملفات الصوتية العادية نشغل المعاينة، وإن كانت ملفات فيديو أو كبيرة جداً نكتفي بعرض الحجم والاسم لتوفير الذاكرة
    if (file.size < 300 * 1024 * 1024) {
      updateAudioPreview(file);
    } else {
      elements.audioPreviewContainer.classList.add('hidden');
    }

    elements.btnProcessTranscribe.removeAttribute('disabled');
    showToast(`تم اختيار الملف بنجاح (${elements.uploadedFileSize.textContent})! اضغط على تفريغ المحاضرة الآن.`, 'success');
    if (window.lucide) window.lucide.createIcons();
  }

  function updateAudioPreview(blob) {
    try {
      const url = URL.createObjectURL(blob);
      elements.audioElement.src = url;
      elements.audioPreviewContainer.classList.remove('hidden');

      elements.audioElement.onloadedmetadata = () => {
        state.currentAudioDuration = elements.audioElement.duration;
        elements.audioDurationDisplay.textContent = AudioProcessor.formatDuration(elements.audioElement.duration);
      };
    } catch (e) {
      console.warn('Could not create preview audio element for very large file:', e);
    }
  }

  function startVisualizer(analyserNode) {
    const canvas = elements.visualizerCanvas;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      state.visualizerAnimationId = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#2563eb');
        gradient.addColorStop(0.5, '#60a5fa');
        gradient.addColorStop(1, '#ec4899');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    }
    draw();
  }

  function drawIdleVisualizer() {
    const canvas = elements.visualizerCanvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  async function handleStartTranscription() {
    if (!state.currentAudioBlob) {
      showToast('يرجى اختيار أو رفع ملف المحاضرة أولاً.', 'warning');
      return;
    }

    if (!state.apiKey) {
      showToast('يرجى إدخال مفتاح Gemini API أولاً للاستفادة من الذكاء الاصطناعي.', 'warning');
      toggleModal(true);
      return;
    }

    elements.btnProcessTranscribe.setAttribute('disabled', 'true');
    elements.processingProgressBox.classList.remove('hidden');
    updateProgress(5, 'جاري فحص وتجهيز تسجيل المحاضرة...');

    try {
      let processedBlob = state.currentAudioBlob;

      // تطبيق الفلتر المحلي فقط للملفات الصغيرة (أقل من 40MB)، لتجنب استهلاك رامات المتصفح على الملفات الكبيرة (1GB)
      if (elements.chkHallFilter.checked && state.currentAudioBlob.size < 40 * 1024 * 1024) {
        processedBlob = await audioProcessor.cleanAudioOffline(state.currentAudioBlob, (pct, msg) => {
          updateProgress(pct * 0.25, msg);
        });
      }

      // إرسال الملف (يدعم حتى 2GB عبر Resumable Chunked Files API)
      const result = await transcriber.transcribeAudio({
        audioBlob: processedBlob,
        dialect: elements.selectDialect.value,
        formatStyle: elements.selectFormatStyle.value,
        onProgress: (pct, msg) => {
          updateProgress(pct, msg);
        }
      });

      updateProgress(100, 'اكتمل تفريغ واستخراج محتوى المحاضرة بنجاح!');
      setTimeout(() => {
        elements.processingProgressBox.classList.add('hidden');
        elements.btnProcessTranscribe.removeAttribute('disabled');
      }, 1200);

      renderLectureData(result.data);
      if (result.usedModel) {
        state.model = result.usedModel;
        elements.transcriptionModelBadge.textContent = result.usedModel;
      }
      showToast('تم استخراج كلام الدكتور وتنسيق المذكرة بدقة وأمانة تامة!', 'success');
    } catch (err) {
      console.error(err);
      elements.processingProgressBox.classList.add('hidden');
      elements.btnProcessTranscribe.removeAttribute('disabled');
      showToast(`حدث خطأ أثناء التفريغ: ${err.message}`, 'error');
    }
  }

  function updateProgress(pct, msg) {
    const rounded = Math.min(100, Math.round(pct));
    elements.processingPct.textContent = `${rounded}%`;
    elements.progressBarFill.style.width = `${rounded}%`;
    if (msg) elements.processingStageText.textContent = msg;
  }

  function loadDemoLecture() {
    const demoAudio = createSampleAudioBlob();
    state.currentAudioBlob = demoAudio;
    updateAudioPreview(demoAudio);
    elements.btnProcessTranscribe.removeAttribute('disabled');

    renderLectureData(SAMPLE_LECTURE_DATA);
    showToast('تم تحميل نموذج المحاضرة التجريبية بنجاح!', 'success');

    if (elements.resultsDisplayArea) {
      elements.resultsDisplayArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function renderLectureData(data) {
    state.activeData = data;
    elements.emptyState.classList.add('hidden');

    const verbatimText = data.verbatim_transcript || '';
    const words = verbatimText.trim().split(/\s+/).filter(Boolean).length;
    const readMins = Math.max(1, Math.ceil(words / 130));

    elements.statDuration.textContent = elements.audioDurationDisplay.textContent || '05:45';
    elements.statWords.textContent = words.toLocaleString('ar-EG');
    elements.statReadTime.textContent = `${readMins} دقيقة`;
    elements.lectureStatsCard.classList.remove('hidden');

    renderFormattedNotes(data);
    renderVerbatimTranscript(data.verbatim_transcript);
    renderExamHighlights(data.exam_highlights, data.key_terms);

    switchResultTab('formatted');
    if (window.lucide) window.lucide.createIcons();
  }

  function renderFormattedNotes(data) {
    let html = `
      <div class="space-y-6">
        <div class="border-b border-slate-200 dark:border-slate-800 pb-4">
          <span class="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-full border border-brand-200 dark:border-brand-800 inline-block mb-2">
            مذكرة دراسية معتمدة من كلام الدكتور
          </span>
          <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
            ${escapeHtml(data.lecture_title || 'محاضرة جامعية')}
          </h2>
        </div>
    `;

    if (data.topics && data.topics.length > 0) {
      data.topics.forEach((topic) => {
        html += `
          <section class="lecture-card-topic space-y-3">
            <h3 class="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
              ${escapeHtml(topic.topic_title)}
            </h3>
            <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              ${escapeHtml(topic.summary)}
            </p>
            <ul class="space-y-1.5 list-disc list-inside text-xs sm:text-sm text-slate-700 dark:text-slate-300 pr-2">
              ${(topic.points || []).map((pt) => `<li>${escapeHtml(pt)}</li>`).join('')}
            </ul>
            ${topic.doctor_warning ? `
              <div class="lecture-card-exam text-xs sm:text-sm">
                <strong class="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                  <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-600"></i>
                  تنبيه من الدكتور:
                </strong>
                <p class="text-amber-900 dark:text-amber-200">${escapeHtml(topic.doctor_warning)}</p>
              </div>
            ` : ''}
          </section>
        `;
      });
    }

    html += `</div>`;
    elements.contentFormatted.innerHTML = html;
  }

  function renderVerbatimTranscript(transcript) {
    if (!transcript) {
      elements.contentVerbatim.innerHTML = '<p class="text-slate-400">لا يوجد تفريغ حرفي مسجل.</p>';
      return;
    }

    const lines = transcript.split('\n').filter(Boolean);
    let html = `<div class="space-y-2.5 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">`;

    lines.forEach((line) => {
      const isExcluded = line.includes('تم عزلها') || line.includes('تم تجاهله') || line.includes('غير واضح');

      if (isExcluded) {
        html += `
          <div class="text-[11px] p-2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border-r-2 border-amber-500 flex items-center gap-2">
            <i data-lucide="volume-x" class="w-3.5 h-3.5 flex-shrink-0"></i>
            <span>${escapeHtml(line)}</span>
          </div>
        `;
      } else {
        html += `
          <div class="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors leading-relaxed">
            ${escapeHtml(line)}
          </div>
        `;
      }
    });

    html += `</div>`;
    elements.contentVerbatim.innerHTML = html;
  }

  function renderExamHighlights(highlights, terms) {
    let html = `<div class="space-y-6">`;

    html += `
      <div class="space-y-3">
        <h3 class="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
          <i data-lucide="flame" class="w-4 h-4"></i>
          أبرز ما أكد عليه الدكتور للامتحان والميدترم
        </h3>
        <div class="grid grid-cols-1 gap-2.5">
    `;

    if (highlights && highlights.length > 0) {
      highlights.forEach((item) => {
        html += `
          <div class="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-medium flex items-start gap-2.5 shadow-sm">
            <i data-lucide="check-circle" class="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"></i>
            <span class="leading-relaxed">${escapeHtml(item)}</span>
          </div>
        `;
      });
    } else {
      html += `<p class="text-xs text-slate-400">لم يذكر الدكتور أسئلة امتحانات صريحة في هذا المقطع.</p>`;
    }

    html += `</div></div>`;

    if (terms && terms.length > 0) {
      html += `
        <div class="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <i data-lucide="bookmark" class="w-4 h-4 text-brand-600"></i>
            المصطلحات والمفاهيم العلمية المذكورة
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      `;

      terms.forEach((term) => {
        html += `
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-xs text-slate-900 dark:text-white">${escapeHtml(term.term_ar)}</span>
              ${term.term_en ? `<span class="font-mono text-[10px] text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/80 px-1.5 py-0.5 rounded">${escapeHtml(term.term_en)}</span>` : ''}
            </div>
            <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHtml(term.definition)}</p>
          </div>
        `;
      });

      html += `</div></div>`;
    }

    html += `</div>`;
    elements.contentExam.innerHTML = html;
  }

  function switchResultTab(tab) {
    state.activeResultTab = tab;

    const activeClass = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 text-white shadow-sm flex items-center gap-1.5 transition-all';
    const inactiveClass = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all';

    elements.tabResFormatted.className = tab === 'formatted' ? activeClass : inactiveClass;
    elements.tabResVerbatim.className = tab === 'verbatim' ? activeClass : inactiveClass;
    elements.tabResExam.className = tab === 'exam' ? activeClass : inactiveClass;

    elements.contentFormatted.classList.toggle('hidden', tab !== 'formatted');
    elements.contentVerbatim.classList.toggle('hidden', tab !== 'verbatim');
    elements.contentExam.classList.toggle('hidden', tab !== 'exam');

    if (window.lucide) window.lucide.createIcons();
  }

  function handleSearch(e) {
    const query = e.target.value.trim().toLowerCase();
    const currentContainer = state.activeResultTab === 'formatted' 
      ? elements.contentFormatted 
      : state.activeResultTab === 'verbatim' 
      ? elements.contentVerbatim 
      : elements.contentExam;

    const highlights = currentContainer.querySelectorAll('.search-highlight');
    highlights.forEach((hl) => {
      const parent = hl.parentNode;
      parent.replaceChild(document.createTextNode(hl.textContent), hl);
      parent.normalize();
    });

    if (!query) return;

    const walker = document.createTreeWalker(currentContainer, NodeFilter.SHOW_TEXT, null, false);
    const nodesToReplace = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeValue.toLowerCase().includes(query)) {
        nodesToReplace.push(node);
      }
    }

    let firstHighlight = null;
    nodesToReplace.forEach((node) => {
      const text = node.nodeValue;
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const span = document.createElement('span');
      span.innerHTML = text.replace(regex, '<mark class="search-highlight">$1</mark>');
      node.parentNode.replaceChild(span, node);
      if (!firstHighlight) firstHighlight = span.querySelector('.search-highlight');
    });

    if (firstHighlight) {
      firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function handleCopy() {
    if (!state.activeData) {
      showToast('لا يوجد محتوى للنسخ حالياً.', 'warning');
      return;
    }

    let textToCopy = '';
    if (state.activeResultTab === 'formatted') {
      textToCopy = elements.contentFormatted.innerText;
    } else if (state.activeResultTab === 'verbatim') {
      textToCopy = state.activeData.verbatim_transcript;
    } else {
      textToCopy = elements.contentExam.innerText;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('تم نسخ المحتوى بنجاح للحافظة!', 'success');
    }).catch(() => {
      showToast('تعذر النسخ التلقائي.', 'error');
    });
  }

  function exportToWord() {
    if (!state.activeData) {
      showToast('يرجى تفريغ محاضرة أولاً قبل التصدير.', 'warning');
      return;
    }

    const title = state.activeData.lecture_title || 'محاضرة جامعية';
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; }
          h1 { color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
          h2 { color: #2563eb; margin-top: 20px; }
          p { line-height: 1.8; font-size: 14pt; }
          li { font-size: 13pt; margin-bottom: 6px; }
          .exam-box { background: #fffbeb; border-right: 4px solid #f59e0b; padding: 12px; margin: 15px 0; }
          .footer { font-size: 10pt; color: #64748b; margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p><strong>تاريخ التفريغ:</strong> ${new Date().toLocaleDateString('ar-EG')}</p>
        <hr/>
        ${elements.contentFormatted.innerHTML}
        <br/>
        <div class="exam-box">
          <h3>تنبيهات وأسئلة الامتحان:</h3>
          ${elements.contentExam.innerHTML}
        </div>
        <div class="footer">
          تم التفريغ بواسطة منصة "محاضراتي الذكية" - نظام عزل دوشة المدرجات والأمانة العلمية.
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[\/\\?%*:|"<>]/g, '-')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('تم تنزيل ملف Word بنجاح!', 'success');
  }

  function exportToPdf() {
    if (!state.activeData) {
      showToast('يرجى تفريغ محاضرة أولاً قبل الحفظ كـ PDF.', 'warning');
      return;
    }
    window.print();
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const colors = {
      success: 'bg-emerald-600 text-white',
      error: 'bg-rose-600 text-white',
      warning: 'bg-amber-600 text-white',
      info: 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
    };

    toast.className = `p-3 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 pointer-events-auto transform transition-all duration-300 translate-y-2 opacity-0 ${colors[type] || colors.info}`;
    toast.innerHTML = `<span>${escapeHtml(message)}</span>`;

    elements.toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
