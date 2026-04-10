# BODYTIME concept – Setup Guide

## Lokaler Start

### 1. Voraussetzungen
- Node.js 18+
- npm
- Supabase-Projekt (kostenloser Tier reicht)
- SMTP-Mailkonto (z.B. Gmail, Mailgun, etc.)

### 2. Umgebungsvariablen konfigurieren

`.env.local` wurde bereits angelegt. Tragen Sie folgende Werte ein:

```env
NEXT_PUBLIC_SUPABASE_URL=https://IHREPROJEKT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ihr-anon-key
SUPABASE_SERVICE_ROLE_KEY=ihr-service-role-key

NEXT_PUBLIC_APP_URL=http://localhost:3000

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@ihredomain.de
SMTP_PASS=ihr-smtp-passwort
SMTP_FROM_NAME=BODYTIME concept
SMTP_FROM_EMAIL=noreply@ihredomain.de

CRON_SECRET=ein-zufaelliger-langer-secret-string
```

### 3. Datenbank einrichten (Supabase)

Führen Sie das SQL-Migrations-Script in der Supabase SQL-Konsole aus:

```
supabase/migrations/001_initial_schema.sql
```

### 4. Supabase Storage einrichten

Erstellen Sie einen Storage-Bucket namens **`profiles`** in Supabase:
- Dashboard → Storage → New Bucket → Name: `profiles`
- Public: ✅ (für Profilbilder)
- Erlaubte MIME-Types: `image/jpeg, image/png, image/webp`
- Max. Dateigröße: 2 MB

### 5. Ersten Admin anlegen

Da Admins nur über Supabase direkt angelegt werden können (Security-Maßnahme):

1. Supabase Dashboard → Authentication → Users → "Invite user"
2. E-Mail und Passwort setzen
3. Im SQL-Editor:
```sql
-- Setzen Sie die Rolle auf 'admin' für Ihren ersten Admin-User
UPDATE profiles
SET role = 'admin'
WHERE email = 'ihre-admin@email.de';
```

### 6. Development-Server starten

```bash
npm run dev
```

Öffnen Sie [http://localhost:3000](http://localhost:3000).

---

## Cron Job (Reminder-E-Mails)

Der Endpunkt `/api/cron/reminders` sendet täglich Erinnerungen für Verträge, die in 60 Tagen ablaufen.

### Aufrufen:
```bash
curl -X GET http://localhost:3000/api/cron/reminders \
  -H "Authorization: Bearer IHR_CRON_SECRET"
```

### Empfohlener Cron-Plan:
- Täglich um 08:00 UTC
- z.B. via Vercel Cron, GitHub Actions, oder Cron-Service

---

## Deployment (Vercel)

1. Repository mit Vercel verbinden
2. Alle `.env`-Variablen in Vercel → Settings → Environment Variables eintragen
3. Deploy

### Vercel Cron Job:
`vercel.json` erstellen:
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

---

## Architektur-Entscheidungen

| Entscheidung | Begründung |
|---|---|
| Next.js App Router | Server Components + Server Actions = kein API-Layer nötig |
| Supabase Auth | Battle-tested, sichere Token-Verwaltung, Magic Links |
| RLS-Policies | Datenbank-Ebene als zweite Sicherheitsschicht |
| Append-only contract_history | Vollständiger Audit-Trail ohne Datenverlust |
| Admins sehen keine CRM-Notizen | Partnervertraulichkeit – bewusste Design-Entscheidung |
| Soft-Delete für Kunden | Daten bleiben für Verlaufsprüfung erhalten |
| Reminder-Idempotenz via DB | Kein doppelter E-Mail-Versand bei mehrfachem Cron-Aufruf |

---

## Sicherheits-Checkliste

- [x] Service Role Key nur server-seitig
- [x] RLS auf allen Tabellen aktiviert
- [x] Rollenprüfung in Middleware + Layout + Server Actions
- [x] Datei-Upload-Validierung (Typ + Größe)
- [x] Cron-Endpunkt durch CRON_SECRET geschützt
- [x] Passwort-Stärke validiert (client + server)
- [x] robots: noindex für alle Bereiche
- [x] Audit-Log für kritische Admin-Aktionen
- [x] Bestätigungsdialog mit Tipp-Verifikation für Partner-Löschung
