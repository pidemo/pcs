// important that var gameClosed is set in a separate script above this one
//

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  initializeAdminFeatures();
});

// Game Status Management Functions
function initializeApp() {
  // get Current Date and Game Status
  const currentDate = getCurrentDate();
  const gameStatus = getGameStatus(currentDate);
  console.log("gameStatus check:", gameStatus);
  updateVisibility(gameStatus);
  gameAutoRefresh(gameStatus);
  disableFormWhileSubmitting();
  // optional - debugging
  displayHelperData(gameStatus, currentDate);
  //logData(gameStatus, currentDate);
  // Initialize when Memberstack is ready
  if (window.$memberstackReady) {
    handleMemberstackData(gameStatus);
  } else {
    window.$memberstackDom?.addEventListener("memberstackReady", () =>
      handleMemberstackData(gameStatus)
    );
  }
}

const disableFormWhileSubmitting = () => {
  const form = document.getElementById("email-form");
  if (!form) return;
  const submitButton = form.querySelector("input[type='submit']");
  if (!submitButton) return;

  form.addEventListener("submit", function () {
    // Disable the button to prevent multiple clicks
    submitButton.disabled = true;

    // Apply visual changes
    submitButton.style.pointerEvents = "none";
    submitButton.style.opacity = "0.6";

    // Optional: Change the button text to show it's processing
    submitButton.value = "Submitting...";
  });
};

// Function to get date from element by ID
const getDate = (id) => {
  const dateElement = document.getElementById(id)?.textContent;
  return dateElement ? new Date(dateElement + " EDT") : null;
};

const getCurrentDate = () => new Date();

const getGameStatus = (currentDate) => {
  // Determine if the game is closed
  //const gameClosed = ""; // WF Var Here
  console.log("gameClosed check:", gameClosed);
  // Get the date elements from the HTML
  const predictionsDate = getDate("predictions-cutoff");
  const gameDate = getDate("game-date");
  const endDate = getDate("game-closed-deadline");

  //console.log(`Current Date : ${currentDate}, Predictions Date : ${predictionsDate}, Game Date : ${gameDate}, End Date : ${endDate}`);

  // Determine the game status
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

const updateVisibility = (gameStatus) => {
  // Show elements with the matching data-pcs-state attribute and remove others
  document.querySelectorAll("[data-pcs-state]").forEach((element) => {
    const pcsState = element.getAttribute("data-pcs-state");
    if (pcsState.includes(gameStatus)) {
      element.classList.remove("is-hidden", "is-hidden-onload");
    } else {
      element.remove();
    }
  });
};

// debugging functions
const formatDate = (date) => {
  const dateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  };
  const timeOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "America/New_York",
  };
  const formattedDate = `${date.toLocaleDateString(
    "en-US",
    dateOptions
  )} ${date.toLocaleTimeString("en-US", timeOptions)}`;
  return formattedDate;
};

const displayHelperData = (gameStatus, currentDate) => {
  const currentDateElement = document.getElementById("current-date");
  const gameStatusElement = document.getElementById("game-status");

  if (currentDateElement) {
    currentDateElement.innerText = formatDate(currentDate);
  }

  if (gameStatusElement) {
    gameStatusElement.innerText = gameStatus;
  }
};

const logData = (gameStatus, currentDate) => {
  console.log(`Game Status : ${gameStatus}`);
  console.log(`Current Date : ${currentDate}`);
};

// auto refresh part
const startRefresh = () => {
  const refreshRate = 60000; // 1 minute
  const lastRefreshTime = getCurrentDate();

  const updateLastRefreshed = () => {
    const secondsSinceRefresh = Math.round(
      (getCurrentDate() - lastRefreshTime) / 1000
    );
    document.getElementById(
      "last-refreshed"
    ).textContent = `Last refreshed ${secondsSinceRefresh} seconds ago`;
  };

  setTimeout(() => location.reload(), refreshRate);
  setInterval(updateLastRefreshed, 10000);
};

const gameAutoRefresh = (gameStatus) => {
  if (gameStatus === "ongoing") {
    startRefresh();
  } else {
    const lastRefreshedElement = document.getElementById("last-refreshed");
    if (lastRefreshedElement) {
      lastRefreshedElement.remove();
    }
  }
};

const handleMemberstackData = (gameStatus) => {
  window.$memberstackDom.getCurrentMember().then((member) => {
    if (member.data) {
      checkLeagueEnrollement(member);
      generateLeaderboard(member, gameStatus);
    }
  });
};

const checkLeagueEnrollement = (member) => {
  const leaguePlanElement = document.getElementById("league-plan-msid");
  if (!leaguePlanElement) return;

  const checkValue = leaguePlanElement.innerText;
  if (!checkValue) return;

  const plans = member.data.planConnections;
  const hasMatchingPlan = plans.some((plan) => plan.planId === checkValue);
  const veil = document.getElementById("prediction-veil");

  if (hasMatchingPlan && veil) {
    veil.remove();
  }
};

