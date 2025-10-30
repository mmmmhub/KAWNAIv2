// api/generate.js
import { genai } from "@google/genai";  // استخدام مكتبة Google GenAI SDK

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests are allowed." });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured on server." });
    }

    // تهيئة العميل مع المفتاح
    genai.configure({ apiKey });

    const { prompt } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt in request body." });
    }

    // استدعاء النموذج
    const response = await genai.models.generate_content({
      model: "gemini-2.5-flash-image-preview",  // الاسم الرسمي للنموذج
      contents: [prompt]
    });

    // البحث عن جزء الصورة في الاستجابة
    const candidate = response?.candidates?.[0];
    if (!candidate) {
      throw new Error("No candidate returned.");
    }

    const parts = candidate.content.parts;
    const inlinePart = parts.find(p => p.inline_data);
    if (!inlinePart) {
      throw new Error("No inline_data (image) in response.");
    }

    // المحوّل من Base64 البيانات إلى صورة
    const imageBase64 = inlinePart.inline_data.data;  // هذا يمثل الصورة في ترميز base64
    const mimeType = inlinePart.inline_data.mime_type || "image/png";

    // نرسلها كـ base64 أو رابط حسب ما تريد
    return res.status(200).json({
      success: true,
      image: `data:${mimeType};base64,${imageBase64}`
    });

  } catch (err) {
    console.error("Error generating image:", err);
    return res.status(500).json({ success: false, error: err.message || "Internal server error." });
  }
}
