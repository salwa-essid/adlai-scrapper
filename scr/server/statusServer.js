const express = require("express");

const app = express();

function startServer() {

    app.get("/status", (_, res) => {

        res.json({
            status: "running"
        });
    });

    app.listen(
        process.env.PORT,
        () => {
            console.log(
                `Server running on ${process.env.PORT}`
            );
        }
    );
}

module.exports = { startServer };