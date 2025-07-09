console.log("product-list.js loaded");
console.log("Current pathname:", window.location.pathname);

// Centralized function to get headers with token and CSRF
function getHeaders() {
  const token = localStorage.getItem("token");
  const csrfToken = document.getElementById("csrf-token")?.value || "";
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  if (csrfToken && csrfToken !== "YOUR_CSRF_TOKEN_HERE") {
    headers["X-CSRF-Token"] = csrfToken;
  }
  return headers;
}

// Validate image file types
function isValidImage(file) {
  const validTypes = ["image/jpeg", "image/png", "image/gif"];
  return validTypes.includes(file.type);
}

async function fetchProductsList(
  containerId = "dashboard-products-list",
  view = "dashboard"
) {
  const productsGrid = document.getElementById(containerId);
  if (!productsGrid) {
    console.error(`Container with ID ${containerId} not found`);
    alert(
      "Error: Products container not found. Please check the page structure."
    );
    return;
  }

  productsGrid.innerHTML =
    '<p class="text-gray-500 text-center py-4">Loading products...</p>';

  try {
    const headers = getHeaders();
    if (!headers.Authorization && view === "dashboard") {
      console.warn("No authentication token found. Redirecting to login.");
      alert("You are not authenticated. Please log in.");
      window.location.href = "login.html";
      return;
    }

    // Fetch products with all details (sizes, colors, images) in a single call
    const response = await fetch(
      `http://192.168.0.102:5000/api/manuplast/producttypes?t=${Date.now()}`,
      { headers }
    );
    console.log("Product fetch response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch products: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const products = await response.json();
    console.log("Fetched products:", products);

    if (!Array.isArray(products) || products.length === 0) {
      console.log("No products found or invalid response format");
      productsGrid.innerHTML =
        '<p class="text-gray-500 text-center py-4">No products available.</p>';
      return;
    }

    // Explicitly clear the grid before rendering
    productsGrid.innerHTML = "";

    // Fetch categories
    const categoriesResponse = await fetch(
      `http://192.168.0.102:5000/api/manuplast/categories?t=${Date.now()}`,
      { headers }
    );
    const categories = categoriesResponse.ok
      ? await categoriesResponse.json()
      : [];
    const categoryMap = Object.fromEntries(
      categories.map((cat) => [cat.id, cat.name])
    );
    console.log("Category map:", categoryMap);

    // Normalize product data, assuming sizes, colors, and images are included
    products.forEach((product) => {
      product.sizes = Array.isArray(product.sizes)
        ? product.sizes.map((s) => ({
            id: s.id || "",
            size: s.size || "",
          }))
        : [];
      product.colors = Array.isArray(product.colors)
        ? product.colors.map((c) => ({
            id: c.id || "",
            color: c.color || "",
          }))
        : [];
      product.images = Array.isArray(product.images)
        ? product.images.map((i) => ({
            id: i.id || "",
            image_url: i.image_url || "",
          }))
        : [];
      console.log(`Product ${product.id} data:`, {
        sizes: product.sizes,
        colors: product.colors,
        images: product.images,
      });
    });

    products.forEach((product) => {
      if (!product.id || typeof product.id !== "string") {
        console.warn(`Invalid product ID:`, product);
        return;
      }

      const isActive = product.status?.toLowerCase() === "active";
      if (view === "default" && !isActive) return;

      const productCard = document.createElement("div");
      productCard.classList.add("text-center");

      const safeProduct = {
        id: product.id,
        name: product.name || "Unnamed",
        description: product.description || "",
        price: product.price || 0,
        category_id: product.category_id || "",
        images: Array.isArray(product.images) ? product.images : [],
        status: product.status || "",
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        colors: Array.isArray(product.colors) ? product.colors : [],
      };

      productCard.innerHTML = `
        <div class="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <img src="${
              safeProduct.images[0]?.image_url || "./images/placeholder.jpg"
            }" alt="${
        safeProduct.name
      }" class="w-16 h-16 object-cover rounded" />
            <div class="text-left">
              <h4 class="font-semibold text-gray-800">${safeProduct.name}</h4>
              <p class="text-sm text-gray-500">Category: ${
                categoryMap[safeProduct.category_id] || "Unknown"
              }</p>
              <p class="text-sm text-gray-500">Price: ₹${safeProduct.price.toFixed(
                2
              )}</p>
              <p class="text-sm text-gray-500">Sizes: ${
                safeProduct.sizes.map((s) => s.size).join(", ") || "None"
              }</p>
              <p class="text-sm text-gray-500">Colors: ${
                safeProduct.colors.map((c) => c.color).join(", ") || "None"
              }</p>
              <p class="text-sm text-gray-500 truncate">${
                safeProduct.description.slice(0, 60) || "No description"
              }</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button onclick='openUpdateProductModal(${JSON.stringify(
              safeProduct
            ).replace(
              /"/g,
              '"'
            )})' class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
              Edit
            </button>
            <button data-id="${
              safeProduct.id
            }" class="delete-product-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
            <button data-id="${
              safeProduct.id
            }" data-active="${isActive}" class="toggle-product-btn ${
        isActive
          ? "bg-yellow-500 hover:bg-yellow-600"
          : "bg-green-500 hover:bg-green-600"
      } text-white px-3 py-1 rounded text-sm">
              ${isActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      `;

      productsGrid.appendChild(productCard);
    });

    // Remove and re-add event listener to prevent duplicates
    productsGrid.removeEventListener("click", handleDashboardProductActions);
    productsGrid.addEventListener("click", handleDashboardProductActions);
    console.log("Product list rendered successfully");
  } catch (error) {
    console.error("Error fetching products:", error);
    productsGrid.innerHTML = `<p class="text-red-500 text-center py-4">Error loading products: ${error.message}</p>`;
    alert(`Error fetching products: ${error.message}`);
  }
}

function openAddProductModal() {
  const modal = document.getElementById("add-product-modal");
  if (!modal) {
    console.error("Add product modal not found");
    alert("Error: Add product modal not found.");
    return;
  }
  modal.classList.remove("hidden");
  document.getElementById("add-product-form")?.reset();
  document.getElementById("add-product-images").value = "";
  loadCategoriesForAddModal();
  console.log("Add product modal opened");
}

function openUpdateProductModal(product) {
  const modal = document.getElementById("update-product-modal");
  if (!modal) {
    console.error("Update product modal not found");
    alert("Error: Update product modal not found.");
    return;
  }

  console.log("Opening update modal for product:", product);

  document.getElementById("update-product-id").value = product.id || "";
  document.getElementById("update-product-name").value = product.name || "";
  document.getElementById("update-product-description").value =
    product.description || "";
  document.getElementById("update-product-price").value = product.price || "";
  document.getElementById("update-product-sizes").value = Array.isArray(
    product.sizes
  )
    ? product.sizes.map((s) => s.size).join(", ")
    : "";
  document.getElementById("update-product-colors").value = Array.isArray(
    product.colors
  )
    ? product.colors.map((c) => c.color).join(", ")
    : "";
  document.getElementById("update-product-images").value = "";

  const sizeIdsInput = document.getElementById("update-product-size-ids");
  const colorIdsInput = document.getElementById("update-product-color-ids");
  const imageIdsInput = document.getElementById("update-product-image-ids");
  if (sizeIdsInput)
    sizeIdsInput.value = Array.isArray(product.sizes)
      ? product.sizes.map((s) => s.id).join(",")
      : "";
  if (colorIdsInput)
    colorIdsInput.value = Array.isArray(product.colors)
      ? product.colors.map((c) => c.id).join(",")
      : "";
  if (imageIdsInput)
    imageIdsInput.value = Array.isArray(product.images)
      ? product.images.map((i) => i.id).join(",")
      : "";

  const categorySelect = document.getElementById("update-product-category");
  if (categorySelect) {
    categorySelect.value = product.category_id || "";
  } else {
    console.error("Update product category select not found");
  }

  const previewContainer = document.getElementById(
    "current-product-image-preview"
  );
  previewContainer.innerHTML =
    '<p class="text-sm text-gray-500 w-full text-center">Current Images:</p>';
  if (Array.isArray(product.images) && product.images.length) {
    product.images.forEach((img) => {
      if (img.image_url) {
        const imgElement = document.createElement("img");
        imgElement.src = img.image_url;
        imgElement.className = "w-16 h-16 object-cover rounded";
        imgElement.dataset.imageId = img.id;
        previewContainer.appendChild(imgElement);
      }
    });
    previewContainer.classList.remove("hidden");
  } else {
    previewContainer.classList.add("hidden");
  }

  modal.classList.remove("hidden");
  loadCategoriesForUpdateModal();
  console.log("Update product modal opened for product:", product.id);
}

function handleDashboardProductActions(e) {
  const deleteBtn = e.target.closest(".delete-product-btn");
  const toggleBtn = e.target.closest(".toggle-product-btn");

  if (deleteBtn) {
    const productId = deleteBtn.getAttribute("data-id");
    if (!productId) {
      alert("Error: Product ID is missing.");
      return;
    }
    if (confirm("Are you sure you want to delete this product?")) {
      console.log(`Deleting product with ID: ${productId}`);
      deleteProduct(productId);
    }
  }

  if (toggleBtn) {
    const productId = toggleBtn.getAttribute("data-id");
    const isActive = toggleBtn.getAttribute("data-active") === "true";
    if (!productId) {
      alert("Error: Product ID is missing.");
      return;
    }
    const action = isActive ? "deactivate" : "activate";
    if (confirm(`Are you sure you want to ${action} this product?`)) {
      console.log(
        `Toggling product status for ID: ${productId}, new status: ${!isActive}`
      );
      toggleProductActive(productId, isActive);
    }
  }
}

async function deleteProduct(id) {
  try {
    const headers = getHeaders();
    if (!headers.Authorization) {
      console.warn("No authentication token found. Redirecting to login.");
      alert("You are not authenticated. Please log in.");
      window.location.href = "login.html";
      return;
    }

    const response = await fetch(
      `http://192.168.0.102:5000/api/manuplast/producttypes/${id}`,
      {
        method: "DELETE",
        headers,
      }
    );

    console.log("Delete product response status:", response.status);
    if (!response.ok) {
      const errorText = await response.json().catch(() => ({}));
      const errorMessage =
        errorText.message || response.statusText || "Unknown error";
      throw new Error(
        `Failed to delete product: ${response.status} - ${errorMessage}`
      );
    }

    alert("Product deleted successfully!");
    fetchProductsList();
  } catch (error) {
    console.error("Error deleting product:", error);
    alert(`Failed to delete product: ${error.message}`);
  }
}

async function toggleProductActive(productId, currentStatus) {
  try {
    const headers = getHeaders();
    if (!headers.Authorization) {
      console.warn("No authentication token found. Redirecting to login.");
      alert("You are not authenticated. Please log in.");
      window.location.href = "login.html";
      return;
    }

    const isActive = currentStatus === true || currentStatus === "true";
    const newStatus = !isActive;

    const response = await fetch(
      `http://192.168.0.102:5000/api/manuplast/producttypes/${productId}/status`,
      {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ active: newStatus }),
      }
    );

    console.log("Toggle product status response status:", response.status);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message || response.statusText || "Unknown error";
      throw new Error(
        `Failed to update product status: ${response.status} - ${errorMessage}`
      );
    }

    alert(`Product ${newStatus ? "activated" : "deactivated"} successfully!`);
    const toggleBtn = document.querySelector(
      `.toggle-product-btn[data-id="${productId}"]`
    );
    if (toggleBtn) {
      toggleBtn.setAttribute("data-active", newStatus);
      toggleBtn.textContent = newStatus ? "Deactivate" : "Activate";
      toggleBtn.className = `toggle-product-btn ${
        newStatus
          ? "bg-yellow-500 hover:bg-yellow-600"
          : "bg-green-500 hover:bg-green-600"
      } text-white px-3 py-1 rounded text-sm`;
    }

    fetchProductsList();
  } catch (error) {
    console.error("Error updating product status:", error);
    alert(`Failed to update product status: ${error.message}`);
  }
}

