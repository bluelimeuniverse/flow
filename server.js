import express from 'express';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { spaceshipClient } from './src/lib/spaceship.js';
import Stripe from 'stripe';

// Carica variabili d'ambiente
dotenv.config();

// Compatibilità ES Module per __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors()); // Enable All CORS Requests
const PORT = process.env.PORT || 4001;

// === CONFIGURAZIONE ===
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://phadpdiznnqyponhxksw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoYWRwZGl6bm5xeXBvbmh4a3N3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQyOTk1NiwiZXhwIjoyMDc4MDA1OTU2fQ.EVqp_45T8IWTehYP-46WMpUcCrrrqZ_sGZXcfTiccns';
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET; // REQUIRED for local auth

// Configurazione Mailcow
const MAILCOW_API_URL = process.env.MAILCOW_API_URL || 'https://mail.bluelimeflow.com/api/v1';
const MAILCOW_API_TOKEN = process.env.MAILCOW_API_TOKEN || '1A34E3-9D0934-280A05-63B9C3-E7FC23';
const DEFAULT_DOMAIN = process.env.MAILCOW_DEFAULT_DOMAIN || 'bluelimeflow.com';

// Inizializza Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Serve i file statici della build di React (cartella 'dist')
// Serve i file statici della build di React (cartella 'dist')
const buildPath = path.join(__dirname, 'dist');
app.use(express.static(buildPath)); // Serve tutti i file statici da root
app.use(express.json());

// === LOGGING MIDDLEWARE ===
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// MIDDLEWARE: Autenticazione STRICT (Abilitata per Produzione)
// MIDDLEWARE: Autenticazione (MODIFICATO: PERMISSIVO PER DEBUG)
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. BYPASS PRELIMINARE: Se il token manca o è palesemente non valido (undefined)
  if (!authHeader || authHeader.includes('undefined')) {
    console.warn("⚠️  AUTH BYPASS: Token mancante o undefined. Procedo come utente simulato.");
    req.user = { sub: 'dev-bypass-id', email: 'dev@localhost' };
    return next();
  }

  const token = authHeader.replace('Bearer ', '');

  if (!SUPABASE_JWT_SECRET) {
    console.error("❌ CRITICAL: SUPABASE_JWT_SECRET non impostata!");
    // In dev mode procediamo comunque
    return next();
  }

  try {
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // 2. BYPASS SU ERRORE: Se il token è scaduto o invalido, procedi comunque
    console.warn(`⚠️  AUTH FAIL (Bypassed): ${err.message}. Procedo comunque.`);
    req.user = { sub: 'dev-bypass-error-id', email: 'error-bypass@localhost' };
    next();
  }
};

// === HELPER MAILCOW ===

