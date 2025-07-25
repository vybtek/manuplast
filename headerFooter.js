class SpecialHeader extends HTMLElement {
  constructor() {
    super();
    this.lastScrollPosition = 0;
    this.scrollThreshold = 50;
    this.mobileMenuOpen = false;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    document.body.classList.add("pt-20");
  }

  render() {
    this.innerHTML = `
      <header class="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-sm shadow-md z-50 transition-all duration-300" id="main-header">
        <nav class="border-b border-gray-200/50">
          <div class="container mx-auto flex justify-between items-center px-4 py-2">
            <a href="/" class="flex items-center space-x-0 font-serif italic group relative">
              <div class="absolute -inset-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img src="./images/logo1.png" alt="Logo" class="w-30 h-16 transition-all duration-500 group-hover:scale-105 z-10" />
            </a>

            <ul id="nav-menu" class="hidden md:flex space-x-6 items-center">
              <li><a href="about" class="nav-link relative px-3 py-2 text-gray-700 transition-all duration-200 group">
                <span>About</span>
                <span class="nav-underline"></span>
              </a></li>
              <li><a href="products" class="nav-link relative px-3 py-2 text-gray-700 transition-all duration-200 group">
                <span>Products</span>
                <span class="nav-underline"></span>
              </a></li>
              <li><a href="blog" class="nav-link relative px-3 py-2 text-gray-700 transition-all duration-200 group">
                <span>Blog</span>
                <span class="nav-underline"></span>
              </a></li>
              <li><a href="contact" class="nav-link relative px-3 py-2 text-gray-700 transition-all duration-200 group">
                <span>Contact</span>
                <span class="nav-underline"></span>
              </a></li>
            </ul>

            <button id="menu-toggle" class="md:hidden text-gray-700 text-2xl focus:outline-none p-2 rounded-full hover:bg-gray-100 transition-all duration-200" aria-expanded="false">
              <i class="fas fa-bars transition-all duration-200"></i>
            </button>
          </div>

          <div id="mobile-menu" class="hidden md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200/50 px-6 py-3 space-y-3 max-h-0 overflow-hidden transition-all duration-300">
            <a href="about" class="nav-link block py-3 px-4 rounded-lg transition-all duration-200 flex items-center">
              <span class="mobile-indicator"></span>
              <span>About</span>
            </a>
            <a href="products" class="nav-link block py-3 px-4 rounded-lg transition-all duration-200 flex items-center">
              <span class="mobile-indicator"></span>
              <span>Products</span>
            </a>
            <a href="blog" class="nav-link block py-3 px-4 rounded-lg transition-all duration-200 flex items-center">
              <span class="mobile-indicator"></span>
              <span>Blog</span>
            </a>
            <a href="contact" class="nav-link block py-3 px-4 rounded-lg transition-all duration-200 flex items-center">
              <span class="mobile-indicator"></span>
              <span>Contact</span>
            </a>
          </div>
        </nav>
      </header>
      <style>
        /* Active link styles */
        .nav-link.active {
          color: #3b82f6 !important;
          font-weight: 500;
        }
        .nav-link:not(.active) {
          color: #4b5563;
        }
        .nav-link:not(.active):hover {
          color: #3b82f6 !important;
        }
        
        /* Underline animation */
        .nav-underline {
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 0;
          height: 2px;
          background-color: #3b82f6;
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        .nav-link:hover .nav-underline,
        .nav-link.active .nav-underline {
          width: 100%;
          left: 0;
          transform: translateX(0);
        }
        
        /* Mobile indicator */
        .mobile-indicator {
          width: 8px;
          height: 8px;
          background-color: transparent;
          border-radius: 50%;
          margin-right: 12px;
          transition: all 0.3s ease;
        }
        .nav-link.active .mobile-indicator {
          background-color: #3b82f6;
        }
        
        /* Mobile menu animation */
        #mobile-menu.show {
          max-height: 500px;
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
        }
      </style>
    `;
  }

  setupEventListeners() {
    this.activateCurrentNavLink();
    this.setupMobileMenu();
    this.setupScrollBehavior();
    this.setupHoverEffects();
  }

  activateCurrentNavLink() {
    const navLinks = this.querySelectorAll(".nav-link");
    const currentPath =
      window.location.pathname.split("/").pop() || "index.html";
    const isHomePage = currentPath === "index.html" || currentPath === "";

    // First remove all active classes
    navLinks.forEach((link) =>
      link.classList.remove("active", "bg-blue-50/30")
    );

    // Then add to current active link
    navLinks.forEach((link) => {
      const linkPath = link.getAttribute("href").split("/").pop();
      const isActive = isHomePage
        ? linkPath === "index.html" ||
          link.getAttribute("href") === "./" ||
          link.getAttribute("href") === "/" ||
          link.getAttribute("href") === "index.html"
        : linkPath === currentPath;

      if (isActive) {
        link.classList.add("active");
        if (link.closest("#mobile-menu")) {
          link.classList.add("bg-blue-50/30");
        }
      }
    });
  }

  setupMobileMenu() {
    const menuToggle = this.querySelector("#menu-toggle");
    const mobileMenu = this.querySelector("#mobile-menu");

    menuToggle?.addEventListener("click", () => {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      mobileMenu.classList.toggle("hidden");
      mobileMenu.classList.toggle("show");
      menuToggle.setAttribute("aria-expanded", this.mobileMenuOpen);
      menuToggle.querySelector("i").classList.toggle("fa-bars");
      menuToggle.querySelector("i").classList.toggle("fa-times");
      document.body.style.overflow = this.mobileMenuOpen ? "hidden" : "";
    });

    this.querySelectorAll("#mobile-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        this.mobileMenuOpen = false;
        mobileMenu.classList.add("hidden");
        mobileMenu.classList.remove("show");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.querySelector("i").classList.add("fa-bars");
        menuToggle.querySelector("i").classList.remove("fa-times");
        document.body.style.overflow = "";
      });
    });
  }

  setupScrollBehavior() {
    const header = this.querySelector("#main-header");

    window.addEventListener("scroll", () => {
      const currentScrollPosition = window.pageYOffset;

      if (
        currentScrollPosition > this.lastScrollPosition &&
        currentScrollPosition > this.scrollThreshold
      ) {
        header.style.transform = "translateY(-100%)";
      } else {
        header.style.transform = "translateY(0)";
      }

      this.lastScrollPosition = currentScrollPosition;
    });
  }

  setupHoverEffects() {
    const logo = this.querySelector("img");
    logo?.addEventListener("mouseenter", () => {
      logo.classList.add("animate-pulse");
    });
    logo?.addEventListener("mouseleave", () => {
      logo.classList.remove("animate-pulse");
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
      const response = await fetch(
        "https://api.vybtek.com/api/manuplast/categories"
      );
      this.products = await response.json();
    } catch (error) {
      console.error("Error fetching categories:", error);
      this.products = [
        { name: "Modern Collections", href: "modern" },
        { name: "Classic Designs", href: "classic" },
        { name: "Custom Pieces", href: "custom" },
        { name: "Eco-Friendly Line", href: "eco" },
        { name: "Bespoke Solutions", href: "bespoke" },
      ];
    }
  }

  render() {
    this.innerHTML = `
      <footer class="relative bg-white shadow-md border-t-2 text-gray-800 font-sans overflow-hidden">
        <!-- Wave Divider -->

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <!-- Branding Section -->
            <div class="space-y-6 transform transition-transform duration-300 ">
              <a href="/" class="group flex items-center gap-3" aria-label="ManuPlast Home">
                <img src="./images/logo1.png" alt="ManuPlast Logo" class="w-18 h-14 object-cover">
                <h2 class="text-3xl font-extrabold text-red-700 tracking-tight">MANU PLAST</h2>
              </a>
              <p class="text-gray-600 text-sm leading-relaxed max-w-xs">
                Crafting premium, innovative, and sustainable hydration and storage solutions that elevate your daily living.
              </p>
              <div class="flex space-x-5">
                <a href="https://www.instagram.com/manuplastco" target="_blank" class="text-gray-600 hover:text-red-700 transition-colors duration-300" aria-label="Instagram">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.24 3.608-1.301 1.266-.058 1.646-.07 4.85-.07m0-2.163c-3.259 0-3.667.014-4.947.072-1.658.075-3.194.477-4.404 1.687-1.21 1.21-1.612 2.746-1.687 4.404-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.075 1.658.477 3.194 1.687 4.404 1.21 1.21 2.746 1.612 4.404 1.687 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.658-.075 3.194-.477 4.404-1.687 1.21-1.21 1.612-2.746 1.687-4.404.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.075-1.658-.477-3.194-1.687-4.404-1.21-1.21-2.746-1.612-4.404-1.687-1.28-.058-1.688-.072-4.947-.072z" /><path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8z" /><circle cx="18.406" cy="5.594" r="1.44" /></svg>
                </a>
                <a href="https://www.linkedin.com/company/manuplastco" target="_blank" class="text-gray-600 hover:text-red-700 transition-colors duration-300" aria-label="LinkedIn">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.024-3.037-1.848-3.037-1.85 0-2.132 1.446-2.132 2.94v5.666H9.359V9.005h3.415v1.56h.048c.476-.9 1.637-1.848 3.365-1.848 3.602 0 4.26 2.37 4.26 5.455v6.28zM5.337 7.433c-1.144 0-2.063-.93-2.063-2.077 0-1.147.92-2.078 2.063-2.078 1.143 0 2.062.931 2.062 2.078 0 1.147-.92 2.077-2.062 2.077zm1.777 13.019H3.56V9.005h3.554v11.447zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.225 0z" /></svg>
                </a>
                <a href="https://www.facebook.com/manuplastco" target="_blank" class="text-gray-600 hover:text-red-700 transition-colors duration-300" aria-label="Facebook">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
              </div>
            </div>

            <!-- Products Section -->
            <div>
              <h3 class="text-xl font-semibold text-red-700 mb-5 relative">
                Product Categories
                <span class="absolute bottom-0 left-0 w-12 h-0.5 bg-red-700 animate-width-expand-smooth"></span>
              </h3>
              <ul class="space-y-4 text-gray-600 text-sm">
                ${this.products
                  .map(
                    (product) => `
                  <li>
                    <a href="product-detail?id=${product.id}" class="footer-link hover:text-red-600 hover:translate-x-1 transition-all duration-300">
                      ${product.name}
                    </a>
                  </li>
                `
                  )
                  .join("")}
              </ul>
            </div>

            <!-- Contact Info Section -->
            <div>
              <h3 class="text-xl font-semibold text-red-700 mb-5 relative">
                Contact Info
                <span class="absolute bottom-0 left-0 w-12 h-0.5 bg-red-600 animate-width-expand-smooth"></span>
              </h3>
              <ul class="space-y-4 text-gray-600 text-sm">
                <li>
                  <p class="flex items-center space-x-3 hover:text-red-600 transition-all duration-300" aria-label="Our Location">
                    <svg class="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                    <span>Vasai, Maharashtra – 401208, India</span>
                  </p>
                </li>
                <li>
                  <a href="tel:+919833922750" class="flex items-center space-x-3 hover:text-red-600 transition-all duration-300" aria-label="Phone Number">
                    <svg class="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.2 2.2z" /></svg>
                    <span>+91 9833922750</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:manuplast901@gmail.com" class="flex items-center space-x-3 hover:text-red-600 transition-all duration-300" aria-label="Email Address">
                    <svg class="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                    <span>manuplast901@gmail.com</span>
                  </a>
                </li>
                <li class="flex items-center space-x-3">
                  <svg class="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" /></svg>
                  <span>Opening Hours: 10:00 - 18:00</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Footer Bottom -->
          <div class="mt-12 pt-8 border-t border-gray-300 text-center">
            <nav class="flex justify-center space-x-8 text-gray-600 text-sm mb-6">
              <a href="/" class="footer-link hover:text-red-600 hover:underline transition-all duration-300">Home</a>
              <a href="products" class="footer-link hover:text-red-600 hover:underline transition-all duration-300">Products</a>
              <a href="contact" class="footer-link hover:text-red-600 hover:underline transition-all duration-300">Contact</a>
            </nav>
            <p class="text-gray-500 text-xs">© 2025 ManuPlast. All Rights Reserved.</p>
          </div>
        </div>

        <!-- Promotion Stripe -->
        <div class="bg-red-600 py-2 text-white text-center">
          <a href="https://vybtek.com/" target="_blank" class="flex items-center justify-center space-x-3 hover:opacity-80 transition-all duration-300" aria-label="Created by VybTek">
            <span class="text-xs font-medium">Created by</span>
            <img src="https://vybtek.com/images/logo.png" alt="VybTek Logo" class="h-6">
            <span class="text-xs font-medium">VybTek IT Solutions</span>
          </a>
        </div>

        <!-- CSS for Animations -->
        <style>
          @keyframes width-expand-smooth {
            0% { width: 0; }
            100% { width: 3rem; }
          }
          .animate-width-expand-smooth {
            animation: width-expand-smooth 1s ease-out forwards;
          }
        </style>
      </footer>
    `;
  }

  activateCurrentFooterLink() {
    const footerLinks = this.querySelectorAll(".footer-link");
    const currentPath =
      window.location.pathname.split("/").pop() || "index.html";

    footerLinks.forEach((link) => {
      const linkPath = link.getAttribute("href")?.split("/").pop() || "";
      if (linkPath === currentPath) {
        link.classList.add("text-red-600", "font-semibold", "underline");
        link.classList.remove("text-gray-600");
      } else {
        link.classList.add("text-gray-600");
        link.classList.remove("text-red-600", "font-semibold", "underline");
      }
    });
  }
}

customElements.define("special-header", SpecialHeader);
customElements.define("special-footer", SpecialFooter);