async function loadCategoriesForAddModal() {
  try {
    const headers = getHeaders();
    const response = await fetch(
      `http://192.168.0.102:5000/api/manuplast/categories?t=${Date.now()}`,
      { headers }
    );

    console.log("Categories fetch for add modal status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch categories: ${response.status} - ${errorText}`
      );
    }

    const categories = await response.json();
    console.log("Fetched categories for add modal:", categories);
    const select = document.getElementById("add-product-category");

    if (select) {
      select.innerHTML =
        '<option value="" disabled selected>Select Category</option>' +
        categories
          .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
          .join("");
    } else {
      console.error("Add product category select element not found");
      alert("Error: Category select element not found.");
    }
  } catch (error) {
    console.error("Error loading categories for add modal:", error);
    alert(`Error loading categories: ${error.message}`);
  }
}

async function loadCategoriesForUpdateModal() {
  try {
    const headers = getHeaders();
    const response = await fetch(
      `http://192.168.0.102:5000/api/manuplast/categories?t=${Date.now()}`,
      { headers }
    );

    console.log("Categories fetch for update modal status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch categories: ${response.status} - ${errorText}`
      );
    }

    const categories = await response.json();
    console.log("Fetched categories for update modal:", categories);
    const select = document.getElementById("update-product-category");

    if (select) {
      select.innerHTML =
        '<option value="" disabled selected>Select Category</option>' +
        categories
          .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
          .join("");
    } else {
      console.error("Update product category select element not found");
      alert("Error: Category select element not found.");
    }
  } catch (error) {
    console.error("Error loading categories for update modal:", error);
    alert(`Error loading categories: ${error.message}`);
  }
}

