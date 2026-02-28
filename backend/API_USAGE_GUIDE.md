# API Usage Guide - Registration & Login

## Registration Endpoint

### Endpoint
```
POST /api/v1/auth/register
```

### Required Fields

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

### Optional Fields

```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "full_name": "John Doe",
  "company_name": "Acme Corp",
  "industry": "Technology"
}
```

### Complete Example

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "company_name": "Acme Corporation",
  "industry": "Technology"
}
```

### Password Requirements

- ✅ Minimum: 6 characters
- ✅ Maximum: 72 characters

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "user_id": "uuid-here",
    "email": "john.doe@example.com",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "is_first_login": true
  },
  "message": "User registered successfully"
}
```

### Error Responses

**400 - Email Already Registered**
```json
{
  "detail": "Email already registered"
}
```

**422 - Validation Error**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

**422 - Password Too Short**
```json
{
  "detail": [
    {
      "loc": ["body", "password"],
      "msg": "Password must be at least 6 characters long",
      "type": "value_error"
    }
  ]
}
```

**422 - Password Too Long**
```json
{
  "detail": [
    {
      "loc": ["body", "password"],
      "msg": "Password must be at most 72 characters long",
      "type": "value_error"
    }
  ]
}
```

---

## Login Endpoint

### Endpoint
```
POST /api/v1/auth/login
```

### Required Fields

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "user_id": "uuid-here",
    "email": "john.doe@example.com",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "is_first_login": false
  },
  "message": "Login successful"
}
```

### Error Responses

**401 - Invalid Credentials**
```json
{
  "detail": "Incorrect email or password"
}
```

**403 - Account Inactive**
```json
{
  "detail": "Account is inactive"
}
```

---

## Common 422 Errors and Fixes

### Error: Missing Required Field

**Problem:**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Fix:** Include the `email` field in your request

### Error: Invalid Email Format

**Problem:**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

**Fix:** Use a valid email format (e.g., `user@example.com`)

### Error: Password Validation

**Problem:**
```json
{
  "detail": [
    {
      "loc": ["body", "password"],
      "msg": "Password must be at least 6 characters long",
      "type": "value_error"
    }
  ]
}
```

**Fix:** Use a password with 6-72 characters

---

## Testing with Swagger UI

1. Go to: http://localhost:8000/docs

2. Find `/api/v1/auth/register` endpoint

3. Click "Try it out"

4. Enter request body:
   ```json
   {
     "email": "test@example.com",
     "password": "Test123456"
   }
   ```

5. Click "Execute"

6. Check response

---

## Testing with cURL

### Register
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "full_name": "Test User"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

---

## Testing with Postman

### Register

1. **Method:** POST
2. **URL:** `http://localhost:8000/api/v1/auth/register`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (raw JSON):**
   ```json
   {
     "email": "test@example.com",
     "password": "Test123456",
     "full_name": "Test User",
     "company_name": "Test Company",
     "industry": "Technology"
   }
   ```

### Login

1. **Method:** POST
2. **URL:** `http://localhost:8000/api/v1/auth/login`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (raw JSON):**
   ```json
   {
     "email": "test@example.com",
     "password": "Test123456"
   }
   ```

---

## Quick Checklist for 422 Errors

When you get a 422 error, check:

- [ ] Is `email` field included?
- [ ] Is `email` in valid format (user@domain.com)?
- [ ] Is `password` field included?
- [ ] Is `password` between 6-72 characters?
- [ ] Is request body valid JSON?
- [ ] Is `Content-Type: application/json` header set?

---

## Minimum Working Example

The absolute minimum request that will work:

```json
{
  "email": "user@example.com",
  "password": "pass123"
}
```

This will:
- ✅ Create a user with the email
- ✅ Hash and store the password
- ✅ Return authentication tokens
- ✅ Set optional fields to null

---

## Summary

**Required Fields:**
- `email` (valid email format)
- `password` (6-72 characters)

**Optional Fields:**
- `full_name`
- `company_name`
- `industry`

**Common Issues:**
- Missing email or password
- Invalid email format
- Password too short (<6) or too long (>72)
- Wrong Content-Type header
