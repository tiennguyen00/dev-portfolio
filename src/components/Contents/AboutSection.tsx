import { personalInfo } from "../../constants/personal-info";
import { CalendarIcon, LocationIcon, MailIcon, UniversityIcon } from "../icons";

const AboutSection = () => {
  const { name, title, email, location, phone, bio, education } = personalInfo;

  return (
    <div className="flex flex-col items-center max-w-7xl mx-auto">
      <h3 className="hidden md:block text-4xl underline font-bold mb-4">
        ABOUT ME
      </h3>
      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Top row - left column: Profile Image */}
        <div className="hidden md:flex md:col-span-1 bg-gray-800/60 rounded-lg shadow-lg p-6 justify-center items-center border border-gray-700">
          <div className="w-48 sm:w-60 h-auto  aspect-square rounded-full bg-blue-500 flex items-center justify-center text-white text-5xl font-bold shadow-lg border-4 border-white/20">
            NHT
          </div>
        </div>

        {/* Top row - right column: Profile Info */}
        <div className="md:col-span-3 bg-gray-800 md:bg-gray-800/60 rounded-lg shadow-lg p-6 border border-gray-700">
          <div className="border-l-4 border-blue-500 pl-4 mb-4 w-fit text-left">
            <h3 className="text-3xl text-yellow-600 font-bold">{name}</h3>
            <p className="text-gray-300">{title}</p>
          </div>

          <p className="text-gray-300 mb-6 text-left">{bio}</p>

          {/* Three value propositions in a row */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <h4 className="text-blue-500 font-bold mb-2">
                Embracing Simplicity
              </h4>
              <p className="text-sm text-gray-300">
                Develop simple, efficient solutions for complex problems
              </p>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <h4 className="text-blue-500 font-bold mb-2">
                Prioritizing Cleanliness
              </h4>
              <p className="text-sm text-gray-300">
                Maintain clean and well-organized code
              </p>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <h4 className="text-blue-500 font-bold mb-2">
                Commitment to Learning
              </h4>
              <p className="text-sm text-gray-300">
                Continuously expand knowledge in technologies
              </p>
            </div>
          </div>
        </div>

        {/* Bottom row - Location box */}
        <div className="bg-gray-800 hidden md:block md:bg-gray-800/60 rounded-lg shadow-lg p-3 border md:col-span-2 lg:col-span-1 border-gray-700">
          <div className="font-bold mb-2 text-blue-500 text-left">Location</div>
          <div className="flex gap-2">
            <LocationIcon className="size-6 mr-2 text-blue-500" />
            <span>{location}</span>
          </div>
        </div>

        {/* Bottom row - Email box */}
        <div className="bg-gray-800 hidden md:block md:bg-gray-800/60 rounded-lg shadow-lg p-3 border md:col-span-2 lg:col-span-1 border-gray-700 pointer-events-auto">
          <div className="font-bold mb-2 text-blue-500 text-left">Email</div>
          <div className="flex items-center gap-2">
            <MailIcon className="size-6 mr-2 text-blue-500" />
            <a href={`mailto:${email}`} className="hover:underline">
              {email}
            </a>
          </div>
        </div>

        {/* Bottom row - Phone  box */}
        <div className="bg-gray-800 hidden md:block md:bg-gray-800/60 rounded-lg shadow-lg p-3 border md:col-span-2 lg:col-span-1 border-gray-700 pointer-events-auto">
          <div className="font-bold mb-2 text-blue-500 text-left">
            Phone Number
          </div>
          <div className="flex gap-2">
            <CalendarIcon className="size-6 mr-2 text-blue-500" />
            <div className="text-left">
              <div>
                <a href={`tel:${phone}`} className="hover:underline">
                  {phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row - Education box */}
        <div className="bg-gray-800 hidden md:block md:bg-gray-800/60 rounded-lg shadow-lg p-3 border md:col-span-2 lg:col-span-1 border-gray-700">
          <div className="font-bold mb-2 text-blue-500 text-left">
            Education
          </div>
          <div className="flex  gap-2">
            <UniversityIcon className="size-8 mr-2 text-blue-500" />
            <div className="text-left">
              <div>
                <span>{education.university} </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
