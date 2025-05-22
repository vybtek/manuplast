// Function to fetch and display all projects
// Confirmation wrappers
function confirmDeleteProject(projectId) {
  if (confirm("Are you sure you want to delete this project?")) {
    deleteProject(projectId);
  }
}

function confirmToggleProjectActive(projectId, isActive) {
  const action = isActive ? "deactivate" : "activate";
  if (confirm(`Are you sure you want to ${action} this project?`)) {
    toggleProjectActive(projectId, isActive);
  }
}

// Main fetch function
async function fetchProjects(containerId = "project-grid", view = "default") {
  const projectGrid = document.getElementById(containerId);
  if (!projectGrid) return;

  try {
    const response = await fetch("http://localhost:5000/projects");
    if (!response.ok) throw new Error("Failed to fetch projects");

    const projects = await response.json();
    projectGrid.innerHTML = "";

    projects.forEach((project) => {
      if (view === "default" && !project.active) return;

      const projectCard = document.createElement("div");
      projectCard.classList.add("text-center");

      if (view === "dashboard") {
        const isActive = project.active;
        projectCard.innerHTML = `
          <div class="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <img src="${project.image}" alt="${
          project.title
        }" class="w-16 h-16 object-cover rounded" />
              <div class="text-left">
                <h4 class="font-semibold text-gray-800">${project.title}</h4>
                <p class="text-sm text-gray-500 truncate">${
                  project.description?.slice(0, 60) || ""
                }</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <a href="update-project.html?id=${
                project.id
              }" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">Edit</a>
              <button onclick="confirmDeleteProject('${
                project.id
              }')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
              <button onclick="confirmToggleProjectActive('${
                project.id
              }', ${isActive})" class="${
          isActive
            ? "bg-yellow-500 hover:bg-yellow-600"
            : "bg-green-500 hover:bg-green-600"
        } text-white px-3 py-1 rounded text-sm">
                ${isActive ? "Deactivate" : "Activate"}
              </button>
              <a href="project-detail.html?id=${
                project.id
              }&source=dashboard" class="bg-gray-200 text-black px-3 py-1 rounded text-sm">View</a>
            </div>
          </div>
        `;
      } else {
        projectCard.innerHTML = `
          <a href="project-detail.html?id=${project.id}" class="block">
            <div class="bg-gray-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 p-6">
              <img src="${project.image}" alt="${project.title}" class="w-full h-60 object-cover rounded-lg">
              <div class="mt-4">
                <h3 class="text-xl font-semibold text-gray-900">${project.title}</h3>
                <div class="mt-5 text-center">
                  <span class="block w-full text-center bg-gray-900 text-white font-medium px-5 py-3 rounded-lg transition-all duration-300 hover:bg-gray-800">
                    View Details
                  </span>
                </div>
              </div>
            </div>
          </a>
        `;
      }

      projectGrid.appendChild(projectCard);
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
}

async function fetchProjectDetail() {
  const projectDetail = document.getElementById("project-detail");
  if (!projectDetail) return;

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("id");
  const source = params.get("source"); // Get `source` param to check if it's from the dashboard

  if (!projectId) {
    projectDetail.innerHTML =
      "<p class='text-red-500 text-lg'>Project not found.</p>";
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/projects/${projectId}`);
    if (!response.ok) throw new Error("Failed to fetch project details");

    const project = await response.json();

    // Check if project is inactive and not from dashboard
    const isFromDashboard =
      document.referrer.includes("dashboard") || source === "dashboard";

    if (!project.active && !isFromDashboard) {
      projectDetail.innerHTML = `
        <div class="text-center py-12">
          <h2 class="text-2xl font-bold text-red-600">This project is currently inactive.</h2>
          <a href="projects.html" class="mt-4 inline-block bg-gray-800 text-white px-5 py-2 rounded hover:bg-gray-900">
            ← Back to Projects
          </a>
        </div>
      `;
      return;
    }

    // Alternating left-right layout for additional images with descriptions
    const imagesWithContent = project.images?.length
      ? ` 
        <section class="max-w-6xl mx-auto mt-16">
          <h2 class="text-3xl font-bold text-center text-gray-800">More About This Project</h2>
          <div class="mt-8 space-y-12">
            ${project.images
              .map(
                (img, index) => `
              <div class="flex flex-col md:flex-row ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } items-center gap-8">
                <div class="w-full md:w-1/2 overflow-hidden rounded-lg shadow-md group">
                  <img src="${img.url}" alt="${
                  img.caption
                }" class="w-full h-80 object-cover rounded-lg transition-transform duration-500">
                </div>
                <div class="w-full md:w-1/2 text-center md:text-left">
                  <h3 class="text-xl font-semibold text-gray-800">${
                    img.caption || "Additional Image"
                  }</h3>
                  <p class="text-gray-600 mt-2">${
                    img.description || "No additional details provided."
                  }</p>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </section>
      `
      : "";

    // Project Gallery Section (With Swiper Slider)
    const imagesSection = project.images?.length
      ? `
        <section class="max-w-6xl mx-auto mt-16">
          <h2 class="text-3xl font-bold text-center text-gray-800">Project Gallery</h2>
          <div class="swiper-container mt-8">
            <div class="swiper-wrapper">
              ${project.images
                .map(
                  (img) => `
                <div class="swiper-slide">
                  <div class="rounded-md shadow-lg overflow-hidden">
                    <img src="${img.url}" alt="${img.caption}" class="w-full h-72 object-cover rounded-md">
                  </div>
                </div>
              `
                )
                .join("")}
            </div>         
            <!-- Swiper Pagination -->
            <div class="swiper-pagination"></div>
          </div>
        </section>
      `
      : "";

    projectDetail.innerHTML = `
      <div class="max-w-full w-full mx-auto bg-white overflow-hidden">
        <!-- Hero Section (Banner) -->
        <section class="relative w-full h-[450px] md:h-[600px] overflow-hidden flex items-center justify-center">
          <img src="${project.image}" class="absolute inset-0 w-full h-full object-cover brightness-75 rounded-md">
          <div class="relative z-10 text-center px-4">
            <h1 class="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg">${project.title}</h1>
          </div>
        </section>

        <!-- Project Overview -->
        <section class="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-12 mt-[-50px] z-10 relative text-center md:text-left">
          <h2 class="text-4xl font-bold">Project Overview</h2>
          <p class="mt-6 text-lg leading-relaxed opacity-90">${project.description}</p>
        </section>

        ${imagesWithContent}

        ${imagesSection}

        <!-- Back Button -->
        <div class="flex justify-center mt-8">
          <a href="projects.html" 
             class="bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg transition duration-300 hover:bg-gray-900 hover:shadow-md">
            ← Back to Projects
          </a>
        </div>
      </div>
    `;

    // Initialize Swiper
    setTimeout(() => {
      if (document.querySelector(".swiper-container")) {
        new Swiper(".swiper-container", {
          loop: true,
          autoplay: {
            delay: 3000,
            disableOnInteraction: false,
          },
          pagination: {
            el: ".swiper-pagination",
            clickable: true,
          },
          slidesPerView: 1,
          spaceBetween: 15,
          breakpoints: {
            640: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 25 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
          },
        });
      }
    }, 500);
  } catch (error) {
    projectDetail.innerHTML =
      "<p class='text-red-500 text-lg'>Error loading project details.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchProjects();
  fetchProjectDetail();
});

async function deleteProject(id) {
  if (confirm("Are you sure you want to delete this project?")) {
    try {
      const response = await fetch(`http://localhost:5000/projects/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete project");

      // Option 1: Refresh view
      location.reload();

      // Option 2 (better): Re-fetch projects without reload
      await fetchProjects("project-grid", "dashboard");
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  }
}

async function toggleProjectActive(projectId, currentStatus) {
  try {
    const response = await fetch(
      `http://localhost:5000/projects/${projectId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !currentStatus }),
      }
    );

    if (!response.ok) throw new Error("Failed to update project status");

    // Refresh the dashboard list
    fetchProjects("dashboard-project-list", "dashboard");
  } catch (error) {
    console.error("Error toggling project active status:", error);
    alert("Failed to update project status.");
  }
}
// Fetch project details for update
async function fetchProjectForUpdate() {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("id");

  if (!projectId) {
    alert("Project not found!");
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/projects/${projectId}`);
    if (!response.ok) throw new Error("Failed to fetch project details");

    const project = await response.json();
    populateProjectForm(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    alert("Failed to load project data.");
  }
}

// Populate the form with project data
function populateProjectForm(project) {
  document.getElementById("project-id-display").value = project.id;
  document.getElementById("title").value = project.title;
  document.getElementById("image").value = project.image;
  document.getElementById("description").value = project.description;
  document.getElementById("additionalContent").value =
    project.additionalContent;

  // Populate multiple images
  const imageInputsContainer = document.getElementById("imageInputs");
  if (imageInputsContainer && project.images && Array.isArray(project.images)) {
    imageInputsContainer.innerHTML = ""; // Clear previous inputs

    project.images.forEach((img) => {
      const imgHtml = `
        <div class="image-set space-y-4 p-4 border border-gray-200 rounded-lg shadow-sm">
          <div class="space-y-2">
            <input type="url" class="url w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Image URL" value="${
              img.url || ""
            }" />
          </div>
          <div class="space-y-2">
            <input type="text" class="caption w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Caption" value="${
              img.caption || ""
            }" />
          </div>
          <div class="space-y-2">
            <textarea class="description w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Description">${
              img.description || ""
            }</textarea>
          </div>
        </div>
      `;
      imageInputsContainer.insertAdjacentHTML("beforeend", imgHtml);
    });
  }
}

// Handle form submission for project update
document
  .getElementById("update-project-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const projectId = document.getElementById("project-id-display").value;
    const title = document.getElementById("title").value;
    const image = document.getElementById("image").value;
    const description = document.getElementById("description").value;
    const additionalContent =
      document.getElementById("additionalContent").value;

    // Collect the project images data
    const imageFields = document
      .getElementById("imageInputs")
      .querySelectorAll(".image-set");
    const images = Array.from(imageFields).map((field) => {
      const urlField = field.querySelector(".url");
      const captionField = field.querySelector(".caption");
      const descriptionField = field.querySelector(".description");

      return {
        url: urlField ? urlField.value : "",
        caption: captionField ? captionField.value : "",
        description: descriptionField ? descriptionField.value : "",
      };
    });

    // Ensure you only send non-empty images
    const nonEmptyImages = images.filter(
      (image) => image.url || image.caption || image.description
    );

    const updatedProject = {
      title,
      image,
      description,
      images: nonEmptyImages, // Only send non-empty images
      additionalContent,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/projects/${projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProject),
        }
      );

      if (!response.ok) throw new Error("Failed to update project");

      alert("Project updated successfully!");
      window.location.href = "project-list.html";
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project.");
    }
  });

// Fetch the project data when the page loads
document.addEventListener("DOMContentLoaded", fetchProjectForUpdate);
