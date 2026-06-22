//http fetcher
const axios = require("axios");

async function httpFetcher(source) {
    const res = await axios.get(source.url, {
        timeout: 15000,
        headers: { "User-Agent": "Mozilla/5.0" }
    });

    return res.data;
}

module.exports = { httpFetcher };