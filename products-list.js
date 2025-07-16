// Base API URL
const API_BASE_URL = "https://api.vybtek.com/api/manuplast"; // Verify this matches your backend API

// DOM Elements
const dashboardProductsList = document.getElementById("dashboard-products-list");

// Add Product Modal Elements
const addProductBtn = document.getElementById("add-product-btn");
const addProductModal = document.getElementById("add-product-modal");
const closeAddProductModalBtn = document.getElementById("close-add-product-modal");
const addProductForm = document.getElementById("add-product-form");
const addProductNameInput = document.getElementById("add-product-name");
const addProductCategorySelect = document.getElementById("add-product-category");
const addProductPriceInput = document.getElementById("add-product-price");
const addProductSizesInput = document.getElementById("add-product-sizes");
const addProductDescriptionInput = document.getElementById("add-product-description");
const addProductDetailedDescriptionInput = document.getElementById("add-product-detailed-description");
const addColorImageInputsContainer = document.getElementById("add-color-image-inputs");
const addNewColorFieldBtn = document.getElementById("add-new-color-field-btn");

// Update Product Modal Elements
const updateProductModal = document.getElementById("update-product-modal");
const closeUpdateProductModalBtn = document.getElementById("close-update-product-modal");
const updateProductForm = document.getElementById("update-product-form");
const updateProductIdInput = document.getElementById("update-product-id");
const updateProductNameInput = document.getElementById("update-product-name");
const updateProductCategorySelect = document.getElementById("update-product-category");
const updateProductPriceInput = document.getElementById("update-product-price");
const updateProductSizesInput = document.getElementById("update-product-sizes");
const updateProductDescriptionInput = document.getElementById("update-product-description");
const updateProductDetailedDescriptionInput = document.getElementById("update-product-detailed-description");
const updateColorImageInputsContainer = document.getElementById("update-color-image-inputs");
const updateAddNewColorFieldBtn = document.getElementById("update-add-new-color-field-btn");

// Product Details Modal Elements
const productDetailsModal = document.getElementById("product-details-modal");
const closeProductDetailsModalBtn = document.getElementById("close-product-details-modal");
const detailProductName = document.getElementById("detail-product-name");
const detailProductCategory = document.getElementById("detail-product-category");
const detailProductPrice = document.getElementById("detail-product-price");
const detailProductDescription = document.getElementById("detail-product-description");
const detailProductStatus = document.getElementById("detail-product-status");
const detailProductSizes = document.getElementById("detail-product-sizes");
const detailProductColors = document.getElementById("detail-product-colors");
const detailProductDetailedDescription = document.getElementById("detail-product-detailed-description");

let allCategories = []; // To store fetched categories

// --- Helper Functions ---

