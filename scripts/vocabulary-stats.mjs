import { allowedWords, answerWords } from '../src/features/termo/words.ts';
import { externalWords } from '../src/features/termo/external-words.ts';

console.log(JSON.stringify({
  acceptedGuesses: allowedWords.size,
  possibleAnswers: answerWords.length,
  importedFiveLetterWords: externalWords.length,
  previousAcceptedGuesses: 3213,
  addedGuesses: allowedWords.size - 3213,
}, null, 2));
