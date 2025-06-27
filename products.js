async function fetchProducts(containerId = "product-grid", view = "default") {
  const productGrid = document.getElementById(containerId);
  if (!productGrid) return;

  try {
    const response = await fetch("http://localhost:5000/products");
    if (!response.ok) throw new Error("Failed to fetch products");

    const products = await response.json();
    productGrid.innerHTML = "";

    products.forEach((product) => {
      if (view === "default" && !product.active) return;

      const productCard = document.createElement("div");
      productCard.classList.add("text-center");

      if (view === "dashboard") {
        const isActive = product.active;

        productCard.innerHTML = `
          <div class="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <img src="${product.image}" alt="${product.name
          }" class="w-16 h-16 object-cover rounded" />
              <div class="text-left">
                <h4 class="font-semibold text-gray-800">${product.name}</h4>
                <p class="text-sm text-gray-500 truncate">${product.description?.slice(0, 60) || ""
          }</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
             <a href="add-product.html?id=${product.id
          }" class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm">Add</a>
              <a href="update-product.html?id=${product.id
          }" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">Edit</a>
              <button data-id="${product.id
          }" class="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
              <button data-id="${product.id
          }" data-active="${isActive}" class="toggle-btn ${isActive
            ? "bg-yellow-500 hover:bg-yellow-600"
            : "bg-green-500 hover:bg-green-600"
          } text-white px-3 py-1 rounded text-sm">
                ${isActive ? "Deactivate" : "Activate"}
              </button>
              <a href="product-detail.html?id=${product.id
          }&source=dashboard" class="bg-gray-200 text-black px-3 py-1 rounded text-sm">View</a>
            </div>
          </div>
        `;
      } else {
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

    if (view === "dashboard") {
      productGrid.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".delete-btn");
        const toggleBtn = e.target.closest(".toggle-btn");

        if (deleteBtn) {
          const productId = deleteBtn.getAttribute("data-id");
          if (confirm("Are you sure you want to delete this product?")) {
            deleteProduct(productId);
          }
        }

        if (toggleBtn) {
          const productId = toggleBtn.getAttribute("data-id");
          const isActive = toggleBtn.getAttribute("data-active") === "true";
          const action = isActive ? "deactivate" : "activate";
          if (confirm(`Are you sure you want to ${action} this product?`)) {
            toggleActive(productId, isActive);
          }
        }
      });
    }
  } catch (error) {
    alert(`Error fetching products: ${error}`);
  }
}

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

    const isFromDashboard =
      document.referrer.includes("dashboard") || source === "dashboard";

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

    const typesContent =
      Array.isArray(product.types) && product.types.length > 0
        ? `
        <h2 class="text-3xl font-semibold text-gray-900 mt-10 text-center">Products List</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
          ${product.types
          .map(
            (type, index) => `
            <a href="type-detail.html?id=${productId}&typeIndex=${index}" class="block">
              <div class="p-6 rounded-xl transition duration-300 bg-white shadow hover:shadow-lg">
                <img src="${type.images[0] || "./images/placeholder.jpg"
              }" class="w-full h-52 object-cover rounded-md">
                <h3 class="text-2xl font-semibold text-gray-800 mt-4">${type.name
              }</h3>
                <p class="text-gray-600 mt-3 text-sm leading-relaxed">${type.description
              }</p>
                <p class="text-center text-gray-600 hover:text-red-500 mt-2 rounded-lg">
                  View Details <i class="fa-solid fa-arrow-right ml-1"></i>
                </p>
              </div>
            </a>
          `
          )
          .join("")}
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
            ← Back to Products Category
          </a>
        </div>
      </div>
    `;
  } catch (error) {
    productDetail.innerHTML =
      "<p class='text-red-500 text-lg text-center font-semibold'>Error loading product details.</p>";
  }
}

