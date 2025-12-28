import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const baseUrl = 'https://spaceship.dev/api/v1';
const apiKey = process.env.SPACESHIP_API_KEY;
const apiSecret = process.env.SPACESHIP_API_SECRET;

const headers = { 'Content-Type': 'application/json', 'X-Api-Key': apiKey, 'X-Api-Secret': apiSecret };

async function testTlds() {
    console.log("🔍 Probing TLDs...");
    try {
        // Try to get TLD list which often has prices
        const res = await fetch(`${baseUrl}/domains/tlds`, { headers });
        if (res.ok) {
            const data = await res.json();
            console.log("✅ GET /domains/tlds SUCCESS. Sample:", JSON.stringify(data).slice(0, 500));
        } else {
            console.log(`❌ GET /domains/tlds FAILED: ${res.status}`);
        }
    } catch (e) { console.error(e); }
}

testTlds();
