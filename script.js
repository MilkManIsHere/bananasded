let bananas = 0;
let bps = 0;
let bpc = 1;
let totalBananasMade = 0; // Track Total Bananas Made (TBM)

let upgrades = {
    monkey: { price: 10, bps: 0.1, quantity: 0, element: document.getElementById('buy-monkey'), icon: 'monkey-icon.png', unlocked: false, name: 'Monkey' },
    farm: { price: 100, bps: 1, quantity: 0, element: document.getElementById('buy-farm'), icon: 'farm-icon.png', unlocked: false, name: 'Banana Farm' }, // Changed name here
    factory: { price: 1200, bps: 10, quantity: 0, element: document.getElementById('buy-factory'), icon: 'factory-icon.png', unlocked: false, name: 'Banana Factory' }, // Changed name here
    bananaPlant: { price: 16000, bps: 105, quantity: 0, element: document.getElementById('buy-banana-plant'), icon: 'banana-plant-icon.png', unlocked: false, name: 'Banana Plant' },
    bananaResearchCenter: { price: 200000, bps: 1150, quantity: 0, element: document.getElementById('buy-banana-research-center'), icon: 'research-center-icon.png', unlocked: false, name: 'Banana Research Center' },
    bananium: { price: 1500000, bps: 10120, quantity: 0, element: document.getElementById('buy-bananium'), icon: 'bananium-icon.png', unlocked: false, name: 'Bananium' },
};

document.getElementById('monkey').addEventListener('click', () => {
    bananas += bpc;
    totalBananasMade += bpc; // TBM always increases
    updateDisplay();
    playSound('bananaClick.mp3', 0.1); // Play banana click sound at volume 0.1
});

function formatNumber(num, isPrice = false) {
    if (num > 9999999999999999999) return "N/A"; // If above 9999999999999999999
    num = Math.max(num, 0); // Ensure the number is non-negative

    if (isPrice) {
        return Math.floor(num).toString(); // Show as whole number for prices
    }

    // Always display one decimal place for the specified values
    return num.toFixed(1); // Format with one decimal place
}

function updateDisplay() {
    // Display quantities as whole numbers
    document.getElementById('buy-monkey').querySelector('.upgrade-owned').textContent = upgrades.monkey.quantity.toString();
    document.getElementById('buy-farm').querySelector('.upgrade-owned').textContent = upgrades.farm.quantity.toString();
    document.getElementById('buy-factory').querySelector('.upgrade-owned').textContent = upgrades.factory.quantity.toString();
    document.getElementById('buy-banana-plant').querySelector('.upgrade-owned').textContent = upgrades.bananaPlant.quantity.toString();
    document.getElementById('buy-banana-research-center').querySelector('.upgrade-owned').textContent = upgrades.bananaResearchCenter.quantity.toString();
    document.getElementById('buy-bananium').querySelector('.upgrade-owned').textContent = upgrades.bananium.quantity.toString();

    // Display bananas, bps, and total bananas made with one decimal place
    document.getElementById('banana-count').textContent = formatNumber(bananas);
    document.getElementById('bps').textContent = formatNumber(bps);
    document.getElementById('tbm').textContent = formatNumber(totalBananasMade); // Display TBM
    updateUpgrades();
}

