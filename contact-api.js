/**
 * Contact Form API Handler
 * Handles form submission and WhatsApp integration for Manu Plast contact form
 * Updated to fix null value issues and improve error handling
 */

class ContactAPI {
  constructor() {
    this.apiEndpoint = 'https://api.vybtek.com/api/manuplast/contacts';
    this.whatsappNumber = '+916367885453';
    this.init();
  }

  /**
   * Initialize the contact form handlers
   */
  init() {
    this.bindFormSubmission();
    this.bindWhatsAppButton();
    this.initializeAnimations();
    this.setupNotificationSystem();
  }

  /**
   * Bind form submission event
   */
  bindFormSubmission() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (event) => this.handleFormSubmission(event));
    }
  }

  /**
   * Bind WhatsApp button click event
   */
  bindWhatsAppButton() {
    window.sendToWhatspp = () => this.sendToWhatsApp();
  }

  /**
   * Handle form submission
   * @param {Event} event - Form submission event
   */
  async handleFormSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    try {
      // Show loading state
      this.setLoadingState(submitButton, true);
      
      // Validate form
      if (!this.validateForm(form)) {
        return;
      }

      // Prepare form data
      const formData = {
        name: form.querySelector('[name="name"]').value.trim(),
        email: form.querySelector('[name="email"]').value.trim(),
        phone: form.querySelector('[name="phone"]').value.trim(),
        message: form.querySelector('[name="message"]').value.trim()
      };
      
      // Submit to API
      const response = await this.submitForm(formData);
      
      if (response.success) {
        this.showSuccessMessage('Message sent successfully! We will contact you soon.');
        form.reset();
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.showErrorMessage(error.message || 'Failed to submit form. Please try again.');
    } finally {
      // Remove loading state
      this.setLoadingState(submitButton, false);
    }
  }

  /**
   * Submit form data to API
   * @param {Object} formData - Form data to submit
   * @returns {Promise<Object>} API response
   */
  async submitForm(formData) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw new Error('Failed to connect to server. Please check your connection and try again.');
    }
  }

  /**
   * Validate form fields
   * @param {HTMLFormElement} form - Form element to validate
   * @returns {boolean} Validation result
   */
  validateForm(form) {
    const requiredFields = ['name', 'email', 'phone', 'message'];
    const errors = [];

    requiredFields.forEach(fieldName => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (!field || !field.value.trim()) {
        errors.push(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`);
        this.highlightField(field, true);
      } else {
        this.highlightField(field, false);
        
        // Field-specific validation
        if (fieldName === 'email' && !this.isValidEmail(field.value.trim())) {
          errors.push('Please enter a valid email address');
          this.highlightField(field, true);
        }
        
        if (fieldName === 'phone' && !this.isValidPhone(field.value.trim())) {
          errors.push('Please enter a valid phone number');
          this.highlightField(field, true);
        }
      }
    });

    if (errors.length > 0) {
      this.showValidationErrors(errors);
      return false;
    }

    return true;
  }

  /**
   * Check if email is valid
   * @param {string} email - Email to validate
   * @returns {boolean} Validation result
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if phone number is valid
   * @param {string} phone - Phone number to validate
   * @returns {boolean} Validation result
   */
  isValidPhone(phone) {
    // Basic international phone validation
    const phoneRegex = /^[+]?[0-9\s\-().]{10,20}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Highlight form field based on validation state
   * @param {HTMLElement} field - Field to highlight
   * @param {boolean} hasError - Whether field has error
   */
  highlightField(field, hasError) {
    if (!field) return;

    if (hasError) {
      field.classList.add('border-red-500', 'focus:ring-red-500');
      field.classList.remove('border-gray-200', 'focus:ring-accent-500');
    } else {
      field.classList.remove('border-red-500', 'focus:ring-red-500');
      field.classList.add('border-gray-200', 'focus:ring-accent-500');
    }
  }

  /**
   * Send message via WhatsApp
   */
  sendToWhatsApp() {
    const formData = this.getFormData();
    
    if (!this.validateFormData(formData)) {
      this.showErrorMessage('Please fill in all required fields before sending the message.');
      return;
    }

    const message = this.formatWhatsAppMessage(formData);
    const whatsappUrl = `https://wa.me/${this.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank')?.focus();
  }

  /**
   * Get form data as object
   * @returns {Object} Form data
   */
  getFormData() {
    return {
      name: document.getElementById('name')?.value.trim() || '',
      email: document.getElementById('email')?.value.trim() || '',
      phone: document.getElementById('phone')?.value.trim() || '',
      message: document.getElementById('message')?.value.trim() || ''
    };
  }

  /**
   * Validate form data for WhatsApp
   * @param {Object} formData - Form data to validate
   * @returns {boolean} Validation result
   */
  validateFormData(formData) {
    return Object.values(formData).every(value => value.length > 0);
  }

  /**
   * Format message for WhatsApp
   * @param {Object} formData - Form data
   * @returns {string} Formatted message
   */
  formatWhatsAppMessage(formData) {
    return `Hello! I'm interested in Manu Plast.

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}

Message: ${formData.message}

Thank you!`;
  }

  /**
   * Set loading state for submit button
   * @param {HTMLElement} button - Submit button
   * @param {boolean} isLoading - Loading state
   */
  setLoadingState(button, isLoading) {
    if (!button) return;

    if (isLoading) {
      button.disabled = true;
      button.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Sending...
      `;
    } else {
      button.disabled = false;
      button.textContent = 'Send Message';
    }
  }

  /**
   * Setup notification system
   */
  setupNotificationSystem() {
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.className = 'fixed top-4 right-4 space-y-2 z-50';
    document.body.appendChild(notificationContainer);
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccessMessage(message) {
    this.showNotification(message, 'success');
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showErrorMessage(message) {
    this.showNotification(message, 'error');
  }

  /**
   * Show validation errors
   * @param {Array} errors - Array of error messages
   */
  showValidationErrors(errors) {
    const message = 'Please fix the following errors:\n• ' + errors.join('\n• ');
    this.showNotification(message, 'error');
  }

  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, info)
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
      type === 'error' ? 'bg-red-500 text-white' : 
      type === 'success' ? 'bg-green-500 text-white' : 
      'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          ${type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : 
           type === 'success' ? '<i class="fas fa-check-circle"></i>' : 
           '<i class="fas fa-info-circle"></i>'}
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">${message}</p>
        </div>
      </div>
    `;
    
    const container = document.getElementById('notification-container') || document.body;
    container.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.classList.add('opacity-0');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  /**
   * Initialize animations and observers
   */
  initializeAnimations() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeIn');
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '50px'
    });

    // Observe sections for animation
    document.querySelectorAll('section > div').forEach(section => {
      observer.observe(section);
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ContactAPI();
});

// Export for module systems (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContactAPI;
}