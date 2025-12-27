
import { domainApi } from './src/lib/domainNameApi.js';
import fs from 'fs';

async function testAvailability() {
    console.log("🚀 Testing Domain Availability...");
    const domain = "bluelime-test-" + Math.floor(Math.random() * 1000);
    try {
        console.log(`Checking ${domain}...`);
        const xml = await domainApi.checkAvailability(domain, ["com", "net"]);

        fs.writeFileSync('availability_debug.xml', xml);
        console.log("📄 Saved XML to availability_debug.xml");

        const results = domainApi.parseAvailabilityResponse(xml);
        console.log("Parsed Results:", JSON.stringify(results, null, 2));

        if (results.length > 0) {
            console.log("✅ SUCCESS: Parsed availability response correctly.");
        } else {
            console.log("❌ FAILURE: Could not parse response.");
        }

    } catch (error) {
        console.error("❌ TEST FAILED:", error);
    }
}

testAvailability();
