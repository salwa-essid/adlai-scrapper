let state = {
    status: "idle",
    startedAt: null,
    finishedAt: null,
    totalArticles: 0
};

function setStatus(update) {
    state = { ...state, ...update };
}

function getStatus() {
    return state;
}

module.exports = { setStatus, getStatus };