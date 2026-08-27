import { About } from './components/About';
import { Background } from './components/Background';
import { CaseStudy } from './components/CaseStudy';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Nav } from './components/Nav';
import { Section, SectionHeading } from './components/Section';
import { Skills } from './components/Skills';
import { PROJECTS } from './data/content';

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="u-mono sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100 focus:bg-ink focus:px-4 focus:py-3 focus:text-bone"
      >
        Skip to content
      </a>

      <div id="top" />
      <Nav />

      <main id="main">
        <Hero />

        <Section id="about" index="01" label="About">
          <SectionHeading id="about-heading">What I build</SectionHeading>
          <About />
        </Section>

        <Section id="work" index="02" label="Work">
          <SectionHeading id="work-heading">Selected work</SectionHeading>
          <div className="mt-12 space-y-16 md:space-y-24">
            {PROJECTS.map((project) => (
              <CaseStudy key={project.id} project={project} />
            ))}
          </div>
        </Section>

        <Section id="skills" index="03" label="Skills">
          <SectionHeading id="skills-heading">Tools I work in</SectionHeading>
          <Skills />
        </Section>

        <Section id="background" index="04" label="Background">
          <SectionHeading id="background-heading">Experience &amp; education</SectionHeading>
          <Background />
        </Section>

        <Section id="contact" index="05" label="Contact">
          <SectionHeading id="contact-heading">Get in touch</SectionHeading>
          <Contact />
        </Section>
      </main>

      <Footer />
    </>
  );
}
