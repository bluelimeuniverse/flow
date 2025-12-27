
import { domainApi } from './src/lib/domainNameApi.js';

async function testConnection() {
    console.log("🚀 Testing DomainNameAPI Connection...");
    try {
        const response = await domainApi.getResellerDetails();

        const fs = await import('fs');
        fs.writeFileSync('api_debug_log.txt', response);
        console.log("📄 Response saved to api_debug_log.txt");

        if (response.includes("ResellerInfo") && (response.includes("Active") || response.includes("true"))) {
            console.log("✅ SUCCESS: Connected to DomainNameAPI!");
            console.log("Response snippet:", response.slice(0, 200));

            console.log("✅ SUCCESS: Connected to DomainNameAPI!");
        } else if (response.includes("Invalid username and password")) {
            console.log("❌ AUTH ERROR: Check Username/Password.");
        } else if (response.includes("IP address is not allowed")) {
            console.log("❌ IP ERROR: This IP is not whitelisted.");
        } else {
            console.log("⚠️  UNKNOWN RESPONSE: Review XML output.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error);
    }
}

testConnection();
