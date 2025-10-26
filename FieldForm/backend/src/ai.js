// backend/src/ai.js
const OpenAI = require('openai');

// Initialize OpenAI client (will be null if no API key)
let client = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Generate a form schema from natural language prompt using AI
 * Falls back to mock data if no API key is available
 */
async function generateSchemaFromPrompt(prompt, title = 'Generated Form') {
  // If no OpenAI client, use mock generation
  if (!client) {
    console.log('⚠️  No OpenAI API key found - using mock schema generation');
    return generateMockSchema(prompt, title);
  }

  const systemPrompt = `
You are an assistant that converts natural language descriptions of field forms into structured JSON schemas.

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
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
`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a form schema for: ${prompt}` }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const content = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const schema = JSON.parse(jsonContent);
    
    // Validate schema structure
    if (!schema.title || !Array.isArray(schema.fields)) {
      throw new Error('Invalid schema structure returned by AI');
    }

    return schema;
  } catch (error) {
    console.error('AI generation error:', error.message);
    throw new Error(`Failed to generate schema: ${error.message}`);
  }
}

/**
 * Mock schema generator for demo/testing when no API key
 */
function generateMockSchema(prompt, title) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Detect common field inspection patterns
  if (lowerPrompt.includes('pole') || lowerPrompt.includes('electrical')) {
    return {
      title: title || 'Electrical Pole Inspection Form',
      fields: [
        {
          name: 'inspector_name',
          label: 'Inspector Name',
          type: 'string',
          required: true,
          placeholder: 'Enter your full name'
        },
        {
          name: 'pole_id',
          label: 'Pole ID',
          type: 'string',
          required: true,
          placeholder: 'e.g., POLE-2024-001'
        },
        {
          name: 'voltage',
          label: 'Voltage Reading (V)',
          type: 'number',
          required: true,
          min: 0,
          max: 1000,
          notifyIf: '>400',
          placeholder: 'Enter voltage in volts'
        },
        {
          name: 'pole_condition',
          label: 'Pole Condition',
          type: 'select',
          required: true,
          options: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical']
        },
        {
          name: 'photos',
          label: 'Inspection Photos',
          type: 'file',
          required: false
        },
        {
          name: 'remarks',
          label: 'Additional Remarks',
          type: 'textarea',
          required: false,
          placeholder: 'Any additional observations...'
        }
      ]
    };
  }
  
  // Generic inspection form
  return {
    title: title || 'Field Inspection Form',
    fields: [
      {
        name: 'inspector_name',
        label: 'Inspector Name',
        type: 'string',
        required: true
      },
      {
        name: 'location',
        label: 'Location',
        type: 'string',
        required: true
      },
      {
        name: 'inspection_date',
        label: 'Inspection Date',
        type: 'date',
        required: true
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: ['Pass', 'Fail', 'Needs Review']
      },
      {
        name: 'notes',
        label: 'Notes',
        type: 'textarea',
        required: false
      }
    ]
  };
}

module.exports = { generateSchemaFromPrompt };