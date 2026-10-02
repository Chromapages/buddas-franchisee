"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, FileText, Flag, MessageCircle, Plus, Settings2, Star, UserRound, UsersRound } from "lucide-react";
import "@/src/app/franchise/homepage-faq.css";

const topics = [
  {
    title: "Is Budda's right for me?",
    cue: "Fit & opportunity",
    heading: "Questions about fit and the opportunity",
    description: "Who we're looking for and what makes the concept distinct.",
    Icon: UserRound,
    questions: [
      { title: "Who is Budda's looking for?", hint: "Restaurant experience, financial readiness, and hands-on ownership.", answer: "Experienced restaurant leaders with financial readiness and a hands-on approach to ownership." },
      { title: "What makes the concept different?", hint: "The signature product behind Budda's Hawaiian Bakery & Grill.", answer: "A Hawaiian Bakery & Grill centered on the signature Budda Roll." },
    ],
  },
  {
    title: "What do I receive?",
    cue: "Support & investment",
    heading: "Questions about support and investment",
    description: "The support system and where to find financial details.",
    Icon: Settings2,
    questions: [
      { title: "What support does an operator receive?", hint: "Training, standards, supplies, and ongoing resources.", answer: "Opening and training guidance, operating standards, brand tools, approved supply access, and ongoing resources." },
      { title: "Where can I review investment and territory details?", hint: "Find the full details on The Opportunity page.", answer: "The Opportunity page covers financial qualifications, investment, and territory information." },
    ],
  },
  {
    title: "What happens next?",
    cue: "The process",
    heading: "Questions about the next steps",
    description: "What an inquiry starts and what it does not commit you to.",
    Icon: Flag,
    questions: [
      { title: "What happens after I inquire?", hint: "The three-step inquiry starts a four-stage evaluation.", answer: "The inquiry form has three steps. It begins a four-stage mutual evaluation, with each side deciding whether to continue." },
      { title: "Does an inquiry reserve a territory or count as an application?", hint: "Understand what submitting an inquiry means.", answer: "No. An inquiry is not an application, territory reservation, franchise offer, or approval decision." },
    ],
  },
] as const;

export function HomepageFaq() {
  const [active, setActive] = useState(0);
  const topic = topics[active];

  return <section className="home-section home-faq" aria-labelledby="franchise-faq-title">
    <div className="content-wide home-faq-layout">
      <div className="home-faq-intro">
        <p className="home-faq-eyebrow home-eyebrow">Common questions</p>
        <h2 id="franchise-faq-title" className="home-section-title">Your franchise questions, answered</h2>
        <p className="home-faq-lede home-section-intro">Get quick answers about fit, support, investment, territory details, and what happens after you inquire.</p>

        <aside className="home-faq-opportunity">
          <FileText aria-hidden="true" />
          <div><h3>Looking for investment and territory details?</h3><p>The full information is on The Opportunity page.</p></div>
          <Link href="/franchise/the-opportunity">Explore the Opportunity<ArrowRight aria-hidden="true" /></Link>
        </aside>

        <div className="home-faq-brand">
          <p>Great food<br />brings opportunity.</p>
          <span>A brighter tomorrow together.</span>
          <div className="home-faq-brand-image"><Image src="/images/franchise-hero-signature-roll.png" alt="Signature Budda Roll with its soft crumb visible" fill sizes="(max-width: 1023px) 40vw, 28vw" /></div>
        </div>
      </div>

      <div className="home-faq-explorer">
        <div className="home-faq-topics" role="group" aria-label="Question topics">
          {topics.map(({ title, cue, Icon }, index) => <button key={title} type="button" className={index === active ? "is-active" : ""} aria-pressed={index === active} aria-controls="home-faq-panel" onClick={() => setActive(index)}><span className="home-faq-topic-icon"><Icon aria-hidden="true" /></span><span><strong>{title}</strong><small>{cue}</small></span></button>)}
        </div>

        <div id="home-faq-panel" className="home-faq-panel" aria-live="polite">
          <div className="home-faq-panel-heading"><div><h3>{topic.heading}</h3><p>{topic.description}</p></div><span>{topic.questions.length} questions</span></div>
          <div className="home-faq-questions">{topic.questions.map(({ title, hint, answer }) => <details key={title}><summary><span><strong>{title}</strong><small>{hint}</small></span><Plus aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
          <div className="home-faq-resources"><h4>Related resources</h4><div><Link href="/franchise/the-opportunity"><UsersRound aria-hidden="true" />Explore the Opportunity<ArrowRight aria-hidden="true" /></Link><Link href="/franchise/process"><Star aria-hidden="true" />See the Process<ArrowRight aria-hidden="true" /></Link></div></div>
        </div>

        <div className="home-faq-other-topics">{topics.map(({ title, cue, Icon }, index) => index === active ? null : <button key={title} type="button" onClick={() => setActive(index)}><span className="home-faq-topic-icon"><Icon aria-hidden="true" /></span><span><strong>{title}</strong><small>{cue}</small></span><ArrowRight aria-hidden="true" /></button>)}</div>
        <div className="home-faq-contact"><MessageCircle aria-hidden="true" /><p><strong>Still have a question?</strong><span>Reach out and our team will help you find the information you need.</span></p><Link href="/franchise/contact">Request Franchise Information<ArrowRight aria-hidden="true" /></Link></div>
      </div>
    </div>
  </section>;
}
