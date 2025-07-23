const API_BASE_URL = "https://api.vybtek.com/api/manuplast";

// Load SortableJS from CDN
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js';
script.onload = initializeSortable;
document.head.appendChild(script);

let sortableInstances = new WeakMap();

// DOM Elements
const dashboardProductsList = document.getElementById("dashboard-products-list");
const addProductBtn = document.getElementById("add-product-btn");
const categoryFilterSelect = document.getElementById("category-filter");
const addProductModal = document.getElementById("add-product-modal");
const closeAddProductModalBtn = document.getElementById("close-add-product-modal");
const addProductForm = document.getElementById("add-product-form");
const addProductNameInput = document.getElementById("add-product-name");
const addProductCategorySelect = document.getElementById("add-product-category");
const addProductPriceInput = document.getElementById("add-product-price");
const addProductSizesInput = document.getElementById("add-product-sizes");
const addProductDescriptionInput = document.getElementById("add-product-description");
const addProductCoverImageInput = document.getElementById("add-product-cover-image");
const addCoverImagePreview = document.getElementById("add-cover-image-preview");
const addColorImageInputsContainer = document.getElementById("add-color-image-inputs");
const addNewColorFieldBtn = document.getElementById("add-new-color-field-btn");
const addFeaturesContainer = document.getElementById("add-features-container");
const addSpecificationsContainer = document.getElementById("add-specifications-container");
const addNewFeatureBtn = document.getElementById("add-new-feature-btn");
const addNewSpecificationBtn = document.getElementById("add-new-specification-btn");
const updateProductModal = document.getElementById("update-product-modal");
const closeUpdateProductModalBtn = document.getElementById("close-update-product-modal");
const updateProductForm = document.getElementById("update-product-form");
const updateProductIdInput = document.getElementById("update-product-id");
const updateProductNameInput = document.getElementById("update-product-name");
const updateProductCategorySelect = document.getElementById("update-product-category");
const updateProductPriceInput = document.getElementById("update-product-price");
const updateProductSizesInput = document.getElementById("update-product-sizes");
const updateProductDescriptionInput = document.getElementById("update-product-description");
const updateProductCoverImageInput = document.getElementById("update-product-cover-image");
const updateCoverImagePreview = document.getElementById("update-cover-image-preview");
const updateColorImageInputsContainer = document.getElementById("update-color-image-inputs");
const updateAddNewColorFieldBtn = document.getElementById("update-add-new-color-field-btn");
const updateFeaturesContainer = document.getElementById("update-features-container");
const updateSpecificationsContainer = document.getElementById("update-specifications-container");
const updateAddNewFeatureBtn = document.getElementById("update-add-new-feature-btn");
const updateAddNewSpecificationBtn = document.getElementById("update-add-new-specification-btn");
const productDetailsModal = document.getElementById("product-details-modal");
const closeProductDetailsModalBtn = document.getElementById("close-product-details-modal");
const detailProductName = document.getElementById("detail-product-name");
const detailProductCategory = document.getElementById("detail-product-category");
const detailProductPrice = document.getElementById("detail-product-price");
const detailProductDescription = document.getElementById("detail-product-description");
const detailProductStatus = document.getElementById("detail-product-status");
const detailProductSizes = document.getElementById("detail-product-sizes");
const detailProductColors = document.getElementById("detail-product-colors");
const detailProductCoverImage = document.getElementById("detail-product-cover-image");
const detailProductDetailedDescription = document.getElementById("detail-product-detailed-description");

let allCategories = [];

function initializeSortable() {
  document.querySelectorAll('.image-preview-container').forEach(container => {
    const row = container.closest('.border.border-gray-300.p-3.rounded-lg.bg-white.relative');
    if (row && !sortableInstances.has(row)) {
      sortableInstances.set(row, new Sortable(container, {
        animation: 150,
        onEnd: (event) => {
          console.log('Items reordered:', Array.from(container.children));
        },
      }));
    }
  });
}

// --- Helper Functions ---

