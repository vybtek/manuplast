document.getElementById("add-type-btn").addEventListener("click", () => {
  const container = document.getElementById("types-container");
  const typeCount = container.querySelectorAll(".type-item").length;

  const typeDiv = document.createElement("div");
  typeDiv.className =
    "type-item space-y-2 border p-4 rounded-lg relative bg-gray-50";

  typeDiv.innerHTML = `
    <div class="flex justify-between items-center">
      <h4 class="font-semibold">Add Product Type</h4>
      <button type="button" class="remove-type text-red-500 text-3xl" aria-label="Remove Product Type">×</button>
    </div>
    <div>
      <label for="type-name-${typeCount}" class="block text-gray-700 font-medium mb-2">Type Name</label>
      <input
        type="text"
        id="type-name-${typeCount}"
        class="type-name w-full p-2 border rounded"
        placeholder="Type Name"
      />
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-2">Type Images</label>
      <div class="type-images-container space-y-2" data-type-index="${typeCount}">
        <div class="flex items-center space-x-2">
          <input
            type="url"
            class="type-image w-full p-2 border rounded"
            placeholder="Type Image URL"
          />
          <button
            type="button"
            class="remove-image text-red-500"
            aria-label="Remove Image"
          >
            ×
          </button>
        </div>
      </div>
      <button
        type="button"
        class="add-image-btn bg-gray-200 px-3 py-1 mt-2 rounded hover:bg-gray-300"
        data-type-index="${typeCount}"
        aria-label="Add Another Image"
      >
        + Add Image
      </button>
    </div>
    <div>
      <label for="type-description-${typeCount}" class="block text-gray-700 font-medium mb-2">Type Description</label>
      <textarea
        id="type-description-${typeCount}"
        class="type-description w-full p-2 border rounded"
        placeholder="Type Description"
      ></textarea>
    </div>
    <div>
      <label for="type-price-${typeCount}" class="block text-gray-700 font-medium mb-2">Type Price</label>
      <input
        type="number"
        step="0.01"
        id="type-price-${typeCount}"
        class="type-price w-full p-2 border rounded"
        placeholder="Type Price"
      />
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-2">Sizes</label>
      <div class="type-sizes-container space-y-2" data-type-index="${typeCount}">
        <div class="flex items-center space-x-2">
          <input
            type="text"
            class="type-size w-full p-2 border rounded"
            placeholder="Size (e.g., S, M, L)"
          />
          <button
            type="button"
            class="remove-size text-red-500"
            aria-label="Remove Size"
          >
            ×
          </button>
        </div>
      </div>
      <button
        type="button"
        class="add-size-btn bg-gray-200 px-3 py-1 mt-2 rounded hover:bg-gray-300"
        data-type-index="${typeCount}"
        aria-label="Add Another Size"
      >
        + Add Size
      </button>
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-2">Colors</label>
      <div class="type-colors-container space-y-2" data-type-index="${typeCount}">
        <div class="flex items-center space-x-2">
          <input
            type="text"
            class="type-color w-full p-2 border rounded"
            placeholder="Color (e.g., Red, Blue)"
          />
          <button
            type="button"
            class="remove-color text-red-500"
            aria-label="Remove Color"
          >
            ×
          </button>
        </div>
      </div>
      <button
        type="button"
        class="add-color-btn bg-gray-200 px-3 py-1 mt-2 rounded hover:bg-gray-300"
        data-type-index="${typeCount}"
        aria-label="Add Another Color"
      >
        + Add Color
      </button>
    </div>
  `;

  container.appendChild(typeDiv);

  // Add event listeners for dynamic fields
  addDynamicFieldListeners(typeDiv, typeCount);

  // Remove type event
  typeDiv.querySelector(".remove-type").addEventListener("click", () => {
    container.removeChild(typeDiv);
  });
});

