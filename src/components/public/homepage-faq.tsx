"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, FileText, MessagesSquare, Plus } from "lucide-react";
import "@/src/app/franchise/homepage-faq.css";

// Preserve existing homepage answers. New timeline, cost, and territory claims
// require client approval; do not promote unreviewed answers from the full FAQ.
const questions = [
  { id: "fit", title: "Who is Budda's looking for?", answer: "Experienced restaurant leaders with financial readiness and a hands-on approach to ownership. We look for operators who share our values, have relevant restaurant experience, and are excited to be part of a people- and community-focused brand." },
  { id: "concept", title: "What makes the concept different?", answer: "A Hawaiian Bakery & Grill centered on the signature Budda Roll." },
  { id: "support", title: "What support does an operator receive?", answer: "Opening and training guidance, operating standards, brand tools, approved supply access, and ongoing resources." },
  { id: "opportunity", title: "Where can I review investment and territory details?", answer: "The Opportunity page covers financial qualifications, investment, and territory information." },
  { id: "inquiry", title: "What happens after I inquire?", answer: "It begins a four-stage mutual evaluation, with each side deciding whether to continue." },
  { id: "boundary", title: "Does an inquiry reserve a territory or count as an application?", answer: "No. An inquiry is not an application, territory reservation, franchise offer, or approval decision." },
] as const;

export function HomepageFaq() {
  const [openQuestion, setOpenQuestion] = useState<string | null>("fit");

  return <section className="home-section home-faq" aria-labelledby="franchise-faq-title">
    <div className="content-wide home-faq-layout">
      <div className="home-faq-intro">
        <p className="home-eyebrow">Answers for what&apos;s next</p>
        <h2 id="franchise-faq-title" className="home-section-title">Your franchise questions, answered</h2>
        <p className="home-faq-lede home-section-intro">Get quick answers about fit, support, investment, territory details, and what happens after you inquire.</p>
        <aside className="home-faq-opportunity">
          <FileText aria-hidden="true" />
          <div><p className="home-faq-label">Investment + territory</p><h3>Looking for investment and territory details?</h3><p>The full information is on The Opportunity page.</p></div>
          <Link href="/franchise/the-opportunity">View opportunity details<ArrowRight aria-hidden="true" /></Link>
        </aside>
      </div>

      <div className="home-faq-explorer">
        <div className="home-faq-questions">
          {questions.map(({ id, title, answer }) => {
            const isOpen = openQuestion === id;
            const buttonId = `home-faq-${id}-button`;
            const panelId = `home-faq-${id}-answer`;
            return <div className={`home-faq-question${isOpen ? " is-open" : ""}`} key={id}>
              <h3><button id={buttonId} type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpenQuestion(isOpen ? null : id)}><span>{title}</span><Plus aria-hidden="true" /></button></h3>
              <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen}><p>{answer}</p>{id === "fit" && <Link className="home-faq-profile-link" href="/franchise/the-opportunity#mutual-operator-fit">View the full candidate profile<ArrowRight aria-hidden="true" /></Link>}</div>
            </div>;
          })}
        </div>
        <div className="home-faq-contact">
          <span className="home-faq-contact-icon" aria-hidden="true"><MessagesSquare /></span>
          <div className="home-faq-contact-copy"><p className="home-faq-label">Ready to continue the conversation?</p><h3>Request Franchise Information</h3><p>Tell us a bit about yourself and our team will be in touch.</p></div>
          <Link href="/franchise/contact">Request Franchise Information<ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </div>
  </section>;
}
