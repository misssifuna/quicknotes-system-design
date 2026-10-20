
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.querySelector("#load-btn");
const statusMessage = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");

const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitButton = document.querySelector("#submit-btn");

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function displayNotes(notes) {
  notesList.replaceChildren();

  notes.forEach((note) => {
    const item = document.createElement("li");
    const title = document.createElement("h3");
    const body = document.createElement("p");

    title.textContent = note.title;
    body.textContent = note.body;

    item.append(title, body);
    notesList.appendChild(item);
  });
}

async function loadNotes() {
  loadButton.disabled = true;
  statusMessage.textContent = "Loading notes...";
  statusMessage.className = "";

  try {
    const notes = await request(`${API_URL}?_limit=10`);

    displayNotes(notes);

    if (notes.length === 0) {
      statusMessage.textContent = "No notes found.";
    } else {
      statusMessage.textContent =
        `Loaded ${notes.length} notes from the server.`;
    }

    statusMessage.className = "success";
  } catch (error) {
    statusMessage.textContent =
      "Unable to load notes. Please check your connection and try again.";
    statusMessage.className = "error";
    console.error("Error loading notes:", error);
  } finally {
    loadButton.disabled = false;
  }
}


async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    statusMessage.textContent = "Please enter a note title.";
    statusMessage.className = "error";
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    statusMessage.textContent = "The title must be 100 characters or fewer.";
    statusMessage.className = "error";
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  statusMessage.textContent = "Creating note...";
  statusMessage.className = "";

  try {
    const newNote = await request(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        body,
        userId: 1
      })
    });

    const item = document.createElement("li");
    const heading = document.createElement("h3");
    const paragraph = document.createElement("p");

    heading.textContent = newNote.title;
    paragraph.textContent = newNote.body || "";

    item.append(heading, paragraph);
    notesList.prepend(item);

    statusMessage.textContent =
      `Note created (status 201, id ${newNote.id}).`;
    statusMessage.className = "success";

    noteForm.reset();
  } catch (error) {
    statusMessage.textContent =
      "Unable to create the note. Please try again.";
    statusMessage.className = "error";
    console.error("Error creating note:", error);
  } finally {
    submitButton.disabled = false;
  }
}

noteForm.addEventListener("submit", createNote);

loadButton.addEventListener("click", loadNotes);
