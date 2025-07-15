/**
 * Contact Dashboard - Complete Implementation
 * With Safe Date Handling and All Features
 */
class ContactDashboard {
    constructor() {
        this.apiEndpoint = "https://api.vybtek.com/api/manuplast/contacts";
        this.contacts = [];
        this.filteredContacts = [];
        this.currentPage = 1;
        this.contactsPerPage = 10;
        this.authToken = localStorage.getItem("token");
        this.isFetching = false;
        this.init();
    }

    /**
     * Initialize the dashboard
     */
    init() {
        if (!this.checkAuth()) return;

        try {
            this.setupEventListeners();
            this.fetchContacts();
        } catch (error) {
            console.error("Initialization error:", error);
            this.showError("Failed to initialize dashboard");
        }
    }

    /**
     * Get a safe date object from contact data
     */
    getSafeDate(contact) {
        try {
            const dateStr = contact.created_at || contact.date || new Date();
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? new Date() : date;
        } catch (e) {
            return new Date();
        }
    }

    /**
     * Check authentication status
     */
    checkAuth() {
        if (!this.authToken) {
            this.showError("Authentication required. Please login.");
            setTimeout(() => (window.location.href = "/login"), 2000);
            return false;
        }
        return true;
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById("contact-search");
        if (searchInput) {
            searchInput.addEventListener("input", (e) =>
                this.debouncedSearch(e.target.value)
            );
        }

        // Filter functionality
        const filterSelect = document.getElementById("contact-filter");
        if (filterSelect) {
            filterSelect.addEventListener("change", (e) =>
                this.handleFilter(e.target.value)
            );
        }

        // Sort functionality
        const sortSelect = document.getElementById("contact-sort");
        if (sortSelect) {
            sortSelect.addEventListener("change", (e) =>
                this.handleSort(e.target.value)
            );
        }

        // Refresh buttons
        const refreshBtn = document.getElementById("refresh-contacts");
        if (refreshBtn) {
            refreshBtn.addEventListener("click", () => this.refreshContacts());
        }

        const refreshEmptyBtn = document.getElementById("refresh-empty");
        if (refreshEmptyBtn) {
            refreshEmptyBtn.addEventListener("click", () => this.refreshContacts());
        }

        // Export button
        const exportBtn = document.getElementById("export-contacts");
        if (exportBtn) {
            exportBtn.addEventListener("click", () => this.exportContacts());
        }

        // Modal close (click outside)
        const modal = document.getElementById("contact-modal");
        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) this.closeModal();
            });
        }
    }

    // Debounce search input
    debouncedSearch = this._debounce((term) => {
        this.handleSearch(term);
    }, 300);

    /**
     * Debounce helper function
     */
    _debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Make authorized API request
     */
    async makeAuthorizedRequest(url, method = "GET", body = null) {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.authToken}`,
        };

        const config = {
            method,
            headers,
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error("Session expired. Please login again.");
            }

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("API request error:", error);
            throw error;
        }
    }

    /**
     * Handle unauthorized state
     */
    handleUnauthorized() {
        localStorage.removeItem("token");
        this.showError("Your session has expired. Redirecting to login...");
        setTimeout(() => (window.location.href = "/login"), 2000);
    }

    /**
     * Show loading state
     */
    showLoading(isLoading) {
        const loadingElement = document.getElementById("contacts-loading");
        const containerElement = document.getElementById("contacts-container");
        const emptyElement = document.getElementById("contacts-empty");

        if (isLoading) {
            loadingElement?.classList.remove("hidden");
            containerElement?.classList.add("hidden");
            emptyElement?.classList.add("hidden");
        } else {
            loadingElement?.classList.add("hidden");
        }
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        const container = document.getElementById("contacts-container");
        const empty = document.getElementById("contacts-empty");

        container?.classList.add("hidden");
        empty?.classList.remove("hidden");
    }

    /**
     * Fetch contacts from API
     */
    async fetchContacts() {
        if (this.isFetching) return;
        this.isFetching = true;

        try {
            this.showLoading(true);

            const data = await this.makeAuthorizedRequest(this.apiEndpoint);
            this.contacts = Array.isArray(data) ? data : [];
            this.filteredContacts = [...this.contacts];

            this.updateStats();
            this.renderContacts();
            this.showSuccess("Contacts loaded successfully");
        } catch (error) {
            console.error("Error fetching contacts:", error);
            this.showError(
                error.message || "Failed to load contacts. Please try again."
            );
            this.showEmptyState();
        } finally {
            this.isFetching = false;
            this.showLoading(false);
        }
    }

    /**
     * Refresh contacts
     */
    async refreshContacts() {
        await this.fetchContacts();
    }

    /**
     * Handle search functionality
     */
    handleSearch(term) {
        const searchTerm = term.toLowerCase().trim();

        if (!searchTerm) {
            this.filteredContacts = [...this.contacts];
        } else {
            this.filteredContacts = this.contacts.filter(
                (contact) =>
                    contact.name?.toLowerCase().includes(searchTerm) ||
                    contact.email?.toLowerCase().includes(searchTerm) ||
                    contact.phone?.includes(searchTerm) ||
                    contact.message?.toLowerCase().includes(searchTerm)
            );
        }

        this.currentPage = 1;
        this.updateStats();
        this.renderContacts();
    }

    /**
     * Handle filter functionality
     */
    handleFilter(filter) {
        switch (filter) {
            case "recent":
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                this.filteredContacts = this.contacts.filter((contact) => {
                    const contactDate = this.getSafeDate(contact);
                    return contactDate >= oneWeekAgo;
                });
                break;
            case "email":
                this.filteredContacts = this.contacts.filter(
                    (contact) => contact.email
                );
                break;
            case "phone":
                this.filteredContacts = this.contacts.filter(
                    (contact) => contact.phone
                );
                break;
            default:
                this.filteredContacts = [...this.contacts];
        }

        this.currentPage = 1;
        this.updateStats();
        this.renderContacts();
    }

    /**
     * Handle sort functionality
     */
    handleSort(sort) {
        switch (sort) {
            case "oldest":
                this.filteredContacts.sort(
                    (a, b) => this.getSafeDate(a) - this.getSafeDate(b)
                );
                break;
            case "name":
                this.filteredContacts.sort((a, b) =>
                    (a.name || "").localeCompare(b.name || "")
                );
                break;
            default: // newest
                this.filteredContacts.sort(
                    (a, b) => this.getSafeDate(b) - this.getSafeDate(a)
                );
        }

        this.renderContacts();
    }

    /**
     * Update statistics display
     */
    updateStats() {
        // Total contacts
        const totalElement = document.getElementById("total-contacts");
        if (totalElement) totalElement.textContent = this.contacts.length;

        // Filtered contacts
        const filteredElement = document.getElementById("filtered-contacts");
        if (filteredElement)
            filteredElement.textContent = this.filteredContacts.length;

        // Today's contacts
        const todayElement = document.getElementById("today-contacts");
        if (todayElement) {
            const today = new Date().toISOString().split("T")[0];
            const todaysCount = this.contacts.filter((contact) => {
                try {
                    const contactDate = this.getSafeDate(contact);
                    return contactDate.toISOString().split("T")[0] === today;
                } catch (e) {
                    console.warn("Invalid contact date", contact);
                    return false;
                }
            }).length;
            todayElement.textContent = todaysCount;
        }
    }

    /**
     * Render contacts list
     */
    renderContacts() {
        const container = document.getElementById("contacts-list");
        if (!container) return;

        if (this.filteredContacts.length === 0) {
            this.showEmptyState();
            return;
        }

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.contactsPerPage;
        const endIndex = startIndex + this.contactsPerPage;
        const paginatedContacts = this.filteredContacts.slice(startIndex, endIndex);

        // Generate HTML for each contact
        container.innerHTML = paginatedContacts
            .map((contact) => this.renderContactCard(contact))
            .join("");

        // Render pagination
        this.renderPagination();

        // Show the container
        document.getElementById("contacts-container").classList.remove("hidden");
        document.getElementById("contacts-empty").classList.add("hidden");
    }

    /**
     * Render individual contact card
     */
    renderContactCard(contact) {
        const contactDate = this.getSafeDate(contact);
        const formattedDate = contactDate.toLocaleDateString();
        const formattedTime = contactDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
        const safeName = this.escapeHtml(contact.name || "No name provided");
        const safeMessage = contact.message
            ? this.escapeHtml(contact.message.substring(0, 200))
            : "";

        return `
      <div class="p-6 hover:bg-gray-50 transition-colors">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-800 mb-1">
              <i class="fas fa-user text-red-500 mr-2"></i>
              ${safeName}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mt-3">
              <div class="flex items-center">
                <i class="fas fa-envelope text-gray-400 mr-2 w-4"></i>
                <a href="mailto:${contact.email || "#"
            }" class="hover:text-red-500 transition-colors">
                  ${contact.email || "No email provided"}
                </a>
              </div>
              <div class="flex items-center">
                <i class="fas fa-phone text-gray-400 mr-2 w-4"></i>
                <a href="tel:${contact.phone || "#"
            }" class="hover:text-red-500 transition-colors">
                  ${contact.phone || "No phone provided"}
                </a>
              </div>
            </div>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-sm text-gray-500">${formattedDate}</span>
            <span class="text-xs text-gray-400">${formattedTime}</span>
          </div>
        </div>
        
        ${contact.message
                ? `
          <div class="mt-4 pt-4 border-t border-gray-200">
            <p class="text-sm text-gray-600 font-medium mb-1">
              <i class="fas fa-comment-alt text-gray-400 mr-2"></i>Message:
            </p>
            <p class="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
              ${safeMessage}${contact.message.length > 200 ? "..." : ""}
            </p>
          </div>
        `
                : ""
            }
        
        <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <div class="flex space-x-3">
            ${contact.phone
                ? `
              <button onclick="contactDashboard.callContact('${contact.phone
                }')" 
                class="text-blue-500 hover:text-blue-700 text-sm"
                title="Call">
                <i class="fas fa-phone mr-1"></i>Call
              </button>
              <button onclick="contactDashboard.whatsappContact('${contact.phone
                }', '${this.escapeHtml(contact.name)}')" 
                class="text-green-500 hover:text-green-700 text-sm"
                title="WhatsApp">
                <i class="fab fa-whatsapp mr-1"></i>WhatsApp
              </button>
            `
                : ""
            }
            ${contact.email
                ? `
              <button onclick="contactDashboard.emailContact('${contact.email}')" 
                class="text-purple-500 hover:text-purple-700 text-sm"
                title="Email">
                <i class="fas fa-envelope mr-1"></i>Email
              </button>
            `
                : ""
            }
          </div>
          <div class="flex space-x-3">
            <button onclick="contactDashboard.viewContactDetails('${contact.id || contact._id
            }')" 
              class="text-gray-600 hover:text-gray-800 text-sm"
              title="View Details">
              <i class="fas fa-eye mr-1"></i>View
            </button>
            <button onclick="contactDashboard.deleteContact('${contact.id || contact._id
            }')" 
              class="text-red-500 hover:text-red-700 text-sm"
              title="Delete">
              <i class="fas fa-trash mr-1"></i>Delete
            </button>
          </div>
        </div>
      </div>
    `;
    }

    /**
     * Render pagination controls
     */
    renderPagination() {
        const paginationContainer = document.getElementById("contacts-pagination");
        if (!paginationContainer) return;

        const totalPages = Math.ceil(
            this.filteredContacts.length / this.contactsPerPage
        );

        if (totalPages <= 1) {
            paginationContainer.innerHTML = "";
            return;
        }

        let paginationHTML = '<div class="flex justify-between items-center">';

        // Previous button
        paginationHTML += `
      <button onclick="contactDashboard.changePage(${this.currentPage - 1})" 
        ${this.currentPage === 1 ? "disabled" : ""}
        class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 ${this.currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }">
        <i class="fas fa-chevron-left mr-1"></i>Previous
      </button>
    `;

        // Page info
        paginationHTML += `
      <span class="text-sm text-gray-700">
        Page ${this.currentPage} of ${totalPages}
      </span>
    `;

        // Next button
        paginationHTML += `
      <button onclick="contactDashboard.changePage(${this.currentPage + 1})" 
        ${this.currentPage === totalPages ? "disabled" : ""}
        class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 ${this.currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }">
        Next <i class="fas fa-chevron-right ml-1"></i>
      </button>
    `;

        paginationHTML += "</div>";
        paginationContainer.innerHTML = paginationHTML;
    }

    /**
     * Change current page
     */
    changePage(page) {
        const totalPages = Math.ceil(
            this.filteredContacts.length / this.contactsPerPage
        );
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderContacts();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    /**
     * View contact details in modal
     */
    viewContactDetails(contactId) {
        const contact = this.contacts.find((c) => (c.id || c._id) === contactId);
        if (!contact) return;

        const contactDate = this.getSafeDate(contact);
        const formattedDateTime = contactDate.toLocaleString();

        const modalContent = `
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800">Contact Details</h3>
          <button onclick="contactDashboard.closeModal()" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-500">Name</label>
            <p class="mt-1 text-gray-800">${this.escapeHtml(
            contact.name || "Not provided"
        )}</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-500">Email</label>
              <p class="mt-1 text-gray-800">
                ${contact.email
                ? `<a href="mailto:${contact.email}" class="text-blue-500 hover:underline">${contact.email}</a>`
                : "Not provided"
            }
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Phone</label>
              <p class="mt-1 text-gray-800">
                ${contact.phone
                ? `<a href="tel:${contact.phone}" class="text-blue-500 hover:underline">${contact.phone}</a>`
                : "Not provided"
            }
              </p>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-500">Date</label>
            <p class="mt-1 text-gray-800">${formattedDateTime}</p>
          </div>
          
          ${contact.message
                ? `
            <div>
              <label class="block text-sm font-medium text-gray-500">Message</label>
              <div class="mt-1 p-3 bg-gray-50 rounded-md text-gray-800 whitespace-pre-wrap">${this.escapeHtml(
                    contact.message
                )}</div>
            </div>
          `
                : ""
            }
        </div>
        
        <div class="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
          ${contact.phone
                ? `
            <button onclick="contactDashboard.callContact('${contact.phone}')" 
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              <i class="fas fa-phone mr-2"></i>Call
            </button>
          `
                : ""
            }
          ${contact.email
                ? `
            <button onclick="contactDashboard.emailContact('${contact.email}')" 
              class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
              <i class="fas fa-envelope mr-2"></i>Email
            </button>
          `
                : ""
            }
          <button onclick="contactDashboard.closeModal()" 
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            Close
          </button>
        </div>
      </div>
    `;

        const modal = document.getElementById("contact-modal");
        modal.querySelector(".bg-white").innerHTML = modalContent;
        modal.classList.remove("hidden");
    }

    /**
     * Close modal
     */
    closeModal() {
        document.getElementById("contact-modal").classList.add("hidden");
    }

    /**
     * Call contact
     */
    callContact(phoneNumber) {
        if (phoneNumber) {
            window.open(`tel:${phoneNumber}`);
        } else {
            this.showError("No phone number available for this contact");
        }
    }

    /**
     * Email contact
     */
    emailContact(email) {
        if (email) {
            window.open(`mailto:${email}`);
        } else {
            this.showError("No email address available for this contact");
        }
    }

    /**
     * Open WhatsApp chat
     */
    whatsappContact(phoneNumber, name) {
        if (phoneNumber) {
            const cleanedNumber = phoneNumber.replace(/[^\d]/g, "");
            const message = `Hello ${name}, regarding your inquiry with Manu Plast...`;
            window.open(
                `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(message)}`
            );
        } else {
            this.showError("No phone number available for WhatsApp");
        }
    }

    /**
     * Delete contact
     */
    async deleteContact(contactId) {
        if (!confirm("Are you sure you want to delete this contact?")) return;

        try {
            const response = await this.makeAuthorizedRequest(
                `${this.apiEndpoint}/${contactId}`,
                "DELETE"
            );

            this.contacts = this.contacts.filter(
                (c) => (c.id || c._id) !== contactId
            );
            this.filteredContacts = this.filteredContacts.filter(
                (c) => (c.id || c._id) !== contactId
            );
            this.updateStats();
            this.renderContacts();
            this.showSuccess("Contact deleted successfully");
        } catch (error) {
            console.error("Error deleting contact:", error);
            this.showError("Failed to delete contact. Please try again.");
        }
    }

    /**
     * Export contacts to CSV
     */
    exportContacts() {
        if (this.filteredContacts.length === 0) {
            this.showError("No contacts to export");
            return;
        }

        try {
            const headers = ["Name", "Email", "Phone", "Message", "Date"];
            const csvRows = [headers.join(",")];

            this.filteredContacts.forEach((contact) => {
                const row = [
                    `"${(contact.name || "").replace(/"/g, '""')}"`,
                    `"${(contact.email || "").replace(/"/g, '""')}"`,
                    `"${(contact.phone || "").replace(/"/g, '""')}"`,
                    `"${(contact.message || "").replace(/"/g, '""')}"`,
                    `"${this.getSafeDate(contact).toISOString().split("T")[0]}"`,
                ];
                csvRows.push(row.join(","));
            });

            const csvContent = csvRows.join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute(
                "download",
                `manu-plast-contacts-${new Date().toISOString().split("T")[0]}.csv`
            );
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showSuccess("Contacts exported successfully");
        } catch (error) {
            console.error("Export error:", error);
            this.showError("Failed to export contacts");
        }
    }

    /**
     * Show success notification
     */
    showSuccess(message) {
        this.showNotification(message, "success");
    }

    /**
     * Show error notification
     */
    showError(message) {
        this.showNotification(message, "error");
    }

    /**
     * Show notification
     */
    showNotification(message, type) {
        const notification = document.createElement("div");
        notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`;
        notification.innerHTML = `
      <div class="flex items-center">
        <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
            } mr-2"></i>
        <span>${message}</span>
      </div>
    `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add(
                "opacity-0",
                "transition-opacity",
                "duration-300"
            );
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
        };
        return String(text).replace(/[&<>"']/g, (m) => map[m]);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    try {
        const dashboard = new ContactDashboard();

        // Make functions available globally for HTML onclick attributes
        window.contactDashboard = dashboard;
        window.callContact = (phone) => dashboard.callContact(phone);
        window.emailContact = (email) => dashboard.emailContact(email);
        window.whatsappContact = (phone, name) =>
            dashboard.whatsappContact(phone, name);
        window.viewContactDetails = (id) => dashboard.viewContactDetails(id);
        window.deleteContact = (id) => dashboard.deleteContact(id);
        window.changePage = (page) => dashboard.changePage(page);
        window.closeModal = () => dashboard.closeModal();
    } catch (error) {
        console.error("Dashboard initialization failed:", error);
        alert("Failed to initialize dashboard. Please try again.");
    }
});
