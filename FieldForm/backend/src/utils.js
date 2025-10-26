// backend/src/utils.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const SCHEMAS_FILE = path.join(DATA_DIR, 'schemas.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

/**
 * Read JSON file safely
 */
function readJSONFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return {};
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return {};
  }
}

/**
 * Write JSON file safely
 */
function writeJSONFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Get all schemas
 */
function getAllSchemas() {
  return readJSONFile(SCHEMAS_FILE);
}

/**
 * Get schema by ID
 */
function getSchemaById(id) {
  const schemas = getAllSchemas();
  return schemas[id] || null;
}

/**
 * Save schema
 */
function saveSchema(id, schemaData) {
  const schemas = getAllSchemas();
  schemas[id] = {
    id,
    ...schemaData,
    createdAt: new Date().toISOString()
  };
  return writeJSONFile(SCHEMAS_FILE, schemas);
}

/**
 * Get all submissions
 */
function getAllSubmissions() {
  return readJSONFile(SUBMISSIONS_FILE);
}

/**
 * Get submissions for a specific schema
 */
function getSubmissionsBySchemaId(schemaId) {
  const submissions = getAllSubmissions();
  return submissions[schemaId] || [];
}

/**
 * Save submission
 */
function saveSubmission(schemaId, submissionData) {
  const submissions = getAllSubmissions();
  
  if (!submissions[schemaId]) {
    submissions[schemaId] = [];
  }
  
  submissions[schemaId].push({
    ...submissionData,
    submittedAt: new Date().toISOString()
  });
  
  return writeJSONFile(SUBMISSIONS_FILE, submissions);
}

/**
 * Generate unique ID
 */
function generateId(prefix = 's') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = {
  getAllSchemas,
  getSchemaById,
  saveSchema,
  getAllSubmissions,
  getSubmissionsBySchemaId,
  saveSubmission,
  generateId
};