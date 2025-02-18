// Financial Support Assessment Logic

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('financialAssessmentForm');
    const resultsSection = document.getElementById('assessmentResults');
    
    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Gather form data
        const formData = {
            monthlyIncome: parseFloat(document.getElementById('monthlyIncome').value),
            employmentStatus: document.querySelector('input[name="employmentStatus"]:checked').value,
            preferredLocation: document.getElementById('preferredLocation').value,
            maxBudget: parseFloat(document.getElementById('maxBudget').value),
            existingLoans: document.querySelector('input[name="existingLoans"]:checked').value,
            creditScore: document.getElementById('creditScore').value ? parseInt(document.getElementById('creditScore').value) : null
        };
        
        // Generate and display recommendations
        const recommendations = generateRecommendations(formData);
        displayResults(recommendations);
    });
    
    // Generate recommendations based on user input
    function generateRecommendations(data) {
        const recommendations = {
            eligibleSchemes: [],
            suggestions: [],
            affordabilityScore: calculateAffordabilityScore(data)
        };
        
        // Check eligibility for various schemes
        if (data.monthlyIncome <= 25000) {
            recommendations.eligibleSchemes.push({
                name: "Pradhan Mantri Awas Yojana (PMAY)",
                description: "Government housing scheme for economically weaker sections",
                benefit: "Up to ₹2.67 lakh subsidy on home loans"
            });
        }
        
        if (data.monthlyIncome <= 50000 && data.employmentStatus !== 'unemployed') {
            recommendations.eligibleSchemes.push({
                name: "Credit Linked Subsidy Scheme (CLSS)",
                description: "Interest subsidy on housing loans",
                benefit: "Interest subsidy of 6.5% for a loan amount up to ₹6 lakh"
            });
        }
        
        // Add financial suggestions
        if (data.maxBudget > data.monthlyIncome * 0.4) {
            recommendations.suggestions.push(
                "Consider allocating no more than 40% of your monthly income to housing expenses"
            );
        }
        
        if (data.existingLoans === 'yes') {
            recommendations.suggestions.push(
                "Review your existing loan commitments and consider debt consolidation options"
            );
        }
        
        // Location-based suggestions
        switch(data.preferredLocation) {
            case 'urban':
                recommendations.suggestions.push(
                    "Look for affordable housing projects in suburban areas with good connectivity"
                );
                break;
            case 'suburban':
                recommendations.suggestions.push(
                    "Consider government housing schemes specifically designed for suburban development"
                );
                break;
            case 'rural':
                recommendations.suggestions.push(
                    "Explore rural housing schemes and agricultural land conversion opportunities"
                );
                break;
        }
        
        return recommendations;
    }
    
    // Calculate affordability score (0-100)
    function calculateAffordabilityScore(data) {
        let score = 0;
        
        // Income to budget ratio (40 points)
        const budgetRatio = data.maxBudget / data.monthlyIncome;
        if (budgetRatio <= 0.3) score += 40;
        else if (budgetRatio <= 0.4) score += 30;
        else if (budgetRatio <= 0.5) score += 20;
        else score += 10;
        
        // Employment status (20 points)
        switch(data.employmentStatus) {
            case 'employed':
                score += 20;
                break;
            case 'partTime':
                score += 15;
                break;
            case 'selfEmployed':
                score += 15;
                break;
            case 'unemployed':
                score += 5;
                break;
        }
        
        // Existing loans (20 points)
        if (data.existingLoans === 'no') score += 20;
        else score += 10;
        
        // Credit score (20 points)
        if (data.creditScore) {
            if (data.creditScore >= 750) score += 20;
            else if (data.creditScore >= 650) score += 15;
            else if (data.creditScore >= 550) score += 10;
            else score += 5;
        } else {
            score += 10; // Neutral score if credit score is unknown
        }
        
        return score;
    }
    
    // Display results in the UI
    function displayResults(recommendations) {
        const resultsContent = document.querySelector('.results-content');
        
        // Create results HTML
        let html = `
            <div class="affordability-score mb-4">
                <h4>Your Affordability Score</h4>
                <div class="progress">
                    <div class="progress-bar bg-success" role="progressbar" 
                         style="width: ${recommendations.affordabilityScore}%" 
                         aria-valuenow="${recommendations.affordabilityScore}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                        ${recommendations.affordabilityScore}/100
                    </div>
                </div>
            </div>
        `;
        
        // Add eligible schemes
        if (recommendations.eligibleSchemes.length > 0) {
            html += `
                <div class="eligible-schemes mb-4">
                    <h4>Eligible Financial Schemes</h4>
                    <div class="list-group">
                        ${recommendations.eligibleSchemes.map(scheme => `
                            <div class="list-group-item">
                                <h5 class="mb-1">${scheme.name}</h5>
                                <p class="mb-1">${scheme.description}</p>
                                <small class="text-success"><strong>Benefit:</strong> ${scheme.benefit}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Add suggestions
        if (recommendations.suggestions.length > 0) {
            html += `
                <div class="suggestions">
                    <h4>Financial Suggestions</h4>
                    <ul class="list-group">
                        ${recommendations.suggestions.map(suggestion => `
                            <li class="list-group-item">
                                <i class="fas fa-lightbulb text-warning me-2"></i>
                                ${suggestion}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Update the results section
        resultsContent.innerHTML = html;
        resultsSection.style.display = 'block';
        
        // Smooth scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
});

// Mock data for government schemes
const governmentSchemes = [
    {
        id: 1,
        name: "Pradhan Mantri Awas Yojana (PMAY)",
        description: "Government scheme providing affordable housing for economically weaker sections",
        eligibility: "Income up to ₹3 lakhs per annum",
        benefits: "Interest subsidy up to 6.5%",
        website: "https://pmaymis.gov.in/"
    },
    {
        id: 2,
        name: "Credit Linked Subsidy Scheme (CLSS)",
        description: "Interest subsidy on housing loans for first-time homebuyers",
        eligibility: "First-time homebuyers from EWS/LIG/MIG categories",
        benefits: "Interest subsidy from 3% to 6.5%",
        website: "https://www.nhb.org.in/government-scheme/"
    }
];

// Mock data for NGOs
const ngoList = [
    {
        id: 1,
        name: "Housing for All Foundation",
        description: "Provides housing support and guidance for low-income families",
        areas: ["Bangalore", "Mumbai", "Delhi"],
        contact: {
            phone: "+91 98765 43210",
            email: "info@housingforall.org"
        }
    },
    {
        id: 2,
        name: "Shelter Support India",
        description: "Assists in finding affordable housing solutions",
        areas: ["Chennai", "Hyderabad", "Pune"],
        contact: {
            phone: "+91 98765 43211",
            email: "contact@sheltersupport.org"
        }
    }
];

// Mock data for testimonials
const testimonials = [
    {
        id: 1,
        name: "Rajesh Kumar",
        location: "Bangalore",
        image: "../../assets/images/testimonial1.jpg",
        quote: "Thanks to Kudil's financial guidance, I was able to secure my dream home through PMAY scheme."
    },
    {
        id: 2,
        name: "Priya Sharma",
        location: "Mumbai",
        image: "../../assets/images/testimonial2.jpg",
        quote: "The loan calculator helped me plan my finances better. Now I'm a proud homeowner!"
    }
];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all sections
    initializeGovernmentSchemes();
    initializeNGOSupport();
    initializeLoanCalculator();
    initializeTestimonials();
    initializeChatbot();
});

