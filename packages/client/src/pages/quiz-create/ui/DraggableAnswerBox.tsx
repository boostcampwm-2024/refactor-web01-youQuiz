import { GripVertical, Trash2 } from 'lucide-react';

import AnswerBox from './AnswerBox';
interface DraggableAnswerBoxProps {
  /**정답 체크된 상태인지 여부 */
  selected: boolean;

  value?: string;
  /**정답 선택 함수 */
  answerSetter: () => void;
  /**선지 설정 함수 */
  optionSetter: any;
  /** 인풋 박스 ref */
  inputRef?: (el: HTMLInputElement | null) => void;
  /** 키 입력 함수 (유저가 Enter를 누르면 호출이 됩니다.) */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  index: number;
  onDragComplete: (arg0: number, arg1: number) => void;
  onDeleteChoice: () => void;
}

export default function DraggableAnswerBox({
  selected,
  answerSetter,
  optionSetter,
  inputRef,
  onKeyDown,
  value,
  index,
  onDragComplete,
  onDeleteChoice,
}: DraggableAnswerBoxProps) {
  return (
    <div
      draggable
      className="flex gap-1 items-center rounded p-2 mb-2 bg-white"
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', index.toString());
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        onDragComplete(fromIndex, index);
      }}
    >
      <GripVertical className="w-5 h-5 text-gray-300 cursor-move" />
      <AnswerBox
        selected={selected}
        answerSetter={answerSetter}
        optionSetter={optionSetter}
        inputRef={inputRef}
        onKeyDown={onKeyDown}
        value={value}
      />
      <Trash2
        className="cursor-pointer w-5 h-5 text-gray-300 hover:text-red-100"
        onClick={onDeleteChoice}
      />
    </div>
  );
}
