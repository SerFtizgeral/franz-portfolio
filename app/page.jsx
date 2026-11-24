import { email, experience, github, linkedin, projects, resume } from './content';
import Gallery from './gallery';
import Workstation from './workstation';
import Parallax from './parallax';
import { mediaPath } from './media';

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header wrap">
        <a href="#" className="brand" aria-label="Francis Jeeves Julayco, home">
          <span className="monogram">FJ<span>.</span></span>
          <span>Francis Jeeves<br />Julayco</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="header-resume" href={resume}>Résumé</a>
      </header>

      <Parallax>
        <section className="hero-stage" aria-labelledby="hero-title">
          <div className="hero-depth" aria-hidden="true" />
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero wrap">
            <div className="hero-copy">
              <p className="eyebrow"><span /> Developer &amp; designer</p>
              <h1 id="hero-title">Francis<br /><span>Jeeves.</span></h1>
              <p className="hero-intro">I build web experiences and create artwork for games. My background spans front-end development, software support, and concept art.</p>
              <div className="hero-actions">
                <a className="button primary" href="#work">View my work</a>
                <a className="button secondary" href="#contact">Get in touch</a>
              </div>
            </div>
            <Workstation />
          </div>
        </section>

        <section id="work" className="section wrap">
          <div className="section-heading">
            <h2>Selected work<span>.</span></h2>
            <span className="section-note">Games &amp; software</span>
          </div>
          <div className="project-grid">
            {projects.map(({ name, type, image, alt, description, tools }, index) => (
              <article className={index === 0 ? 'project project-featured' : 'project'} key={name}>
                <div className="project-media" data-parallax-media>
                  <img src={mediaPath(`${image}.webp`)} alt={alt} loading="lazy" />
                </div>
                <div className="project-copy">
                  <p className="eyebrow">{type}</p>
                  <h3>{name}</h3>
                  <p>{description}</p>
                  <ul className="tags" aria-label="Tools">
                    {tools.map((tool) => <li key={tool}>{tool}</li>)}
                  </ul>
                  {name === 'Pintura' && <a className="text-link" href="#pintura-teaser">Watch the teaser</a>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="artwork" className="section wrap">
          <div className="section-heading">
            <h2>Artwork<span>.</span></h2>
            <span className="section-note">Concept art &amp; game assets</span>
          </div>
          <Gallery />
          <div className="teaser" id="pintura-teaser">
            <div>
              <p className="eyebrow">Thesis game</p>
              <h3>Pintura teaser</h3>
              <p>A preview of the 2D puzzle game inspired by Filipino folklore.</p>
            </div>
            <video controls playsInline preload="none" poster={mediaPath('carrent.webp')} aria-label="Pintura game teaser">
              <source src={mediaPath('pintura-teaser.mp4')} type="video/mp4" />
              <a href={mediaPath('pintura-teaser.mp4')}>Download the Pintura teaser</a>
            </video>
          </div>
        </section>

        <section id="about" className="section wrap about">
          <div>
            <h2>About me<span>.</span></h2>
            <p className="about-bio">I’m Francis Jeeves Julayco, a Computer Science graduate interested in how software feels to use. My background spans building web interfaces, troubleshooting production systems, and making art for games.</p>
            <ul className="tags" aria-label="Skills">
              {['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'Photoshop', 'Game design'].map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
            <a className="text-link" href={resume}>View my résumé</a>
          </div>
          <div className="experience">
            <h3>Experience</h3>
            {experience.map(({ role, company, date, summary }) => (
              <article key={role}>
                <div className="experience-heading"><h4>{role}</h4>{date && <span>{date}</span>}</div>
                <p className="company">{company}</p>
                <p>{summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="contact">
          <div className="wrap contact-inner">
            <div>
              <p className="eyebrow">Contact</p>
              <h2>Let’s talk<span>.</span></h2>
              <p>Reach out about web development, game design, or creative work.</p>
            </div>
            <div className="contact-links">
              <a href={`mailto:${email}`}>{email}</a>
              <div><a href={github}>GitHub</a><a href={linkedin}>LinkedIn</a><a href={resume}>Résumé</a></div>
            </div>
          </div>
        </section>
      </Parallax>
      <footer className="wrap footer"><span>Francis Jeeves Julayco</span><a href="#">Back to top</a></footer>
    </>
  );
}
