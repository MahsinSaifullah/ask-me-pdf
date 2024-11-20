interface ChatToFilePageProps {
  params: {
    id: string;
  };
}

const ChatToFilePage = ({ params: { id } }: ChatToFilePageProps) => {
  return <div>File: {id}</div>;
};

export default ChatToFilePage;
