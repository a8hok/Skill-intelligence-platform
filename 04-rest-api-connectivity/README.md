# 04 - Frontend REST API Connectivity

## Learning goal
Understand this flow:

```text
React -> HTTP GET -> Express -> JSON -> React UI
```

Backend endpoint:

```http
GET /api/topics
```

React calls it using `fetch()` and renders the topic cards.
