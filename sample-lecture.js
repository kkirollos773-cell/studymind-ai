/**
 * sample-lecture.js
 * عينة واقعية لمحاضرة جامعية مصرية مع دوشة قاعة حقيقية وكلام طلاب تم عزله
 * لتجربة التطبيق فوراً بدون الحاجة لتسجيل أو إدخال مفتاح في البداية
 */

export const SAMPLE_LECTURE_DATA = {
  lecture_title: "خوارزميات وتراكيب البيانات: جداول التجزئة (Hash Tables) وحل التصادمات",
  duration_seconds: 345,
  topics: [
    {
      topic_title: "1. مفهوم جدول التجزئة (Hash Table) ودالة التجزئة (Hash Function)",
      summary: "شرح الدكتور فكرة تحويل المفاتيح (Keys) إلى فهارس (Indices) داخل المصفوفة للوصول المباشر بسرعة فائقة زمنياً، ولماذا نلجأ إليها كبديل للمصفوفات العادية في محركات البحث وقواعد البيانات.",
      points: [
        "دالة التجزئة (Hash Function) وظيفتها الأساسية تحويل أي مدخل نصي أو رقمي إلى فهرس محدد بين 0 و (Array Size - 1).",
        "الشرط الأساسي في دالة التجزئة الجيدة هو التوزيع المتساوي (Uniform Distribution) وسرعة الحساب $O(1)$.",
        "الوصول للبيانات في الحالة المثالية (Best & Average Case) يستغرق زمناً ثابتاً تماماً $O(1)$ مقارنة بـ $O(N)$ في القوائم العادية."
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
        "أفضل حالة (Best Case) والبحث المعتاد (Average): $O(1)$ للبحث والإضافة والحذف.",
        "أسوأ حالة (Worst Case): $O(N)$ عندما تقع كل المفاتيح في نفس الخانة وتتحول إلى قائمة طويلة.",
        "لتفادي الحالة السيئة، يجب ألا يتعدى الـ Load Factor قيمة 0.7."
      ],
      doctor_warning: "الدكتور نبه على مسألة الـ Worst Case وسأل عنها طالب في المدرج وكررها مرتين لأهميتها في الفاينال."
    }
  ],
  exam_highlights: [
    "🔥 الدكتور صرح نصاً: 'المسألة بتاعة حل التصادم بالـ Separate Chaining والـ Linear Probing جاية في امتحان الميدترم والفاينال بأرقام مختلفة'.",
    "📌 قانون الـ Load Factor (معامل التحميل) وتأثيره على كفاءة الخوارزمية سؤال اختياري مضمون.",
    "⚠️ الفرق بين Average Case $O(1)$ و Worst Case $O(N)$ ولماذا تحدث الـ Worst Case."
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

/**
 * توليد نغمة صوتية تجريبية للتشغيل في المتصفح إذا طلب المستخدم تجربة العينة
 */
export function createSampleAudioBlob() {
  const sampleRate = 16000;
  const duration = 3;
  const totalSamples = sampleRate * duration;
  const buffer = new Float32Array(totalSamples);
  
  // توليد نغمة توافقية لطيفة تحاكي إشارة صوتية نقية
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    buffer[i] = 0.2 * Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 0.5) +
                0.1 * Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 0.8);
  }

  // تحويل لـ WAV
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
