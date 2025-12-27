
import fetch from 'node-fetch';
import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const MAILCOW_API_URL = process.env.MAILCOW_API_URL || 'https://mail.bluelimeflow.com/api/v1';
const MAILCOW_API_TOKEN = process.env.MAILCOW_API_KEY;

const agent = new https.Agent({
    rejectUnauthorized: false // Ignore self-signed or invalid certs
});

async function getDkim(domain) {
    console.log(`🔍 Checking DKIM for ${domain} at ${MAILCOW_API_URL}...`);
    try {
        const res = await fetch(`${MAILCOW_API_URL}/get/domain/${domain}`, {
            headers: { 'X-API-Key': MAILCOW_API_TOKEN },
            agent: agent,
            timeout: 10000 // 10s timeout
        });

        if (res.ok) {
            const data = await res.json();
            // console.log("Domain Data:", JSON.stringify(data, null, 2));
            // Assuming data is standard Mailcow: 
            // { dkim_public_key: "...", ... } or inside an object
            console.log("DKIM Key Found:", data.dkim_public_key ? "YES" : "NO");
            if (data.dkim_public_key) console.log(data.dkim_public_key);
            else console.log(JSON.stringify(data, null, 2));

        } else {
            const txt = await res.text();
            console.log(`Get Domain Failed: ${res.status} - ${txt}`);
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

getDkim('bluelimeflow.com'); 
