// backend/src/ai.js
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini client (will be null if no API key)
let ai = null;

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });
}

/**
 * Generate a form schema from natural language prompt using Gemini AI
 * Falls back to mock data if no API key is available
 */
async function generateSchemaFromPrompt(prompt, title = 'Generated Form') {
  // If no Gemini client, use mock generation
  if (!ai) {
    console.log('⚠️  No Gemini API key found - using mock schema generation');
    return generateMockSchema(prompt, title);
  }

  const systemPrompt = `
You are an assistant that converts natural language descriptions of field forms into structured JSON schemas.

Return ONLY valid JSON (no markdown, no explanation, no code blocks, no backticks) with this exact structure:
{
  "title": "string - form title",
  "fields": [
    {
      "name": "string - field identifier (lowercase, underscore separated)",
      "label": "string - human readable label",
      "type": "string - one of: string, number, email, file, boolean, select, textarea, date",
      "required": boolean,
      "placeholder": "string - optional placeholder text",
      "min": number - optional, for number type,
      "max": number - optional, for number type,
      "options": ["array of strings"] - only for select type,
      "notifyIf": "string - optional condition like '>400' or '<0'"
    }
  ]
}

Rules:
- Extract all mentioned fields from the description
- Infer appropriate field types
- Set required based on context (default true for important fields)
- Extract validation rules (min/max for numbers)
- Extract notification/workflow rules into notifyIf
- Use clear, professional labels
- Return ONLY the JSON object, absolutely no markdown formatting

User request: ${prompt}
${title ? `Form title should be: ${title}` : ''}
`;

  try {
    console.log('🤖 Sending request to Gemini 2.5 Flash...');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt
    });
    
    let content = response.text.trim();
    
    console.log('📥 Raw Gemini response preview:', content.substring(0, 150) + '...');
    
    // Remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Remove any leading/trailing whitespace
    content = content.trim();
    
    // Try to extract JSON if there's extra text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }
    
    const schema = JSON.parse(content);
    
    // Validate schema structure
    if (!schema.title || !Array.isArray(schema.fields)) {
      throw new Error('Invalid schema structure returned by AI');
    }

    // Ensure all fields have required properties
    schema.fields = schema.fields.map(field => ({
      name: field.name,
      label: field.label || field.name,
      type: field.type || 'string',
      required: field.required !== undefined ? field.required : true,
      placeholder: field.placeholder,
      min: field.min,
      max: field.max,
      options: field.options,
      notifyIf: field.notifyIf
    }));

    console.log('✅ Schema generated successfully with', schema.fields.length, 'fields');
    return schema;
    
  } catch (error) {
    console.error('❌ Gemini AI generation error:', error.message);
    
    // If JSON parsing failed, try to provide helpful error
    if (error instanceof SyntaxError) {
      console.error('🔍 JSON parsing failed. Raw content:', error);
    }
    
    throw new Error(`Failed to generate schema: ${error.message}`);
  }
}

/**
 * Mock schema generator for demo/testing when no API key
 */