const generateUniqueId = () => `input-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

function createCoverImagePreview(container, file = null, existingUrl = null) {
  container.innerHTML = '';
  if (existingUrl || file) {
    const previewItem = document.createElement('div');
    previewItem.className = 'image-preview-item';
    previewItem.dataset.isExisting = existingUrl ? 'true' : 'false';
    if (existingUrl) {
      previewItem.dataset.imageUrl = existingUrl;
    }
    if (file) {
      previewItem.dataset.fileName = file.name;
      previewItem.dataset.fileType = file.type;
    }
    const img = document.createElement('img');
    img.alt = 'Cover Image Preview';
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
        previewItem.dataset.fileBase64 = e.target.result;
      };
      reader.readAsDataURL(file);
    } else if (existingUrl) {
      img.src = existingUrl;
    }
    previewItem.appendChild(img);
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-image-btn';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', () => {
      previewItem.remove();
      if (container.id === 'add-cover-image-preview') {
        addProductCoverImageInput.value = '';
      } else if (container.id === 'update-cover-image-preview') {
        updateProductCoverImageInput.value = '';
      }
    });
    previewItem.appendChild(removeBtn);
    container.appendChild(previewItem);
  }
}

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
    <label class="block text-gray-700 font-medium mb-2">Images for this color (drag to reorder):</label>
    <input type="file" class="color-image-input w-full p-2 border border-gray-300 rounded-lg file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" accept="image/*" multiple />
    <div class="image-preview-container mt-2 flex flex-wrap gap-2">
      ${images.map(img => `
        <div class="image-preview-item" data-image-url="${img.image_url || img.url || ''}" data-is-existing="true" draggable="true">
          <img src="${img.image_url || img.url}" alt="Image Preview" />
          <button type="button" class="remove-image-btn"><i class="fas fa-times"></i></button>
        </div>
      `).join('')}
    </div>
  `;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID ${containerId} not found`);
    return;
  }
  container.appendChild(rowDiv);

  const removeColorBtn = rowDiv.querySelector('.remove-color-btn');
  removeColorBtn.addEventListener('click', () => {
    rowDiv.remove();
  });

  const colorImageInput = rowDiv.querySelector('.color-image-input');
  const imagePreviewContainer = rowDiv.querySelector('.image-preview-container');

  if (typeof Sortable !== 'undefined' && !sortableInstances.has(rowDiv)) {
    sortableInstances.set(rowDiv, new Sortable(imagePreviewContainer, {
      animation: 150,
      onEnd: (event) => {
        console.log('Items reordered:', Array.from(imagePreviewContainer.children));
      },
    }));
  }

  colorImageInput.addEventListener('change', (event) => {
    Array.from(event.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item';
        previewItem.dataset.isExisting = 'false';
        previewItem.draggable = true;
        previewItem.innerHTML = `
          <img src="${e.target.result}" alt="Image Preview" />
          <button type="button" class="remove-image-btn"><i class="fas fa-times"></i></button>
        `;
        imagePreviewContainer.appendChild(previewItem);
        previewItem.dataset.fileBase64 = e.target.result;
        previewItem.dataset.fileName = file.name;
        previewItem.dataset.fileType = file.type;

        if (typeof Sortable !== 'undefined' && sortableInstances.has(rowDiv)) {
          sortableInstances.get(rowDiv).destroy();
          sortableInstances.set(rowDiv, new Sortable(imagePreviewContainer, {
            animation: 150,
            onEnd: (event) => {
              console.log('Items reordered:', Array.from(imagePreviewContainer.children));
            },
          }));
        }

        previewItem.querySelector('.remove-image-btn').addEventListener('click', () => {
          previewItem.remove();
          if (typeof Sortable !== 'undefined' && sortableInstances.has(rowDiv)) {
            sortableInstances.get(rowDiv).destroy();
            sortableInstances.set(rowDiv, new Sortable(imagePreviewContainer, {
              animation: 150,
              onEnd: (event) => {
                console.log('Items reordered:', Array.from(imagePreviewContainer.children));
              },
            }));
          }
        });
      };
      reader.readAsDataURL(file);
    });
  });

  rowDiv.querySelectorAll('.remove-image-btn').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.target.closest('.image-preview-item').remove();
      if (typeof Sortable !== 'undefined' && sortableInstances.has(rowDiv)) {
        sortableInstances.get(rowDiv).destroy();
        sortableInstances.set(rowDiv, new Sortable(imagePreviewContainer, {
          animation: 150,
          onEnd: (event) => {
            console.log('Items reordered:', Array.from(imagePreviewContainer.children));
          },
        }));
      }
    });
  });

  return rowDiv;
}

function createFeatureInputRow(containerId, featureText = '') {
  const rowId = generateUniqueId();
  const rowDiv = document.createElement('div');
  rowDiv.className = 'flex items-center gap-2';
  rowDiv.id = rowId;

  rowDiv.innerHTML = `
    <input type="text" class="feature-input w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter feature" value="${featureText}" required />
    <button type="button" class="remove-feature-btn bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600">
      <i class="fas fa-times"></i>
    </button>
  `;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID ${containerId} not found`);
    return;
  }
  container.appendChild(rowDiv);

  rowDiv.querySelector('.remove-feature-btn').addEventListener('click', () => {
    rowDiv.remove();
  });

  return rowDiv;
}

