class SpecialHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="fixed top-0 left-0 w-full bg-white shadow-lg z-50 transition-all duration-300">
        <nav class="border-b border-gray-200">
          <div class="container mx-auto flex justify-between items-center px-2 py-2">
            <a href="index.html" class="flex items-center space-x-0 font-serif italic group">
              <img src="./images/logo1.png" alt="Logo" class="w-30 h-16 transition-transform duration-300 group-hover:scale-105" />
            </a>

            <ul id="nav-menu" class="hidden md:flex space-x-10 items-center">
            <li><a href="about.html" class="nav-link relative text-gray-700 hover:text-blue-600 transition-colors duration-200">About</a></li>
              <li><a href="products.html" class="nav-link relative text-gray-700 hover:text-blue-600 transition-colors duration-200">Products</a></li>
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
  constructor() {
    super();
    this.products = [];
  }

  async connectedCallback() {
    await this.fetchProducts();
    this.render();
    this.activateCurrentFooterLink();
  }

  async fetchProducts() {
    try {
      // Replace with your actual API endpoint or database call
      const response = await fetch('/api/products');
      this.products = await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback products in case of error
      this.products = [
        { name: 'Modern Collections', href: 'modern' },
        { name: 'Classic Designs', href: 'classic' },
        { name: 'Custom Pieces', href: 'custom' },
        { name: 'Eco-Friendly Line', href: 'eco' },
        { name: 'Bespoke Solutions', href: 'bespoke' }
      ];
    }
  }

  render() {
    this.innerHTML = `
      <footer class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-gray-200 font-sans">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <!-- Branding Section -->
            <div class="space-y-6">
              <a href="/" class="group flex items-center gap-0 transform transition-transform duration-300 hover:scale-105" aria-label="ManuPlast Home">
                <img src="./images/logo1.png" alt="ManuPlast Logo" class="w-18 h-12 rounded-full shadow-lg object-cover">
                <h2 class="text-2xl font-bold text-white tracking-tight text-serif">MANU PLAST</h2>
              </a>
              <p class="text-gray-300 text-sm leading-relaxed max-w-xs">
               Crafting premium bottles and jars with innovation and sustainability.
              </p>
              <div class="flex space-x-4">
                <a href="https://www.instagram.com/manuplastco" target="_blank" class="text-gray-300 hover:text-blue-400 transition-colors duration-200" aria-label="Instagram">
                  <i class="fab fa-instagram text-xl"></i>
                </a>
                <a href="https://www.linkedin.com/company/manuplastco" target="_blank" class="text-gray-300 hover:text-blue-400 transition-colors duration-200" aria-label="LinkedIn">
                  <i class="fab fa-linkedin text-xl"></i>
                </a>
                <a href="https://www.facebook.com/manuplastco" target="_blank" class="text-gray-300 hover:text-blue-400 transition-colors duration-200" aria-label="LinkedIn">
                  <i class="fab fa-facebook-f text-lg"></i>
                </a>
              </div>
            </div>

            <!-- Products Section -->
            <div>
              <h3 class="text-xl font-bold text-white mb-4 relative">
                Products Category
                <span class="absolute bottom-0 left-0 w-10 h-1 bg-blue-500 rounded"></span>
              </h3>
              <ul class="space-y-3 text-gray-300 text-sm">
                ${this.products.map(product => `
                  <li>
                    <a href="${product.href}" class="footer-link hover:text-blue-400 hover:underline transition-all duration-200">
                      ${product.name}
                    </a>
                  </li>
                `).join('')}
              </ul>
            </div>

            <!-- Contact Info Section -->
            <div>
              <h3 class="text-xl font-bold text-white mb-4 relative">
                Contact Info
                <span class="absolute bottom-0 left-0 w-10 h-1 bg-blue-500 rounded"></span>
              </h3>
              <ul class="space-y-3 text-gray-300 text-sm">
                <li>
                  <a href="https://maps.google.com" target="_blank" class="flex items-center space-x-2 hover:text-blue-400 transition-all duration-200" aria-label="Our Location">
                    <i class="fas fa-map-marker-alt text-blue-500"></i>
                    <span>Palghar, Maharashtra – 401208, India</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+919833922750" class="flex items-center space-x-2 hover:text-blue-400 transition-all duration-200" aria-label="Phone Number">
                    <i class="fas fa-phone text-blue-500"></i>
                    <span>+91 9833922750</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:manuplast901@gmail.com" class="flex items-center space-x-2 hover:text-blue-400 transition-all duration-200" aria-label="Email Address">
                    <i class="fas fa-envelope text-blue-500"></i>
                    <span>manuplast901@gmail.com</span>
                  </a>
                </li>
                <li class="flex items-center space-x-2">
                  <i class="fas fa-clock text-blue-500"></i>
                  <span>Opening Hours: 10:00 - 18:00</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Footer Bottom -->
          <div class="mt-8 pt-6 border-t border-gray-600 text-center">
            <nav class="flex justify-center space-x-6 text-gray-300 text-sm mb-4">
              <a href="index.html" class="footer-link hover:text-blue-400 hover:underline transition-all duration-200">Home</a>
              <a href="products.html" class="footer-link hover:text-blue-400 hover:underline transition-all duration-200">Products</a>
              <a href="contact.html" class="footer-link hover:text-blue-400 hover:underline transition-all duration-200">Contact</a>
            </nav>
            <p class="text-gray-400 text-xs">© 2025 ManuPlast. All Rights Reserved.</p>
          </div>
        </div>

        <!-- Promotion Stripe -->
        <div class="bg-gray-900 py-3 text-gray-300 text-center border-t border-gray-700">
          <a href="https://vybtek.com/" target="_blank" class="flex items-center justify-center space-x-2 hover:text-blue-400 transition-all duration-200" aria-label="Created by VybTek">
            <span class="text-xs font-medium">Created by</span>
            <img src="https://vybtek.com/images/logo.png" alt="VybTek Logo" class="h-8">
            <span class="text-xs font-medium">VybTek IT Solutions</span>
          </a>
        </div>
      </footer>
    `;
  }

  activateCurrentFooterLink() {
    const footerLinks = this.querySelectorAll(".footer-link");
    const currentPath = window.location.pathname.split("/").pop() || "index.html";

    footerLinks.forEach(link => {
      const linkPath = link.getAttribute("href")?.split("/").pop() || "";
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
