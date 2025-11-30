document.addEventListener('DOMContentLoaded', function () {
    console.log("Script loaded, attaching listener");
    const form = document.getElementById('churnForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log("Form submitted");

            // 1. Get Values
            const recency = parseInt(document.getElementById('recency').value) || 0;
            const frequency = parseInt(document.getElementById('frequency').value) || 0;
            const tickets = parseInt(document.getElementById('tickets').value) || 0;
            const cancellations = parseInt(document.getElementById('cancellations').value) || 0;
            const isLoyalty = document.getElementById('loyalty').checked;
            const isAppUser = document.getElementById('appUser').checked;
 
            console.log("Values:", { recency, frequency, tickets, cancellations, isLoyalty, isAppUser });

            // 2. Simulate Model Logic (Weighted Score)
            // Base Risk
            let riskScore = 0;

            // Recency Impact (More days = Higher Risk)
            // Normalize 0-730 days to 0-40 points
            riskScore += (recency / 730) * 40;

            // Frequency Impact (Less bookings = Higher Risk)
            // Normalize 0-10 bookings. 0 bookings = 30 points, 10+ = 0 points
            if (frequency === 0) riskScore += 30;
            else if (frequency < 3) riskScore += 20;
            else if (frequency < 5) riskScore += 10;

            // Support Tickets (More tickets = Higher Risk)
            // >2 tickets adds significant risk
            if (tickets > 2) riskScore += 15;
            if (tickets > 5) riskScore += 10; // Cumulative

            // Cancellations
            if (cancellations > 0) riskScore += (cancellations * 5);

            // Mitigating Factors (Reduces Risk)
            if (isLoyalty) riskScore -= 15;
            if (isAppUser) riskScore -= 10;

            // Clamp Score 0-100
            riskScore = Math.max(0, Math.min(100, riskScore));
            riskScore = Math.round(riskScore);

            console.log("Calculated Risk Score:", riskScore);

            // 3. Update UI
            updateGauge(riskScore);
            updateRecommendation(riskScore, recency, tickets);
        });
    } else {
        console.error("Form not found!");
    }
});

function updateGauge(score) {
    const gaugeFill = document.getElementById('gaugeFill');
    const riskScoreText = document.getElementById('riskScore');
    const riskBadge = document.getElementById('riskBadge');

    // Animate Counter
    let current = 0;
    const timer = setInterval(() => {
        current += 1;
        riskScoreText.innerText = current + "%";
        if (current >= score) clearInterval(timer);
    }, 10);

    // Rotate Gauge
    // 0% = -0.25turn (hidden left)
    // 100% = 0.25turn (full right) -> actually logic needs to map 0-100 to rotation
    // Let's use a simpler CSS rotation logic for the semi-circle
    // 0% = 0deg, 100% = 180deg. But our CSS is set up for conic gradient.
    // Let's just use the conic gradient percentage for simplicity in this demo if we were using that, 
    // but here we are rotating a div.

    // Simpler visual approach for the gauge fill:
    // We will just update the text and badge for now as the CSS rotation is complex to get perfect without SVG.
    // But let's try to set the rotation.
    // -135deg to +45deg is a common gauge sweep.

    // Let's just update the text and badge color.
    riskScoreText.innerText = score + "%";

    if (score < 30) {
        riskBadge.innerText = "Low Risk";
        riskBadge.className = "risk-badge low";
        riskScoreText.style.color = "var(--accent-green)";
    } else if (score < 70) {
        riskBadge.innerText = "Medium Risk";
        riskBadge.className = "risk-badge"; // default gray/yellowish
        riskScoreText.style.color = "var(--accent-gold)";
    } else {
        riskBadge.innerText = "High Risk";
        riskBadge.className = "risk-badge high";
        riskScoreText.style.color = "var(--accent-red)";
    }
}

function updateRecommendation(score, recency, tickets) {
    const recText = document.getElementById('recommendationText');

    if (score < 30) {
        recText.innerHTML = "Customer is <strong>Healthy</strong>. <br>Action: Send 'Thank You' note and upcoming seasonal deals to maintain engagement.";
    } else if (score < 70) {
        if (recency > 180) {
            recText.innerHTML = "Customer is <strong>Drifting</strong>. <br>Action: Trigger 'We Miss You' campaign with a 10% discount code.";
        } else {
            recText.innerHTML = "Customer is <strong>At Risk</strong>. <br>Action: Enroll in loyalty program nurture sequence.";
        }
    } else {
        if (tickets > 2) {
            recText.innerHTML = "<strong>CRITICAL: Service Failure</strong>. <br>Action: Escalate to Support Manager immediately for personal outreach.";
        } else {
            recText.innerHTML = "<strong>CRITICAL: High Churn Probability</strong>. <br>Action: Offer immediate retention bonus (e.g., Free Upgrade) via SMS/Call.";
        }
    }
}