// Generate a unique ID for dynamic elements
const generateUniqueId = () => `input-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Create a color/image input row
function createColorImageInputRow(containerId, colorName = '', images = [], isExisting = false) {
  const rowId = generateUniqueId();
  const rowDiv = document.createElement('div');
  rowDiv.className = 'border border-gray-300 p-3 rounded-lg bg-white relative';
  rowDiv.id = rowId;
  rowDiv.dataset.isExisting = isExisting;

  rowDiv.innerHTML = `
        <div class="flex items-center mb-3">
            <input type="text" class="color-input w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Color Name" value="${colorName}" required />
            <button type="button" class="remove-color-btn ml-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <label class="block text-gray-700 font-medium mb-2">Images for this color:</label>
        <input type="file" class="color-image-input w-full p-2 border border-gray-300 rounded-lg file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" accept="image/*" multiple />
        <div class="image-preview-container mt-2">
            ${images.map(img => `
                <div class="image-preview-item" data-image-url="${img.image_url || img.url || ''}" data-is-existing="true">
                    <img src="${img.image_url || img.url}" alt="Image Preview" />
                    <button type="button" class="remove-image-btn"><i class="fas fa-times"></i></button>
                </div>
            `).join('')}
        </div>
    `;

  const container = document.getElementById(containerId);
  container.appendChild(rowDiv);

  const removeColorBtn = rowDiv.querySelector('.remove-color-btn');
  removeColorBtn.addEventListener('click', () => {
    rowDiv.remove();
  });

  const colorImageInput = rowDiv.querySelector('.color-image-input');
  const imagePreviewContainer = rowDiv.querySelector('.image-preview-container');

  colorImageInput.addEventListener('change', (event) => {
    Array.from(event.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item';
        previewItem.dataset.isExisting = 'false';
        previewItem.innerHTML = `
                        <img src="${e.target.result}" alt="Image Preview" />
                        <button type="button" class="remove-image-btn"><i class="fas fa-times"></i></button>
                    `;
        imagePreviewContainer.appendChild(previewItem);
        // Store the File object in a data attribute as a base64 string to avoid serialization issues
        previewItem.dataset.fileBase64 = e.target.result;
        previewItem.dataset.fileName = file.name;
        previewItem.dataset.fileType = file.type;

        previewItem.querySelector('.remove-image-btn').addEventListener('click', () => {
          previewItem.remove();
        });
      };
      reader.readAsDataURL(file);
    });
  });

  rowDiv.querySelectorAll('.remove-image-btn').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.target.closest('.image-preview-item').remove();
    });
  });

  return rowDiv;
}

// --- Modal Open/Close Functions ---

function openModal(modalElement) {
  modalElement.classList.remove("hidden");
  setTimeout(() => (modalElement.style.opacity = "1"), 10);
}

function closeModal(modalElement) {
  modalElement.style.opacity = "0";
  setTimeout(() => modalElement.classList.add("hidden"), 300);
}

// --- Category Loading ---
async function populateCategories(selectElement, selectedCategoryId = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken') || 'YOUR_TOKEN_HERE'}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allCategories = await response.json();
    selectElement.innerHTML = '<option value="" disabled selected>Select Category</option>';

    allCategories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      if (selectedCategoryId && category.id === selectedCategoryId) {
        option.selected = true;
      }
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading categories:", error);
    alert("Failed to load categories. Please try again.");
  }
}

// --- Product Display and Management ---

async function loadProducts() {
  dashboardProductsList.innerHTML = `
        <div class="flex justify-center items-center h-48">
            <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p class="text-center text-gray-600 mt-4">Loading products...</p>
    `;
  try {
    const response = await fetch(`${API_BASE_URL}/producttypes`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken') || 'YOUR_TOKEN_HERE'}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const products = await response.json();
    dashboardProductsList.innerHTML = "";

    if (products.length === 0) {
      dashboardProductsList.innerHTML = `
            <div class="text-center p-8 bg-white rounded-lg shadow-md">
                <p class="text-gray-600 text-lg">No products found. Add a new product to get started!</p>
            </div>
        `;
      return;
    }

    products.forEach((product) => {
      dashboardProductsList.appendChild(createProductCard(product));
    });
  } catch (error) {
    console.error("Error loading products:", error);
    dashboardProductsList.innerHTML = `
        <div class="text-center p-8 bg-red-100 text-red-700 rounded-lg shadow-md">
            <p class="text-lg">Failed to load products: ${error.message}</p>
            <p class="text-sm mt-2">Please check your network connection or API server.</p>
        </div>
      `;
  }
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row items-center gap-4";
  card.dataset.productId = product.id;

  let mainImageUrl = "https://via.placeholder.com/100x100?text=No+Image";
  if (product.colors && product.colors.length > 0) {
    for (const color of product.colors) {
      if (color.images && color.images.length > 0) {
        mainImageUrl = color.images[0].image_url;
        break;
      }
    }
  }

  const sizesText = product.sizes && product.sizes.length > 0
    ? product.sizes.map(s => s.size).join(", ")
    : "N/A";

  const colorsText = product.colors && product.colors.length > 0
    ? product.colors.map(c => c.color).join(", ")
    : "N/A";

  card.innerHTML = `
        <img src="${mainImageUrl}" alt="${product.name}" class="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
        <div class="flex-1 text-center sm:text-left">
            <h3 class="text-xl font-semibold text-gray-800">${product.name}</h3>
            <p class="text-gray-600 text-sm">Category: ${product.category ? product.category.name : 'N/A'}</p>
            <p class="text-gray-700 font-bold mt-1">Price: ${product.price ? product.price.toFixed(2) : '0.00'}</p>
            <p class="text-gray-600 text-sm">Sizes: ${sizesText}</p>
            <p class="text-gray-600 text-sm">Colors: ${colorsText}</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <button class="view-btn bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                <i class="fas fa-eye"></i> View
            </button>
            <button class="edit-btn bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="delete-btn bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                <i class="fas fa-trash"></i> Delete
            </button>
            <button class="toggle-status-btn bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 ${product.status === 'ACTIVE' ? 'opacity-100' : 'opacity-70'}">
                <i class="fas fa-toggle-${product.status === 'ACTIVE' ? 'on' : 'off'}"></i> ${product.status === 'ACTIVE' ? 'Active' : 'Inactive'}
            </button>
        </div>
    `;

  card.querySelector(".view-btn").addEventListener("click", () => openProductDetailsModal(product));
  card.querySelector(".edit-btn").addEventListener("click", () => openUpdateProductModal(product.id));
  card.querySelector(".delete-btn").addEventListener("click", () => deleteProduct(product.id, product.name));
  card.querySelector(".toggle-status-btn").addEventListener("click", () => toggleProductStatus(product.id, product.status));

  return card;
}

// --- Add Product Logic ---

addProductBtn.addEventListener("click", () => {
  addProductForm.reset();
  addColorImageInputsContainer.innerHTML = '';
  createColorImageInputRow('add-color-image-inputs');
  addProductDetailedDescriptionInput.value = '{"features": [], "specifications": []}';
  populateCategories(addProductCategorySelect);
  openModal(addProductModal);
});

closeAddProductModalBtn.addEventListener("click", () => closeModal(addProductModal));

addNewColorFieldBtn.addEventListener('click', () => {
  createColorImageInputRow('add-color-image-inputs');
});

addProductForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData();
  formData.append("name", addProductNameInput.value);
  formData.append("description", addProductDescriptionInput.value);
  formData.append("price", addProductPriceInput.value);
  formData.append("category_id", addProductCategorySelect.value);

  const sizesValue = addProductSizesInput.value.trim();
  if (sizesValue) {
    formData.append("sizes", JSON.stringify(sizesValue.split(",").map(s => s.trim()).filter(s => s)));
  } else {
    formData.append("sizes", "[]");
  }

  try {
    const detailedDescription = JSON.parse(addProductDetailedDescriptionInput.value);
    formData.append("detailed_description", JSON.stringify(detailedDescription));
  } catch (error) {
    alert("Invalid JSON in Detailed Description. Please provide valid JSON.");
    return;
  }

  const colorsData = [];
  const allFilesForUpload = [];

  const colorRows = addColorImageInputsContainer.querySelectorAll('.border.border-gray-300.p-3.rounded-lg.bg-white.relative');

  if (colorRows.length === 0) {
    alert("Please add at least one color.");
    return;
  }

  for (const row of colorRows) {
    const colorInput = row.querySelector('.color-input');
    const fileInput = row.querySelector('.color-image-input');

    const colorName = colorInput.value.trim();
    if (!colorName) {
      alert("All color names must be provided.");
      return;
    }

    const imageIndices = [];

    Array.from(fileInput.files).forEach(file => {
      const fileIndex = allFilesForUpload.push(file) - 1;
      imageIndices.push(fileIndex);
    });

    colorsData.push({
      color: colorName,
      imageIndices: imageIndices
    });
  }

  formData.append("colors", JSON.stringify(colorsData));

  allFilesForUpload.forEach(file => {
    formData.append("images", file);
  });

  try {
    const response = await fetch(`${API_BASE_URL}/producttypes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken') || 'YOUR_TOKEN_HERE'}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    alert("Product added successfully!");
    closeModal(addProductModal);
    loadProducts();
  } catch (error) {
    console.error("Error adding product:", error);
    alert(`Failed to add product: ${error.message}`);
  }
});

