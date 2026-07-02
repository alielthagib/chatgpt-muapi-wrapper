const MUAPI_BASE_URL = "https://api.muapi.ai/api/v1";

const MODEL_ENDPOINTS = {
  "flux-schnell": "flux-schnell-image",
  "nano-banana-pro": "nano-banana-pro"
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed. Use POST."
      });
    }

    const actionKey = req.headers["x-chatgpt-action-key"];

    if (actionKey !== process.env.CHATGPT_ACTION_KEY) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    const {
      prompt,
      model = "flux-schnell",
      aspect_ratio = "1:1"
    } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required"
      });
    }

    const endpoint = MODEL_ENDPOINTS[model];

    if (!endpoint) {
      return res.status(400).json({
        error: `Unsupported model: ${model}`
      });
    }

    const muapiResponse = await fetch(`${MUAPI_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.MUAPI_API_KEY
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio
      })
    });

    const data = await muapiResponse.json();

    if (!muapiResponse.ok) {
      return res.status(muapiResponse.status).json({
        error: "MuAPI request failed",
        details: data
      });
    }

    return res.status(200).json({
      status: "submitted",
      request_id: data.request_id || data.id,
      raw: data
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unknown server error"
    });
  }
}
