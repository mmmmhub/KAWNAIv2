// api/generate.js
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests are allowed." });
    }

    const apiKey = process.env.NANONB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "API key is not configured on the server."
      });
    }

    const { prompt } = await req.json?.() || req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt parameter." });
    }

    const response = await fetch("https://api.nanonb.ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        model: "realistic-vision-v6",
        width: 512,
        height: 512,
        steps: 30,
        cfg_scale: 7
      })
    });

    const data = await response.json();

    if (!response.ok || !data.image) {
      throw new Error(data.message || "Failed to generate image.");
    }

    res.status(200).json({
      success: true,
      image: data.image
    });

  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error."
    });
  }
}