// --- Update Product Logic ---

async function openUpdateProductModal(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/producttypes/${productId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken') || 'YOUR_TOKEN_HERE'}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const product = await response.json();

    updateProductIdInput.value = product.id;
    updateProductNameInput.value = product.name;
    updateProductDescriptionInput.value = product.description;
    updateProductPriceInput.value = product.price;
    updateProductDetailedDescriptionInput.value = product.detailed_description ? JSON.stringify(product.detailed_description, null, 2) : '{"features": [], "specifications": []}';

    await populateCategories(updateProductCategorySelect, product.category_id);

    const sizes = product.sizes ? product.sizes.map(s => s.size).join(", ") : "";
    updateProductSizesInput.value = sizes;

    updateColorImageInputsContainer.innerHTML = '';

    if (product.colors && product.colors.length > 0) {
      product.colors.forEach(color => {
        createColorImageInputRow('update-color-image-inputs', color.color, color.images, true);
      });
    } else {
      createColorImageInputRow('update-color-image-inputs');
    }

    openModal(updateProductModal);
  } catch (error) {
    console.error("Error fetching product for update:", error);
    alert("Failed to load product details for update.");
  }
}

closeUpdateProductModalBtn.addEventListener("click", () => closeModal(updateProductModal));

updateAddNewColorFieldBtn.addEventListener('click', () => {
  createColorImageInputRow('update-color-image-inputs');
});

updateProductForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const productId = updateProductIdInput.value;
  const formData = new FormData();

  formData.append("name", updateProductNameInput.value);
  formData.append("description", updateProductDescriptionInput.value);
  formData.append("price", updateProductPriceInput.value);
  formData.append("category_id", updateProductCategorySelect.value);

  const sizesValue = updateProductSizesInput.value.trim();
  if (sizesValue) {
    formData.append("sizes", JSON.stringify(sizesValue.split(",").map(s => s.trim()).filter(s => s)));
  } else {
    formData.append("sizes", "[]");
  }

  try {
    const detailedDescription = JSON.parse(updateProductDetailedDescriptionInput.value);
    formData.append("detailed_description", JSON.stringify(detailedDescription));
  } catch (error) {
    alert("Invalid JSON in Detailed Description. Please provide valid JSON.");
    return;
  }

  const colorsData = [];
  const allFilesForUpload = [];

  const colorRows = updateColorImageInputsContainer.querySelectorAll('.border.border-gray-300.p-3.rounded-lg.bg-white.relative');

  if (colorRows.length === 0) {
    alert("Please add at least one color.");
    return;
  }

  for (const row of colorRows) {
    const colorInput = row.querySelector('.color-input');
    const fileInput = row.querySelector('.color-image-input');
    const previewItems = row.querySelectorAll('.image-preview-item');

    const colorName = colorInput.value.trim();
    if (!colorName) {
      alert("All color names must be provided.");
      return;
    }

    const imageIndices = [];

    // Process preview items (new images only, since existing images must be re-uploaded)
    previewItems.forEach(item => {
      if (item.dataset.isExisting === 'false' && item.dataset.fileBase64) {
        // Convert base64 back to a File object
        const byteString = atob(item.dataset.fileBase64.split(',')[1]);
        const mimeString = item.dataset.fileType;
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const file = new File([blob], item.dataset.fileName, { type: mimeString });
        const fileIndex = allFilesForUpload.push(file) - 1;
        imageIndices.push(fileIndex);
      }
    });

    // Process new files from file input
    Array.from(fileInput.files).forEach(file => {
      if (!allFilesForUpload.some(existingFile => existingFile.name === file.name && existingFile.size === file.size)) {
        const fileIndex = allFilesForUpload.push(file) - 1;
        imageIndices.push(fileIndex);
      }
    });

    colorsData.push({
      color: colorName,
      imageIndices: imageIndices
    });
  }

  formData.append("colors", JSON.stringify(colorsData));

  allFilesForUpload.forEach(file => {
    formData.append("images", file);
  });

  try {
    const response = await fetch(`${API_BASE_URL}/producttypes/${productId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken') || 'YOUR_TOKEN_HERE'}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    alert("Product updated successfully!");
    closeModal(updateProductModal);
    loadProducts();
  } catch (error) {
    console.error("Error updating product:", error);
    alert(`Failed to update product: ${error.message}`);
  }
});

// --- Delete Product Logic ---

async function deleteProduct(productId, productName) {
  if (!confirm(`Are you sure you want to delete product "${productName}"? This action cannot be undone.`)) {
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/producttypes/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken') || 'YOUR_TOKEN_HERE'}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    alert(`Product "${productName}" deleted successfully!`);
    loadProducts();
  } catch (error) {
    console.error("Error deleting product:", error);
    alert(`Failed to delete product: ${error.message}`);
  }
}

// --- Toggle Status Logic ---

async function toggleProductStatus(productId, currentStatus) {
  const newStatus = currentStatus === "ACTIVE" ? false : true;
  const statusText = newStatus ? "activate" : "deactivate";
  if (!confirm(`Are you sure you want to ${statusText} this product?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/producttypes/${productId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('authToken') || 'YOUR_TOKEN_HERE'}`,
      },
      body: JSON.stringify({
        active: newStatus
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    alert(`Product status changed to ${newStatus ? 'ACTIVE' : 'INACTIVE'} successfully!`);
    loadProducts();
  } catch (error) {
    console.error("Error changing product status:", error);
    alert(`Failed to change product status: ${error.message}`);
  }
}

// --- Product Details Modal Logic ---

function openProductDetailsModal(product) {
  detailProductName.textContent = product.name;
  detailProductCategory.textContent = product.category ? product.category.name : 'N/A';
  detailProductPrice.textContent = product.price ? product.price.toFixed(2) : '0.00';
  detailProductDescription.textContent = product.description;
  detailProductStatus.textContent = product.status;
  detailProductSizes.textContent = product.sizes && product.sizes.length > 0
    ? product.sizes.map(s => s.size).join(", ")
    : "N/A";

  detailProductColors.innerHTML = '';

  if (product.colors && product.colors.length > 0) {
    product.colors.forEach(color => {
      const colorDiv = document.createElement('div');
      colorDiv.className = 'bg-gray-100 p-2 rounded-md';
      colorDiv.innerHTML = `<p class="font-semibold">${color.color}:</p>`;

      if (color.images && color.images.length > 0) {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'flex flex-wrap gap-2 mt-1';
        color.images.forEach(image => {
          const imgElement = document.createElement('img');
          imgElement.src = image.image_url;
          imgElement.alt = `Image for ${color.color}`;
          imgElement.className = 'w-20 h-20 object-cover rounded-md shadow-sm';
          imageContainer.appendChild(imgElement);
        });
        colorDiv.appendChild(imageContainer);
      } else {
        const noImageText = document.createElement('p');
        noImageText.className = 'text-sm text-gray-500 italic';
        noImageText.textContent = 'No images for this color.';
        colorDiv.appendChild(noImageText);
      }
      detailProductColors.appendChild(colorDiv);
    });
  } else {
    detailProductColors.innerHTML = '<p class="text-gray-500 italic">No colors available.</p>';
  }

  detailProductDetailedDescription.innerHTML = '';
  if (product.detailed_description) {
    const detailedDescription = product.detailed_description;
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'bg-gray-100 p-2 rounded-md';

    if (detailedDescription.features && detailedDescription.features.length > 0) {
      const featuresHeader = document.createElement('p');
      featuresHeader.className = 'font-semibold';
      featuresHeader.textContent = 'Features:';
      detailsDiv.appendChild(featuresHeader);

      const featuresList = document.createElement('ul');
      featuresList.className = 'list-disc pl-5';
      detailedDescription.features.forEach(feature => {
        const featureItem = document.createElement('li');
        featureItem.textContent = feature;
        featuresList.appendChild(featureItem);
      });
      detailsDiv.appendChild(featuresList);
    }

    if (detailedDescription.specifications && detailedDescription.specifications.length > 0) {
      const specsHeader = document.createElement('p');
      specsHeader.className = 'font-semibold mt-2';
      specsHeader.textContent = 'Specifications:';
      detailsDiv.appendChild(specsHeader);

      detailedDescription.specifications.forEach(spec => {
        const specDiv = document.createElement('div');
        specDiv.className = 'ml-2 mt-1';
        specDiv.innerHTML = `
          <p><strong>Color:</strong> ${spec.color}</p>
          <p><strong>Material:</strong> ${spec.material}</p>
          <p><strong>Capacity:</strong> ${spec.capacity}</p>
          <p><strong>Package Content:</strong> ${spec.package_content}</p>
          <p><strong>Dimensions (cm):</strong> ${spec.dimensions_cm}</p>
        `;
        detailsDiv.appendChild(specDiv);
      });
    }

    detailProductDetailedDescription.appendChild(detailsDiv);
  } else {
    detailProductDetailedDescription.innerHTML = '<p class="text-gray-500 italic">No detailed description available.</p>';
  }

  openModal(productDetailsModal);
}

closeProductDetailsModalBtn.addEventListener('click', () => closeModal(productDetailsModal));

// --- Initial Load ---
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});