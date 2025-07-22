async function fetchProducts(containerId = "product-grid", view = "default") {
  const productGrid = document.getElementById(containerId);
  if (!productGrid) {
    console.error(`Container with ID ${containerId} not found`);
    return;
  }

  // Show loading state
  productGrid.innerHTML = `
    <div class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  `;

  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(
      "https://api.vybtek.com/api/manuplast/categories",
      { headers }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch categories: ${response.status} ${response.statusText}`
      );
    }

    const categories = await response.json();
    productGrid.innerHTML = "";

    // Filter active categories for default view
    const filteredCategories =
      view === "default"
        ? categories.filter((cat) => cat.status?.toLowerCase() === "active")
        : categories;

    if (filteredCategories.length === 0) {
      productGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <h3 class="text-xl font-medium text-gray-600">No ${
            view === "default" ? "active " : ""
          }categories found</h3>
        </div>
      `;

      document
        .getElementById("add-category-btn")
        ?.addEventListener("click", () => {
          document.getElementById("category-modal")?.classList.remove("hidden");
        });
      return;
    }

    filteredCategories.forEach((category) => {
      if (!category.id || typeof category.id !== "string") {
        console.warn(`Invalid category ID:`, category);
        return;
      }

      const isActive = category.status?.toLowerCase() === "active";
      const categoryCard = document.createElement("div");

      if (view === "dashboard") {
        categoryCard.className =
          "bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-[1.02]";
        categoryCard.innerHTML = `
          <div class="p-6 flex flex-col md:flex-row gap-6 items-start">
            <div class="flex-shrink-0">
              <img src="${category.image_url || "./images/placeholder.jpg"}" 
                   alt="${category.name || "Unnamed"}" 
                   class="w-32 h-32 object-cover rounded-lg shadow">
            </div>
            <div class="flex-grow">
              <div class="flex justify-between items-start">
                <h3 class="text-xl font-bold text-gray-800">${
                  category.name || "Unnamed"
                }</h3>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }">
                  ${isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p class="mt-2 text-gray-600 line-clamp-2">${
                category.description?.slice(0, 120) || "No description"
              }</p>
              
              <div class="mt-4 flex flex-wrap gap-2">
               
               <button onclick="openUpdateModal('${category.id}')" 
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
  Edit
</button>
                <button data-id="${category.id}" 
                   class="delete-btn px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm">
                  Delete
                </button>
                <button data-id="${category.id}" 
                   data-active="${isActive}"
                   class="toggle-btn px-4 py-2 rounded-lg transition text-sm ${
                     isActive
                       ? "bg-yellow-500 hover:bg-yellow-600"
                       : "bg-green-500 hover:bg-green-600"
                   } text-white">
                  ${isActive ? "Deactivate" : "Activate"}
                </button>
                <a href="product-detail.html?id=${
                  category.id
                }&source=dashboard" 
                   class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm">
                  View
                </a>
              </div>
            </div>
          </div>
        `;
      } else {
        // Default view for customers with enhanced modern styling
        categoryCard.className =
          "group relative overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:shadow-2xl border border-gray-100 hover:border-blue-200";
        categoryCard.innerHTML = `
          <a href="product-detail.html?id=${
            category.id
          }" class="block relative ">
            <div class="aspect-w-4 aspect-h-3 overflow-hidden">
              <img src="${category.image_url || "./images/placeholder.jpg"}" 
                   alt="${category.name || "Unnamed"}" 
                   class="w-full h-64 object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-105">
              <div class="absolute inset-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div class="p-6 bg-transparent">
              <h3 class="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">${
                category.name || "Unnamed"
              }</h3>
              <p class="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">${
                category.description?.slice(0, 160) || "No description"
              }...</p>
              <div class="flex items-center text-red-500 font-medium text-base group-hover:text-red-600 transition-colors duration-200">
                Explore Now
                <svg class="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </div>
            </div>
          </a>
        `;
      }
      productGrid.appendChild(categoryCard);
    });

    if (view === "dashboard") {
      productGrid.removeEventListener("click", handleDashboardActions);
      productGrid.addEventListener("click", handleDashboardActions);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    productGrid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <h3 class="text-xl font-medium text-red-600">Error loading categories</h3>
        <p class="text-gray-600 mt-2">${error.message}</p>
        <button onclick="fetchProducts('${containerId}', '${view}')" 
                class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Try Again
        </button>
      </div>
    `;
  }
}

function openUpdateModal(categoryId) {
  const modal = document.getElementById("update-category-modal");
  if (!modal) {
    console.error("Update category modal not found");
    showNotification("Error: Update modal not found", "error");
    return;
  }

  // Show modal immediately to provide visual feedback
  modal.classList.remove("hidden");

  // Show loading state in the form
  const form = document.getElementById("update-category-form");
  if (!form) {
    console.error("Update category form not found");
    showNotification("Error: Update form not found", "error");
    modal.classList.add("hidden");
    return;
  }
  form.innerHTML = `
    <div class="flex justify-center items-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  `;

  // Fetch category details
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No authentication token found");
    showNotification("You are not authenticated. Please log in.", "error");
    modal.classList.add("hidden");
    window.location.href = "login.html";
    return;
  }

  fetch(`https://api.vybtek.com/api/manuplast/categories/${categoryId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch category: ${response.status} ${response.statusText}`
        );
      }
      return response.json();
    })
    .then((category) => {
      console.log("Fetched category data:", category); // Debug: Log API response

      // Validate category data
      if (!category || typeof category !== "object") {
        throw new Error("Invalid or empty category data received");
      }

      // Restore form HTML
      form.innerHTML = `
        <input type="hidden" id="update-category-id" />
        <div>
          <label for="update-name" class="block text-gray-700 mb-1">Category Name*</label>
          <input type="text" id="update-name" class="w-full p-2 border rounded" required />
        </div>
        <div>
          <label for="update-image" class="block text-gray-700 mb-1">Category Image</label>
          <input type="file" id="update-image" class="w-full p-2 border rounded" accept="image/*" />
          <div id="current-image-preview" class="mt-2 hidden">
            <p class="text-sm text-gray-500">Current Image:</p>
            <img id="current-image" src="" class="w-32 h-32 object-cover rounded mt-1" />
          </div>
        </div>
        <div>
          <label for="update-description" class="block text-gray-700 mb-1">Description*</label>
          <textarea id="update-description" class="w-full p-2 border rounded" rows="3" required></textarea>
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Update Category
        </button>
      `;

      // Re-select form elements after re-rendering
      const idInput = document.getElementById("update-category-id");
      const nameInput = document.getElementById("update-name");
      const descriptionInput = document.getElementById("update-description");
      const imagePreview = document.getElementById("current-image-preview");
      const image = document.getElementById("current-image");
      const updateImageInput = document.getElementById("update-image");

      // Verify all elements exist
      if (
        !idInput ||
        !nameInput ||
        !descriptionInput ||
        !imagePreview ||
        !image ||
        !updateImageInput
      ) {
        console.error("Form elements missing after re-rendering:", {
          idInput,
          nameInput,
          descriptionInput,
          imagePreview,
          image,
          updateImageInput,
        });
        throw new Error("Form elements not found after re-rendering");
      }

      // Populate form fields with fallback values
      idInput.value = category.id || "";
      nameInput.value = category.name || "";
      descriptionInput.value = category.description || "";
      if (category.image_url) {
        image.src = category.image_url;
        imagePreview.classList.remove("hidden");
      } else {
        image.src = "";
        imagePreview.classList.add("hidden");
      }

      // Add image preview for new file selection
      updateImageInput.value = ""; // Clear file input
      updateImageInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          image.src = URL.createObjectURL(file);
          imagePreview.classList.remove("hidden");
        }
      });

      console.log("Form populated with:", {
        id: idInput.value,
        name: nameInput.value,
        description: descriptionInput.value,
        image: image.src,
      }); // Debug: Log populated values
    })
    .catch((error) => {
      console.error("Error fetching category:", error);
      showNotification(`Failed to load category: ${error.message}`, "error");
      modal.classList.add("hidden");
      // Restore form HTML to prevent broken state
      form.innerHTML = `
        <input type="hidden" id="update-category-id" />
        <div>
          <label for="update-name" class="block text-gray-700 mb-1">Category Name*</label>
          <input type="text" id="update-name" class="w-full p-2 border rounded" required />
        </div>
        <div>
          <label for="update-image" class="block text-gray-700 mb-1">Category Image</label>
          <input type="file" id="update-image" class="w-full p-2 border rounded" accept="image/*" />
          <div id="current-image-preview" class="mt-2 hidden">
            <p class="text-sm text-gray-500">Current Image:</p>
            <img id="current-image" src="" class="w-32 h-32 object-cover rounded mt-1" />
          </div>
        </div>
        <div>
          <label for="update-description" class="block text-gray-700 mb-1">Description*</label>
          <textarea id="update-description" class="w-full p-2 border rounded" rows="3" required></textarea>
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Update Category
        </button>
      `;
    });
}

