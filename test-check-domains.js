
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// Simple auth mock if needed, or just rely on server structure.
// Note: server requires Auth. We need a token?
// The previous test script had a placeholder for token but didn't actually generate one. 
// However, the previous 400 response for 'register' implies the auth middleware might be skipped or accepting empty?
// Wait, 'requireAuth' is used in server.js.
// If I don't provide a valid token, I should get 401. 
// If the user is getting "nothing", maybe it's 401?
// But the browser usually has the session.

// Let's verify if the server is responding to check at all.
// I'll assume I need a valid token to test properly, BUT checking if it returns 401 vs 500 is valuable.
// If it returns 500, that's a crash.

async function testAvailability() {
    console.log("🚀 Testing Availability Endpoint...");
    try {
        const res = await fetch('http://localhost:4005/api/domains/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': 'Bearer ...' // Intentionally omitted to see if we get 401 or crash
            },
            body: JSON.stringify({
                domains: ['google.com', 'bluelime-test-123.com'],
                tlds: ['com']
            })
        });

        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log(`Body: ${text.substring(0, 500)}`); // Print first 500 chars

    } catch (e) {
        console.error("Connection error:", e);
    }
}

testAvailability();