document
  .getElementById("add-product-form")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const headers = getHeaders();
    if (!headers.Authorization) {
      console.warn("No authentication token found. Redirecting to login.");
      alert("You are not authenticated. Please log in.");
      window.location.href = "login.html";
      return;
    }

    const name = document.getElementById("add-product-name")?.value?.trim();
    const description = document
      .getElementById("add-product-description")
      ?.value?.trim();
    const price = document.getElementById("add-product-price")?.value;
    const categoryId = document.getElementById("add-product-category")?.value;
    const imageInput = document.getElementById("add-product-images");
    const sizes = document
      .getElementById("add-product-sizes")
      ?.value.split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    const colors = document
      .getElementById("add-product-colors")
      ?.value.split(",")
      .map((c) => c.trim())
      .filter((c) => c);

    if (!name || name.length < 2) {
      alert("Product name is required and must be at least 2 characters long");
      return;
    }
    if (!description || description.length < 10) {
      alert("Description is required and must be at least 10 characters long");
      return;
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      alert("Price must be a valid positive number");
      return;
    }
    if (!categoryId) {
      alert("Category is required");
      return;
    }
    if (!imageInput?.files?.length) {
      alert("At least one image is required");
      return;
    }
    for (let file of imageInput.files) {
      if (!isValidImage(file)) {
        alert("Invalid image type. Only JPEG, PNG, and GIF are allowed.");
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", parseFloat(price));
      formData.append("category_id", categoryId);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("colors", JSON.stringify(colors));
      Array.from(imageInput.files).forEach((file) => {
        formData.append("images", file);
      });

      const submitBtn = document.querySelector(
        "#add-product-form button[type=submit]"
      );
      submitBtn.disabled = true;
      submitBtn.textContent = "Adding...";

      const productResponse = await fetch(
        "http://192.168.0.102:5000/api/manuplast/producttypes",
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

      console.log("Add product response status:", productResponse.status);
      if (!productResponse.ok) {
        const errorData = await productResponse.json().catch(() => ({}));
        throw new Error(
          `Failed to add product: ${
            errorData.message || productResponse.statusText
          }`
        );
      }

      alert("Product added successfully!");
      document.getElementById("add-product-modal")?.classList.add("hidden");
      fetchProductsList();
    } catch (error) {
      console.error("Error adding product:", error);
      alert(`Failed to add product: ${error.message}`);
    } finally {
      const submitBtn = document.querySelector(
        "#add-product-form button[type=submit]"
      );
      submitBtn.disabled = false;
      submitBtn.textContent = "Add Product";
    }
  });