// Government Schemes Section
function initializeGovernmentSchemes() {
    const container = document.querySelector('.schemes-container');
    if (!container) return;

    const schemesHTML = governmentSchemes.map(scheme => `
        <div class="scheme-card">
            <span class="scheme-badge">Government Scheme</span>
            <h3>${scheme.name}</h3>
            <p>${scheme.description}</p>
            <div class="scheme-details">
                <p><strong>Eligibility:</strong> ${scheme.eligibility}</p>
                <p><strong>Benefits:</strong> ${scheme.benefits}</p>
            </div>
            <a href="${scheme.website}" target="_blank" class="btn btn-outline-primary mt-3">Learn More</a>
        </div>
    `).join('');

    container.innerHTML = schemesHTML;
}

// NGO Support Section
function initializeNGOSupport() {
    const container = document.querySelector('.ngo-container');
    if (!container) return;

    const ngoHTML = ngoList.map(ngo => `
        <div class="ngo-card">
            <h3>${ngo.name}</h3>
            <p>${ngo.description}</p>
            <div class="ngo-areas">
                <strong>Areas of Operation:</strong>
                <p>${ngo.areas.join(', ')}</p>
            </div>
            <div class="ngo-contact">
                <strong>Contact Information:</strong>
                <p>
                    <i class="fas fa-phone"></i> ${ngo.contact.phone}<br>
                    <i class="fas fa-envelope"></i> ${ngo.contact.email}
                </p>
            </div>
        </div>
    `).join('');

    container.innerHTML = ngoHTML;
}

