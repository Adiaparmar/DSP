document.addEventListener("DOMContentLoaded", () => {
  const copyButtons = document.querySelectorAll(".copy-btn");
  const viewButtons = document.querySelectorAll(".view-btn");
  const statusMessage = document.getElementById("status-message");
  const contentDisplay = document.getElementById("content-display");
  const contentTitle = document.getElementById("content-title");
  const contentBody = document.getElementById("content-body");
  const closeBtn = document.getElementById("close-content");
  const copyCurrentBtn = document.getElementById("copy-current");
  const theoryContent = document.getElementById("theory-content");
  const codeContent = document.getElementById("code-content");
  const codeBlock = document.getElementById("code-block");

  // Create a pre-loaded cache for file contents
  const fileContents = {};
  let currentContent = "";
  let currentFileName = "";

  // Pre-load all text files
  const preloadFiles = async () => {
    const allButtons = [...copyButtons, ...viewButtons];
    const fileNames = Array.from(allButtons).map((btn) =>
      btn.getAttribute("data-file")
    );
    const uniqueFileNames = [...new Set(fileNames)]; // Remove duplicates

    for (const fileName of uniqueFileNames) {
      try {
        const response = await fetch(fileName);
        if (response.ok) {
          fileContents[fileName] = await response.text();
          console.log(`Pre-loaded: ${fileName}`);
        }
      } catch (error) {
        console.error(`Failed to pre-load ${fileName}:`, error);
      }
    }
  };

  // Start pre-loading
  preloadFiles();

  // Handle copy button clicks
  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const fileName = button.getAttribute("data-file");
      try {
        let textContent;

        // Check if content is already in cache
        if (fileContents[fileName]) {
          textContent = fileContents[fileName];
        } else {
          // Fetch the content if not cached
          const response = await fetch(fileName);

          if (!response.ok) {
            throw new Error(`Failed to fetch ${fileName}`);
          }

          textContent = await response.text();
          fileContents[fileName] = textContent; // Cache for future use
        }

        // Copy to clipboard
        await navigator.clipboard.writeText(textContent);

        // Show success message
        showStatusMessage(
          `Content of "${fileName}" copied to clipboard!`,
          "success"
        );
      } catch (error) {
        console.error("Error:", error);
        showStatusMessage(`Error: ${error.message}`, "error");
      }
    });
  });

  // Handle view button clicks
  viewButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const fileName = button.getAttribute("data-file");
      try {
        let textContent;

        // Check if content is already in cache
        if (fileContents[fileName]) {
          textContent = fileContents[fileName];
        } else {
          // Fetch the content if not cached
          const response = await fetch(fileName);

          if (!response.ok) {
            throw new Error(`Failed to fetch ${fileName}`);
          }

          textContent = await response.text();
          fileContents[fileName] = textContent; // Cache for future use
        }

        // Display content in view area
        displayContent(fileName, textContent);
      } catch (error) {
        console.error("Error:", error);
        showStatusMessage(`Error: ${error.message}`, "error");
      }
    });
  });

  // Handle copy current content button
  copyCurrentBtn.addEventListener("click", async () => {
    if (currentContent) {
      try {
        await navigator.clipboard.writeText(currentContent);
        showStatusMessage(
          `Content of "${currentFileName}" copied to clipboard!`,
          "success"
        );
      } catch (error) {
        console.error("Error:", error);
        showStatusMessage(`Error: ${error.message}`, "error");
      }
    }
  });

  // Handle close button click
  closeBtn.addEventListener("click", () => {
    contentDisplay.classList.add("hidden");
    document.body.style.overflow = "auto"; // Re-enable body scroll
  });

  // Close content display when clicking outside
  contentDisplay.addEventListener("click", (e) => {
    if (e.target === contentDisplay) {
      contentDisplay.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  });

  // Close content display with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !contentDisplay.classList.contains("hidden")) {
      contentDisplay.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  });

  function isTheoryFile(fileName) {
    return fileName.includes("_theory") || fileName.includes("theory");
  }

  function displayContent(fileName, content) {
    currentContent = content;
    currentFileName = fileName;
    contentTitle.textContent = fileName;

    // Hide both content areas first
    theoryContent.classList.add("hidden");
    codeContent.classList.add("hidden");

    if (isTheoryFile(fileName)) {
      // Display as formatted markdown/theory
      displayTheory(content);
    } else {
      // Display as code with syntax highlighting
      displayCode(content);
    }

    contentDisplay.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // Prevent body scroll when modal is open
  }

  function displayTheory(content) {
    // Convert plain text to markdown-like formatting
    let formattedContent = content;

    // Convert ** bold ** to markdown bold
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, "**$1**");

    // Convert section headers (lines starting with ##)
    formattedContent = formattedContent.replace(/^## (.*$)/gim, "## $1");
    formattedContent = formattedContent.replace(/^### (.*$)/gim, "### $1");

    // Convert bullet points
    formattedContent = formattedContent.replace(/^- (.*$)/gim, "- $1");

    // Convert numbered lists
    formattedContent = formattedContent.replace(/^(\d+)\. (.*$)/gim, "$1. $2");

    // Convert code blocks (text between ``` )
    formattedContent = formattedContent.replace(
      /```([\s\S]*?)```/g,
      "```$1```"
    );

    // Use marked.js to parse markdown
    if (typeof marked !== "undefined") {
      theoryContent.innerHTML = marked.parse(formattedContent);
    } else {
      // Fallback: basic HTML formatting
      formattedContent = formattedContent
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/^- (.*$)/gim, "<li>$1</li>")
        .replace(/\n/g, "<br>");

      theoryContent.innerHTML = formattedContent;
    }

    theoryContent.classList.remove("hidden");
  }

  function displayCode(content) {
    // Set the code content
    codeBlock.textContent = content;

    // Apply syntax highlighting
    if (typeof Prism !== "undefined") {
      Prism.highlightElement(codeBlock);
    }

    codeContent.classList.remove("hidden");
  }

  function showStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `show ${type}`;

    // Hide the message after 3 seconds
    setTimeout(() => {
      statusMessage.className = "";
    }, 3000);
  }
});