// leaderboard part v2
const generateLeaderboard = (member, gameStatus) => {
  const container = document.getElementById("leaderboard");
  const template = document.getElementById("leaderboard-item-template");
  if (!container) return;

  if (template) {
    template.remove();
  }

  const leaderboardJsonElement = document.getElementById("leaderboard-json");
  const dataString = leaderboardJsonElement
    ? leaderboardJsonElement.textContent
    : null;
  if (dataString) {
    const data = JSON.parse(dataString).sort(
      (a, b) => parseInt(a.pcs) - parseInt(b.pcs)
    );
    let hasPrediction = false; // flag to check if the player has a prediction

    data.forEach((player, index) => {
      appendLeaderboardItem(
        container,
        player,
        index,
        member.data.customFields["account-atid"],
        gameStatus
      );

      // Check if the current member has a prediction
      if (
        player.accountAtid === member.data.customFields["account-atid"] &&
        player.ph &&
        player.pa
      ) {
        hasPrediction = true;
      }
    });

    // If the player has a prediction, add the is-visible class to #address-section
    if (hasPrediction) {
      let address = document.getElementById("address-section");
      if (address) {
        address.classList.add("is-visible");
      }
    }

    container.classList.remove("is-hidden-onload");
  } else {
    container.classList.add("is-hidden-onload");
  }
};

const appendLeaderboardItem = (
  container,
  player,
  index,
  accountAtid,
  gameStatus
) => {
  const item = document.createElement("div");
  item.className = "leaderboard_item";
  item.innerHTML = `
      <div class="leaderboard_cell text-align-left">${player.playerName}</div>
      <div class="leaderboard_cell">${player.ph}</div>
      <div class="leaderboard_cell">${player.pa}</div>
      <div class="leaderboard_cell">${player.pcs}</div>
      <div class="leaderboard_cell">${index + 1}</div>
  `;
  container.appendChild(item);

  if (player.accountAtid === accountAtid) {
    if (gameStatus === "predictions") {
      updateInputPrediction(player);
    } else {
      updateScorePrediction(player);
    }
  }
};

const updateInputPrediction = (player) => {
  console.log("Update Input Pred Ran");
  const phInput = document.getElementById("ph");
  const paInput = document.getElementById("pa");
  if (phInput && paInput) {
    phInput.value = player.ph;
    paInput.value = player.pa;
  }
};

const updateScorePrediction = (player) => {
  console.log("Update Score Pred Ran");
  const phScore = document.getElementById("ph-score");
  const paScore = document.getElementById("pa-score");
  if (phScore && paScore) {
    phScore.textContent = player.ph;
    paScore.textContent = player.pa;
  }
};

// ========== Admin Features Section ==========

// Configuration for admin features
const CONFIG = {
  adminPlanId: "pln_admin-sth06an",
  scoreHook: "gbj2slg3m4ge4egnk64yg4mmy38u3etk",
  gameHook: "kxzvbso9x4bzel59ybk64f9mmvmc9jfn",
  selectors: {
    adminSection: "#admin-section",
    adminButton: "#admin-button",
    updateScoreForm: "#update-score-form",
    updateScoreButton: "#update-score-button",
    updateScoreLoader: "#update-score-loader",
    updateGameForm: "#update-game-form",
    updateGameButton: "#update-game-button",
    updateGameLoader: "#update-game-loader",
    deleteGameForm: "#delete-game-form",
    deleteGameButton: "#delete-game-button",
    deleteGameLoader: "#delete-game-loader",
    currentValueInputs: "[current-value]",
  },
};

// Initialize admin features
function initializeAdminFeatures() {
  // Initialize form inputs with current values
  initializeFormInputs();
  toggleLoader(false);

  // Initialize when Memberstack is ready
  if (window.$memberstackReady) {
    initAdmin();
  } else {
    window.$memberstackDom?.addEventListener("memberstackReady", initAdmin);
  }
}

// Initialize form inputs with current values
function initializeFormInputs() {
  // Extract the date string
  const dateInput = document.getElementById("date-start-update");
  const dateValue = dateInput.getAttribute("data-value");

  // Parse the date string into a Unix timestamp
  const date = new Date(dateValue);

  flatpickr("#date-start-update", {
    altInput: true,
    altFormat: "F j, Y | h:i K",
    dateFormat: "Z",
    enableTime: true,
    defaultDate: date,
  });

  const inputs = document.querySelectorAll(CONFIG.selectors.currentValueInputs);
  inputs.forEach((input) => {
    input.value = input.getAttribute("current-value");
  });
}

function setUpdateValues() {
  const values = document.querySelectorAll("[data-value]");
  if (values) {
    values.forEach((value) => {
      value.value = value.getAttribute("data-value");
    });
  }
  setHideGameValue();
}

