function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function confirmDelete(blogId) {
  if (confirm("Are you sure you want to delete this blog?")) {
    deleteBlog(blogId);
  }
}

function confirmToggleActive(blogId, currentStatus) {
  const action = currentStatus === "ACTIVE" ? "deactivate" : "activate";
  if (confirm(`Are you sure you want to ${action} this blog?`)) {
    toggleBlogActive(blogId, currentStatus);
  }
}

async function fetchBlogs(containerId = "blog-grid", view = "default") {
  const blogGrid = document.getElementById(containerId);
  if (!blogGrid) return;

  try {
    const response = await fetch("https://api.vybtek.com/api/manuplast/blogs");
    if (!response.ok) throw new Error("Failed to fetch blogs");
    const blogs = await response.json();
    blogGrid.innerHTML = "";

    blogs.forEach((blog) => {
      if (view === "default" && blog.status !== "ACTIVE") return;

      const blogCard = document.createElement("div");

      if (view === "dashboard") {
        blogCard.innerHTML = `
          <div class="bg-white p-4 rounded-lg shadow flex flex-col gap-2 sm:flex-row sm:items-center justify-between">
            <div class="flex items-center space-x-4">
              <img src="${blog.image}" alt="${
          blog.title
        }" class="w-20 h-20 object-cover rounded" />
              <div>
                <h4 class="font-semibold text-gray-800">${blog.title}</h4>
                <p class="text-sm text-gray-500 truncate max-w-xs">${
                  blog.content?.slice(0, 80) || ""
                }</p>
              </div>
            </div>
            <div class="flex gap-2 mt-2 sm:mt-0 flex-wrap">
              <button onclick="openBlogModal('edit', '${
                blog.id
              }')" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">Edit</button>
              <button onclick="confirmDelete('${
                blog.id
              }')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
              <button onclick="confirmToggleActive('${blog.id}', '${
          blog.status
        }')" class="${
          blog.status === "ACTIVE"
            ? "bg-yellow-500 hover:bg-yellow-600"
            : "bg-green-500 hover:bg-green-600"
        } text-white px-3 py-1 rounded text-sm">
                ${blog.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </button>
              <a href="blog-detail.html?id=${
                blog.id
              }&source=dashboard" class="bg-gray-200 text-black px-3 py-1 rounded text-sm">View</a>
            </div>
          </div>
        `;
      } else {
        blogCard.className =
          "flex flex-col md:flex-row gap-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden";

        blogCard.innerHTML = `
          <div class="md:w-1/3 w-full h-64 overflow-hidden">
            <img src="${blog.image}" alt="${
          blog.title
        }" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105">
          </div>
          <div class="md:w-2/3 w-full p-6 flex flex-col justify-between">
            <div>
              <div class="text-sm text-gray-400 mb-1">
                <span class="text-yellow-500 font-semibold">•</span> ${
                  blog.author
                }
              </div>
              <h3 class="text-2xl font-bold text-gray-800 hover:text-red-600 transition-colors duration-300 mb-2">
                ${blog.title}
              </h3>
              <p class="text-gray-600 text-sm leading-relaxed mb-4">
                ${blog.content.substring(0, 470)}...
              </p>
            </div>
            <div>
              <a href="blog-detail?id=${
                blog.id
              }" class="inline-block text-blue-600 hover:text-blue-800 text-sm font-semibold transition-all duration-300 underline-offset-2 hover:underline">
                Read More →
              </a>
            </div>
          </div>
        `;
      }

      blogGrid.appendChild(blogCard);
    });
  } catch (error) {
    blogGrid.innerHTML = `<p class="text-red-500">Error loading blogs: ${error.message}</p>`;
  }
}

