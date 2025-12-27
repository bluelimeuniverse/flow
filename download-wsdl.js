
import fs from 'fs';
import fetch from 'node-fetch';

async function downloadWsdl() {
    console.log("📥 Downloading WSDL...");
    try {
        const response = await fetch('https://whmcs.domainnameapi.com/DomainApi.svc?singlewsdl');
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const wsdl = await response.text();
        fs.writeFileSync('domainApi.wsdl', wsdl);
        console.log("✅ WSDL saved to domainApi.wsdl");
    } catch (error) {
        console.error("❌ Download Failed:", error);
    }
}

downloadWsdl();
