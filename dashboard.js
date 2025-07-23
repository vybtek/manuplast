class DashboardManager {
  constructor() {
    this.isLoading = false;
    this.chartInstance = null;
    this.init();
  }

  init() {
    this.fetchDashboardData();
  }

  async fetchWithTimeout(url, options, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error.name === "AbortError"
        ? new Error("Request timed out")
        : error;
    }
  }

  async fetchDashboardData() {
    const totalProductsElement = document.getElementById("total-products");
    const recentProductsElement = document.getElementById("recent-products");
    const mostViewedProductsElement = document.getElementById(
      "most-viewed-products"
    );
    const chartElement = document.getElementById("products-chart");

    if (!totalProductsElement || !recentProductsElement || !chartElement) {
      console.error("Required DOM elements not found:", {
        totalProductsElement,
        recentProductsElement,
        chartElement,
      });
      this.renderError(
        "Dashboard elements missing",
        totalProductsElement,
        recentProductsElement,
        chartElement
      );
      return;
    }

    this.showLoadingState(
      totalProductsElement,
      recentProductsElement,
      chartElement
    );
    this.isLoading = true;

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No authentication token found, redirecting to login");
      window.location.href = "login.html";
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    let totalCount = 0;
    let recentProducts = [];
    let categories = [];
    let productCounts = {};

    try {
      // Fetch total products
      try {
        console.debug("Fetching total products...");
        const response = await this.fetchWithTimeout(
          `https://api.vybtek.com/api/manuplast/producttypes`,
          { headers }
        );
        if (response.ok) {
          const data = await response.json();
          totalCount = (Array.isArray(data) ? data : data.data || []).length;
          console.debug("Total products:", totalCount);
        }
      } catch (error) {
        console.warn("Total products fetch failed:", error.message);
      }

      // Fetch recent products
      try {
        console.debug("Fetching recent products...");
        const response = await this.fetchWithTimeout(
          `https://api.vybtek.com/api/manuplast/producttypes?sort_by=created_at&order=desc&limit=2&_=${Date.now()}`,
          { headers }
        );
        if (response.ok) {
          const data = await response.json();
          recentProducts = Array.isArray(data) ? data : data.data || [];
          // Validate and sort products
          recentProducts = recentProducts
            .filter(p => p.created_at)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          console.debug("Recent products after validation:", recentProducts.map(p => ({
            id: p.id,
            name: p.name,
            created_at: p.created_at
          })));
        }
      } catch (error) {
        console.warn("Recent products fetch failed:", error.message);
      }

      // Fetch most viewed products
      try {
        console.debug("Fetching most viewed products...");
        const response = await this.fetchWithTimeout(
          `https://api.vybtek.com/api/manuplast/producttypes?sort_by=views&order=desc&limit=5`,
          { headers }
        );
        if (response.ok) {
          const data = await response.json();
          mostViewedProducts = Array.isArray(data) ? data : data.data || [];
          console.debug("Most viewed products:", mostViewedProducts);
        }
      } catch (error) {
        console.warn("Most viewed products fetch failed:", error.message);
      }

      // Fetch categories and product counts
      try {
        console.debug("Fetching categories...");
        const response = await this.fetchWithTimeout(
          `https://api.vybtek.com/api/manuplast/categories`,
          { headers }
        );
        if (response.ok) {
          const data = await response.json();
          categories = Array.isArray(data) ? data : data.data || [];
          console.debug("Categories:", categories);
          productCounts = await this.fetchProductCounts(categories, headers);
        }
      } catch (error) {
        console.warn("Categories fetch failed:", error.message);
      }

      // Render data
      this.renderTotalProducts(totalCount, totalProductsElement);
      this.renderRecentProducts(recentProducts, recentProductsElement);
      this.renderProductChart(categories, productCounts, chartElement);
    } catch (error) {
      console.error("Unexpected error in fetchDashboardData:", error);
      this.renderError(
        `Failed to load dashboard: ${error.message}`,
        totalProductsElement,
        recentProductsElement,
        chartElement
      );
    } finally {
      this.isLoading = false;
    }
  }

  async fetchProductCounts(categories, headers) {
    const productCounts = {};
    for (const category of categories) {
      if (!category.id) {
        console.warn(`Skipping category with missing ID:`, category);
        productCounts[category.id || `unknown-${Math.random()}`] = 0;
        continue;
      }
      try {
        console.debug(
          `Fetching products for category ${category.id} (${category.name})...`
        );
        const response = await this.fetchWithTimeout(
          `https://api.vybtek.com/api/manuplast/producttypes?category_id=${category.id}`,
          { headers }
        );
        if (response.ok) {
          const data = await response.json();
          const products = Array.isArray(data) ? data : data.data || [];
          // Verify products belong to the category
          const filteredProducts = products.filter(
            (product) =>
              product.category_id === category.id ||
              product.category?.id === category.id
          );
          productCounts[category.id] = filteredProducts.length;
          console.debug(
            `Product count for category ${category.id} (${category.name}): ${
              productCounts[category.id]
            }`,
            filteredProducts
          );
        } else {
          console.warn(
            `Failed to fetch products for category ${category.id}: ${response.status}`
          );
          productCounts[category.id] = 0;
        }
      } catch (error) {
        console.warn(
          `Product count fetch failed for category ${category.id}:`,
          error.message
        );
        productCounts[category.id] = 0;
      }
    }
    return productCounts;
  }

  showLoadingState(...elements) {
    elements.forEach((element) => {
      if (!element) return;
      if (element.id === "products-chart") {
        const existingLoading =
          element.parentElement.querySelector(".chart-loading");
        if (!existingLoading) {
          const loadingDiv = document.createElement("div");
          loadingDiv.className = "chart-loading text-gray-600 text-center py-4";
          loadingDiv.textContent = "Loading chart...";
          element.parentElement.insertBefore(loadingDiv, element);
        }
        element.style.display = "none";
      } else {
        element.innerHTML = `<p class="text-gray-600 py-4">Loading...</p>`;
      }
    });
  }

  renderTotalProducts(count, element) {
    if (element) element.textContent = count || 0;
  }

  renderRecentProducts(products, element) {
    if (!element) return;
    if (!Array.isArray(products) || products.length === 0) {
      element.innerHTML = `<p class="text-gray-600 py-4">No recently added products.</p>`;
      return;
    }

    console.debug("Rendering recent products:", products.map(p => ({
      id: p.id,
      name: p.name,
      created_at: p.created_at
    })));

    const params = new URLSearchParams(window.location.search);
    const categoryId =
      params.get("category_id") ||
      products[0]?.category?.id ||
      products[0]?.category_id ||
      "";

    element.innerHTML = `
      <ul role="list" aria-label="Recently Added Products List" class="space-y-4">
        ${products
          .slice(0, 2)
          .map(
            (product) => `
          <li class="flex items-center py-3 border-l-4 border-indigo-500 hover:bg-gray-50 transition-all duration-300 rounded-lg px-4">
            <i class="fas fa-box mr-3 text-indigo-600"></i>
            <a href="type-detail.html?id=${
              product.id || ""
            }&category_id=${categoryId}" class="text-indigo-600 hover:underline font-medium">${
              product.name || "Unnamed Product"
            } (Added: ${product.created_at || "Unknown"})</a>
          </li>
        `
          )
          .join("")}
      </ul>
    `;
  }

  renderProductChart(categories, productCounts, chartElement) {
    if (!chartElement) {
      console.error("Chart element not found");
      return;
    }

    const loadingDiv =
      chartElement.parentElement.querySelector(".chart-loading");
    if (loadingDiv) {
      loadingDiv.remove();
    }
    chartElement.style.display = "block";

    const ctx = chartElement.getContext("2d");
    if (!ctx) {
      console.error("Chart canvas context not available");
      chartElement.parentElement.innerHTML = `<p class="text-red-600 text-center py-4">Error: Unable to render chart.</p>`;
      return;
    }

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const validCategories = categories.filter(
      (category) => category.id && category.name
    );
    const labels = validCategories.map((category) => category.name);
    const data = validCategories.map(
      (category) => productCounts[category.id] || 0
    );

    if (labels.length === 0) {
      chartElement.parentElement.innerHTML = `<p class="text-gray-600 text-center py-4">No categories available to display.</p>`;
      return;
    }

    this.chartInstance = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              "rgba(59, 130, 246, 0.6)", // Blue-600
              "rgba(34, 197, 94, 0.6)", // Emerald-600
              "rgba(234, 179, 8, 0.6)", // Yellow-600
              "rgba(239, 68, 68, 0.6)", // Red-600
              "rgba(168, 85, 247, 0.6)", // Purple-600
            ],
            borderColor: [
              "rgba(59, 130, 246, 1)",
              "rgba(34, 197, 94, 1)",
              "rgba(234, 179, 8, 1)",
              "rgba(239, 68, 68, 1)",
              "rgba(168, 85, 247, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "#1F2937",
              font: { size: 12 },
            },
          },
          tooltip: {
            backgroundColor: "#1F2937",
            titleColor: "#FFFFFF",
            bodyColor: "#FFFFFF",
            titleFont: { size: 12 },
            bodyFont: { size: 12 },
          },
        },
      },
    });
    console.debug(
      "Chart rendered successfully with",
      labels.length,
      "categories:",
      data
    );
  }

  renderError(message, ...elements) {
    elements.forEach((element) => {
      if (!element) return;
      if (element.id === "products-chart") {
        const loadingDiv =
          element.parentElement.querySelector(".chart-loading");
        if (loadingDiv) loadingDiv.remove();
        element.parentElement.innerHTML = `
          <div class="text-red-600 text-center py-4">
            <i class="fas fa-exclamation-circle mr-2"></i>
            Error: ${message}
          </div>`;
        const canvas = document.createElement("canvas");
        canvas.id = "products-chart";
        canvas.className = "w-full h-full";
        element.parentElement.appendChild(canvas);
      } else {
        element.innerHTML = `
          <div class="text-red-600 py-4">
            <i class="fas fa-exclamation-circle mr-2"></i>
            Error: ${message}
          </div>`;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.debug("Initializing DashboardManager...");
  new DashboardManager();
});

function logout() {
  console.debug("Logging out...");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("token");
  window.location.href = "login.html";
}