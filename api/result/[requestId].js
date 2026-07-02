const MUAPI_BASE_URL = "https://api.muapi.ai/api/v1";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        error: "Method not allowed. Use GET."
      });
    }

    const actionKey = req.headers["x-chatgpt-action-key"];

    if (actionKey !== process.env.CHATGPT_ACTION_KEY) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    const { requestId } = req.query;

    if (!requestId) {
      return res.status(400).json({
        error: "requestId is required"
      });
    }

    const muapiResponse = await fetch(
      `${MUAPI_BASE_URL}/predictions/${requestId}/result`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.MUAPI_API_KEY
        }
      }
    );

    const data = await muapiResponse.json();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unknown server error"
    });
  }
}
