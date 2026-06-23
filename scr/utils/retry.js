async function retry(fn, retries = 3) {

    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError;
}

module.exports = { retry };