function createSpecificationInputRow(containerId, spec = {}) {
  const rowId = generateUniqueId();
  const rowDiv = document.createElement('div');
  rowDiv.className = 'border border-gray-300 p-3 rounded-lg bg-white';
  rowDiv.id = rowId;

  rowDiv.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <input type="text" class="spec-color w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Color" value="${spec.color || ''}" />
      <input type="text" class="spec-capacity w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Capacity" value="${spec.capacity || ''}" />
      <input type="text" class="spec-material w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Material" value="${spec.material || ''}" />
      <input type="text" class="spec-dimensions w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Dimensions (cm)" value="${spec.dimensions_cm || ''}" />
      <input type="text" class="spec-package w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Package Content" value="${spec.package_content || ''}" />
    </div>
    <button type="button" class="remove-spec-btn mt-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600">
      <i class="fas fa-times"></i>
    </button>
  `;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID ${containerId} not found`);
    return;
  }
  container.appendChild(rowDiv);

  rowDiv.querySelector('.remove-spec-btn').addEventListener('click', () => {
    rowDiv.remove();
  });

  return rowDiv;
}

function collectFormData(containerIdPrefix) {
  const features = [];
  const specifications = [];

  const featuresContainer = document.getElementById(`${containerIdPrefix}-features-container`);
  if (featuresContainer) {
    featuresContainer.querySelectorAll('.feature-input').forEach(input => {
      const value = input.value.trim();
      if (value) features.push(value);
    });
  }

  const specsContainer = document.getElementById(`${containerIdPrefix}-specifications-container`);
  if (specsContainer) {
    specsContainer.querySelectorAll('.border.border-gray-300.p-3.rounded-lg.bg-white').forEach(row => {
      const spec = {
        color: row.querySelector('.spec-color')?.value.trim() || undefined,
        capacity: row.querySelector('.spec-capacity')?.value.trim() || undefined,
        material: row.querySelector('.spec-material')?.value.trim() || undefined,
        dimensions_cm: row.querySelector('.spec-dimensions')?.value.trim() || undefined,
        package_content: row.querySelector('.spec-package')?.value.trim() || undefined,
      };
      if (Object.values(spec).some(val => val !== undefined)) {
        specifications.push(spec);
      }
    });
  }

  return { features, specifications };
}

function openModal(modalElement) {
  if (!modalElement) {
    console.error('Modal element not found');
    return;
  }
  modalElement.classList.remove("hidden");
  setTimeout(() => (modalElement.style.opacity = "1"), 10);
}

function closeModal(modalElement) {
  if (!modalElement) {
    console.error('Modal element not found');
    return;
  }
  modalElement.style.opacity = "0";
  setTimeout(() => modalElement.classList.add("hidden"), 300);
}