// Loan Calculator
function initializeLoanCalculator() {
    const form = document.getElementById('loanCalculatorForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const propertyValue = parseFloat(document.getElementById('propertyValue').value);
        const downPayment = parseFloat(document.getElementById('downPayment').value);
        const loanTerm = parseFloat(document.getElementById('loanTerm').value);
        const interestRate = parseFloat(document.getElementById('interestRate').value);

        const loanAmount = propertyValue - downPayment;
        const monthlyRate = interestRate / 1200; // Convert annual rate to monthly decimal
        const numberOfPayments = loanTerm * 12;

        // Calculate EMI using the formula: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
        const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) 
                   / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        const totalAmount = emi * numberOfPayments;
        const totalInterest = totalAmount - loanAmount;

        displayCalculationResults(emi, loanAmount, totalInterest, totalAmount);
    });
}

function displayCalculationResults(emi, loanAmount, totalInterest, totalAmount) {
    const resultsDiv = document.getElementById('calculationResults');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = `
        <div class="result-item">
            <h4>Loan Amount</h4>
            <div class="result-value">₹${loanAmount.toFixed(2)}</div>
        </div>
        <div class="result-item">
            <h4>Monthly EMI</h4>
            <div class="result-value">₹${emi.toFixed(2)}</div>
        </div>
        <div class="result-item">
            <h4>Total Interest</h4>
            <div class="result-value">₹${totalInterest.toFixed(2)}</div>
        </div>
        <div class="result-item">
            <h4>Total Amount Payable</h4>
            <div class="result-value">₹${totalAmount.toFixed(2)}</div>
        </div>
    `;
}

// Testimonials Section
function initializeTestimonials() {
    const container = document.querySelector('.carousel-inner');
    if (!container) return;

    const testimonialsHTML = testimonials.map((testimonial, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <div class="testimonial-card">
                <img src="${testimonial.image}" alt="${testimonial.name}" class="testimonial-image">
                <p class="testimonial-quote">"${testimonial.quote}"</p>
                <p class="testimonial-author">${testimonial.name}</p>
                <p class="testimonial-location">${testimonial.location}</p>
            </div>
        </div>
    `).join('');

    container.innerHTML = testimonialsHTML;
}

// Chatbot functionality
function initializeChatbot() {
    // Initialize chatbot with a welcome message
    const messages = document.querySelector('.chatbot-messages');
    if (messages) {
        messages.innerHTML = `
            <div class="chat-message bot-message">
                <p>Hello! I'm here to help you with any questions about housing financial support. How can I assist you today?</p>
            </div>
        `;
    }
}

function toggleChatbot() {
    const chatWindow = document.querySelector('.chatbot-window');
    if (chatWindow) {
        chatWindow.style.display = chatWindow.style.display === 'none' ? 'block' : 'none';
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const messages = document.querySelector('.chatbot-messages');
    
    if (!input || !messages || !input.value.trim()) return;

    // Add user message
    messages.innerHTML += `
        <div class="chat-message user-message">
            <p>${input.value}</p>
        </div>
    `;

    // Simple bot response
    messages.innerHTML += `
        <div class="chat-message bot-message">
            <p>Thank you for your message. Our team will get back to you soon.</p>
        </div>
    `;

    // Clear input
    input.value = '';
    
    // Scroll to bottom
    messages.scrollTop = messages.scrollHeight;
}
