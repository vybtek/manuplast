document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get("id");
  if (categoryId) {
    fetchCategoryForUpdate(categoryId);
  }

  document
    .getElementById("category-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const categoryId = document.getElementById("category-id").value;
      const name = document.getElementById("name").value;
      const imageInput = document.getElementById("image");
      const description = document.getElementById("description").value;
      const token = localStorage.getItem("token");

      // Validate token
      if (!token) {
        alert("You are not authenticated. Please log in.");
        window.location.href = "login.html";
        return;
      }

      // Create FormData object to handle file and text fields
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      if (imageInput.files[0]) {
        formData.append("image", imageInput.files[0]); // Append the file
      } else if (categoryId && imageInput.value) {
        formData.append("image", imageInput.value); // For updates, if no new file is selected, send existing URL
      }

      try {
        const url = categoryId
          ? `http://192.168.0.102:5000/api/manuplast/categories/${categoryId}`
          : `http://192.168.0.102:5000/api/manuplast/categories`;
        const method = categoryId ? "PUT" : "POST";
        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            // Do NOT set Content-Type; browser sets it to multipart/form-data
          },
          body: formData,
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Unauthorized: Invalid or expired token. Please log in again."
            );
          }
          const errorData = await response.json();
          throw new Error(
            `Failed to save category: ${
              errorData.message || response.statusText
            }`
          );
        }

        alert(
          categoryId
            ? "Category updated successfully!"
            : "Category added successfully!"
        );
        window.location.href = "dashboard.html";
      } catch (error) {
        alert(`Failed to save category: ${error.message}`);
      }
    });
});

async function fetchCategoryForUpdate(categoryId) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not authenticated. Please log in.");
      window.location.href = "login.html";
      return;
    }

    const response = await fetch(
      `http://192.168.0.102:5000/api/manuplast/categories/${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Unauthorized: Invalid or expired token. Please log in again."
        );
      }
      throw new Error("Failed to fetch category details");
    }

    const category = await response.json();
    document.getElementById("category-id").value = category.id;
    document.getElementById("name").value = category.name;
    document.getElementById("image").value = ""; // Clear file input
    // Optionally display the existing image URL or preview
    document.getElementById("description").value = category.description;
    document.getElementById("add-category-heading").textContent =
      "UPDATE CATEGORY";
    document.querySelector('button[type="submit"]').textContent =
      "Update Category";

    // Optionally, store the existing image URL in a hidden input or data attribute
    document.getElementById("category-id").dataset.imageUrl = category.image;
  } catch (error) {
    alert(`Failed to load category data: ${error.message}`);
  }
}
