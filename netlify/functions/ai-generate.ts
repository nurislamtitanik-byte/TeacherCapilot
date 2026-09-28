const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-oss-120b';

async function callGroq(apiKey: string, prompt: string): Promise<any> {
  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;
  const isGptOss = model.startsWith('openai/gpt-oss');
  const reasoningEffort = process.env.GROQ_REASONING_EFFORT?.trim() || 'medium'; // low | medium | high

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'Siz faqat toza, yaroqli JSON qaytaradigan yordamchisiz. Hech qanday izoh, kirish so‘zi yoki markdown yozmang.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 1,
      top_p: 1,
      // gpt-oss'da "reasoning" tokenlari ham shu limitga kiradi, shuning uchun katta qiymat
      max_completion_tokens: 8192,
      ...(isGptOss ? { reasoning_effort: reasoningEffort } : {}),
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    const err: any = new Error(`Groq API xatosi (${res.status}): ${errText.slice(0, 500)}`);
    err.groqStatus = res.status;
    throw err;
  }

  const data: any = await res.json();
  const text: string = data?.choices?.[0]?.message?.content?.trim() || '{}';

  try {
    return JSON.parse(text);
  } catch {
    // Model JSONni ```json ... ``` ichiga o‘rab yuborgan bo‘lsa
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    return JSON.parse(cleaned);
  }
}

interface RequestPayload {
  type: 'lesson' | 'test' | 'material' | 'regenerate_section';
  subject?: string;
  grade?: string;
  topic?: string;
  duration?: string;
  level?: string;
  additionalRequirements?: string;
  questionCount?: number;
  testType?: string;
  materialType?: string;
  section?: string;
}

