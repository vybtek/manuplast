class SpecialHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="fixed top-0 left-0 w-full bg-white shadow-lg z-50 transition-all duration-300">
        <nav class="border-b border-gray-200">
          <div class="container mx-auto flex justify-between items-center px-6 py-1">
            <a href="index.html" class="flex items-center space-x-3 group">
              <img src="./images/logo.png" alt="Logo" class="w-20 h-20 transition-transform duration-300 group-hover:scale-105" />
              <span class="text-2xl font-extrabold text-gray-900">MANU PLAST</span>
            </a>

            <ul id="nav-menu" class="hidden md:flex space-x-10 items-center">
            <li><a href="about.html" class="nav-link relative text-gray-700 hover:text-blue-600 transition-colors duration-200">About</a></li>
              <li><a href="products.html" class="nav-link relative text-gray-700 hover:text-blue-600 transition-colors duration-200">Products</a></li>
             <!-- <li><a href="services.html" class="nav-link relative text-gray-700 hover:text-blue-600 transition-colors duration-200">Services</a></li>  -->
             <!-- <li><a href="projects.html" class="nav-link relative text-gray-700 hover:text-blue-600 transition-colors duration-200">Projects</a></li> --> 
               <li><a href="blog.html" class="nav-link relative text-gray-700 hover:text-blue-600 transition-colors duration-200">Blog</a></li>
              <li><a href="contact.html" class="nav-link relative text-gray-700 hover:text-blue-600 transition-colors duration-200">Contact</a></li>
            </ul>

            <!-- Mobile Menu Button -->
            <button id="menu-toggle" class="md:hidden text-gray-900 text-2xl focus:outline-none">
              <i class="fas fa-bars transition-transform duration-200"></i>
            </button>
          </div>

          <!-- Mobile Menu -->
          <div id="mobile-menu" class="hidden md:hidden bg-gradient-to-b from-white to-gray-50 shadow-xl p-6 space-y-4 transform translate-y-[-100%] transition-transform duration-300">
            <a href="about.html" class="nav-link block text-gray-800 hover:bg-blue-50 hover:text-blue-600 py-3 px-4 rounded-lg transition-colors duration-200">About</a>
            <a href="products.html" class="nav-link block text-gray-800 hover:bg-blue-50 hover:text-blue-600 py-3 px-4 rounded-lg transition-colors duration-200">Products</a>
            <a href="blog.html" class="nav-link block text-gray-800 hover:bg-blue-50 hover:text-blue-600 py-3 px-4 rounded-lg transition-colors duration-200">Blog</a>
            <a href="contact.html" class="nav-link block text-gray-800 hover:bg-blue-50 hover:text-blue-600 py-3 px-4 rounded-lg transition-colors duration-200">Contact</a>
          </div>
        </nav>
      </header>
    `;

    document.body.classList.add("pt-20"); // Increased padding for larger header
    this.activateCurrentNavLink();
    this.setupMobileMenu();
  }

  activateCurrentNavLink() {
    const navLinks = this.querySelectorAll(
      "#nav-menu .nav-link, #mobile-menu .nav-link"
    );
    const currentPath =
      window.location.pathname.split("/").pop() || "index.html";

    navLinks.forEach((link) => {
      const linkPath = link.getAttribute("href")
        ? link.getAttribute("href").split("/").pop()
        : null;

      if (linkPath === currentPath) {
        link.classList.add("text-blue-600", "font-bold");
        link.classList.add(
          "after:content-['']",
          "after:absolute",
          "after:bottom-[-4px]",
          "after:left-0",
          "after:w-full",
          "after:h-[2px]",
          "after:bg-blue-600"
        );
      } else {
        link.classList.add("text-gray-700");
      }
    });
  }

  setupMobileMenu() {
    const menuToggle = this.querySelector("#menu-toggle");
    const mobileMenu = this.querySelector("#mobile-menu");

    menuToggle?.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      mobileMenu.classList.toggle("translate-y-0");
      mobileMenu.classList.toggle("translate-y-[-100%]");
      menuToggle.querySelector("i").classList.toggle("fa-bars");
      menuToggle.querySelector("i").classList.toggle("fa-times");
    });
  }
}

class SpecialFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 py-12 px-6 md:px-16 text-gray-200 font-sans">
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <!-- Branding Section -->
          <div class="space-y-6">
            <h2 class="text-4xl font-extrabold flex items-center gap-4 transform hover:scale-105 transition-transform duration-300">
              <img src="./images/logo.png" alt="ManuPlast Logo" class="w-14 h-14 rounded-full shadow-xl border-2 border-white bg-white" /> 
              <span class="text-white tracking-tight">MANU PLAST</span>
            </h2>
            <p class="text-gray-300 text-base leading-relaxed max-w-xs">
              Crafting timeless furniture designs with innovation and sustainability at heart.
            </p>
            <div class="flex space-x-4 mt-4">
              <a href="#" class="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                <i class="fab fa-instagram text-2xl"></i>
              </a>
              <a href="#" class="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                <i class="fab fa-twitter text-2xl"></i>
              </a>
              <a href="#" class="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                <i class="fab fa-linkedin text-2xl"></i>
              </a>
            </div>
          </div>

          <!-- Products Section -->
          <div>
            <h3 class="text-2xl font-bold text-white mb-6 relative">
              Products
              <span class="absolute bottom-0 left-0 w-12 h-1 bg-blue-500 rounded"></span>
            </h3>
            <ul class="space-y-4 text-gray-300 text-base">
              <li><a href="design" class="footer-link hover:text-blue-400 hover:underline transition-all duration-200">Modern Collections</a></li>
              <li><a href="marketing" class="footer-link hover:text-blue-400 hover:underline transition-all duration-200">Classic Designs</a></li>
              <li><a href="techsupport" class="footer-link hover:text-blue-400 hover:underline transition-all duration-200">Custom Pieces</a></li>
              <li><a href="outsourcing" class="footer-link hover:text-blue-400 hover:underline transition-all duration-200">Eco-Friendly Line</a></li>
              <li><a href="consultation" class="footer-link hover:text-blue-400 hover:underline transition-all duration-200">Bespoke Solutions</a></li>
            </ul>
          </div>

          <!-- Contact Info Section -->
          <div>
            <h3 class="text-2xl font-bold text-white mb-6 relative">
              Contact Info
              <span class="absolute bottom-0 left-0 w-12 h-1 bg-blue-500 rounded"></span>
            </h3>
            <ul class="space-y-4 text-gray-300 text-base">
              <li>
                <a href="#" target="_blank" class="flex items-center space-x-3 hover:text-blue-400 transition-all duration-200">
                  <i class="fas fa-map-marker-alt text-blue-500 text-lg"></i>
                  <span>Udaipur, Rajasthan 313001</span>
                </a>
              </li>
              <li>
                <a href="tel:+910000000000" class="flex items-center space-x-3 hover:text-blue-400 transition-all duration-200">
                  <i class="fas fa-phone text-blue-500 text-lg"></i>
                  <span>+91 0000000000</span>
                </a>
              </li>
              <li>
                <a href="mailto:manuplast901@gmail.com" class="flex items-center space-x-3 hover:text-blue-400 transition-all duration-200">
                  <i class="fas fa-envelope text-blue-500 text-lg"></i>
                  <span>manuplast901@gmail.com</span>
                </a>
              </li>
              <li class="flex items-center space-x-3">
                <i class="fas fa-clock text-blue-500 text-lg"></i>
                <span>Opening Hours: 10:00 - 18:00</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Footer Bottom -->
        <div class="mt-12 pt-8 border-t border-gray-600 text-center">
          <div class="flex justify-center space-x-8 text-gray-300 text-base mb-6">
            <a href="index" class="footer-link hover:text-blue-400 hover:underline transition-all duration-200">Home</a>
            <a href="products" class="footer-link hover:text-blue-400 hover:underline transition-all duration-200">Products</a>
            <a href="contact" class="footer-link hover:text-blue-400 hover:underline transition-all duration-200">Contact</a>
          </div>
          <p class="text-gray-400 text-sm">© 2025 ManuPlast. All Rights Reserved.</p>
        </div>
      </footer>
      <!-- Promotion Stripe -->
      <div class="bg-gray-900 py-4 text-gray-300 text-center border-t border-gray-700">
        <div class="container flex items-center justify-center">
          <a href="https://vybtek.com/" target="_blank" class="flex items-center space-x-3 hover:text-blue-400 transition-all duration-200">
            <span class="text-sm font-medium">Created by</span>
            <img src="https://vybtek.com/images/logo.png" alt="VybTek Logo" class="h-10">
            <span class="text-sm font-medium">VybTek IT Solutions</span>
          </a>
        </div>
      </div>
    `;

    this.activateCurrentFooterLink();
  }

  activateCurrentFooterLink() {
    const footerLinks = this.querySelectorAll(".footer-link");
    const currentPath =
      window.location.pathname.split("/").pop() || "index.html";

    footerLinks.forEach((link) => {
      const linkPath = link.getAttribute("href")
        ? link.getAttribute("href").split("/").pop()
        : null;

      if (linkPath === currentPath) {
        link.classList.add("text-blue-400", "font-semibold", "underline");
        link.classList.remove("text-gray-300");
      } else {
        link.classList.add("text-gray-300");
        link.classList.remove("text-blue-400", "font-semibold", "underline");
      }
    });
  }
}

customElements.define("special-header", SpecialHeader);
customElements.define("special-footer", SpecialFooter);
