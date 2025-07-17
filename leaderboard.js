// leaderboard part v3
const generateLeaderboard = (leaderboard) => {
  const template = leaderboard.querySelector('[data-leaderboard="template"]');

  if (template) {
    template.remove();
  }

  if (!leaderboard) {
    return;
  }

  const leaderboardJsonElement = leaderboard.querySelector(
    '[data-leaderboard="json"]'
  );

  const dataString = leaderboardJsonElement
    ? leaderboardJsonElement.textContent
    : null;
  if (dataString) {
    const data = JSON.parse(dataString);

    // Infer leaderboard type based on data structure
    const leaderboardType =
      data.length > 0 &&
      data[0].hasOwnProperty("ph") &&
      data[0].hasOwnProperty("pa")
        ? "game"
        : "league";

    // Sort based on leaderboard type
    const sortedData =
      leaderboardType === "game"
        ? data.sort((a, b) => parseInt(a.pcs) - parseInt(b.pcs))
        : data.sort((a, b) => parseInt(a.playerPcst) - parseInt(b.playerPcst));

    sortedData.forEach((player, index) => {
      appendLeaderboardItem(leaderboard, player, index, leaderboardType);
    });

    leaderboard.classList.remove("is-hidden-onload");
    return leaderboardType;
  } else {
    leaderboard.classList.add("is-hidden-onload");
    return null;
  }
};

const appendLeaderboardItem = (container, player, index, leaderboardType) => {
  const item = document.createElement("div");
  item.className = "leaderboard_item";

  if (leaderboardType === "game") {
    item.innerHTML = `
        <div class="leaderboard_cell text-align-left">${player.playerName}</div>
        <div class="leaderboard_cell">${player.ph}</div>
        <div class="leaderboard_cell">${player.pa}</div>
        <div class="leaderboard_cell">${player.pcs}</div>
        <div class="leaderboard_cell">${index + 1}</div>
    `;
  } else {
    // league
    item.classList.add("is-league");
    item.innerHTML = `
        <div class="leaderboard_cell text-align-left">${player.playerName}</div>
        <div class="leaderboard_cell">${player.playerPcst}</div>
        <div class="leaderboard_cell">${index + 1}</div>
    `;
  }

  container.appendChild(item);
};

const leaderboards = document.querySelectorAll('[data-leaderboard="wrapper"]');

leaderboards.forEach((leaderboard) => {
  generateLeaderboard(leaderboard);
});
