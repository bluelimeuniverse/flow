import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const baseUrl = 'https://spaceship.dev/api/v1';
const apiKey = process.env.SPACESHIP_API_KEY;
const apiSecret = process.env.SPACESHIP_API_SECRET;

const headers = {
    'Content-Type': 'application/json',
    'X-Api-Key': apiKey,
    'X-Api-Secret': apiSecret
};

async function testPricing() {
    console.log("🔍 Probing Pricing Endpoints...");

    // Test 1: GET /domains/prices (Common guess)
    try {
        console.log("Testing GET /domains/prices...");
        const res = await fetch(`${baseUrl}/domains/prices`, { headers });
        if (res.ok) {
            const data = await res.json();
            console.log("✅ GET /domains/prices SUCCESS:", JSON.stringify(data).slice(0, 200) + "...");
        } else {
            console.log(`❌ GET /domains/prices FAILED: ${res.status}`);
        }
    } catch (e) {
        console.error(e.message);
    }

    // Test 2: Check availability with specific price request?
    // Some APIs allow "includes: ['price']"
    try {
        console.log("\nTesting POST /domains/available (Detailed)...");
        const res = await fetch(`${baseUrl}/domains/available`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                domains: ["test-cheap.online", "test-expensive.com"]
            })
        });
        const data = await res.json();
        console.log("📦 Availability Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e.message);
    }
}

testPricing();