// Add event listeners for dynamic image, size, and color fields
function addDynamicFieldListeners(typeDiv, typeIndex) {
  // Add Image
  typeDiv.querySelector(".add-image-btn").addEventListener("click", () => {
    const imagesContainer = typeDiv.querySelector(
      `.type-images-container[data-type-index="${typeIndex}"]`
    );
    const imageDiv = document.createElement("div");
    imageDiv.className = "flex items-center space-x-2";
    imageDiv.innerHTML = `
      <input
        type="url"
        class="type-image w-full p-2 border rounded"
        placeholder="Type Image URL"
      />
      <button
        type="button"
        class="remove-image text-red-500"
        aria-label="Remove Image"
      >
        ×
      </button>
    `;
    imagesContainer.appendChild(imageDiv);
    imageDiv.querySelector(".remove-image").addEventListener("click", () => {
      imagesContainer.removeChild(imageDiv);
    });
  });

  // Add Size
  typeDiv.querySelector(".add-size-btn").addEventListener("click", () => {
    const sizesContainer = typeDiv.querySelector(
      `.type-sizes-container[data-type-index="${typeIndex}"]`
    );
    const sizeDiv = document.createElement("div");
    sizeDiv.className = "flex items-center space-x-2";
    sizeDiv.innerHTML = `
      <input
        type="text"
        class="type-size w-full p-2 border rounded"
        placeholder="Size (e.g., S, M, L)"
      />
      <button
        type="button"
        class="remove-size text-red-500"
        aria-label="Remove Size"
      >
        ×
      </button>
    `;
    sizesContainer.appendChild(sizeDiv);
    sizeDiv.querySelector(".remove-size").addEventListener("click", () => {
      sizesContainer.removeChild(sizeDiv);
    });
  });

  // Add Color
  typeDiv.querySelector(".add-color-btn").addEventListener("click", () => {
    const colorsContainer = typeDiv.querySelector(
      `.type-colors-container[data-type-index="${typeIndex}"]`
    );
    const colorDiv = document.createElement("div");
    colorDiv.className = "flex items-center space-x-2";
    colorDiv.innerHTML = `
      <input
        type="text"
        class="type-color w-full p-2 border rounded"
        placeholder="Color (e.g., Red, Blue)"
      />
      <button
        type="button"
        class="remove-color text-red-500"
        aria-label="Remove Color"
      >
        ×
      </button>
    `;
    colorsContainer.appendChild(colorDiv);
    colorDiv.querySelector(".remove-color").addEventListener("click", () => {
      colorsContainer.removeChild(colorDiv);
    });
  });

  // Remove initial image, size, color
  typeDiv.querySelectorAll(".remove-image").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.parentElement.remove();
    });
  });
  typeDiv.querySelectorAll(".remove-size").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.parentElement.remove();
    });
  });
  typeDiv.querySelectorAll(".remove-color").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.parentElement.remove();
    });
  });
}

// Initialize event listeners for the first type
document.querySelectorAll(".type-item").forEach((typeDiv, index) => {
  addDynamicFieldListeners(typeDiv, index);
});

// Product Form Submission
document
  .getElementById("product-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const image = document.getElementById("image").value;
    const description = document.getElementById("description").value;

    const typeDivs = document.querySelectorAll(".type-item");
    const types = Array.from(typeDivs)
      .map((div, index) => ({
        name: div.querySelector(`#type-name-${index}`)?.value,
        images: Array.from(div.querySelectorAll(`.type-images-container[data-type-index="${index}"] .type-image`))
          .map((input) => input.value)
          .filter((url) => url),
        description: div.querySelector(`#type-description-${index}`)?.value,
        price: parseFloat(div.querySelector(`#type-price-${index}`)?.value),
        sizes: Array.from(div.querySelectorAll(`.type-sizes-container[data-type-index="${index}"] .type-size`))
          .map((input) => input.value)
          .filter((size) => size),
        colors: Array.from(div.querySelectorAll(`.type-colors-container[data-type-index="${index}"] .type-color`))
          .map((input) => input.value)
          .filter((color) => color),
      }))
      .filter((t) => t.name && t.images?.length && t.description && !isNaN(t.price));

    try {
      const response = await fetch("http://localhost:5000/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image, description, types }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Product added successfully!");
        document.getElementById("product-form").reset();
        document.getElementById("types-container").innerHTML = "";
        // Re-add initial type item
        document.getElementById("add-type-btn").click();
      } else {
        alert(data.error || "Error adding product");
      }
    } catch (err) {
      alert("Server error");
    }
  });