class SpecialSidebar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="w-64 bg-gray-800 text-white p-5 fixed h-full">
        <h2 class="text-2xl font-bold mb-5 cursor-pointer" onclick="window.location.href='dashboard.html'">
          <i class="fa-solid fa-house"></i> Dashboard
        </h2>
        <ul class="justify-center items-center">
          <li class="mb-3" id="product-item">
            <div class="block p-2 bg-gray-700 rounded w-full cursor-pointer" id="product-toggle"><i class="fa-solid fa-chair mr-2 text-lg"></i>Product</div>
            <div class="hidden" id="product-menu">
              <a href="add-product.html" class="block px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
                <i class="fa-solid fa-plus mr-2"></i>Add Product
              </a>
              <a href="product-list.html" class="block px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
                <i class="fa-solid fa-eye mr-2"></i>View Products
              </a>
            </div>
          </li>

          <li class="mb-3" id="project-item">
            <div class="block p-2 bg-gray-700 rounded w-full cursor-pointer" id="project-toggle"><i class="fa-solid fa-building-shield mr-2 text-lg"></i>Project</div>
            <div class="hidden" id="project-menu">
              <a href="add-project.html" class="block px-4 py-2 bg-gray-600 hover:bg-gray-500">
                <i class="fa-solid fa-plus mr-2"></i>Add Project
              </a>
              <a href="project-list.html" class="block px-4 py-2 bg-gray-600  hover:bg-gray-500">
                <i class="fa-solid fa-eye mr-2"></i>View Projects
              </a>
            </div>
          </li>

          <li class="mb-3" id="blog-item">
            <div class="block p-2 bg-gray-700 rounded w-full cursor-pointer" id="blog-toggle"><i class="fa-solid fa-cubes mr-2 text-lg"></i>Blog</div>
            <div class="hidden" id="blog-menu">
              <a href="add-blog.html" class="block px-4 py-2 bg-gray-600  hover:bg-gray-500">
                <i class="fa-solid fa-plus mr-2"></i>Add Blog
              </a>
              <a href="blog-list.html" class="block px-4 py-2 bg-gray-600 hover:bg-gray-500">
                <i class="fa-solid fa-eye mr-2"></i>View Blogs
              </a>
            </div>
          </li>

          <li>
            <button onclick="logout()" class="w-full mt-4 bg-red-500 p-2 rounded hover:bg-red-600">
              <i class="fa-solid fa-right-from-bracket"></i> Logout
            </button>
          </li>
        </ul>
      </div>

      <button id="menu-toggle" class="p-4 text-white bg-gray-800 md:hidden absolute top-4 left-4 z-10">
        <i class="fa-solid fa-bars"></i>
      </button>
    `;

    this.setupMobileMenu();
    this.setupDropdownToggles();
    this.setActiveClass();
  }

  setupMobileMenu() {
    this.querySelector("#menu-toggle")?.addEventListener("click", () => {
      this.querySelector(".w-64").classList.toggle("hidden");
    });
  }

  setupDropdownToggles() {
    const productToggle = this.querySelector("#product-toggle");
    const productMenu = this.querySelector("#product-menu");
    const projectToggle = this.querySelector("#project-toggle");
    const projectMenu = this.querySelector("#project-menu");
    const blogToggle = this.querySelector("#blog-toggle");
    const blogMenu = this.querySelector("#blog-menu");

    productToggle.addEventListener("click", () => {
      productMenu.classList.toggle("hidden");
    });

    projectToggle.addEventListener("click", () => {
      projectMenu.classList.toggle("hidden");
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
