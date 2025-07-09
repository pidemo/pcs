// Code for the Leagues CMS Page

window.$memberstackDom.getCurrentMember().then((member) => {
  const leaguePlanIdElement = document.getElementById("league-plan-msid");
  const leaderboardJsonElement = document.getElementById("leaderboard-json");
  const registerButton = document.getElementById("register-button");
  const signupButton = document.getElementById("signup-button");
  const registerConfirmation = document.getElementById("register-confirmation");
  const leaderboardContainer = document.getElementById("leaderboard");
  const leaderboardTemplate = document.getElementById(
    "leaderboard-item-template"
  );

  if (!member.data && signupButton) {
    signupButton.classList.remove("is-hidden-onload");
  }

  if (!leaguePlanIdElement || !leaderboardJsonElement /* || !member.data */)
    return;

  if (member.data) {
    const checkValue = leaguePlanIdElement.innerText;
    toggleEnrollment(
      member.data.planConnections,
      checkValue,
      registerButton,
      registerConfirmation
    );
  }

  const dataString = leaderboardJsonElement.textContent;
  if (dataString) {
    try {
      const data = JSON.parse(dataString);
      generateLeaderboard(data, leaderboardTemplate, leaderboardContainer);
    } catch (error) {
      console.error("Error parsing JSON or generating leaderboard:", error);
    }
  }
});

function toggleEnrollment(
  planConnections,
  checkValue,
  registerButton,
  registerConfirmation
) {
  const hasMatchingPlan = planConnections.some(
    (plan) => plan.planId === checkValue
  );
  registerButton.classList.toggle("is-hidden-onload", hasMatchingPlan);
  registerConfirmation.classList.toggle("is-hidden-onload", !hasMatchingPlan);
}

function generateLeaderboard(data, template, container) {
  template.remove();
  data.sort((a, b) => parseInt(a.playerPcst) - parseInt(b.playerPcst));

  data.forEach((player, index) => {
    const item = document.createElement("div");
    item.className = "leaderboard_item is-league";

    const playerName = createElementWithClass(
      "div",
      "leaderboard_cell text-align-left",
      player.playerName
    );
    const playerPCS = createElementWithClass(
      "div",
      "leaderboard_cell",
      player.playerPcst
    );
    const rank = createElementWithClass("div", "leaderboard_cell", index + 1);

    [playerName, playerPCS, rank].forEach((element) =>
      item.appendChild(element)
    );
    container.appendChild(item);
  });
  container.classList.remove("is-hidden-onload");
}

function createElementWithClass(elementType, className, textContent) {
  const element = document.createElement(elementType);
  element.className = className;
  if (textContent !== undefined) element.textContent = textContent;
  return element;
}

