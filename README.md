# QuickNotes System Design

## Project Overview

QuickNotes is a simple notes application that demonstrates how to build a browser-based API client and design the backend architecture for a scalable note-taking system.

The application allows users to retrieve notes, create new notes, and delete notes using HTTP requests. The project also documents the proposed REST API, relational database schema, and system architecture required to support growth.

**Repository:** [QuickNotes System Design](https://github.com/misssifuna/quicknotes-system-design)

## Features

- Retrieve notes using HTTP GET requests.
- Create notes using HTTP POST requests.
- Delete notes using HTTP DELETE requests.
- Validate note titles before submission.
- Display loading, success, error, and empty states.
- Handle failed API requests.
- Disable relevant buttons while requests are in progress.
- Safely display user-provided text using `textContent`.

## Technologies Used

- HTML5
- CSS3
- JavaScript (Fetch API, async/await, and promises)
- JSONPlaceholder REST API
- Git and GitHub
- Markdown and Mermaid for technical documentation
- MySQL for the proposed relational data model

## How to Run the Application

### Prerequisites

- A modern web browser.
- An internet connection.
- A code editor such as Visual Studio Code.

### Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/misssifuna/quicknotes-system-design.git
   ```

2. Open the project folder:

   ```bash
   cd quicknotes-system-design
   ```

3. Open `index.html` directly in your browser, or open the project in Visual Studio Code and run it using the Live Server extension.

4. Click **Load Notes** to retrieve notes from the API. Use the form to create a note, or use a delete button to remove a note from the displayed list.

The application requires an internet connection because it uses JSONPlaceholder as its external API.

### Important Note About Data Persistence

JSONPlaceholder is a testing API. It simulates create and delete operations but does not permanently save these changes on its server. Notes created through this application will not persist as real records on JSONPlaceholder.

The documented QuickNotes backend is a proposed production design and is not implemented as part of this browser-based project.

## Technical Documentation

The following documents explain the proposed backend and system design:

1. [API Design](docs/api-design.md) — REST endpoints, HTTP methods, response codes, request examples, and error handling.
2. [Data Model](docs/data-model.md) — Users, notes, tags, relationships, SQL table definitions, and example queries.
3. [System Architecture](docs/architecture.md) — Functional requirements, capacity estimates, architecture diagram, request flows, design trade-offs, and failure mitigation.

## What I Learned

Through this project, I learned how to:

1. **Work with REST APIs:** Use GET, POST, and DELETE requests with JavaScript's Fetch API and handle asynchronous operations using `async/await`.
2. **Handle errors and user feedback:** Validate input, check HTTP response status codes, manage loading states, and display success or error messages.
3. **Design a relational database:** Define tables, primary keys, foreign keys, indexes, and one-to-many and many-to-many relationships.
4. **Document an API:** Specify endpoints, request and response formats, authentication expectations, and appropriate HTTP status codes.
5. **Plan for scalability:** Estimate traffic and storage needs and understand the roles of load balancers, caches, database replicas, queues, and background workers.
6. **Use Git and GitHub:** Track changes through meaningful commits and push project work to a remote repository.

## Future Improvements

- Implement a real backend API and persistent database.
- Add user registration and authentication.
- Support editing notes and assigning tags.
- Add automated tests for API requests and user interactions.
- Deploy the application and backend to a production environment.

## Author

**Ebenezer Sifuna**

GitHub: [@misssifuna](https://github.com/misssifuna)
