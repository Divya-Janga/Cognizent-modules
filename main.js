// === Task 1: Basic Setup ===
console.log("Welcome to the Community Portal");
window.onload = () => alert("Page fully loaded! Welcome to the Community Portal");

// === Task 5: Event Class with Prototype Method ===
class Event {
  constructor(name, date, seats, category, location) {
    this.name = name;
    this.date = new Date(date);
    this.seats = seats;
    this.category = category;
    this.location = location;
  }
}

Event.prototype.checkAvailability = function () {
  const now = new Date();
  return this.date > now && this.seats > 0;
};

// === Task 6: Array and Methods for managing events ===
let eventsList = [];

// Mock API fetch simulation (Task 9)
const fetchEventsFromAPI = () => {
  const mockData = [
    new Event("Jazz Night", "2025-06-15", 20, "Music", "Park"),
    new Event("Baking Workshop", "2025-06-10", 0, "Workshop", "Community Hall"),
    new Event("Community Soccer", "2025-06-25", 15, "Sports", "Park"),
    new Event("Rock Concert", "2025-05-01", 10, "Music", "Auditorium"), // past event
    new Event("Yoga Workshop", "2025-06-18", 5, "Workshop", "Community Hall"),
  ];

  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData), 1500);
  });
};

// === Task 4: Functions ===
// Closure to track registrations per category
const registrationTracker = () => {
  const counts = {};
  return (category) => {
    counts[category] = (counts[category] || 0) + 1;
    return counts[category];
  };
};
const trackRegistration = registrationTracker();

// Add event to list
function addEvent(event) {
  eventsList.push(event);
}

// Register user for event
function registerUser(eventName) {
  const event = eventsList.find((ev) => ev.name === eventName);
  if (!event) throw new Error("Event not found");
  if (!event.checkAvailability()) throw new Error("Event is full or past");
  event.seats--;
  trackRegistration(event.category);
  return event;
}

// Filter events by category (callback passed)
function filterEventsByCategory(category, callback) {
  return eventsList.filter((event) =>
    category ? callback(event, category) : true
  );
}

// === Task 7 & 8: DOM Manipulation and Event Handling ===

const eventsContainer = document.querySelector("#eventsContainer");
const categoryFilter = document.querySelector("#categoryFilter");
const locationFilter = document.querySelector("#locationFilter");
const searchInput = document.querySelector("#searchInput");
const registrationForm = document.querySelector("#registrationForm");
const eventSelect = registrationForm.elements["eventSelect"];
const loadingIndicator = document.querySelector("#loading");
const formError = document.querySelector("#formError");
const formSuccess = document.querySelector("#formSuccess");
const registerBtn = document.querySelector("#registerBtn");

// Render event cards
function renderEvents(events) {
  eventsContainer.innerHTML = "";
  eventSelect.innerHTML = '<option value="">Select Event</option>';
  if (events.length === 0) {
    eventsContainer.innerHTML = "<p>No events to show</p>";
    return;
  }
  events.forEach((event) => {
    if (!event.checkAvailability()) return;

    // Add option to registration select
    const option = document.createElement("option");
    option.value = event.name;
    option.textContent = `${event.name} (${event.date.toLocaleDateString()})`;
    eventSelect.appendChild(option);

    // Create card
    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <h3>${event.name}</h3>
      <p class="event-info">Date: ${event.date.toLocaleDateString()}</p>
      <p class="event-info">Seats Available: ${event.seats}</p>
      <p class="event-info">Category: ${event.category}</p>
      <p class="event-info">Location: ${event.location}</p>
    `;

    const btn = document.createElement("button");
    btn.textContent = "Register";
    btn.className = "register-btn";
    btn.disabled = event.seats <= 0 || event.date <= new Date();
    btn.onclick = () => {
      registrationForm.elements["eventSelect"].value = event.name;
      window.scrollTo({ top: registrationForm.offsetTop, behavior: "smooth" });
    };

    card.appendChild(btn);
    eventsContainer.appendChild(card);
  });
}

// Filter and search combined
function applyFilters() {
  const cat = categoryFilter.value;
  const loc = locationFilter.value;
  const searchTerm = searchInput.value.toLowerCase();

  let filtered = eventsList.filter(
    (ev) =>
      (cat === "" || ev.category === cat) &&
      (loc === "" || ev.location === loc) &&
      ev.name.toLowerCase().includes(searchTerm)
  );
  filtered = filtered.filter((ev) => ev.checkAvailability());

  renderEvents(filtered);
}

// Handle form submit
registrationForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.textContent = "";
  formSuccess.textContent = "";

  const name = registrationForm.elements["userName"].value.trim();
  const email = registrationForm.elements["userEmail"].value.trim();
  const eventName = registrationForm.elements["eventSelect"].value;

  if (!name || !email || !eventName) {
    formError.textContent = "Please fill all fields.";
    return;
  }

  // Basic email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    formError.textContent = "Please enter a valid email address.";
    return;
  }

  try {
    registerUser(eventName);

    // Simulate POST with fetch & delay (Task 12)
    await new Promise((res) => setTimeout(res, 1000)); // simulate delay

    // Fake POST request (replace with real API in real project)
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify({ name, email, eventName }),
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to register");

    formSuccess.textContent = `Successfully registered for "${eventName}"!`;
    registrationForm.reset();
    applyFilters();
  } catch (err) {
    formError.textContent = err.message;
  }
});

// Event listeners for filters and search
categoryFilter.addEventListener("change", applyFilters);
locationFilter.addEventListener("change", applyFilters);
searchInput.addEventListener("keydown", (e) => {
  // On enter key apply filter
  if (e.key === "Enter") {
    e.preventDefault();
    applyFilters();
  }
});

// Initialization - load events
async function init() {
  loadingIndicator.style.display = "block";
  try {
    const fetchedEvents = await fetchEventsFromAPI();
    eventsList = [...fetchedEvents]; // Clone using spread (Task 10)
    applyFilters();
  } catch (e) {
    eventsContainer.innerHTML = "<p>Error loading events.</p>";
  } finally {
    loadingIndicator.style.display = "none";
  }
}

init();
