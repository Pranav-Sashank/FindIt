
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:3000/api";

function createEmptyForm() {
  return {
    type: "lost",
    title: "",
    description: "",
    category: "Electronics",
    location: "",
    report_date: new Date().toLocaleDateString("en-CA"),
    contact: "",
  };
}

function App() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [matches, setMatches] = useState([]);
  const [form, setForm] = useState(createEmptyForm);

  async function loadReports() {
    setLoading(true);

    try {
      const response = await fetch(`${API}/reports`);

      if (!response.ok) {
        throw new Error("Unable to load reports.");
      }

      const data = await response.json();
      setReports(data);
      setError("");
    } catch {
      setError("Unable to connect to the server. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function submitReport(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit the report.");
      }

      setForm(createEmptyForm());
      setShowForm(false);

      await loadReports();
      await showMatches(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  async function showMatches(report) {
    setSelectedReport(report);
    setMatches([]);
    setError("");

    try {
      const response = await fetch(
        `${API}/reports/${report.id}/matches`
      );

      if (!response.ok) {
        throw new Error("Unable to retrieve possible matches.");
      }

      setMatches(await response.json());
    } catch (err) {
      setError(err.message);
    }
  }

  function navigate(nextType) {
    setType(nextType);
    setSelectedReport(null);
    setShowForm(false);
  }

  const filteredReports = reports.filter((report) => {
    const searchableText = [
      report.title,
      report.description,
      report.location,
      report.category,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(search.toLowerCase());
    const matchesType = type === "all" || report.type === type;

    return matchesSearch && matchesType;
  });

  const lostCount = reports.filter(
    (report) => report.type === "lost"
  ).length;

  const foundCount = reports.filter(
    (report) => report.type === "found"
  ).length;

  const openCount = reports.filter(
    (report) => report.status === "open"
  ).length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate("all")}>
          findit
        </button>

        <p className="nav-heading">Workspace</p>

        <button
          className={`nav-item ${type === "all" ? "active" : ""}`}
          onClick={() => navigate("all")}
        >
          Overview
        </button>

        <button
          className={`nav-item ${type === "lost" ? "active" : ""}`}
          onClick={() => navigate("lost")}
        >
          Lost items
        </button>

        <button
          className={`nav-item ${type === "found" ? "active" : ""}`}
          onClick={() => navigate("found")}
        >
          Found items
        </button>

        <div className="sidebar-footer">
          <p>Campus lost and found</p>
          <span>A community reporting service</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">CAMPUS SERVICES</p>
            <h1>Lost and found</h1>
          </div>

          <button
            className="primary-button"
            onClick={() => {
              setSelectedReport(null);
              setShowForm((previous) => !previous);
            }}
          >
            {showForm ? "Cancel" : "Report an item"}
          </button>
        </header>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <section className="intro">
          <h2>Campus lost and found</h2>
          <p>
            Browse reports or submit an item to help reunite it with its owner.
          </p>
        </section>

        <section className="stats-grid">
          <StatCard label="Total reports" value={reports.length} />
          <StatCard label="Lost items" value={lostCount} />
          <StatCard label="Found items" value={foundCount} />
          <StatCard label="Open reports" value={openCount} />
        </section>

        {showForm && (
          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">NEW SUBMISSION</p>
                <h2>Report an item</h2>
              </div>
            </div>

            <form className="report-form" onSubmit={submitReport}>
              <label>
                Report type
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm({ ...form, type: event.target.value })
                  }
                >
                  <option value="lost">Lost item</option>
                  <option value="found">Found item</option>
                </select>
              </label>

              <label>
                Item name
                <input
                  required
                  maxLength={500}
                  placeholder="e.g. Black wallet"
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                />
              </label>

              <label>
                Category
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                >
                  <option>Electronics</option>
                  <option>Accessories</option>
                  <option>Documents</option>
                  <option>Clothing</option>
                  <option>Books & stationery</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                Location
                <input
                  required
                  maxLength={500}
                  placeholder="Where was it lost or found?"
                  value={form.location}
                  onChange={(event) =>
                    setForm({ ...form, location: event.target.value })
                  }
                />
              </label>

              <label className="full-width">
                Description
                <textarea
                  required
                  maxLength={500}
                  rows={3}
                  placeholder="Describe the item and identifying details"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </label>

              <label>
                Date lost or found
                <input
                  required
                  type="date"
                  value={form.report_date}
                  onChange={(event) =>
                    setForm({ ...form, report_date: event.target.value })
                  }
                />
              </label>

              <label>
                Contact email
                <input
                  required
                  type="email"
                  maxLength={500}
                  placeholder="you@example.com"
                  value={form.contact}
                  onChange={(event) =>
                    setForm({ ...form, contact: event.target.value })
                  }
                />
              </label>

              <div className="full-width">
                <button className="primary-button" type="submit">
                  Submit report
                </button>
              </div>
            </form>
          </section>
        )}

        {selectedReport && (
          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">MATCH RESULTS</p>
                <h2>Possible matches for {selectedReport.title}</h2>
              </div>

              <button
                className="text-button"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </button>
            </div>

            {matches.length === 0 ? (
              <p className="empty-state">
                No potential matches found yet.
              </p>
            ) : (
              <div className="matches-list">
                {matches.map((match) => (
                  <article className="match-row" key={match.report.id}>
                    <div className="match-details">
                      <span className={`type-label ${match.report.type}`}>
                        {match.report.type}
                      </span>

                      <h3>{match.report.title}</h3>
                      <p>{match.report.description}</p>
                      <p className="muted">
                        {match.report.location} · {match.report.category}
                      </p>

                      <div className="reasons">
                        {match.reasons.map((reason) => (
                          <span key={reason}>{reason}</span>
                        ))}
                      </div>
                    </div>

                    <div className="match-score">
                      <strong>{match.score}%</strong>
                      <span>Match score</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CAMPUS COMMUNITY</p>
              <h2>Recent reports</h2>
            </div>

            <span className="report-count">
              {filteredReports.length} reports
            </span>
          </div>

          <div className="filters">
            <input
              aria-label="Search reports"
              placeholder="Search items, descriptions or locations"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              aria-label="Filter reports"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="all">All reports</option>
              <option value="lost">Lost items</option>
              <option value="found">Found items</option>
            </select>
          </div>

          {loading ? (
            <p className="empty-state">Loading reports...</p>
          ) : filteredReports.length === 0 ? (
            <p className="empty-state">No reports found.</p>
          ) : (
            <div className="reports-list">
              {filteredReports.map((report) => (
                <article className="report-row" key={report.id}>
                  <div className="report-details">
                    <div className="report-labels">
                      <span className={`type-label ${report.type}`}>
                        {report.type}
                      </span>
                      <span className="status-label">{report.status}</span>
                    </div>

                    <h3>{report.title}</h3>
                    <p>{report.description}</p>

                    <div className="report-meta">
                      <span>{report.category}</span>
                      <span>{report.location}</span>
                      <span>{report.report_date}</span>
                    </div>
                  </div>

                  <button
                    className="secondary-button"
                    onClick={() => showMatches(report)}
                  >
                    Find matches
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="page-footer">
          <span>FindIt</span>
          <span>Campus lost and found</span>
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
