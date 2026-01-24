require("dotenv").config();
const express = require("express");
const Tesseract = require("tesseract.js");
const OpenAI = require("openai");

const router = express.Router();

/* ---------- OpenAI Client ---------- */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ---------- Safe JSON Parser ---------- */
function safeJSONParse(text) {
  if (!text) return [];

  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);

    const ignoredKeywords = [
      "subtotal",
      "total",
      "tax",
      "cash",
      "pay",
      "change",
      "discount",
      "balance",
      "round",
      "tip",
      "@",
      "%",
    ];

    return Array.isArray(parsed)
      ? parsed.filter(
          (p) =>
            p &&
            typeof p.item === "string" &&
            p.item.trim() !== "" &&
            !isNaN(parseFloat(p.price)) &&
            !ignoredKeywords.some((w) => p.item.toLowerCase().includes(w)),
        )
      : [];
  } catch (err) {
    console.error("JSON parse error:", err.message);
    return [];
  }
}

/* ---------- SCAN ROUTE ---------- */
router.post("/scan", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    console.log("Image received");

    /* ---------- OCR USING TESSERACT ---------- */
    const buffer = Buffer.from(image, "base64");

    const {
      data: { text: ocrText },
    } = await Tesseract.recognize(buffer, "eng", {
      logger: (m) => console.log(m.status),
    });

    if (!ocrText || !ocrText.trim()) {
      return res.status(500).json({ error: "OCR failed" });
    }

    console.log("OCR successful");

    /* ---------- AI PARSING USING OPENAI ---------- */
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: "You extract structured data from receipt text.",
        },
        {
          role: "user",
          content: `Extract ONLY product names and numeric prices from this receipt text.

Return a VALID JSON ARRAY.
Each object must have:
- "item": string (product name only)
- "price": number (no currency symbol)

Rules:
- Ignore totals, tax, discounts, payments
- If quantity like X2 exists, multiply price
- No explanations
- No markdown

Receipt text:
${ocrText}`,
        },
      ],
    });

    const modelText = completion.choices[0].message.content || "[]";

    const parsedData = safeJSONParse(modelText);

    const totalAmount = parsedData.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0,
    );

    console.log("Extracted items:");
    parsedData.forEach((item, i) => {
      console.log(`${i + 1}. ${item.item} - ₹${item.price}`);
    });

    res.json({
      items: parsedData,
      total: totalAmount,
    });
  } catch (error) {
    console.error("Scan error:", error.message);
    res.status(500).json({
      error: "Failed to scan receipt",
    });
  }
});

module.exports = router;
