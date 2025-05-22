// Function to fetch and display all products list
// Confirmation wrappers
function confirmDeleteProduct(productId) {
  if (confirm("Are you sure you want to delete this product?")) {
    deleteProduct(productId);
  }
}

function confirmToggleProductActive(productId, isActive) {
  const action = isActive ? "deactivate" : "activate";
  if (confirm(`Are you sure you want to ${action} this product?`)) {
    toggleActive(productId, isActive);
  }
}

// Main fetch function
async function fetchProducts(containerId = "product-grid", view = "default") {
  const productGrid = document.getElementById(containerId);
  if (!productGrid) return;

  try {
    const response = await fetch("http://localhost:5000/products");
    if (!response.ok) throw new Error("Failed to fetch products");

    const products = await response.json();
    productGrid.innerHTML = "";

    products.forEach((product) => {
      // Show only active products on the public product list page
      if (view === "default" && !product.active) return;

      const productCard = document.createElement("div");
      productCard.classList.add("text-center");

      if (view === "dashboard") {
        const isActive = product.active;

        productCard.innerHTML = `
          <div class="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <img src="${product.image}" alt="${product.name}" class="w-16 h-16 object-cover rounded" />
              <div class="text-left">
                <h4 class="font-semibold text-gray-800">${product.name}</h4>
                <p class="text-sm text-gray-500 truncate">${product.description?.slice(0, 60) || ""}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <a href="update-product.html?id=${product.id}" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">Edit</a>
              <button onclick="confirmDeleteProduct('${product.id}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
              <button onclick="confirmToggleProductActive('${product.id}', ${isActive})" class="${
                isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
              } text-white px-3 py-1 rounded text-sm">
                ${isActive ? 'Deactivate' : 'Activate'}
              </button>
              <a href="product-detail.html?id=${product.id}&source=dashboard" class="bg-gray-200 text-black px-3 py-1 rounded text-sm">View</a>
            </div>
          </div>
        `;
      } else {
        // Public-facing product view
        productCard.innerHTML = `
          <a href="product-detail.html?id=${product.id}" class="block transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div class="mb-6 bg-white shadow-lg overflow-hidden">
              <div class="p-2">
                <h3 class="text-lg font-semibold text-gray-800">${product.name}</h3>
                <p class="text-center text-gray-600 hover:text-red-500 rounded-lg">
                  More Details <i class="fa-solid fa-arrow-right ml-1"></i>
                </p>
              </div>
              <img src="${product.image}" alt="${product.name}" class="w-full h-60 object-cover">
            </div>
          </a>
        `;
      }

      productGrid.appendChild(productCard);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}


// Function to fetch and display a single product's details
async function fetchProductDetail() {
  const productDetail = document.getElementById("product-detail");
  if (!productDetail) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const source = params.get("source"); 

  if (!productId) {
    productDetail.innerHTML =
      "<p class='text-red-500 text-lg text-center font-semibold'>Product not found.</p>";
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/products/${productId}`);
    if (!response.ok) throw new Error("Failed to fetch product details");

    const product = await response.json();

    // ✅ Check if product is inactive and not from dashboard
    const isFromDashboard =
      document.referrer.includes("dashboard") ||
      source === "dashboard";

    if (!product.active && !isFromDashboard) {
      productDetail.innerHTML = `
        <div class="text-center py-16">
          <h2 class="text-2xl font-bold text-red-600">This product is currently inactive.</h2>
          <a href="products.html" class="mt-4 inline-block bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900">
            ← Back to Products
          </a>
        </div>
      `;
      return;
    }

    const typesContent = Array.isArray(product.types) && product.types.length > 0
      ? `
        <h2 class="text-3xl font-semibold text-gray-900 mt-10 text-center">Products List</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
          ${product.types.map(type => `
            <div class="p-6 rounded-xl transition duration-300 bg-white shadow hover:shadow-lg">
              <img src="${type.image}" class="w-full h-52 object-cover rounded-md">
              <h3 class="text-2xl font-semibold text-gray-800 mt-4">${type.name}</h3>
              <p class="text-gray-600 mt-3 text-sm leading-relaxed">${type.description}</p>
              <p class="text-lg font-semibold text-gray-900 mt-2">Price: ₹${type.price}</p>
            </div>
          `).join("")}
        </div>
      `
      : `<p class="text-gray-500 mt-8 text-center">No product types available.</p>`;

    productDetail.innerHTML = `
      <div class="max-w-6xl mx-auto bg-white/90 backdrop-blur-lg overflow-hidden p-8 mt-2">
        <h1 class="text-4xl font-bold text-gray-900 text-center tracking-wide">${product.name}</h1>
        
        <div class="mt-8 flex justify-center">
          <img src="${product.image}" 
               class="w-full max-h-[28rem] object-cover rounded-xl transition-transform duration-300 hover:shadow-xl">
        </div>
        
        <p class="mt-8 text-lg text-gray-700 leading-relaxed text-justify">${product.description}</p>

        ${typesContent}

        <div class="flex justify-center mt-10">
          <a href="products.html" 
             class="bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold px-8 py-3 rounded-full transition duration-300 hover:from-gray-700 hover:to-gray-800 hover:shadow-lg">
            ← Back to Products
          </a>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error loading product:", error);
    productDetail.innerHTML =
      "<p class='text-red-500 text-lg text-center font-semibold'>Error loading product details.</p>";
  }
}



// Run the appropriate function when the page loads
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  fetchProductDetail();
});

async function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      const response = await fetch(`http://localhost:5000/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      // Optionally reload or re-fetch
      fetchProducts("dashboard-product-list", "dashboard");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete product.");
    }
  }
}

async function toggleActive(productId, currentStatus) {
  try {
    const response = await fetch(`http://localhost:5000/products/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ active: !currentStatus }),
    });

    if (!response.ok) throw new Error("Failed to update product status");

    // Refresh dashboard list
    fetchProducts("dashboard-product-list", "dashboard");
  } catch (error) {
    console.error("Error toggling product active status:", error);
    alert("Failed to update product status.");
  }
}


