export default function LandingPage() {
  return (
    <div className="landing">
      <header>
        <div className="container landing-nav">
          <div className="brand">Beer Counter</div>
          <nav className="nav-links" aria-label="Primary">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
          </nav>
          <button className="button primary" type="button">
            Open App
          </button>
        </div>
      </header>

      <main>
        <section className="container hero" aria-labelledby="hero-title">
          <div>
            <h1 id="hero-title">Event-based Beer Counter for your course</h1>
            <p>
              Log events, see live balances, and keep an immutable history for your
              group.
            </p>
            <div className="hero-actions">
              <button className="button primary" type="button">
                Open Dashboard
              </button>
              <button className="button secondary" type="button">
                View History
              </button>
            </div>
          </div>
          <div className="preview-card" role="presentation">
            <h3>Latest events</h3>
            <ul className="preview-list">
              <li className="preview-item">
                <span>Disturbance logged</span>
                <span>+2</span>
              </li>
              <li className="preview-item">
                <span>Paid beers</span>
                <span>-1</span>
              </li>
              <li className="preview-item">
                <span>Fridge restock</span>
                <span>+6</span>
              </li>
            </ul>
            <div className="preview-balance">
              <span>Balance</span>
              <span>7 beers</span>
            </div>
          </div>
        </section>

        <section className="container" id="features" aria-labelledby="features-title">
          <h2 className="section-title" id="features-title">
            Core features
          </h2>
          <div className="cards">
            <article className="card">
              <h3>Event Log (append-only)</h3>
              <p>Every change is an event. Keep the history clean and auditable.</p>
            </article>
            <article className="card">
              <h3>Time-based Analytics</h3>
              <p>Review consumption by day, week, or month in one timeline.</p>
            </article>
            <article className="card">
              <h3>Corrections via correction events</h3>
              <p>Fix mistakes by adding correction events instead of edits.</p>
            </article>
          </div>
        </section>

        <section className="container" id="how-it-works" aria-labelledby="how-title">
          <h2 className="section-title" id="how-title">
            How it works
          </h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div>
                <h3>Record a disturbance</h3>
                <p>Log each event as it happens to keep the ledger up to date.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div>
                <h3>Add minus-events for paid beers</h3>
                <p>Balance out by recording payments or returns separately.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div>
                <h3>Analyze by week/month</h3>
                <p>See trends over time and understand the real usage pattern.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span>Built with React + TypeScript</span>
          <div className="footer-links">
            <a href="#">GitHub</a>
            <a href="#">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
