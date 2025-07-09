document.addEventListener("DOMContentLoaded", () => {
  console.log("Script running");
  initializeAdminFeatures();
  setClosedLeagues();
  flatpickr("#deadline", {
    altInput: true,
    altFormat: "F j, Y | h:i K",
    dateFormat: "Z",
    enableTime: true,
  });
});

// ========== Admin Features Section ==========

// Configuration for admin features
const CONFIG = {
  adminPlanId: "pln_admin-sth06an",
  hook: "xg12rclb5prysjvdxfpsfi6nlpw2wac3",
  selectors: {
    adminSection: "#admin-section",
    adminButton: "#admin-button",
    createLeagueForm: "#create-league-form",
    createLeagueButton: "#create-league-button",
    createLeagueNotification: "#create-league-notification",
    loader: "#loader",
  },
};

// Initialize admin features
function initializeAdminFeatures() {
  toggleLoader(false);

  // Initialize when Memberstack is ready
  if (window.$memberstackReady) {
    initAdmin();
  } else {
    window.$memberstackDom?.addEventListener("memberstackReady", initAdmin);
  }
}

// Show or hide loader
function toggleLoader(show) {
  const loader = document.querySelector(CONFIG.selectors.loader);
  if (loader) {
    loader.style.display = show ? "block" : "none";
  }
}

// Main initialization function for admin features
function initAdmin() {
  checkMemberStatus()
    .then((hasAdminAccess) => {
      if (hasAdminAccess) {
        showAdminSection();
        setupFormSubmission();
        console.log("Has admin access");
      }
    })
    .catch((error) => {
      console.error("Error during initialization:", error);
      hideAdminSection();
    });
}

//function to show admin button
function showAdminSection() {
  const adminSection = document.querySelector("#admin-section");
  if (adminSection) adminSection.classList.remove("is-hidden-onload");
}

// Check if the current member has admin access
function checkMemberStatus() {
  return window.$memberstackDom.getCurrentMember().then((member) => {
    if (!member.data) {
      // console.log("No member logged in");
      hideAdminSection();
      return false;
    }

    const hasAdminPlan = member.data.planConnections?.some(
      (connection) =>
        connection.planId === CONFIG.adminPlanId && connection.active === true
    );

    if (hasAdminPlan) {
      // console.log("Member has admin plan");
      return true;
    } else {
      // console.log("Member does not have admin plan");
      hideAdminSection();
      return false;
    }
  });
}

// Hide admin section from non-admin users
function hideAdminSection() {
  const adminSection = document.querySelector(CONFIG.selectors.adminSection);
  if (adminSection) adminSection.remove();
  const adminButton = document.querySelector(CONFIG.selectors.adminButton);
  if (adminButton) adminButton.remove();
}

// Submit form data to webhook
function submitForm(formData) {
  return fetch(`https://hook.us1.make.com/${CONFIG.hook}`, {
    method: "POST",
    body: formData,
  }).then((response) => {
    if (response.status !== 200) {
      throw new Error(`Network response error: ${response.status}`);
    }

    return response.text().then((text) => {
      // We now expect the text to be a URL rather than "success"
      console.log("Success: Status 200 with response URL");
      return text; // Return the URL for further processing
    });
  });
}

// Setup form submission handler
function setupFormSubmission() {
  const form = document.querySelector(CONFIG.selectors.createLeagueForm);
  const button = document.querySelector(CONFIG.selectors.createLeagueButton);
  const createLeagueNotification = document.querySelector(
    CONFIG.selectors.createLeagueNotification
  );

  // Only set up event listener if both form and button exist
  if (!form || !button) return;

  button.addEventListener("click", handleFormSubmission);

  // Handle form submission
  function handleFormSubmission(event) {
    event.preventDefault();

    // Store the window reference opened directly from the click event
    let newWindow = window.open("about:blank", "_blank");

    // Show loader when form submission starts
    toggleLoader(true);

    const formData = new FormData(form);

    submitForm(formData)
      .then((responseUrl) => {
        // Hide loader
        toggleLoader(false);

        // Change button text
        button.innerText = "League was created!";
        button.disabled = true;
        button.style.opacity = "0.7";
        button.style.cursor = "not-allowed";
        button.style.pointerEvents = "none";

        if (createLeagueNotification) {
          createLeagueNotification.classList.remove("is-hidden-onload");
        }

        // Redirect the already-opened window to the actual URL
        if (newWindow) {
          newWindow.location.href = responseUrl;
        } else {
          // If the popup was blocked anyway, provide a fallback
          alert("Your league has been created! Click OK to open it.");
          window.open(responseUrl, "_blank");
        }

        // Reload the current page after delay (if still needed)
        setTimeout(() => {
          window.location.reload();
        }, 6000);
      })
      .catch((error) => {
        // Hide loader on error
        toggleLoader(false);

        // Close the blank window if there was an error
        if (newWindow) {
          newWindow.close();
        }

        console.error("Submission error:", error);
        alert("Failed to create League. Please try again.");
      });
  }
}

// if we want to have leagues open by default
const setClosedLeagues = () => {
  const closedLeagues = document.querySelectorAll(
    ".league-closed:not(.w-condition-invisible)"
  );
  closedLeagues.forEach((league) => {
    const parentItem = league.closest(".league-item");
    if (parentItem) {
      parentItem.classList.add("is-closed");
    }
  });
};
/*
// if we want to have leagues closed by default
const setOpenLeagues = () => {
  const openLeagues = document.querySelectorAll(
    ".league-closed.w-condition-invisible"
  );
  openLeagues.forEach((league) => {
    league.classList.remove("is-closed");
  });
};
*/
