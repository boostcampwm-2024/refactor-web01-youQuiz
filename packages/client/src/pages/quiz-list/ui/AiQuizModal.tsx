import { useState } from 'react';
import { LightbulbIcon } from 'lucide-react';

export default function AiQuizModal() {
  const [prompt, setPrompt] = useState('');
  const handleConfirmClick = () => {};

  return (
    <form
      className="flex flex-col gap-6 bg-white rounded-lg p-8 w-full max-w-2xl mx-auto shadow-md"
      onClick={(e) => e.stopPropagation()}
      onSubmit={(e) => {
        e.preventDefault();
        handleConfirmClick();
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <LightbulbIcon className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">새로운 퀴즈 만들기</h2>
        </div>
        <p className="text-gray-600">만들고 싶은 퀴즈에 대해서 자세하게 말씀해주세요.</p>
      </div>

      <div className="space-y-4">
        <textarea
          className="w-full min-h-[200px] p-4 text-gray-700 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="퀴즈 생성을 위한 프롬프트를 입력해주세요."
          onChange={(e) => setPrompt(e.target.value)}
        />

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 font-medium mb-2">예시 프롬프트</p>
          <p className="text-sm text-gray-500 italic">
            "한국의 역사와 관련되어 20대 평균 상식 수준의 퀴즈 5개를 만들어줘. 선택지의 개수는
            4개로."
          </p>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
      >
        <span>퀴즈 생성하기</span>
      </button>
    </form>
  );
}