function generateMockSchema(prompt, title) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Smart field detection based on keywords
  const fields = [];
  
  // Always add submitter name for forms
  if (lowerPrompt.includes('inspect') || lowerPrompt.includes('audit') || 
      lowerPrompt.includes('form') || lowerPrompt.includes('create') ||
      lowerPrompt.includes('customer') || lowerPrompt.includes('user')) {
    fields.push({
      name: 'name',
      label: 'Full Name',
      type: 'string',
      required: true,
      placeholder: 'Enter your full name'
    });
  }
  
  // Detect email
  if (lowerPrompt.includes('email')) {
    fields.push({
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'your.email@example.com'
    });
  }
  
  // Detect phone
  if (lowerPrompt.includes('phone')) {
    fields.push({
      name: 'phone',
      label: 'Phone Number',
      type: 'string',
      required: true,
      placeholder: '+1 (555) 123-4567'
    });
  }
  
  // Detect date
  if (lowerPrompt.includes('date')) {
    fields.push({
      name: 'date',
      label: 'Date',
      type: 'date',
      required: true
    });
  }
  
  // Detect numeric fields with validation
  const numberPatterns = [
    { keywords: ['voltage', 'volt'], name: 'voltage', label: 'Voltage (V)', min: 0, max: 1000, notifyIf: '>400' },
    { keywords: ['temperature', 'temp'], name: 'temperature', label: 'Temperature (°C)', min: -50, max: 150, notifyIf: '>100' },
    { keywords: ['score', 'rating'], name: 'score', label: 'Score/Rating', min: 0, max: 100, notifyIf: '<70' },
    { keywords: ['pressure'], name: 'pressure', label: 'Pressure (PSI)', min: 0, max: 500 },
    { keywords: ['hours', 'hour'], name: 'hours', label: 'Hours', min: 0, max: 24 },
    { keywords: ['guests', 'people', 'attendees'], name: 'number_of_guests', label: 'Number of Guests', min: 1, max: 20, notifyIf: '>10' },
    { keywords: ['quantity', 'qty', 'amount'], name: 'quantity', label: 'Quantity', min: 0, max: 1000 }
  ];
  
  numberPatterns.forEach(pattern => {
    if (pattern.keywords.some(keyword => lowerPrompt.includes(keyword))) {
      fields.push({
        name: pattern.name,
        label: pattern.label,
        type: 'number',
        required: true,
        min: pattern.min,
        max: pattern.max,
        notifyIf: pattern.notifyIf,
        placeholder: `Enter ${pattern.label.toLowerCase()}`
      });
    }
  });
  
  // Detect condition/status fields
  if (lowerPrompt.includes('condition') || lowerPrompt.includes('status')) {
    fields.push({
      name: 'status',
      label: 'Status/Condition',
      type: 'select',
      required: true,
      options: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical']
    });
  }
  
  // Detect priority
  if (lowerPrompt.includes('priority') || lowerPrompt.includes('urgency') || lowerPrompt.includes('severity')) {
    fields.push({
      name: 'priority',
      label: 'Priority Level',
      type: 'select',
      required: true,
      options: ['Low', 'Medium', 'High', 'Urgent', 'Critical']
    });
  }
  
  // Detect issue type
  if (lowerPrompt.includes('issue') || lowerPrompt.includes('ticket') || lowerPrompt.includes('problem')) {
    fields.push({
      name: 'issue_type',
      label: 'Issue Type',
      type: 'select',
      required: true,
      options: ['Technical', 'Billing', 'General', 'Support', 'Other']
    });
  }
  
  // Detect boolean fields
  if (lowerPrompt.includes('recommend') || lowerPrompt.includes('yes/no') || 
      lowerPrompt.includes('approve') || lowerPrompt.includes('completed') ||
      lowerPrompt.includes('confirm')) {
    fields.push({
      name: 'confirmation',
      label: 'Confirmed',
      type: 'boolean',
      required: false
    });
  }
  
  // Detect photos/images/files
  if (lowerPrompt.includes('photo') || lowerPrompt.includes('image') || 
      lowerPrompt.includes('picture') || lowerPrompt.includes('file') || 
      lowerPrompt.includes('document') || lowerPrompt.includes('attachment')) {
    fields.push({
      name: 'attachments',
      label: 'Photos/Documents',
      type: 'file',
      required: false
    });
  }
  
  // Detect description/comments/notes/remarks
  if (lowerPrompt.includes('description') || lowerPrompt.includes('comment') ||
      lowerPrompt.includes('note') || lowerPrompt.includes('remark') ||
      lowerPrompt.includes('detail') || lowerPrompt.includes('observation')) {
    fields.push({
      name: 'notes',
      label: 'Additional Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Enter any additional details or comments...'
    });
  }
  
  // If we didn't detect any fields, use a generic template
  if (fields.length === 0) {
    return {
      title: title || 'Generic Form',
      fields: [
        {
          name: 'name',
          label: 'Name',
          type: 'string',
          required: true,
          placeholder: 'Enter your name'
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          placeholder: 'your.email@example.com'
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          required: true,
          placeholder: 'Describe your request...'
        },
        {
          name: 'date',
          label: 'Date',
          type: 'date',
          required: true
        }
      ]
    };
  }
  
  return {
    title: title || 'Generated Form',
    fields: fields
  };
}

module.exports = { generateSchemaFromPrompt };