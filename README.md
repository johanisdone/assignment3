# Assignment 3: Employee App Backend Integration

Express and MongoDB backend for the supplied Employee App frontend. All backend code is in `app.js`. Existing starter code and all files in `dist` are preserved.

## Setup

1. Run `npm install`.
2. Copy `.env.example` to `.env`.
3. Create an Atlas database user and allow your development machine's IP in Atlas Network Access.
4. Set `MONGODB_URI` in `.env` to your Atlas connection string, including database name. URL-encode special characters in the password.
5. Run `npm start` and open http://localhost:3000.

The server connects to MongoDB before accepting requests. Keep `.env` out of Git.

## API

| Method | Endpoint | Action |
| --- | --- | --- |
| GET | `/api/employeelist` | List all employees |
| GET | `/api/employeelist/:id` | Get one employee |
| POST | `/api/employeelist` | Add employee |
| PUT | `/api/employeelist` | Update employee using `_id` in body (frontend contract) |
| PUT | `/api/employeelist/:id` | Update employee using URL ID |
| DELETE | `/api/employeelist/:id` | Delete employee |

POST and PUT accept `name`, `position`, `location`, and `salary`. PUT to the collection endpoint also requires `_id`. Text fields must be nonempty and salary must be non-negative. Responses are JSON; invalid inputs return 400, missing employees return 404, and database failures return 500.

```json
{
  "name": "Alex Thomas",
  "position": "Developer",
  "location": "Kochi",
  "salary": 45000
}
```

Run `npm run check` for a JavaScript syntax check. The supplied frontend is served directly by Express and needs no build step.
