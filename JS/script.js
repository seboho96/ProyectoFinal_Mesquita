document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded!");

    document.getElementById("simulateBtn").addEventListener("click", simulateMatch);
    document.getElementById("resetBtn").addEventListener("click", resetHistory);

    displayMatchHistory();
});

let matchHistory = JSON.parse(localStorage.getItem("matchHistory")) || [];
let teamLogos = {}; // 🔵 Added: cache for team logos

function getTeamNames() {
    let team1 = document.getElementById("team1").value.trim();
    let team2 = document.getElementById("team2").value.trim();

    console.log("Team 1: ", team1);
    console.log("Team 2: ", team2);

    if (!team1 || !team2) {
        alert("Both teams must have a name!");
        return null;
    }

    return { team1, team2 };
}

function generateScores() {
    let score1 = Math.floor(Math.random() * 5);
    let score2 = Math.floor(Math.random() * 5);

    console.log("Generated Scores: ", score1, score2);

    return { score1, score2 };
}

function playSound() {
    const audio = document.getElementById("cheerSound");
    if (audio) audio.play();
}

// 🔵 Added: fetch team logo from API and cache it
async function fetchTeamLogo(teamName) {
    if (teamLogos[teamName]) {
        return teamLogos[teamName]; // 🔵
    }

    try {
        const response = await fetch(`https://api.football-data.org/v4/teams?name=${encodeURIComponent(teamName)}`, {
            headers: {
                'X-Auth-Token': '6cfa45277b2e40b89d4f5e19592b8782' // 🔵 Replace with actual key
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`); // 🔵
        }

        const data = await response.json(); // 🔵

        if (data.teams && data.teams.length > 0) {
            const logoUrl = data.teams[0].crest; // 🔵
            teamLogos[teamName] = logoUrl; // 🔵
            return logoUrl; // 🔵
        } else {
            return "https://via.placeholder.com/32"; // 🔵
        }
    } catch (error) {
        console.error('Error fetching team logo:', error); // 🔵
        return "https://via.placeholder.com/32"; // 🔵
    }
}

// 🟡 Modified: made this function async and included team logos
async function displayResult(team1, team2, score1, score2) {
    let resultElement = document.getElementById("result");

    let class1 = "", class2 = "";

    if (score1 > score2) {
        class1 = "win";
        class2 = "loss";
    } else if (score2 > score1) {
        class1 = "loss";
        class2 = "win";
    }

    const logo1 = await fetchTeamLogo(team1); // 🔵
    const logo2 = await fetchTeamLogo(team2); // 🔵

    resultElement.innerHTML = `
        <img src="${logo1}" alt="${team1} logo" width="32" height="32">  <!-- 🔵 -->
        <span class="${class1}">${team1} <strong>${score1}</strong></span> - 
        <span class="${class2}"><strong>${score2}</strong> ${team2}</span>
        <img src="${logo2}" alt="${team2} logo" width="32" height="32">  <!-- 🔵 -->
    `;
}

// 🟡 Modified: made this async to await displayMatchHistory()
async function updateMatchHistory(team1, team2, score1, score2) {
    let date = new Date().toLocaleString();
    let match = { team1, team2, score1, score2, date };
    matchHistory.push(match);

    console.log(matchHistory, "match");
    localStorage.setItem("matchHistory", JSON.stringify(matchHistory));

    await displayMatchHistory(); // 🟡 Awaited call
}

// 🟡 Modified: made this async to use fetchTeamLogo
async function displayMatchHistory() {
    let historyElement = document.getElementById("history");
    historyElement.innerHTML = "<h2>Match History</h2>";

    if (matchHistory.length === 0) {
        historyElement.innerHTML += "<p>No matches played yet.</p>";
        return;
    }

    let list = document.createElement("ul");
    for (const match of matchHistory) { // 🟡 Replaced forEach with for...of
        let highlight1 = "", highlight2 = "";

        if (match.score1 > match.score2) {
            highlight1 = "win";
            highlight2 = "loss";
        } else if (match.score2 > match.score1) {
            highlight1 = "loss";
            highlight2 = "win";
        }

        const logo1 = await fetchTeamLogo(match.team1); // 🔵
        const logo2 = await fetchTeamLogo(match.team2); // 🔵

        let listItem = document.createElement("li");
        listItem.innerHTML = `
            <img src="${logo1}" alt="${match.team1} logo" width="20" height="20">  <!-- 🔵 -->
            <span class="${highlight1}">${match.team1} ${match.score1}</span> - 
            <span class="${highlight2}">${match.score2} ${match.team2}</span> 
            <img src="${logo2}" alt="${match.team2} logo" width="20" height="20">  <!-- 🔵 -->
            <small> (${match.date})</small>
        `;
        list.appendChild(listItem);
    }

    historyElement.appendChild(list);
}

// 🟡 Modified: made async to await updated functions
async function simulateMatch() {
    console.log("Button clicked!");

    const teams = getTeamNames();
    if (!teams) return;

    const { team1, team2 } = teams;
    const { score1, score2 } = generateScores();

    playSound();
    await displayResult(team1, team2, score1, score2); // 🟡 Awaited
    await updateMatchHistory(team1, team2, score1, score2); // 🟡 Awaited
}

function resetHistory() {
    if (confirm("Are you sure you want to clear the match history?")) {
        matchHistory = [];
        localStorage.removeItem("matchHistory");
        document.getElementById("result").innerHTML = "";
        displayMatchHistory(); // no need to await here
    }
}
