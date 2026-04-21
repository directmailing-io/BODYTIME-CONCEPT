import { createAdminClient } from '@/lib/supabase/server';
import MarketingNav from '@/components/marketing/MarketingNav';
import HeroSection from '@/components/marketing/HeroSection';
import PromisesSection from '@/components/marketing/PromisesSection';
import ProductSection from '@/components/marketing/ProductSection';
import FlexibilitySection from '@/components/marketing/FlexibilitySection';
import AboutConceptSection from '@/components/marketing/AboutConceptSection';
import TransformationSection from '@/components/marketing/TransformationSection';
import SofortloesungSection from '@/components/marketing/SofortloesungSection';
import TrainerSection from '@/components/marketing/TrainerSection';
import AboutUsSection from '@/components/marketing/AboutUsSection';
import NextStepsSection from '@/components/marketing/NextStepsSection';
import FAQSection from '@/components/marketing/FAQSection';
import SiteFooter from '@/components/marketing/SiteFooter';

export const metadata = {
  title: 'BODYTIME concept – Dein EMS-Training',
  description:
    'In 20 Minuten deinen ganzen Körper trainieren – bequem von zuhause. Mit persönlicher EMS-Begleitung von Experten.',
  robots: { index: true, follow: true },
};

async function getApprovedBios() {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('bt_steckbriefe')
    .select(`
      id, image_url,
      contact_first_name, contact_last_name,
      contact_email, contact_phone,
      contact_zip, contact_city,
      services, training_modes, philosophy,
      social_instagram, social_facebook,
      social_youtube, social_linkedin, social_tiktok
    `)
    .eq('status', 'approved')
    .order('reviewed_at', { ascending: false });
  return data ?? [];
}

export default async function LandingPage() {
  const bios = await getApprovedBios();

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navigation ──────────────────────────────────────────── */}
      <MarketingNav />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Nutzen / Versprechen ────────────────────────────────── */}
      <PromisesSection />

      {/* ── Produktvorstellung ──────────────────────────────────── */}
      <ProductSection />

      {/* ── Sofortlösung – Anwendungsfälle ──────────────────────── */}
      <SofortloesungSection />

      {/* ── Ortsunabhängig trainieren ────────────────────────────── */}
      <FlexibilitySection />

      {/* ── Was ist BODYTIME concept ────────────────────────────── */}
      <AboutConceptSection />

      {/* ── Transformation / Kreislauf ──────────────────────────── */}
      <TransformationSection />

      {/* ── Trainer ─────────────────────────────────────────────── */}
      <TrainerSection bios={bios} />

      {/* ── Über uns / Gründer ──────────────────────────────────── */}
      <AboutUsSection />

      {/* ── Nächste Schritte / Beratung ─────────────────────────── */}
      <NextStepsSection />

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <FAQSection />

      {/* ── Footer ──────────────────────────────────────────────── */}
      <SiteFooter />

    </div>
  );
}
