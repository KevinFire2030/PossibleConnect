"use client";

import { useRouter } from "next/navigation";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/icons";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="flex h-dvh min-w-0 flex-col bg-background overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
        <SidebarToggle />
        <Button
          className="ml-auto h-8 px-2 md:h-fit md:px-2"
          onClick={() => {
            router.push("/");
            router.refresh();
          }}
          variant="outline"
        >
          <PlusIcon />
          <span className="md:sr-only">New Chat</span>
        </Button>
      </header>
      <div
        className="mx-auto mt-4 flex w-full max-w-3xl flex-col px-4 pb-8 md:mt-8 md:px-8"
        key="about"
      >
      <div className="mb-6 border-l-4 border-yellow-400 bg-yellow-50 pl-4 py-2 dark:bg-yellow-950/20">
        <div className="font-semibold text-xl md:text-2xl text-foreground">
          Possible is
        </div>
      </div>
      <div className="mt-4 text-base leading-relaxed text-zinc-500 md:text-lg">
        <p className="mb-4">
          부산대학교 시사영어연구회 The Possible Club은 1971년, 각 회원들의
          영어실력증진과 친목도모를 목적으로 설립된 이래 40여년동안 꾸준히
          학술 내외적인 면에서 모두 괄목할만한 성과를 이루고 있습니다.
        </p>

        <div className="mb-6">
          <p className="mb-3 font-medium text-foreground">학술활동으로는</p>
          <ol className="ml-4 list-decimal space-y-2">
            <li>각종 영어 뉴스지를 활용한 번역수업.</li>
            <li>
              다양한 스크립트나 오디오,비디오파일을 통한 회화수업.
            </li>
            <li>
              시사적인 주제를 놓고 영어로 의견을 교환하는 Free Talking.
            </li>
            <li>
              직접 주최하는 전국규모의 말하기 대회 Possible Speech Contest.
            </li>
          </ol>
          <p className="mt-3">
            등이 있으며, 이를 통해 회원들의 영어실력을 증진시키고 있습니다.
          </p>
        </div>

        <div className="mb-6">
          <p className="mb-3 font-medium text-foreground">
            학술외적인 활동으로는
          </p>
          <ol className="ml-4 list-decimal space-y-2">
            <li>
              신입회원들이 쉽게 선배들과 어울릴 수 있는 첫마당. 산성엠티.
            </li>
            <li>
              졸업하신 선배들과 새로온 후배들의 어울림 마당. Home Coming Day.
            </li>
            <li>부산대학교대동제때 열리는 주막. Service Center.</li>
            <li>
              Possible 식구들이 가족이 되어 떠나는 여름여행. 가족엠티.
            </li>
            <li>팝송의 최강자를 가리는 팝스콘테스트</li>
          </ol>
          <p className="mt-3">
            등이 있으며, 이를 통해 멤버들과의 친목을 다집니다.
          </p>
        </div>

        <div className="mb-6">
          <div className="mb-4 border-l-4 border-yellow-400 bg-yellow-50 pl-4 py-2 dark:bg-yellow-950/20">
            <h2 className="font-semibold text-xl text-foreground">
              Regular Class
            </h2>
          </div>
          <p className="mb-4">
            앞에서 말씀드렸듯이 Possible의 학술활동의 대부분은 정규수업이
            차지하고 있습니다. 그럼 정규수업에는 어떤 것들이 있는지
            알아볼까요?
          </p>

          <div className="mb-4 space-y-4">
            <div>
              <h3 className="mb-2 font-medium text-foreground">
                1. 번역 수업(translation class)
              </h3>
              <ul className="ml-4 space-y-1 text-sm">
                <li>시간 : 50분간(주 1~2회)</li>
                <li>
                  장소 : 부산대학교 강의실(인문관, 항공관, 제도관등. 학기별
                  강의실 사정에 의해 변동될 수 있음)
                </li>
                <li>
                  교재 : Time, Newsweek지에서 발췌하여 번역부에서 만든 교재
                </li>
                <li>
                  방식 : 회원들 중 한 명씩 당일의 교재 내용을 준비하여
                  발표(시사적 배경, 본문 번역)한 후 토론회를 가짐.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-medium text-foreground">
                2. 영어 회화 수업(English conversation class)
              </h3>
              <ul className="ml-4 space-y-1 text-sm">
                <li>시간 : 50분간(주 1~2회)</li>
                <li>장소 : 번역수업사항과 동일</li>
                <li>교재 : Possible 회화담당부원의 자체 제작 교재</li>
                <li>
                  방식 : 평소에는 회화부 맴버들이 수업하나, 고기수도 회화부를
                  도와 수업에 임함 회화수업에서의 강의, 의사소통은 모두 영어로
                  하는 것을 원칙으로 함.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-medium text-foreground">
                3. Free Talking Time
              </h3>
              <ul className="ml-4 space-y-1 text-sm">
                <li>시간 : 번역, 회화 수업이 끝난 뒤 20분간</li>
                <li>장소 : 번역수업사항과 동일</li>
                <li>
                  방식 : 4-5명이 그룹을 만들어 당일에 주어진 주제에 대해서
                  영어로 토론함.
                </li>
              </ul>
            </div>
          </div>

          <p className="mt-4">
            수업만 하면 지루하겠죠? 이 외에 possible에서는 수업에서 닦은 실력을
            발휘하는 기회를 가지거나 여러 행사들을 개최함으로써 멤버들간의
            끈끈한 정을 다질 수 있는 즐거운 시간을 가진답니다.
          </p>
        </div>

        <div className="mb-6">
          <div className="mb-4 border-l-4 border-yellow-400 bg-yellow-50 pl-4 py-2 dark:bg-yellow-950/20">
            <h2 className="font-semibold text-xl text-foreground">
              Regular Events
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="mb-2 font-medium text-foreground">
                1. 산성 MT(Membership Training)
              </h3>
              <p className="mb-2 text-sm">
                ~ 새로 선발된 회원들을 환영하는 자리. 대학에 예비대학이 있듯이
                possible에는 산성 MT가 있음.
              </p>
              <ul className="ml-4 space-y-1 text-sm">
                <li>
                  일시 : 3월 신입생 모집하는 그 주 토-일(선발:오후2시,
                  후발:오후5시)
                </li>
                <li>장소 : 부산대학교 뒤 산성</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-medium text-foreground">
                2. Home Coming Day(신구대면식)
              </h3>
              <p className="mb-2 text-sm">
                ~ 졸업한 선배들을 비롯 Possible 식구들이 모두 모이는 자리
                입니다. 행사는 1, 2부로 나뉘어 진행되며, 게임/허슬등의
                다채로운 코너들이 준비되어 있습니다.
              </p>
              <ul className="ml-4 space-y-1 text-sm">
                <li>일시 : 4월 첫째주 토요일</li>
                <li>장소 : 부산대학교 상남국제회관</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-medium text-foreground">
                3. Service Center(대동제주막)
              </h3>
              <p className="mb-2 text-sm">
                ~ 축제기간 중 possible에서 개설하는 주막. 먹어나 봤나 possible
                해물파전, 두부김치~
              </p>
              <ul className="ml-4 space-y-1 text-sm">
                <li>일시 : 5월 15일 전후.</li>
                <li>장소 : 부산대학교내.</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-medium text-foreground">
                4. the POSSIBLE speech contest
              </h3>
              <p className="mb-2 text-sm">
                ~ Possible에서 주관하는 전국규모의 영어말하기대회. 자신의
                영어실력을 뽐내러 전국의 대학생들이 부산대로 몰려듭니다.
              </p>
              <ul className="ml-4 space-y-1 text-sm">
                <li>일시 : 5월 말</li>
                <li>장소 : 부산대학교 언어교육원</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-medium text-foreground">
                5. 여름 가족 MT(Membership Training)
              </h3>
              <p className="mb-2 text-sm">
                ~ possible 연중행사 중 가장 비중이 크다할 수 있는 가족 엠티.
                여름 방학 기간 중 3박 4일정도 여행을 떠납니다. 조를 나누어
                조원간에 가족호칭을 부여하여 가족처럼 지내지요. 가족간의 우애는
                물론이 거니와 그동안 알지 못했던 possible 사람들과의 관계를
                돈독히 할 수 있는 절호의 찬스!
              </p>
              <ul className="ml-4 space-y-1 text-sm">
                <li>일시 : 7월 마지막주 or 8월 첫째주</li>
                <li>장소 : 매년 바뀜(ex.03&apos;거제도, 04&apos;지리산계곡)</li>
                <li>
                  일정 : 첫째날. 가족의 밤(가족원들끼리의 친밀도 급상승)
                  둘째날. 동기의 밤(동기들끼리의 진솔한 얘기가 가득한 밤.)
                  셋째날. 가곡의 밤(모든 possible 가족이 관계가 더욱 깊어지는
                  밤.)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-medium text-foreground">
                6. Possible 체전
              </h3>
              <p className="mb-2 text-sm">
                ~ Possibilian들의 친목을 도모하고자 인근 학교 운동장을 빌려
                운동회(?)를 개최합니다. 여러 가지 축구, 3인 4각등 재미있는
                코너가 많이 준비되어 있습니다.
              </p>
              <ul className="ml-4 space-y-1 text-sm">
                <li>일시 : 9월 마지막주 토요일</li>
                <li>장소 : 인근 운동장</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-medium text-foreground">
                7. POSSIBLE NIGHT
              </h3>
              <p className="mb-2 text-sm">
                ~ 준회원들 중 기준에 달한자를 정회원으로 승격시키는 날. 정회원이
                된 사람에게는 정회원임을 증명하는 뱃지가 수여됩니다. 행사진행은
                Home Coming Day와 유사함.
              </p>
              <ul className="ml-4 space-y-1 text-sm">
                <li>일시 : 1월 첫째주 토요일.</li>
                <li>장소 : 상남국제회관</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

