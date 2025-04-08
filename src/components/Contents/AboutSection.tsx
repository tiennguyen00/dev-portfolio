const AboutSection = () => {
  return (
    <div className="w-full max-w-4/5 p-6 bg-white/5 backdrop-blur-sm rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6 border-b border-blue-500 pb-2 inline-block mx-auto">
        About Me
      </h2>

      <div className="flex flex-col md:flex-row gap-8 mb-10">
        {/* Profile Image */}
        <div className="flex-shrink-0 mx-auto md:mx-0">
          <div className="w-48 h-48 rounded-full bg-blue-500 flex items-center justify-center text-white text-5xl font-bold shadow-lg border-4 border-white/20">
            NHT
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-grow">
          <div className="border-l-4 border-blue-500 pl-4 mb-4">
            <h3 className="text-2xl font-bold">Nguyen Huu Tien</h3>
            <p className="text-gray-300">Frontend Developer</p>
          </div>

          <p className="text-gray-300 mb-6">
            Passionate developer specializing in frontend technologies. Whether
            you are looking to build a commercial website, or create website
            with a 3D experience.
          </p>

          {/* Three columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-blue-500 font-bold mb-2">
                Embracing Simplicity
              </h4>
              <p className="text-sm text-gray-300">
                Develop simple, efficient solutions for complex problems
              </p>
            </div>

            <div>
              <h4 className="text-blue-500 font-bold mb-2">
                Prioritizing Cleanliness
              </h4>
              <p className="text-sm text-gray-300">
                Maintain clean and well-organized code
              </p>
            </div>

            <div>
              <h4 className="text-blue-500 font-bold mb-2">
                Commitment to Learning
              </h4>
              <p className="text-sm text-gray-300">
                Continuously expand knowledge in technologies
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white/5 p-4 rounded-lg">
          <div className="font-bold mb-2">Location</div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">📍</span>
            <span>Ho Chi Minh City</span>
          </div>
        </div>

        <div className="bg-white/5 p-4 rounded-lg">
          <div className="font-bold mb-2">Email</div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">📧</span>
            <span>nhtiendev@gmail.com</span>
          </div>
        </div>

        <div className="bg-white/5 p-4 rounded-lg">
          <div className="font-bold mb-2">Education</div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">🎓</span>
            <div>
              <div>University of Information Technology</div>
              <div className="text-sm text-gray-400">Computer Science</div>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Contributions */}
      <div>
        <h3 className="text-xl font-bold border-b border-blue-500 pb-2 inline-block mb-6">
          GitHub Contributions
        </h3>

        <div className="overflow-x-auto mb-6">
          {/* Placeholder for GitHub contributions graph */}
          <div className="w-full h-32 bg-white/5 rounded-lg p-2">
            <div className="grid grid-cols-12 gap-1 h-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div
                      key={j}
                      className={`h-full w-full rounded-sm bg-green-${
                        Math.floor(Math.random() * 5) * 100 + 100
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <a
            href="#"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center gap-2 transition-colors"
          >
            <span>👁️</span> View GitHub Profile
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