// Enhanced delete and toggle functions
async function deleteCategory(id) {
  if (
    !confirm(
      "Are you sure you want to delete this category? This action cannot be undone."
    )
  )
    return;

  const token = localStorage.getItem("token");
  const csrfToken = document.getElementById("csrf-token")?.value || "";

  try {
    const response = await fetch(
      `https://api.vybtek.com/api/manuplast/categories/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete category");
    }

    // Show success notification
    showNotification("Category deleted successfully!", "success");
    fetchProducts("dashboard-product-list", "dashboard");
  } catch (error) {
    console.error("Error deleting category:", error);
    showNotification(`Failed to delete category: ${error.message}`, "error");
  }
}

async function toggleActive(categoryId, currentStatus) {
  const action = currentStatus ? "deactivate" : "activate";
  if (!confirm(`Are you sure you want to ${action} this category?`)) return;

  const token = localStorage.getItem("token");
  const csrfToken = document.getElementById("csrf-token")?.value || "";
  const newStatus = !currentStatus;

  try {
    const response = await fetch(
      `https://api.vybtek.com/api/manuplast/categories/${categoryId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ active: newStatus }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update status");
    }

    // Update UI immediately
    const toggleBtn = document.querySelector(
      `.toggle-btn[data-id="${categoryId}"]`
    );
    if (toggleBtn) {
      toggleBtn.setAttribute("data-active", newStatus);
      toggleBtn.textContent = newStatus ? "Deactivate" : "Activate";
      toggleBtn.className = `toggle-btn px-4 py-2 rounded-lg transition text-sm ${
        newStatus
          ? "bg-yellow-500 hover:bg-yellow-600"
          : "bg-green-500 hover:bg-green-600"
      } text-white`;
    }

    showNotification(
      `Category ${newStatus ? "activated" : "deactivated"} successfully!`,
      "success"
    );
    fetchProducts("dashboard-product-list", "dashboard");
  } catch (error) {
    console.error("Error updating category status:", error);
    showNotification(`Failed to update status: ${error.message}`, "error");
  }
}

// Notification helper
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${
    type === "success" ? "bg-green-600" : "bg-red-600"
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add(
      "opacity-0",
      "translate-y-2",
      "transition-all",
      "duration-300"
    );
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Initialize based on page
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.toLowerCase();

  if (path.includes("products.html") || path === "/") {
    fetchProducts("product-grid", "default");
  } else if (path.includes("dashboard.html")) {
    fetchProducts("dashboard-product-list", "dashboard");
  }

  // Add category modal event
  document.getElementById("add-category-btn")?.addEventListener("click", () => {
    document.getElementById("category-modal")?.classList.remove("hidden");
  });
});

function handleDashboardActions(e) {
  const deleteBtn = e.target.closest(".delete-btn");
  const toggleBtn = e.target.closest(".toggle-btn");

  if (deleteBtn) {
    const categoryId = deleteBtn.getAttribute("data-id");
    if (!categoryId) {
      alert("Error: Category ID is missing.");
      return;
    }
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCategory(categoryId);
    }
  }

  if (toggleBtn) {
    const categoryId = toggleBtn.getAttribute("data-id");
    const isActive = toggleBtn.getAttribute("data-active") === "true";
    if (!categoryId) {
      alert("Error: Category ID is missing.");
      return;
    }
    const action = isActive ? "deactivate" : "activate";
    if (confirm(`Are you sure you want to ${action} this category?`)) {
      toggleActive(categoryId, isActive);
    }
  }
}

