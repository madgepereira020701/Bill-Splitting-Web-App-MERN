require("dotenv").config();
const express = require("express");
const axios = require("axios");

const router = express.Router();
const TOGETHER_API_KEY =
  "eaa47adbd11c3f67a99ccb12bb3bfba8ae7c8f4229f329d1bc9d1b0ca8d5d7bb";

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
      "bayar",
      "jumlar",
      "cash",
      "pay",
      "change",
      "tip",
      "edc",
      "subttl",
      "pb1",
      "@",
      "dine in total",
      "svc chg",
      "tunai",
      "kembali",
      "pembulatan",
      "price number",
      "discount",
      "balance",
      "100%",
      "@price",
    ];

    return Array.isArray(parsed)
      ? parsed.filter(
          (p) =>
            p &&
            typeof p.item === "string" &&
            p.item.trim() !== "" &&
            !isNaN(parseFloat(p.price)) &&
            !ignoredKeywords.some((word) => p.item.toLowerCase().includes(word))
        )
      : [];
  } catch (err) {
    console.error("JSON parse error:", err.message);
    return [];
  }
}

router.post("/scan", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "No image provided" });
    console.log("Image is recieved");

    const ocrResponse = await axios.post(
      "https://api.together.xyz/v1/chat/completions",
      {
        model: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an OCR system. Read the receipt image and return ONLY the plain text of the receipt, with no explanations or formatting. Keep all numbers and product names intact.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 512,
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const ocrText =
      ocrResponse.data?.choices?.[0]?.message?.content?.trim() || "";

    if (!ocrText) {
      return res.status(500).json({ error: "OCR failed to extract text" });
    }
    console.log("Successful");

    const jsonResponse = await axios.post(
      "https://api.together.xyz/v1/chat/completions",
      {
        model: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a strict JSON formatter.  
From the following receipt text, extract ONLY product names and numeric prices.  
Output a VALID JSON array.  
Each object must have:
- "item": string (product name only, if it has X2 or X(any number) it should multiply the cost of that product with that number,no @, %, no number except those with X, its shouldn't be a word before percentage,etc.)

- "price": number (no currency symbols)
No explanations. No markdown. No extra text.

Receipt text:
${ocrText}
`,
              },
            ],
          },
        ],
        max_tokens: 512,
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("JSON Response recived");

    const modelText = jsonResponse.data?.choices?.[0]?.message?.content || "[]";

    const parsedData = safeJSONParse(modelText);

    const totalAmount = parsedData.reduce(
      (sum, item) => sum + (parseFloat(item.price) || 0),
      0
    );

    console.log("Extracted items:");
    parsedData.forEach((item, i) => {
      console.log(` ${i + 1}.${item.item} - ₹${item.price}`);
    });

    res.json({
      items: parsedData,
      total: totalAmount,
    });
  } catch (error) {
    console.error("OCR error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to scan receipt",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;
