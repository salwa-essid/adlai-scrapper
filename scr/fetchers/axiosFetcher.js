
const axios = require("axios");

async function axiosFetch(url) {

    try {

        const response = await axios.get(url, {
            timeout: process.env.CRAWLER_TIMEOUT,
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });


        return response.data;

    } catch {
        return null;
    }
}

module.exports = { axiosFetch };