async function fetchTypeDetail() {
  const typeDetail = document.getElementById("type-detail");
  if (!typeDetail) {
    console.error("type-detail element not found");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const typeIndex = parseInt(params.get("typeIndex"), 10);

  if (!productId || isNaN(typeIndex)) {
    typeDetail.innerHTML =
      "<p class='text-red-500 text-lg text-center font-semibold'>Product type not found.</p>";
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/products/${productId}`);
    if (!response.ok)
      throw new Error(`Failed to fetch product details: ${response.status}`);
    const product = await response.json();

    if (!product.active && !document.referrer.includes("dashboard")) {
      typeDetail.innerHTML = `
        <div class="text-center py-16">
          <h2 class="text-2xl font-bold text-red-600">This product is currently inactive.</h2>
          <a href="products.html" class="mt-4 inline-block bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900">
            ← Back to Products
          </a>
        </div>
      `;
      return;
    }

    const type = product.types[typeIndex];
    if (!type) {
      typeDetail.innerHTML =
        "<p class='text-red-500 text-lg text-center font-semibold'>Product type not found.</p>";
      return;
    }

    const sizesContent = type.sizes?.length
      ? `
        <div class="mt-8">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Available Sizes</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            ${type.sizes
        .map(
          (size) =>
            `<div class="size-card bg-white border border-gray-200 rounded-lg p-4 text-center text-gray-800 font-medium shadow-sm hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300 cursor-pointer">
                     ${size}
                   </div>`
        )
        .join("")}
          </div>
        </div>
      `
      : "";

    const colorsContent = type.colors?.length
      ? `
        <div class="mt-8">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Available Colors</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            ${type.colors
        .map(
          (color) =>
            `<div class="color-card bg-white border border-gray-200 rounded-lg p-4 text-center text-gray-800 font-medium shadow-sm hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300 cursor-pointer" style="background-color: ${color.toLowerCase()}; color: ${["white", "yellow", "lightgray"].includes(
              color.toLowerCase()
            )
              ? "black"
              : "white"
            }">
                     ${color}
                   </div>`
        )
        .join("")}
          </div>
        </div>
      `
      : "";

    typeDetail.innerHTML = `
      <div class="max-w-5xl mx-auto my-8 px-6 py-10 transform transition-all duration-500 animate-fadeIn">
        <h1 class="relative text-4xl md:text-5xl font-extrabold text-gray-800 text-center tracking-tight mb-10">
          ${type.name}
        </h1>
        
        <div class="image-gallery mb-8 relative">
          <div class="gallery-container flex overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar">
            ${type.images
        .map(
          (img, index) =>
            `<div class="gallery-item flex-shrink-0 snap-center" data-tilt data-tilt-max="10" data-tilt-speed="400" data-tilt-perspective="1000">
                     <img src="${img}" class="w-80 h-80 object-cover rounded-xl cursor-pointer transition-transform duration-300 hover:shadow-2xl" data-index="${index}"/>
                   </div>`
        )
        .join("")}
          </div>
          <button class="gallery-nav prev absolute left-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 rounded-full opacity-75 hover:opacity-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            ←
          </button>
          <button class="gallery-nav next absolute right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 rounded-full opacity-75 hover:opacity-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            →
          </button>
          <div class="thumbnail-strip flex justify-center gap-2 mt-4">
            ${type.images
        .map(
          (img, index) =>
            `<img src="${img}" class="w-16 h-16 object-cover rounded-lg cursor-pointer opacity-60 hover:opacity-100 transition-opacity duration-300 thumbnail" data-index="${index}"/>`
        )
        .join("")}
          </div>
        </div>
        
        <div class="lightbox fixed inset-0 bg-black bg-opacity-90 hidden flex items-center justify-center z-50">
          <div class="lightbox-content relative">
            <img src="" class="max-w-full max-h-[90vh] object-contain rounded-xl"/>
            <button class="lightbox-close absolute top-2 right-2 text-white bg-gray-800 p-2 rounded-full">×</button>
            <button class="lightbox-prev absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-gray-800 p-2 rounded-full">←</button>
            <button class="lightbox-next absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-gray-800 p-2 rounded-full">→</button>
          </div>
        </div>
        
        <p class="text-lg md:text-xl text-gray-600 leading-relaxed text-center px-4 mb-6 font-medium">
          ${type.description}
        </p>
        
        <p class="text-2xl font-semibold text-indigo-700 text-center bg-indigo-50 inline-block px-6 py-2 rounded-full mb-8">
          Price: ₹${type.price}
        </p>

        ${sizesContent}
        ${colorsContent}

        <div class="flex justify-center space-x-4 mt-8">
          <a href="product-detail.html?id=${productId}" 
             class="bg-gradient-to-r from-gray-900 to-indigo-800 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
            ← Back to Product Details
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
          scroll-behavior: smooth;
          padding: 0 10px; /* Ensure space for centering */
        }
        .gallery-item {
          margin-right: 16px;
          width: 320px; /* Fixed width for consistent scrolling */
        }
        .gallery-item:last-child {
          margin-right: 0;
        }
        .gallery-nav {
          display: ${type.images.length > 1 ? "block" : "none"};
        }
        .thumbnail.active {
          opacity: 100 !important;
          border: 2px solid #4f46e5;
        }
        .lightbox {
          transition: opacity 0.3s ease;
        }
        .lightbox-content img {
          animation: fadeIn 0.3s;
        }
        .size-card, .color-card {
          transition: all 0.3s ease;
        }
        .size-card:hover, .color-card:hover {
          background-color: #f3f4f6;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      </style>
      <script>
        document.addEventListener("DOMContentLoaded", () => {
          const galleryContainer = document.querySelector(".gallery-container");
          const prevButton = document.querySelector(".gallery-nav.prev");
          const nextButton = document.querySelector(".gallery-nav.next");
          const thumbnails = document.querySelectorAll(".thumbnail");
          const lightbox = document.querySelector(".lightbox");
          const lightboxImg = document.querySelector(".lightbox-content img");
          const lightboxClose = document.querySelector(".lightbox-close");
          const lightboxPrev = document.querySelector(".lightbox-prev");
          const lightboxNext = document.querySelector(".lightbox-next");
          let currentIndex = 0;

          if (!galleryContainer || !prevButton || !nextButton) {
            console.error("Gallery elements not found:", { galleryContainer, prevButton, nextButton });
            return;
          }

          // Initialize VanillaTilt for 3D effect
          if (typeof VanillaTilt !== "undefined") {
            VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
              max: 10,
              speed: 400,
              perspective: 1000,
            });
          } else {
            console.warn("VanillaTilt not loaded");
          }

          // Update navigation button states
          function updateNavButtons() {
            prevButton.disabled = currentIndex === 0;
            nextButton.disabled = currentIndex === ${type.images.length - 1};
            console.log("Nav buttons updated:", { currentIndex, prevDisabled: prevButton.disabled, nextDisabled: nextButton.disabled });
          }

          // Update active thumbnail and scroll to center
          function updateActiveThumbnail(index) {
            currentIndex = index;
            thumbnails.forEach((thumb, i) => {
              thumb.classList.toggle("active", i === index);
            });
            const galleryWidth = galleryContainer.offsetWidth;
            const scrollPosition = index * 336 - (galleryWidth - 320) / 2; // Center image (336 = 320px image + 16px margin)
            galleryContainer.scrollTo({
              left: Math.max(0, scrollPosition),
              behavior: "smooth"
            });
            console.log("Scrolled to index:", index, "Position:", scrollPosition, "Gallery width:", galleryWidth);
            updateNavButtons();
          }

          // Gallery navigation
          prevButton.addEventListener("click", () => {
            if (currentIndex > 0) {
              currentIndex--;
              updateActiveThumbnail(currentIndex);
              console.log("Prev button clicked, new index:", currentIndex);
            }
          });

          nextButton.addEventListener("click", () => {
            if (currentIndex < ${type.images.length - 1}) {
              currentIndex++;
              updateActiveThumbnail(currentIndex);
              console.log("Next button clicked, new index:", currentIndex);
            }
          });

          // Thumbnail click handling
          thumbnails.forEach((thumb, index) => {
            thumb.addEventListener("click", () => {
              currentIndex = index;
              updateActiveThumbnail(index);
              console.log("Thumbnail clicked, index:", index);
            });
          });

          // Lightbox functionality
          document.querySelectorAll(".gallery-item img").forEach((img, index) => {
            img.addEventListener("click", () => {
              currentIndex = index;
              lightboxImg.src = img.src;
              lightbox.classList.remove("hidden");
              updateNavButtons();
              console.log("Image clicked, opened lightbox, index:", index);
            });
          });

          lightboxClose.addEventListener("click", () => {
            lightbox.classList.add("hidden");
            console.log("Lightbox closed");
          });

          lightboxPrev.addEventListener("click", () => {
            if (currentIndex > 0) {
              currentIndex--;
              lightboxImg.src = document.querySelectorAll(".gallery-item img")[currentIndex].src;
              updateActiveThumbnail(currentIndex);
              console.log("Lightbox prev clicked, new index:", currentIndex);
            }
          });

          lightboxNext.addEventListener("click", () => {
            if (currentIndex < ${type.images.length - 1}) {
              currentIndex++;
              lightboxImg.src = document.querySelectorAll(".gallery-item img")[currentIndex].src;
              updateActiveThumbnail(currentIndex);
              console.log("Lightbox next clicked, new index:", currentIndex);
            }
          });

          // Keyboard navigation for lightbox
          document.addEventListener("keydown", (e) => {
            if (!lightbox.classList.contains("hidden")) {
              if (e.key === "ArrowLeft" && currentIndex > 0) {
                currentIndex--;
                lightboxImg.src = document.querySelectorAll(".gallery-item img")[currentIndex].src;
                updateActiveThumbnail(currentIndex);
                console.log("Keyboard left, new index:", currentIndex);
              } else if (e.key === "ArrowRight" && currentIndex < ${type.images.length - 1
      }) {
                currentIndex++;
                lightboxImg.src = document.querySelectorAll(".gallery-item img")[currentIndex].src;
                updateActiveThumbnail(currentIndex);
                console.log("Keyboard right, new index:", currentIndex);
              } else if (e.key === "Escape") {
                lightbox.classList.add("hidden");
                console.log("Keyboard escape, lightbox closed");
              }
            }
          });

          // Initialize first thumbnail and buttons
          updateActiveThumbnail(0);
        });
      </script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.7.0/vanilla-tilt.min.js"></script>
    `;
  } catch (error) {
    console.error("Error loading product type details:", error);
    typeDetail.innerHTML =
      "<p class='text-red-500 text-lg text-center font-semibold'>Error loading product type details.</p>";
  }
}

async function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      const response = await fetch(`http://localhost:5000/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete product: ${response.status} - ${errorText}`
        );
      }

      fetchProducts("dashboard-product-list", "dashboard");
      alert("Product deleted successfully!");
    } catch (error) {
      alert(`Failed to delete product: ${error.message}`);
    }
  }
}

