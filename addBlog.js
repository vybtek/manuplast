document.getElementById("blog-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.querySelector('input[name="title"]').value;

  const author = document.querySelector('input[name="author"]').value;

  const image = document.querySelector('input[name="image"]').files[0];

  const content = document.querySelector('textarea[name="content"]').value;

  const token = localStorage.getItem("token");

  const formData = new FormData();

  formData.append("title", title);

  formData.append("author", author);

  formData.append("content", content);

  formData.append("image", image);

  try {
    const response = await fetch(
      "https://api.vybtek.com/api/manuplast/blogs",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,

          // DO NOT set content-type, let browser set boundary
        },

        body: formData,
      }
    );

    const result = await response.json();

    alert(result.message || "Blog added successfully!");
  } catch (error) {
    alert("Failed to submit blog.");
  }
});
