'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Safety net: if Supabase redirects an invite link to the wrong page (e.g. site root),
 * this detects the #type=invite hash and sends the user to /invite with the same hash.
 */
export default function InviteRedirectDetector() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash.slice(1));
    if (params.get('type') === 'invite' && params.get('access_token')) {
      router.replace(`/invite${hash}`);
    }
  }, [router]);

  return null;
}