function setHideGameValue() {
  const hide = document.querySelectorAll(
    "[data-hide-game]:not(.w-condition-invisible)"
  )[0];
  const hideValue = hide.getAttribute("data-hide-game");

  const hideCheckbox = document.querySelector("#hide-game");
  if (hideCheckbox) {
    if (hideValue == "true") {
      console.log("Set to true");
      hideCheckbox.checked = true;
    } else {
      console.log("Set to false");
      hideCheckbox.checked = false;
    }
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
        showAdminSection(true);
        setupScoreFormSubmission();
        setupGameFormSubmission();
        setupDeleteGameFormSubmission();
        setUpdateValues();
      } else {
        showAdminSection(false);
      }
    })
    .catch((error) => {
      console.error("Error during initialization:", error);
      showAdminSection(false);
    });
}

//function to show admin button
function showAdminSection(boolean) {
  const adminSection = document.querySelector(CONFIG.selectors.adminSection);

  if (!adminSection) return;

  if (boolean) {
    adminSection.classList.remove("is-hidden-onload");
  } else {
    adminSection.remove();
  }
}

// Check if the current member has admin access
function checkMemberStatus() {
  return window.$memberstackDom.getCurrentMember().then((member) => {
    if (!member.data) {
      // console.log("No member logged in");
      showAdminSection(false);
      return false;
    }

    const hasAdminPlan = member.data.planConnections?.some(
      (connection) =>
        connection.planId === CONFIG.adminPlanId && connection.active === true
    );

    if (hasAdminPlan) {
      return true;
    } else {
      showAdminSection(false);
      return false;
    }
  });
}

// Update Score : Setup form submission handler
function setupScoreFormSubmission() {
  const form = document.querySelector(CONFIG.selectors.updateScoreForm);
  const button = document.querySelector(CONFIG.selectors.updateScoreButton);
  const loader = document.querySelector(CONFIG.selectors.updateScoreLoader);

  // Only set up event listener if both form and button exist
  if (!form || !button) return;

  button.addEventListener("click", handleFormSubmission);

  // Handle form submission
  function handleFormSubmission(event) {
    event.preventDefault();

    // Show this form's specific loader
    toggleLoader(loader, true);

    const formData = new FormData(form);

    submitScoreForm(formData)
      .then((success) => {
        // Hide this form's specific loader
        toggleLoader(loader, false);

        if (success) {
          alert("Score updated successfully!");
          window.location.reload();
        }
      })
      .catch((error) => {
        // Hide this form's specific loader
        toggleLoader(loader, false);

        console.error("Submission error:", error);
        alert("Failed to update score. Please try again.");
      });
  }
}

// Submit form data to webhook
function submitScoreForm(formData) {
  return fetch(`https://hook.us1.make.com/${CONFIG.scoreHook}`, {
    method: "POST",
    body: formData,
  }).then((response) => {
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

// Update Game : Setup form submission handler
function setupGameFormSubmission() {
  const form = document.querySelector(CONFIG.selectors.updateGameForm);
  const button = document.querySelector(CONFIG.selectors.updateGameButton);
  const loader = document.querySelector(CONFIG.selectors.updateGameLoader);

  // Only set up event listener if both form and button exist
  if (!form || !button) return;

  button.addEventListener("click", handleFormSubmission);

  // Handle form submission
  function handleFormSubmission(event) {
    event.preventDefault();

    // Show this form's specific loader
    toggleLoader(loader, true);

    const formData = new FormData(form);

    // Manually handle the date field to ensure ISO format
    const dateInput = document.getElementById("date-start-update");
    if (dateInput && dateInput._flatpickr) {
      // Get the selected date from flatpickr
      const selectedDate = dateInput._flatpickr.selectedDates[0];
      if (selectedDate) {
        // Replace the value in FormData with ISO string
        formData.set("Date-Start-Update", selectedDate.toISOString());
      }
    }

    submitGameForm(formData, "normal")
      .then((success) => {
        // Hide this form's specific loader
        toggleLoader(loader, false);

        if (success) {
          alert("Game updated successfully!");
          window.location.reload();
        }
      })
      .catch((error) => {
        // Hide this form's specific loader
        toggleLoader(loader, false);

        console.error("Submission error:", error);
        alert("Failed to update game. Please try again.");
      });
  }
}

// Delete Game : Setup form submission handler
function setupDeleteGameFormSubmission() {
  const form = document.querySelector(CONFIG.selectors.deleteGameForm);
  const button = document.querySelector(CONFIG.selectors.deleteGameButton);
  const loader = document.querySelector(CONFIG.selectors.deleteGameLoader);

  // Only set up event listener if both form and button exist
  if (!form || !button) return;

  button.addEventListener("click", handleFormSubmission);

  // Handle form submission
  function handleFormSubmission(event) {
    event.preventDefault();

    // Confirm deletion
    const confirmDelete = confirm(
      "Are you sure you want to delete this game? This action cannot be undone."
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
          alert("Game deleted successfully!");
          window.location.href = "/leagues"; // Redirect to homepage
        }
      })
      .catch((error) => {
        // Hide this form's specific loader
        toggleLoader(loader, false);

        console.error("Submission error:", error);
        alert("Failed to delete game. Please try again.");
      });
  }
}

// Submit game form data to webhook with request type parameter
function submitGameForm(formData, reqType) {
  return fetch(
    `https://hook.us1.make.com/${CONFIG.gameHook}?reqType=${reqType}`,
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
