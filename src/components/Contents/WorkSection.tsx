import {
  BlenderIcon,
  GSAPIcon,
  NextJsIcon,
  ShadcnIcon,
  TailwindIcon,
  ThreejsIcon,
  TypeScriptIcon,
} from "../icons";

interface WorkSectionProps {
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
    containerClass: "bg-white p-[1px] w-8 h-8 rounded-full",
  },
  "Tailwind CSS": {
    icon: TailwindIcon,
    containerClass: "bg-white p-[1px] w-8 h-8 rounded-full",
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
};

const TechnologyIcon = ({ keyword }: TechnologyIconProps) => {
  const config = TECH_ICON_CONFIG[keyword as keyof typeof TECH_ICON_CONFIG];

  if (!config) {
    return <span>{keyword}</span>;
  }

  const IconComponent = config.icon;

  return (
    <div className={`${config.containerClass} cursor-pointer`}>
      <IconComponent className={config.iconClass || "w-full h-full"} />
      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-600">
        {keyword}
      </span>
    </div>
  );
};

const WorkSection = ({
  title,
  keywords,
  image,
  demo,
  des,
}: WorkSectionProps) => {
  return (
    <div className="flex justify-end items-center w-full h-[100vh] relative py-8">
      <h3 className="text-4xl underline font-bold mb-4 absolute left-0 top-6">
        MY WORKS
      </h3>
      <div className="flex w-3/5 flex-col space-y-6 items-start">
        <h3 className="text-4xl font-bold text-yellow-600">{title}</h3>
        <p className="text-gray-300 text-sm/5 text-left ">{des}</p>
        <div>
          <img
            src={image}
            alt={title}
            className="w-full h-auto rounded-lg mb-3"
          />
          <div className="flex items-center pointer-events-auto">
            <h3 className="text-gray-300 font-bold text-left">Techs:</h3>
            {keywords.map((keyword) => (
              <div
                key={keyword}
                className="text-gray-300 px-2 py-1 text-left relative group"
              >
                <TechnologyIcon keyword={keyword} />
              </div>
            ))}
          </div>
        </div>

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
  );
};

export default WorkSection;