async function toggleActive(productId, currentStatus) {
  try {
    const response = await fetch(
      `http://localhost:5000/products/${productId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !currentStatus }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to update product status: ${response.status} - ${errorText}`
      );
    }

    fetchProducts("dashboard-product-list", "dashboard");
    alert(
      `Product ${currentStatus ? "deactivated" : "activated"} successfully!`
    );
  } catch (error) {
    alert(`Failed to update product status: ${error.message}`);
  }
}

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
    alert("Failed to load product data.");
  }
}

function populateForm(product) {
  document.getElementById("product-id").value = product.id;
  document.getElementById("name").value = product.name;
  document.getElementById("image").value = product.image;
  document.getElementById("description").value = product.description;

  const typesContainer = document.getElementById("types-container");
  typesContainer.innerHTML = "";

  if (Array.isArray(product.types) && product.types.length > 0) {
    product.types.forEach((type, index) => {
      const typeDiv = createTypeDiv(type, index);
      typesContainer.appendChild(typeDiv);
      addDynamicFieldListeners(typeDiv, index);
    });
  } else {
    // Add an empty type if none exist
    const typeDiv = createTypeDiv({}, 0);
    typesContainer.appendChild(typeDiv);
    addDynamicFieldListeners(typeDiv, 0);
  }
}

