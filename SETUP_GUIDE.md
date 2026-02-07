# UniConnect Setup Guide

## Prerequisites
- PHP 7.4+
- MySQL/MariaDB running on port 3308
- Node.js (optional, for frontend testing)

## Step 1: Start MySQL
Make sure MySQL/MariaDB is running on port 3308.

## Step 2: Set Up Database
From the project root, run:
```bash
cd UniConnectBackend
php setup_database.php
```

This will create the database and all tables.

## Step 3: Start PHP Development Server
From the project root, run:
```bash
php -S localhost:8000
```

This starts a local PHP server. Your application will be at `http://localhost:8000/frontend/lost.html`

## Step 4: Test the Application
- Open browser: `http://localhost:8000/frontend/lost.html`
- Try adding a lost or found item
- The data should be saved to the database

## Troubleshooting

### ERR_EMPTY_RESPONSE
- Make sure PHP development server is running
- Check PHP error logs
- Verify database is running and configured correctly

### Database Connection Failed
- Verify MySQL is running on port 3308
- Check credentials in `database.php`:
  - host: localhost
  - port: 3308
  - user: root
  - password: (empty)

### Items Not Loading
- Check browser console for errors
- Check PHP error logs
- Verify database tables were created successfully
