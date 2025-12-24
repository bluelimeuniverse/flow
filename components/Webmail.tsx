import React, { useState, useEffect } from 'react';
import { Mail, Inbox, Send, Trash2, Star, Loader2, RefreshCw, Plus, Search, Paperclip, X, ChevronLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailMessage {
  uid: number;
  from: string;
  to: string;
  subject: string;
  date: string;
  flags: string[];
}

interface Mailbox {
  id: string;
  email: string;
  name: string;
  smtp_pass: string;
}

type FolderType = 'INBOX' | 'Sent' | 'Junk' | 'Trash';

interface WebmailProps {
  initialMailboxId?: string | null;
}

export const Webmail: React.FC<WebmailProps> = ({ initialMailboxId }) => {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [selectedMailbox, setSelectedMailbox] = useState<Mailbox | null>(null);
  const [currentFolder, setCurrentFolder] = useState<FolderType>('INBOX');
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [messageDetail, setMessageDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [composing, setComposing] = useState(false);
  const [newEmail, setNewEmail] = useState({ to: '', subject: '', body: '' });

  useEffect(() => {
    fetchMailboxes();
  }, [initialMailboxId]); // Re-run if ID changes

  const fetchMailboxes = async () => {
    const { data, error } = await supabase.from('mailboxes').select('*');
    console.log('📬 Mailboxes da DB:', data);

    if (error) console.error('❌ Errore Supabase:', error);

    if (data && data.length > 0) {
      setMailboxes(data);

      // Auto-select logic
      const targetBox = initialMailboxId
        ? data.find(m => m.id === initialMailboxId)
        : data[0];

      const boxToLoad = targetBox || data[0];
      setSelectedMailbox(boxToLoad);
      loadMessages(boxToLoad);
    }
  };

  const loadMessages = async (mailbox: Mailbox, folder: FolderType = 'INBOX') => {
    setLoading(true);
    setCurrentFolder(folder);
    setSelectedMessage(null);
    setMessageDetail(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      // Production: use real token or fail
      let token = session?.access_token;
      if (!token) {
        console.warn("⚠️ Nessun token di sessione trovato. Utente disconnesso?");
        // Opzionale: gestire redirect al login
      }


      const response = await fetch('/api/webmail/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mailbox_id: mailbox.id,
          folder: folder,
          limit: 50
        })
      });
      if (response.status === 401) {
        alert("Sessione scaduta. Ricarica la pagina per fare di nuovo login.");
        return;
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMailbox || !selectedMessage) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch('/api/webmail/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          email: selectedMailbox.email,
          password: selectedMailbox.smtp_pass,
          folder: currentFolder,
          uid: selectedMessage.uid
        })
      });
      setSelectedMessage(null);
      setMessageDetail(null);
      loadMessages(selectedMailbox, currentFolder);
    } catch (error) {
      alert('Errore eliminazione email');
    } finally {
      setLoading(false);
    }
  };

  const handleEmptyTrash = async () => {
    if (!selectedMailbox || !confirm('Svuotare definitivamente il cestino?')) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch('/api/webmail/empty-trash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          email: selectedMailbox.email,
          password: selectedMailbox.smtp_pass
        })
      });
      loadMessages(selectedMailbox, 'Trash');
      alert('Cestino svuotato!');
    } catch (error) {
      alert('Errore svuotamento cestino');
    } finally {
      setLoading(false);
    }
  };

  const debugFolders = async () => {
    if (!selectedMailbox) return;
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/webmail/folders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        email: selectedMailbox.email,
        password: selectedMailbox.smtp_pass
      })
    });
    const data = await res.json();
    console.log('📁 Cartelle disponibili:', data.folderNames);
    alert('Vedi console browser (F12) per nomi cartelle');
  };

  const loadMessageDetail = async (msg: EmailMessage) => {
    setSelectedMessage(msg);
    if (!selectedMailbox) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`/api/webmail/message/${msg.uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          email: selectedMailbox.email,
          password: selectedMailbox.smtp_pass,
          folder: currentFolder
        })
      });
      const data = await response.json();
      setMessageDetail(data);
    } catch (error) {
      console.error('Error loading message detail:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedMailbox || !newEmail.to || !newEmail.subject) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch('/api/webmail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          from: selectedMailbox.email,
          to: newEmail.to,
          subject: newEmail.subject,
          body: newEmail.body,
          password: selectedMailbox.smtp_pass
        })
      });
      setComposing(false);
      setNewEmail({ to: '', subject: '', body: '' });
      alert('Email inviata!');
    } catch (error) {
      alert('Errore invio email');
    } finally {
      setLoading(false);
    }
  };

  if (mailboxes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Mail className="h-16 w-16 text-slate-600 mx-auto" />
          <h3 className="text-xl font-semibold text-slate-300">Nessuna casella configurata</h3>
          <p className="text-slate-500">Crea una casella nella sezione "Infrastructure & Mailboxes"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-slate-900 overflow-hidden">
      {/* Sidebar - Folder List */}
      <div className="w-64 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <button
            onClick={() => setComposing(true)}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition"
          >
            <Plus className="h-4 w-4" /> Compose
          </button>
          <button
            onClick={debugFolders}
            className="w-full mt-2 text-xs text-slate-500 hover:text-slate-300 transition py-1"
          >
            🔍 Debug Cartelle
          </button>
        </div>

        <div className="p-3">
          <select
            value={selectedMailbox?.id || ''}
            onChange={(e) => {
              const mb = mailboxes.find(m => m.id === e.target.value);
              if (mb) {
                setSelectedMailbox(mb);
                loadMessages(mb, currentFolder);
              }
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
          >
            {mailboxes.map(mb => (
              <option key={mb.id} value={mb.id}>{mb.email}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            <button
              onClick={() => selectedMailbox && loadMessages(selectedMailbox, 'INBOX')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition ${currentFolder === 'INBOX' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
            >
              <Inbox className="h-4 w-4" /> Inbox
            </button>
            <button
              onClick={() => selectedMailbox && loadMessages(selectedMailbox, 'Sent')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition ${currentFolder === 'Sent' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
            >
              <Send className="h-4 w-4" /> Sent
            </button>
            <button
              onClick={() => selectedMailbox && loadMessages(selectedMailbox, 'Junk')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition ${currentFolder === 'Junk' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
            >
              <AlertCircle className="h-4 w-4" /> Spam
            </button>
            <button
              onClick={() => selectedMailbox && loadMessages(selectedMailbox, 'Trash')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition ${currentFolder === 'Trash' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
            >
              <Trash2 className="h-4 w-4" /> Trash
            </button>
            {currentFolder === 'Trash' && messages.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs transition"
              >
                <Trash2 className="h-3 w-3" /> Svuota Cestino
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="w-96 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-white capitalize">{currentFolder === 'INBOX' ? 'Inbox' : currentFolder}</h2>
          <button onClick={() => selectedMailbox && loadMessages(selectedMailbox, currentFolder)} className="p-2 hover:bg-slate-800 rounded text-slate-400">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              No messages
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.uid}
                onClick={() => loadMessageDetail(msg)}
                className={`p-4 border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition ${selectedMessage?.uid === msg.uid ? 'bg-slate-800' : ''
                  }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-white text-sm truncate">{msg.from}</span>
                  <span className="text-xs text-slate-500">{new Date(msg.date).toLocaleDateString()}</span>
                </div>
                <div className="text-sm text-slate-300 font-medium mb-1 truncate">{msg.subject}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Detail / Compose */}
      <div className="flex-1 flex flex-col bg-slate-900">
        {composing ? (
          <>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-semibold text-white">New Message</h2>
              <button onClick={() => setComposing(false)} className="p-2 hover:bg-slate-800 rounded text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 flex flex-col p-6 space-y-4">
              <input
                type="email"
                placeholder="To"
                value={newEmail.to}
                onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
              />
              <input
                type="text"
                placeholder="Subject"
                value={newEmail.subject}
                onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
              />
              <textarea
                placeholder="Message body..."
                value={newEmail.body}
                onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                className="flex-1 w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white resize-none"
              />
              <button
                onClick={handleSendEmail}
                disabled={loading}
                className="self-start px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
              </button>
            </div>
          </>
        ) : selectedMessage && messageDetail ? (
          <>
            <div className="p-6 border-b border-slate-800">
              <button onClick={() => { setSelectedMessage(null); setMessageDetail(null); }} className="mb-4 text-slate-400 hover:text-white flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <h1 className="text-2xl font-bold text-white mb-2">{messageDetail.subject}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>{messageDetail.from}</span>
                <span>{new Date(messageDetail.date).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: messageDetail.html || messageDetail.text }} />
              {currentFolder !== 'Trash' && (
                <button
                  onClick={handleDeleteMessage}
                  className="mt-6 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Elimina
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <Mail className="h-12 w-12" />
          </div>
        )}
      </div>
    </div>
  );
};