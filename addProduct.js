document.addEventListener("DOMContentLoaded", () => {
  fetchCategories();
  setupDynamicFields();
  document.getElementById("product-form").addEventListener("submit", submitProduct);
});

async function fetchCategories() {
  try {
    const response = await fetch("http://localhost:5000/products");
    if (!response.ok) throw new Error("Failed to fetch categories");
    const categories = await response.json();
    const categorySelect = document.getElementById("category");
    categorySelect.innerHTML = '<option value="" disabled selected>Select a Category</option>';
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    alert(`Failed to load categories: ${error.message}`);
  }
}

function setupDynamicFields() {
  const typesContainer = document.getElementById("types-container");
  document.getElementById("add-type-btn").addEventListener("click", () => {
    const typeCount = typesContainer.querySelectorAll(".type-item").length;
    const typeDiv = createTypeDiv({}, typeCount);
    typesContainer.appendChild(typeDiv);
    addDynamicFieldListeners(typeDiv, typeCount);
  });

  // Initial type
  const initialTypeDiv = typesContainer.querySelector(".type-item");
  if (initialTypeDiv) {
    addDynamicFieldListeners(initialTypeDiv, 0);
  }
}

function createTypeDiv(type, index) {
  const typeDiv = document.createElement("div");
  typeDiv.className = "type-item space-y-2 border p-4 rounded-lg";
  typeDiv.innerHTML = `
    <div class="flex justify-between items-center">
      <h4 class="font-semibold">Product Type ${index + 1}</h4>
      <button type="button" class="remove-type text-red-500 text-3xl" aria-label="Remove Product Type">×</button>
    </div>
    <div>
      <label for="type-name-${index}" class="block text-gray-700 font-medium mb-2">Type Name</label>
      <input type="text" id="type-name-${index}" class="type-name w-full p-2 border rounded" placeholder="Type Name" value="${type.name || ""}" />
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-2">Type Images</label>
      <div class="type-images-container space-y-2" data-type-index="${index}">
        ${
          type.images?.length
            ? type.images.map(img => `
              <div class="flex items-center space-x-2">
                <input type="url" class="type-image w-full p-2 border rounded" placeholder="Type Image URL" value="${img}" />
                <button type="button" class="remove-image text-red-500" aria-label="Remove Image">×</button>
              </div>
            `).join("")
            : `
              <div class="flex items-center space-x-2">
                <input type="file" class="type-image w-full p-2 border rounded" placeholder="Type Image URL" />
                <button type="button" class="remove-image text-red-500" aria-label="Remove Image">×</button>
              </div>
            `
        }
      </div>
      <button type="button" class="add-image-btn bg-gray-200 px-3 py-1 mt-2 rounded hover:bg-gray-300" data-type-index="${index}" aria-label="Add Another Image">
        + Add Image
      </button>
    </div>
    <div>
      <label for="type-description-${index}" class="block text-gray-700 font-medium mb-2">Type Description</label>
      <textarea id="type-description-${index}" class="type-description w-full p-2 border rounded" placeholder="Type Description">${type.description || ""}</textarea>
    </div>
    <div>
      <label for="type-price-${index}" class="block text-gray-700 font-medium mb-2">Type Price</label>
      <input type="number" step="0.01" id="type-price-${index}" class="type-price w-full p-2 border rounded" placeholder="Type Price" value="${type.price || ""}" />
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-2">Sizes</label>
      <div class="type-sizes-container space-y-2" data-type-index="${index}">
        ${
          type.sizes?.length
            ? type.sizes.map(size => `
              <div class="flex items-center space-x-2">
                <input type="text" class="type-size w-full p-2 border rounded" placeholder="Size (e.g., S, M, L)" value="${size}" />
                <button type="button" class="remove-size text-red-500" aria-label="Remove Size">×</button>
              </div>
            `).join("")
            : `
              <div class="flex items-center space-x-2">
                <input type="text" class="type-size w-full p-2 border rounded" placeholder="Size (e.g., S, M, L)" />
                <button type="button" class="remove-size text-red-500" aria-label="Remove Size">×</button>
              </div>
            `
        }
      </div>
      <button type="button" class="add-size-btn bg-gray-200 px-3 py-1 mt-2 rounded hover:bg-gray-300" data-type-index="${index}" aria-label="Add Another Size">
        + Add Size
      </button>
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-2">Colors</label>
      <div class="type-colors-container space-y-2" data-type-index="${index}">
        ${
          type.colors?.length
            ? type.colors.map(color => `
              <div class="flex items-center space-x-2">
                <input type="text" class="type-color w-full p-2 border rounded" placeholder="Color (e.g., Red, Blue)" value="${color}" />
                <button type="button" class="remove-color text-red-500" aria-label="Remove Color">×</button>
              </div>
            `).join("")
            : `
              <div class="flex items-center space-x-2">
                <input type="text" class="type-color w-full p-2 border rounded" placeholder="Color (e.g., Red, Blue)" />
                <button type="button" class="remove-color text-red-500" aria-label="Remove Color">×</button>
              </div>
            `
        }
      </div>
      <button type="button" class="add-color-btn bg-gray-200 px-3 py-1 mt-2 rounded hover:bg-gray-300" data-type-index="${index}" aria-label="Add Another Color">
        + Add Color
      </button>
    </div>
  `;
  return typeDiv;
}

