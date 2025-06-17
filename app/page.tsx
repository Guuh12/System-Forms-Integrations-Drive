
import { HeaderNav } from "@/components/layout/header-nav";
import { ContactForm } from "@/components/sections/contact-form";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { FooterSection } from "@/components/layout/footer-section";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderNav />
      <main className="flex-grow">
        {/* IntroductionSection removed */}
        <ContactForm />
        <FaqAccordion />
      </main>
      <FooterSection />
    </div>
  );
}
