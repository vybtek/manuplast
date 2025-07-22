class SpecialSidebar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="w-64 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-lg text-white p-6 fixed h-full transform transition-transform duration-300 ease-in-out md:translate-x-0 -translate-x-full md:flex flex-col z-20 shadow-2xl border-r border-gray-700/30">
        <h2 class="text-2xl font-extrabold mb-8 cursor-pointer flex items-center gap-3 hover:text-indigo-400 transition-colors duration-200 group relative" onclick="window.location.href='dashboard'">
          <i class="fa-solid fa-house text-indigo-400 group-hover:scale-110 transition-transform duration-200"></i> 
          Dashboard
          <span class="absolute left-0 bottom-0 h-0.5 w-0 bg-indigo-400 transition-all duration-300 group-hover:w-full"></span>
        </h2>
        <ul class="flex-1 space-y-2">
          <li class="mb-4" id="product-item">
            <div class="block p-4 bg-gray-800/50 rounded-xl w-full cursor-pointer hover:bg-indigo-700/60 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5" id="product-toggle">
              <i class="fa-solid fa-chair mr-2 text-indigo-400"></i>Product
            </div>
            <div class="hidden mt-2 space-y-2 pl-6" id="product-menu">
           
              <a href="category-list" class="block px-4 py-2 bg-gray-700/40 rounded-lg hover:bg-indigo-600/50 transition-all duration-200 hover:pl-6">
                <i class="fa-solid fa-eye mr-2 text-indigo-400"></i>View Category
              </a>
               <a href="product-list" class="block px-4 py-2 bg-gray-700/40 rounded-lg hover:bg-indigo-600/50 transition-all duration-200 hover:pl-6">
                <i class="fa-solid fa-eye mr-2 text-indigo-400"></i>View Products
              </a>
            </div>
          </li>

          <li class="mb-4" id="blog-item">
            <div class="block p-4 bg-gray-800/50 rounded-xl w-full cursor-pointer hover:bg-indigo-700/60 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5" id="blog-toggle">
              <i class="fa-solid fa-cubes mr-2 text-indigo-400"></i>Blog
            </div>
            <div class="hidden mt-2 space-y-2 pl-6" id="blog-menu">
              <a href="blog-list" class="block px-4 py-2 bg-gray-700/40 rounded-lg hover:bg-indigo-600/50 transition-all duration-200 hover:pl-6">
                <i class="fa-solid fa-eye mr-2 text-indigo-400"></i>View Blogs
              </a>
            </div>
          </li>

          <li class="mb-4" id="contact-item">
            <div class="block p-4 bg-gray-800/50 rounded-xl w-full cursor-pointer hover:bg-indigo-700/60 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5" id="contact-toggle">
              <i class="fa-solid fa-address-book mr-2 text-indigo-400"></i>Contacts
            </div>
            <div class="hidden mt-2 space-y-2 pl-6" id="contact-menu">
              <a href="contact-list" class="block px-4 py-2 bg-gray-700/40 rounded-lg hover:bg-indigo-600/50 transition-all duration-200 hover:pl-6">
                <i class="fa-solid fa-eye mr-2 text-indigo-400"></i>View Contacts
              </a>
            </div>
          </li>
        </ul>

        <button onclick="logout()" class="w-full mt-6 bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
          <i class="fa-solid fa-right-from-bracket text-white"></i> Logout
        </button>
      </div>

      <button id="menu-toggle" class="p-3 text-white bg-gradient-to-r from-indigo-600 to-indigo-700 md:hidden fixed top-4 left-4 z-30 rounded-full shadow-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200">
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
    const contactToggle = this.querySelector("#contact-toggle");
    const contactMenu = this.querySelector("#contact-menu");

    productToggle.addEventListener("click", () => {
      productMenu.classList.toggle("hidden");
    });
    blogToggle.addEventListener("click", () => {
      blogMenu.classList.toggle("hidden");
    });
    contactToggle.addEventListener("click", () => {
      contactMenu.classList.toggle("hidden");
    });
  }
}

customElements.define("special-sidebar", SpecialSidebar);

function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "login";
}
  //  <a href="add-product.html" class="block px-4 py-2 bg-gray-700/40 rounded-lg hover:bg-indigo-600/50 transition-all duration-200 hover:pl-6">
  //               <i class="fa-solid fa-plus mr-2 text-indigo-400"></i>Add Product
  //             </a>