const fs = require("fs");

function saveData(law, data) {

    fs.mkdirSync(
        `output/${law}`,
        { recursive: true }
    );

    fs.writeFileSync(
        `output/${law}/${law}_articles.json`,
        JSON.stringify(data, null, 2)
    );
}

module.exports = { saveData };