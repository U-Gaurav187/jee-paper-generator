import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../public/data/questions');

console.log('====================================================');
console.log('🚀 JEE ADVANCED QUESTION BANK INGESTION UTILITY');
console.log('====================================================');

// Ensure output directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Function to validate question object schema
function validateQuestion(q, index) {
  const errors = [];
  if (!q.id) errors.push(`Question #${index}: Missing 'id'`);
  if (!q.subject) errors.push(`Question #${index}: Missing 'subject'`);
  if (!q.type) errors.push(`Question #${index}: Missing 'type'`);
  
  const validTypes = ['scq', 'mcq', 'numerical', 'paragraph', 'matrix_match'];
  if (q.type && !validTypes.includes(q.type)) {
    errors.push(`Question #${index}: Invalid type '${q.type}'. Must be one of ${validTypes.join(', ')}`);
  }

  if (q.type === 'scq' || q.type === 'mcq') {
    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push(`Question #${index}: SCQ/MCQ must have options array`);
    }
  }

  if (q.type === 'matrix_match') {
    if (!q.matrixMatch || !q.matrixMatch.column1 || !q.matrixMatch.column2) {
      errors.push(`Question #${index}: Matrix Match must have column1 and column2 arrays`);
    }
  }

  return errors;
}

// Stats counter
let totalQuestions = 0;
const subjects = ['physics', 'chemistry', 'mathematics', 'computer_science'];

subjects.forEach(subject => {
  const filePath = path.join(DATA_DIR, `${subject}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const questions = JSON.parse(content);
      console.log(`\n📦 Subject: [${subject.toUpperCase()}]`);
      console.log(`   File: ${filePath}`);
      console.log(`   Questions Count: ${questions.length}`);
      
      let subjectErrors = 0;
      questions.forEach((q, idx) => {
        const errs = validateQuestion(q, idx + 1);
        if (errs.length > 0) {
          subjectErrors++;
          errs.forEach(e => console.error(`   ❌ ${e}`));
        }
      });

      if (subjectErrors === 0) {
        console.log(`   ✅ All ${questions.length} questions passed schema validation!`);
        totalQuestions += questions.length;
      }
    } catch (err) {
      console.error(`   ❌ Failed to parse ${subject}.json:`, err.message);
    }
  }
});

console.log('\n====================================================');
console.log(`✨ INGESTION SUMMARY: ${totalQuestions} Total Validated JEE Advanced Questions`);
console.log('====================================================\n');
