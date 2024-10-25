const axios = require('axios');

// Function to introduce a delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function makeRequests() {
    for (let i = 0; i < 900; i++) {
        try {
            const response = await axios.get("http://192.168.183.236:3000/f4PMc");
            console.log(`Request ${i + 1} succeeded`);
        } catch (error) {
            console.error(`Request ${i + 1} failed:`, error.message);
        }
        await delay(1000); // 1 second delay between each request
    }
}

makeRequests();
