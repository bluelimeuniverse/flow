
import { domainApi } from './src/lib/domainNameApi.js';
import fs from 'fs';

async function verifyRealData() {
    console.log("🕵️‍♂️ Starting Truth Verification Test...");

    const takenDomain = "google";
    const availableDomain = "bluelime-verification-" + Math.floor(Math.random() * 10000);

    console.log(`1️⃣ Checking Known TAKEN Domain: ${takenDomain}.com`);
    console.log(`2️⃣ Checking Known AVAILABLE Domain: ${availableDomain}.com`);

    try {
        // We need to modify the library temporarily or catch the raw logs?
        // Actually, let's just use the public method and print the result.
        // If 'google.com' comes back as 'available', we know it's fake/broken.

        const results = await domainApi.checkAvailability([takenDomain, availableDomain], ['com']);

        console.log("\n📊 API RESULTS:");
        console.log(JSON.stringify(results, null, 2));
        fs.writeFileSync('verification_result.json', JSON.stringify(results, null, 2));

        const googleResult = results.find(r => r.domain === takenDomain);
        const freeResult = results.find(r => r.domain === availableDomain);

        if (googleResult && googleResult.status !== 'available') {
            console.log("\n✅ TRUTH CHECK PASS: google.com is NOT available.");
        } else {
            console.error("\n❌ TRUTH CHECK FAIL: API says google.com is available! (Suspicious)");
        }

        if (freeResult && freeResult.status === 'available') {
            console.log("✅ TRUTH CHECK PASS: random domain is available.");
        } else {
            console.error("❌ TRUTH CHECK FAIL: random domain is NOT available!");
        }

    } catch (error) {
        console.error("❌ CRITICAL ERROR:", error);
    }
}

verifyRealData();
