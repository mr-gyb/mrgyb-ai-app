import OpenAI from 'openai';
import { OpenAIMessage } from '../../types/chat';
import FormData from 'form-data';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

let assistant: any = null;

const initializeAssistant = async () => {
  if (!assistant) {
    assistant = await openai.beta.assistants.create({
      name: 'File Analysis Assistant',
      instructions:
        'You are a helpful assistant that can analyze files and answer questions about them.',
      model: 'gpt-4-turbo-preview',
      tools: [{ type: 'file_search' }],
    });
  }
  return assistant;
};

export const generateAIResponse = async (
  messages: OpenAIMessage[],
  aiAgent: string
) => {
  try {
    const systemMessage: OpenAIMessage = {
      role: 'system',
      content: getSystemPrompt(aiAgent),
    };

    const lastMessage = messages[messages.length - 1];

    // Handle messages with file content
    if (
      typeof lastMessage.content === 'object' &&
      Array.isArray(lastMessage.content)
    ) {
      // For image files, use GPT-4 Vision
      if (lastMessage.content.some((item) => item.type === 'image_url')) {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            systemMessage,
            {
              role: 'user',
              content: lastMessage.content,
            },
          ],
          max_tokens: 500,
        });
        return completion.choices[0]?.message?.content || '';
      }
      // For other file types, use Assistants API with file search
      else if (lastMessage.fileType && lastMessage.fileName) {
        const fileUpload = await openai.files.create({
          file: lastMessage.file as any,
          purpose: 'assistants',
        });

        const assistant = await initializeAssistant();
        const thread = await openai.beta.threads.create();

        await openai.beta.threads.messages.create(thread.id, {
          role: 'user',
          content: lastMessage.content[lastMessage.content.length - 1].text,
          attachments: [
            { file_id: fileUpload.id, tools: [{ type: 'file_search' }] },
          ],
        });

        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: assistant.id,
        });

        // Poll for completion
        let runStatus = await openai.beta.threads.runs.retrieve(
          thread.id,
          run.id
        );
        while (runStatus.status !== 'completed') {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          runStatus = await openai.beta.threads.runs.retrieve(
            thread.id,
            run.id
          );
        }

        const threadMessages = await openai.beta.threads.messages.list(
          thread.id
        );
        return (
          threadMessages.data[0]?.content[0]?.text?.value ||
          'No analysis available'
        );
      }
    }

    // Handle regular text messages
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate AI response');
  }
};

export const processFileForAI = async (file: File): Promise<OpenAIMessage> => {
  try {
    if (file.type.startsWith('image/')) {
      const base64Data = await fileToBase64(file);
      return {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: base64Data },
          },
        ],
        fileType: 'image',
        fileName: file.name,
      };
    } else {
      return {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyzing file: ${file.name}`,
          },
        ],
        fileType: file.type,
        fileName: file.name,
        file: file,
      };
    }
  } catch (error) {
    console.error('Error processing file for AI:', error);
    throw error;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

const getSystemPrompt = (aiAgent: string): string => {
  const prompts: Record<string, string> = {
    'Mr.GYB AI':
      'You are Mr.GYB AI, an all-in-one business growth assistant. You specialize in digital marketing, content creation, and business strategy. Be professional, strategic, and focused on growth.',
    CEO: 'You are the CEO AI, focused on high-level strategic planning and business development. Provide executive-level insights and leadership guidance.',
    COO: 'You are the COO AI, specializing in operations management and process optimization. Focus on efficiency, systems, and operational excellence.',
    CHRO: 'You are the CHRO AI, expert in human resources and organizational development. Focus on talent management, culture, and employee experience.',
    CTO: 'You are the CTO AI, specializing in technology strategy and innovation. Provide guidance on technical decisions and digital transformation.',
    CMO: 'You are the CMO AI, expert in marketing strategy and brand development. Focus on marketing campaigns, brand building, and customer engagement.',
  };

  return (
    prompts[aiAgent] ||
    'You are a helpful AI assistant. Be professional and concise in your responses.'
  );
};
