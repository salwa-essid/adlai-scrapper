const axios = require('axios');
const https = require('https');
const { parsePdf } = require('./scr/parsers/pdfParser');

const agent = new https.Agent({ rejectUnauthorized: false });

async function test() {
    const res = await axios.get(
        'https://sdaia.gov.sa/en/SDAIA/about/Documents/Personal%20Data%20English%20V2-23April2023-%20Reviewed-.pdf',
        { httpsAgent: agent, responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    const text = await parsePdf(Buffer.from(res.data));
    const lines = text.split('\n').filter(l => l.match(/Article|المادة/i));
    console.log("LENGTH:", text.length);
    console.log("LINES:", lines.slice(0, 15));
}

test().catch(console.error);