export async function processAiRequest(payload: RequestPayload) {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      'AI xizmati sozlanmagan. Administrator Netlify Environment Variables orqali GROQ_API_KEY ni sozlashi kerak.'
    );
  }

  const { type, subject, grade, topic, duration, level, additionalRequirements, questionCount, testType, materialType, section } = payload;

  if (type === 'lesson') {
    const prompt = `Siz O‘zbekiston umumta'lim maktablarining ilg'or, tajribali metodist-o‘qituvchisisiz.
Quyidagi parametrlar asosida DTS (Davlat Ta'lim Standartlari)ga to‘laqonli mos keluvchi professional dars ishlanmasi (konspekt) tuzing:

- Fan: ${subject || 'Aniqlanmagan'}
- Sinf: ${grade || 'Barcha sinflar'}
- Mavzu: ${topic || 'Umumiy mavzu'}
- Dars davomiyligi: ${duration || '45 daqiqa'}
- O‘quvchilar darajasi: ${level || 'O‘rta'}
${additionalRequirements ? `- O‘qituvchining qo‘shimcha talablari: ${additionalRequirements}` : ''}

Qat'iy ravishda quyidagi JSON sxemasiga mos javob bering (boshqa matn, izoh yoki markdown yozmang, faqat toza JSON):
{
  "title": "${topic} — ${grade} dars ishlanmasi",
  "objective": "Darsning bosh maqsadi (ta'limiy, tarbiyaviy, rivojlantiruvchi)",
  "expectedResults": [
    "Dars oxirida o'quvchi nimalarni bilishi va bajara olishi kerak (3-5 ta aniq natija)"
  ],
  "materials": [
    "Dars uchun zarur jihozlar, ko'rgazmali qurollar, AKT vositalari"
  ],
  "stages": [
    {
      "time": "vaqt (masalan: 5 daqiqa)",
      "title": "bosqich nomi (masalan: Tashkiliy qism / O'tgan mavzuni takrorlash / Yangi mavzu bayoni / Mustahkamlash / Baholash va uyga vazifa)",
      "teacherActivity": "O'qituvchining aniq harakatlari va ko'rsatmalari",
      "studentActivity": "O'quvchilarning faoliyati va javoblari",
      "materials": "Foydalaniladigan vosita yoki metod"
    }
  ],
  "explanation": "Yangi mavzuni tushuntirish qismi: asosiy qoidalar, faktlar, o'quvchilarga tushunarli tilda batafsil bayon",
  "exercises": [
    {
      "title": "1-mashq / Amaliy topshiriq",
      "instruction": "Topshiriq sharti",
      "content": "Mashq matni, misollar yoki savollar to'plami"
    }
  ],
  "assessment": "O'quvchilarni baholash mezonlari (formativ va summativ baholash tavsiyalari)",
  "homework": "Uyga beriladigan aniq vazifa va yo'riqnoma"
}

Javobingiz o'zbek tilida (lotin alifbosida), imlo xatolarisiz, pedagogik jihatdan mukammal bo'lsin.`;

    return await callGroq(apiKey, prompt);
  }

  if (type === 'test') {
    const count = questionCount || 10;
    const prompt = `Siz O‘zbekiston maktablari uchun professional testolog mutaxassissiz.
Quyidagi talablar asosida aniq ${count} ta sifatli test savolini tuzing:

- Fan: ${subject || 'Fan'}
- Sinf: ${grade || 'Sinf'}
- Mavzu: ${topic || 'Mavzu'}
- Savollar soni: ${count} ta
- O‘quvchilar darajasi: ${level || 'O‘rta'}
- Test turi: ${testType || 'Multiple Choice'}

MUHIM QOIDALAR:
1. Hech qanday takroriy (dublikat) savollar bo'lmasin.
2. Savollar aynan ${grade} yoshiga, tushunish darajasiga va ${topic} mavzusiga 100% mos bo'lsin.
3. Har bir savolda to'rtta variant (A, B, C, D) bo'lsin. Variantlar mantiqan to'g'ri, chalg'ituvchi (distraktor) variantlar esa ishonarli bo'lsin.
4. To'g'ri javoblar A, B, C, D harflari o'rtasida muvozanatli taqsimlansin (faqat bitta harf bo'lib qolmasin).
5. O'qituvchi uchun har bir savolga qisqa izoh (explanation) bering.

Qat'iy ravishda faqat toza JSON formatida quyidagi struktura bo'yicha javob bering:
{
  "questions": [
    {
      "id": "q1",
      "question": "Savol matni?",
      "options": {
        "A": "Variant A",
        "B": "Variant B",
        "C": "Variant C",
        "D": "Variant D"
      },
      "correctAnswer": "B",
      "explanation": "Nega aynan B to'g'ri ekanligi haqida qisqa tushuntirish"
    }
  ]
}

Javob to'liq o'zbek tili (lotin alifbosida) bo'lsin (agar ingliz tili yoki chet tili fani bo'lsa, savollar o'sha tilda bo'lishi mumkin).`;

    return await callGroq(apiKey, prompt);
  }

  if (type === 'material') {
    const prompt = `Siz O‘zbekiston xalq ta'limi metodistisiz.
Quyidagi parametrlar bo'yicha o'quvchilar uchun darsda va mustaqil o'rganishda qo'llashga mo'ljallangan mukammal o'quv materiali (tarqatma material / konspekt) tayyorlang:

- Fan: ${subject || 'Fan'}
- Sinf: ${grade || 'Sinf'}
- Mavzu: ${topic || 'Mavzu'}
- O‘quvchilar darajasi: ${level || 'O‘rta'}
- Material turi: ${materialType || 'Dars materiali'}

Material o‘quvchining yoshiga va ${grade} dasturiga to‘liq mos kelsin.

Qat'iy ravishda faqat toza JSON formatida quyidagi sxema bo'yicha javob qaytaring:
{
  "explanation": "Mavzuning o'quvchi uchun sodda, qiziqarli va tushunarli qisqa ilmiy-ommabop tushuntirishi",
  "examples": [
    {
      "title": "1-misol",
      "example": "Amaliy hayotiy misol yoki tahlil",
      "note": "Muhim e'tibor qaratish kerak bo'lgan jihat"
    },
    {
      "title": "2-misol",
      "example": "Ikkinchi misol",
      "note": "Izoh"
    }
  ],
  "exercises": [
    {
      "task": "O'quvchi mustaqil yechishi uchun 1-topshiriq sharti",
      "solution": "Javob yoki tekshirish uchun ko'rsatma"
    },
    {
      "task": "2-topshiriq sharti",
      "solution": "Ko'rsatma"
    }
  ],
  "importantPoints": [
    "Esda saqlang! Asosiy qoida yoki formula 1",
    "Esda saqlang! Muhim qoida 2"
  ],
  "reinforcement": "Mavzuni mustahkamlash uchun qisqa savol-javob yoki xulosa blitsi",
  "homework": "Mustaqil bajarish uchun ijodiy yoki amaliy uy vazifasi"
}

Javobingiz o'zbek tilida (lotin yozuvida), o'qituvchi va o'quvchi uchun juda qulay uslubda bo'lsin.`;

    return await callGroq(apiKey, prompt);
  }

  if (type === 'regenerate_section') {
    const prompt = `Fan: ${subject}, Sinf: ${grade}, Mavzu: ${topic}, Daraja: ${level}.
Iltimos, ushbu mavzu bo'yicha quyidagi bo'limni yangitdan, yanada qiziqarli va boyitilgan holda qayta tuzib bering:
Bo'lim: ${section}

Qat'iy ravishda faqat ushbu bo'lim uchun JSON qaytaring:
{
  "section": "${section}",
  "content": ... (agar examples yoki exercises yoki importantPoints bo'lsa massiv, matn bo'lsa string)
}`;

    return await callGroq(apiKey, prompt);
  }

  throw new Error('Noto‘g‘ri so‘rov turi ko‘rsatildi.');
}

// Netlify Functions v2 handler
export default async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Faqat POST so‘rovlari qabul qilinadi.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const result = await processAiRequest(body);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('AI xatosi:', error?.message || error);

    const msg: string = error?.message || '';
    const status: number | undefined = error?.groqStatus;
    const isApiKeyError = msg.includes('GROQ_API_KEY');

    let userMessage = 'AI bilan bog‘lanishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.';
    if (isApiKeyError) {
      userMessage = 'AI xizmati sozlanmagan. Administrator Netlify Environment Variables orqali GROQ_API_KEY ni sozlashi kerak.';
    } else if (status === 401) {
      userMessage = 'Groq API kaliti noto‘g‘ri yoki bekor qilingan (401). Kalitni tekshirib, Netlify’da yangilang.';
    } else if (status === 429 || status === 413) {
      userMessage = 'Groq limiti oshib ketdi (' + status + '). Bir daqiqa kutib qayta urinib ko‘ring.';
    } else if (status === 400 || status === 404) {
      userMessage = 'Groq modeli topilmadi yoki so‘rov noto‘g‘ri (' + status + '). GROQ_MODEL ni tekshiring.';
    } else if (error instanceof SyntaxError) {
      userMessage = 'AI javobi noto‘g‘ri formatda keldi. Qayta urinib ko‘ring.';
    }

    return new Response(
      JSON.stringify({ error: userMessage, details: msg.slice(0, 600) }),
      {
        status: isApiKeyError ? 503 : 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};