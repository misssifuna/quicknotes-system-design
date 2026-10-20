
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.querySelector("#load-btn");
const statusMessage = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");

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

loadButton.addEventListener("click", loadNotes);
