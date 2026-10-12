
const express = require("express");
const cors = require("cors");
const db = require("./database");
const { calculateMatchScore } = require("./matching");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "100kb" }));

const allowedTypes = ["lost", "found"];
const requiredFields = [
  "title",
  "description",
  "category",
  "location",
  "report_date",
  "contact"
];

function validateReport(body) {
  if (!body || !allowedTypes.includes(body.type)) {
    return "Type must be 'lost' or 'found'.";
  }

  for (const field of requiredFields) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      return `${field} is required.`;
    }

    if (body[field].length > 500) {
      return `${field} must be 500 characters or fewer.`;
    }
  }

  return null;
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "FindIt API is running" });
});

app.get("/api/reports", (req, res) => {
  const { type, category, status, search } = req.query;

  let sql = "SELECT * FROM reports WHERE 1 = 1";
  const params = [];

  if (type && allowedTypes.includes(type)) {
    sql += " AND type = ?";
    params.push(type);
  }

  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  if (search) {
    sql += " AND (title LIKE ? OR description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += " ORDER BY created_at DESC";

  res.json(db.prepare(sql).all(...params));
});

app.post("/api/reports", (req, res) => {
  const error = validateReport(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const report = {
    type: req.body.type,
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    category: req.body.category.trim(),
    location: req.body.location.trim(),
    report_date: req.body.report_date.trim(),
    contact: req.body.contact.trim()
  };

  const result = db.prepare(`
    INSERT INTO reports
      (type, title, description, category, location, report_date, contact)
    VALUES
      (@type, @title, @description, @category, @location, @report_date, @contact)
  `).run(report);

  const saved = db.prepare(
    "SELECT * FROM reports WHERE id = ?"
  ).get(result.lastInsertRowid);

  res.status(201).json(saved);
});

app.get("/api/reports/:id/matches", (req, res) => {
  const reportId = Number(req.params.id);

  if (!Number.isInteger(reportId) || reportId < 1) {
    return res.status(400).json({ error: "Invalid report ID." });
  }

  const report = db.prepare(
    "SELECT * FROM reports WHERE id = ?"
  ).get(reportId);

  if (!report) {
    return res.status(404).json({ error: "Report not found." });
  }

  const oppositeType = report.type === "lost" ? "found" : "lost";

  const candidates = db.prepare(`
    SELECT * FROM reports
    WHERE type = ?
      AND status = 'open'
      AND id != ?
  `).all(oppositeType, reportId);

  const matches = candidates
    .map(candidate => {
      const lost = report.type === "lost" ? report : candidate;
      const found = report.type === "found" ? report : candidate;

      return {
        report: candidate,
        ...calculateMatchScore(lost, found)
      };
    })
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score);

  res.json(matches);
});

app.patch("/api/reports/:id/status", (req, res) => {
  const validStatuses = ["open", "matched", "resolved"];
  const { status } = req.body;

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status." });
  }

  const result = db.prepare(
    "UPDATE reports SET status = ? WHERE id = ?"
  ).run(status, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Report not found." });
  }

  res.json({ message: "Status updated.", id: Number(req.params.id), status });
});

app.listen(PORT, () => {
  console.log(`FindIt API running at http://localhost:${PORT}`);
});
