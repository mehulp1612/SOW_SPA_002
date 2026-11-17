import { useMemo, useState } from 'react';
import Ajv2020 from 'ajv/dist/2020.js';
import schema from '../schema/root-spa.schema.json';
import initialContext from '../instances/demo-site/initial-context.json';
import './App.css';

type LandingSection = {
  id: string;
  type: 'story' | 'features' | 'call-to-action';
  heading: string;
  body: string;
  items?: string[];
  linkLabel?: string;
  linkHref?: string;
};

type LandingContext = {
  templateVersion: string;
  pathName: string;
  displayName: string;
  title: string;
  subtitle: string;
  theme: 'coast' | 'citrus' | 'earth';
  sections: LandingSection[];
};

const prototypeReservedNames = new Set([
  'admin', 'api', 'auth', 'chat', 'login', 'meetings', 'settings',
]);
const validator = new Ajv2020({ allErrors: true, strict: true }).compile<LandingContext>(schema);

const starter = initialContext as LandingContext;

function pathNameError(value: string): string | undefined {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    return 'Use lowercase letters, numbers, and single hyphens.';
  }
  if (prototypeReservedNames.has(value)) {
    return 'That path is reserved in this prototype.';
  }
  return undefined;
}

function App() {
  const [context, setContext] = useState<LandingContext>(starter);
  const validation = useMemo(() => {
    const valid = validator(context);
    const routeError = pathNameError(context.pathName);
    return {
      valid: Boolean(valid && !routeError),
      errors: [
        ...(validator.errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message ?? 'is invalid'}`),
        ...(routeError ? [`/pathName ${routeError}`] : []),
      ],
    };
  }, [context]);

  function update<K extends keyof LandingContext>(key: K, value: LandingContext[K]) {
    setContext((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <a className="brand-lockup" href="#top" aria-label="Root Studio home">
          <span className="brand-mark" aria-hidden="true">r.</span>
          <span className="brand-name">ROOT <span>/</span> STUDIO</span>
        </a>
        <div className="header-meta">
          <span className="prototype-label"><span /> Prototype workspace</span>
          <a className="repo-link" href={`${import.meta.env.BASE_URL}${context.pathName}`}>
            Preview route <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <section className="intro-row" id="top">
        <div>
          <p className="eyebrow">ROOT SPA · STARTER</p>
          <h1>A little space to shape<br />something <em>good.</em></h1>
        </div>
        <p className="intro-copy">A first look at the Root SPA: edit a few approved fields, check the preview, and keep the page settings in a clear, validated format.</p>
      </section>

      <section className="workbench" aria-label="Landing page editor and preview">
        <aside className="editor-panel" aria-label="Page settings">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">01 / PAGE SETTINGS</p>
              <h2>Shape the first impression</h2>
              <p className="panel-helper">Make a few small edits. Your preview updates as you go.</p>
            </div>
            <span className="edit-icon" aria-hidden="true">✳</span>
          </div>

          <div className="editor-fields">
            <div className="editor-field">
              <label className="field-label" htmlFor="pathName">Page address <span>URL name</span></label>
              <div className="path-control">
                <span aria-hidden="true">/</span>
                <input id="pathName" aria-describedby="path-help" autoComplete="off" value={context.pathName} maxLength={48} onChange={(event) => update('pathName', event.target.value)} />
              </div>
              <small className="field-hint" id="path-help">Lowercase words separated by hyphens.</small>
            </div>

            <div className="editor-field">
              <label className="field-label" htmlFor="displayName">Studio name</label>
              <input id="displayName" autoComplete="off" value={context.displayName} maxLength={80} onChange={(event) => update('displayName', event.target.value)} />
            </div>

            <div className="editor-field">
              <label className="field-label" htmlFor="title">Headline <span>{context.title.length}/100</span></label>
              <textarea id="title" rows={3} value={context.title} maxLength={100} onChange={(event) => update('title', event.target.value)} />
            </div>

            <div className="editor-field">
              <label className="field-label" htmlFor="subtitle">Supporting text <span>{context.subtitle.length}/240</span></label>
              <textarea id="subtitle" rows={3} value={context.subtitle} maxLength={240} onChange={(event) => update('subtitle', event.target.value)} />
            </div>

            <div className="editor-field">
              <label className="field-label" htmlFor="theme">Color story</label>
              <select id="theme" value={context.theme} onChange={(event) => update('theme', event.target.value as LandingContext['theme'])}>
                <option value="coast">Coast · blue and sand</option>
                <option value="citrus">Citrus · green and cream</option>
                <option value="earth">Earth · rose and clay</option>
              </select>
            </div>
          </div>

          <div className={`validation-note ${validation.valid ? 'is-valid' : 'is-invalid'}`} role="status" aria-live="polite">
            <span className="validation-dot" aria-hidden="true" />
            <div>
              <strong>{validation.valid ? 'Settings look good' : 'Check these settings'}</strong>
              {validation.errors.length > 0 && <ul>{validation.errors.map((error) => <li key={error}>{error}</li>)}</ul>}
              <small>Validated against Root SPA Schema 1.0.0</small>
            </div>
          </div>
          <p className="editor-footnote">Prototype only · changes stay in this browser session and are not published to GitHub.</p>
        </aside>

        <section className={`site-preview theme-${context.theme}`} aria-label="Live page preview">
          <div className="preview-topline">
            <span className="preview-browser-dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="preview-url">preview.local / {context.pathName || 'your-page'}</span>
            <span className="preview-size">LIVE PREVIEW</span>
          </div>
          <article className="landing-page">
            <nav className="landing-nav" aria-label="Preview page navigation">
              <a href="#top" className="landing-brand"><span className="landing-symbol">g</span>{context.displayName}</a>
              <a className="nav-contact" href="#say-hello">Let’s talk <span aria-hidden="true">↗</span></a>
            </nav>
            <div className="hero-content">
              <div className="hero-kicker"><span className="kicker-line" /> INDEPENDENT BY NATURE</div>
              <h2>{context.title}</h2>
              <p>{context.subtitle}</p>
              <a className="hero-button" href="#our-approach">Explore the studio <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="art-sun" />
              <div className="art-hill art-hill-back" />
              <div className="art-hill art-hill-front" />
              <div className="art-stem"><i /><i /><i /></div>
              <span className="art-caption">FIG. 01 &nbsp; THE GOOD GROUND</span>
            </div>
            <div className="section-list">
              {context.sections.map((section, index) => (
                <section className="landing-section" id={section.id} key={section.id}>
                  <span className="section-index">0{index + 1}</span>
                  <div className="section-copy">
                    <h3>{section.heading}</h3>
                    <p>{section.body}</p>
                    {section.type === 'features' && section.items && (
                      <ul className="feature-list">{section.items.map((item) => <li key={item}>{item}</li>)}</ul>
                    )}
                    {section.type === 'call-to-action' && section.linkHref && (
                      <a className="section-link" href={section.linkHref}>{section.linkLabel ?? 'Learn more'} <span aria-hidden="true">↗</span></a>
                    )}
                  </div>
                </section>
              ))}
            </div>
            <footer className="landing-footer"><span>© 2026 {context.displayName}</span><span>Made with room to think.</span></footer>
          </article>
        </section>
      </section>

      <footer className="studio-footer">
        <span>BUILT FOR GOOD IDEAS</span>
        <span>ROOT SPA <i>·</i> VERSION {context.templateVersion}</span>
      </footer>
    </main>
  );
}

export default App;
