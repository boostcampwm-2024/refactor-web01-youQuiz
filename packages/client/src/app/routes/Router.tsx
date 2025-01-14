import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import HostLayout from '@/app/layouts/HostLayout';
import MainPage from '@/pages/main';
import QuizCreatePage from '@/pages/quiz-create';
import GuestLayout from '@/app/layouts/GuestLayout';
import NotFound from '@/app/routes/NotFound';
import Nickname from '@/pages/nickname';
const QuizSession = lazy(() => import('@/pages/quiz-session'));
const QuizMasterSession = lazy(() => import('@/pages/quiz-master-session'));
const Leaderboard = lazy(() => import('@/pages/leaderboard'));
const QuizListPage = lazy(() => import('@/pages/quiz-list'));
const QuizWaitPage = lazy(() => import('@/pages/quiz-wait'));
import PreventGuestRouter from './PreventGuestRouter';
import SkeletonQuizList from '@/pages/quiz-list/ui/SkeletonQuizList';
import SkeletonQuizWait from '@/pages/quiz-wait/ui/SkeletonQuizWait';
import CustomSuspense from '@/shared/boundary/\bCustomSuspense';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route element={<HostLayout />}>
        <Route
          path="/quiz-list"
          element={
            <CustomSuspense fallback={<SkeletonQuizList />}>
              <QuizListPage />
            </CustomSuspense>
          }
        />
        <Route
          path="/quiz/create/:classId"
          element={
            <CustomSuspense>
              <QuizCreatePage />
            </CustomSuspense>
          }
        />
      </Route>
      <Route element={<GuestLayout />}>
        <Route element={<PreventGuestRouter />}>
          <Route
            path="/quiz/wait/:pinCode"
            element={
              <CustomSuspense fallback={<SkeletonQuizWait />}>
                <QuizWaitPage />
              </CustomSuspense>
            }
          />
        </Route>
        <Route
          path="/nickname/:pinCode"
          element={
            <CustomSuspense>
              <Nickname />
            </CustomSuspense>
          }
        />
      </Route>

      <Route
        path="/quiz/session/:pinCode/:id"
        element={
          <CustomSuspense>
            <QuizSession />
          </CustomSuspense>
        }
      />
      <Route
        path="/quiz/session/host/:pinCode/:id"
        element={
          <CustomSuspense>
            <QuizMasterSession />
          </CustomSuspense>
        }
      />
      <Route
        path="/quiz/session/:pinCode/end"
        element={
          <CustomSuspense>
            <Leaderboard />
          </CustomSuspense>
        }
      />
      <Route path={'*'} element={<NotFound />} />
    </Routes>
  );
}
