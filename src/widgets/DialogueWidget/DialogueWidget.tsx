import { useEffect, useState } from "react";

export interface DialogueOption {
  text: string;
  nextId: string;
}

export interface DialogueNode {
  id: string;
  text: string;
  options: DialogueOption[];
}

export type Dialogue = DialogueNode[];

function logError(error: Error) {
  console.error(error.message)
}

export const DialogueWidget = ({dialogueTree}: {
  dialogueTree: DialogueNode[]
}) => {
  const [currentId, setCurrentId] = useState('start');
  const currentNode = dialogueTree.find(node => node.id === currentId);

  useEffect(() => {
    if (!currentNode) logError(new Error(`dialog node not found: ${currentId}`));
  }, [currentId, currentNode])

  if (!currentNode) return <div>Ошибка: узел не найден.</div>;

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-2xl shadow mt-10">
      <div className="text-xl mb-4">{currentNode.text}</div>
      <div className="space-y-2">
        {currentNode.options.map((option, index) => (
          <button
            key={index}
            onClick={() => setCurrentId(option.nextId)}
            className="w-full text-left px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition"
          >
            {option.text}
          </button>
        ))}
        {currentNode.options.length === 0 && (
          <button
            onClick={() => setCurrentId('start')}
            className="mt-4 px-4 py-2 bg-green-100 hover:bg-green-200 rounded-xl"
          >
            Начать сначала
          </button>
        )}
      </div>
    </div>
  );
};