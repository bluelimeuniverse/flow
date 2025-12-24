
import nodemailer from 'nodemailer';

async function testSMTP() {
    console.log("🚀 Avvio Test SMTP con PASSWORD REALE...");

    const transporter = nodemailer.createTransport({
        host: 'mail.bluelimeflow.com',
        port: 587,
        secure: false,
        auth: {
            user: 'testmail@bluelimeflow.com',
            pass: 'Bluelime26@'
        },
        tls: {
            rejectUnauthorized: false
        },
        logger: true,
        debug: false
    });

    try {
        console.log("🔌 Connessione e Autenticazione...");
        await transporter.verify();
        console.log("✅ AUTENTICAZIONE RIUSCITA! Le credenziali sono corrette.");

        console.log("📧 Invio mail di prova a un indirizzo esterno...");
        const info = await transporter.sendMail({
            from: '"Test Sender" <testmail@bluelimeflow.com>',
            to: 'smartlemon.net@gmail.com',
            subject: 'Test Finale SMTP Bluelime',
            text: 'Se leggi questo, il server invia correttamente e le credenziali sono OK.'
        });

        console.log("📨 Mail Inviata con successo!");
        console.log("🆔 Message ID:", info.messageId);
        console.log("📝 Risposta Server:", info.response);

    } catch (error) {
        console.error("❌ ERRORE:", error.message);
        if (error.response) console.error("📝 Risposta Server:", error.response);
    }
}

testSMTP();
