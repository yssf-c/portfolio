import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Education } from "@/components/education";
import { Experience } from "@/components/experience";
import { Projects } from "@/components/projects";
import { BlogSection } from "@/components/blog-section";
import { CurrentListen } from "@/components/current-listen";
import { Footer } from "@/components/footer";
import { AskInput } from "@/components/ask-input";
import { PageTransition } from "@/components/page-transition";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Preloader } from "@/components/preloader";
import { JsonLd } from "@/components/json-ld";
import { jsonLdGraph, personSchema, websiteSchema, SITE_URL } from "@/lib/seo";
import { getCitationSources } from "@/lib/site-knowledge";

export default async function Home() {
  // Read at build time; the chat links its answers to these.
  const citationSources = await getCitationSources();

  return (
    <>
      {/* Outside the transition wrapper, which starts transparent */}
      <Preloader />
      <PageTransition>
        <JsonLd
          data={jsonLdGraph(personSchema, websiteSchema, {
            "@type": "ProfilePage",
            "@id": `${SITE_URL}/#profilepage`,
            url: SITE_URL,
            mainEntity: { "@id": `${SITE_URL}/#person` },
            isPartOf: { "@id": `${SITE_URL}/#website` },
          })}
        />
        <SmoothScroll />
        <main className="relative z-10 min-h-screen bg-background">
          {/* Grain overlay */}
          <div className="grain-overlay" />

          {/* Navigation */}
          <Navbar />

          {/* Everything above the footer is one sheet; the footer shows from under it as it lifts away */}
          <div className="page-sheet">
            {/* The hero stays put while the About section slides up over it */}
            <div id="home" className="relative">
              <div className="sticky top-0">
                <Hero />
              </div>
              <About />
            </div>

            <Education />

            <Experience />

            <Projects />

            <BlogSection />

            <CurrentListen />
          </div>

          <Footer />

          {/* Floating chat input */}
          <AskInput sources={citationSources} />
        </main>
      </PageTransition>
    </>
  );
}
