# Flashcard Study App

A full-stack flashcard application for creating, managing, and studying custom flashcard decks. Built with vanilla JavaScript and Firebase.

## Features

### User Authentication
- Secure sign up and login with email/password
- User-specific data isolation
- Persistent sessions across devices

### Deck Management
- Upload multiple CSV files as separate decks
- Automatic duplicate detection (replace or keep both)
- Delete decks with confirmation
- Sample deck provided for new users
- Decks saved to cloud database

### Study Features
- Card flipping to reveal answers
- Navigate between cards (previous/next)
- Shuffle deck for randomized practice
- Review mode - mark cards for review and filter to study only marked cards
- Difficulty-based color coding (Easy/Medium/Hard)
- Progress tracking per deck
- Keyboard shortcuts for efficient studying

### Data Persistence
- Review state saved across sessions
- Last card position remembered per deck
- Review mode state preserved
- All progress synced to Firebase

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Firebase Authentication, Firestore Database
- **Hosting**: GitHub Pages

## CSV Format

Your CSV file must follow this structure:

```csv
Topic,Difficulty,Question,Answer
Math,Easy,What is 2+2?,4
Science,Medium,What is H2O?,Water
History,Hard,When did WWI start?,1914
```

**Requirements:**
- First row must be the header: `Topic,Difficulty,Question,Answer`
- Difficulty must be: Easy, Medium, or Hard
- If your answer contains commas, wrap it in quotes

**Example with quotes:**
```csv
Topic,Difficulty,Question,Answer
Math,Medium,What is the Pythagorean theorem?,"a² + b² = c²"
Wine,Easy,What are the main types of grapes?,"Red grapes, white grapes, and table grapes"
```

## Usage

### Getting Started
1. Open the app at https://ellipsis1.github.io/flashcard-app/
2. Sign up for a new account or log in
3. New users automatically receive a sample Wine Flashcards deck

### Managing Decks
1. Click "Upload New Deck" to add a CSV file
2. Drag and drop or browse for your CSV file
3. If a deck with the same name exists, choose to replace it or keep both
4. Click any deck card to start studying

### Studying
1. Click a flashcard to flip and see the answer
2. Use Previous/Next buttons or arrow keys to navigate
3. Click "Mark for Review" to flag difficult cards
4. Click "Show Review Cards" to filter and study only flagged cards
5. Click "Shuffle" to randomize card order
6. Your progress is automatically saved

### Keyboard Shortcuts

- **Space / Right Arrow**: Flip card or advance to next
- **Left Arrow**: Go to previous card
- **Up/Down Arrow**: Flip current card

## Deployment

### Prerequisites
- Firebase project with Authentication and Firestore enabled
- GitHub account

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/flashcard-app.git
   cd flashcard-app
   ```

2. **Configure Firebase**
    - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
    - Enable Email/Password authentication
    - Create a Firestore database in test mode
    - Copy your Firebase config from Project Settings
    - Update `firebase-config.js` with your credentials

3. **Deploy to GitHub Pages**
    - Push code to your GitHub repository
    - Go to repository Settings → Pages
    - Select source: main branch
    - Your app will be live at `https://[username].github.io/[repo-name]/`

## File Structure

```
flashcard-app/
├── index.html              # Main HTML structure
├── styles.css              # All styling
├── app.js                  # Application logic
├── firebase-config.js      # Firebase initialization
├── wine_flashcards.csv     # Sample deck for new users
└── README.md               # This file
```

## Security Notes

- Firebase API keys in the config are intentionally public
- Security is enforced through Firestore security rules
- Each user can only access their own decks
- Consider updating Firestore rules from test mode to production rules

## Browser Support

Works in all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Opera

## Privacy

- User data is stored in Firebase Firestore
- Only you can access your decks and progress
- No analytics or tracking
- Data is encrypted in transit and at rest

## Future Enhancements

Potential features for future development:
- Spaced repetition algorithm
- Study statistics and analytics
- Deck sharing between users
- Export decks to CSV
- Mobile app version
- Multiple study modes (matching, multiple choice)

## License

Free to use and modify for personal and educational purposes.

## Contributing

Contributions, issues, and feature requests are welcome!