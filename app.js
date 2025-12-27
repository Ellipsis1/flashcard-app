let flashcards = [];
let allFlashcards = [];
let currentIndex = 0;
let isFlipped = false;
let reviewMode = false;
let isSignUpMode = false;
let currentUser = null;
let currentDeckId = null;

document.addEventListener('DOMContentLoaded', () => {


    const uploadSection = document.getElementById('uploadSectionDecks');
    const fileInput = document.getElementById('fileInputDecks');
    const flashcard = document.getElementById('flashcard');

// Upload section click
    uploadSection.addEventListener('click', () => fileInput.click());

// Drag and drop
    uploadSection.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadSection.classList.add('dragover');
    });

    uploadSection.addEventListener('dragleave', () => {
        uploadSection.classList.remove('dragover');
    });

    uploadSection.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadSection.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            handleFile(file);
        }
    });

// Control Button Event Listeners
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) prevBtn.addEventListener('click', previousCard);

    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) nextBtn.addEventListener('click', nextCard);

    const shuffleBtn = document.getElementById('shuffleBtn');
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleCards);

    const reviewModeBtn = document.getElementById('reviewModeBtn');
    if (reviewModeBtn) reviewModeBtn.addEventListener('click', toggleReviewMode);

    const backToDecksBtn = document.getElementById('backToDecksBtn');
    if (backToDecksBtn) backToDecksBtn.addEventListener('click', backToDecks);

    const reviewBtn = document.getElementById('reviewBtn');
    if (reviewBtn) reviewBtn.addEventListener('click', toggleReview);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const logoutBtnDeckList = document.getElementById('logoutBtnDeckList');
    if (logoutBtnDeckList) {
        logoutBtnDeckList.addEventListener('click', logout);
    }

// File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

// Flashcard click to flip
    flashcard.addEventListener('click', flipCard);

    function handleFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target.result;
            const filename = file.name.replace('.csv', '');
            parseCSV(csv, filename);
        };
        reader.readAsText(file);
    }

