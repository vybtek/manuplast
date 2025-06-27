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
      const image = document.getElementById("image").value;
      const description = document.getElementById("description").value;

      const categoryData = { name, image, description };

      try {
        const url = categoryId
          ? `http://localhost:5000/products/${categoryId}`
          : `http://localhost:5000/products`;
        const method = categoryId ? "PUT" : "POST";
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryData),
        });

        if (!response.ok) throw new Error("Failed to save category");
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
    const response = await fetch(
      `http://localhost:5000/categories/${categoryId}`
    );
    if (!response.ok) throw new Error("Failed to fetch category details");
    const category = await response.json();
    document.getElementById("category-id").value = category.id;
    document.getElementById("name").value = category.name;
    document.getElementById("image").value = category.image;
    document.getElementById("description").value = category.description;
    document.getElementById("add-category-heading").textContent =
      "UPDATE CATEGORY";
    document.querySelector('button[type="submit"]').textContent =
      "Update Category";
  } catch (error) {
    alert("Failed to load category data.");
  }
}
