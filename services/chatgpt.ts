import Constants from 'expo-constants';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type ChatGPTResponse = {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export async function sendMessageToChatGPT(userMessage: string, conversationHistory: Message[] = []) {
  try {
    const apiKey = Constants.expoConfig?.extra?.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Please check your environment variables.');
    }

    // Format conversation history without system prompt
    const messages: Message[] = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content.trim()
      })),
      {
        role: 'user',
        content: userMessage.trim()
      }
    ];

    console.log('Sending request with messages:', messages);

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('OpenAI API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(
        `HTTP error! status: ${response.status}\n` +
        `Details: ${errorData?.error?.message || 'Unknown error'}`
      );
    }

    const data: ChatGPTResponse = await response.json();
    
    // Log the full response for debugging
    console.log('Full API Response:', {
      model: 'gpt-4o',
      usage: data.usage,
      message: data.choices[0].message
    });

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling ChatGPT API:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to get response: ${error.message}`);
    }
    throw error;
  }
} 