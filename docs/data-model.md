# QuickNotes Data Model

## 1. Overview

QuickNotes uses a relational database to store users, notes, tags, and the relationships between notes and tags.

The design uses primary keys to uniquely identify records and foreign keys to enforce relationships between tables.

## 2. Entities and Columns

### 2.1 Users

| Column        | Data type    | Constraints                 | Description            |
| ------------- | ------------ | --------------------------- | ---------------------- |
| id            | BIGINT       | Primary key, auto-increment | Unique user identifier |
| name          | VARCHAR(100) | NOT NULL                    | User's display name    |
| email         | VARCHAR(255) | NOT NULL, UNIQUE            | User's email address   |
| password_hash | VARCHAR(255) | NOT NULL                    | Secure password hash   |
| created_at    | TIMESTAMP    | NOT NULL                    | Account creation time  |

### 2.2 Notes

| Column     | Data type    | Constraints                 | Description            |
| ---------- | ------------ | --------------------------- | ---------------------- |
| id         | BIGINT       | Primary key, auto-increment | Unique note identifier |
| user_id    | BIGINT       | NOT NULL, foreign key       | Owner of the note      |
| title      | VARCHAR(100) | NOT NULL                    | Note title             |
| body       | TEXT         | Nullable                    | Note content           |
| created_at | TIMESTAMP    | NOT NULL                    | Creation time          |
| updated_at | TIMESTAMP    | NOT NULL                    | Last modification time |

### 2.3 Tags

| Column  | Data type   | Constraints                 | Description           |
| ------- | ----------- | --------------------------- | --------------------- |
| id      | BIGINT      | Primary key, auto-increment | Unique tag identifier |
| user_id | BIGINT      | NOT NULL, foreign key       | User who owns the tag |
| name    | VARCHAR(50) | NOT NULL                    | Tag name              |

A unique constraint on `(user_id, name)` prevents the same user from creating duplicate tag names.

### 2.4 Note Tags

| Column     | Data type | Constraints                        | Description                 |
| ---------- | --------- | ---------------------------------- | --------------------------- |
| note_id    | BIGINT    | Composite primary key, foreign key | Associated note             |
| tag_id     | BIGINT    | Composite primary key, foreign key | Associated tag              |
| created_at | TIMESTAMP | NOT NULL                           | Time the tag was associated |

The composite primary key `(note_id, tag_id)` prevents the same tag from being attached to the same note more than once.

## 3. Relationships

### One-to-many: Users and Notes

One user can own many notes, but each note belongs to one user.

The `notes.user_id` foreign key references `users.id`.

### One-to-many: Users and Tags

One user can create many tags. Each tag belongs to one user.

The `tags.user_id` foreign key references `users.id`.

### Many-to-many: Notes and Tags

One note can have multiple tags, and one tag can be applied to multiple notes.

The `note_tags` junction table implements this relationship:

- `note_tags.note_id` references `notes.id`.
- `note_tags.tag_id` references `tags.id`.

A production application must also verify that a tag and note belong to the same user before creating their association.

## 4. SQL Table Definitions

The following schema uses MySQL 8.0-compatible syntax.

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notes_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(50) NOT NULL,
    CONSTRAINT uq_tags_user_name UNIQUE (user_id, name),
    CONSTRAINT fk_tags_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE note_tags (
    note_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (note_id, tag_id),
    CONSTRAINT fk_note_tags_note
        FOREIGN KEY (note_id) REFERENCES notes(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_note_tags_tag
        FOREIGN KEY (tag_id) REFERENCES tags(id)
        ON DELETE CASCADE
);
```

The `ON DELETE CASCADE` constraints remove dependent notes, tags, or associations when their referenced records are deleted, according to the relationships defined above. This behavior should be selected deliberately for a production system.

## 5. Example SQL Queries

### Query 1: Get all notes belonging to one user

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 7
ORDER BY updated_at DESC;
```

This query returns a user's notes, with recently updated notes first.

### Query 2: Get all tags attached to a note

```sql
SELECT t.id, t.name
FROM tags AS t
JOIN note_tags AS nt ON nt.tag_id = t.id
WHERE nt.note_id = 101
ORDER BY t.name;
```

The join connects each note-tag association to the corresponding tag.

### Query 3: Find notes and their tags

```sql
SELECT n.id, n.title, t.name AS tag_name
FROM notes AS n
JOIN note_tags AS nt ON nt.note_id = n.id
JOIN tags AS t ON t.id = nt.tag_id
WHERE n.user_id = 7
ORDER BY n.id, t.name;
```

This query demonstrates a join across three tables and lists each note alongside its tags.

### Query 4: Count notes per user

```sql
SELECT u.id, u.name, COUNT(n.id) AS note_count
FROM users AS u
LEFT JOIN notes AS n ON n.user_id = u.id
GROUP BY u.id, u.name
ORDER BY note_count DESC;
```

The `LEFT JOIN` includes users who have no notes, reporting a count of zero for them.

## 6. Indexing Strategy

Create an index to speed up queries that retrieve notes belonging to a user and sort them by update time.

```sql
CREATE INDEX idx_notes_user_updated
ON notes (user_id, updated_at);
```

This composite index supports filtering by `user_id` and ordering by `updated_at`. Its effectiveness depends on the query and database execution plan.

The unique email constraint and unique `(user_id, name)` constraint also create indexes in MySQL.

## 7. SQL vs NoSQL

A relational SQL database is a good fit for QuickNotes because the system has clearly defined entities and relationships. Foreign keys maintain referential integrity, while joins make it straightforward to retrieve notes with their tags and aggregate user data.

A NoSQL database could offer more flexible document structures and may suit a system with highly variable note formats or different scaling requirements. However, relationships and consistency would need to be handled according to the chosen NoSQL database's capabilities. For the current requirements, a relational database such as MySQL is a practical starting point.