function createTypeDiv(type, index) {
  const typeDiv = document.createElement("div");
  typeDiv.className =
    "type-item space-y-4 border p-6 rounded-lg bg-gray-50 relative";
  typeDiv.innerHTML = `
    <div class="flex justify-between items-center">
      <h4 class="font-semibold text-lg text-gray-700">Product Type ${index + 1
    }</h4>
      <button type="button" class="remove-type text-red-500 text-2xl" aria-label="Remove Product Type">×</button>
    </div>
    <div>
      <label for="type-name-${index}" class="block text-gray-700 font-medium mb-1">Type Name</label>
      <input type="text" id="type-name-${index}" class="type-name w-full p-3 border rounded-lg" value="${type.name || ""
    }" placeholder="Type Name">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Type Images</label>
      <div class="type-images-container space-y-2" data-type-index="${index}">
        ${type.images?.length
      ? type.images
        .map(
          (img) => `
              <div class="flex items-center space-x-2">
                <input type="url" class="type-image w-full p-3 border rounded-lg" value="${img}" placeholder="Type Image URL">
                <button type="button" class="remove-image text-red-500 text-xl" aria-label="Remove Image">×</button>
              </div>
            `
        )
        .join("")
      : `
              <div class="flex items-center space-x-2">
                <input type="url" class="type-image w-full p-3 border rounded-lg" placeholder="Type Image URL">
                <button type="button" class="remove-image text-red-500 text-xl" aria-label="Remove Image">×</button>
              </div>
            `
    }
      </div>
      <button type="button" class="add-image-btn bg-gray-200 px-3 py-1 mt-2 rounded hover:bg-gray-300" data-type-index="${index}" aria-label="Add Another Image">
        + Add Image
      </button>
    </div>
    <div>
      <label for="type-description-${index}" class="block text-gray-700 font-medium mb-1">Type Description</label>
      <textarea id="type-description-${index}" class="type-description w-full p-3 border rounded-lg" placeholder="Type Description">${type.description || ""
    }</textarea>
    </div>
    <div>
      <label for="type-price-${index}" class="block text-gray-700 font-medium mb-1">Type Price</label>
      <input type="number" step="0.01" id="type-price-${index}" class="type-price w-full p-3 border rounded-lg" value="${type.price || ""
    }" placeholder="Type Price">
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Sizes</label>
      <div class="type-sizes-container space-y-2" data-type-index="${index}">
        ${type.sizes?.length
      ? type.sizes
        .map(
          (size) => `
              <div class="flex items-center space-x-2">
                <input type="text" class="type-size w-full p-3 border rounded-lg" value="${size}" placeholder="Size (e.g., S, M, L)">
                <button type="button" class="remove-size text-red-500 text-xl" aria-label="Remove Size">×</button>
              </div>
            `
        )
        .join("")
      : `
              <div class="flex items-center space-x-2">
                <input type="text" class="type-size w-full p-3 border rounded-lg" placeholder="Size (e.g., S, M, L)">
                <button type="button" class="remove-size text-red-500 text-xl" aria-label="Remove Size">×</button>
              </div>
            `
    }
      </div>
      <button type="button" class="add-size-btn bg-gray-200 px-3 py-1 mt-2 rounded hover:bg-gray-300" data-type-index="${index}" aria-label="Add Another Size">
        + Add Size
      </button>
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Colors</label>
      <div class="type-colors-container space-y-2" data-type-index="${index}">
        ${type.colors?.length
      ? type.colors
        .map(
          (color) => `
              <div class="flex items-center space-x-2">
                <input type="text" class="type-color w-full p-3 border rounded-lg" value="${color}" placeholder="Color (e.g., Red, Blue)">
                <button type="button" class="remove-color text-red-500 text-xl" aria-label="Remove Color">×</button>
              </div>
            `
        )
        .join("")
      : `
              <div class="flex items-center space-x-2">
                <input type="text" class="type-color w-full p-3 border rounded-lg" placeholder="Color (e.g., Red, Blue)">
                <button type="button" class="remove-color text-red-500 text-xl" aria-label="Remove Color">×</button>
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
  // Remove Type
  typeDiv.querySelector(".remove-type")?.addEventListener("click", () => {
    typeDiv.remove();
  });

  // Add Image
  typeDiv.querySelector(".add-image-btn").addEventListener("click", () => {
    const imagesContainer = typeDiv.querySelector(
      `.type-images-container[data-type-index="${typeIndex}"]`
    );
    const imageDiv = document.createElement("div");
    imageDiv.className = "flex items-center space-x-2";
    imageDiv.innerHTML = `
      <input type="url" class="type-image w-full p-3 border rounded-lg" placeholder="Type Image URL">
      <button type="button" class="remove-image text-red-500 text-xl" aria-label="Remove Image">×</button>
    `;
    imagesContainer.appendChild(imageDiv);
    imageDiv.querySelector(".remove-image").addEventListener("click", () => {
      if (imagesContainer.children.length > 1) {
        imagesContainer.removeChild(imageDiv);
      }
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
      <input type="text" class="type-size w-full p-3 border rounded-lg" placeholder="Size (e.g., S, M, L)">
      <button type="button" class="remove-size text-red-500 text-xl" aria-label="Remove Size">×</button>
    `;
    sizesContainer.appendChild(sizeDiv);
    sizeDiv.querySelector(".remove-size").addEventListener("click", () => {
      if (sizesContainer.children.length > 1) {
        sizesContainer.removeChild(sizeDiv);
      }
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
      <input type="text" class="type-color w-full p-3 border rounded-lg" placeholder="Color (e.g., Red, Blue)">
      <button type="button" class="remove-color text-red-500 text-xl" aria-label="Remove Color">×</button>
    `;
    colorsContainer.appendChild(colorDiv);
    colorDiv.querySelector(".remove-color").addEventListener("click", () => {
      if (colorsContainer.children.length > 1) {
        colorsContainer.removeChild(colorDiv);
      }
    });
  });

  // Remove existing images, sizes, colors
  typeDiv.querySelectorAll(".remove-image").forEach((btn) => {
    btn.addEventListener("click", () => {
      const container = btn.parentElement.parentElement;
      if (container.children.length > 1) {
        container.removeChild(btn.parentElement);
      }
    });
  });
  typeDiv.querySelectorAll(".remove-size").forEach((btn) => {
    btn.addEventListener("click", () => {
      const container = btn.parentElement.parentElement;
      if (container.children.length > 1) {
        container.removeChild(btn.parentElement);
      }
    });
  });
  typeDiv.querySelectorAll(".remove-color").forEach((btn) => {
    btn.addEventListener("click", () => {
      const container = btn.parentElement.parentElement;
      if (container.children.length > 1) {
        container.removeChild(btn.parentElement);
      }
    });
  });
}

// Add Product Type Button
document.getElementById("add-type-button")?.addEventListener("click", () => {
  const typesContainer = document.getElementById("types-container");
  const typeCount = typesContainer.querySelectorAll(".type-item").length;
  const typeDiv = createTypeDiv({}, typeCount);
  typesContainer.appendChild(typeDiv);
  addDynamicFieldListeners(typeDiv, typeCount);
});

document
  .getElementById("update-product-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const productId = document.getElementById("product-id").value;
    const name = document.getElementById("name").value;
    const image = document.getElementById("image").value;
    const description = document.getElementById("description").value;

    const types = Array.from(
      document.querySelectorAll("#types-container .type-item")
    )
      .map((typeDiv, index) => {
        return {
          name: typeDiv.querySelector(`#type-name-${index}`)?.value || "",
          images: Array.from(
            typeDiv.querySelectorAll(
              `.type-images-container[data-type-index="${index}"] .type-image`
            )
          )
            .map((input) => input.value)
            .filter((url) => url),
          description:
            typeDiv.querySelector(`#type-description-${index}`)?.value || "",
          price:
            parseFloat(typeDiv.querySelector(`#type-price-${index}`)?.value) ||
            0,
          sizes: Array.from(
            typeDiv.querySelectorAll(
              `.type-sizes-container[data-type-index="${index}"] .type-size`
            )
          )
            .map((input) => input.value)
            .filter((size) => size),
          colors: Array.from(
            typeDiv.querySelectorAll(
              `.type-colors-container[data-type-index="${index}"] .type-color`
            )
          )
            .map((input) => input.value)
            .filter((color) => color),
        };
      })
      .filter((t) => t.name && t.images.length && t.description && t.price);

    if (types.length === 0) {
      alert(
        "Please add at least one valid product type with name, images, description, and price."
      );
      return;
    }

    const updatedProduct = {
      name,
      image,
      description,
      types,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProduct),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to update product");

      alert("Product updated successfully!");
      window.location.href = "product-list.html";
    } catch (error) {
      alert(`Failed to update product: ${error.message}`);
    }
  });

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.toLowerCase();

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
});
