// Helper to get query parameters

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);

  return urlParams.get(name);
}

// Confirmation wrappers

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

// Main function to fetch blogs

async function fetchBlogs(containerId = "blog-grid", view = "default") {
  const blogGrid = document.getElementById(containerId);

  if (!blogGrid) return;

  try {
    const response = await fetch(
      "https://api.vybtek.com/api/manuplast/blogs"
    );

    if (!response.ok) throw new Error("Failed to fetch blogs");

    const blogs = await response.json();

    blogGrid.innerHTML = "";

    blogs.forEach((blog) => {
      if (view === "default" && blog.status !== "ACTIVE") return;

      const blogCard = document.createElement("div");

      blogCard.classList.add("bg-white", "rounded-lg", "overflow-hidden");

      if (view === "dashboard") {
        blogCard.innerHTML = `
<div class="bg-white p-4 rounded-lg shadow flex flex-col gap-2 sm:flex-row sm:items-center justify-between">
<div class="flex items-center space-x-4">
<img src="${blog.image}" alt="${
          blog.title
        }" class="w-20 h-20 object-cover rounded" />
<div>
<h4 class="font-semibold text-gray-800">${blog.title}</h4>
<p class="text-sm text-gray-500 truncate max-w-xs">

                  ${blog.content?.slice(0, 80) || ""}
</p>
</div>
</div>
<div class="flex gap-2 mt-2 sm:mt-0">
<a href="update-blog.html?id=${
          blog.id
        }" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">Edit</a>
<button onclick="confirmDelete('${
          blog.id
        }')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
<button onclick="confirmToggleActive('${blog.id}', '${blog.status}')" 

                class="${
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
        // public blog

        blogCard.innerHTML = `
<div class="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
<img src="${blog.image}" alt="${
          blog.title
        }" class="w-full h-60 object-cover hover:scale-105 transition-transform duration-300">
<div class="p-5 space-y-3">
<div class="text-gray-400 text-xs uppercase tracking-wider flex items-center gap-1">
<span class="text-yellow-500 font-semibold">•</span> ${blog.author}
</div>
<h3 class="text-2xl font-bold text-gray-800 leading-snug hover:text-red-600 transition-colors duration-200">

                ${blog.title}
</h3>
<p class="text-gray-600 text-sm leading-relaxed">

                ${blog.content.substring(0, 150)}...
</p>
<a href="blog-detail.html?id=${
          blog.id
        }" class="inline-block text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors duration-200 hover:underline">

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

// blog detail

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

    detailContainer.innerHTML = `
<div class="bg-white p-6 space-y-6 max-w-4xl mx-auto">
<div class="text-sm text-gray-400 flex items-center gap-2">
<span class="text-yellow-500 font-semibold tracking-wide">by ${blog.author}</span>
</div>
<h1 class="text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">${blog.title}</h1>
<div class="overflow-hidden rounded-xl shadow-md">
<img src="${blog.image}" alt="${blog.title}" class="w-full object-cover transition-transform duration-500 ease-in-out" />
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

// toggle active

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

// delete

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

    fetchBlogs("dashboard-blog-list", "dashboard");
  } catch (error) {
    alert("Failed to delete blog.");
  }
}

// blog update page load

async function fetchBlogForUpdate() {
  const blogId = getQueryParam("id");

  if (!blogId) {
    alert("Blog ID not found!");
    return;
  }

  try {
    const res = await fetch(
      `https://api.vybtek.com/api/manuplast/blogs/${blogId}`
    );

    if (!res.ok) throw new Error("Failed to fetch blog");

    const blog = await res.json();

    document.getElementById("blog-id").value = blog.id;

    document.getElementById("title").value = blog.title;

    document.getElementById("author").value = blog.author;

    document.getElementById("content").value = blog.content;
  } catch (error) {
    alert("Failed to load blog data.");
  }
}

// handle update form

document
  .getElementById("update-blog-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("blog-id").value;

    const title = document.getElementById("title").value;

    const author = document.getElementById("author").value;

    const image = document.getElementById("image").value;

    const content = document.getElementById("content").value;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `https://api.vybtek.com/api/manuplast/blogs/${id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({ title, author, image, content }),
        }
      );

      if (!res.ok) throw new Error("Failed to update blog");

      alert("Blog updated successfully!");

      window.location.href = "blog-list.html";
    } catch (error) {
      alert("Failed to update blog.");
    }
  });

// auto-run

window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("blog-grid")) {
    fetchBlogs();
  } else if (document.getElementById("blog-detail")) {
    fetchBlogDetail();
  } else if (document.getElementById("update-blog-form")) {
    fetchBlogForUpdate();
  }
});
