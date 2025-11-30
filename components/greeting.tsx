import { motion } from "framer-motion";

export const Greeting = () => {
  return (
    <div
      className="mx-auto mt-4 flex size-full max-w-3xl flex-col justify-center px-4 md:mt-16 md:px-8"
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="font-semibold text-xl md:text-2xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
      >
        We Connect Everyone, Everywhere, Every Time.
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 text-base leading-relaxed text-zinc-500 md:text-lg"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
      >
        <p className="mb-3">
          Possible Connect는 AI를 통해 동문·재학생과의 연결을 돕는
          파서블 전용 챗 기반 소통 플랫폼입니다.
        </p>
        <p className="mb-3">
          이제, 회원검색·행사일정·후원 및 후배지원 프로그램 등 모든 정보를
          AI로 손쉽게 확인해보세요.
        </p>
        <p className="font-medium text-foreground">
          접속할 준비 되셨나요?
        </p>
      </motion.div>
    </div>
  );
};
