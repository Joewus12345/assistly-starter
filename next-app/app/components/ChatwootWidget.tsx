"use client";
import { useEffect } from 'react';

declare global {
  interface Window {
    chatwootSDK?: any;
    __cwLoaded?: boolean;
    chatwootSettings?: any;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL!;
const WEBSITE_TOKEN = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN!;

export default function ChatwootWidget() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!BASE_URL || !WEBSITE_TOKEN) {
      console.warn('Chatwoot env vars missing: NEXT_PUBLIC_CHATWOOT_BASE_URL or NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN');
      return;
    }

    // Avoid multiple injections
    if (window.__cwLoaded) return;

    const s = document.createElement('script');
    s.defer = true;
    s.async = true;
    s.src = `${BASE_URL}/packs/js/sdk.js`;
    s.onload = () => {
      window.chatwootSDK?.run({
        websiteToken: WEBSITE_TOKEN,
        baseUrl: BASE_URL,
      });

      // EXAMPLE: identify a user (replace with your real auth data)
      const externalId = 'user-123';
      // Try secure mode first (if server route is configured), fallback to plain setUser
      fetch('/api/chatwoot-signature?external_id=' + encodeURIComponent(externalId))
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.signature) {
            window.chatwootSDK?.setUserWithSecureIdentity(externalId, data.signature, {
              name: 'Ada Lovelace',
              email: 'ada@example.com',
              plan: 'Pro',
            });
          } else {
            window.chatwootSDK?.setUser(externalId, {
              name: 'Ada Lovelace',
              email: 'ada@example.com',
              plan: 'Pro',
            });
          }
        })
        .catch(() => {
          // fallback to non-secure
          window.chatwootSDK?.setUser(externalId, {
            name: 'Ada Lovelace',
            email: 'ada@example.com',
            plan: 'Pro',
          });
        });

      window.__cwLoaded = true;
    };
    document.head.appendChild(s);
  }, []);

  return null;
}