// Funzione per creare il dominio se non esiste
async function ensureMailcowDomainExists(domain) {
  if (MAILCOW_API_URL.includes('localhost') || !MAILCOW_API_TOKEN) return true; // Skip in dev

  try {
    // 1. Cerca se il dominio esiste già
    const checkResponse = await fetch(`${MAILCOW_API_URL}/get/domain/${domain}`, {
      headers: { 'X-API-Key': MAILCOW_API_TOKEN }
    });

    // Se ritorna i dati del dominio, esiste già
    if (checkResponse.ok) {
      console.log(`✅ Dominio ${domain} già esistente su Mailcow.`);
      return true;
    }

    // 2. Se non esiste, crealo
    console.log(`🔧 Creo nuovo dominio su Mailcow: ${domain}`);
    const createResponse = await fetch(`${MAILCOW_API_URL}/add/domain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': MAILCOW_API_TOKEN
      },
      body: JSON.stringify({
        domain: domain,
        description: "Created via BlueSender App",
        active: 1,
        // Default policy settings
        max_aliases: 400,
        max_mailboxes: 100,
        def_quota: 3072
      })
    });

    const result = await createResponse.json();
    if (result[0]?.type === 'success' || result.type === 'success') {
      console.log(`✅ Dominio ${domain} creato con successo.`);
      return true;
    } else {
      console.error("Errore creazione dominio Mailcow:", result);
      return false;
    }
  } catch (error) {
    console.error("Eccezione controllo dominio:", error);
    return false;
  }
}

async function createMailcowMailbox(localPart, domain, name, password) {
  // Se non c'è URL configurato, simuliamo il successo (modalità dev)
  if (MAILCOW_API_URL.includes('localhost') || !MAILCOW_API_TOKEN) {
    console.log("⚠️  Mailcow API non configurata. Simulazione creazione casella:", `${localPart}@${domain}`);
    return { success: true, simulated: true };
  }

  try {
    // STEP PRELIMINARE: Assicurati che il dominio esista
    await ensureMailcowDomainExists(domain);

    const payload = {
      local_part: localPart,
      domain: domain, // Usa il dominio dinamico passato dal frontend
      name: name,
      password: password,
      password2: password,
      quota: 100, // 100MB per Cold Email Marketing (ottimizzazione risorse)
      active: 1
    };

    console.log("Richiesta Mailcow Payload:", JSON.stringify(payload));

    const response = await fetch(`${MAILCOW_API_URL}/add/mailbox`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': MAILCOW_API_TOKEN
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("Risposta Mailcow:", result);

    if (result[0]?.type === 'success' || result.type === 'success') {
      return { success: true };
    } else {
      throw new Error(JSON.stringify(result));
    }
  } catch (error) {
    console.error("Mailcow API Error:", error);
    throw error;
  }
}

// === API ENDPOINTS ===

app.get('/api/health', (req, res) => {
  res.json({ status: 'online', worker: 'active', default_domain: DEFAULT_DOMAIN });
});

// 1. CREAZIONE CASELLA (Richiamato dal Frontend)
// 1. CREAZIONE CASELLA (Richiamato dal Frontend)
app.post('/api/mailboxes/create', requireAuth, async (req, res) => {
  try {
    const { email, name, password, userId } = req.body;

    // Parsing email: separa user da dominio
    const parts = email.split('@');
    if (parts.length !== 2) throw new Error("Formato email non valido");

    const localPart = parts[0];
    const domain = parts[1];

    console.log(`📝 Richiesta creazione casella: ${email} (Domain: ${domain})`);

    // 1. Crea su Mailcow (Il Server di Posta Reale)
    // La funzione ora gestisce anche la creazione automatica del dominio se manca
    await createMailcowMailbox(localPart, domain, name, password);

    // 2. Salva su Supabase (Il Database dell'App)
    // Nota: Salviamo smtp_host generico mail.DOMAIN o mail.BLUELIME... a seconda della configurazione DNS
    // Per semplicità assumiamo che mail.DOMINIO_CLIENTE punti al nostro server o usiamo il nostro host
    const smtpHost = `mail.${DEFAULT_DOMAIN}`; // Usiamo sempre il nostro server come host SMTP principale

    const { data, error } = await supabase
      .from('mailboxes')
      .insert([{
        email: email,
        name: name,
        smtp_host: smtpHost,
        smtp_user: email,
        smtp_pass: password,
        smtp_port: 587,
        active: true,
        user_id: userId // Opzionale se gestisci multi-utente
      }])
      .select();

    if (error) throw error;

    res.json({ success: true, mailbox: data[0] });

  } catch (error) {
    console.error("Errore creazione:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// === WORKER LOGIC (Background Email Sender) ===
async function processEmailQueue() {
  const { data: queue } = await supabase
    .from('email_queue')
    .select('*, mailboxes(*)')
    .eq('status', 'pending')
    .limit(5);

  if (queue && queue.length > 0) {
    console.log(`📬 [Worker] Elaborazione di ${queue.length} email...`);

    for (const email of queue) {
      try {
        if (!email.mailboxes) throw new Error("Casella mittente mancante");

        const transporter = nodemailer.createTransport({
          host: email.mailboxes.smtp_host,
          port: email.mailboxes.smtp_port,
          secure: email.mailboxes.smtp_port === 465,
          auth: {
            user: email.mailboxes.smtp_user,
            pass: email.mailboxes.smtp_pass,
          },
          tls: { rejectUnauthorized: false }
        });

        const info = await transporter.sendMail({
          from: `"${email.mailboxes.name}" <${email.mailboxes.email}>`,
          to: email.to_email,
          subject: email.subject,
          html: email.body_html,
        });

        console.log(`   ✅ Inviata: ${email.to_email} (ID: ${info.messageId})`);

        await supabase.from('email_queue').update({ status: 'sent', sent_at: new Date() }).eq('id', email.id);
      } catch (err) {
        console.error(`   ❌ Fallita: ${email.to_email}`, err.message);
        await supabase.from('email_queue').update({ status: 'failed', error_message: err.message }).eq('id', email.id);
      }
    }
  }
}

// Realtime subscription - Invia email solo quando vengono aggiunte in coda
const emailQueueChannel = supabase
  .channel('email_queue_changes')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'email_queue' },
    (payload) => {
      console.log('📨 Nuova email in coda rilevata!', payload.new);
      processEmailQueue(); // Processa immediatamente
    }
  )
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('✅ Worker Realtime attivo - in ascolto per nuove email');
    }
  });

// Processa eventuali email già in coda all'avvio
processEmailQueue();

// === WEBMAIL API ===

// Helper: Connessione IMAP
// Helper: Connessione IMAP
function connectIMAP(email, password) {
  console.log(`🔌 Tentativo connessione IMAP per ${email} su ${process.env.SMTP_HOST || 'mail.bluelimeflow.com'}:993`);
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: email,
      password: password,
      host: process.env.SMTP_HOST || 'mail.bluelimeflow.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 10000,
      connTimeout: 10000
    });

    imap.once('ready', () => {
      console.log(`✅ Connessione IMAP Riuscita per ${email}`);
      // DEBUG: Lista cartelle
      imap.getBoxes((err, boxes) => {
        if (!err) {
          const keys = Object.keys(boxes);
          console.log(`📂 Cartelle disponibili per ${email}:`, keys.join(', '));
        }
        resolve(imap);
      });
    });

    imap.once('error', (err) => {
      console.error(`❌ Errore IMAP per ${email}:`, err.message);
      reject(err);
    });

    imap.once('end', () => {
      console.log(`🔌 Connessione IMAP Chiusa per ${email}`);
    });

    imap.connect();
  });
}

// API: Lista cartelle IMAP (DEBUG)
// API: Lista cartelle IMAP (DEBUG)
app.post('/api/webmail/folders', requireAuth, async (req, res) => {
  try {
    const { email, password } = req.body;
    const imap = await connectIMAP(email, password);

    imap.getBoxes((err, boxes) => {
      imap.end();
      if (err) return res.status(500).json({ error: err.message });

      // Estrai nomi cartelle piatte
      const extractFolderNames = (boxes, prefix = '') => {
        let names = [];
        for (const [name, box] of Object.entries(boxes)) {
          const fullName = prefix ? `${prefix}${box.delimiter}${name}` : name;
          names.push(fullName);
          if (box.children) {
            names = names.concat(extractFolderNames(box.children, fullName));
          }
        }
        return names;
      };

      console.log('📁 Cartelle IMAP:', extractFolderNames(boxes));
      res.json({ folders: boxes, folderNames: extractFolderNames(boxes) });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Elimina email (sposta nel Trash)
// API: Elimina email (sposta nel Trash)
app.post('/api/webmail/delete', requireAuth, async (req, res) => {
  try {
    const { email, password, folder = 'INBOX', uid } = req.body;
    const imap = await connectIMAP(email, password);

    imap.openBox(folder, false, (err) => {
      if (err) {
        imap.end();
        return res.status(500).json({ error: err.message });
      }

      imap.move(uid, 'Trash', (err) => {
        imap.end();
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Svuota cestino
// API: Svuota cestino
app.post('/api/webmail/empty-trash', requireAuth, async (req, res) => {
  try {
    const { email, password } = req.body;
    const imap = await connectIMAP(email, password);

    imap.openBox('Trash', false, (err) => {
      if (err) {
        imap.end();
        return res.status(500).json({ error: err.message });
      }

      imap.search(['ALL'], (err, results) => {
        if (err || !results.length) {
          imap.end();
          return res.json({ success: true, deleted: 0 });
        }

        imap.addFlags(results, '\\Deleted', (err) => {
          if (err) {
            imap.end();
            return res.status(500).json({ error: err.message });
          }

          imap.expunge((err) => {
            imap.end();
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, deleted: results.length });
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Lista email da una cartella
// API: Lista email da una cartella
// API: Lista email da una cartella
app.post('/api/webmail/messages', async (req, res) => {
  try {
    const { mailbox_id, folder = 'INBOX', limit = 50 } = req.body;

    // Recupera credenziali sicure dal DB
    const { data: mailbox, error } = await supabase
      .from('mailboxes')
      .select('email, smtp_pass, smtp_host')
      .eq('id', mailbox_id)
      .single();

    if (error || !mailbox) {
      throw new Error("Casella non trovata o errore DB");
    }

    console.log(`📧 Richiesta messaggi: ${mailbox.email} / cartella: ${folder} (ID: ${mailbox_id})`);

    const imap = await connectIMAP(mailbox.email, mailbox.smtp_pass);

    imap.openBox(folder, true, (err) => {
      if (err) {
        console.error(`❌ Errore apertura ${folder}:`, err.message);
        imap.end();
        return res.status(500).json({ error: err.message });
      }
      console.log(`✅ Cartella ${folder} aperta`);


      imap.search(['ALL'], (err, results) => {
        if (err) {
          console.error(`❌ Errore search:`, err.message);
          imap.end();
          return res.status(500).json({ error: err.message });
        }

        console.log(`📊 Trovati ${results ? results.length : 0} messaggi in ${folder}`);

        if (!results || !results.length) {
          imap.end();
          return res.json({ messages: [] });
        }

        const messages = [];
        const fetchRange = results.slice(-limit);
        console.log(`🔄 Fetch degli ultimi ${fetchRange.length} messaggi...`);
        const f = imap.fetch(fetchRange, { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true });

        f.on('message', (msg, seqno) => {
          let headers = '';
          msg.on('body', (stream) => {
            stream.on('data', (chunk) => { headers += chunk.toString('utf8'); });
          });

          msg.once('attributes', (attrs) => {
            msg.once('end', () => {
              const parsed = Imap.parseHeader(headers);
              messages.push({
                uid: attrs.uid,
                date: parsed.date ? parsed.date[0] : '',
                from: parsed.from ? parsed.from[0] : '',
                to: parsed.to ? parsed.to[0] : '',
                subject: parsed.subject ? parsed.subject[0] : '(No Subject)',
                flags: attrs.flags
              });
            });
          });
        });

        f.once('error', (err) => {
          imap.end();
          res.status(500).json({ error: err.message });
        });

        f.once('end', () => {
          console.log(`✅ Fetch completato: ${messages.length} messaggi pronti`);
          imap.end();
          res.json({ messages: messages.reverse() });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Dettaglio singola email
// API: Dettaglio singola email
app.post('/api/webmail/message/:uid', requireAuth, async (req, res) => {
  try {
    const { email, password, folder = 'INBOX' } = req.body;
    const { uid } = req.params;
    const imap = await connectIMAP(email, password);

    imap.openBox(folder, true, (err) => {
      if (err) {
        imap.end();
        return res.status(500).json({ error: err.message });
      }

      const f = imap.fetch([uid], { bodies: '' });

      f.on('message', (msg) => {
        msg.on('body', async (stream) => {
          const parsed = await simpleParser(stream);
          imap.end();
          res.json({
            from: parsed.from?.text,
            to: parsed.to?.text,
            subject: parsed.subject,
            date: parsed.date,
            html: parsed.html || parsed.textAsHtml,
            text: parsed.text,
            attachments: parsed.attachments?.map(a => ({ filename: a.filename, size: a.size }))
          });
        });
      });

      f.once('error', (err) => {
        imap.end();
        res.status(500).json({ error: err.message });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Invia email via SMTP
// API: Invia email via SMTP
app.post('/api/webmail/send', requireAuth, async (req, res) => {
  try {
    const { from, to, subject, body, password } = req.body;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.bluelimeflow.com',
      port: 587,
      secure: false,
      auth: { user: from, pass: password },
      tls: { rejectUnauthorized: false }
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html: body
    });

    console.log(`📨 Email inviata via SMTP! MessageID: ${info.messageId}`);
    console.log(`📝 Risposta Server SMTP: ${info.response}`);

    res.json({ success: true, messageId: info.messageId, response: info.response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------------------
// API: Aggiungi Dominio a Mailcow (Bulk o Singolo)
// ------------------------------------------------------------------
app.post('/api/domains/add', requireAuth, async (req, res) => {
  const { domain } = req.body;

  if (!domain) {
    return res.status(400).json({ success: false, error: 'Dominio mancante' });
  }

  console.log(`🌍 Richiesta aggiunta dominio: ${domain}`);

  try {
    // 1. Aggiungi il dominio a Mailcow
    const response = await fetch(`${MAILCOW_API_URL}/add/domain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': MAILCOW_API_TOKEN
      },
      body: JSON.stringify({
        domain: domain,
        description: "Created via BlueLimeFlow",
        aliases: 400,
        mailboxes: 10,
        def_new_mailbox_quota: 1024 * 1024 * 100, // 100MB
        active: 1
      })
    });

    const result = await response.json();

    // Mailcow restituisce un array di messaggi anche in caso di successo o errore
    const isError = result[0]?.type === 'error' || result.type === 'error';
    const msg = result[0]?.msg?.[0] || 'Unknown response';

    if (isError) {
      if (typeof msg === 'string' && msg.includes('exists')) {
        console.log(`ℹ️  Il dominio ${domain} esisteva già.`);
      } else {
        console.error(`❌ Errore Mailcow: ${msg}`);
        return res.status(500).json({ success: false, error: msg });
      }
    }

    // 2. Ritorna successo con i dati DNS teorici (SPF standard e MX standard)
    return res.json({
      success: true,
      msg: 'Dominio configurato',
      dns: {
        mx: 'mail.bluelimeflow.com',
        spf: `v=spf1 mx include:bluelimeflow.com ~all`,
        dkim: 'CNAME dkim._domainkey -> dkim._domainkey.bluelimeflow.com (Se usi CNAME) oppure copia la chiave.'
      }
    });

  } catch (err) {
    console.error('❌ Errore API Mailcow:', err);
    res.status(500).json({ success: false, error: 'Errore interno server' });
  }
});

