document.addEventListener("DOMContentLoaded", () => {
  const projectForm = document.getElementById("project-form");
  const imageFields = document.getElementById("image-fields");
  const addImageButton = document.getElementById("add-image");

  // Add new image field group
  addImageButton.addEventListener("click", () => {
    const imageGroup = document.createElement("div");
    imageGroup.classList.add(
      "mb-4",
      "relative",
      "border",
      "p-4",
      "rounded-lg",
      "bg-gray-50"
    );

    imageGroup.innerHTML = `
      <button type="button" class="remove-image absolute top-0 right-0 text-red-500 text-4xl hover:text-red-700">&times;</button>
      <input
        type="text"
        name="image-url"
        placeholder="Additional Image URL"
        class="w-full p-2 border rounded-lg mb-2"
      />
      <input
        type="text"
        name="image-caption"
        placeholder="Image Caption"
        class="w-full p-2 border rounded-lg mb-2"
      />
      <textarea
        name="image-description"
        placeholder="Image Description"
        class="w-full p-2 border rounded-lg"
      ></textarea>
    `;

    imageFields.appendChild(imageGroup);

    // Add event to remove this image group
    imageGroup.querySelector(".remove-image").addEventListener("click", () => {
      imageFields.removeChild(imageGroup);
    });
  });

  // Handle form submission
  projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const image = document.getElementById("image").value.trim();
    const description = document.getElementById("description").value.trim();
    const additionalContent = document
      .getElementById("additionalContent")
      .value.trim();

    // Get all image groups (children divs inside imageFields)
    const imageGroups = imageFields.querySelectorAll("div");
    const images = [];

    imageGroups.forEach((group) => {
      const url = group.querySelector('input[name="image-url"]')?.value.trim();
      const caption = group
        .querySelector('input[name="image-caption"]')
        ?.value.trim();
      const desc = group
        .querySelector('textarea[name="image-description"]')
        ?.value.trim();

      if (url && caption && desc) {
        images.push({ url, caption, description: desc });
      }
    });

    const projectData = {
      title,
      image,
      description,
      images,
      additionalContent,
    };

    try {
      const response = await fetch("http://localhost:5000/add-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) throw new Error("Failed to add project");

      const result = await response.json();
      alert("Project added successfully!");

      projectForm.reset();
      imageFields.innerHTML = `
        <div class="mb-4">
          <input
            type="text"
            name="image-url"
            placeholder="Additional Image URL"
            class="w-full p-2 border rounded-lg mb-2"
          />
          <input
            type="text"
            name="image-caption"
            placeholder="Image Caption"
            class="w-full p-2 border rounded-lg mb-2"
          />
          <textarea
            name="image-description"
            placeholder="Image Description"
            class="w-full p-2 border rounded-lg"
          ></textarea>
        </div>
      `;
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Error adding project. Check console for details.");
    }
  });
});
