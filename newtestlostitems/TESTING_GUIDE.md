# Lost & Found System - Testing Guide

## Quick Start

### Step 1: Set Up the Database
The database needs to be initialized with the schema before testing.

**Option A: Using PHP Script**
```bash
# Navigate to the project folder
cd c:\Users\espace\Downloads\newtestlostitems

# Run the setup script
php setup_database.php
```

**Option B: Manual Setup**
- Open phpMyAdmin
- Create a database named `uniconnect`
- Go to the SQL tab and paste the contents of `shema.sql`
- Execute the SQL

### Step 2: Start the Local Server
```bash
# In the project folder
php -S localhost:8000
```

### Step 3: Test the Application
1. Open your browser and go to: `http://localhost:8000/lost.html`
2. Test the report form by filling in the form and submitting
3. Check if the message appears and the item is added to the list

---

## Testing the Database Connection

### Test 1: Check Database Connection
Visit: `http://localhost:8000/database.php?test_connection`

Expected Response:
```json
{"status": "success", "message": "Database connection is working."}
```

---

### Test 2: Check API Endpoint
Visit: `http://localhost:8000/api/lostandfound.php?status=lost`

Expected Response:
```json
[]
```
(Empty array initially, or list of items if data exists)

---

### Test 3: Submit a Lost Item Report
1. Go to `http://localhost:8000/lost.html`
2. Click "Report Lost Item"
3. Fill in the form:
   - **Item Name:** Black Wallet
   - **Category:** Wallet
   - **Description:** Lost my black leather wallet
   - **Location:** Library, 2nd Floor
   - **Date Lost:** 2024-02-06
   - **Email:** test@example.com
4. Click "Submit"

Expected Result:
- Success modal appears with message "Your lost item report has been submitted successfully."
- Item appears in the "Lost Items" section

---

## Debugging Issues

### Issue: "Empty response from server"
**Solution:** Check the browser Console (F12) for detailed errors:
1. Open Developer Tools (F12)
2. Go to the "Network" tab
3. Click the form submit button again
4. Look for the `lostandfound.php` request
5. Click on it and check the Response tab

### Issue: "Database connection failed"
**Solution:**
1. Verify MySQL is running
2. Check database credentials in `database.php` and `api/lostandfound.php`
3. Ensure the `uniconnect` database exists
4. Run `php setup_database.php` again

### Issue: "Database error: SQLSTATE"
**Solution:**
1. Verify the `lost_found_items` table exists
2. Check table schema matches the code expectations
3. Run the setup script again to recreate the table

---

## File Structure
```
project/
├── lost.html           # Main page
├── lost.js             # JavaScript for form handling
├── lost.css            # Styling
├── database.php        # Database connection class
├── api/
│   └── lostandfound.php  # API endpoints
├── shema.sql           # Database schema
└── setup_database.php  # Database initialization script
```

---

## Troubleshooting Checklist
- [ ] PHP server is running (`php -S localhost:8000`)
- [ ] MySQL/MariaDB service is running
- [ ] Database `uniconnect` is created
- [ ] Table `lost_found_items` exists
- [ ] File permissions are correct
- [ ] Browser console shows no errors (F12)
- [ ] Network tab shows successful API responses

---

## Contact Email for Testing
Use any valid email for testing, e.g., `test@example.com`
