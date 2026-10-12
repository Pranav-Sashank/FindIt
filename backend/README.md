# FindIt — Campus Lost and Found

FindIt is a full-stack web application that helps students report lost and found belongings and discover potential matches based on item descriptions, categories, and locations.

## Features

- Submit lost-item and found-item reports.
- Browse existing reports.
- Search reports by item name, description, category, or location.
- Filter reports by type.
- Generate ranked lost-and-found match suggestions.
- Display match scores and matching reasons.
- Store reports persistently in SQLite.
- Validate report submissions.
- Run automated tests for the matching algorithm.

## Technology Stack

- **Frontend:** React, CSS, Vite
- **Backend:** Node.js, Express
- **Database:** SQLite using better-sqlite3
- **API:** REST endpoints using JSON
- **Testing:** Node.js built-in test assertions

## How It Works

The frontend communicates with an Express REST API. Reports are stored in a SQLite database.

The matching engine compares lost and found reports using three signals:

1. **Category match:** Adds 40 points when categories match.
2. **Location match:** Adds 25 points when locations match.
3. **Description similarity:** Adds up to 35 points using Jaccard similarity over unique words.

The resulting score is capped at 100. The system also returns reasons explaining the score.

These scores are rule-based rankings, not probabilities or verified ownership claims.

## Project Structure

```text
FindIt/
├── backend/
│   ├── server.js
│   ├── database.js
│   ├── matching.js
│   ├── test-matching.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    └── package.json
```

## Running Locally

### Backend

Open a terminal in the `backend` directory:

```bash
npm install
npm run dev
```

The API runs at `http://localhost:3000`.

Health check: `http://localhost:3000/api/health`

### Frontend

Open a second terminal in the `frontend` directory:

```bash
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

### Tests

From the backend directory:

```bash
npm test
```

## Limitations

- Matching uses simple word overlap and exact category/location comparisons.
- Similarity scores do not establish ownership.
- User authentication and authorization are not implemented.
- Contact information is currently stored with reports.
- The application is intended as a local development project, not a production deployment.

## Future Improvements

- Add user authentication and authorization.
- Protect contact details and provide a safer contact workflow.
- Improve text similarity using stemming, synonyms, or TF-IDF.
- Add report resolution and ownership verification workflows.
- Expand automated tests to cover API validation and database operations.

## Author

Developed as a campus lost-and-found application project.