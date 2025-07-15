(function () {
  // Prevent multiple injections
  if (document.querySelector('.floating-whatsapp')) {
    return; // Exit if the WhatsApp component is already injected
  }

  // Inject HTML for WhatsApp button and chat box
  const whatsappHTML = `
    <div class="floating-whatsapp">
      <div class="notification">1</div>
       <div class="whatsapp-button">
        <svg
          class="whatsapp-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
        >
          <path
            d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"
          />
        </svg>
      </div>
      <div class="chat-box">
        <div class="chat-header">
          <div class="header-info">
            <p class="account-name">Manu Plast</p>
            <p class="status-message">Typically replies within 30 min</p>
          </div>
          <button class="close-button">×</button>
        </div>
        <div class="chat-body">
          <div class="message">Hello! How can we assist you today?</div>
        </div>
        <div class="chat-footer">
          <input type="text" class="chat-input" placeholder="Type a message..."/>
          <button class="send-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // Inject CSS styles
  const style = document.createElement('style');
  style.textContent = `
    .floating-whatsapp {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    }
    .whatsapp-button {
      width: 50px;
      height: 50px;
      background-color: #25d366;
      border-radius: 50%;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.28);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
    }
    .whatsapp-button:hover {
      background-color: #1ea952;
      transform: scale(1.1);
    }
    .whatsapp-icon {
      width: 32px;
      height: 32px;
      fill: white;
    }
    .chat-box {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 300px;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      transform-origin: bottom right;
      transform: scale(0);
      opacity: 0;
      transition: all 0.3s;
    }
    .chat-box.active {
      transform: scale(1);
      opacity: 1;
    }
    .chat-header {
      background-color: #075e54;
      color: white;
      padding: 15px;
      display: flex;
      align-items: center;
    }
    .header-info {
      flex-grow: 1;
    }
    .account-name {
      font-weight: 600;
      margin: 0;
      font-size: 14px;
    }
    .status-message {
      font-size: 11px;
      margin: 2px 0 0 0;
      opacity: 0.75;
    }
    .close-button {
      background: transparent;
      border: none;
      color: white;
      font-size: 22px;
      cursor: pointer;
      padding: 0 8px;
      line-height: 1;
    }
    .chat-body {
      padding: 15px;
      background-color: #e5ddd5;
      height: 250px;
      overflow-y: auto;
    }
    .message {
      background-color: white;
      padding: 8px 10px;
      font-size: 13px;
      border-radius: 7px;
      margin-bottom: 8px;
      max-width: 80%;
      position: relative;
      line-height: 1.4;
    }
    .message:after {
      content: "";
      position: absolute;
      right: -8px;
      top: 10px;
      border: 8px solid transparent;
      border-right-color: white;
      border-left: 0;
    }
    .chat-footer {
      display: flex;
      padding: 10px;
      background-color: #f0f0f0;
    }
    .chat-input {
      flex-grow: 1;
      border: none;
      border-radius: 20px;
      padding: 8px 12px;
      margin-left: 8px;
      font-size: 13px;
    }
    .send-button {
      background-color: #25d366;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .send-button svg {
      width: 18px;
      height: 18px;
    }
    .notification {
      position: absolute;
      top: -10px;
      right: -5px;
      background-color: #ff3b30;
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
      opacity: 0;
      transform: scale(0);
      transition: all 0.3s;
    }
    .notification.active {
      opacity: 1;
      transform: scale(1);
    }
    @media (max-width: 480px) {
      .chat-box {
        width: calc(100vw - 40px);
        right: -10px;
      }
    }
    .chat-box,
    .chat-box * {
      font-family: "Segoe UI", sans-serif;
      font-size: 13px;
    }
  `;
  document.head.appendChild(style);

  // Inject HTML into the body
  const div = document.createElement('div');
  div.innerHTML = whatsappHTML;
  document.body.appendChild(div);

  // JavaScript functionality
  function initializeWhatsApp() {
    const whatsappButton = document.querySelector(".whatsapp-button");
    const chatBox = document.querySelector(".chat-box");
    const closeButton = document.querySelector(".close-button");
    const notification = document.querySelector(".notification");
    const sendButton = document.querySelector(".send-button");
    const chatInput = document.querySelector(".chat-input");

    // Check if all required elements exist
    if (!whatsappButton || !chatBox || !closeButton || !notification || !sendButton || !chatInput) {
      console.error("WhatsApp button: One or more required DOM elements are missing.");
      return;
    }

    // Show notification after a delay
    setTimeout(() => {
      notification.classList.add("active");
    }, 3000);

    // Toggle chat box on button click
    whatsappButton.addEventListener("click", function () {
      chatBox.classList.toggle("active");
      notification.classList.remove("active");
    });

    // Close chat box
    closeButton.addEventListener("click", function () {
      chatBox.classList.remove("active");
    });

    // Open WhatsApp on send
    sendButton.addEventListener("click", function () {
      const message = chatInput.value.trim();
      if (message) {
        const phoneNumber = "+919833922750"; // Replace with your phone number
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
        chatInput.value = ""; // Clear input after sending
      }
    });

    // Open WhatsApp when pressing Enter in the input
    chatInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        sendButton.click();
      }
    });
  }

  // Ensure DOM is fully loaded before initializing
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeWhatsApp);
  } else {
    initializeWhatsApp();
  }
})();