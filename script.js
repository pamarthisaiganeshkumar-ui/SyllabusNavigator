document.addEventListener('DOMContentLoaded', () => {
    // Set default exam date to 30 days from now
    const examDateInput = document.getElementById('exam-date');
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);
    examDateInput.value = futureDate.toISOString().split('T')[0];

    // Elements
    const form = document.getElementById('syllabus-form');
    const inputSection = document.getElementById('input-section');
    const resultsSection = document.getElementById('results-section');
    const generateBtn = document.getElementById('generate-btn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const resetBtn = document.getElementById('reset-btn');
    
    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const syllabusText = document.getElementById('syllabus-text').value;
        const examDate = new Date(document.getElementById('exam-date').value);
        const studyHours = document.getElementById('study-hours').value;

        // Basic validation
        if (examDate <= new Date()) {
            alert('Please select a future exam date.');
            return;
        }

        if (syllabusText.trim().length < 20) {
            alert('Please provide a more detailed syllabus.');
            return;
        }

        // Simulate AI Processing
        btnText.textContent = 'Analyzing with AI...';
        btnLoader.classList.remove('hidden');
        generateBtn.disabled = true;

        setTimeout(() => {
            generatePlan(syllabusText, examDate, studyHours);
            
            // UI Transition
            inputSection.classList.add('hidden');
            resultsSection.classList.remove('hidden');
            
            // Reset Button State
            btnText.textContent = 'Generate Study Plan';
            btnLoader.classList.add('hidden');
            generateBtn.disabled = false;
        }, 2000); // 2 second simulated delay
    });

    resetBtn.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
        document.getElementById('syllabus-text').value = '';
    });

    document.getElementById('export-btn').addEventListener('click', () => {
        alert('Exporting to PDF... (This feature would generate a downloadable PDF of the study plan)');
    });

    function generatePlan(text, examDate, hours) {
        // 1. Parse Syllabus (Basic Mock Parsing)
        // Extract lines that might be topics/units
        const lines = text.split('\n').filter(l => l.trim().length > 5);
        let topics = [];
        
        // Try to identify units/modules, or just use lines
        const unitRegex = /(unit|module|chapter)\s*\d+/i;
        let currentTopic = "";
        
        for (let line of lines) {
            if (unitRegex.test(line)) {
                if (currentTopic) topics.push(currentTopic);
                currentTopic = line;
            } else {
                currentTopic += currentTopic ? " - " + line : line;
            }
        }
        if (currentTopic) topics.push(currentTopic);
        
        // Fallback if no units found
        if (topics.length === 0 || topics.length === 1) {
            topics = lines.slice(0, 10); // Take up to 10 lines as topics
        }

        // Calculate days available
        const today = new Date();
        const diffTime = Math.abs(examDate - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        populateSchedule(topics, diffDays, hours);
        populateResources(topics);
        populateQuestions(topics);
    }

    function populateSchedule(topics, totalDays, dailyHours) {
        const container = document.getElementById('schedule-container');
        container.innerHTML = '';

        // Distribute topics over available days, leaving last 20% for revision
        const studyDays = Math.max(1, Math.floor(totalDays * 0.8));
        const revisionDays = totalDays - studyDays;
        
        const topicsPerDay = Math.max(1, Math.ceil(topics.length / studyDays));

        let currentDate = new Date();
        let topicIndex = 0;

        for (let i = 0; i < studyDays && topicIndex < topics.length; i++) {
            const dateStr = currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            
            let dayTopics = [];
            for (let j = 0; j < topicsPerDay && topicIndex < topics.length; j++) {
                dayTopics.push(topics[topicIndex]);
                topicIndex++;
            }

            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.style.animation = `slideUp 0.4s ease forwards ${i * 0.1}s`;
            item.style.opacity = '0';
            
            item.innerHTML = `
                <div class="timeline-date">${dateStr}</div>
                <div class="timeline-content">
                    <h4>Study Session (${dailyHours} Hours)</h4>
                    <p>${dayTopics.join('<br> • ')}</p>
                </div>
            `;
            container.appendChild(item);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Add Revision phase
        if (revisionDays > 0) {
            const revDateStr = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' - Exam Day';
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <div class="timeline-date">${revDateStr}</div>
                <div class="timeline-content" style="border-color: var(--success);">
                    <h4>Revision & Practice</h4>
                    <p>Review all topics, solve previous year papers, and take mock tests.</p>
                </div>
            `;
            container.appendChild(item);
        }
    }

    function populateResources(topics) {
        const ytContainer = document.getElementById('youtube-container');
        const notesContainer = document.getElementById('notes-container');
        
        ytContainer.innerHTML = '';
        notesContainer.innerHTML = '';

        // Extract key terms for search (just using first few topics for mock)
        const keyTerms = topics.slice(0, 4).map(t => {
            // Clean up topic string a bit for mock search term
            return t.split('-')[0].replace(/(unit|module|chapter)\s*\d+[:\s]*/i, '').trim() || "Course Topic";
        });

        // Mock YouTube Videos
        keyTerms.forEach((term, index) => {
            if(!term || term.length < 3) term = "Important Concept " + (index+1);
            const li = document.createElement('li');
            li.className = 'resource-item';
            li.innerHTML = `
                <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(term + ' tutorial')}" target="_blank" class="resource-link">
                    <span class="resource-title">${term} - Full Explanation</span>
                    <span class="resource-meta">YouTube • Recommended</span>
                </a>
            `;
            ytContainer.appendChild(li);
        });

        // Mock Notes
        keyTerms.forEach((term, index) => {
            if(!term || term.length < 3) term = "Chapter " + (index+1);
            const li = document.createElement('li');
            li.className = 'resource-item';
            li.innerHTML = `
                <a href="https://www.google.com/search?q=${encodeURIComponent(term + ' filetype:pdf notes')}" target="_blank" class="resource-link">
                    <span class="resource-title">${term} Complete Notes.pdf</span>
                    <span class="resource-meta">PDF Document • 2.4 MB</span>
                </a>
            `;
            notesContainer.appendChild(li);
        });
    }

    function populateQuestions(topics) {
        const container = document.getElementById('questions-container');
        container.innerHTML = '';

        const questionTemplates = [
            "Explain the concept of {topic} with suitable examples.",
            "Differentiate between approaches used in {topic}.",
            "What are the main applications of {topic}?",
            "Describe the architecture and workflow of {topic}."
        ];

        let qCount = 0;
        topics.slice(0, 5).forEach((topic) => {
            const cleanTopic = topic.split('-')[0].replace(/(unit|module|chapter)\s*\d+[:\s]*/i, '').trim();
            if (cleanTopic && cleanTopic.length > 3) {
                const template = questionTemplates[qCount % questionTemplates.length];
                const questionText = template.replace('{topic}', cleanTopic);
                
                const div = document.createElement('div');
                div.className = 'question-item';
                div.innerHTML = `
                    <div class="question-text">Q${qCount + 1}. ${questionText}</div>
                    <div class="question-hint">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        High probability (Asked in 3 previous exams)
                    </div>
                `;
                container.appendChild(div);
                qCount++;
            }
        });
    }
});
