
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

class DomainNameApi {
    constructor() {
        this.username = process.env.DOMAIN_NAME_API_USER;
        this.password = process.env.DOMAIN_NAME_API_PASS;
        this.apiUrl = 'https://whmcs.domainnameapi.com/DomainApi.svc';
    }


    /**
     * Helper to create the SOAP Envelope
     */
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


    /**
     * Helper to send request
     */
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

            if (!response.ok) {
                console.error(`❌ API Error (${response.status}):`, text);
                throw new Error(`API HTTP Error: ${response.status}`);
            }

            return text;
        } catch (error) {
            console.error("❌ Network Error:", error.message);
            throw error;
        }
    }

    /**
     * Get Reseller Details (Login Check)
     */
    async getResellerDetails() {
        const body = `<dom:Command>GetResellerDetails</dom:Command>`;
        // Note: The PHP code calls GetResellerDetails but the parameters might be slightly different in the wrapper.
        // Let's look at the PHP 'GetResellerDetails' implementation:
        // It passes 'CurrencyId'. 
        // Let's try a simpler call or stick to the WSDL definition if possible.
        // Actually, let's try a direct CheckAvailability first as it's the main goal, or just a simple ping.
        // The PHP code uses `GetResellerDetails` with `CurrencyId`.

        const soapBody = `
            <dom:CurrencyId>2</dom:CurrencyId>
        `; // 2 = USD

        return await this.sendRequest('GetResellerDetails', soapBody);
    }

    /**
     * Check Domain Availability
     * @param {string} domain - e.g. "example"
     * @param {string[]} tlds - e.g. ["com", "net"]
     */

    /**
     * Check Domain Availability
     * @param {string} domain - e.g. "example"
     * @param {string[]} tlds - e.g. ["com", "net"]
     */
    async checkAvailability(domains, tlds) {
        // Ensure tlds don't have dots
        const cleanTlds = tlds.map(t => t.replace(/^\./, ''));
        const tldString = cleanTlds.map(t => `<arr:string>${t}</arr:string>`).join('');

        // Handle single or array input for domains
        const domainArray = Array.isArray(domains) ? domains : [domains];
        const domainString = domainArray.map(d => `<arr:string>${d}</arr:string>`).join('');

        // Command 'create' checks availability for new registration
        const body = `
            <dom:Command>create</dom:Command>
            <dom:DomainNameList>
                ${domainString}
            </dom:DomainNameList>
            <dom:Period>1</dom:Period>
            <dom:TldList>
                ${tldString}
            </dom:TldList>
        `;

        const responseXml = await this.sendRequest('CheckAvailability', body);
        return this.parseAvailabilityResponse(responseXml);
    }

    /**
     * Parse Availability Response (Helper)
     * Because parsing XML in JS without a heavy library can be verbose, we use regex for this specific structure.
     */
    parseAvailabilityResponse(xml) {
        const matches = [];
        // Regex to find DomainAvailabilityInfo blocks
        // This is a simplified parser. For production, use 'xml2js' or similar if structure is complex.
        // Pattern: <DomainName>name</DomainName>...<Status>available</Status>...<Price>10.0</Price>

        // Regex to find DomainAvailabilityInfo blocks (handling unknown namespace prefixes)
        // matches <b:DomainAvailabilityInfo> ... </b:DomainAvailabilityInfo>
        const blockRegex = /<[a-z0-9]+:DomainAvailabilityInfo>([\s\S]*?)<\/[a-z0-9]+:DomainAvailabilityInfo>/gi;
        const blocks = xml.match(blockRegex) || [];

        for (const part of blocks) {
            const domainMatch = part.match(/:DomainName>(.*?)<\//);
            const tldMatch = part.match(/:Tld>(.*?)<\//);
            // Regex matches <Status> <b:Status> <Status xmlns="...">
            const statusMatch = part.match(/<[a-zA-Z0-9:]*Status.*?>(.*?)<\/[a-zA-Z0-9:]*Status>/);
            const priceMatch = part.match(/:Price>(.*?)<\//);
            const currencyMatch = part.match(/:Currency>(.*?)<\//);

            // Helper to clean status (it might have attributes in the tag)
            let status = 'unknown';
            if (statusMatch) status = statusMatch[1];

            if (domainMatch && status !== 'unknown') {
                matches.push({
                    domain: domainMatch[1],
                    tld: tldMatch ? tldMatch[1] : '',
                    status: status,
                    price: priceMatch ? parseFloat(priceMatch[1]) : 0,
                    currency: currencyMatch ? currencyMatch[1] : 'USD',
                    available: status === 'available'
                });
            }
        }
        return matches;
    }

    /**
     * Register Domain
     * @param {string} domain - Full domain e.g. "example.com"
     * @param {object} contact - { firstName, lastName, email, phone, ... }
     * @param {string[]} nameservers - ["ns1.example.com", "ns2.example.com"]
     */
    async registerDomain(domain, contact, nameservers) {
        const contactXml = this.createContactXml(contact);
        const nsXml = nameservers.map(ns => `<dom:string>${ns}</dom:string>`).join('');

        const body = `
            <dom:AdministrativeContact>${contactXml}</dom:AdministrativeContact>
            <dom:BillingContact>${contactXml}</dom:BillingContact>
            <dom:DomainName>${domain}</dom:DomainName>
            <dom:LockStatus>true</dom:LockStatus>
            <dom:NameServerList>${nsXml}</dom:NameServerList>
            <dom:Period>1</dom:Period>
            <dom:PrivacyProtectionStatus>false</dom:PrivacyProtectionStatus>
            <dom:RegistrantContact>${contactXml}</dom:RegistrantContact>
            <dom:TechnicalContact>${contactXml}</dom:TechnicalContact>
        `;

        // Add TR extension logic if needed (skipped for now as per user request for generic)

        return await this.sendRequest('RegisterWithContactInfo', body);
    }

    createContactXml(c) {
        return `
            <dom:AddressLine1>${c.address || 'Street 1'}</dom:AddressLine1>
            <dom:City>${c.city || 'City'}</dom:City>
            <dom:Company>${c.company || ''}</dom:Company>
            <dom:Country>${c.country || 'US'}</dom:Country>
            <dom:Email>${c.email}</dom:Email>
            <dom:Fax></dom:Fax>
            <dom:FirstName>${c.firstName}</dom:FirstName>
            <dom:LastName>${c.lastName}</dom:LastName>
            <dom:Phone>${c.phone || '+1.5555555555'}</dom:Phone>
            <dom:State>${c.state || 'NY'}</dom:State>
            <dom:Type>0</dom:Type>
            <dom:ZipCode>${c.zip || '10001'}</dom:ZipCode>
        `;
    }
}

export const domainApi = new DomainNameApi();