document
  .getElementById("update-product-form")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const headers = getHeaders();
    if (!headers.Authorization) {
      console.warn("No authentication token found. Redirecting to login.");
      alert("You are not authenticated. Please log in.");
      window.location.href = "login.html";
      return;
    }

    const productId = document.getElementById("update-product-id")?.value;
    const name = document.getElementById("update-product-name")?.value?.trim();
    const description = document
      .getElementById("update-product-description")
      ?.value?.trim();
    const price = document.getElementById("update-product-price")?.value;
    const categoryId = document.getElementById(
      "update-product-category"
    )?.value;
    const imageInput = document.getElementById("update-product-images");
    const sizes = document
      .getElementById("update-product-sizes")
      ?.value.split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    const colors = document
      .getElementById("update-product-colors")
      ?.value.split(",")
      .map((c) => c.trim())
      .filter((c) => c);

    if (!productId || !name || name.length < 2) {
      alert("Product name is required and must be at least 2 characters long");
      return;
    }
    if (!description || description.length < 10) {
      alert("Description is required and must be at least 10 characters long");
      return;
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      alert("Price must be a valid positive number");
      return;
    }
    if (!categoryId) {
      alert("Category is required");
      return;
    }
    if (imageInput?.files?.length) {
      for (let file of imageInput.files) {
        if (!isValidImage(file)) {
          alert("Invalid image type. Only JPEG, PNG, and GIF are allowed.");
          return;
        }
      }
    }

    try {
      const submitBtn = document.querySelector(
        "#update-product-form button[type=submit]"
      );
      submitBtn.disabled = true;
      submitBtn.textContent = "Updating...";

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", parseFloat(price));
      formData.append("category_id", categoryId);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("colors", JSON.stringify(colors));
      if (imageInput?.files?.length) {
        Array.from(imageInput.files).forEach((file) => {
          formData.append("images", file);
        });
      }

      const productResponse = await fetch(
        `http://192.168.0.102:5000/api/manuplast/producttypes/${productId}`,
        {
          method: "PATCH",
          headers,
          body: formData,
        }
      );

      console.log("Update product response status:", productResponse.status);
      if (!productResponse.ok) {
        const errorData = await productResponse.json().catch(() => ({}));
        throw new Error(
          `Failed to update product: ${
            errorData.message || productResponse.statusText
          }`
        );
      }

      alert("Product updated successfully!");
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log(
        `Refreshing product list after updating product ID: ${productId}`
      );
      await fetchProductsList();
      document.getElementById("update-product-modal")?.classList.add("hidden");
    } catch (error) {
      console.error("Error updating product:", error);
      alert(`Failed to update product: ${error.message}`);
    } finally {
      const submitBtn = document.querySelector(
        "#update-product-form button[type=submit]"
      );
      submitBtn.disabled = false;
      submitBtn.textContent = "Update Product";
    }
  });

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded fired");
  console.log("Current pathname:", window.location.pathname);

  const isDashboardPage =
    window.location.pathname
      .toLowerCase()
      .includes("dashboard-products.html") ||
    window.location.pathname.toLowerCase().includes("product-list.html") ||
    window.location.pathname === "/" ||
    window.location.pathname.toLowerCase().includes("dashboard") ||
    window.location.pathname.toLowerCase().includes("manu-plast");

  if (!isDashboardPage) {
    console.log("Not on a dashboard page, skipping initialization");
    return;
  }

  fetchProductsList("dashboard-products-list", "dashboard");
  loadCategoriesForUpdateModal();

  const closeAddModalBtn = document.getElementById("close-add-product-modal");
  const addModal = document.getElementById("add-product-modal");
  const closeUpdateModalBtn = document.getElementById(
    "close-update-product-modal"
  );
  const updateModal = document.getElementById("update-product-modal");
  const addProductBtn = document.getElementById("add-product-btn");

  if (closeAddModalBtn && addModal) {
    closeAddModalBtn.addEventListener("click", () => {
      addModal.classList.add("hidden");
      console.log("Add modal closed via button");
    });
    addModal.addEventListener("click", (e) => {
      if (e.target === addModal) {
        addModal.classList.add("hidden");
        console.log("Add modal closed by clicking outside");
      }
    });
  } else {
    console.error("Add modal or close button not found");
    alert("Error: Add product modal elements missing.");
  }

  if (closeUpdateModalBtn && updateModal) {
    closeUpdateModalBtn.addEventListener("click", () => {
      updateModal.classList.add("hidden");
      console.log("Update modal closed via button");
    });
    updateModal.addEventListener("click", (e) => {
      if (e.target === updateModal) {
        updateModal.classList.add("hidden");
        console.log("Update modal closed by clicking outside");
      }
    });
  } else {
    console.error("Update modal or close button not found");
    alert("Error: Update product modal elements missing.");
  }

  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      openAddProductModal();
      console.log("Add product button clicked");
    });
  } else {
    console.error("Add product button not found");
    alert("Error: Add product button missing.");
  }
});
