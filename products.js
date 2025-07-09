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
      "http://192.168.0.102:5000/api/manuplast/categories",
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
          ${
            view === "dashboard"
              ? '<button id="add-category-btn" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Add New Category</button>'
              : ""
          }
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
               
                <button onclick="openUpdateModal(${JSON.stringify(
                  category
                ).replace(/"/g, "'")})" 
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
        // Default view for customers
        categoryCard.className =
          "group relative overflow-hidden rounded-xl shadow-lg transition-all hover:shadow-xl";
        categoryCard.innerHTML = `
          <a href="product-detail.html?id=${category.id}" class="block">
            <div class="aspect-w-4 aspect-h-3">
              <img src="${category.image_url || "./images/placeholder.jpg"}" 
                   alt="${category.name || "Unnamed"}" 
                   class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105">
            </div>
            <div class="p-6 bg-white">
              <h3 class="text-xl font-bold text-gray-900 mb-2">${
                category.name || "Unnamed"
              }</h3>
              <p class="text-gray-600 line-clamp-2 mb-4">${
                category.description?.slice(0, 100) || "No description"
              }</p>
              <div class="flex items-center text-blue-600 font-medium">
                View Products
                <svg class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

// Modern modal styling
function openUpdateModal(category) {
  const modal = document.getElementById("update-category-modal");
  if (!modal) return;

  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-gray-900">Update Category</h3>
            <button id="close-update-modal" class="text-gray-400 hover:text-gray-500">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form id="update-category-form" class="space-y-4">
            <input type="hidden" id="update-category-id" value="${
              category.id || ""
            }">
            
            <div>
              <label for="update-name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" id="update-name" value="${
                category.name || ""
              }" 
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
            </div>
            
            <div>
              <label for="update-description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea id="update-description" rows="3"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">${
                          category.description || ""
                        }</textarea>
            </div>
            
            <div id="current-image-preview" class="${
              category.image_url ? "" : "hidden"
            }">
              <label class="block text-sm font-medium text-gray-700 mb-1">Current Image</label>
              <img id="current-image" src="${category.image_url || ""}" 
                   class="w-full h-32 object-contain rounded-lg border border-gray-200">
            </div>
            
            <div>
              <label for="update-image" class="block text-sm font-medium text-gray-700 mb-1">New Image</label>
              <input type="file" id="update-image" accept="image/*"
                     class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
            </div>
            
            <div class="pt-4 flex justify-end space-x-3">
              <button type="button" id="cancel-update" 
                      class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" 
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Update Category
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Add event listeners for the dynamically created modal
  document
    .getElementById("close-update-modal")
    ?.addEventListener("click", () => {
      modal.classList.add("hidden");
    });

  document.getElementById("cancel-update")?.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
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
      `http://192.168.0.102:5000/api/manuplast/categories/${id}`,
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
      `http://192.168.0.102:5000/api/manuplast/categories/${categoryId}/status`,
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
function openUpdateModal(category) {
  const modal = document.getElementById("update-category-modal");
  document.getElementById("update-category-id").value = category.id;
  document.getElementById("update-name").value = category.name || "";
  document.getElementById("update-description").value =
    category.description || "";

  // Show current image if it exists
  const previewContainer = document.getElementById("current-image-preview");
  const currentImage = document.getElementById("current-image");
  if (category.image_url) {
    currentImage.src = category.image_url;
    previewContainer.classList.remove("hidden");
  } else {
    previewContainer.classList.add("hidden");
  }

  modal.classList.remove("hidden");
}

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
  console.log("product-detail element:", productDetail);
  if (!productDetail) {
    console.error("product-detail element not found");
    alert("Error: Product detail container not found. Please check the HTML.");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get("id");
  const source = params.get("source");

  if (!categoryId) {
    productDetail.innerHTML = `
      <p class="text-red-500 text-lg text-center font-semibold py-12">Category not found.</p>
    `;
    return;
  }

  productDetail.innerHTML = `
    <div class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  `;

  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const categoryResponse = await fetch(
      `http://192.168.0.102:5000/api/manuplast/categories/${categoryId}`,
      { headers }
    );
    if (!categoryResponse.ok) {
      throw new Error(
        `Failed to fetch category details: ${categoryResponse.status} ${categoryResponse.statusText}`
      );
    }

    const category = await categoryResponse.json();
    console.log("Fetched category:", category);

    const isFromDashboard =
      document.referrer.includes("dashboard") || source === "dashboard";

    if (category.status?.toLowerCase() !== "active" && !isFromDashboard) {
      productDetail.innerHTML = `
        <div class="text-center py-16">
          <h2 class="text-2xl font-bold text-red-600">This category is currently inactive.</h2>
          <a href="products.html" class="mt-4 inline-block bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900">
            ← Back to Categories
          </a>
        </div>
      `;
      return;
    }

    const typesResponse = await fetch(
      `http://192.168.0.102:5000/api/manuplast/producttypes?category_id=${categoryId}`,
      { headers }
    );
    if (!typesResponse.ok) {
      throw new Error(
        `Failed to fetch product types: ${typesResponse.status} ${typesResponse.statusText}`
      );
    }

    const productTypes = await typesResponse.json();
    console.log("Raw product types response:", productTypes);

    // Filter product types by category_id (strict comparison)
    const filteredProductTypes = Array.isArray(productTypes)
      ? productTypes
          .filter((type) => {
            const typeCategoryId = String(type.category_id); // Convert to string to handle type mismatches
            const expectedCategoryId = String(categoryId);
            const isValid = typeCategoryId === expectedCategoryId;
            console.log(
              `Product type ${
                type.id || "unknown"
              }: category_id = ${typeCategoryId}, expected = ${expectedCategoryId}, included = ${isValid}`
            );
            return isValid;
          })
          .map((type) => {
            console.log(
              `Processing product type ${type.id || "unknown"}:`,
              type
            );
            return {
              ...type,
              images: Array.isArray(type.images)
                ? type.images
                    .map((img) =>
                      typeof img === "string" ? img : img.image_url
                    )
                    .filter((url) => url && typeof url === "string")
                    .map((url) => url || "./images/placeholder.jpg")
                : ["./images/placeholder.jpg"],
              sizes: Array.isArray(type.sizes)
                ? type.sizes
                    .map((sizeObj) =>
                      typeof sizeObj === "string" ? sizeObj : sizeObj.size
                    )
                    .filter(
                      (size) =>
                        size && typeof size === "string" && size.trim() !== ""
                    )
                : [],
              colors: Array.isArray(type.colors)
                ? type.colors
                    .map((colorObj) =>
                      typeof colorObj === "string" ? colorObj : colorObj.color
                    )
                    .filter(
                      (color) =>
                        color &&
                        typeof color === "string" &&
                        color.trim() !== ""
                    )
                : [],
            };
          })
      : [];
    console.log("Filtered and processed product types:", filteredProductTypes);

    if (filteredProductTypes.length === 0) {
      console.warn(`No product types found for category_id ${categoryId}`);
    }

    try {
      const typesContent = filteredProductTypes.length
        ? `
            <h2 class="text-3xl font-semibold text-gray-900 mt-10 text-center">Products List</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
              ${filteredProductTypes
                .map((type) => {
                  try {
                    return `
                      <a href="type-detail.html?id=${
                        type.id || ""
                      }&category_id=${categoryId}" class="block">
                        <div class="p-6 rounded-xl transition duration-300 bg-white shadow hover:shadow-lg" style="border: 1px solid gray;">
                          <div class="image-gallery mb-4 relative">
                            <div class="gallery-container flex overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar">
                              ${
                                type.images.length
                                  ? type.images
                                      .map(
                                        (img, index) => `
                                        <div class="gallery-item flex-shrink-0 snap-center">
                                          <img src="${img}" class="w-full h-52 object-cover rounded-md" data-index="${index}" alt="${
                                          type.name || "Unnamed"
                                        } image ${
                                          index + 1
                                        }" style="border: 1px solid blue;"/>
                                        </div>
                                      `
                                      )
                                      .join("")
                                  : `
                                    <div class="gallery-item flex-shrink-0 snap-center">
                                      <img src="./images/placeholder.jpg" class="w-full h-52 object-cover rounded-md" data-index="0" alt="Placeholder" style="border: 1px solid blue;"/>
                                    </div>
                                  `
                              }
                            </div>
                          </div>
                          <h3 class="text-2xl font-semibold text-gray-800 mt-4">${
                            type.name || "Unnamed"
                          }</h3>
                          <p class="text-gray-600 mt-3 text-sm leading-relaxed">${
                            type.description || "No description available"
                          }</p>
                          <p class="text-center text-gray-600 hover:text-red-500 mt-4 rounded-lg">
                            View Details <i class="fa-solid fa-arrow-right ml-1"></i>
                          </p>
                        </div>
                      </a>
                    `;
                  } catch (error) {
                    console.error(
                      `Error rendering product type ${type.id || "unknown"}:`,
                      error
                    );
                    return "";
                  }
                })
                .join("")}
            </div>
          `
        : `<p class="text-gray-500 mt-8 text-center">No products available in this category.</p>`;

      productDetail.innerHTML = `
        <div class="max-w-6xl mx-auto bg-white/90 backdrop-blur-lg overflow-hidden p-8 mt-2">
          <h1 class="text-4xl font-bold text-gray-900 text-center tracking-wide">${
            category.name || "Unnamed"
          }</h1>
          <div class="mt-8 flex justify-center">
            <img src="${
              category.image_url || "./images/placeholder.jpg"
            }" class="w-full max-h-[28rem] object-cover rounded-xl transition-transform duration-300 hover:shadow-xl" alt="${
        category.name || "Unnamed"
      }">
          </div>
          <p class="mt-8 text-lg text-gray-700 leading-relaxed text-justify">${
            category.description || "No description available"
          }</p>
          ${typesContent}
          <div class="flex justify-center mt-10">
            <a href="products.html" class="bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold px-8 py-3 rounded-full transition duration-300 hover:from-gray-700 hover:to-gray-800 hover:shadow-lg">
              ← Back to Categories
            </a>
          </div>
        </div>
        <style>
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .gallery-container {
            display: flex;
            overflow-x: auto;
            scroll-behavior: smooth;
            padding: 0 10px;
          }
          .gallery-item {
            flex: 0 0 auto;
            width: 100%;
            max-width: 320px;
            margin-right: 16px;
          }
          .gallery-item:last-child {
            margin-right: 0;
          }
          .gallery-item img {
            width: 100%;
            height: 208px;
            object-fit: cover;
            display: block;
          }
        </style>
        <script>
          document.addEventListener("DOMContentLoaded", () => {
            document.querySelectorAll(".gallery-container").forEach((galleryContainer) => {
              const images = galleryContainer.querySelectorAll(".gallery-item");
              if (images.length > 1) {
                let currentIndex = 0;
                function updateScroll() {
                  const imageWidth = images[0].offsetWidth + 16;
                  galleryContainer.scrollTo({
                    left: currentIndex * imageWidth,
                    behavior: "smooth"
                  });
                }
                const navDiv = document.createElement("div");
                navDiv.className = "gallery-nav flex justify-between mt-2";
                galleryContainer.parentElement.appendChild(navDiv);
                const prevButton = navDiv.querySelector(".prev");
                const nextButton = navDiv.querySelector(".next");
                prevButton.addEventListener("click", () => {
                  if (currentIndex > 0) {
                    currentIndex--;
                    updateScroll();
                    prevButton.disabled = currentIndex === 0;
                    nextButton.disabled = false;
                  }
                });
                nextButton.addEventListener("click", () => {
                  if (currentIndex < images.length - 1) {
                    currentIndex++;
                    updateScroll();
                    nextButton.disabled = currentIndex === images.length - 1;
                    prevButton.disabled = false;
                  }
                });
              }
            });
          });
        </script>
      `;
    } catch (error) {
      console.error("Error rendering product detail content:", error);
      productDetail.innerHTML = `
        <p class="text-red-500 text-lg text-center font-semibold py-12">Error rendering product details: ${error.message}</p>
      `;
    }
  } catch (error) {
    console.error("Error loading category details:", error);
    productDetail.innerHTML = `
      <div class="col-span-full text-center py-12">
        <h3 class="text-xl font-medium text-red-600">Error loading category details</h3>
        <p class="text-gray-600 mt-2">${error.message}</p>
        <button onclick="fetchProductDetail()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Try Again
        </button>
      </div>
    `;
  }
}

