// Point this at your deployed backend when live.
// For local dev: "http://localhost:5000"
// For production: "https://your-backend.onrender.com"
const API_URL = "https://link-vault-p0sw.onrender.com";

// Auto-fill current tab's title and URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  document.getElementById("name").value = tab.title;   // FIX: field is now "name" not "title"
  document.getElementById("url").value = tab.url;
});

// Check if server is reachable
async function checkServer() {
  try {
    await fetch(`${API_URL}/`);
    document.getElementById("status").textContent = "Server online";
    document.getElementById("status").style.color = "green";
  } catch {
    document.getElementById("status").textContent = "Server offline";
    document.getElementById("status").style.color = "red";
    document.getElementById("save").disabled = true;  // FIX: disable save if server is down
  }
}

// Load collections into the dropdown
async function loadCollections() {
  try {
    const res = await fetch(`${API_URL}/collections`);
    const collections = await res.json();
    const select = document.getElementById("collection");

    // Add a "No collection" default option first
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "No collection";
    select.appendChild(defaultOption);

    collections.forEach(col => {
      const option = document.createElement("option");
      option.value = col.id;
      option.textContent = col.name;
      select.appendChild(option);
    });
  } catch {
    // server offline — checkServer already handles the UI
  }
}

checkServer();
loadCollections();

// Save the link
document.getElementById("save").addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const url = document.getElementById("url").value.trim();
  const collectionId = document.getElementById("collection").value;

  if (!name || !url) {
    alert("Name and URL are required");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,                                    
        url,
        collectionId: collectionId ? Number(collectionId) : null  
      })
    });

    if (!res.ok) throw new Error("Save failed");

    const data = await res.json();

    if (data.duplicate) {
      document.getElementById("status").textContent = "Already in your vault!";
      document.getElementById("status").style.color = "orange";
      setTimeout(() => window.close(), 1200);
      return;
    }

    // Show a brief success message before closing
    document.getElementById("status").textContent = "Saved!";
    document.getElementById("status").style.color = "green";
    setTimeout(() => window.close(), 800);

  } catch {
    document.getElementById("status").textContent = "Failed to save";
    document.getElementById("status").style.color = "red";
  }
});
