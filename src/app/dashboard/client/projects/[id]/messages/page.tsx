'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface MessageRow {
  id: string;
  sender_user_id: string;
  sender_role: string;
  message: string;
  created_at: string;
}

export default function ClientProjectMessagesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const containsContactInfo = (value: string) => {
    const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
    const phoneRegex = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/;
    return emailRegex.test(value) || phoneRegex.test(value);
  };

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user?.id) {
        setMessage('Please sign in to view messages.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('project_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        setMessage(error.message);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    if (projectId) {
      load();
    }
  }, [projectId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    if (containsContactInfo(newMessage)) {
      setMessage('Please remove phone numbers or emails from messages.');
      return;
    }

    setSending(true);
    setMessage(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) {
      setMessage('Please sign in.');
      setSending(false);
      return;
    }

    const { error } = await supabase.from('project_messages').insert({
      project_id: projectId,
      sender_user_id: userId,
      sender_role: 'client',
      message: newMessage.trim(),
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          sender_user_id: userId,
          sender_role: 'client',
          message: newMessage.trim(),
          created_at: new Date().toISOString(),
        },
      ]);
      setNewMessage('');
    }

    setSending(false);
  };

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div className="container">
          <button className={styles.backButton} onClick={() => router.back()}>
            ← Back
          </button>
          <h1 className={styles.pageTitle}>Project Messages</h1>
          <p className={styles.pageDescription}>Keep all communication inside De’Artisa Hub.</p>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.card}>
            {loading ? (
              <p className={styles.notice}>Loading messages...</p>
            ) : (
              <div className={styles.messagesList}>
                {messages.length === 0 && (
                  <p className={styles.notice}>No messages yet.</p>
                )}
                {messages.map((row) => (
                  <div key={row.id} className={styles.messageRow}>
                    <div className={styles.messageBubble}>
                      <p>{row.message}</p>
                      <span>{new Date(row.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className={styles.composer}>
              <textarea
                className={styles.textarea}
                rows={3}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button className={styles.primaryButton} onClick={handleSend} disabled={sending}>
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
            {message && <p className={styles.notice}>{message}</p>}
          </div>
        </div>
      </section>
    </Layout>
  );
}
