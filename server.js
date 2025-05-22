const express = require("express");
const fs = require("fs");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());
app.use(cors());

const PRODUCTS_FILE = "products.json";
const PROJECTS_FILE = "projects.json";
const BLOGS_FILE = "blogs.json";

// Helper function to read JSON files
function readFile(file, callback) {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      callback(err, null);
      return;
    }

    try {
      const parsedData = JSON.parse(data || "[]");
      callback(null, parsedData);
    } catch (parseError) {
      callback(parseError, null); // Safely handle malformed JSON
    }
  });
}

// PRODUCT PAGE API

// POST: Add New Product
app.post("/add-product", (req, res) => {
  const { name, image, description, types } = req.body;

  const newProduct = {
    id: uuidv4(),
    name,
    image,
    description,
    active: false,
    types: types || [],
  };

  readFile(PRODUCTS_FILE, (err, products) => {
    if (err) return res.status(500).json({ error: "Error reading file" });

    products.push(newProduct);

    fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving product" });

      res.status(201).json(newProduct);
    });
  });
});

// GET: Fetch All Products
app.get("/products", (req, res) => {
  readFile(PRODUCTS_FILE, (err, products) => {
    if (err)
      return res.status(500).json({ error: "Error reading products file" });
    res.json(products);
  });
});

// GET: Fetch Single Product by ID
app.get("/products/:id", (req, res) => {
  readFile(PRODUCTS_FILE, (err, products) => {
    if (err)
      return res.status(500).json({ error: "Error reading products file" });
    const product = products.find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  });
});

// DELETE: Remove Product by ID
app.delete("/products/:id", (req, res) => {
  readFile(PRODUCTS_FILE, (err, products) => {
    if (err)
      return res.status(500).json({ error: "Error reading products file" });
    const updatedProducts = products.filter((p) => p.id !== req.params.id);
    if (updatedProducts.length === products.length)
      return res.status(404).json({ error: "Product not found" });
    fs.writeFile(
      PRODUCTS_FILE,
      JSON.stringify(updatedProducts, null, 2),
      (err) => {
        if (err)
          return res
            .status(500)
            .json({ error: "Error updating products file" });
        res.json({ message: "Product deleted successfully!" });
      }
    );
  });
});

//Toggle active inactive API
app.patch("/products/:id", (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  const products = JSON.parse(fs.readFileSync("products.json", "utf-8"));
  const productIndex = products.findIndex((p) => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  products[productIndex].active = active;
  fs.writeFileSync("products.json", JSON.stringify(products, null, 2));
  res.json(products[productIndex]);
});

// PUT: Edit a Product by ID
app.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, image, description, types } = req.body;

  // Read the products file
  readFile(PRODUCTS_FILE, (err, products) => {
    if (err)
      return res.status(500).json({ error: "Error reading products file" });

    // Find the product to update
    const productIndex = products.findIndex((p) => p.id === id);
    if (productIndex === -1)
      return res.status(404).json({ error: "Product not found" });

    // Update the product details
    products[productIndex] = {
      ...products[productIndex],
      name: name || products[productIndex].name,
      image: image || products[productIndex].image,
      description: description || products[productIndex].description,
      types: types || products[productIndex].types,
    };

    // Write the updated products back to the file
    fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), (err) => {
      if (err)
        return res.status(500).json({ error: "Error saving updated product" });
      res.json(products[productIndex]);
    });
  });
});



// --- PROJECTS ENDPOINTS ---

// Add new project
app.post("/add-project", (req, res) => {
  const { title, image, description, images, additionalContent } = req.body;

  // Validate required fields
  if (!title || !image || !description) {
    return res
      .status(400)
      .json({ error: "Title, image, and description are required." });
  }

  const newProject = {
    id: uuidv4(),
    title,
    image,
    description,
    images: images || [], // optional array of detailed image objects
    additionalContent: additionalContent || "",
  };

  // Read existing projects
  fs.readFile(PROJECTS_FILE, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading file" });

    let projects = [];
    try {
      projects = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ error: "Error parsing existing projects" });
    }

    projects.push(newProject);

    // Save updated projects
    fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error saving project" });

      res
        .status(201)
        .json({ message: "Project added successfully", project: newProject });
    });
  });
});

// GET: Fetch All Projects
app.get("/projects", (req, res) => {
  readFile(PROJECTS_FILE, (err, projects) => {
    if (err)
      return res.status(500).json({ error: "Error reading projects file" });
    res.json(projects);
  });
});

