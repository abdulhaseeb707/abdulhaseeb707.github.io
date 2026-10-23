'use client';

import { useState } from 'react';
import styles from './ContactForm.module.css';

interface ContactFormProps {
  recipientEmail: string;
}

export function ContactForm({ recipientEmail }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setStatus('sending');

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          _subject: `Message from ${name.trim()} via abdulhaseebkhan.online`,
          _template: 'table',
        }),
      });

      if (res.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className={styles.wrapper} id="write-message">
      <div className={styles.promptRow}>
        <a
          href="#contact-form"
          className={styles.promptBadge}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('cf-name')?.focus();
          }}
        >
          <span>Or write a message here</span>
          <span aria-hidden="true" className={styles.arrow}>↓</span>
        </a>
      </div>

      <form
        id="contact-form"
        className={styles.form}
        onSubmit={handleSubmit}
        action={`https://formsubmit.co/${recipientEmail}`}
        method="POST"
      >
        {/* Anti-spam honeypot */}
        <input type="text" name="_honey" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
        <input type="hidden" name="_captcha" value="false" />

        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="cf-name" className={styles.label}>
              Name
            </label>
            <input
              id="cf-name"
              name="name"
              type="text"
              required
              className={styles.input}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === 'sending'}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="cf-email" className={styles.label}>
              Email
            </label>
            <input
              id="cf-email"
              name="email"
              type="email"
              required
              className={styles.input}
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'sending'}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="cf-message" className={styles.label}>
            Message
          </label>
          <textarea
            id="cf-message"
            name="message"
            rows={5}
            required
            className={styles.textarea}
            placeholder="Write your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={status === 'sending'}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={status === 'sending'}
          >
            {status === 'sending' ? 'Sending message...' : 'Send message'}
          </button>
        </div>

        {status === 'success' && (
          <p className={styles.statusSuccess} role="status">
            Thank you! Your message has been sent. I will get back to you soon.
          </p>
        )}

        {status === 'error' && (
          <p className={styles.statusError} role="alert">
            Could not deliver message automatically. Please email me directly at{' '}
            <a href={`mailto:${recipientEmail}`} className={styles.fallbackLink}>
              {recipientEmail}
            </a>
            .
          </p>
        )}
      </form>
    </div>
  );
}