document.addEventListener("DOMContentLoaded", function () {
  // Function to get the value of a specific URL parameter using URLSearchParams
  function getParameterByName(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  // Get the error parameter from the URL
  const errorType = getParameterByName("error");
  const warning = document.getElementById("league-full-warning");

  // Hide all messages initially
  warning.style.display = "none";

  // Conditionally display messages based on the error type
  if (errorType === "league-full") {
    if (warning) {
      warning.style.display = "block";
      document.getElementById("register-button").style.display = "none";
    }
  }
});

// Part to handle game status attributes based visibility
document.addEventListener("DOMContentLoaded", () => initializeApp());

function initializeApp() {
  const gameWraps = document.querySelectorAll(".game-wrap");
  gameWraps.forEach((gameWrap) => {
    const currentDate = getCurrentDate();
    const gameStatus = getGameStatus(currentDate, gameWrap);
    updateVisibility(gameStatus, gameWrap);
  });
}
// Function to get date from element by ID within a specific game wrap
const getDate = (id, gameWrap) => {
  const dateElement = gameWrap.querySelector(`.${id}`)?.textContent;
  return dateElement ? new Date(dateElement + " EDT") : null;
};

const getCurrentDate = () => new Date();

const getGameStatus = (currentDate, gameWrap) => {
  // Determine if the game is closed
  const gameClosed = gameWrap.querySelector(
    ".game-closed-deadline"
  )?.innerContent;
  // Get the date elements within the specific gameWrap
  const predictionsDate = getDate("predictions-cutoff", gameWrap);
  const gameDate = getDate("game-date", gameWrap);
  const endDate = getDate("game-closed-deadline", gameWrap);

  // Determine the game status based on currentDate and game-specific dates
  return gameClosed
    ? "closed"
    : currentDate < predictionsDate
    ? "predictions"
    : currentDate < gameDate
    ? "imminent"
    : currentDate < endDate
    ? "ongoing"
    : "closed";
};

const updateVisibility = (gameStatus, gameWrap) => {
  // Show elements with the matching data-pcs-state attribute within the specific gameWrap
  gameWrap.querySelectorAll("[data-pcs-state]").forEach((element) => {
    const pcsState = element.getAttribute("data-pcs-state");
    if (pcsState.includes(gameStatus)) {
      element.classList.remove("is-hidden", "is-hidden-onload");
    } else {
      element.remove();
    }
  });
};

// ========== Admin Features Section ==========

document.addEventListener("DOMContentLoaded", () => {
  initializeAdminFeatures();

  flatpickr("#date-start-game", {
    utc: true,
    altInput: true,
    altFormat: "F j, Y | h:i K",
    dateFormat: "Z",
    enableTime: true,
  });

  // Extract the date string
  const dateInput = document.getElementById("league-signup-deadline");
  const dateValue = dateInput.getAttribute("current-value");

  // Parse the date string into a Unix timestamp
  const date = new Date(dateValue);

  flatpickr("#league-signup-deadline", {
    utc: true,
    altInput: true,
    altFormat: "F j, Y | h:i K",
    dateFormat: "Z",
    enableTime: true,
    defaultDate: date,
  });
});

// Configuration for admin features
const CONFIG = {
  adminPlanId: "pln_admin-sth06an",
  createHook: "04l1qf8h42n6scobknz9hveba9whyjwa",
  updateHook: "nboh5ir6nhsxnj9xw69umgcmwbystiq1",
  selectors: {
    adminSection: "#admin-section",
    adminButton: "#admin-button",
    adminHiddenGames: "#admin-hidden-games",
    createGameForm: "#create-game-form",
    createGameButton: "#create-game-button",
    createGameLoader: "#create-game-loader",
    updateLeagueForm: "#update-league-form",
    updateLeagueButton: "#update-league-button",
    updateLeagueLoader: "#update-league-loader",
    currentValueInputs: "[current-value]",
    deleteLeagueForm: "#delete-league-form",
    deleteLeagueButton: "#delete-league-button",
    deleteLeagueLoader: "#delete-league-loader",
    hiddenGamesList: "#hidden-games-list",
    visibleGamesList: "#visible-games-list",
    disabledNotification: "#disabled-notification",
  },
};

// Initialize admin features
function initializeAdminFeatures() {
  // Initialize when Memberstack is ready
  if (window.$memberstackReady) {
    initAdmin();
    console.log("Admin initiated");
  } else {
    window.$memberstackDom?.addEventListener("memberstackReady", initAdmin);
  }
}

// Function to show/hide loader element
function toggleLoader(loaderElement, show) {
  if (loaderElement) {
    loaderElement.style.display = show ? "block" : "none";
  }
}

// Main initialization function for admin features
function initAdmin() {
  checkMemberStatus()
    .then((hasAdminAccess) => {
      if (hasAdminAccess) {
        console.log("Has admin access");
        showAdminSection();
        setupCreateGameFormSubmission();
        setupUpdateLeagueFormSubmission();
        setupDeleteLeagueFormSubmission();
      } else {
        console.log("No admin access");
        hideAdminSection();
      }
    })
    .catch((error) => {
      console.error("Error during initialization:", error);
      hideAdminSection();
    });
}

//function to show admin button
function showAdminSection() {
  const adminSection = document.querySelector(CONFIG.selectors.adminSection);
  if (adminSection) adminSection.classList.remove("is-hidden-onload");
  const adminHiddenGames = document.querySelector(
    CONFIG.selectors.adminHiddenGames
  );
  if (adminHiddenGames) adminHiddenGames.classList.remove("is-hidden-onload");
  console.log("Button should be shown");
}

function setDeleteLeagueButton() {
  console.log("Setting delete league button");
  const hiddenGamesList = document.querySelector(
    CONFIG.selectors.hiddenGamesList
  );
  const visibleGamesList = document.querySelector(
    CONFIG.selectors.visibleGamesList
  );

  const hiddenGames = hiddenGamesList ? hiddenGamesList.childElementCount : 0;
  const visibleGames = visibleGamesList
    ? visibleGamesList.childElementCount
    : 0;
  const totalGames = hiddenGames + visibleGames;

  console.log("Total games:", totalGames);

  if (totalGames !== 0) {
    const disabledNotification = document.querySelector(
      CONFIG.selectors.disabledNotification
    );
    const deleteButton = document.querySelector("#delete-league-button");
    if (disabledNotification) {
      disabledNotification.classList.remove("w-condition-invisible");
      disabledNotification.innerHTML = `You can't delete this league!<br>(It has games in it, which you must delete first)`;
    }
    if (deleteButton) {
      deleteButton.remove();
    }
  }
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
      return true;
    } else {
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
  const adminHiddenGames = document.querySelector(
    CONFIG.selectors.adminHiddenGames
  );
  if (adminHiddenGames) adminHiddenGames.remove();
}

// Create Game - Submit create form data to webhook
function submitCreateForm(formData) {
  return fetch(`https://hook.us1.make.com/${CONFIG.createHook}`, {
    method: "POST",
    body: formData,
  }).then((response) => {
    if (response.status !== 200) {
      throw new Error(`Network response error: ${response.status}`);
    }

    return response.text().then((text) => {
      //console.log("Response text:", text);

      if (text !== "success") {
        throw new Error(`Processing failed. Response: ${text}`);
      }

      console.log('Success: Status 200 and response content is "success"');
      return true;
    });
  });
}

// Edit League - Submit update form data to webhook
function submitUpdateForm(formData) {
  return fetch(
    `https://hook.us1.make.com/${CONFIG.updateHook}?reqType=normal`,
    {
      method: "POST",
      body: formData,
    }
  ).then((response) => {
    if (response.status !== 200) {
      throw new Error(`Network response error: ${response.status}`);
    }

    return response.text().then((text) => {
      console.log("Response text:", text);

      if (text !== "success") {
        throw new Error(`Processing failed. Response: ${text}`);
      }

      console.log('Success: Status 200 and response content is "success"');
      return true;
    });
  });
}

// Delete League> : Setup form submission handler
function setupDeleteLeagueFormSubmission() {
  const form = document.querySelector(CONFIG.selectors.deleteLeagueForm);
  const button = document.querySelector(CONFIG.selectors.deleteLeagueButton);
  const loader = document.querySelector(CONFIG.selectors.deleteLeagueLoader);
  // Only set up event listener if both form and button exist
  if (!form || !button) return;

  setDeleteLeagueButton();

  button.addEventListener("click", xx);

  // Handle form submission
  function xx(event) {
    event.preventDefault();

    // Confirm deletion
    const confirmDelete = confirm(
      "Are you sure you want to delete this league? This action cannot be undone."
    );
    if (!confirmDelete) return;

    // Show this form's specific loader
    toggleLoader(loader, true);

    const formData = new FormData(form);

    submitGameForm(formData, "delete")
      .then((success) => {
        // Hide this form's specific loader
        toggleLoader(loader, false);

        if (success) {
          alert("League deleted successfully!");
          window.location.href = "/leagues"; // Redirect to homepage
        }
      })
      .catch((error) => {
        // Hide this form's specific loader
        toggleLoader(loader, false);

        console.error("Submission error:", error);
        alert("Failed to delete league. Please try again.");
      });
  }
}

// Submit game form data to webhook with request type parameter
function submitGameForm(formData, reqType) {
  return fetch(
    `https://hook.us1.make.com/${CONFIG.updateHook}?reqType=${reqType}`,
    {
      method: "POST",
      body: formData,
    }
  ).then((response) => {
    if (response.status !== 200) {
      throw new Error(`Network response error: ${response.status}`);
    }

    return response.text().then((text) => {
      console.log("Response text:", text);

      if (text !== "success") {
        throw new Error(`Processing failed. Response: ${text}`);
      }

      console.log('Success: Status 200 and response content is "success"');
      return true;
    });
  });
}

// Create Game - Setup create game form submission handler
function setupCreateGameFormSubmission() {
  const form = document.querySelector(CONFIG.selectors.createGameForm);
  const button = document.querySelector(CONFIG.selectors.createGameButton);
  const notif = document.querySelector(CONFIG.selectors.createGameNotif);
  const loader = document.querySelector(CONFIG.selectors.createGameLoader);

  // Only set up event listener if both form and button exist
  if (!form || !button) return;

  button.addEventListener("click", xx);

  // Handle form submission
  function xx(event) {
    event.preventDefault();

    // Show this form's specific loader
    toggleLoader(loader, true);

    const formData = new FormData(form);

    submitCreateForm(formData)
      .then((success) => {
        // Hide this form's specific loader
        toggleLoader(loader, false);

        if (success) {
          alert("Game created successfully!");
          window.location.reload();
        }
      })
      .catch((error) => {
        // Hide this form's specific loader
        toggleLoader(loader, false);

        console.error("Submission error:", error);
        alert("Failed to create game. Please try again.");
      });
  }
}

// Edit League - Setup update league form submission handler
function setupUpdateLeagueFormSubmission() {
  const form = document.querySelector(CONFIG.selectors.updateLeagueForm);
  const button = document.querySelector(CONFIG.selectors.updateLeagueButton);
  const notif = document.querySelector(CONFIG.selectors.updateLeagueNotif);
  const loader = document.querySelector(CONFIG.selectors.updateLeagueLoader);
  const hide = document.querySelector(
    "[data-hide-league]:not(.w-condition-invisible)"
  );
  const hideValue = hide?.getAttribute("data-hide-league");
  console.log(hide, hideValue);

  // Only set up event listener if both form and button exist
  if (!form || !button) return;

  button.addEventListener("click", handleFormSubmission);

  const inputs = document.querySelectorAll(CONFIG.selectors.currentValueInputs);
  inputs.forEach((input) => {
    input.value = input.getAttribute("current-value");
  });

  const hideCheckbox = document.querySelector("#hide-league");
  if (hideCheckbox) {
    if (hideValue == "true") {
      console.log("Set to true");
      hideCheckbox.checked = true;
    } else {
      console.log("Set to false");
      hideCheckbox.checked = false;
    }
  }

  // Handle form submission
  function handleFormSubmission(event) {
    event.preventDefault();

    // Show this form's specific loader
    toggleLoader(loader, true);

    const formData = new FormData(form);

    // Manually handle the date field to ensure ISO format
    const dateInput = document.getElementById("league-signup-deadline");
    if (dateInput && dateInput._flatpickr) {
      // Get the selected date from flatpickr
      const selectedDate = dateInput._flatpickr.selectedDates[0];
      if (selectedDate) {
        // Replace the value in FormData with ISO string
        formData.set("League-Deadline", selectedDate.toISOString());
      }
    }

    submitUpdateForm(formData)
      .then((success) => {
        // Hide this form's specific loader
        toggleLoader(loader, false);

        if (success) {
          alert("League updated successfully!");
          window.location.reload();
        }
      })
      .catch((error) => {
        // Hide this form's specific loader
        toggleLoader(loader, false);

        console.error("Submission error:", error);
        alert("Failed to update league. Please try again.");
      });
  }
}