async function fetchBlogDetail() {
  const blogId = getQueryParam("id");
  const detailContainer = document.getElementById("blog-detail");
  if (!blogId || !detailContainer) return;

  try {
    const response = await fetch(
      `https://api.vybtek.com/api/manuplast/blogs/${blogId}`
    );
    if (!response.ok) throw new Error("Blog not found");
    const blog = await response.json();
    const referrer = document.referrer;
    const isFromDashboard =
      referrer.includes("dashboard") ||
      referrer.includes("admin") ||
      getQueryParam("source") === "dashboard";

    if (blog.status !== "ACTIVE" && !isFromDashboard) {
      detailContainer.innerHTML = `<p class="text-red-500">This blog is not available.</p>`;
      return;
    }

    // Update page title and meta description
    document.title = `${blog.title} | Manu Plast Blog`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      const description = blog.content
        ? blog.content.replace(/\n/g, " ").substring(0, 160) +
          (blog.content.length > 160 ? "..." : "")
        : `Read the latest insights on sustainable drinkware from Manu Plast in our blog post: ${blog.title}.`;
      metaDescription.setAttribute("content", description);
    }

    // Optionally update Open Graph and Twitter Card meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector(
      'meta[name="twitter:description"]'
    );

    if (ogTitle) {
      ogTitle.setAttribute("content", `${blog.title} | Manu Plast Blog`);
    }
    if (ogDescription) {
      const description = blog.content
        ? blog.content.replace(/\n/g, " ").substring(0, 160) +
          (blog.content.length > 160 ? "..." : "")
        : `Read the latest insights on sustainable drinkware from Manu Plast in our blog post: ${blog.title}.`;
      ogDescription.setAttribute("content", description);
    }
    if (twitterTitle) {
      twitterTitle.setAttribute("content", `${blog.title} | Manu Plast Blog`);
    }
    if (twitterDescription) {
      const description = blog.content
        ? blog.content.replace(/\n/g, " ").substring(0, 160) +
          (blog.content.length > 160 ? "..." : "")
        : `Read the latest insights on sustainable drinkware from Manu Plast in our blog post: ${blog.title}.`;
      twitterDescription.setAttribute("content", description);
    }

    // Render the blog content
    detailContainer.innerHTML = `
      <div class="bg-white p-6 space-y-6 max-w-6xl mx-auto">
        <div class="text-sm text-gray-400 flex items-center gap-2">
          <span class="text-yellow-500 font-semibold tracking-wide">by ${blog.author}</span>
        </div>
        <h1 class="text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">${blog.title}</h1>
        <div class="overflow-hidden rounded-xl shadow-md">
          <img src="${blog.image}" alt="${blog.title}" class="w-full h-100 object-cover transition-transform duration-500 ease-in-out" />
        </div>
        <div class="prose prose-lg max-w-none text-gray-800">
          <p class="whitespace-pre-line">${blog.content}</p>
        </div>
      </div>
    `;
  } catch (error) {
    detailContainer.innerHTML = `<p class="text-red-500">Error loading blog: ${error.message}</p>`;
  }
}

async function toggleBlogActive(blogId, currentStatus) {
  const token = localStorage.getItem("token");
  const isActive = currentStatus === "ACTIVE";
  const newState = !isActive;

  try {
    const response = await fetch(
      `https://api.vybtek.com/api/manuplast/blogs/${blogId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: newState }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to update blog status: ${response.status} - ${errorText}`
      );
    }

    alert(`Blog ${isActive ? "deactivated" : "activated"} successfully!`);
    fetchBlogs("dashboard-blog-list", "dashboard");
  } catch (error) {
    console.error(error);
    alert("Failed to toggle blog status.");
  }
}