async function fetchProductDetail() {
  const productDetail = document.getElementById("product-detail");
  if (!productDetail) {
    console.error("product-detail element not found");
    return;
  }

  // Show loading state
  productDetail.innerHTML = `
        <div class="flex items-center justify-center min-h-screen bg-red-50">
          <div class="text-center">
            <div class="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="mt-4 text-red-800 font-medium">Loading product details...</p>
          </div>
        </div>
      `;

  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get("id");
  const source = params.get("source");

  if (!categoryId) {
    productDetail.innerHTML = `
          <div class="flex items-center justify-center min-h-screen bg-red-50">
            <div class="text-center max-w-md p-6 bg-white rounded-xl shadow-lg">
              <div class="text-red-500 text-4xl mb-4">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <h2 class="text-2xl font-bold text-red-800 mb-2">Category Not Found</h2>
              <p class="text-gray-600 mb-6">The requested category could not be located.</p>
              <a href="products.html" class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                <i class="fas fa-arrow-left mr-2"></i> Back to Categories
              </a>
            </div>
          </div>
        `;
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const API_BASE_URL = "https://api.vybtek.com/api/manuplast";

    // Fetch category
    const categoryResponse = await fetch(
      `${API_BASE_URL}/categories/${categoryId}`,
      { headers }
    );
    if (!categoryResponse.ok) {
      throw new Error(`Failed to fetch category: ${categoryResponse.status}`);
    }
    const category = await categoryResponse.json();

    const isFromDashboard =
      document.referrer.includes("dashboard") || source === "dashboard";
    if (category.status?.toLowerCase() !== "active" && !isFromDashboard) {
      productDetail.innerHTML = `
            <div class="flex items-center justify-center min-h-screen bg-red-50">
              <div class="text-center max-w-md p-6 bg-white rounded-xl shadow-lg">
                <div class="text-red-500 text-4xl mb-4">
                  <i class="fas fa-pause-circle"></i>
                </div>
                <h2 class="text-2xl font-bold text-red-800 mb-2">Category Inactive</h2>
                <p class="text-gray-600 mb-6">This category is currently not available for viewing.</p>
                <a href="products.html" class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                  <i class="fas fa-arrow-left mr-2"></i> Back to Categories
                </a>
              </div>
            </div>
          `;
      return;
    }

    // Fetch product types
    const typesResponse = await fetch(
      `${API_BASE_URL}/producttypes?category_id=${categoryId}`,
      { headers }
    );
    if (!typesResponse.ok) {
      throw new Error(`Failed to fetch product types: ${typesResponse.status}`);
    }
    const productTypes = await typesResponse.json();

    // Extract product types array, handling nested structure
    const rawProductTypes = Array.isArray(productTypes)
      ? productTypes
      : productTypes.category || [];
    const filteredProductTypes = rawProductTypes
      .filter(
        (type) =>
          type.category && String(type.category.id) === String(categoryId)
      )
      .map((type) => ({
        ...type,
        images: Array.isArray(type.colors)
          ? type.colors.flatMap((color) =>
              Array.isArray(color.images)
                ? color.images.map((img) => img.image_url).filter(Boolean)
                : []
            )
          : ["./images/placeholder.jpg"],
        cover_image:
          type.cover_image_url ||
          type.images?.[0] ||
          "./images/placeholder.jpg",
        sizes: Array.isArray(type.sizes)
          ? type.sizes
              .map((s) => (typeof s === "string" ? s : s.size))
              .filter(Boolean)
          : [],
        colors: Array.isArray(type.colors)
          ? type.colors
              .map((c) => (typeof c === "string" ? c : c.color))
              .filter(Boolean)
          : [],
      }));

    console.log("Filtered Product Types:", filteredProductTypes);

    // Render the page
    productDetail.innerHTML = `
          <div class="min-h-screen bg-red-50">
            <!-- Hero Section -->
            <div class="bg-gradient-to-r from-red-600 to-red-800 text-white py-16 px-4 text-center">
              <nav class="flex justify-center items-center mb-8">
                <a href="products.html" class="text-red-100 hover:text-white transition">
                  <i class="fas fa-home mr-1"></i> Categories
                </a>
                <span class="mx-2">/</span>
                <span class="font-semibold">${category.name}</span>
              </nav>
              <h1 class="text-4xl md:text-5xl font-bold mb-4">${
                category.name
              }</h1>
              <p class="text-xl text-red-100">Premium quality products crafted for excellence</p>
            </div>

            <!-- Category Section -->
            <div class="max-w-6xl mx-auto px-4 py-12">
              <div class="flex flex-col md:flex-row gap-8 items-center bg-white rounded-xl shadow-md overflow-hidden">
                <div class="md:w-1/2">
                  <img src="${category.image_url || "./images/placeholder.jpg"}"
                       alt="${category.name}"
                       class="w-full h-64 md:h-96 object-cover hover:scale-105 transition duration-300" />
                </div>
                <div class="md:w-1/2 p-6">
                  <h2 class="text-3xl font-bold text-red-800 mb-4">About ${
                    category.name
                  }</h2>
                  <p class="text-gray-600 leading-relaxed">
                    ${
                      category.description ||
                      "Discover our comprehensive range of high-quality products designed to meet your specific needs."
                    }
                  </p>
                </div>
              </div>
            </div>

            <!-- Products Section -->
            <div class="max-w-6xl mx-auto px-4 py-8">
              <div class="flex justify-between items-center mb-8">
                <h2 class="text-2xl font-bold text-gray-800">
                  <i class="fas fa-box-open mr-2"></i>
                  Product Collection
                </h2>
                <span class="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                  ${filteredProductTypes.length} ${
      filteredProductTypes.length === 1 ? "Product" : "Products"
    }
                </span>
              </div>
              ${
                filteredProductTypes.length
                  ? `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  ${filteredProductTypes
                    .map(
                      (type, index) => `
                    <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                      <div class="relative h-48 overflow-hidden">
                        <img src="${type.cover_image}"
                             alt="${type.name}"
                             class="w-full h-full object-cover" />
                        <div class="absolute top-0 right-0 p-2">
                          ${
                            type.colors.length
                              ? `<span class="bg-white text-red-600 text-xs px-2 py-1 rounded-full">${type.colors.length} Colors</span>`
                              : ""
                          }
                          ${
                            type.sizes.length
                              ? `<span class="bg-white text-red-600 text-xs px-2 py-1 rounded-full ml-1">${type.sizes.length} Sizes</span>`
                              : ""
                          }
                        </div>
                      </div>
                      <div class="p-4">
                        <h3 class="text-xl font-bold text-gray-600 mb-2">${
                          type.name
                        }</h3>
                        <div class="mb-4">
                          ${
                            type.colors.length
                              ? `
                            <div class="flex items-center mb-2">
                              <span class="text-sm font-medium text-gray-700 mr-2">Colors:</span>
                              <div class="flex">
                                ${type.colors
                                  .slice(0, 4)
                                  .map(
                                    (color) => `
                                  <div class="w-5 h-5 rounded-full border border-gray-200 ml-1"
                                       style="background-color: ${color.toLowerCase()}"
                                       title="${color}"></div>
                                `
                                  )
                                  .join("")}
                                ${
                                  type.colors.length > 4
                                    ? `<span class="text-xs text-red-600 ml-1">+${
                                        type.colors.length - 4
                                      }</span>`
                                    : ""
                                }
                              </div>
                            </div>
                          `
                              : ""
                          }
                          ${
                            type.sizes.length
                              ? `
                            <div class="flex items-center">
                              <span class="text-sm font-medium text-gray-700 mr-2">Sizes:</span>
                              <div class="flex flex-wrap">
                                ${type.sizes
                                  .slice(0, 3)
                                  .map(
                                    (size) => `
                                  <span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded mr-1 mb-1">${size}</span>
                                `
                                  )
                                  .join("")}
                                ${
                                  type.sizes.length > 3
                                    ? `<span class="text-xs text-red-600 ml-1">+${
                                        type.sizes.length - 3
                                      }</span>`
                                    : ""
                                }
                              </div>
                            </div>
                          `
                              : ""
                          }
                        </div>
                        <a href="type-detail.html?id=${
                          type.id
                        }&category_id=${categoryId}"
                           class="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition">
                          <span>View Details</span>
                          <i class="fas fa-arrow-right ml-2"></i>
                        </a>
                      </div>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              `
                  : `
                <div class="text-center py-12">
                  <div class="text-red-500 text-5xl mb-4">
                    <i class="fas fa-box-open"></i>
                  </div>
                  <h3 class="text-2xl font-bold text-red-800 mb-2">No Products Available</h3>
                  <p class="text-gray-600">This category doesn't have any products yet. Check back later for updates.</p>
                </div>
              `
              }
              <div class="text-center mt-8">
                <a href="products.html"
                   class="inline-flex items-center px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition">
                  <i class="fas fa-arrow-left mr-2"></i>
                  Back to Categories
                </a>
              </div>
            </div>
          </div>
        `;

    // Add Font Awesome if not already present
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fontAwesome = document.createElement("link");
      fontAwesome.rel = "stylesheet";
      fontAwesome.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css";
      document.head.appendChild(fontAwesome);
    }
  } catch (error) {
    console.error("Error loading product details:", error);
    productDetail.innerHTML = `
          <div class="flex items-center justify-center min-h-screen bg-red-50">
            <div class="text-center max-w-md p-6 bg-white rounded-xl shadow-lg">
              <div class="text-red-500 text-4xl mb-4">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <h2 class="text-2xl font-bold text-red-800 mb-2">Error Loading Products</h2>
              <p class="text-gray-600 mb-6">${error.message}</p>
              <button onclick="fetchProductDetail()"
                      class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                <i class="fas fa-refresh mr-2"></i> Try Again
              </button>
            </div>
          </div>
        `;
  }
}

class ProductDetailManager {
  constructor() {
    this.currentImageIndex = 0;
    this.currentSelectedColorIndex = 0;
    this.imageViewMode = "gallery";
    this.product = null;
    this.isLoading = false;
    this.activeTab = "description";
    this.relatedProducts = [];
    this.init();
  }

  init() {
    this.fetchProductDetail();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener("keydown", (e) =>
      this.handleKeyboardNavigation(e)
    );
    window.addEventListener("resize", () => this.handleWindowResize());
  }

  async fetchProductDetail() {
    const typeDetail = document.getElementById("type-detail");
    if (!typeDetail) {
      console.error("type-detail element not found");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const typeId = params.get("id");
    const categoryId = params.get("category_id");

    console.log("Type ID:", typeId, "Category ID:", categoryId);

    if (!typeId || !categoryId) {
      this.renderError("Product not found. Invalid product ID or category.");
      return;
    }

    this.showLoadingState();
    this.isLoading = true;

    try {
      const token = this.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch product details
      const productResponse = await fetch(
        `https://api.vybtek.com/api/manuplast/producttypes/${typeId}`,
        { headers, timeout: 10000 }
      );
      if (!productResponse.ok) {
        throw new Error(
          `API Error: ${productResponse.status} ${productResponse.statusText}`
        );
      }
      const product = await productResponse.json();
      console.log("Fetched Product:", product);

      if (!this.validateProduct(product, categoryId)) {
        this.renderError(
          "This product does not belong to the specified category."
        );
        return;
      }

      // Fetch related products
      const relatedResponse = await fetch(
        `https://api.vybtek.com/api/manuplast/producttypes?category_id=${categoryId}`,
        { headers, timeout: 10000 }
      );
      if (!relatedResponse.ok) {
        throw new Error(
          `Failed to fetch related products: ${relatedResponse.status}`
        );
      }
      const relatedProducts = await relatedResponse.json();

      this.product = this.processProductData(product);
      this.relatedProducts = this.processRelatedProducts(
        relatedProducts,
        typeId
      );
      this.renderProductDetail();
      this.initializeInteractions();
      this.trackProductView();
    } catch (error) {
      console.error("Error loading product:", error);
      this.renderError(`Failed to load product: ${error.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  getAuthToken() {
    try {
      return localStorage.getItem("token");
    } catch (error) {
      console.warn("Could not access localStorage for token");
      return null;
    }
  }

  validateProduct(product, expectedCategoryId) {
    const productCategoryId = String(
      product.category?.id || product.category_id || ""
    ).trim();
    const categoryId = String(expectedCategoryId).trim();
    console.log(
      "Validating Product Category ID:",
      productCategoryId,
      "Expected:",
      categoryId
    );
    return productCategoryId === categoryId;
  }

  processProductData(rawProduct) {
    const processedProduct = {
      ...rawProduct,
      sizes: this.processSizes(rawProduct.sizes),
      colors: this.processColorsWithImages(rawProduct.colors || []),
      price: this.formatPrice(rawProduct.price),
      description: rawProduct.description || "No description available",
      features:
        Array.isArray(rawProduct.features) && rawProduct.features.length
          ? rawProduct.features
          : [
              "High-quality durable material",
              "Ergonomic design for comfort",
              "Water-resistant coating",
              "Easy to clean and maintain",
              "Eco-friendly production",
            ],
      specifications:
        Array.isArray(rawProduct.specifications) &&
        rawProduct.specifications.length
          ? rawProduct.specifications.map((spec, index) => ({
              id: `spec-${index}`,
              items: [
                { key: "Color", value: spec.color || "N/A" },
                { key: "Capacity", value: spec.capacity || "N/A" },
                { key: "Material", value: spec.material || "N/A" },
                { key: "Dimensions", value: spec.dimensions_cm || "N/A" },
                {
                  key: "Package Content",
                  value: spec.package_content || "N/A",
                },
              ].filter((item) => item.value !== "N/A"),
            }))
          : [
              { key: "Material", value: "Premium Synthetic Fabric" },
              { key: "Weight", value: "1.2 kg" },
              { key: "Dimensions", value: "30 x 20 x 10 cm" },
              { key: "Warranty", value: "2 Years" },
              {
                key: "Color Options",
                value:
                  (rawProduct.colors?.length || 0) > 0
                    ? rawProduct.colors.length
                    : "Multiple",
              },
            ],
    };

    processedProduct.displayImages =
      processedProduct.colors.length > 0
        ? processedProduct.colors[this.currentSelectedColorIndex].images
        : [rawProduct.cover_image_url || "./images/placeholder.jpg"];

    return processedProduct;
  }

  processRelatedProducts(productTypes, currentTypeId) {
    if (!Array.isArray(productTypes)) return [];

    return productTypes
      .filter((type) => String(type.id) !== String(currentTypeId))
      .map((type) => ({
        ...type,
        images: Array.isArray(type.colors)
          ? type.colors.flatMap((color) =>
              Array.isArray(color.images)
                ? color.images.map((img) => img.image_url).filter(Boolean)
                : []
            )
          : [type.cover_image_url || "./images/placeholder.jpg"],
        sizes: Array.isArray(type.sizes)
          ? type.sizes
              .map((s) => (typeof s === "string" ? s : s.size))
              .filter(Boolean)
          : [],
        colors: Array.isArray(type.colors)
          ? type.colors
              .map((c) => (typeof c === "string" ? c : c.color))
              .filter(Boolean)
          : [],
      }))
      .slice(0, 6);
  }

  processColorsWithImages(colors) {
    if (!Array.isArray(colors)) return [];

    return colors
      .map((colorObj) => {
        const colorName =
          typeof colorObj === "string" ? colorObj : colorObj?.color;
        const rawImages = colorObj?.images || [];

        const processedImages = rawImages
          .map((img) => (typeof img === "string" ? img : img?.image_url))
          .filter((url) => url && typeof url === "string" && url.trim() !== "")
          .map((url) => (url.startsWith("http") ? url : `./images/${url}`));

        return {
          name: colorName,
          hex: this.getColorHex(colorName),
          textColor: this.getTextColor(colorName),
          images:
            processedImages.length > 0
              ? processedImages
              : ["./images/placeholder.jpg"],
        };
      })
      .filter((color) => color.name);
  }

  processSizes(sizes) {
    if (!Array.isArray(sizes)) return [];

    return sizes
      .map((size) => (typeof size === "string" ? size : size?.size))
      .filter((size) => size && typeof size === "string" && size.trim() !== "")
      .sort((a, b) => {
        const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];
        return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
      });
  }

  getColorHex(colorName) {
    const colorMap = {
      red: "#ef4444",
      blue: "#3b82f6",
      green: "#10b981",
      yellow: "#f59e0b",
      black: "#000000",
      white: "#ffffff",
      gray: "#6b7280",
      pink: "#ec4899",
      purple: "#8b5cf6",
      orange: "#f97316",
      teal: "#14b8a6",
      cyan: "#06b6d4",
      indigo: "#4f46e5",
      violet: "#a855f7",
      lime: "#84cc16",
      emerald: "#10b981",
      amber: "#f59e0b",
      rose: "#f43f5e",
      sky: "#0ea5e9",
      fuchsia: "#d946ef",
      brown: "#8d5524",
      gold: "#f1c40f",
      silver: "#bdc3c7",
      bronze: "#cd7f32",
      navy: "#1e3a8a",
      maroon: "#800000",
      olive: "#6b7280",
      coral: "#ff7f50",
      turquoise: "#40e0d0",
      lavender: "#e6e6fa",
    };
    return colorMap[colorName.toLowerCase()] || "#6b7280";
  }

  getTextColor(colorName) {
    const lightColors = [
      "white",
      "yellow",
      "lightgray",
      "pink",
      "orange",
      "lime",
      "amber",
      "gold",
      "silver",
      "lavender",
      "turquoise",
      "sky",
    ];
    return lightColors.includes(colorName.toLowerCase())
      ? "#000000"
      : "#ffffff";
  }

  formatPrice(price) {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  }

  showLoadingState() {
    const typeDetail = document.getElementById("type-detail");
    typeDetail.innerHTML = `
          <div class="animate-pulse">
            <div class="bg-white rounded-2xl p-8 shadow-xl">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div class="space-y-4">
                  <div class="bg-gray-300 h-96 rounded-xl"></div>
                  <div class="flex space-x-2">
                    ${Array(4)
                      .fill()
                      .map(
                        () =>
                          '<div class="bg-gray-300 w-16 h-16 rounded-lg"></div>'
                      )
                      .join("")}
                  </div>
                </div>
                <div class="space-y-6">
                  <div class="bg-gray-300 h-8 rounded"></div>
                  <div class="bg-gray-300 h-6 w-1/2 rounded"></div>
                  <div class="bg-gray-300 h-20 rounded"></div>
                  <div class="bg-gray-300 h-12 w-1/3 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        `;
  }

  renderProductDetail() {
    const typeDetail = document.getElementById("type-detail");
    if (!typeDetail) return;

    const product = this.product;
    typeDetail.innerHTML = `
          <div class="bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-in">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div id="image-gallery-section" class="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                ${this.renderImageGallery()}
              </div>
              <div id="product-info-section" class="p-8 sticky top-20">
                ${this.renderProductInfo()}
              </div>
            </div>
            <div class="border-t border-gray-200 p-8 bg-gray-50">
              ${this.renderAdditionalDetails()}
            </div>
            <div class="p-8">
              ${this.renderRelatedProducts()}
            </div>
          </div>
        `;
  }

  renderImageGallery() {
    const product = this.product;
    const imagesToDisplay = product.displayImages;

    return `
          <div class="space-y-4">
            <div class="relative group">
              <div class="aspect-w-1 aspect-h-1 bg-white rounded-xl overflow-hidden shadow-lg">
                <img id="main-image"
                     src="${
                       imagesToDisplay[this.currentImageIndex] ||
                       "./images/placeholder.jpg"
                     }"
                     alt="${product.name}"
                     class="w-full h-96 object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105">
              </div>
              <div class="absolute top-4 right-4 space-y-2">
                <button id="fullscreen-image" class="bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all duration-300">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                  </svg>
                </button>
              </div>
              ${
                imagesToDisplay.length > 1
                  ? `
                  <button id="prev-image" class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all duration-300">
                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  <button id="next-image" class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all duration-300">
                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                  `
                  : ""
              }
            </div>
            ${
              imagesToDisplay.length > 1
                ? `
                <div class="flex space-x-2 overflow-x-auto pb-2">
                  ${imagesToDisplay
                    .map(
                      (image, index) => `
                      <img src="${image || "./images/placeholder.jpg"}"
                           alt="${product.name} ${index + 1}"
                           class="thumbnail w-16 h-16 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-300 flex-shrink-0 ${
                             index === this.currentImageIndex
                               ? "border-blue-500"
                               : ""
                           }"
                           data-index="${index}">
                    `
                    )
                    .join("")}
                </div>
                `
                : ""
            }
            <div class="text-center text-sm text-gray-500">
              <span id="image-counter">${this.currentImageIndex + 1}</span> / ${
      imagesToDisplay.length || 1
    }
            </div>
          </div>
        `;
  }

  renderProductInfo() {
    const product = this.product;

    return `
          <div class="space-y-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">${
                product.name || "Unnamed Product"
              }</h1>
              <div class="flex items-center space-x-2">
                <span class="text-2xl font-semibold text-gray-900">${
                  product.price || "N/A"
                }</span>
              </div>
            </div>
            ${
              product.sizes.length > 0
                ? `
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 text-start mb-3">Available Sizes</h3>
                  <div class="flex flex-wrap gap-2">
                    ${product.sizes
                      .map(
                        (size) => `
                        <span class="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300">
                          ${size}
                        </span>
                      `
                      )
                      .join("")}
                  </div>
                </div>
                `
                : ""
            }
            ${
              product.colors.length > 0
                ? `
                <div>
                  <h3 class="text-lg text-start font-semibold text-gray-900 mb-3">Available Colors</h3>
                  <div id="product-colors-container" class="flex flex-wrap gap-3">
                    ${product.colors
                      .map(
                        (color, index) => `
                        <button type="button"
                                class="color-swatch relative w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:scale-110 transition-all duration-300
                                  ${
                                    index === this.currentSelectedColorIndex
                                      ? "ring-2 ring-offset-2 ring-blue-500"
                                      : ""
                                  }"
                                style="background-color: ${color.hex};"
                                title="${color.name}"
                                data-color-index="${index}">
                          <span class="sr-only">${color.name}</span>
                          ${
                            index === this.currentSelectedColorIndex
                              ? '<svg class="w-6 h-6 text-white text-shadow-sm" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
                              : ""
                          }
                        </button>
                      `
                      )
                      .join("")}
                  </div>
                </div>
                `
                : ""
            }
          </div>
        `;
  }

  renderAdditionalDetails() {
    const product = this.product;

    return `
          <div class="space-y-6 text-start">
            <div class="flex border-b border-gray-200">
              <button class="tab-button text-start px-4 py-2 text-lg font-semibold text-gray-600 hover:text-blue-600 transition-all duration-300 ${
                this.activeTab === "description" ? "tab-active" : ""
              }" data-tab="description">Description</button>
              <button class="tab-button px-4 py-2 text-lg font-semibold text-gray-600 hover:text-blue-600 transition-all duration-300 ${
                this.activeTab === "features" ? "tab-active" : ""
              }" data-tab="features">Features</button>
              <button class="tab-button px-4 py-2 text-lg font-semibold text-gray-600 hover:text-blue-600 transition-all duration-300 ${
                this.activeTab === "specifications" ? "tab-active" : ""
              }" data-tab="specifications">Specifications</button>
            </div>
            <div id="tab-content" class="text-gray-600 leading-relaxed">
              ${this.renderTabContent()}
            </div>
          </div>
        `;
  }

  renderTabContent() {
    const product = this.product;
    switch (this.activeTab) {
      case "description":
        return `
              <div class="animate-slide-in">
                <p>${product.description}</p>
              </div>
            `;
      case "features":
        return `
              <div class="animate-slide-in">
                ${
                  product.features.length > 0
                    ? `<ul class="list-disc pl-5 space-y-2">
                        ${product.features
                          .map((feature) => `<li>${feature}</li>`)
                          .join("")}
                      </ul>`
                    : "<p>No features available.</p>"
                }
              </div>
            `;
      case "specifications":
        return `
              <div class="animate-slide-in">
                ${
                  Array.isArray(product.specifications) &&
                  product.specifications.length > 0
                    ? product.specifications
                        .map(
                          (spec) => `
                        <div class="mb-4 p-4 bg-gray-50 rounded-lg shadow-sm">
                          <h4 class="font-semibold text-lg text-gray-800 mb-2">Specification ${
                            spec.id.split("-")[1]
                          }</h4>
                          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            ${spec.items
                              .map(
                                (item) => `
                              <div>
                                <dt class="font-medium text-gray-700">${item.key}:</dt>
                                <dd class="text-gray-900">${item.value}</dd>
                              </div>
                            `
                              )
                              .join("")}
                          </dl>
                        </div>
                      `
                        )
                        .join("")
                    : "<p>No specifications available.</p>"
                }
              </div>
            `;
      default:
        return "";
    }
  }

  renderRelatedProducts() {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get("category_id");
    console.log("Related Products Category ID:", categoryId);
    return `
          <div class="max-w-6xl mx-auto">
            <h2 class="text-2xl font-bold text-gray-800 mb-8">
              <i class="fas fa-box-open mr-2"></i>
              Related Products
            </h2>
            ${
              this.relatedProducts.length
                ? `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  ${this.relatedProducts
                    .map(
                      (type) => `
                      <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                        <div class="relative h-48 overflow-hidden">
                          <img src="${
                            type.images[0] || "./images/placeholder.jpg"
                          }"
                               alt="${type.name}"
                               class="w-full h-full object-cover hover:scale-105 transition duration-300">
                          <div class="absolute top-2 right-2">
                            ${
                              type.colors.length
                                ? `<span class="bg-white text-red-600 text-xs px-2 py-1 rounded-full">${type.colors.length} Colors</span>`
                                : ""
                            }
                            ${
                              type.sizes.length
                                ? `<span class="bg-white text-red-600 text-xs px-2 py-1 rounded-full ml-1">${type.sizes.length} Sizes</span>`
                                : ""
                            }
                          </div>
                        </div>
                        <div class="p-4">
                          <h3 class="text-xl font-bold text-gray-800 mb-2">${
                            type.name
                          }</h3>
                          <div class="mb-4">
                            ${
                              type.colors.length
                                ? `
                                <div class="flex items-center mb-2">
                                  <span class="text-sm font-medium text-gray-700 mr-2">Colors:</span>
                                  <div class="flex">
                                    ${type.colors
                                      .slice(0, 4)
                                      .map(
                                        (color) => `
                                        <div class="w-5 h-5 rounded-full border border-gray-200 ml-1"
                                             style="background-color: ${this.getColorHex(
                                               color
                                             )}"
                                             title="${color}"></div>
                                      `
                                      )
                                      .join("")}
                                    ${
                                      type.colors.length > 4
                                        ? `<span class="text-xs text-blue-600 ml-1">+${
                                            type.colors.length - 4
                                          }</span>`
                                        : ""
                                    }
                                  </div>
                                </div>
                                `
                                : ""
                            }
                            ${
                              type.sizes.length
                                ? `
                                <div class="flex items-center">
                                  <span class="text-sm font-medium text-gray-700 mr-2">Sizes:</span>
                                  <div class="flex flex-wrap">
                                    ${type.sizes
                                      .slice(0, 3)
                                      .map(
                                        (size) => `
                                        <span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded mr-1 mb-1">${size}</span>
                                      `
                                      )
                                      .join("")}
                                    ${
                                      type.sizes.length > 3
                                        ? `<span class="text-xs text-blue-600 ml-1">+${
                                            type.sizes.length - 3
                                          }</span>`
                                        : ""
                                    }
                                  </div>
                                </div>
                                `
                                : ""
                            }
                          </div>
                          <a href="type-detail.html?id=${
                            type.id
                          }&category_id=${categoryId}"
                             class="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition">
                            <span>View Details</span>
                            <i class="fas fa-arrow-right ml-2"></i>
                          </a>
                        </div>
                      </div>
                    `
                    )
                    .join("")}
                </div>
                `
                : `
                <div class="text-center py-12">
                  <div class="text-blue-500 text-5xl mb-4">
                    <i class="fas fa-box-open"></i>
                  </div>
                  <h3 class="text-2xl font-bold text-blue-800 mb-2">No Related Products</h3>
                  <p class="text-gray-600">Check back later for more products in this category.</p>
                </div>
                `
            }
          </div>
        `;
  }

  renderStarRating(rating) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(`
            <svg class="w-5 h-5 ${
              i <= rating ? "text-yellow-400" : "text-gray-300"
            }" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          `);
    }
    return stars.join("");
  }

  getAvailabilityClass(availability) {
    switch (availability) {
      case "in-stock":
        return "bg-green-100 text-green-800";
      case "low-stock":
        return "bg-yellow-100 text-yellow-800";
      case "out-of-stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  getAvailabilityText(availability) {
    switch (availability) {
      case "in-stock":
        return "In Stock";
      case "low-stock":
        return "Low Stock";
      case "out-of-stock":
        return "Out of Stock";
      default:
        return "Unknown";
    }
  }

  initializeInteractions() {
    this.setupImageGallery();
    this.setupColorSwatches();
    this.setupTabNavigation();
  }

  setupImageGallery() {
    const mainImage = document.getElementById("main-image");
    const thumbnails = document.querySelectorAll(".thumbnail");
    const prevBtn = document.getElementById("prev-image");
    const nextBtn = document.getElementById("next-image");
    const fullscreenBtn = document.getElementById("fullscreen-image");
    const imageCounter = document.getElementById("image-counter");

    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener("click", () => this.changeImage(index));
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.previousImage());
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.nextImage());
    }
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener("click", () => this.openLightbox());
    }
    if (mainImage) {
      mainImage.addEventListener("click", () => this.openLightbox());
    }
  }

  setupColorSwatches() {
    const colorContainer = document.getElementById("product-colors-container");
    if (colorContainer) {
      colorContainer.querySelectorAll(".color-swatch").forEach((swatch) => {
        swatch.addEventListener("click", (event) => {
          const colorIndex = parseInt(event.currentTarget.dataset.colorIndex);
          this.selectColor(colorIndex);
        });
      });
    }
  }

  setupTabNavigation() {
    const tabButtons = document.querySelectorAll(".tab-button");
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tab = button.dataset.tab;
        this.activeTab = tab;
        this.renderProductDetail();
        this.initializeInteractions();
      });
    });
  }

  selectColor(index) {
    if (index === this.currentSelectedColorIndex) return;

    this.currentSelectedColorIndex = index;
    this.currentImageIndex = 0;
    this.product.displayImages = this.product.colors[
      this.currentSelectedColorIndex
    ]?.images || [this.product.cover_image_url || "./images/placeholder.jpg"];

    const imageGallerySection = document.getElementById(
      "image-gallery-section"
    );
    if (imageGallerySection) {
      imageGallerySection.innerHTML = this.renderImageGallery();
      this.setupImageGallery();
    }

    const productInfoSection = document.getElementById("product-info-section");
    if (productInfoSection) {
      productInfoSection.innerHTML = this.renderProductInfo();
      this.setupColorSwatches();
    }
  }

  changeImage(index) {
    this.currentImageIndex = index;
    const mainImage = document.getElementById("main-image");
    const thumbnails = document.querySelectorAll(".thumbnail");
    const imageCounter = document.getElementById("image-counter");
    const imagesToDisplay = this.product.displayImages;

    if (mainImage) {
      mainImage.src = imagesToDisplay[index] || "./images/placeholder.jpg";
    }

    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle("border-blue-500", i === index);
      thumb.classList.toggle("border-transparent", i !== index);
    });

    if (imageCounter) {
      imageCounter.textContent = index + 1;
    }
  }

  previousImage() {
    const imagesToDisplay = this.product.displayImages;
    if (imagesToDisplay.length === 0) return;
    const newIndex =
      this.currentImageIndex > 0
        ? this.currentImageIndex - 1
        : imagesToDisplay.length - 1;
    this.changeImage(newIndex);
  }

  nextImage() {
    const imagesToDisplay = this.product.displayImages;
    if (imagesToDisplay.length === 0) return;
    const newIndex =
      this.currentImageIndex < imagesToDisplay.length - 1
        ? this.currentImageIndex + 1
        : 0;
    this.changeImage(newIndex);
  }

  openLightbox() {
    const imagesToDisplay = this.product.displayImages;
    if (imagesToDisplay.length === 0) return;

    const lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    lightbox.className =
      "fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50";

    lightbox.innerHTML = `
          <div class="relative max-w-4xl h-80 p-4">
            <img src="${
              imagesToDisplay[this.currentImageIndex] ||
              "./images/placeholder.jpg"
            }"
                 alt="${this.product.name}"
                 class="max-w-full max-h-full object-contain">
            <button id="close-lightbox" class="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        `;

    document.body.appendChild(lightbox);

    document.getElementById("close-lightbox").addEventListener("click", () => {
      document.body.removeChild(lightbox);
    });

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        document.body.removeChild(lightbox);
      }
    });
  }

  handleKeyboardNavigation(e) {
    if (this.isLoading) return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        this.previousImage();
        break;
      case "ArrowRight":
        e.preventDefault();
        this.nextImage();
        break;
      case "Escape":
        const lightbox = document.getElementById("lightbox");
        if (lightbox) {
          document.body.removeChild(lightbox);
        }
        break;
      case " ":
        e.preventDefault();
        this.openLightbox();
        break;
    }
  }

  handleWindowResize() {
    this.adjustLayoutForViewport();
  }

  adjustLayoutForViewport() {
    const isMobile = window.innerWidth < 768;
    const thumbnails = document.querySelectorAll(".thumbnail");

    thumbnails.forEach((thumb) => {
      thumb.style.width = isMobile ? "3rem" : "4rem";
      thumb.style.height = isMobile ? "3rem" : "4rem";
    });
  }

  trackProductView() {
    if (typeof gtag !== "undefined") {
      gtag("event", "view_item", {
        item_id: this.product.id,
        item_name: this.product.name,
        item_category: this.product.category?.name || "Unknown Category",
        value: parseFloat(this.product.price.replace(/[^\d.]/g, "")) || 0,
      });
    }
  }

  renderError(message) {
    const typeDetail = document.getElementById("type-detail");
    if (!typeDetail) return;
    typeDetail.innerHTML = `
          <div class="bg-white rounded-2xl p-12 shadow-xl text-center animate-slide-in">
            <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.334 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
            <p class="text-gray-600 mb-8">${message}</p>
            <div class="flex justify-center space-x-4">
              <button onclick="window.history.back()" class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300">
                Go Back
              </button>
              <button onclick="location.reload()" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300">
                Try Again
              </button>
            </div>
          </div>
        `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ProductDetailManager();
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = ProductDetailManager;
}

