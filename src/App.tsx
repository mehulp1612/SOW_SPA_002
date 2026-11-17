import { useEffect, useMemo, useState } from 'react';
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
const importedContexts = import.meta.glob('../instances/*/initial-context.json', {
  eager: true,
  import: 'default',
}) as Record<string, LandingContext>;
const publishedContexts = Object.values(importedContexts);
const publishedPathNames = new Set(publishedContexts.map((context) => context.pathName));

function getRequestedSitePathName(): string | undefined {
  let pathname = window.location.pathname;
  const basePath = import.meta.env.BASE_URL;
  if (basePath !== '/' && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length);
  }
  const segments = pathname.split('/').filter(Boolean);
  return segments.length > 1 ? segments.join('/') : segments[0];
}

function pathNameError(value: string): string | undefined {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    return 'Use lowercase letters, numbers, and single hyphens.';
  }
  if (prototypeReservedNames.has(value)) {
    return 'That path is reserved in this prototype.';
  }
  return undefined;
}

function LandingPage({ context, standalone = false }: { context: LandingContext; standalone?: boolean }) {
  return (
    <article className={`landing-page${standalone ? ' landing-page-standalone' : ''}`} id="top">
      <nav className="landing-nav" aria-label="Page navigation">
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
  );
}

function PublishedPage({ context }: { context: LandingContext }) {
  useEffect(() => {
    document.title = `${context.displayName} · ${context.title}`;
  }, [context.displayName, context.title]);
  return (
    <main className={`published-page theme-${context.theme}`}>
      <LandingPage context={context} standalone />
    </main>
  );
}

function MissingPage({ pathName }: { pathName: string }) {
  return (
    <main className="missing-page">
      <p className="eyebrow">ROOT SPA · PAGE NOT FOUND</p>
      <h1>This page hasn’t been published.</h1>
      <p>There is no published site at <code>/{pathName}</code>.</p>
      <a href={import.meta.env.BASE_URL}>Return to the builder <span aria-hidden="true">↗</span></a>
    </main>
  );
}

