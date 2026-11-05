import ProgressBar from "./ProgressBar";
import BackLink from "./BackLink";

interface QuestionScreenProps {
  progress: number;
  onBack?: () => void;
  heading: string;
  subheading?: string;
  children: React.ReactNode;
}

/** The shared shell for every question screen: progress bar, back link, one heading, one control. */
export default function QuestionScreen({
  progress,
  onBack,
  heading,
  subheading,
  children,
}: QuestionScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <ProgressBar progress={progress} />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-4">
        <div className="h-10">{onBack && <BackLink onClick={onBack} />}</div>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-ink">{heading}</h1>
        {subheading && <p className="mt-2 text-base text-slate">{subheading}</p>}
        <div className="mt-6 flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}
