<div align="center">

# 🗺️ DSA Roadmap

### A beautiful, interactive web app to organize and track your Data Structures & Algorithms journey

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![LeetCode](https://img.shields.io/badge/LeetCode-Integrated-FFA116?style=for-the-badge&logo=leetcode&logoColor=white)](https://leetcode.com/)

<br/>

<img src="https://img.shields.io/badge/status-active-success?style=flat-square" alt="Status"/>
<img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"/>

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📂 **Topics & Subtopics** | Organize problems into topics (Arrays, Graphs, DP…) and subtopics (Two Pointers, Sliding Window…) |
| 🔗 **LeetCode Integration** | Just paste a LeetCode URL — title, difficulty, and link are auto-fetched via LeetCode's GraphQL API |
| ✅ **Progress Tracking** | Mark problems as done with a checkbox; see completion stats and progress bars per subtopic |
| ⭐ **Bookmarks** | Bookmark important problems; view all bookmarks in a dedicated tab or filter per subtopic |
| 💻 **Code Solutions** | Save your code solutions directly in the app with a built-in code editor (supports Tab indentation & Ctrl+S) |
| 🌙 **Dark Theme** | Sleek, modern dark UI designed for comfortable long study sessions |
| 🌐 **Network Accessible** | Servers bind to `0.0.0.0` — access from any device on your network |
| 💾 **Persistent Storage** | All data stored in a local SQLite database — no account needed, fully offline-capable |

---

## 🖼️ UI Overview

```
┌─────────────────────────────────────────────────────────────┐
│  DSA Roadmap                                                │
├─────────────────────────────────────────────────────────────┤
│  [Arrays] [Binary Search] [Graphs] [DP] [+ Add]       [🔖] │
├─────────────────────────────────────────────────────────────┤
│  ┌─ Two Pointers ──────────────── 3/5 ████░░ [+] [🔖] [▼] │
│  │                                                          │
│  │  Problem         LC   Done  Difficulty  Bookmark  Code   │
│  │  ─────────────────────────────────────────────────────   │
│  │  Two Sum         🔶    ☑     Easy        ☆         </>   │
│  │  3Sum            🔶    ☐     Medium      ★         </>   │
│  │  3Sum Closest    🔶    ☑     Medium      ☆         </>   │
│  └──────────────────────────────────────────────────────────│
│                                                              │
│  ┌─ Sliding Window ────────────── 0/3 ░░░░░░ [+] [🔖] [▼] │
│  │  ...                                                     │
│  └──────────────────────────────────────────────────────────│
│                                                              │
│  [- - - - - - - - + Add Subtopic - - - - - - - -]          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Project Structure

```
dsa_roadmap_webapp/
│
├── backend/                    # Express.js API server
│   ├── server.js               # REST API routes
│   ├── database.js             # SQLite schema & connection
│   └── package.json
│
├── frontend/                   # React SPA
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js              # Main app component
│   │   ├── api.js              # API client utilities
│   │   ├── index.js            # Entry point
│   │   ├── index.css           # Global styles (dark theme)
│   │   └── components/
│   │       ├── TopicTabs.js    # Topic navigation tabs
│   │       ├── SubtopicCard.js # Collapsible subtopic cards
│   │       ├── ProblemRow.js   # Individual problem row
│   │       ├── BookmarksView.js# Bookmarked problems view
│   │       ├── Modal.js        # Add topic/subtopic/code modals
│   │       └── Icons.js        # SVG icon components
│   └── package.json
│
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd dsa_roadmap_webapp

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Running the App

Open **two terminals**:

```bash
# Terminal 1 — Start the backend (port 5000)
cd backend
node server.js
```

```bash
# Terminal 2 — Start the frontend (port 3000)
cd frontend
npm start
```

Then open your browser at:

| Service | URL |
|---------|-----|
| **Frontend** | `http://localhost:3000` |
| **Backend API** | `http://localhost:5000/api` |

> 💡 Both servers bind to `0.0.0.0`, so you can access the app from other devices on your network using your machine's IP address.

---

## 📡 API Reference

### Topics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/topics` | Get all topics |
| `POST` | `/api/topics` | Create a topic `{ name }` |
| `DELETE` | `/api/topics/:id` | Delete a topic |

### Subtopics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/topics/:id/subtopics` | Get subtopics for a topic |
| `POST` | `/api/subtopics` | Create a subtopic `{ topic_id, name, description }` |
| `DELETE` | `/api/subtopics/:id` | Delete a subtopic |

### Problems

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/subtopics/:id/problems` | Get problems for a subtopic |
| `POST` | `/api/problems` | Create a problem `{ subtopic_id, title, leetcode_url, difficulty }` |
| `PATCH` | `/api/problems/:id/done` | Toggle done status |
| `PATCH` | `/api/problems/:id/bookmark` | Toggle bookmark |
| `PATCH` | `/api/problems/:id/code` | Save code solution `{ code_solution }` |
| `DELETE` | `/api/problems/:id` | Delete a problem |

### Utilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/leetcode/fetch` | Fetch problem info from LeetCode `{ url }` |
| `GET` | `/api/bookmarks` | Get all bookmarked problems |
| `GET` | `/api/subtopics/:id/stats` | Get done/total stats for a subtopic |

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center"><b>Frontend</b></td>
    <td align="center"><b>Backend</b></td>
    <td align="center"><b>Database</b></td>
  </tr>
  <tr>
    <td>
      React 18<br/>
      Custom CSS (Dark Theme)<br/>
      SVG Icons
    </td>
    <td>
      Express.js<br/>
      Node.js<br/>
      node-fetch
    </td>
    <td>
      SQLite 3<br/>
      better-sqlite3<br/>
      WAL mode
    </td>
  </tr>
</table>

---

## 🧩 How It Works

1. **Add a Topic** → Click `+ Add Topic` (e.g., "Arrays", "Dynamic Programming")
2. **Add a Subtopic** → Click `+ Add Subtopic` under a topic (e.g., "Two Pointers")
3. **Add a Problem** → Click the `+ Add` button on a subtopic header, paste a LeetCode URL, and the problem details are auto-fetched
4. **Track Progress** → Check problems as done, watch your progress bar fill up
5. **Bookmark** → Star important problems and find them in the ⭐ Bookmarks tab
6. **Save Solutions** → Click the `</>` code button to open the editor and save your solution

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <br/>
  <b>Happy Coding & Keep Grinding! 💪</b>
  <br/><br/>
  <sub>Built with ❤️ for DSA enthusiasts</sub>
</div>
