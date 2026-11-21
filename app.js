/**
 * app.js
 * منطق الواجهة والتحكم لتطبيق "محاضراتي الذكية"
 * تم تحديث الواجهة لتركز على رفع الملفات الضخمة حتى 2GB واستخراج الكلام منها
 */

import { AudioProcessor } from './audio-processor.js';
import { GeminiTranscriber } from './gemini-transcriber.js';
import { SAMPLE_LECTURE_DATA, createSampleAudioBlob } from './sample-lecture.js';

// عناصر الـ DOM الرئيسية
const elements = {
  // شريط التنقل
  btnOpenSettings: document.getElementById('btn-open-settings'),
  btnLoadDemo: document.getElementById('btn-load-demo'),
  btnTriggerSampleEmpty: document.getElementById('btn-trigger-sample-empty'),
  btnThemeToggle: document.getElementById('btn-theme-toggle'),
  apiStatusBadge: document.getElementById('api-status-badge'),

  // تبويبات التسجيل والرفع
  tabRecord: document.getElementById('tab-record'),
  tabUpload: document.getElementById('tab-upload'),
  panelRecord: document.getElementById('panel-record'),
  panelUpload: document.getElementById('panel-upload'),

  // التسجيل المباشر
  btnToggleRecord: document.getElementById('btn-toggle-record'),
  btnPauseRecord: document.getElementById('btn-pause-record'),
  recordIcon: document.getElementById('record-icon'),
  recordLabel: document.getElementById('record-label'),
  recordingPulse: document.getElementById('recording-pulse'),
  recordingStatusText: document.getElementById('recording-status-text'),
  recordingTimer: document.getElementById('recording-timer'),
  visualizerCanvas: document.getElementById('visualizer-canvas'),

  // رفع الملفات
  dropZone: document.getElementById('drop-zone'),
  audioFileInput: document.getElementById('audio-file-input'),
  uploadedFileInfo: document.getElementById('uploaded-file-info'),
  uploadedFileName: document.getElementById('uploaded-file-name'),
  uploadedFileSize: document.getElementById('uploaded-file-size'),

  // مشغل الصوت
  audioPreviewContainer: document.getElementById('audio-preview-container'),
  audioElement: document.getElementById('audio-element'),
  audioDurationDisplay: document.getElementById('audio-duration-display'),

  // الخيارات والفلاتر
  chkHallFilter: document.getElementById('chk-hall-filter'),
  chkBoostVoice: document.getElementById('chk-boost-voice'),
  selectDialect: document.getElementById('select-dialect'),
  selectFormatStyle: document.getElementById('select-format-style'),

  // زر المعالجة وشريط التقدم
  btnProcessTranscribe: document.getElementById('btn-process-transcribe'),
  processingProgressBox: document.getElementById('processing-progress-box'),
  processingStageText: document.getElementById('processing-stage-text'),
  processingPct: document.getElementById('processing-pct'),
  progressBarFill: document.getElementById('progress-bar-fill'),

  // الإحصائيات
  lectureStatsCard: document.getElementById('lecture-stats-card'),
  statDuration: document.getElementById('stat-duration'),
  statWords: document.getElementById('stat-words'),
  statReadTime: document.getElementById('stat-read-time'),

  // مساحة النتائج
  resultsDisplayArea: document.getElementById('results-display-area'),
  tabResFormatted: document.getElementById('tab-res-formatted'),
  tabResVerbatim: document.getElementById('tab-res-verbatim'),
  tabResExam: document.getElementById('tab-res-exam'),
  emptyState: document.getElementById('empty-state'),
  contentFormatted: document.getElementById('content-formatted'),
  contentVerbatim: document.getElementById('content-verbatim'),
  contentExam: document.getElementById('content-exam'),
  transcriptionModelBadge: document.getElementById('transcription-model-badge'),

  // الأدوات (بحث، نسخ، تصدير)
  searchInput: document.getElementById('search-input'),
  btnCopyText: document.getElementById('btn-copy-text'),
  btnExportWord: document.getElementById('btn-export-word'),
  btnExportPdf: document.getElementById('btn-export-pdf'),

  // نافذة الإعدادات
  settingsModal: document.getElementById('settings-modal'),
  btnCloseSettings: document.getElementById('btn-close-settings'),
  inputApiKey: document.getElementById('input-api-key'),
  selectModel: document.getElementById('select-model'),
  btnFetchModels: document.getElementById('btn-fetch-models'),
  modelsFetchStatus: document.getElementById('models-fetch-status'),
  btnSaveSettings: document.getElementById('btn-save-settings'),

  // التوست
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

// حالة التطبيق (State)
const state = {
  activeTab: 'upload', // جعل تبويب الرفع هو الافتراضي
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

// تهيئة المحركات
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

    if (elements.chkHallFilter.checked && state.currentAudioBlob.size < 40 * 1024 * 1024) {
      processedBlob = await audioProcessor.cleanAudioOffline(state.currentAudioBlob, (pct, msg) => {
        updateProgress(pct * 0.25, msg);
      });
    }

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

document.addEventListener('DOMContentLoaded', init);
