# Flashcard Study App

A simple flashcard application similar to Quizlet/Anki that runs entirely in your browser.

## Features

- CSV file upload with drag and drop support
- Card flipping to reveal answers
- Shuffle functionality for randomized practice
- Keyboard navigation
- Progress tracking
- Fully responsive design

## CSV Format

Your CSV file must follow this structure:

```csv
Topic,Difficulty,Question,Answer
Math,Easy,What is 2+2?,4
Science,Easy,What is H2O?,Water
History,Medium,When did WWI start?,1914
```

If your answer contains commas, wrap it in quotes:
```csv
Topic,Difficulty,Question,Answer
Math,Easy,What is the Pythagorean theorem?,"a² + b² = c²"
```

## Usage

1. Open the app in your browser
2. Upload a CSV file or drag and drop it onto the upload area
3. Click cards to flip between question and answer
4. Use navigation buttons or keyboard shortcuts to move between cards

### Keyboard Shortcuts

- Space / Right Arrow: Flip card or advance to next
- Left Arrow: Go to previous card
- Up/Down Arrow: Flip current card

## Privacy

All processing happens locally in your browser. No data is uploaded or stored externally.