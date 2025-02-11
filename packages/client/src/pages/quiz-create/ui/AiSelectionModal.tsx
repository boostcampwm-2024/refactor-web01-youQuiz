import { useState, useEffect } from 'react';
import Modal from '@/shared/ui/modal';

interface AiSelectionModalProps {
  content: string;
  choices: { content: string; isCorrect: boolean }[];
  onClose: () => void;
}

interface AiSelectionProps extends AiSelectionModalProps {}

interface SelectionOptionType {
  content: string;
  choices: { content: string; isCorrect: boolean }[];
  difficulty: 'HARD' | 'NORMAL' | 'EASY';
  count: number;
}

const DEFAULT_OPTION: SelectionOptionType = {
  content: '한국의 광복절은 언제인가요?',
  choices: [{ content: '5.15', isCorrect: true }],
  difficulty: 'HARD',
  count: 3,
};

const AiSelection = ({ content, choices }: AiSelectionProps) => {
  const [selectionOption, setSelectionOption] = useState<SelectionOptionType>(DEFAULT_OPTION);

  console.log(content, choices);
  return (
    <div className="bg-white">
      <div className="flex-col gap-1">
        <p>어려운 난이도</p>
        <p>중간 난이도</p>
        <p>쉬운 난이도</p>
      </div>
      <div></div>
      <button>생성하기</button>
    </div>
  );
};

export default function AiSelectionModal({ content, choices, onClose }: AiSelectionModalProps) {
  return (
    <Modal onClose={onClose}>
      <AiSelection content={content} choices={choices} onClose={onClose} />
    </Modal>
  );
}
