# TeacherCopilot UZ

O‘zbekiston o‘qituvchilari uchun AI yordamchi (dars rejasi, test, o‘quv materiali). AI: **Groq API**.

## Netlify'ga joylash
1. Loyihani GitHub'ga yuklang yoki papkani Netlify'ga drag&drop qiling (Git orqali ulash tavsiya etiladi — funksiyalar shunda build bo‘ladi).
2. Netlify → **Site configuration → Environment variables**:
   - `GROQ_API_KEY` = Groq kalitingiz (majburiy)
   - `GROQ_MODEL` = ixtiyoriy (default: `llama-3.3-70b-versatile`)
3. Deploy qiling. Build: `npm run build`, publish: `dist`.

## Lokal ishga tushirish
```
npm install
cp .env.example .env   # GROQ_API_KEY ni yozing
npm run dev
```
