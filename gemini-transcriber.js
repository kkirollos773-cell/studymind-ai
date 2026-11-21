/**
 * gemini-transcriber.js
 * وحدة تفريغ المحاضرات الجامعية المتقدمة عبر Gemini Multimodal Audio
 * تدعم الملفات الضخمة (حتى 2 جيجابايت) والتسجيلات الطويلة عبر Google Gemini Files API
 * مع عزل دوشة المدرجات وكلام الطلاب، ومنع الهلوسة العلمية
 */

import { AudioProcessor } from './audio-processor.js';

export const SUPPORTED_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (النموذج الأحدث والأسرع - موصى به للملفات الكبيرة)', isDefault: true },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (مستقر ومثالي للتسجيلات الطويلة حتى عدة ساعات)' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite (خفيف وفائق السرعة)' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (أعلى دقة للمحاضرات المعقدة)' }
];

export class GeminiTranscriber {
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

  setApiKey(key) {
    this.apiKey = (key || '').trim();
  }

  setModel(model) {
    this.model = this.sanitizeModel(model);
  }

  /**
   * تحديد نوع الملف (MIME Type) بدقة حتى لو لم يحدده المتصفح
   */
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

  /**
   * استكشاف النماذج المتاحة لمفتاح الـ API
   */
  async listAvailableModels() {
    if (!this.apiKey) {
      throw new Error('يرجى إدخال مفتاح الـ API أولاً.');
    }
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
   * رفع الملفات الضخمة (تصل إلى 1-2 جيجابايت) عبر Gemini Resumable Files API
   * يقسم الملف إلى أجزاء (Chunks) دون استهلاك رامات المتصفح
   */
  async uploadLargeFileResumable(file, onProgress) {
    if (!this.apiKey) {
      throw new Error('يرجى إدخال مفتاح Gemini API أولاً.');
    }

    const mimeType = this.detectMimeType(file);
    const fileSize = file.size;
    const displayName = file.name || 'lecture_recording';

    if (onProgress) onProgress(5, `بدء تجهيز رفع الملف (${(fileSize / (1024 * 1024)).toFixed(1)} ميجابايت)...`);

    // 1. بدء جلسة الرفع (Start Resumable Upload Session)
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
      body: JSON.stringify({
        file: { display_name: displayName }
      })
    });

    if (!initResp.ok) {
      const errData = await initResp.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `فشل بدء رفع الملف (HTTP ${initResp.status})`);
    }

    const uploadUrl = initResp.headers.get('x-goog-upload-url');
    if (!uploadUrl) {
      throw new Error('لم يرجع خادم Google رابط الرفع المجزأ (Upload URL).');
    }

    // 2. إرسال أجزاء الملف (Chunked Upload Loop) بحجم 8MB للقطعة
    const chunkSize = 8 * 1024 * 1024; // 8MB per chunk
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

    if (onProgress) onProgress(68, 'اكتمل رفع الملف! جاري التحقق من جاهزية الصوت...');

    // 3. التحقق من اكتمال معالجة الملف في Google إذا كان فيديو أو صوت كبير
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
      throw new Error('فشلت خوادم Google في معالجة صيغة الملف الصوتي.');
    }

    return {
      fileUri: fileInfo.uri,
      mimeType: fileInfo.mimeType || mimeType,
      fileName: fileInfo.name
    };
  }

  /**
   * بناء المطالبة الصارمة لعزل صوت المحاضر والأمانة العلمية للمحاضرات الطويلة
   */
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

  /**
   * إرسال الصوت وتحليله وتفريغه عبر Gemini API
   * يدعم الملفات الضخمة عبر Files API للملفات الكبيرة (> 20MB أو حتى 2GB)
   * والـ inlineData للملفات الصغيرة المسجلة مباشرة
   */
  async transcribeAudio({ audioBlob, dialect = 'egyptian_scientific', formatStyle = 'comprehensive', onProgress }) {
    if (!this.apiKey) {
      throw new Error('يرجى إدخال مفتاح Gemini API أولاً من زر "مفتاح الذكاء الاصطناعي" في الأعلى.');
    }

    const fileSize = audioBlob.size;
    const systemPrompt = this.buildSystemPrompt(dialect, formatStyle);
    let contentPart = null;

    // إذا كان الملف أكبر من 15 ميجابايت (ملف محاضرة كبير أو فيديو يصل إلى 1-2 جيجا)
    if (fileSize > 15 * 1024 * 1024) {
      if (onProgress) onProgress(5, `الملف كبير (${(fileSize / (1024 * 1024)).toFixed(1)} MB) - جاري استخدام تقنية الرفع السحابي المجزأ...`);
      const uploadResult = await this.uploadLargeFileResumable(audioBlob, onProgress);
      contentPart = {
        fileData: {
          mimeType: uploadResult.mimeType,
          fileUri: uploadResult.fileUri
        }
      };
    } else {
      // للملفات الصغيرة والتسجيلات المباشرة القصيرة
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

    // تجربة النماذج بالترتيب مع التبديل التلقائي
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
        if (onProgress) onProgress(75, `عزل دوشة القاعة وكلام الطلاب وتفريغ المحاضرة باستخدام (${currentModel})...`);
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${this.apiKey}`;

        const requestBody = {
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemPrompt },
                contentPart,
                {
                  text: 'استمع للتسجيل بالكامل، اعزل صوت المحاضر بدقة عن كلام الطلاب وضوضاء القاعة، واستخرج كل ما قاله الدكتور دون زيادة أو نقصان بصيغة JSON المطلوبة.'
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1, // الالتزام التام بكلام المحاضر
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

        if (onProgress) onProgress(90, 'استلام النص وتنسيق المحاور ومسرد المصطلحات...');
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
