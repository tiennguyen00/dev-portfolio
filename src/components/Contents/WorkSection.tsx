import {
  BlenderIcon,
  CursorIcon,
  ExpressJsIcon,
  FirebaseIcon,
  GSAPIcon,
  NextJsIcon,
  OpenaiIcon,
  PixiJsIcon,
  PostgreSQLIcon,
  ReactJsIcon,
  ShadcnIcon,
  SocketIoIcon,
  TailwindIcon,
  ThreejsIcon,
  TypeScriptIcon,
  ZustandIcon,
} from "../icons";
import { ToolTip } from "../shared";

interface WorkSectionProps {
  id: number;
  title: string;
  keywords: string[];
  highlights: string[];
  image: string;
  demo: string;
  des: string;
}

// Technology icon mapping component
type TechnologyIconProps = {
  keyword: string;
};

// Icon configuration for each technology
interface TechIconConfig {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  containerClass: string;
  iconClass?: string;
}

const TECH_ICON_CONFIG: Record<string, TechIconConfig> = {
  "Next.js": {
    icon: NextJsIcon,
    containerClass: "bg-white  w-8 h-8 rounded-full",
  },
  "Tailwind CSS": {
    icon: TailwindIcon,
    containerClass: "bg-white  w-8 h-8 rounded-full",
  },
  TypeScript: {
    icon: TypeScriptIcon,
    containerClass: "bg-white p-[4px] w-8 h-8 rounded-full",
  },
  GSAP: {
    icon: GSAPIcon,
    containerClass: "relative",
    iconClass: "w-auto h-6",
  },
  Threejs: {
    icon: ThreejsIcon,
    containerClass: "bg-white p-[4px] w-8 h-8 rounded-full",
  },
  Shadcn: {
    icon: ShadcnIcon,
    containerClass: "bg-white p-[4px] w-8 h-8 rounded-full",
  },
  Blender: {
    icon: BlenderIcon,
    containerClass: "bg-white p-[4px] w-8 h-8 rounded-full",
  },
  Cursor: {
    icon: CursorIcon,
    containerClass: "bg-white p-[4px] w-8 h-8 rounded-full",
  },
  ReactJs: {
    icon: ReactJsIcon,
    containerClass: "bg-white p-[4px] w-8 h-8 rounded-full",
  },
  Zustand: {
    icon: ZustandIcon,
    containerClass: "bg-white p-[4px] w-8 h-8 rounded-full",
  },
  SocketIO: {
    icon: SocketIoIcon,
    containerClass: "bg-white p-[4px] w-8 h-8 rounded-full",
  },
  Expressjs: {
    icon: ExpressJsIcon,
    containerClass: "bg-white p-[4px] w-8 h-8 rounded-full",
  },
  PostgreSQL: {
    icon: PostgreSQLIcon,
    containerClass: "bg-white p-[4px] w-8 h-8 rounded-full",
  },
  OpenAI: {
    icon: OpenaiIcon,
    containerClass: "bg-white p-[4px] w-8 h-8 rounded-full",
  },
  Firebase: {
    icon: FirebaseIcon,
    containerClass: "bg-white p-[4px] w-8 h-8 rounded-full",
  },
  PixiJS: {
    icon: PixiJsIcon,
    containerClass: "bg-white p-[4px] w-8 h-8 rounded-full",
  },
};

const TechnologyIcon = ({ keyword }: TechnologyIconProps) => {
  const config = TECH_ICON_CONFIG[keyword as keyof typeof TECH_ICON_CONFIG];

  if (!config) {
    return <span>{keyword}</span>;
  }

  const IconComponent = config.icon;

  return (
    <ToolTip content={keyword}>
      <div
        className={`${config.containerClass} cursor-pointer overflow-hidden transform-auto`}
      >
        <IconComponent className={config.iconClass || "w-full h-full"} />
      </div>
    </ToolTip>
  );
};

const WorkSection = ({
  id,
  title,
  keywords,
  image,
  demo,
  des,
}: WorkSectionProps) => {
  return (
    <div className="flex justify-end items-center w-full h-[100vh] relative py-8">
      <h3 className="text-2xl md:text-4xl underline font-bold mb-4 absolute left-0 top-6">
        MY WORKS
      </h3>
      <div className="flex w-full md:w-3/5 flex-col space-y-3 md:space-y-6 items-start">
        <h3 className="text-4xl font-bold text-yellow-600 text-start">
          {title}
        </h3>
        <p className="text-gray-300 text-sm/5 text-left ">{des}</p>
        <div className="w-full">
          <div className="w-full max-w-[720px] h-auto aspect-[3762/2052] bg-white/80 flex justify-center items-center rounded-lg mb-3 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full aspect-square"
              style={{
                width: id === 2 ? "100px" : "100%",
                height: id === 2 ? "auto" : "100%",
              }}
            />
          </div>

          <div className="flex flex-col md:flex-row space-x-2">
            <h3 className="text-gray-300 font-bold text-left">Techs:</h3>
            <div className="flex flex-wrap space-x-2 items-center pointer-events-auto">
              {keywords.map((keyword) => (
                <div key={keyword} className="text-gray-300 text-left relative">
                  <TechnologyIcon keyword={keyword} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center pointer-events-auto space-x-2">
          <h3 className="text-gray-300 font-bold text-left">Link:</h3>
          <a
            href={demo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 text-left underline cursor-pointer pointer-events-auto"
          >
            {demo}
          </a>
        </div>
      </div>
    </div>
  );
};

export default WorkSection;