// Save deck to Firestore
    async function saveDeck(deckName, cards){
        if (!currentUser) {
            console.log('No user logged in, skipping save.')
            return;
        }

        try {
            const existingDecks = await db.collection('users')
                .doc(currentUser.uid)
                .collection('decks')
                .where('name', '==', deckName)
                .get();
            if (!existingDecks.empty) {
                const replace = confirm(`A deck named "${deckName}" already exists. Do you want to replace it?\n\nOK = Replace\nCancel = Keep both`);

                if (replace) {
                    const existingDeckId= existingDecks.docs[0].id;
                    await db.collection('users')
                        .doc(currentUser.uid)
                        .collection('decks')
                        .doc(existingDeckId)
                        .update({
                            cards: cards,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    console.log('Deck replaced:', deckName);
                } else {
                    // Create new deck with modified name
                    let newName = deckName;
                    let counter = 2;

                    // Keep checking until we find an unused name
                    while (true) {
                        newName = `${deckName} (${counter})`;
                        const check = await db.collection('users')
                            .doc(currentUser.uid)
                            .collection('decks')
                            .where('name', '==', newName)
                            .get();

                        if (check.empty) break;
                        counter++;
                    }

                    await db.collection('users')
                        .doc(currentUser.uid)
                        .collection('decks')
                        .add({
                            name: newName,
                            cards: cards,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    console.log('Deck saved as:', newName);
                }
            } else {
                await db.collection('users')
                    .doc(currentUser.uid)
                    .collection('decks')
                    .add({
                        name: deckName,
                        cards: cards,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                console.log('Deck saved successfully:', deckName);
            }
        } catch (error) {
            console.log('Error Saving Deck', error);
            alert('Failed to save deck: ' + error.message);
        }
    }

// Convert CSV text to cards array
    function csvToCards(csv) {
        const lines = csv.split('\n').filter(line => line.trim());
        // Skip header row
        const dataLines = lines.slice(1);

        return dataLines.map(line => {
            const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
            if (matches && matches.length >= 4) {
                return {
                    topic: matches[0].replace(/"/g, '').trim(),
                    difficulty: matches[1].replace(/"/g, '').trim(),
                    question: matches[2].replace(/"/g, '').trim(),
                    answer: matches[3].replace(/"/g, '').trim(),
                    needsReview: false
                };
            }
            return null;
        }).filter(card => card !== null);
    }

// Parse CSV
    async function parseCSV(csv, deckName) {
        flashcards = csvToCards(csv);

        if (flashcards.length > 0) {
            await saveDeck(deckName, flashcards);
            loadDecks();
        } else {
            alert('No valid flashcards found in the CSV file. Please check the format.');
        }
    }

    function showCard() {
        if (flashcards.length === 0) return;

        const card = flashcards[currentIndex];
        document.getElementById('topic').textContent = card.topic;

        const difficultyElement = document.getElementById('difficulty');
        if (difficultyElement && card.difficulty) {
            difficultyElement.textContent = card.difficulty;

// Set background color based on difficulty
            const difficulty = card.difficulty.toLowerCase();
            if (difficulty === 'easy') {
                difficultyElement.style.background = '#2ecc71'; // Green
            } else if (difficulty === 'medium') {
                difficultyElement.style.background = '#f39c12'; // Orange
            } else if (difficulty === 'hard') {
                difficultyElement.style.background = '#e74c3c'; // Red
            } else {
                difficultyElement.style.background = '#667eea'; // Default purple
            }
        }

        document.getElementById('currentCard').textContent = currentIndex + 1;
        document.getElementById('totalCards').textContent = flashcards.length;
        document.getElementById('progress').textContent =
            Math.round(((currentIndex + 1) / flashcards.length) * 100) + '%';

        isFlipped = false;
        document.getElementById('cardContent').innerHTML =
            `<div class="question">${card.question}</div>`;

// Update button states
        document.getElementById('prevBtn').disabled = currentIndex === 0;
        document.getElementById('nextBtn').disabled = currentIndex === flashcards.length - 1;
        updateReviewBtn()
    }

    function flipCard() {
        const card = flashcards[currentIndex];
        const cardContent = document.getElementById('cardContent');

        if (!isFlipped) {
            cardContent.innerHTML = `<div class="answer">${card.answer}</div>`;
        } else {
            cardContent.innerHTML = `<div class="question">${card.question}</div>`;
        }
        isFlipped = !isFlipped;
    }

    function toggleReview(event) {
        event.stopPropagation();

        flashcards[currentIndex].needsReview = !flashcards[currentIndex].needsReview;

        updateReviewBtn();
        updateReviewCount();
        saveReviewState();

        if (reviewMode && !flashcards[currentIndex].needsReview) {
            const reviewCount = allFlashcards.filter(card => card.needsReview).length;

            if (reviewCount === 0) {
                toggleReviewMode();
            } else {
                flashcards = allFlashcards.filter(card => card.needsReview);

                if (currentIndex >= flashcards.length) {
                    currentIndex = 0;
                }

                showCard()
            }

        }
    }

    function updateReviewBtn() {
        const button = document.getElementById('reviewBtn');
        if (flashcards[currentIndex].needsReview) {
            button.textContent = '✓ Marked for Review'
            button.style.background = '#e74c3c';
        } else {
            button.textContent = '⚑ Mark for Review';
            button.style.background = '#f39c12';
        }
    }

    function updateReviewCount() {
        const count = allFlashcards.filter(card => card.needsReview).length;
        document.getElementById('reviewCount').textContent = count;

        const reviewModeBtn = document.getElementById('reviewModeBtn');
        reviewModeBtn.disabled = (count === 0);
    }

    function toggleReviewMode() {
        reviewMode = !reviewMode;
        const button = document.getElementById('reviewModeBtn');
        const currentCard = flashcards[currentIndex];

        if (reviewMode) {
            flashcards = allFlashcards.filter(card => card.needsReview);
            button.textContent = 'Show All Cards'
            currentIndex = 0
        } else {
            flashcards = allFlashcards;
            button.textContent = 'Show Review Cards';

            const newIndex = flashcards.indexOf(currentCard)
            currentIndex = (newIndex !== -1) ? newIndex : 0;
        }

        showCard();
    }

    function nextCard() {
        if (currentIndex < flashcards.length - 1) {
            currentIndex++;
            showCard();
        }
    }

    function previousCard() {
        if (currentIndex > 0) {
            currentIndex--;
            showCard();
        }
    }

    function shuffleCards() {
        for (let i = flashcards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [flashcards[i], flashcards[j]] = [flashcards[j], flashcards[i]];
        }
        currentIndex = 0;
        showCard();
    }

    function backToDecks() {
        saveReviewState()
        document.getElementById('flashcardContainer').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'none';
        document.getElementById('deckListContainer').style.display = 'block';
        loadDecks();
    }

// Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (flashcards.length === 0) return;

        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            if (isFlipped) {
                nextCard();
            } else {
                flipCard();
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            previousCard();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            flipCard();
        }
    });

// Handle auth form submission
    document.getElementById('authForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;

        try {
            if (isSignUpMode) {
                await auth.createUserWithEmailAndPassword(email, password)
                console.log('User signed up successfully');
                const response = await fetch('wine_flashcards.csv');
                const csv = await response.text();
                const sampleCards = csvToCards(csv);
                await saveDeck('Wine Flashcards', sampleCards);

            } else {
                await auth.signInWithEmailAndPassword(email, password)
                console.log('User signed in successfully');
            }
        } catch (error) {
            console.error('Auth error', error.message);
            alert(error.message);
        }
    })

// Toggle between sign in and sign up modes
    document.getElementById('toggleAuthMode').addEventListener('click', () => {
        isSignUpMode = !isSignUpMode;

        const submitBtn = document.getElementById('authSubmitBtn');
        const toggleText = document.getElementById('toggleAuthMode');
        const title = document.querySelector('.modal-content h2');
        const subtitle = document.querySelector('.modal-subtitle');
        const authToggle = document.querySelector('.auth-toggle');

        if (isSignUpMode) {
            // Switch to Sign Up Mode
            submitBtn.textContent = 'Sign up';
            toggleText.textContent = 'Sign In';
            title.textContent = 'Create Account';
            subtitle.textContent = 'Sign up to save your progress'
            authToggle.firstChild.textContent = 'Already have an account? ';
        } else {
            // Switch to Sign In Mode
            submitBtn.textContent = 'Sign In';
            toggleText.textContent = 'Sign Up';
            title.textContent = 'Welcome to the Flashcard Study App';
            subtitle.textContent = 'Sign in to save your progress'
            authToggle.firstChild.textContent = "Don't have an account? ";
        }
    });

// Check Authentication State
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        const logoutBtn = document.getElementById('logoutBtn');

        if (user) {
            console.log('User logged in:', user.email);
            document.getElementById('authModal').style.display = 'none';
            document.getElementById('deckListContainer').style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'block';
            loadDecks()
        } else {
            console.log('User logged out');
            document.getElementById('authModal').style.display = 'flex';
            document.getElementById('deckListContainer').style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    });

// Load user's decks from Firestore
async function loadDecks() {
    if (!currentUser) return;

    try {
        const snapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('decks')
            .orderBy('createdAt', 'desc')
            .get();

        const deckGrid = document.getElementById('deckGrid');
        deckGrid.innerHTML = '';

        if (snapshot.empty) {
            deckGrid.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">No decks yet. Upload a CSV to get started!</p>';
            return;
        }

        snapshot.forEach((doc) => {
            const deck = doc.data();
            const deckCard = document.createElement('div')
            deckCard.className = 'deck-card';
            deckCard.innerHTML = `
                <h3>${deck.name}</h3>
                <div class="deck-card-info">
                    ${deck.cards.length} cards
                </div>
                <button class="delete-deck-btn">🗑️ Delete</button>
            `;
            deckCard.addEventListener('click', () => loadDeck(doc.id,deck));

            const deleteBtn = deckCard.querySelector('.delete-deck-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteDeck(doc.id, deck.name);
            });
            deckGrid.appendChild(deckCard);
        });

    } catch (error) {
        console.error('Error loading decks', error);
    }
}

// Load specific deck for studying
    function loadDeck(deckId, deckData) {
        currentDeckId = deckId;
        flashcards = deckData.cards;
        allFlashcards = [...flashcards];
        const reviewMode = deckData.reviewMode || false;
        const button = document.getElementById('reviewModeBtn');
        if (button) {
            if (reviewMode) {
                flashcards = allFlashcards.filter(card => card.needsReview);
                button.textContent = 'Show All Cards';
            } else {
                button.textContent = 'Show Review Cards';
            }
        }
        currentIndex = deckData.lastIndex || 0;
        if (currentIndex >= flashcards.length) {
            currentIndex = 0;
        }
        document.getElementById('deckListContainer').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'block';
        document.getElementById('flashcardContainer').style.display = 'block';

        showCard();
        updateReviewCount();
    }

// Save review state for Firestore
    async function saveReviewState() {
        if (!currentUser || !currentDeckId) return;

        try {
            await db.collection('users')
                .doc(currentUser.uid)
                .collection('decks')
                .doc(currentDeckId)
                .update({
                    cards: allFlashcards,
                    lastIndex: currentIndex,
                    reviewMode: reviewMode
            });
        } catch (error) {
            console.error('Error saving review state', error);
        }
    }

// Delete a deck
    async function deleteDeck(deckId, deckName) {
        // Confirm deletion
        const confirmed = confirm(`Are you sure you want to delete "${deckName}"? This cannot be undone.`);

        if (!confirmed) {
            return;
        }

        try {
            await db.collection('users')
                .doc(currentUser.uid)
                .collection('decks')
                .doc(deckId)
                .delete();

            console.log('Deck deleted:', deckName);

            loadDecks();
        } catch (error) {
            console.error('Error deleting deck', error);
            alert('Failed to delete deck' + error.message);
        }
    }

    // Logout function
    function logout() {
        auth.signOut()
            .then(() => {
                console.log('User logged out');
            })
            .catch((error) => {
                console.error('Logout error:', error);
            });
    }

})