
import fetch from 'node-fetch';

const configs = [
    { user: 'bluelime2026', pass: 'Mattia06@' },
    { user: '2020265949', pass: 'Mattia06@' },
    { user: 'DNA--2020265949', pass: 'Mattia06@' },
    { user: 'DNA-2020265949', pass: 'Mattia06@' }, // Variation
    { user: 'bluelime2026', pass: 'lillo' } // Just in case security phrase matters differently
];

async function testAuth(user, pass) {
    const soapAction = `http://tempuri.org/IDomainApi/GetResellerDetails`;
    const body = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:core="http://schemas.datacontract.org/2004/07/Olipso.Core.DataContracts">
        <soapenv:Header/>
        <soapenv:Body>
            <tem:GetResellerDetails>
                <tem:request>
                    <core:Password>${pass}</core:Password>
                    <core:UserName>${user}</core:UserName>
                </tem:request>
            </tem:GetResellerDetails>
        </soapenv:Body>
    </soapenv:Envelope>`;

    try {
        const response = await fetch('https://whmcs.domainnameapi.com/DomainApi.svc', {
            method: 'POST',
            headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': soapAction },
            body: body
        });
        const text = await response.text();

        let status = "UNKNOWN";
        if (text.includes('Reseller not found')) status = "RESELLER_NOT_FOUND";
        else if (text.includes('Invalid username and password')) status = "INVALID_CREDENTIALS";
        else if (text.includes('ResellerInfo')) status = "SUCCESS";
        else if (text.includes('<ErrorCode>0</ErrorCode>')) status = "SUCCESS_MAYBE";
        else status = "OTHER_ERROR";

        console.log(`[TEST] User='${user}' Pass='${pass}' -> ${status}`);

    } catch (e) {
        console.error(`[TEST] User='${user}' -> Network Error:`, e.message);
    }
}

async function run() {
    console.log("--- STARTING AUTH VARIANTS TEST ---");
    // Configs to test
    // 1. Panel user (bluelime2026)
    await testAuth('bluelime2026', 'Mattia06@');

    // 2. Numeric ID (2020265949)
    await testAuth('2020265949', 'Mattia06@');

    // 3. DNA-- format (Double Dash as seen in screenshot)
    await testAuth('DNA--2020265949', 'Mattia06@');

    // 4. Email (assume from screenshot context or generic check, usually it is the login email)
    // We don't have the explicit email. User said "fatto" regarding email change.
    // Let's assume they put it in .env, so let's read it from process.env if possible, or just skip.
    // But better, let's try the DNA format
    await testAuth('DNA-2020265949', 'Mattia06@');

    console.log("--- FINISHED ---");
}

run();
