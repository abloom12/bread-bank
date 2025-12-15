## Here's the general roadmap:

### Database Setup

1. Install PostgreSQL via Homebrew and start the service
2. Create a database (e.g., bread_bank)
3. Install pg package in server workspace
4. Set up database connection using DATABASE_URL env var

### Backend

5. Create your first migration file - expenses table (think about what columns an expense needs)
6. Run the migration against your database
7. Build POST /api/expenses - receives expense data, inserts into DB
8. Build GET /api/expenses - queries DB, returns list

### Frontend

9. Create an expenses route/page
10. Build a form to add an expense
11. Build a list to display expenses
12. Wire up form submission to POST endpoint
13. Wire up list to fetch from GET endpoint

### The core loop is complete when:

- You can fill out the form, hit submit
- It saves to Postgres
- It appears in your list
