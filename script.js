document.addEventListener('DOMContentLoaded', function () {
    console.log("App loaded");

    // --- NAVIGATION LOGIC ---
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');

            // Hide all sections
            sections.forEach(section => section.style.display = 'none');

            // Show target section
            const targetId = this.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });

    // --- SIMULATOR LOGIC ---
    const sliders = {
        recency: document.getElementById('sim-recency'),
        tickets: document.getElementById('sim-tickets'),
        nps: document.getElementById('sim-nps'),
        spend: document.getElementById('sim-spend')
    };

    const displays = {
        recency: document.getElementById('val-recency'),
        tickets: document.getElementById('val-tickets'),
        nps: document.getElementById('val-nps'),
        spend: document.getElementById('val-spend')
    };

    const resultDisplay = {
        score: document.getElementById('realtime-score'),
        status: document.getElementById('realtime-status'),
        box: document.querySelector('.prediction-result')
    };

    function updateSimulation() {
        // Get values
        const recency = parseInt(sliders.recency.value);
        const tickets = parseInt(sliders.tickets.value);
        const nps = parseInt(sliders.nps.value);
        const spend = parseInt(sliders.spend.value);

        // Update value displays
        displays.recency.innerText = recency;
        displays.tickets.innerText = tickets;
        displays.nps.innerText = nps;
        displays.spend.innerText = spend;

        // Calculate Risk Score (0-100%)
        // Logic:
        // Recency: >90 days increases risk significantly
        // Tickets: >2 increases risk
        // NPS: <7 increases risk
        // Spend: High spend slightly reduces risk (loyalty)

        let score = 0;

        // Recency Component (0-40 points)
        score += (recency / 365) * 40;

        // Tickets Component (0-30 points)
        if (tickets > 0) score += (tickets * 5);

        // NPS Component (0-30 points)
        // NPS 10 = 0 risk, NPS 0 = 30 risk
        score += ((10 - nps) * 3);

        // Spend Mitigation (-10 points max)
        if (spend > 10000) score -= 10;
        else if (spend > 5000) score -= 5;

        // Clamp
        score = Math.max(5, Math.min(99, score));
        score = Math.round(score);

        // Update UI
        resultDisplay.score.innerText = score + "%";

        // Style updates based on risk
        if (score < 30) {
            resultDisplay.status.innerText = "Low Risk";
            resultDisplay.score.style.color = "var(--success)";
            resultDisplay.status.style.color = "var(--success)";
            resultDisplay.box.style.background = "#f0fdf4";
            resultDisplay.box.style.borderColor = "#bbf7d0";
        } else if (score < 70) {
            resultDisplay.status.innerText = "Medium Risk";
            resultDisplay.score.style.color = "#b45309"; // Dark Yellow
            resultDisplay.status.style.color = "#b45309";
            resultDisplay.box.style.background = "#fffbeb";
            resultDisplay.box.style.borderColor = "#fde68a";
        } else {
            resultDisplay.status.innerText = "High Risk";
            resultDisplay.score.style.color = "var(--danger)";
            resultDisplay.status.style.color = "var(--danger)";
            resultDisplay.box.style.background = "#fef2f2";
            resultDisplay.box.style.borderColor = "#fecaca";
        }
    }

    // Attach listeners
    Object.values(sliders).forEach(slider => {
        slider.addEventListener('input', updateSimulation);
    });

    // Init
    updateSimulation();
});
