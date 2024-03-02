
function simplifyPath(path) {
  // Split the path by " > " to get individual elements
  let elements = path.split(" > ");

  // Process each element to keep only the first class
  let simplifiedElements = elements.map(element => {
    // Check if the element has a class (indicated by a dot)
    if (element.includes('.')) {
      // Split the element into tag and classes
      let [tagWithClass, ...classes] = element.split('.');
      // Keep only the first class, if exists, and ignore the rest
      if (classes.length > 0) {
        return `${tagWithClass}.${classes[0]}`;
      }
    }
    // Return the element if it doesn't contain classes or already processed
    return element;
  });

  // Join the processed elements back into a path
  return simplifiedElements.join(" > ");
}

let originalPath = "html > body.test-class.desktop.chakra-ui-light > div.col-md-4.position-relative > div.p-3.text-center > h5.mt-3";
let simplifiedPath = simplifyPath(originalPath);

console.log(simplifiedPath);
// Output should be: "html > body.test-class > div.col-md-4 > div.p-3 > h5.mt-3"

document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.backgroundColor = "rgba(0, 0, 255, 0.3)";
  overlay.style.pointerEvents = "none";
  document.body.appendChild(overlay);

  let currentElement = null;
  let isModalOpen = false; // Flag to track if the modal is open

  function showOverlay(elem) {
    const rect = elem.getBoundingClientRect();
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.top = `${rect.top + window.scrollY}px`;
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.display = "block";
    currentElement = elem;
  }

  function getElementPath(elem) {
    let path = [];
    while (elem) {
      let selector = elem.tagName.toLowerCase();
      if (elem.id) {
        selector += `#${elem.id}`;
      } else if (elem.className) {
        selector += `.${elem.className.split(" ").join(".")}`;
      }
      path.unshift(selector);
      elem = elem.parentElement;
    }
    return path.join(" > ");
  }

  document.addEventListener("mouseover", function (e) {
    if (!isModalOpen) { // Check if modal is not open before showing overlay
    showOverlay(e.target);
    }
  });

  document.addEventListener("click", function () {
    if (!isModalOpen && currentElement) { // Check if modal is not open before changing path
      // Store the element's path in the hidden input
      const pathInput = document.getElementById("path");
      pathInput.value = getElementPath(currentElement);

      $("#myModal").modal("show");
    }
  });

  document.addEventListener("mouseout", function () {
    if (!isModalOpen) { // Hide overlay only if modal is not open
    overlay.style.display = "none";
    }
  });

  // Listen for the Bootstrap modal events to update the isModalOpen flag
  $("#myModal").on("show.bs.modal", function () {
    isModalOpen = true;
  });

  $("#myModal").on("hidden.bs.modal", function () {
    isModalOpen = false;
  });

  // Handle the selectType change event
  $("#selectType").on("change", function () {
    const selection = this.value;
    if (selection === "content") {
      $("#contentFields").removeClass("d-none");
      $("#templateFields").addClass("d-none");
    } else if (selection === "template") {
      $("#templateFields").removeClass("d-none");
      $("#contentFields").addClass("d-none");
    }
  });

  document.getElementById("saveChanges").addEventListener("click", function () {
    // Prevent the default form submission
    event.preventDefault();

    // Serialize the form data
    const formData = new FormData(document.getElementById("typeForm"));
    const data = {};
    formData.forEach((value, key) => (data[key] = value));

    // Specify your endpoint
    const endpoint =
      "https://node.yapit.ai/webhook-test/c43892be-f10e-4962-9d20-ac104895ee1e/template-engine";

    // Use fetch API to send the data via POST
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any other headers your endpoint requires
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json()) // Assuming the server responds with JSON
      .then((data) => {
        console.log("Success:", data);
        // Handle success. For example, you can close the modal and clear the form
        $("#myModal").modal("hide");
        document.getElementById("typeForm").reset();
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle errors here, such as showing an error message to the user
      });
  });
});