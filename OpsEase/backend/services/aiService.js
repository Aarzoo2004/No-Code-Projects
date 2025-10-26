const { GoogleGenAI } = require('@google/genai');

// Initialize client with API key from environment
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const generateFormSchema = async (description) => {
  try {
    const prompt = `
You are a form schema generator. Based on the following description, generate a JSON array of form fields.

Description: "${description}"

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "label": "Field Name",
    "type": "text|email|number|date|textarea|select|file",
    "placeholder": "Enter...",
    "required": true|false,
    "options": ["option1", "option2"] // only for select type
  }
]

Rules:
- Use appropriate field types (text, email, number, date, textarea, select, file)
- Make critical fields required: true
- Add helpful placeholders
- For select fields, include realistic options array
- Return 4-8 fields based on the description
- Ensure valid JSON format
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    // Get the text from response
    const text = response.text;
    
    // Clean the response (remove markdown code blocks if present)
    const cleanedResponse = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const schema = JSON.parse(cleanedResponse);
    
    return schema;
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error('Failed to generate form schema: ' + error.message);
  }
};

const generateReport = async (submissions) => {
  try {
    if (!submissions || submissions.length === 0) {
      throw new Error('No submissions provided for analysis');
    }

    // Prepare submission data for analysis
    const submissionData = submissions.map(submission => ({
      id: submission._id,
      formTitle: submission.formId?.title || 'Unknown Form',
      status: submission.status,
      submittedBy: submission.submittedBy?.name || submission.submittedBy?.email || 'Unknown',
      createdAt: submission.createdAt,
      data: submission.data || {}
    }));

    const prompt = `
You are an AI analyst specializing in form submission analysis. Analyze the following submission data and provide insights.

Submission Data: ${JSON.stringify(submissionData, null, 2)}

Please analyze this data and provide a comprehensive report with the following structure:

1. Calculate overall compliance rate (approved submissions / total submissions * 100)
2. Identify the most common issues/patterns found in submission data
3. Provide top 3 recommendations for improvement
4. Summarize approved vs rejected submissions

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "summary": {
    "totalSubmissions": number,
    "approvedCount": number,
    "rejectedCount": number,
    "pendingCount": number,
    "complianceRate": number,
    "analysisPeriod": "string"
  },
  "insights": [
    {
      "category": "string",
      "description": "string",
      "impact": "high|medium|low"
    }
  ],
  "recommendations": [
    {
      "title": "string",
      "description": "string",
      "priority": "high|medium|low"
    }
  ]
}

Rules:
- Provide realistic compliance rate based on approved/total ratio
- Identify 3-5 meaningful insights about patterns or issues
- Give actionable recommendations with clear priorities
- Use professional, concise language
- Ensure valid JSON format
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    // Get the text from response
    const text = response.text;
    
    // Clean the response (remove markdown code blocks if present)
    const cleanedResponse = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const report = JSON.parse(cleanedResponse);
    
    // Validate the report structure
    if (!report.summary || !report.insights || !report.recommendations) {
      throw new Error('Invalid report structure received from AI');
    }

    return report;
  } catch (error) {
    console.error('AI Report Generation Error:', error);
    
    // Return a fallback report structure if AI fails
    const fallbackReport = {
      summary: {
        totalSubmissions: submissions?.length || 0,
        approvedCount: submissions?.filter(s => s.status === 'approved').length || 0,
        rejectedCount: submissions?.filter(s => s.status === 'rejected').length || 0,
        pendingCount: submissions?.filter(s => s.status === 'pending').length || 0,
        complianceRate: 0,
        analysisPeriod: 'Unable to analyze'
      },
      insights: [
        {
          category: 'Analysis Error',
          description: 'Unable to generate insights due to technical error',
          impact: 'medium'
        }
      ],
      recommendations: [
        {
          title: 'Manual Review Required',
          description: 'Please review submissions manually due to analysis failure',
          priority: 'high'
        }
      ]
    };

    // Calculate basic compliance rate for fallback
    if (submissions && submissions.length > 0) {
      const approvedCount = submissions.filter(s => s.status === 'approved').length;
      fallbackReport.summary.complianceRate = Math.round((approvedCount / submissions.length) * 100);
    }

    throw new Error('Failed to generate report: ' + error.message);
  }
};

module.exports = { generateFormSchema, generateReport };