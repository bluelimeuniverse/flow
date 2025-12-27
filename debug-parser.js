
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

class DomainNameApi {
    constructor() {
        this.username = process.env.DOMAIN_NAME_API_USER;
        this.password = process.env.DOMAIN_NAME_API_PASS;
        this.apiUrl = 'https://whmcs.domainnameapi.com/DomainApi.svc';
        // this.apiUrl = 'https://ote-api.domainnameapi.com/DomainApi.svc';
    }

    createSoapEnvelope(action, body) {
        return `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:dom="http://schemas.datacontract.org/2004/07/Olipso.ExternalApi.Core.DataContracts.DomainApiContracts" xmlns:core="http://schemas.datacontract.org/2004/07/Olipso.Core.DataContracts" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
            <soapenv:Header/>
            <soapenv:Body>
                <tem:${action}>
                    <tem:request>
                        <core:Password>${this.password}</core:Password>
                        <core:UserName>${this.username}</core:UserName>
                        ${body}
                    </tem:request>
                </tem:${action}>
            </soapenv:Body>
        </soapenv:Envelope>`;
    }

    async sendRequest(action, body) {
        const soapAction = `http://tempuri.org/IDomainApi/${action}`;
        const envelope = this.createSoapEnvelope(action, body);
        console.log(`📡 Sending SOAP Action: ${action}`);

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': soapAction
                },
                body: envelope
            });

            const text = await response.text();
            console.log("⬇️ RAW RESPONZE XML (Written to last_response.xml)");

            // Check if we can write to fs
            const fs = await import('fs');
            fs.writeFileSync('sender/last_response.xml', text);

            return text;
        } catch (error) {
            console.error("❌ Network Error:", error.message);
            throw error;
        }
    }

    async checkAvailability() {
        // We'll test GetResellerDetails instead
        const body = `
           <!-- No extra body params needed for basic check, or maybe CurrencyId -->
       `;
        // Using GetResellerDetails action
        await this.sendRequest('GetResellerDetails', body);
    }
}

const api = new DomainNameApi();
api.checkAvailability(); // This calls GetResellerDetails now

