const axios = require("axios");

async function smartFetch(url) {
    try {
        const response = await axios.get(url, {
            timeout: 20000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "text/html,application/xhtml+xml",
                "Accept-Language": "en-US,en;q=0.9",
                "Connection": "keep-alive"
            }
        });

        return response.data;

    } catch (err) {
        console.log("FETCH ERROR:", err.message);
        return null;
    }
}

module.exports = { smartFetch };