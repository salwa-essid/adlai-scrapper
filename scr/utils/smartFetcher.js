const { axiosFetch } = require("../fetchers/axiosFetcher");
const { playwrightFetch } = require("../fetchers/playwrightFetcher");

async function smartFetch(url) {

    console.log("Fetching:", url);

    const html = await axiosFetch(url);

    if (html && html.length > 2000) {
        console.log("Axios success");
        return html;
    }

    console.log("Using Playwright fallback");

    return await playwrightFetch(url);
}

module.exports = { smartFetch };