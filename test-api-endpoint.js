
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase to get a token (if we had env vars, but we might rely on 401 to verify endpoint existence)
// Actually, let's just check if endpoint exists. 401 means it exists and is protected. 404 means it doesn't exist.

async function testEndpoint() {
    console.log("🚀 Testing Registration Endpoint...");

    try {
        const response = await fetch('http://localhost:4005/api/domains/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                domains: ['test-validation.com']
                // Missing contact info to trigger validation error (if auth passes)
            })
        });

        console.log(`Status: ${response.status}`);
        // 404 = Not Found (Server not updated)
        // 401 = Unauthorized (Endpoint exists but needs auth)
        // 400 = Bad Request (Endpoint exists, valid auth, invalid body)
        // 200 = Success (Unlikely here)

        const data = await response.json();
        console.log("Response:", data);

    } catch (error) {
        console.error("❌ Connection Failed:", error.message);
    }
}

testEndpoint();