// Fetch product by ID to populate the update form
async function fetchProductForUpdate() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) {
    alert("Product not found!");
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/products/${productId}`);
    if (!response.ok) throw new Error("Failed to fetch product details");

    const product = await response.json();
    populateForm(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    alert("Failed to load product data.");
  }
}

// Populate the update form with product data
function populateForm(product) {
  document.getElementById("product-id").value = product.id;
  document.getElementById("name").value = product.name;
  document.getElementById("image").value = product.image;
  document.getElementById("description").value = product.description;

  // Populate the product types (if any)
  const typesContainer = document.getElementById("types-container");
  typesContainer.innerHTML = ""; // Clear previous types

  if (Array.isArray(product.types) && product.types.length > 0) {
    product.types.forEach((type, index) => {
      const typeDiv = document.createElement("div");
      typeDiv.classList.add("space-y-2");

      typeDiv.innerHTML = `
        <h4 class="font-semibold">Product Type ${index + 1}</h4>
        <div>
          <label for="type-name-${index}" class="block">Type Name</label>
          <input type="text" id="type-name-${index}" class="w-full p-2 border rounded" value="${type.name}">
        </div>
        <div>
          <label for="type-description-${index}" class="block">Type Description</label>
          <textarea id="type-description-${index}" class="w-full p-2 border rounded">${type.description}</textarea>
        </div>
        <div>
          <label for="type-price-${index}" class="block">Type Price</label>
          <input type="number" id="type-price-${index}" class="w-full p-2 border rounded" value="${type.price}">
        </div>
        <div>
          <label for="type-image-${index}" class="block">Type Image URL</label>
          <input type="url" id="type-image-${index}" class="w-full p-2 border rounded" value="${type.image}">
        </div>
      `;

      typesContainer.appendChild(typeDiv);
    });
  }
}

// Handle form submission to update the product
document.getElementById("update-product-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const productId = document.getElementById("product-id").value;
  const name = document.getElementById("name").value;
  const image = document.getElementById("image").value;
  const description = document.getElementById("description").value;

 
  const types = Array.from(document.querySelectorAll("#types-container > div")).map((typeDiv, index) => {
    return {
      name: typeDiv.querySelector(`#type-name-${index}`).value,
      description: typeDiv.querySelector(`#type-description-${index}`).value,
      price: typeDiv.querySelector(`#type-price-${index}`).value,
      image: typeDiv.querySelector(`#type-image-${index}`).value,
    };
  });

  const updatedProduct = {
    name,
    image,
    description,
    types,
  };

  try {
    const response = await fetch(`http://localhost:5000/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    });

    if (!response.ok) throw new Error("Failed to update product");

    alert("Product updated successfully!");
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Error updating product:", error);
    alert("Failed to update product.");
  }
});

// Fetch the product data when the page loads
document.addEventListener("DOMContentLoaded", () => {
  fetchProductForUpdate();
});





