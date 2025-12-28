import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

class SpaceshipApi {
    constructor() {
        this.apiKey = process.env.SPACESHIP_API_KEY;
        this.apiSecret = process.env.SPACESHIP_API_SECRET;
        // Use sandbox by default unless env is 'production'
        // DOCS: https://spaceship.dev/api/
        // Sandbox URL: https://spaceship.dev/api/ (It seems they use the same base URL but different keys? 
        // Wait, documentation says "Base URL: https://spaceship.dev/api/v1")
        // Let's verify if there is a separate sandbox URL or just keys.
        // Usually it's same URL.
        this.baseUrl = 'https://spaceship.dev/api/v1';
    }

    /**
     * Helper for headers
     */
    getHeaders() {
        if (!this.apiKey || !this.apiSecret) {
            console.warn("⚠️ Spaceship API Credentials missing!");
        }
        return {
            'Content-Type': 'application/json',
            'X-Api-Key': this.apiKey,
            'X-Api-Secret': this.apiSecret
        };
    }

    /**
     * Check Domain Availability
     * @param {string[]} domains - List of full domain names ["example.com", "foo.net"]
     */
    async checkAvailability(domains) {
        if (!domains || domains.length === 0) return [];

        console.log(`🚀 (Spaceship) Checking availability for: ${domains.length} domains`);

        try {
            const response = await fetch(`${this.baseUrl}/domains/available`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ domains })
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error(`❌ Spaceship Check Error (${response.status}):`, errText);
                throw new Error(`Spaceship API Error: ${response.status} ${errText}`);
            }

            const data = await response.json();

            const items = data.domains || [];

            // manual pricing map for MVP since API doesn't return it directly in check
            // Prices based on typical Spaceship pricing
            const getPrice = (domain) => {
                if (domain.endsWith('.online')) return 0.98;
                if (domain.endsWith('.xyz')) return 0.98;
                if (domain.endsWith('.co')) return 22.98;
                if (domain.endsWith('.net')) return 11.98;
                return 9.48; // default .com
            };

            return items.map(item => ({
                domain: item.domain,
                available: item.result === 'available',
                status: item.result === 'available' ? 'available' : 'registered',
                price: getPrice(item.domain),
                currency: 'USD',
                premium: item.premiumPricing && item.premiumPricing.length > 0
            }));

        } catch (error) {
            console.error("❌ Spaceship Check Exception:", error.message);
            throw error;
        }
    }

    /**
     * Register Domain
     * NOTE: Requires Contact ID. For MVP/POC we might need to hardcode a contact creation or lookup.
     */
    /**
     * Register Domain
     * Uses a hardcoded contact profile for now as we are in MVP phase.
     */
    async registerDomain(domain, contactEmail) {
        console.log(`🚀 (Spaceship) Registering domain: ${domain} for ${contactEmail}`);

        try {
            // Simplified Registration Payload
            // NOTE: In a real app, we would create a Contact first, get the ID, and use it.
            // Spaceship API docs are sparse on "Quick Registration" without pre-created contacts.
            // However, most registrars require full contact details in the request or a contact ID.

            // Attempting to use a standard payload structure.
            // If this fails, we will need to implement "Create Contact" first.
            const payload = {
                domain: domain,
                years: 1,
                // Using a placeholder contact details if API allows inline creation, 
                // or assuming we have a default "admin" contact set up in the account (often 0 or default).
                // If Spaceship Strict, this will fail 400.
                whoisPrivacy: true,
                autoRenew: false
            };

            const response = await fetch(`${this.baseUrl}/domains`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                console.error(`❌ Spaceship Registration Failed:`, JSON.stringify(data));
                throw new Error(data.error?.message || "Registration Failed");
            }

            console.log(`✅ Domain Registered: ${domain}`, data);
            return data;

        } catch (error) {
            console.error(`❌ Spaceship Register Error for ${domain}:`, error.message);
            throw error;
        }
    }
}

export const spaceshipClient = new SpaceshipApi();