async function populateCategories(selectElement, selectedCategoryId = null) {
  if (!selectElement) {
    console.error('Category select element not found');
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || 'YOUR_TOKEN_HERE'}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allCategories = await response.json();
    console.log('Categories loaded:', allCategories); // Debugging
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

async function populateCategoryFilter() {
  if (!categoryFilterSelect) {
    console.error('Category filter select element not found');
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || 'YOUR_TOKEN_HERE'}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allCategories = await response.json();
    console.log('Categories for filter loaded:', allCategories); // Debugging
    categoryFilterSelect.innerHTML = '<option value="">All Categories</option>';

    allCategories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categoryFilterSelect.appendChild(option);
    });

    // Trigger initial load with the default (empty) category
    loadProducts(categoryFilterSelect.value);
  } catch (error) {
    console.error("Error loading categories for filter:", error);
    alert("Failed to load categories for filter. Please try again.");
  }
}

async function loadProducts(categoryId = '') {
  if (!dashboardProductsList) {
    console.error('Dashboard products list element not found');
    return;
  }
  dashboardProductsList.innerHTML = `
    <div class="flex justify-center items-center h-48">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    <p class="text-center text-gray-600 mt-4">Loading products...</p>
  `;
  try {
    // Always fetch all products and filter client-side if necessary
    const url = `${API_BASE_URL}/producttypes`;
    console.log('Fetching products from:', url, 'with categoryId:', categoryId);
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || 'YOUR_TOKEN_HERE'}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    let products = await response.json();
    console.log('Products received:', products);

    // Client-side filtering if categoryId is provided
    if (categoryId) {
      products = products.filter(product => 
        product.category_id === categoryId || 
        (product.category && product.category.id === categoryId)
      );
      console.log('Filtered products for category', categoryId, ':', products);
    }

    dashboardProductsList.innerHTML = "";

    if (products.length === 0) {
      dashboardProductsList.innerHTML = `
        <div class="text-center p-8 bg-white rounded-lg shadow-md">
          <p class="text-gray-600 text-lg">${categoryId ? 'No products found for this category.' : 'No products found. Add a new product to get started!'}</p>
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

  let mainImageUrl = product.cover_image_url || "https://via.placeholder.com/100x100?text=No+Image";
  if (!product.cover_image_url && product.colors && product.colors.length > 0) {
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

  const priceText = parseFloat(product.price) ? parseFloat(product.price).toFixed(2) : "N/A";

  card.innerHTML = `
    <img src="${mainImageUrl}" alt="${product.name}" class="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
    <div class="flex-1 text-center sm:text-left">
      <h3 class="text-xl font-semibold text-gray-800">${product.name}</h3>
      <p class="text-gray-600 text-sm">Category: ${product.category ? product.category.name : 'N/A'}</p>
      <p class="text-gray-700 font-bold mt-1">Price: ₹${priceText}</p>
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
      <button class="toggle-status-btn bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 ${product.status === 'active' ? 'opacity-100' : 'opacity-70'}">
        <i class="fas fa-toggle-${product.status === 'active' ? 'on' : 'off'}"></i> ${product.status === 'active' ? 'Active' : 'Inactive'}
      </button>
    </div>
  `;

  card.querySelector(".view-btn").addEventListener("click", () => openProductDetailsModal(product));
  card.querySelector(".edit-btn").addEventListener("click", () => openUpdateProductModal(product.id));
  card.querySelector(".delete-btn").addEventListener("click", () => deleteProduct(product.id, product.name));
  card.querySelector(".toggle-status-btn").addEventListener("click", () => toggleProductStatus(product.id, product.status));

  return card;
}

function initializeAddProductModal() {
  if (!addProductBtn || !addProductForm || !addColorImageInputsContainer || !addFeaturesContainer || !addSpecificationsContainer || !addProductCategorySelect || !addProductCoverImageInput || !addCoverImagePreview) {
    console.error('One or more DOM elements for Add Product modal not found');
    return;
  }
  addProductBtn.addEventListener("click", () => {
    console.log('Add Product button clicked');
    addProductForm.reset();
    addCoverImagePreview.innerHTML = '';
    addColorImageInputsContainer.innerHTML = '';
    createColorImageInputRow('add-color-image-inputs');
    addFeaturesContainer.innerHTML = '';
    addSpecificationsContainer.innerHTML = '';
    createFeatureInputRow('add-features-container');
    createSpecificationInputRow('add-specifications-container');
    populateCategories(addProductCategorySelect);
    openModal(addProductModal);
  });

  addProductCoverImageInput.addEventListener('change', (event) => {
    createCoverImagePreview(addCoverImagePreview, event.target.files[0]);
  });

  closeAddProductModalBtn.addEventListener("click", () => closeModal(addProductModal));

  addNewColorFieldBtn.addEventListener('click', () => {
    createColorImageInputRow('add-color-image-inputs');
  });

  addNewFeatureBtn.addEventListener('click', () => {
    createFeatureInputRow('add-features-container');
  });

  addNewSpecificationBtn.addEventListener('click', () => {
    createSpecificationInputRow('add-specifications-container');
  });

  addProductForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!addProductNameInput.value.trim()) {
      alert("Product name is required.");
      return;
    }
    if (!addProductCategorySelect.value) {
      alert("Please select a category.");
      return;
    }
    if (!addProductPriceInput.value || isNaN(parseFloat(addProductPriceInput.value))) {
      alert("Please enter a valid price.");
      return;
    }
    if (!addProductDescriptionInput.value.trim()) {
      alert("Description is required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", addProductNameInput.value.trim());
    formData.append("description", addProductDescriptionInput.value.trim());
    formData.append("price", parseFloat(addProductPriceInput.value) || 0);
    formData.append("category_id", addProductCategorySelect.value);

    const sizesValue = addProductSizesInput.value.trim();
    if (sizesValue) {
      formData.append("sizes", JSON.stringify(sizesValue.split(",").map(s => s.trim()).filter(s => s)));
    } else {
      formData.append("sizes", "[]");
    }

    const { features, specifications } = collectFormData('add');
    if (features.length === 0 && specifications.length === 0) {
      alert("Please add at least one feature or specification.");
      return;
    }
    formData.append("features", JSON.stringify(features));
    formData.append("specifications", JSON.stringify(specifications));

    if (addProductCoverImageInput.files[0]) {
      formData.append("coverImage", addProductCoverImageInput.files[0]);
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
      const imagePreviewContainer = row.querySelector('.image-preview-container');
      const previewItems = imagePreviewContainer.querySelectorAll('.image-preview-item');

      const colorName = colorInput.value.trim();
      if (!colorName) {
        alert("All color names must be provided.");
        return;
      }

      const imageIndices = [];
      previewItems.forEach(item => {
        if (item.dataset.isExisting === 'false' && item.dataset.fileName) {
          const fileIndex = allFilesForUpload.length;
          allFilesForUpload.push({
            name: item.dataset.fileName,
            type: item.dataset.fileType,
            base64: item.dataset.fileBase64
          });
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
      const blob = dataURLtoBlob(file.base64);
      formData.append("images", blob, file.name);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/producttypes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || 'YOUR_TOKEN_HERE'}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      alert("Product added successfully!");
      closeModal(addProductModal);
      loadProducts(categoryFilterSelect?.value || '');
    } catch (error) {
      console.error("Error adding product:", error);
      alert(`Failed to add product: ${error.message}`);
    }
  });
}

// Helper function to convert base64 to Blob
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

async function openUpdateProductModal(productId) {
  if (!updateProductIdInput || !updateProductNameInput || !updateProductDescriptionInput || !updateProductPriceInput || !updateProductCategorySelect || !updateProductSizesInput || !updateColorImageInputsContainer || !updateFeaturesContainer || !updateSpecificationsContainer || !updateProductCoverImageInput || !updateCoverImagePreview) {
    console.error('One or more DOM elements for Update Product modal not found');
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/producttypes/${productId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || 'YOUR_TOKEN_HERE'}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const product = await response.json();
    console.log('Product fetched for update:', product);

    updateProductIdInput.value = product.id || '';
    updateProductNameInput.value = product.name || '';
    updateProductDescriptionInput.value = product.description || '';
    updateProductPriceInput.value = parseFloat(product.price) || '';
    updateProductCategorySelect.value = product.category_id || product.category?.id || '';

    updateCoverImagePreview.innerHTML = '';
    if (product.cover_image_url) {
      createCoverImagePreview(updateCoverImagePreview, null, product.cover_image_url);
    }

    updateFeaturesContainer.innerHTML = '';
    const features = Array.isArray(product.features) ? product.features : [];
    if (features.length > 0) {
      features.forEach(feature => {
        if (typeof feature === 'string' && feature.trim()) {
          createFeatureInputRow('update-features-container', feature);
        }
      });
    } else {
      createFeatureInputRow('update-features-container');
    }

    updateSpecificationsContainer.innerHTML = '';
    const specifications = Array.isArray(product.specifications) ? product.specifications : [];
    if (specifications.length > 0) {
      specifications.forEach(spec => {
        if (spec && typeof spec === 'object') {
          createSpecificationInputRow('update-specifications-container', spec);
        }
      });
    } else {
      createSpecificationInputRow('update-specifications-container');
    }

    await populateCategories(updateProductCategorySelect, product.category_id || product.category?.id);

    const sizes = product.sizes && Array.isArray(product.sizes) ? product.sizes.map(s => s.size).join(", ") : "";
    updateProductSizesInput.value = sizes;

    updateColorImageInputsContainer.innerHTML = '';
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      product.colors.forEach(color => {
        createColorImageInputRow('update-color-image-inputs', color.color, color.images || [], true);
      });
    } else {
      createColorImageInputRow('update-color-image-inputs');
    }

    openModal(updateProductModal);
  } catch (error) {
    console.error("Error fetching product for update:", error);
    alert(`Failed to load product details for update: ${error.message}`);
  }
}

function initializeUpdateProductModal() {
  if (!closeUpdateProductModalBtn || !updateAddNewColorFieldBtn || !updateAddNewFeatureBtn || !updateAddNewSpecificationBtn || !updateProductForm || !updateProductCoverImageInput || !updateCoverImagePreview) {
    console.error('One or more DOM elements for Update Product modal not found');
    return;
  }
  closeUpdateProductModalBtn.addEventListener("click", () => closeModal(updateProductModal));

  updateProductCoverImageInput.addEventListener('change', (event) => {
    createCoverImagePreview(updateCoverImagePreview, event.target.files[0]);
  });

  updateAddNewColorFieldBtn.addEventListener('click', () => {
    createColorImageInputRow('update-color-image-inputs');
  });

  updateAddNewFeatureBtn.addEventListener('click', () => {
    createFeatureInputRow('update-features-container');
  });

  updateAddNewSpecificationBtn.addEventListener('click', () => {
    createSpecificationInputRow('update-specifications-container');
  });

  updateProductForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!updateProductNameInput.value.trim()) {
      alert("Product name is required.");
      return;
    }
    if (!updateProductCategorySelect.value) {
      alert("Please select a category.");
      return;
    }
    if (!updateProductPriceInput.value || isNaN(parseFloat(updateProductPriceInput.value))) {
      alert("Please enter a valid price.");
      return;
    }
    if (!updateProductDescriptionInput.value.trim()) {
      alert("Description is required.");
      return;
    }

    const productId = updateProductIdInput.value;
    const formData = new FormData();

    formData.append("name", updateProductNameInput.value.trim());
    formData.append("description", updateProductDescriptionInput.value.trim());
    formData.append("price", parseFloat(updateProductPriceInput.value) || 0);
    formData.append("category_id", updateProductCategorySelect.value);

    const sizesValue = updateProductSizesInput.value.trim();
    if (sizesValue) {
      formData.append("sizes", JSON.stringify(sizesValue.split(",").map(s => s.trim()).filter(s => s)));
    } else {
      formData.append("sizes", "[]");
    }

    const { features, specifications } = collectFormData('update');
    if (features.length === 0 && specifications.length === 0) {
      alert("Please add at least one feature or specification.");
      return;
    }
    formData.append("features", JSON.stringify(features));
    formData.append("specifications", JSON.stringify(specifications));

    if (updateProductCoverImageInput.files[0]) {
      formData.append("coverImage", updateProductCoverImageInput.files[0]);
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
      const imagePreviewContainer = row.querySelector('.image-preview-container');
      const previewItems = Array.from(imagePreviewContainer.querySelectorAll('.image-preview-item'));

      const colorName = colorInput.value.trim();
      if (!colorName) {
        alert("All color names must be provided.");
        return;
      }

      const imageIndices = [];
      const imageUrls = [];

      previewItems.forEach(item => {
        if (item.dataset.isExisting === 'true' && item.dataset.imageUrl) {
          imageUrls.push(item.dataset.imageUrl);
        } else if (item.dataset.isExisting === 'false' && item.dataset.fileName) {
          const fileIndex = allFilesForUpload.length;
          allFilesForUpload.push({
            name: item.dataset.fileName,
            type: item.dataset.fileType,
            base64: item.dataset.fileBase64
          });
          imageIndices.push(fileIndex);
        }
      });

      colorsData.push({
        color: colorName,
        imageIndices: imageIndices,
        imageUrls: imageUrls,
      });
    }

    formData.append("colors", JSON.stringify(colorsData));
    allFilesForUpload.forEach(file => {
      const blob = dataURLtoBlob(file.base64);
      formData.append("images", blob, file.name);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/producttypes/${productId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || 'YOUR_TOKEN_HERE'}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      alert("Product updated successfully!");
      closeModal(updateProductModal);
      loadProducts(categoryFilterSelect?.value || '');
    } catch (error) {
      console.error("Error updating product:", error);
      alert(`Failed to update product: ${error.message}`);
    }
  });
}

async function deleteProduct(productId, productName) {
  if (!confirm(`Are you sure you want to delete product "${productName}"? This action cannot be undone.`)) {
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/producttypes/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || 'YOUR_TOKEN_HERE'}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    alert(`Product "${productName}" deleted successfully!`);
    loadProducts(categoryFilterSelect?.value || '');
  } catch (error) {
    console.error("Error deleting product:", error);
    alert(`Failed to delete product: ${error.message}`);
  }
}

async function toggleProductStatus(productId, currentStatus) {
  const newStatus = currentStatus === "active" ? false : true;
  const statusText = newStatus ? "activate" : "deactivate";
  if (!confirm(`Are you sure you want to ${statusText} this product?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/producttypes/${productId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('token') || 'YOUR_TOKEN_HERE'}`,
      },
      body: JSON.stringify({
        active: newStatus,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    alert(`Product status changed to ${newStatus ? 'active' : 'inactive'} successfully!`);
    loadProducts(categoryFilterSelect?.value || '');
  } catch (error) {
    console.error("Error changing product status:", error);
    alert(`Failed to change product status: ${error.message}`);
  }
}

function openProductDetailsModal(product) {
  if (!detailProductName || !detailProductCategory || !detailProductPrice || !detailProductDescription || !detailProductStatus || !detailProductSizes || !detailProductColors || !detailProductCoverImage || !detailProductDetailedDescription) {
    console.error('One or more DOM elements for Product Details modal not found');
    return;
  }
  console.log('Product details:', product);

  detailProductName.textContent = product.name || 'N/A';
  detailProductCategory.textContent = product.category ? product.category.name : 'N/A';
  detailProductPrice.textContent = parseFloat(product.price) ? parseFloat(product.price).toFixed(2) : 'N/A';
  detailProductDescription.textContent = product.description || 'N/A';
  detailProductStatus.textContent = product.status || 'N/A';
  detailProductSizes.textContent = product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes.map(s => s.size).join(", ")
    : "N/A";

  detailProductCoverImage.innerHTML = '';
  if (product.cover_image_url) {
    const imgElement = document.createElement('img');
    imgElement.src = product.cover_image_url;
    imgElement.alt = 'Cover Image';
    imgElement.className = 'w-40 h-40 object-cover rounded-md shadow-sm';
    detailProductCoverImage.appendChild(imgElement);
  } else {
    detailProductCoverImage.innerHTML = '<p class="text-gray-500 italic">No cover image available.</p>';
  }

  detailProductColors.innerHTML = '';
  if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
    product.colors.forEach(color => {
      const colorDiv = document.createElement('div');
      colorDiv.className = 'bg-gray-100 p-2 rounded-md';
      colorDiv.innerHTML = `<p class="font-semibold">${color.color}:</p>`;

      if (color.images && Array.isArray(color.images) && color.images.length > 0) {
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
  const features = Array.isArray(product.features) ? product.features : [];
  const specifications = Array.isArray(product.specifications) ? product.specifications : [];

  const detailsDiv = document.createElement('div');
  detailsDiv.className = 'bg-gray-100 p-2 rounded-md';

  if (features.length > 0) {
    const featuresHeader = document.createElement('p');
    featuresHeader.className = 'font-semibold';
    featuresHeader.textContent = 'Features:';
    detailsDiv.appendChild(featuresHeader);

    const featuresList = document.createElement('ul');
    featuresList.className = 'list-disc pl-5';
    features.forEach(feature => {
      if (typeof feature === 'string' && feature.trim()) {
        const featureItem = document.createElement('li');
        featureItem.textContent = feature;
        featuresList.appendChild(featureItem);
      }
    });
    detailsDiv.appendChild(featuresList);
  }

  if (specifications.length > 0) {
    const specsHeader = document.createElement('p');
    specsHeader.className = 'font-semibold mt-2';
    specsHeader.textContent = 'Specifications:';
    detailsDiv.appendChild(specsHeader);

    const specsList = document.createElement('div');
    specsList.className = 'space-y-2 mt-2';
    specifications.forEach(spec => {
      if (spec && typeof spec === 'object') {
        const specDiv = document.createElement('div');
        specDiv.className = 'ml-2 p-2 bg-white rounded shadow-sm';
        specDiv.innerHTML = `
          <p><strong>Color:</strong> ${spec.color || 'N/A'}</p>
          <p><strong>Capacity:</strong> ${spec.capacity || 'N/A'}</p>
          <p><strong>Material:</strong> ${spec.material || 'N/A'}</p>
          <p><strong>Dimensions (cm):</strong> ${spec.dimensions_cm || 'N/A'}</p>
          <p><strong>Package Content:</strong> ${spec.package_content || 'N/A'}</p>
        `;
        specsList.appendChild(specDiv);
      }
    });
    detailsDiv.appendChild(specsList);
  }

  if (features.length === 0 && specifications.length === 0) {
    detailsDiv.innerHTML = '<p class="text-gray-500 italic">No detailed description available.</p>';
  } else {
    detailProductDetailedDescription.appendChild(detailsDiv);
  }

  openModal(productDetailsModal);
}

function initializeProductDetailsModal() {
  if (!closeProductDetailsModalBtn) {
    console.error('Close button for Product Details modal not found');
    return;
  }
  closeProductDetailsModalBtn.addEventListener('click', () => closeModal(productDetailsModal));
}

document.addEventListener("DOMContentLoaded", () => {
  if (!addProductBtn || !addProductForm || !updateProductForm || !dashboardProductsList || !categoryFilterSelect) {
    console.error('One or more critical DOM elements not found');
    alert('Error: Page not loaded correctly. Please refresh.');
    return;
  }
  initializeAddProductModal();
  initializeUpdateProductModal();
  initializeProductDetailsModal();
  populateCategoryFilter();
  categoryFilterSelect.addEventListener('change', () => {
    console.log('Category filter changed to:', categoryFilterSelect.value);
    loadProducts(categoryFilterSelect.value);
  });
});