async function fetchProductForUpdate() {
  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get("id");

  if (!categoryId) {
    alert("Category not found!");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not authenticated. Please log in.");
      window.location.href = "login.html";
      return;
    }

    const response = await fetch(
      `https://api.vybtek.com/api/manuplast/categories/${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch category details: ${response.status} ${response.statusText}`
      );
    }

    const category = await response.json();
    populateForm(category);
  } catch (error) {
    console.error("Error fetching category for update:", error);
    alert(`Failed to load category data: ${error.message}`);
  }
}

document
  .getElementById("update-product-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const csrfToken = document.getElementById("csrf-token")?.value || "";
    if (!token) {
      alert("You are not authenticated. Please log in.");
      window.location.href = "login.html";
      return;
    }

    const productIdInput = document.getElementById("product-id");
    const nameInput = document.getElementById("name");
    const imageInput = document.getElementById("image");
    const descriptionInput = document.getElementById("description");

    if (!productIdInput || !nameInput || !imageInput || !descriptionInput) {
      alert("Error: Form elements are missing.");
      return;
    }

    const categoryId = productIdInput.value;
    const name = nameInput.value;
    const image = imageInput.files[0];
    const description = descriptionInput.value;

    if (!categoryId || !name || !image || !description) {
      alert("Category name, image, and description are required.");
      return;
    }

    const types = Array.from(
      document.querySelectorAll("#types-container .type-item")
    )
      .map((typeDiv, index) => {
        const typeName =
          typeDiv.querySelector(`#type-name-${index}`)?.value || "";
        const typeImages = typeDiv.querySelector(
          `#type-images-${index}`
        )?.files;
        const typeDescription =
          typeDiv.querySelector(`#type-description-${index}`)?.value || "";
        const typePrice =
          parseFloat(typeDiv.querySelector(`#type-price-${index}`)?.value) || 0;
        const typeSizes = Array.from(
          typeDiv.querySelectorAll(
            `.type-sizes-container[data-type-index="${index}"] .type-size`
          )
        )
          .map((input) => input.value)
          .filter((size) => size.trim() !== "");
        const typeColors = Array.from(
          typeDiv.querySelectorAll(
            `.type-colors-container[data-type-index="${index}"] .type-color`
          )
        )
          .map((input) => input.value)
          .filter((color) => color.trim() !== "");

        return {
          name: typeName,
          images: typeImages ? Array.from(typeImages) : [],
          description: typeDescription,
          price: typePrice,
          sizes: typeSizes,
          colors: typeColors,
        };
      })
      .filter((t) => t.name && t.images.length && t.description && t.price > 0);

    if (types.length === 0) {
      alert(
        "Please add at least one valid product type with name, at least one image, description, and price."
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("image", image);

      const categoryResponse = await fetch(
        `https://api.vybtek.com/api/manuplast/categories/${categoryId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRF-Token": csrfToken,
          },
          body: formData,
        }
      );

      if (!categoryResponse.ok) {
        const errorData = await categoryResponse.json().catch(() => ({}));
        throw new Error(
          `Failed to update category: ${
            errorData.message || categoryResponse.statusText
          }`
        );
      }

      for (const type of types) {
        const typeFormData = new FormData();
        typeFormData.append("name", type.name);
        typeFormData.append("description", type.description);
        typeFormData.append("price", type.price);
        typeFormData.append("category_id", categoryId);
        if (type.images.length) {
          typeFormData.append("image", type.images[0]);
        }

        const typeResponse = await fetch(
          `https://api.vybtek.com/api/manuplast/producttypes`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "X-CSRF-Token": csrfToken,
            },
            body: typeFormData,
          }
        );

        if (!typeResponse.ok) {
          const error = await typeResponse.json().catch(() => ({}));
          throw new Error(
            `Failed to save product type: ${
              error.message || typeResponse.statusText
            }`
          );
        }

        const createdType = await typeResponse.json();
        const typeId = createdType.id;

        for (const image of type.images) {
          const imageForm = new FormData();
          imageForm.append("producttype_id", typeId);
          imageForm.append("image", image);
          const imgResponse = await fetch(
            `https://api.vybtek.com/api/manuplast/producttypeimages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "X-CSRF-Token": csrfToken,
              },
              body: imageForm,
            }
          );
          if (!imgResponse.ok) {
            console.warn(
              `Failed uploading image for type ${typeId}: ${imgResponse.status}`
            );
          }
        }

        for (const size of type.sizes) {
          const sizeResponse = await fetch(
            `https://api.vybtek.com/api/manuplast/producttypesizes`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "X-CSRF-Token": csrfToken,
              },
              body: JSON.stringify({
                producttype_id: typeId,
                size,
              }),
            }
          );
          if (!sizeResponse.ok) {
            throw new Error(`Failed to save size: ${size}`);
          }
        }

        for (const color of type.colors) {
          const colorResponse = await fetch(
            `https://api.vybtek.com/api/manuplast/producttypecolors`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "X-CSRF-Token": csrfToken,
              },
              body: JSON.stringify({
                producttype_id: typeId,
                color,
              }),
            }
          );
          if (!colorResponse.ok) {
            throw new Error(`Failed to save color: ${color}`);
          }
        }
      }

      alert("Category and product types updated successfully!");
      window.location.href = "dashboard.html";
    } catch (error) {
      console.error("Error updating category:", error);
      alert(`Failed to update category: ${error.message}`);
    }
  });

