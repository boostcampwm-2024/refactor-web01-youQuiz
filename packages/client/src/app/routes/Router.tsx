import { Routes, Route } from 'react-router-dom';

import withLazySuspense from './withLazySuspense';
import HostLayout from '@/app/layouts/HostLayout';
import MainPage from '@/pages/main';
import QuizCreatePage from '@/pages/quiz-create';
import GuestLayout from '@/app/layouts/GuestLayout';
import NotFound from '@/app/routes/NotFound';
import Nickname from '@/pages/nickname';
const QuizSession = withLazySuspense(() => import('@/pages/quiz-session'));
const QuizMasterSession = withLazySuspense(() => import('@/pages/quiz-master-session'));
const Leaderboard = withLazySuspense(() => import('@/pages/leaderboard'));
const QuizListPage = withLazySuspense(() => import('@/pages/quiz-list'), <SkeletonQuizList />);
const QuizWaitPage = withLazySuspense(() => import('@/pages/quiz-wait'), <SkeletonQuizWait />);
import PreventGuestRouter from './PreventGuestRouter';
import SkeletonQuizList from '@/pages/quiz-list/ui/SkeletonQuizList';
import SkeletonQuizWait from '@/pages/quiz-wait/ui/SkeletonQuizWait';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route element={<HostLayout />}>
        <Route path="/quiz-list" element={<QuizListPage />} />
        <Route path="/quiz/create/:classId" element={<QuizCreatePage />} />
      </Route>
      <Route element={<GuestLayout />}>
        <Route element={<PreventGuestRouter />}>
          <Route path="/quiz/wait/:pinCode" element={<QuizWaitPage />} />
        </Route>
        <Route path="/nickname/:pinCode" element={<Nickname />} />
      </Route>
      <Route path="/quiz/session/:pinCode/:id" element={<QuizSession />} />
      <Route path="/quiz/session/host/:pinCode/:id" element={<QuizMasterSession />} />
      <Route path="/quiz/session/:pinCode/end" element={<Leaderboard />} />
      <Route path={'*'} element={<NotFound />} />
    </Routes>
  );
}
