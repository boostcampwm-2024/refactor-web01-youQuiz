import { CustomButton } from '@/shared/ui/buttons';
import Modal from '@/shared/ui/modal';
import { useState } from 'react';
import QuizTitleModal from './ui/QuizTitleModal';
import { useGetClasses } from '@/shared/hooks/classes';
import ClassItem from './ui/ClassItem';
import EmptyQuizList from './ui/EmptyClassList';
import AiQuizModal from './ui/AiQuizModal';

export default function QuizListLazyPage() {
  const { data: classList } = useGetClasses();
  const [openModal, setOpenModal] = useState(false);
  const [aiModal, setAiModal] = useState(false);

  const sortedClassListById = classList.data.sort((a, b) => a.id - b.id);

  return (
    <div className="w-full min-h-[calc(100vh-80px)] px-8 flex flex-col gap-6 mt-6 mx-auto">
      {sortedClassListById.map((item, index) => {
        return <ClassItem key={item.id} quizList={item} index={index} />;
      })}
      {sortedClassListById.length === 0 && <EmptyQuizList />}
      <div className="self-end flex gap-2">
        <CustomButton
          type="outline"
          label="퀴즈 만들기"
          color="primary"
          size="md"
          onClick={() => setOpenModal(true)}
        />
        <CustomButton
          type="outline"
          label="AI로 퀴즈 만들기"
          color="primary"
          size="md"
          onClick={() => setAiModal(true)}
        />
      </div>
      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>
          <QuizTitleModal onClose={() => setOpenModal(false)} />
        </Modal>
      )}
      {aiModal && (
        <Modal onClose={() => setAiModal(false)}>
          <AiQuizModal />
        </Modal>
      )}
    </div>
  );
}