async function deleteBlog(blogId) {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      `https://api.vybtek.com/api/manuplast/blogs/${blogId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error("Failed to delete blog");
    alert("Blog deleted successfully!");
    fetchBlogs("dashboard-blog-list", "dashboard");
  } catch (error) {
    alert("Failed to delete blog.");
  }
}

function openBlogModal(mode, blogId = null) {
  const modal = document.getElementById("blog-modal");
  const form = document.getElementById("blog-form");
  const modalTitle = document.getElementById("modal-title");
  const submitText = document.getElementById("submit-text");
  const blogIdInput = document.getElementById("blog-id");
  const titleInput = document.getElementById("title");
  const authorInput = document.getElementById("author");
  const imageInput = document.getElementById("image");
  const existingImageInput = document.getElementById("existing-image");
  const contentInput = document.getElementById("content");
  const imagePreview = document.getElementById("image-preview");
  const previewImage = document.getElementById("preview-image");

  // Reset form and preview
  form.reset();
  imagePreview.classList.add("hidden");
  previewImage.src = "";
  blogIdInput.value = "";
  existingImageInput.value = "";

  if (mode === "edit" && blogId) {
    modalTitle.textContent = "Edit Blog Post";
    submitText.textContent = "Update Post";
    fetchBlogForUpdate(blogId);
  } else {
    modalTitle.textContent = "Create New Blog Post";
    submitText.textContent = "Publish Post";
  }

  modal.classList.remove("hidden");
}

function closeBlogModal() {
  const modal = document.getElementById("blog-modal");
  modal.classList.add("hidden");
}

async function fetchBlogForUpdate(blogId) {
  try {
    const response = await fetch(
      `https://api.vybtek.com/api/manuplast/blogs/${blogId}`
    );
    if (!response.ok) throw new Error("Failed to fetch blog");
    const blog = await response.json();

    document.getElementById("blog-id").value = blog.id;
    document.getElementById("title").value = blog.title;
    document.getElementById("author").value = blog.author;
    document.getElementById("content").value = blog.content;
    document.getElementById("existing-image").value = blog.image;
    const imagePreview = document.getElementById("image-preview");
    const previewImage = document.getElementById("preview-image");
    previewImage.src = blog.image;
    imagePreview.classList.remove("hidden");

    // Update character count
    const count = blog.content.length;
    document.getElementById(
      "char-count"
    ).textContent = `${count}/2000 characters`;
  } catch (error) {
    alert("Failed to load blog data.");
  }
}

document.getElementById("blog-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const blogId = document.getElementById("blog-id").value;
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const image = document.getElementById("image").files[0];
  const existingImage = document.getElementById("existing-image").value;
  const content = document.getElementById("content").value;
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("title", title);
  formData.append("author", author);
  formData.append("content", content);
  if (image) {
    formData.append("image", image);
  } else if (existingImage) {
    formData.append("existing-image", existingImage);
  }

  try {
    const url = blogId
      ? `https://api.vybtek.com/api/manuplast/blogs/${blogId}`
      : "https://api.vybtek.com/api/manuplast/blogs";
    const method = blogId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok)
      throw new Error(`Failed to ${blogId ? "update" : "add"} blog`);
    const result = await response.json();
    alert(
      result.message || `Blog ${blogId ? "updated" : "added"} successfully!`
    );
    closeBlogModal();
    fetchBlogs("dashboard-blog-list", "dashboard");
  } catch (error) {
    alert(`Failed to ${blogId ? "update" : "add"} blog.`);
  }
});

// Image preview functionality
document.getElementById("image")?.addEventListener("change", function (e) {
  const preview = document.getElementById("image-preview");
  const img = document.getElementById("preview-image");
  const file = e.target.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      img.src = e.target.result;
      preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  } else {
    img.src = document.getElementById("existing-image").value || "";
    preview.classList.toggle("hidden", !img.src);
  }
});

// Character count for content
document.getElementById("content")?.addEventListener("input", function (e) {
  const count = e.target.value.length;
  document.getElementById(
    "char-count"
  ).textContent = `${count}/2000 characters`;
});

// Auto-run
window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("blog-grid")) {
    fetchBlogs();
  } else if (document.getElementById("blog-detail")) {
    fetchBlogDetail();
  } else if (document.getElementById("dashboard-blog-list")) {
    fetchBlogs("dashboard-blog-list", "dashboard");
  }
});