function downloadContext(context: LandingContext) {
  const file = new Blob([`${JSON.stringify(context, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'initial-context.json';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Builder() {
  const [context, setContext] = useState<LandingContext>(starter);
  const [exported, setExported] = useState(false);
  const validation = useMemo(() => {
    const valid = validator(context);
    const routeError = pathNameError(context.pathName);
    const duplicateError = publishedPathNames.has(context.pathName) && context.pathName !== starter.pathName
      ? 'That page address is already in use.'
      : undefined;
    const errors = [
      ...(validator.errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message ?? 'is invalid'}`),
      ...(routeError ? [`/pathName ${routeError}`] : []),
      ...(duplicateError ? [`/pathName ${duplicateError}`] : []),
    ];
    return { valid: Boolean(valid && !routeError && !duplicateError), errors };
  }, [context]);

  function update<K extends keyof LandingContext>(key: K, value: LandingContext[K]) {
    setExported(false);
    setContext((current) => ({ ...current, [key]: value }));
  }

  function updateSection(index: number, changes: Partial<LandingSection>) {
    setExported(false);
    setContext((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) => (
        sectionIndex === index ? { ...section, ...changes } : section
      )),
    }));
  }

  function updateSectionItem(sectionIndex: number, itemIndex: number, value: string) {
    const section = context.sections[sectionIndex];
    if (!section?.items) return;
    const items = section.items.map((item, index) => index === itemIndex ? value : item);
    updateSection(sectionIndex, { items });
  }

  function exportForPublication() {
    if (!validation.valid) return;
    downloadContext(context);
    setExported(true);
  }

  const publishedUrl = `${import.meta.env.BASE_URL}${context.pathName}/`;
  const hasPublishedVersion = publishedPathNames.has(context.pathName);

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <a className="brand-lockup" href="#top" aria-label="Root Studio home">
          <span className="brand-mark" aria-hidden="true">r.</span>
          <span className="brand-name">ROOT <span>/</span> STUDIO</span>
        </a>
        <div className="header-meta">
          <span className="prototype-label"><span /> Prototype workspace</span>
          {hasPublishedVersion
            ? <a className="repo-link" href={publishedUrl} target="_blank" rel="noreferrer">Open published page <span aria-hidden="true">↗</span></a>
            : <span className="unpublished-label">Not published yet</span>}
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

          <div className="section-editors">
            <p className="field-label">Content sections</p>
            {context.sections.map((section, index) => (
              <details className="section-editor" key={section.id}>
                <summary><span>0{index + 1}</span>{section.heading}</summary>
                <div className="section-editor-fields">
                  <label className="field-label" htmlFor={`${section.id}-heading`}>Section heading</label>
                  <input
                    id={`${section.id}-heading`}
                    value={section.heading}
                    maxLength={100}
                    onChange={(event) => updateSection(index, { heading: event.target.value })}
                  />
                  <label className="field-label" htmlFor={`${section.id}-body`}>Section text</label>
                  <textarea
                    id={`${section.id}-body`}
                    rows={3}
                    value={section.body}
                    maxLength={500}
                    onChange={(event) => updateSection(index, { body: event.target.value })}
                  />
                  {section.type === 'features' && section.items?.map((item, itemIndex) => (
                    <div key={`${section.id}-item-${itemIndex}`}>
                      <label className="field-label" htmlFor={`${section.id}-item-${itemIndex}`}>Feature {itemIndex + 1}</label>
                      <input
                        id={`${section.id}-item-${itemIndex}`}
                        value={item}
                        maxLength={120}
                        onChange={(event) => updateSectionItem(index, itemIndex, event.target.value)}
                      />
                    </div>
                  ))}
                  {section.type === 'call-to-action' && (
                    <>
                      <label className="field-label" htmlFor={`${section.id}-link-label`}>Link label</label>
                      <input
                        id={`${section.id}-link-label`}
                        value={section.linkLabel ?? ''}
                        maxLength={40}
                        onChange={(event) => updateSection(index, { linkLabel: event.target.value })}
                      />
                      <label className="field-label" htmlFor={`${section.id}-link-href`}>Link destination</label>
                      <input
                        id={`${section.id}-link-href`}
                        value={section.linkHref ?? ''}
                        maxLength={200}
                        onChange={(event) => updateSection(index, { linkHref: event.target.value })}
                      />
                    </>
                  )}
                </div>
              </details>
            ))}
          </div>

          <div className={`validation-note ${validation.valid ? 'is-valid' : 'is-invalid'}`} role="status" aria-live="polite">
            <span className="validation-dot" aria-hidden="true" />
            <div>
              <strong>{validation.valid ? 'Settings look good' : 'Check these settings'}</strong>
              {validation.errors.length > 0 && <ul>{validation.errors.map((error) => <li key={error}>{error}</li>)}</ul>}
              <small>Validated against Root SPA Schema 1.0.0</small>
            </div>
          </div>

          <button className="publish-button" type="button" onClick={exportForPublication} disabled={!validation.valid}>
            Download validated configuration <span aria-hidden="true">↓</span>
          </button>
          <p className="editor-footnote">
            {exported
              ? `Configuration downloaded. Add it to instances/${context.pathName}/initial-context.json, then commit and push to publish.`
              : 'To publish, download the validated file, save it in the matching instances folder, then commit and push. This prototype does not write to GitHub.'}
          </p>
        </aside>

        <section className={`site-preview theme-${context.theme}`} aria-label="Live page preview">
          <div className="preview-topline">
            <span className="preview-browser-dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="preview-url">preview.local / {context.pathName || 'your-page'}</span>
            <span className="preview-size">LIVE PREVIEW</span>
          </div>
          <LandingPage context={context} />
        </section>
      </section>

      <footer className="studio-footer">
        <span>BUILT FOR GOOD IDEAS</span>
        <span>ROOT SPA <i>·</i> VERSION {context.templateVersion}</span>
      </footer>
    </main>
  );
}

function App() {
  const requestedPathName = getRequestedSitePathName();
  if (!requestedPathName) return <Builder />;

  const context = publishedContexts.find((site) => site.pathName === requestedPathName);
  return context ? <PublishedPage context={context} /> : <MissingPage pathName={requestedPathName} />;
}

export default App;
