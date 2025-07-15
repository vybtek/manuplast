document.addEventListener("DOMContentLoaded", () => {
  fetchCategories();
  setupDynamicFields();

  const productForm = document.getElementById("product-form");
  productForm?.addEventListener("submit", submitProduct);
});

async function fetchCategories() {
  try {
    const res = await fetch(
      "https://api.vybtek.com/api/manuplast/categories"
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const categories = await res.json();
    const select = document.getElementById("category");
    select.innerHTML = `<option disabled selected>Select category</option>`;
    categories.forEach((cat) => {
      select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });
  } catch (err) {
    console.error("Error loading categories:", err);
    alert(`Could not load categories: ${err.message}`);
  }
}

function setupDynamicFields() {
  const addTypeBtn = document.getElementById("add-type-btn");
  const typesContainer = document.getElementById("types-container");

  addTypeBtn.addEventListener("click", () => {
    const count = typesContainer.querySelectorAll(".type-item").length;
    const div = createTypeDiv(count);
    typesContainer.appendChild(div);
  });
}

function createTypeDiv(index) {
  const div = document.createElement("div");
  div.className = "type-item border p-4 rounded space-y-2";
  div.innerHTML = `
    <h4 class="font-semibold">Variant ${index + 1}</h4>
    <button type="button" class="remove-variant text-red-500">Remove</button>
    <div>
      <label>Product Name</label>
      <input type="text" class="type-name w-full p-2 border rounded" required />
    </div>
    <div>
      <label>Price</label>
      <input type="number" class="type-price w-full p-2 border rounded" required />
    </div>
    <div>
      <label>Description</label>
      <textarea class="type-description w-full p-2 border rounded" required></textarea>
    </div>
    <div>
      <label>Images (multiple allowed)</label>
      <input type="file" class="type-images w-full p-2 border rounded" multiple accept="image/*" required />
    </div>
    <div>
      <label>Sizes (comma separated)</label>
      <input type="text" class="type-sizes w-full p-2 border rounded" />
    </div>
    <div>
      <label>Colors (comma separated)</label>
      <input type="text" class="type-colors w-full p-2 border rounded" />
    </div>
  `;
  div.querySelector(".remove-variant").addEventListener("click", () => {
    div.remove();
  });
  return div;
}

async function submitProduct(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("You are not logged in");
    return;
  }

  try {
    const categoryId = document.getElementById("category").value;
    if (!categoryId) {
      alert("Please select a category");
      return;
    }

    const variants = document.querySelectorAll(".type-item");
    if (variants.length === 0) {
      alert("Please add at least one product variant");
      return;
    }

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const name = v.querySelector(".type-name").value.trim();
      const description = v.querySelector(".type-description").value.trim();
      const price = parseFloat(v.querySelector(".type-price").value || 0);
      const imageFiles = v.querySelector(".type-images").files;

      if (!name || !description || !imageFiles.length || !price) {
        alert(`Variant ${i + 1} incomplete`);
        return;
      }

      // first post product with first image as thumbnail
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category_id", categoryId);
      formData.append("image", imageFiles[0]);

      const productRes = await fetch(
        "https://api.vybtek.com/api/manuplast/producttypes",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (!productRes.ok) throw new Error(await productRes.text());

      const created = await productRes.json();
      const typeId = created.id;

      // then upload each image in producttypeimages
      for (let j = 0; j < imageFiles.length; j++) {
        const imageForm = new FormData();
        imageForm.append("producttype_id", typeId);
        imageForm.append("image", imageFiles[j]);
        const imgRes = await fetch(
          "https://api.vybtek.com/api/manuplast/producttypeimages",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: imageForm,
          }
        );
        if (!imgRes.ok) console.warn(`Failed uploading image ${j + 1}`);
      }

      // sizes
      const sizes = v
        .querySelector(".type-sizes")
        .value.split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      for (let size of sizes) {
        await fetch(
          "https://api.vybtek.com/api/manuplast/producttypesizes",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ producttype_id: typeId, size }),
          }
        );
      }

      // colors
      const colors = v
        .querySelector(".type-colors")
        .value.split(",")
        .map((c) => c.trim())
        .filter((c) => c);
      for (let color of colors) {
        await fetch(
          "https://api.vybtek.com/api/manuplast/producttypecolors",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ producttype_id: typeId, color }),
          }
        );
      }
    }

    alert("All product variants created successfully!");
    window.location.href = "dashboard.html";
  } catch (err) {
    console.error("submitProduct error", err);
    alert(`Error: ${err.message}`);
  }
}