function updateUpgrades() {
    for (const key in upgrades) {
        const upgrade = upgrades[key];
        const button = upgrade.element;

        // Check if totalBananasMade is enough to unlock the upgrade
        if (totalBananasMade >= upgrade.price) {
            // Unlock upgrade
            upgrade.unlocked = true;
            button.querySelector('.upgrade-icon').src = upgrade.icon; // Show normal icon
            button.querySelector('.upgrade-name').textContent = upgrade.name; // Update the name
            button.querySelector('.upgrade-name').style.color = ''; // Reset name color

            // Check affordability
            if (bananas >= upgrade.price) {
                // If affordable, restore the normal button style
                button.style.backgroundColor = ''; // Normal background
                button.querySelector('.upgrade-price').style.color = ''; // Normal price text
            } else {
                // If unaffordable but unlocked, greyed out and red price text
                button.style.backgroundColor = 'lightgrey'; // Greyed out background for unaffordable
                button.querySelector('.upgrade-price').style.color = 'red'; // Red price text
            }
        } else {
            // Unavailable (locked) upgrade
            upgrade.unlocked = false;
            button.style.backgroundColor = 'lightgrey'; // Light grey background for locked upgrades
            button.querySelector('.upgrade-name').textContent = '???'; // Set name to "???"
            button.querySelector('.upgrade-name').style.color = 'rgba(0, 0, 0, 0.5)'; // Slightly grey name text
            button.querySelector('.upgrade-icon').src = `black-${key}-icon.png`; // Greyed out icon when locked
            button.querySelector('.upgrade-price').style.color = 'red'; // Price in red when locked
        }

        // Always display the price without decimal places
        button.querySelector('.upgrade-price').textContent = formatNumber(upgrade.price, true);
    }
}

function upgrade(type) {
    const upgrade = upgrades[type];
    if (bananas >= upgrade.price && upgrade.unlocked) {
        bananas -= upgrade.price;
        bps += upgrade.bps;
        upgrade.quantity++;
        upgrade.price = Math.floor(upgrade.price * 1.5);
        updateDisplay();
        playSound('buy.mp3'); // Play buy sound when upgrading
    }
}

document.getElementById('buy-monkey').addEventListener('click', () => upgrade('monkey'));
document.getElementById('buy-farm').addEventListener('click', () => upgrade('farm'));
document.getElementById('buy-factory').addEventListener('click', () => upgrade('factory'));
document.getElementById('buy-banana-plant').addEventListener('click', () => upgrade('bananaPlant'));
document.getElementById('buy-banana-research-center').addEventListener('click', () => upgrade('bananaResearchCenter'));
document.getElementById('buy-bananium').addEventListener('click', () => upgrade('bananium'));

setInterval(() => {
    bananas += bps;
    totalBananasMade += bps; // TBM also increases with BPS over time
    updateDisplay();
}, 1000);

// Save and Load functionality
document.getElementById('export-save').addEventListener('click', () => {
    playSound('click.mp3'); // Play sound on export
    const saveData = {
        bananas: bananas,
        bps: bps,
        totalBananasMade: totalBananasMade,
        upgrades: Object.fromEntries(
            Object.entries(upgrades).map(([key, upgrade]) => [key, { quantity: upgrade.quantity, unlocked: upgrade.unlocked }])
        )
    };
    
    const saveString = JSON.stringify(saveData, null, 2); // Convert to JSON string
    const blob = new Blob([saveString], { type: 'text/plain' }); // Change MIME type to text/plain
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BananaClickerSave.txt'; // Save as .txt
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

document.getElementById('import-save').addEventListener('click', () => {
    playSound('click.mp3'); // Play sound on import
    const input = document.getElementById('save-file-input');
    input.click();
    input.onchange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const saveData = e.target.result;
            const parsedData = JSON.parse(saveData); // Parse the imported JSON string
            bananas = parsedData.bananas;
            bps = parsedData.bps;
            totalBananasMade = parsedData.totalBananasMade;
            upgrades = Object.fromEntries(
                Object.entries(parsedData.upgrades).map(([key, upgrade]) => [key, { ...upgrades[key], quantity: upgrade.quantity, unlocked: upgrade.unlocked }])
            );
            updateDisplay();
            playSound('bananaClick.mp3', 0.1); // Play click sound after importing at volume 0.1
        };
        reader.readAsText(file);
    };
});

// Sound playing function
function playSound(soundFile, volume = 1.0) {
    const audio = new Audio(soundFile);
    audio.volume = volume; // Set the audio volume
    audio.play();
}