// Enhanced Product Detail Page - Display Only Version
class ProductDetailManager {
  constructor() {
    this.currentImageIndex = 0;
    this.imageViewMode = "gallery"; // 'gallery' or 'zoom'
    this.product = null;
    this.isLoading = false;

    this.init();
  }

  init() {
    this.fetchProductDetail();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Keyboard navigation for images
    document.addEventListener("keydown", (e) =>
      this.handleKeyboardNavigation(e)
    );

    // Window resize handler
    window.addEventListener("resize", () => this.handleWindowResize());
  }

  async fetchProductDetail() {
    const typeDetail = document.getElementById("type-detail");
    if (!typeDetail) {
      this.showError("Product detail container not found");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const typeId = params.get("id");
    const categoryId = params.get("category_id");

    if (!typeId || !categoryId) {
      this.renderError("Product not found. Invalid product ID or category.");
      return;
    }

    this.showLoadingState();
    this.isLoading = true;

    try {
      const response = await this.makeApiCall(typeId);
      const product = await response.json();

      if (!this.validateProduct(product, categoryId)) {
        this.renderError(
          "This product does not belong to the specified category."
        );
        return;
      }

      this.product = this.processProductData(product);
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

  async makeApiCall(typeId) {
    const token = this.getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(
      `http://192.168.0.102:5000/api/manuplast/producttypes/${typeId}`,
      {
        headers,
        timeout: 10000, // 10 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response;
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
    const productCategoryId = String(product.category_id);
    const categoryId = String(expectedCategoryId);

    console.log(
      `Validating product: ${product.id}, category: ${productCategoryId}, expected: ${categoryId}`
    );

    return productCategoryId === categoryId;
  }

  processProductData(rawProduct) {
    return {
      ...rawProduct,
      images: this.processImages(rawProduct.images),
      sizes: this.processSizes(rawProduct.sizes),
      colors: this.processColors(rawProduct.colors),
      price: this.formatPrice(rawProduct.price),
      rating: this.calculateRating(rawProduct.reviews),
      availability: this.checkAvailability(rawProduct.stock),
    };
  }

  processImages(images) {
    if (!Array.isArray(images)) return ["./images/placeholder.jpg"];

    return images
      .map((img) => (typeof img === "string" ? img : img?.image_url))
      .filter((url) => url && typeof url === "string" && url.trim() !== "")
      .map((url) => (url.startsWith("http") ? url : `./images/${url}`))
      .concat(images.length === 0 ? ["./images/placeholder.jpg"] : []);
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

  processColors(colors) {
    if (!Array.isArray(colors)) return [];

    return colors
      .map((color) => (typeof color === "string" ? color : color?.color))
      .filter(
        (color) => color && typeof color === "string" && color.trim() !== ""
      )
      .map((color) => ({
        name: color,
        hex: this.getColorHex(color),
        textColor: this.getTextColor(color),
      }));
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
    };

    return colorMap[colorName.toLowerCase()] || "#6b7280";
  }

  getTextColor(colorName) {
    const lightColors = ["white", "yellow", "lightgray", "pink", "orange"];
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

  calculateRating(reviews) {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0;
    const total = reviews.reduce(
      (sum, review) => sum + (review.rating || 0),
      0
    );
    return Math.round((total / reviews.length) * 10) / 10;
  }

  checkAvailability(stock) {
    if (!stock || stock === 0) return "out-of-stock";
    if (stock < 10) return "low-stock";
    return "in-stock";
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
                    () => '<div class="bg-gray-300 w-16 h-16 rounded-lg"></div>'
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
    const product = this.product;

    typeDetail.innerHTML = `
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <!-- Image Gallery Section -->
          <div class="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
            ${this.renderImageGallery()}
          </div>
          
          <!-- Product Info Section -->
          <div class="p-8">
            ${this.renderProductInfo()}
          </div>
        </div>
        
        <!-- Additional Details Section -->
        <div class="border-t border-gray-200 p-8">
          ${this.renderAdditionalDetails()}
        </div>
      </div>
    `;
  }

  renderImageGallery() {
    const product = this.product;

    return `
      <div class="space-y-4">
        <!-- Main Image -->
        <div class="relative group">
          <div class="aspect-w-1 aspect-h-1 bg-white rounded-xl overflow-hidden shadow-lg">
            <img id="main-image" 
                 src="${product.images[0]}" 
                 alt="${product.name}" 
                 class="w-full h-80 object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105">
          </div>
          
          <!-- Image Controls -->
          <div class="absolute top-4 right-4 space-y-2">
            <button id="fullscreen-image" class="bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all duration-300">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
              </svg>
            </button>
          </div>
          
          <!-- Navigation Arrows -->
          ${
            product.images.length > 1
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
        
        <!-- Thumbnail Gallery -->
        ${
          product.images.length > 1
            ? `
          <div class="flex space-x-2 overflow-x-auto pb-2">
            ${product.images
              .map(
                (image, index) => `
              <img src="${image}" 
                   alt="${product.name} ${index + 1}" 
                   class="thumbnail w-16 h-16 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-300 flex-shrink-0 ${
                     index === 0 ? "border-blue-500" : ""
                   }"
                   data-index="${index}">
            `
              )
              .join("")}
          </div>
        `
            : ""
        }
        
        <!-- Image Counter -->
        <div class="text-center text-sm text-gray-500">
          <span id="image-counter">1</span> / ${product.images.length}
        </div>
      </div>
    `;
  }

  renderProductInfo() {
    const product = this.product;

    return `
      <div class="space-y-6">
        <!-- Product Title & Rating -->
        <div>
          <h1 class="text-3xl text-start font-bold text-gray-900 mb-2">${
            product.name
          }</h1>
        </div>
        
        <!-- Description -->
        <div>
          <p class="text-gray-600 text-start leading-relaxed">${
            product.description || "No description available"
          }</p>
        </div>
        
        <!-- Size Information -->
        ${
          product.sizes.length > 0
            ? `
          <div>
            <h3 class="text-lg text-start font-semibold text-gray-900 mb-3">Available Sizes</h3>
            <div class="flex flex-wrap gap-2">
              ${product.sizes
                .map(
                  (size) => `
                <span class="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
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
        
        <!-- Color Information -->
        ${
          product.colors.length > 0
            ? `
          <div>
            <h3 class="text-lg text-start font-semibold text-gray-900 mb-3">Available Colors</h3>
            <div class="flex flex-wrap gap-3">
              ${product.colors
                .map(
                  (color) => `
                <span class="relative w-12 h-12 rounded-full border-2 border-gray-200" 
                      style="background-color: ${color.hex}"
                      title="${color.name}">
                  <span class="sr-only">${color.name}</span>
                </span>
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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
       
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
  }

  setupImageGallery() {
    const mainImage = document.getElementById("main-image");
    const thumbnails = document.querySelectorAll(".thumbnail");
    const prevBtn = document.getElementById("prev-image");
    const nextBtn = document.getElementById("next-image");
    const fullscreenBtn = document.getElementById("fullscreen-image");
    const imageCounter = document.getElementById("image-counter");

    // Thumbnail clicks
    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener("click", () => this.changeImage(index));
    });

    // Navigation buttons
    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.previousImage());
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.nextImage());
    }

    // Fullscreen toggle
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener("click", () => this.openLightbox());
    }

    // Main image click for lightbox
    if (mainImage) {
      mainImage.addEventListener("click", () => this.openLightbox());
    }
  }

  changeImage(index) {
    this.currentImageIndex = index;
    const mainImage = document.getElementById("main-image");
    const thumbnails = document.querySelectorAll(".thumbnail");
    const imageCounter = document.getElementById("image-counter");

    if (mainImage) {
      mainImage.src = this.product.images[index];
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
    const newIndex =
      this.currentImageIndex > 0
        ? this.currentImageIndex - 1
        : this.product.images.length - 1;
    this.changeImage(newIndex);
  }

  nextImage() {
    const newIndex =
      this.currentImageIndex < this.product.images.length - 1
        ? this.currentImageIndex + 1
        : 0;
    this.changeImage(newIndex);
  }

  openLightbox() {
    // Create lightbox dynamically
    const lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    lightbox.className =
      "fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50";

    lightbox.innerHTML = `
      <div class="relative max-w-4xl max-h-screen p-4">
        <img src="${this.product.images[this.currentImageIndex]}" 
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

    // Add event listeners
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

    // Only handle if not typing in input
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
    // Adjust layout for responsive design
    this.adjustLayoutForViewport();
  }

  adjustLayoutForViewport() {
    // Responsive adjustments
    const isMobile = window.innerWidth < 768;
    const thumbnails = document.querySelectorAll(".thumbnail");

    thumbnails.forEach((thumb) => {
      thumb.style.width = isMobile ? "12" : "16";
      thumb.style.height = isMobile ? "12" : "16";
    });
  }

  trackProductView() {
    // Analytics tracking
    if (typeof gtag !== "undefined") {
      gtag("event", "view_item", {
        item_id: this.product.id,
        item_name: this.product.name,
        item_category: this.product.category_name,
        value: parseFloat(this.product.price.replace(/[^\d.]/g, "")),
      });
    }
  }

  renderError(message) {
    const typeDetail = document.getElementById("type-detail");
    typeDetail.innerHTML = `
      <div class="bg-white rounded-2xl p-12 shadow-xl text-center">
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

  showError(message) {
    console.error(message);
    alert(message);
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  new ProductDetailManager();
});

// Legacy support for existing function calls
async function fetchTypeDetail() {
  new ProductDetailManager();
}

// Export for module usage
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
      `http://192.168.0.102:5000/api/manuplast/categories/${categoryId}`,
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
        `http://192.168.0.102:5000/api/manuplast/categories/${categoryId}`,
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
          `http://192.168.0.102:5000/api/manuplast/producttypes`,
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
            `http://192.168.0.102:5000/api/manuplast/producttypeimages`,
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
            `http://192.168.0.102:5000/api/manuplast/producttypesizes`,
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
            `http://192.168.0.102:5000/api/manuplast/producttypecolors`,
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
        "http://192.168.0.102:5000/api/manuplast/categories",
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

    const categoryId = document.getElementById("update-category-id").value;
    const name = document.getElementById("update-name").value;
    const imageInput = document.getElementById("update-image");
    const description = document.getElementById("update-description").value;
    const token = localStorage.getItem("token");
    const modal = document.getElementById("update-category-modal");

    if (!token) {
      alert("You are not authenticated. Please log in.");
      window.location.href = "login.html";
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (imageInput.files[0]) {
      formData.append("image", imageInput.files[0]);
    }

    try {
      const response = await fetch(
        `http://192.168.0.102:5000/api/manuplast/categories/${categoryId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update category");
      }

      alert("Category updated successfully!");
      modal.classList.add("hidden");
      this.reset();
      fetchProducts("dashboard-product-list", "dashboard");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });

// Call this function in your DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.toLowerCase();
  const closeUpdateModalBtn = document.getElementById("close-update-modal");
  const updateModal = document.getElementById("update-category-modal");

  if (path.includes("products.html")) {
    fetchProducts("product-grid", "default");
  } else if (path.includes("dashboard.html")) {
    fetchProducts("dashboard-product-list", "dashboard");
  } else if (path.includes("product-detail.html")) {
    fetchProductDetail();
  } else if (path.includes("type-detail.html")) {
    fetchTypeDetail();
  } else if (path.includes("update-product.html")) {
    fetchProductForUpdate();
  }
  if (closeUpdateModalBtn && updateModal) {
    closeUpdateModalBtn.addEventListener("click", () => {
      updateModal.classList.add("hidden");
      document.getElementById("update-category-form").reset();
    });

    // Close modal when clicking outside
    updateModal.addEventListener("click", (e) => {
      if (e.target === updateModal) {
        updateModal.classList.add("hidden");
        document.getElementById("update-category-form").reset();
      }
    });
  }
});

// <div class="gallery-nav flex justify-between mt-2 ${type.images.length > 1 ? "block" : "hidden"}">
//           <button class="prev bg-gray-800 text-white p-2 rounded-full" disabled>←</button>
//           <button class="next bg-gray-800 text-white p-2 rounded-full">→</button>
//         </div>
