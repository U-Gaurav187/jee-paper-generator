import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../public/data/questions');

console.log('====================================================');
console.log('🚀 JEE ADVANCED MODULAR QUESTION BANK INGESTION UTILITY');
console.log('====================================================');

// Ensure output directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function validateQuestion(q, index, filename) {
  const errors = [];
  if (!q.id) errors.push(`[${filename}] Question #${index}: Missing 'id'`);
  if (!q.subject) errors.push(`[${filename}] Question #${index}: Missing 'subject'`);
  if (!q.type) errors.push(`[${filename}] Question #${index}: Missing 'type'`);
  
  const validTypes = ['scq', 'mcq', 'numerical', 'paragraph', 'matrix_match'];
  if (q.type && !validTypes.includes(q.type)) {
    errors.push(`[${filename}] Question #${index}: Invalid type '${q.type}'.`);
  }
  return errors;
}

// Recursively find all .json files in public/data/questions/ (excluding index.json)
function getJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getJsonFiles(filePath, fileList);
    } else if (file.endsWith('.json') && file !== 'index.json') {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const allJsonFiles = getJsonFiles(DATA_DIR);
let totalQuestions = 0;
const registeredRelativePaths = [];

allJsonFiles.forEach(filePath => {
  const relPath = path.relative(DATA_DIR, filePath).replace(/\\/g, '/');
  registeredRelativePaths.push(relPath);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(content);
    console.log(`\n📦 Module: [${relPath}]`);
    console.log(`   Questions Count: ${questions.length}`);
    
    let errCount = 0;
    questions.forEach((q, idx) => {
      const errs = validateQuestion(q, idx + 1, relPath);
      if (errs.length > 0) {
        errCount++;
        errs.forEach(e => console.error(`   ❌ ${e}`));
      }
    });

    if (errCount === 0) {
      console.log(`   ✅ Validated successfully.`);
      totalQuestions += questions.length;
    }
  } catch (err) {
    console.error(`   ❌ Error reading ${relPath}:`, err.message);
  }
});

// Update index.json manifest automatically
const indexPath = path.join(DATA_DIR, 'index.json');
fs.writeFileSync(indexPath, JSON.stringify(registeredRelativePaths, null, 2), 'utf8');

console.log('\n====================================================');
console.log(`✨ INGESTION SUMMARY: ${totalQuestions} Questions in ${registeredRelativePaths.length} Topic Modules`);
console.log(`📝 Manifest index.json updated automatically!`);
console.log('====================================================\n');
