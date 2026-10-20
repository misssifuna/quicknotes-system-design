# QuickNotes REST API Design

## 1. Overview

The QuickNotes REST API allows authenticated users to create, read, update, and delete notes. Users can also organize notes using tags.

**Base URL:** `https://api.quicknotes.example/v1`

**Data format:** JSON

**Authentication:** Bearer token in the `Authorization` header.

Example:

`Authorization: Bearer <access_token>`

The `.example` domain is a placeholder for the proposed backend, not a deployed service.

## 2. API Endpoints

| Method | Endpoint               | Description                                          | Success status |
| ------ | ---------------------- | ---------------------------------------------------- | -------------- |
| GET    | `/notes`               | List the authenticated user's notes, with pagination | 200 OK         |
| GET    | `/notes/{noteId}`      | Retrieve a single note                               | 200 OK         |
| POST   | `/notes`               | Create a note                                        | 201 Created    |
| PUT    | `/notes/{noteId}`      | Replace an existing note                             | 200 OK         |
| DELETE | `/notes/{noteId}`      | Delete a note                                        | 204 No Content |
| GET    | `/tags`                | List the user's tags                                 | 200 OK         |
| POST   | `/notes/{noteId}/tags` | Associate a tag with a note                          | 201 Created    |

All note endpoints operate within the authenticated user's account. A user must not be able to read, modify, or delete another user's notes.

## 3. List Notes

**Request**

`GET /v1/notes?page=1&limit=10`

Headers:

`Authorization: Bearer <access_token>`

**Response — 200 OK**

```json
{
  "data": [
    {
      "id": 101,
      "userId": 7,
      "title": "My first note",
      "body": "Learning REST API design.",
      "createdAt": "2026-10-20T10:00:00Z",
      "updatedAt": "2026-10-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

The server returns only notes owned by the authenticated user. Pagination limits response size.

## 4. Create a Note

**Request**

`POST /v1/notes`

Headers:

`Content-Type: application/json`

`Authorization: Bearer <access_token>`

Request body:

```json
{
  "title": "My first note",
  "body": "Learning REST API design."
}
```

The title is required and must contain no more than 100 characters. The body is optional. The server derives the user ID from the authenticated session rather than trusting a user-supplied ID.

**Response — 201 Created**

```json
{
  "id": 101,
  "userId": 7,
  "title": "My first note",
  "body": "Learning REST API design.",
  "createdAt": "2026-10-20T10:00:00Z",
  "updatedAt": "2026-10-20T10:00:00Z"
}
```

The server assigns the new note ID and timestamps. It should also return a `Location` header identifying `/v1/notes/101`.

## 5. Update a Note

**Request**

`PUT /v1/notes/101`

```json
{
  "title": "Updated note",
  "body": "Updated content."
}
```

**Response — 200 OK**

```json
{
  "id": 101,
  "userId": 7,
  "title": "Updated note",
  "body": "Updated content.",
  "createdAt": "2026-10-20T10:00:00Z",
  "updatedAt": "2026-10-20T11:00:00Z"
}
```

Only the owner may update the note.

## 6. Delete a Note

**Request**

`DELETE /v1/notes/101`

**Response — 204 No Content**

The server deletes the note and returns an empty response body. Repeating the request for a note that no longer exists returns `404 Not Found` under this API's chosen behavior.

## 7. List Tags

**Request**

`GET /v1/tags`

**Response — 200 OK**

```json
{
  "data": [
    {
      "id": 3,
      "name": "Learning"
    },
    {
      "id": 4,
      "name": "Work"
    }
  ]
}
```

## 8. Associate a Tag with a Note

**Request**

`POST /v1/notes/101/tags`

```json
{
  "tagId": 3
}
```

**Response — 201 Created**

```json
{
  "noteId": 101,
  "tagId": 3
}
```

The server verifies that the user owns the note and is authorized to use the tag before creating the association.

## 9. Error Handling

The API uses standard HTTP status codes and returns a consistent JSON error format.

| Status | Meaning               | Example situation                        |
| ------ | --------------------- | ---------------------------------------- |
| 400    | Bad Request           | Missing title or invalid input           |
| 401    | Unauthorized          | Missing or invalid authentication token  |
| 403    | Forbidden             | Authenticated user lacks permission      |
| 404    | Not Found             | Note does not exist or is not accessible |
| 500    | Internal Server Error | Unexpected server failure                |

**Example — 400 Bad Request**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The title is required and must be 100 characters or fewer.",
    "details": {
      "field": "title"
    }
  }
}
```

**Example — 401 Unauthorized**

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required."
  }
}
```

**Example — 403 Forbidden**

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action."
  }
}
```

**Example — 404 Not Found**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested note was not found."
  }
}
```

**Example — 500 Internal Server Error**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later."
  }
}
```

The API must not expose passwords, tokens, stack traces, or other sensitive internal details in error responses.

## 10. Design Decisions

- **Resource-oriented URLs:** Notes and tags are represented as resources, with HTTP methods describing the requested operation.
- **Stateless authentication:** Each protected request includes its bearer token, so the server does not depend on session state held by a particular application server.
- **Pagination:** The list endpoint supports `page` and `limit` to avoid returning every note in a single response.
- **Validation:** The server validates input even when the browser also validates the form.
- **Authorization:** Authentication identifies the user; authorization ensures that the user can access only permitted resources.
- **Appropriate status codes:** The API distinguishes successful creation, successful retrieval, validation failures, authentication failures, authorization failures, missing resources, and server errors.

## 11. Relationship to the Browser Client

The current QuickNotes browser client uses JSONPlaceholder at `https://jsonplaceholder.typicode.com/posts` for demonstration and testing. It does not connect to the proposed `/v1` backend described here.

JSONPlaceholder simulates create and delete operations rather than permanently storing these changes. A production implementation would require a real backend, persistent database, authentication, and authorization.
