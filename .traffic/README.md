# 📈 GitHub Traffic Analytics History

This folder automatically archives the clone metrics for this repository. GitHub only keeps clone insights for **14 days**, so a workflow saves daily snapshots and merges them into a permanent, long-term history.

## 📂 Data Structure

The workflow writes one file into the `.traffic` folder on the `main` branch:

*   **`clones_history.json`**
    Tracks how many times the repository has been cloned.
    *   `timestamp`: Day of the measurement (UTC).
    *   `count`: Total number of clones.
    *   `uniques`: Number of unique cloners.

The file contains a JSON array with one entry per day, sorted by date.

## ⚙️ How it Works

1. The GitHub Action `GitHub Traffic History` (`.github/workflows/traffic-history.yml`) runs daily at midnight UTC and can also be started manually.
2. It requests the official GitHub Traffic API (`clones`, last 14 days) using a Personal Access Token stored as the secret `TRAFFIC_TOKEN`.
3. The new days are merged into the history file by date. New values replace existing ones for the same day, older days are kept.
4. If anything changed, the bot commits the updated file directly to `main` with the message `chore: update repository traffic analytics [skip ci]`.

---
*Data collected automatically by the workflow in this repository.*