// GET: Fetch Single Project by ID
app.get("/projects/:id", (req, res) => {
  readFile(PROJECTS_FILE, (err, projects) => {
    if (err)
      return res.status(500).json({ error: "Error reading projects file" });
    const project = projects.find((p) => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  });
});

app.delete("/projects/:id", (req, res) => {
  readFile(PROJECTS_FILE, (err, projects) => {
    if (err)
      return res.status(500).json({ error: "Error reading projects file" });

    const updatedProjects = projects.filter((p) => p.id !== req.params.id);

    if (updatedProjects.length === projects.length)
      return res.status(404).json({ error: "Project not found" });

    fs.writeFile(
      PROJECTS_FILE,
      JSON.stringify(updatedProjects, null, 2),
      (err) => {
        if (err)
          return res
            .status(500)
            .json({ error: "Error updating projects file" });

        res.json({ message: "Project deleted successfully!" });
      }
    );
  });
});

app.patch("/projects/:id", (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  const projects = JSON.parse(fs.readFileSync("projects.json", "utf-8"));
  const projectIndex = projects.findIndex((p) => p.id === id);

  if (projectIndex === -1) {
    return res.status(404).json({ error: "Project not found" });
  }

  projects[projectIndex].active = active;
  fs.writeFileSync("projects.json", JSON.stringify(projects, null, 2));
  res.json(projects[projectIndex]);
});

app.put("/projects/:id", (req, res) => {
  const { title, image, description, images, additionalContent } = req.body;
  readFile(PROJECTS_FILE, (err, projects) => {
    if (err) return res.status(500).json({ error: "Error reading file" });

    const index = projects.findIndex((p) => p.id === req.params.id);
    if (index === -1)
      return res.status(404).json({ error: "Project not found" });

    projects[index] = {
      ...projects[index],
      title: title || projects[index].title,
      image: image || projects[index].image,
      description: description || projects[index].description,
      images: images || projects[index].images,
      additionalContent: additionalContent || projects[index].additionalContent,
    };

    fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error updating project" });
      res.json({
        message: "Project updated successfully",
        project: projects[index],
      });
    });
  });
});




// BLOG PAGE APIS
// POST: Add New Blog
app.post("/add-blog", (req, res) => {
  const { title, author, image, content } = req.body;

  // Validate required fields
  if (!title || !image || !author || !content) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const newBlog = {
    id: uuidv4(),
    title,
    author,
    image,
    content,
  };

  // Read existing blogs
  fs.readFile(BLOGS_FILE, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading blogs file:", err); // Log error for debugging
      return res.status(500).json({ error: "Error reading blogs file" });
    }

    let blogs = [];
    try {
      blogs = JSON.parse(data);
    } catch (parseErr) {
      console.error("Error parsing existing blogs:", parseErr); // Log error for debugging
      return res.status(500).json({ error: "Error parsing existing blogs" });
    }

    blogs.push(newBlog);

    // Save updated blogs
    fs.writeFile(BLOGS_FILE, JSON.stringify(blogs, null, 2), (err) => {
      if (err) {
        console.error("Error saving blog:", err); // Log error for debugging
        return res.status(500).json({ error: "Error saving blog" });
      }

      res.status(201).json({
        message: "Blog added successfully",
        blog: newBlog,
      });
    });
  });
});

// GET: All Blogs
app.get("/blogs", (req, res) => {
  readFile(BLOGS_FILE, (err, blogs) => {
    if (err) return res.status(500).json({ error: "Error reading blogs file" });
    res.json(blogs);
  });
});

// GET: Single Blog by ID
app.get("/blogs/:id", (req, res) => {
  readFile(BLOGS_FILE, (err, blogs) => {
    if (err) return res.status(500).json({ error: "Error reading blogs file" });
    const blog = blogs.find((b) => b.id === req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  });
});

// DELETE: Remove Product by ID
app.delete("/blogs/:id", (req, res) => {
  readFile(BLOGS_FILE, (err, blogs) => {
    if (err)
      return res.status(500).json({ error: "Error reading products file" });
    const updatedBlogs = blogs.filter((b) => b.id !== req.params.id);
    if (updatedBlogs.length === blogs.length)
      return res.status(404).json({ error: "Product not found" });
    fs.writeFile(BLOGS_FILE, JSON.stringify(updatedBlogs, null, 2), (err) => {
      if (err)
        return res.status(500).json({ error: "Error updating products file" });
      res.json({ message: "Product deleted successfully!" });
    });
  });
});

//Toggle active inactive API
app.patch("/blogs/:id", (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  const blogs = JSON.parse(fs.readFileSync("blogs.json", "utf-8"));
  const blogIndex = blogs.findIndex((b) => b.id === id);

  if (blogIndex === -1) {
    return res.status(404).json({ error: "Blog not found" });
  }

  blogs[blogIndex].active = active;
  fs.writeFileSync("blogs.json", JSON.stringify(blogs, null, 2));

  res.json(blogs[blogIndex]);
});

// PUT update blog
app.put("/blogs/:id", (req, res) => {
  const { title, author, image, content } = req.body;

  // Read the blogs data from the file
  readFile(BLOGS_FILE, (err, blogs) => {
    if (err) return res.status(500).json({ error: "Error reading file" });

    // Find the blog by its ID
    const index = blogs.findIndex((b) => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Update the blog fields or keep the existing values if the fields are not provided
    blogs[index] = {
      ...blogs[index],
      title: title || blogs[index].title,
      author: author || blogs[index].author,
      image: image || blogs[index].image,
      content: content || blogs[index].content,
    };

    // Write the updated blogs list back to the file
    fs.writeFile(BLOGS_FILE, JSON.stringify(blogs, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Error updating blog" });

      // Send back the updated blog data in the response
      res.json({
        message: "Blog updated successfully",
        blog: blogs[index],
      });
    });
  });
});





app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
