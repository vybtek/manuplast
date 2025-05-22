document.getElementById("blog-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.querySelector('input[name="title"]').value;
  const author = document.querySelector('input[name="author"]').value;
  const image = document.querySelector('input[name="image"]').value;
  const content = document.querySelector('textarea[name="content"]').value;

  const blog = {
    title,
    author,
    image,
    content,
  };

  try {
    const response = await fetch("http://localhost:5000/add-blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blog),
    });
    const result = await response.json();
    alert(result.message || "Blog added successfully!");
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to submit blog.");
  }
});
