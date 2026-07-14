const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000")

// ------------------- LINKS -------------------

// Get all links
export async function getAllLinks() {
  const res = await fetch(`${BASE_URL}/links`);
  return await res.json();
}

// Get a single link by ID
export async function getLinkById(id) {
  const res = await fetch(`${BASE_URL}/links/${id}`);
  return await res.json();
}

// Get links by collection
export async function getLinksByCollection(collectionId) {
  const res = await fetch(`${BASE_URL}/links/collection/${collectionId}`);
  return await res.json();
}

// Get unassigned links
export async function getUnassignedLinks() {
  const res = await fetch(`${BASE_URL}/links/unassigned`);
  return await res.json();
}

// Add a new link
export async function addLink(link) {
  const res = await fetch(`${BASE_URL}/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(link)
  });
  return await res.json();
}

// Update an existing link
export async function updateLink(id, updatedFields) {
  const res = await fetch(`${BASE_URL}/links/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedFields)
  });
  return await res.json();
}

// Delete a link
export async function deleteLink(id) {
  const res = await fetch(`${BASE_URL}/links/${id}`, {
    method: "DELETE"
  });
  return await res.json();
}

// ------------------- COLLECTIONS -------------------

// Get all collections
export async function getAllCollections() {
  const res = await fetch(`${BASE_URL}/collections`);
  return await res.json();
}

// Get a single collection by ID
export async function getCollectionById(id) {
  const res = await fetch(`${BASE_URL}/collections/${id}`);
  return await res.json();
}

// Add a new collection
export async function addCollection(collection) {
  const res = await fetch(`${BASE_URL}/collections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(collection)
  });
  return await res.json();
}

// Update an existing collection
export async function updateCollection(id, updatedFields) {
  const res = await fetch(`${BASE_URL}/collections/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedFields)
  });
  return await res.json();
}

// Delete a collection
export async function deleteCollection(id) {
  const res = await fetch(`${BASE_URL}/collections/${id}`, {
    method: "DELETE"
  });
  return await res.json();
}