document
  .getElementById("category-form")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const imageInput = document.getElementById("image");
    const description = document.getElementById("description").value;
    const token = localStorage.getItem("token");
    const modal = document.getElementById("category-modal");

    if (!token) {
      alert("You are not authenticated. Please log in.");
      window.location.href = "login.html";
      return;
    }

    if (!imageInput.files[0]) {
      alert("Please select an image for the category");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", imageInput.files[0]);

    try {
      const response = await fetch(
        "https://api.vybtek.com/api/manuplast/categories",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add category");
      }

      alert("Category added successfully!");
      modal.classList.add("hidden");
      this.reset();
      fetchProducts("dashboard-product-list", "dashboard"); // Refresh the list
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });

document
  .getElementById("update-category-form")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const categoryIdInput = document.getElementById("update-category-id");
    const nameInput = document.getElementById("update-name");
    const imageInput = document.getElementById("update-image");
    const descriptionInput = document.getElementById("update-description");
    const modal = document.getElementById("update-category-modal");

    if (!categoryIdInput || !nameInput || !descriptionInput || !modal) {
      showNotification(
        "Error: Update form is not properly initialized",
        "error"
      );
      return;
    }

    const categoryId = categoryIdInput.value;
    const name = nameInput.value;
    const description = descriptionInput.value;
    const image = imageInput?.files[0];
    const token = localStorage.getItem("token");

    if (!token) {
      showNotification("You are not authenticated. Please log in.", "error");
      modal.classList.add("hidden");
      window.location.href = "login.html";
      return;
    }

    if (!name || !description) {
      showNotification("Category name and description are required.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch(
        `https://api.vybtek.com/api/manuplast/categories/${categoryId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRF-Token": document.getElementById("csrf-token")?.value || "",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update category");
      }

      showNotification("Category updated successfully!", "success");
      modal.classList.add("hidden");
      this.reset();
      document.getElementById("current-image-preview")?.classList.add("hidden");
      fetchProducts("dashboard-product-list", "dashboard");
    } catch (error) {
      showNotification(`Error: ${error.message}`, "error");
    }
  });

// Call this function in your DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.toLowerCase();
  const addCategoryBtn = document.getElementById("add-category-btn");
  const closeModalBtn = document.getElementById("close-modal");
  const categoryModal = document.getElementById("category-modal");
  const closeUpdateModalBtn = document.getElementById("close-update-modal");
  const updateModal = document.getElementById("update-category-modal");

  // Initialize page-specific functionality
  if (path.includes("products") || path === "/") {
    fetchProducts("product-grid", "default");
  } else if (path.includes("dashboard")) {
    fetchProducts("dashboard-product-list", "dashboard");
  } else if (path.includes("product-detail")) {
    fetchProductDetail();
  } else if (path.includes("type-detail")) {
    fetchTypeDetail();
  } else if (path.includes("update-product")) {
    fetchProductForUpdate();
  }

  // Add category modal handlers
  if (addCategoryBtn && categoryModal && closeModalBtn) {
    addCategoryBtn.addEventListener("click", () => {
      categoryModal.classList.remove("hidden");
    });
    closeModalBtn.addEventListener("click", () => {
      categoryModal.classList.add("hidden");
      document.getElementById("category-form")?.reset();
    });
    categoryModal.addEventListener("click", (e) => {
      if (e.target === categoryModal) {
        categoryModal.classList.add("hidden");
        document.getElementById("category-form")?.reset();
      }
    });
  }

  // Update category modal handlers
  if (closeUpdateModalBtn && updateModal) {
    closeUpdateModalBtn.addEventListener("click", () => {
      updateModal.classList.add("hidden");
      document.getElementById("update-category-form")?.reset();
      document.getElementById("current-image-preview")?.classList.add("hidden");
    });
    updateModal.addEventListener("click", (e) => {
      if (e.target === updateModal) {
        updateModal.classList.add("hidden");
        document.getElementById("update-category-form")?.reset();
        document
          .getElementById("current-image-preview")
          ?.classList.add("hidden");
      }
    });
  }
});
