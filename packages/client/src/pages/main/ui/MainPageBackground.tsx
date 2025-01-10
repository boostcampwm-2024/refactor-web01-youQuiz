import FloatingQuestion from './FloatingQuestion';
import FloatingSquare from './FloatingSquare';

export default function MainPageBackground() {
  return (
    <>
      <FloatingSquare
        color="from-yellow-300/80 to-yellow-400/80"
        size="128"
        position="top-20 left-[20%]"
        delay={0}
      />
      <FloatingSquare
        color="from-green-300/80 to-green-400/80"
        size="160"
        position="top-40 right-[20%]"
        delay={0.5}
      />
      <FloatingSquare
        color="from-blue-400/80 to-blue-500/80"
        size="192"
        position="bottom-20 left-[20%]"
        delay={1}
      />
      <FloatingSquare
        color="from-pink-300/80 to-pink-400/80"
        size="144"
        position="bottom-40 right-[20%]"
        delay={1.5}
      />
      <FloatingQuestion position="top-[170px] right-1/3" delay={0} />
    </>
  );
}
