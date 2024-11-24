'use client';

import { useUser } from '@clerk/nextjs';
import { FormEvent, useState, useTransition, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase';
import { Button } from './ui/button';
import { Loader2Icon } from 'lucide-react';
import { Message, askQuestion } from '@/actions/askQuestion';
import ChatMessage from './ChatMessage';

interface ChatProps {
  id: string;
}

const Chat: React.FC<ChatProps> = ({ id }) => {
  const { user } = useUser();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();
  const bottomOfChatRef = useRef<HTMLDivElement>(null);

  const [snapshot, loading] = useCollection(
    user &&
      query(
        collection(db, 'users', user?.id, 'files', id, 'chat'),
        orderBy('createdAt', 'asc')
      )
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const question = input;

    setInput('');

    setMessages((prev) => [
      ...prev,
      {
        role: 'human',
        message: question,
        createdAt: new Date(),
      },
      {
        role: 'ai',
        message: '🤔 Thinking...',
        createdAt: new Date(),
      },
    ]);

    startTransition(async () => {
      const { success, message } = await askQuestion(id, question);

      if (!success) {
        setMessages((prev) =>
          prev.slice(0, prev.length - 1).concat([
            {
              role: 'ai',
              message: `🫢 Whoops...${message}`,
              createdAt: new Date(),
            },
          ])
        );
      }
    });
  };

  useEffect(() => {
    bottomOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!snapshot) return;

    console.log('Updated snapshot', snapshot.docs);

    const lastMessage = messages.pop();

    if (lastMessage?.role === 'ai' && lastMessage.message === 'Thinking...') {
      return;
    }

    const newMessages = snapshot.docs.map((doc) => {
      const { role, message, createdAt } = doc.data();

      return {
        role,
        message,
        createdAt: createdAt.toDate(),
      };
    });

    setMessages(newMessages);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  return (
    <div className="flex flex-col h-full overflow-scroll">
      <div className="flex-1 w-full">
        {loading ? (
          <div className="justify-center flex">
            <Loader2Icon className="animate-spin h-20 w-20 text-indigo-600 mt-20" />
          </div>
        ) : (
          <div className="p-5">
            {messages.length === 0 && (
              <ChatMessage
                key={'placeholder'}
                message={{
                  role: 'ai',
                  message: 'Ask me anything about the document!',
                  createdAt: new Date(),
                }}
              />
            )}
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            <div ref={bottomOfChatRef} />
          </div>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex sticky bottom-0 space-x-2 p-5 bg-indigo-600/75"
      >
        <Input
          placeholder="Ask a Question..."
          value={input}
          className="bg-white"
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" disabled={!input || isPending}>
          {isPending ? (
            <Loader2Icon className="animate-spin text-indigo-600" />
          ) : (
            'Ask'
          )}
        </Button>
      </form>
    </div>
  );
};

export default Chat;
