document.getElementById("add-type-btn").addEventListener("click", () => {
  const container = document.getElementById("types-container");

  const typeDiv = document.createElement("div");
  typeDiv.className =
    "type-item space-y-2 border p-4 rounded-lg relative bg-gray-50";

  typeDiv.innerHTML = `
    <div class="flex justify-between items-center">
      <h4 class="font-semibold">Add Product Type</h4>
      <button type="button" class="remove-type text-red-500 text-3xl">&times;</button>
    </div>
    <input type="text" class="type-name w-full p-2 border rounded" placeholder="Type Name" />
    <input type="text" class="type-image w-full p-2 border rounded" placeholder="Type Image URL" />
    <input type="number" step="0.01" class="type-price w-full p-2 border rounded" placeholder="Type Price" />
    <textarea class="type-description w-full p-2 border rounded" placeholder="Type Description"></textarea>
  `;

  container.appendChild(typeDiv);

  // Add remove event
  typeDiv.querySelector(".remove-type").addEventListener("click", () => {
    container.removeChild(typeDiv);
  });
});

// Handle Product Form Submission
document
  .getElementById("product-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const image = document.getElementById("image").value;
    const description = document.getElementById("description").value;

    const typeDivs = document.querySelectorAll(".type-item");
    const types = Array.from(typeDivs)
      .map((div) => ({
        name: div.querySelector(".type-name")?.value,
        image: div.querySelector(".type-image")?.value,
        description: div.querySelector(".type-description")?.value,
        price: parseFloat(div.querySelector(".type-price")?.value),
      }))
      .filter((t) => t.name && t.image && t.description && !isNaN(t.price));

    try {
      const response = await fetch("http://localhost:5000/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image, description, types }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Product added successfully!");
      } else {
        alert(data.error || "Error adding product");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  });
