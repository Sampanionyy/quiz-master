// Timer configuration (2 minutes = 120 seconds)
let timeLeft = 120;
const totalTime = timeLeft;
let timerInterval;
const totalQuestions = parseInt("{{ total_questions }}");
const TIMER_RING_CIRCUMFERENCE = 213.6;

// Format time display
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Update the circular timer ring and its color state
function updateTimerRing() {
    const ring = document.getElementById('timerRingProgress');
    const section = document.querySelector('.timer-section');
    if (!ring || !section) return;

    const progress = Math.max(timeLeft, 0) / totalTime;
    ring.style.strokeDashoffset = TIMER_RING_CIRCUMFERENCE * (1 - progress);

    section.classList.toggle('warning', timeLeft <= 30 && timeLeft > 10);
    section.classList.toggle('danger', timeLeft <= 10);
}

// Update timer display
function updateTimer() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = formatTime(timeLeft);
    updateTimerRing();

    // Warning state when less than 30 seconds
    if (timeLeft <= 30) {
        timerElement.classList.add('warning');
    }

    // Time's up
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        showTimeUpModal();
        setTimeout(() => {
            document.getElementById('quizForm').submit();
        }, 2000);
    }

    timeLeft--;
}

// Show time's up modal
function showTimeUpModal() {
    document.getElementById('timeUpModal').classList.add('show');
}

// Update progress
function updateProgress() {
    const form = document.getElementById('quizForm');
    const answeredQuestions = new Set();

    // Count unique answered questions
    const inputs = form.querySelectorAll('input[type="radio"]:checked');
    inputs.forEach(input => {
        answeredQuestions.add(input.name);
    });

    const count = answeredQuestions.size;
    const percentage = (count / totalQuestions) * 100;

    document.getElementById('answeredCount').textContent = count;
    document.getElementById('currentQuestion').textContent = count;
    document.getElementById('progressFill').style.width = percentage + '%';

    document.querySelectorAll('.progress-dot').forEach(dot => {
        dot.classList.toggle('filled', parseInt(dot.dataset.dot, 10) <= count);
    });
}

// Start timer when page loads
window.addEventListener('load', () => {
    updateTimer(); // Initial display
    timerInterval = setInterval(updateTimer, 1000);
    updateProgress(); // Initial progress
});

// Prevent form submission without confirmation
document.getElementById('quizForm').addEventListener('submit', (e) => {
    const form = e.target;
    const answeredQuestions = new Set();

    const inputs = form.querySelectorAll('input[type="radio"]:checked');
    inputs.forEach(input => {
        answeredQuestions.add(input.name);
    });

    if (answeredQuestions.size < totalQuestions) {
        e.preventDefault();
        showConfirmDialog(
            `Tu n'as répondu qu'à ${answeredQuestions.size} questions sur ${totalQuestions}. Veux-tu vraiment soumettre ?`,
            { confirmText: 'Soumettre', cancelText: 'Continuer le quiz' }
        ).then((confirmed) => {
            if (confirmed) {
                form.submit();
            }
        });
    }
});