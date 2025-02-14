import DraggableAnswerBox from './DraggableAnswerBox';
import { QuizData } from '../contexts/quizContext.types';

interface DraggableAnswerContainerProps {
  quizData: QuizData;
  updateChoice: any;
  inputRefs: any;
  handleKeyDown: any;
  onQuizUpdate: (updatedData: QuizData) => void;
}

const DraggableAnswerContainer = ({
  quizData,
  updateChoice,
  inputRefs,
  handleKeyDown,
  onQuizUpdate,
}: DraggableAnswerContainerProps) => {
  const handleDragComplete = (fromIndex: number, toIndex: number) => {
    const updatedChoices = [...quizData.choices];
    const [movedChoice] = updatedChoices.splice(fromIndex, 1);
    updatedChoices.splice(toIndex, 0, movedChoice);

    updatedChoices.forEach((choice, index) => {
      choice.position = index;
    });

    onQuizUpdate({
      ...quizData,
      choices: updatedChoices,
    });
  };

  const deleteChoice = (index: number) => {
    const updatedChoices = quizData.choices.filter((_, i) => i !== index);
    onQuizUpdate({
      ...quizData,
      choices: updatedChoices,
    });
  };

  return (
    <div className="space-y-2">
      {quizData.choices.map((choice, index) => (
        <DraggableAnswerBox
          key={index}
          index={index}
          selected={choice.isCorrect}
          answerSetter={() => updateChoice(index, { isCorrect: !choice.isCorrect })}
          optionSetter={(value: string) => {
            updateChoice(index, { content: value });
          }}
          inputRef={(el) => (inputRefs.current[index] = el)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          value={choice.content}
          onDragComplete={handleDragComplete}
          onDeleteChoice={() => deleteChoice(index)}
        />
      ))}
    </div>
  );
};

export default DraggableAnswerContainer;
