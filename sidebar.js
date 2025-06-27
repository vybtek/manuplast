class SpecialSidebar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 fixed h-full transform transition-transform duration-300 ease-in-out md:translate-x-0 -translate-x-full md:flex flex-col z-20 shadow-xl">
        <h2 class="text-2xl font-bold mb-8 cursor-pointer flex items-center gap-3 hover:text-indigo-300 transition-colors" onclick="window.location.href='dashboard.html'">
          <i class="fa-solid fa-house"></i> Dashboard
        </h2>
        <ul class="flex-1">
          <li class="mb-4" id="product-item">
            <div class="block p-3 bg-gray-700/50 rounded-lg w-full cursor-pointer hover:bg-indigo-600/50 transition-colors" id="product-toggle">
              <i class="fa-solid fa-chair mr-2 text-lg"></i>Product
            </div>
            <div class="hidden mt-2 space-y-2 pl-4" id="product-menu">
            <a href="add-product-category.html" class="block px-4 py-2 bg-gray-600/50 rounded-lg hover:bg-indigo-500/50 transition-colors">
              <i class="fa-solid fa-plus mr-2"></i>Add Category
            </a>
             <a href="add-product.html" class="block px-4 py-2 bg-gray-600/50 rounded-lg hover:bg-indigo-500/50 transition-colors">
                <i class="fa-solid fa-plus mr-2"></i>Add Product
              </a>
              <a href="product-list.html" class="block px-4 py-2 bg-gray-600/50 rounded-lg hover:bg-indigo-500/50 transition-colors">
                <i class="fa-solid fa-eye mr-2"></i>View Category
              </a>
            </div>
          </li>

          <li class="mb-4" id="blog-item">
            <div class="block p-3 bg-gray-700/50 rounded-lg w-full cursor-pointer hover:bg-indigo-600/50 transition-colors" id="blog-toggle">
              <i class="fa-solid fa-cubes mr-2 text-lg"></i>Blog
            </div>
            <div class="hidden mt-2 space-y-2 pl-4" id="blog-menu">
              <a href="add-blog.html" class="block px-4 py-2 bg-gray-600/50 rounded-lg hover:bg-indigo-500/50 transition-colors">
                <i class="fa-solid fa-plus mr-2"></i>Add Blog
              </a>
              <a href="blog-list.html" class="block px-4 py-2 bg-gray-600/50 rounded-lg hover:bg-indigo-500/50 transition-colors">
                <i class="fa-solid fa-eye mr-2"></i>View Blogs
              </a>
            </div>
          </li>
        </ul>

        <button onclick="logout()" class="w-full mt-4 bg-red-500 p-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </button>
      </div>

      <button id="menu-toggle" class="p-3 text-white bg-indigo-600 md:hidden fixed top-4 left-4 z-30 rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
        <i class="fa-solid fa-bars"></i>
      </button>
    `;

    this.setupMobileMenu();
    this.setupDropdownToggles();
    this.setActiveClass();
  }

  setupMobileMenu() {
    this.querySelector("#menu-toggle")?.addEventListener("click", () => {
      const sidebar = this.querySelector(".w-64");
      sidebar.classList.toggle("-translate-x-full");
      sidebar.classList.toggle("translate-x-0");
    });
  }

  setupDropdownToggles() {
    const productToggle = this.querySelector("#product-toggle");
    const productMenu = this.querySelector("#product-menu");
    const blogToggle = this.querySelector("#blog-toggle");
    const blogMenu = this.querySelector("#blog-menu");

    productToggle.addEventListener("click", () => {
      productMenu.classList.toggle("hidden");
    });
    blogToggle.addEventListener("click", () => {
      blogMenu.classList.toggle("hidden");
    });
  }
}

customElements.define("special-sidebar", SpecialSidebar);

function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "login.html";
}
