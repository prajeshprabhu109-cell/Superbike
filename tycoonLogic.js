let gameData = {
    cash: 0,
    incomePerSecond: 10,
    engineLevel: 1
};

function gameLoop() {
    gameData.cash += gameData.incomePerSecond;
    document.getElementById('cash-display').innerText = Math.floor(gameData.cash);

    // Save to LocalStorage so players don't lose progress
    localStorage.setItem('tycoon_save', JSON.stringify(gameData));
}

setInterval(gameLoop, 1000);

document.getElementById('upgrade-btn').addEventListener('click', () => {
    const cost = gameData.engineLevel * 500;
    if (gameData.cash >= cost) {
        gameData.cash -= cost;
        gameData.engineLevel++;
        gameData.incomePerSecond *= 1.5;
        alert("Engine Upgraded!");
    } else {
        alert("Not enough cash!");
    }
});