// API: Check Domain Availability (DomainNameAPI)
// API: Check Domain Availability (Spaceship)
app.post('/api/domains/check', requireAuth, async (req, res) => {
  try {
    const { domain, domains } = req.body;
    const domainsToCheck = domains || (domain ? [domain] : []);

    if (domainsToCheck.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one domain is required' });
    }

    // Call Spaceship API
    const results = await spaceshipClient.checkAvailability(domainsToCheck);

    // Spaceship returns array of objects with status, price, etc.
    res.json({ success: true, results });

  } catch (error) {
    console.error('❌ Domain Check Error (Spaceship):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// API: Register Domain (DomainNameAPI)
app.post('/api/domains/register', requireAuth, async (req, res) => {
  try {
    const { domains, contact } = req.body;

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return res.status(400).json({ success: false, error: 'Domains array required' });
    }
    if (!contact) {
      return res.status(400).json({ success: false, error: 'Contact info required' });
    }

    console.log(`📝 Registering ${domains.length} domains...`);
    const results = [];

    // Nameservers (Safe defaults for this API provider if known, or generic)
    // Using defaults that work with most registrars if they don't auto-park.
    // For now we pass a generic list, hoping the API respects it or uses its own defaults.
    // Nameservers: Spaceship uses defaults or custom. For MVP we use defaults.
    // const nameservers = ['ns1.domainnameapi.com', 'ns2.domainnameapi.com'];

    for (const domain of domains) {
      try {
        console.log(`Attempting to register (Spaceship): ${domain}`);
        // Spaceship Register (MVP, contact email only for now)
        const result = await spaceshipClient.registerDomain(domain, contact.email);
        console.log(`✅ Registered ${domain}:`, result);
        results.push({ domain, success: true });
      } catch (err) {
        console.error(`❌ Failed to register ${domain}:`, err.message);
        results.push({ domain, success: false, error: err.message });
      }
    }

    const allSuccess = results.every(r => r.success);

    res.json({
      success: allSuccess || results.some(r => r.success),
      results
    });

  } catch (error) {
    console.error('❌ Registration Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// === STRIPE PAYMENT ===
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const { domains, contact } = req.body;

    // Calculate price dynamically based on TLD
    // Mirroring the client-side logic for safety
    let pricePerDomain = 948; // $9.48 default

    // Check first domain for TLD (assuming bulk is same TLD or we average, but usually single/bulk)
    // Detailed implementation: Loop and sum.
    let totalCents = 0;
    console.log("💰 Calculating Price for domains:", domains);
    for (const d of domains) {
      const lowerD = String(d).toLowerCase().trim();
      if (lowerD.endsWith('.online') || lowerD.endsWith('.xyz')) {
        totalCents += 98; // $0.98
        console.log(` -> ${d} matched .online rule (98 cents)`);
      }
      else if (lowerD.endsWith('.co')) {
        totalCents += 2298; // $22.98
        console.log(` -> ${d} matched .co rule`);
      }
      else {
        totalCents += 948; // $9.48 (.com)
        console.log(` -> ${d} matched DEFAULT rule (948 cents)`);
      }
    }

    let amountInCents = totalCents;

    // Safety check just in case
    if (amountInCents < 50) amountInCents = 50;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Domain Registration (BlueLimeFlow)',
              description: `Registering ${domains.length} domains: ${domains.join(', ')}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/sender/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/sender/`,
      metadata: {
        domains: JSON.stringify(domains),
        contactEmail: contact.email
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/test-stripe', async (req, res) => {
  try {
    console.log("💶 Creating 1 Euro Test Session...");

    // Hardcoded 1 Euro
    const amount = 100; // cents
    const currency = 'eur';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: 'Test Payment (1 Euro)',
              description: 'Verification of Stripe Integration',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/sender/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/sender/test-stripe`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Test Stripe Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/verify-checkout', requireAuth, async (req, res) => {
  try {
    const { session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const domains = JSON.parse(session.metadata.domains || '[]');
      const contactEmail = session.metadata.contactEmail;

      // TRIGGER REAL REGISTRATION
      for (const domain of domains) {
        try {
          console.log(`💳 Payment Confirmed. Registering ${domain}...`);
          // Note: This might fail if Contact Info is missing in Spaceship account, but we try.
          await spaceshipClient.registerDomain(domain, contactEmail);
        } catch (e) {
          console.error(`⚠️ Failed to register ${domain} after payment:`, e.message);
          // We don't fail the response, so Mailcow config can still proceed (or we could retry manually)
        }
      }

      res.json({ success: true, domains });
    } else {
      res.status(400).json({ success: false, error: 'Payment not completed' });
    }
  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).json({ error: err.message });
  }
});


// === GESTIONE ROUTING REACT ===
// Qualsiasi richiesta a /sender/* ritorna index.html
// Redirect root to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Redirect root to sender
app.get('/', (req, res) => {
  res.redirect('/sender/');
});

app.listen(PORT, () => {
  console.log(`🚀 SERVER AVVIATO su PORTA ${PORT}`);
  console.log(`🌍 App disponibile su: http://localhost:${PORT}/sender/`);
});