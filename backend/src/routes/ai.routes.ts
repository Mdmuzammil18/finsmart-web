import { Router, Response } from 'express';
import { getDb } from '../db/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { GoogleGenAI } from '@google/genai';

const router = Router();
router.use(authenticate);

// Initialize Gemini client (uses GEMINI_API_KEY from process.env automatically if available)
const ai = new GoogleGenAI({});

router.post('/chat', async (req: AuthRequest, res: Response) => {
  try {
    const { messages } = req.body; // Expecting array of { role: 'user' | 'model', parts: [{ text: '...' }] }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing or invalid messages array' });
    }

    // Fetch user's recent transactions to inject as context
    const db = await getDb();
    const records = await db.all(
      'SELECT title, amount, category, date, type FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 50',
      [req.userId]
    );

    const transactionContext = records.map(r => 
      `${r.date}: [${r.type.toUpperCase()}] ${r.title} - $${r.amount} (${r.category})`
    ).join('\n');

    const systemInstruction = `You are a helpful, expert financial AI assistant for the ExpenseTracker app. 
You provide concise, friendly, and actionable financial advice.
Here is the user's recent transaction history for context:
${transactionContext || 'No recent transactions.'}

Analyze this data to answer the user's questions about their spending, savings, or budget. 
Always be encouraging and format currency correctly.`;

    // Extract just the user's latest prompt to simplify, or pass the whole history
    // Since GenAI SDK allows passing history to generateContent, we can construct the prompt.
    // For simplicity, we'll pass the conversation history formatted as a string to generateContent,
    // or use the chat session if we want to maintain state. Here we'll just format it.

    const conversationStr = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
    const prompt = `${systemInstruction}\n\nConversation History:\n${conversationStr}\n\nAssistant:`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return res.json({ response: response.text });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error while calling AI' });
  }
});

export default router;
