interface WorkSectionProps {
  id: number;
  title: string;
}

const WorkSection = ({ id, title }: WorkSectionProps) => {
  return (
    <div className="flex flex-col items-end w-full h-full pointer-events-auto">
      <div className="flex w-3/5 bg-amber-200 h-[100vh]">
        {id}
        {title}
      </div>
    </div>
  );
};

export default WorkSection;