function addDynamicFieldListeners(typeDiv, typeIndex) {
  typeDiv.querySelector(".remove-type")?.addEventListener("click", () => {
    typeDiv.remove();
  });

  typeDiv.querySelector(".add-image-btn").addEventListener("click", () => {
    const imagesContainer = typeDiv.querySelector(`.type-images-container[data-type-index="${typeIndex}"]`);
    const imageDiv = document.createElement("div");
    imageDiv.className = "flex items-center space-x-2";
    imageDiv.innerHTML = `
      <input type="file" class="type-image w-full p-2 border rounded" placeholder="Type Image URL" />
      <button type="button" class="remove-image text-red-500" aria-label="Remove Image">×</button>
    `;
    imagesContainer.appendChild(imageDiv);
    imageDiv.querySelector(".remove-image").addEventListener("click", () => {
      if (imagesContainer.children.length > 1) {
        imagesContainer.removeChild(imageDiv);
      }
    });
  });

  typeDiv.querySelector(".add-size-btn").addEventListener("click", () => {
    const sizesContainer = typeDiv.querySelector(`.type-sizes-container[data-type-index="${typeIndex}"]`);
    const sizeDiv = document.createElement("div");
    sizeDiv.className = "flex items-center space-x-2";
    sizeDiv.innerHTML = `
      <input type="text" class="type-size w-full p-2 border rounded" placeholder="Size (e.g., S, M, L)" />
      <button type="button" class="remove-size text-red-500" aria-label="Remove Size">×</button>
    `;
    sizesContainer.appendChild(sizeDiv);
    sizeDiv.querySelector(".remove-size").addEventListener("click", () => {
      if (sizesContainer.children.length > 1) {
        sizesContainer.removeChild(sizeDiv);
      }
    });
  });

  typeDiv.querySelector(".add-color-btn").addEventListener("click", () => {
    const colorsContainer = typeDiv.querySelector(`.type-colors-container[data-type-index="${typeIndex}"]`);
    const colorDiv = document.createElement("div");
    colorDiv.className = "flex items-center space-x-2";
    colorDiv.innerHTML = `
      <input type="text" class="type-color w-full p-2 border rounded" placeholder="Color (e.g., Red, Blue)" />
      <button type="button" class="remove-color text-red-500" aria-label="Remove Color">×</button>
    `;
    colorsContainer.appendChild(colorDiv);
    colorDiv.querySelector(".remove-color").addEventListener("click", () => {
      if (colorsContainer.children.length > 1) {
        colorsContainer.removeChild(colorDiv);
      }
    });
  });

  typeDiv.querySelectorAll(".remove-image").forEach(btn => {
    btn.addEventListener("click", () => {
      const container = btn.parentElement.parentElement;
      if (container.children.length > 1) {
        container.removeChild(btn.parentElement);
      }
    });
  });

  typeDiv.querySelectorAll(".remove-size").forEach(btn => {
    btn.addEventListener("click", () => {
      const container = btn.parentElement.parentElement;
      if (container.children.length > 1) {
        container.removeChild(btn.parentElement);
      }
    });
  });

  typeDiv.querySelectorAll(".remove-color").forEach(btn => {
    btn.addEventListener("click", () => {
      const container = btn.parentElement.parentElement;
      if (container.children.length > 1) {
        container.removeChild(btn.parentElement);
      }
    });
  });
}

async function submitProduct(e) {
  e.preventDefault();
  const categoryId = document.getElementById("category").value;
  const name = document.getElementById("name").value;
  const image = document.getElementById("image").value;
  const description = document.getElementById("description").value;

  const types = Array.from(document.querySelectorAll("#types-container .type-item"))
    .map((typeDiv, index) => ({
      name: typeDiv.querySelector(`#type-name-${index}`)?.value || "",
      images: Array.from(typeDiv.querySelectorAll(`.type-images-container[data-type-index="${index}"] .type-image`))
        .map(input => input.value)
        .filter(url => url),
      description: typeDiv.querySelector(`#type-description-${index}`)?.value || "",
      price: parseFloat(typeDiv.querySelector(`#type-price-${index}`)?.value) || 0,
      sizes: Array.from(typeDiv.querySelectorAll(`.type-sizes-container[data-type-index="${index}"] .type-size`))
        .map(input => input.value)
        .filter(size => size),
      colors: Array.from(typeDiv.querySelectorAll(`.type-colors-container[data-type-index="${index}"] .type-color`))
        .map(input => input.value)
        .filter(color => color),
    }))
    .filter(t => t.name && t.images.length && t.description && t.price);

  if (!categoryId) {
    alert("Please select a category.");
    return;
  }

  if (types.length === 0) {
    alert("Please add at least one valid product type with name, images, description, and price.");
    return;
  }

  const productData = { name, image, description, types, categoryId };

  try {
    const response = await fetch("http://localhost:5000/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    if (!response.ok) throw new Error("Failed to add product");
    alert("Product added successfully!");
    window.location.href = "dashboard.html";
  } catch (error) {
    alert(`Failed to add product: ${error.message}`);
  }
}