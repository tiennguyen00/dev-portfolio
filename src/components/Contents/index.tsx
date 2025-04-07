const Contents = () => {
  return (
    <div className="w-full z-[9999] absolute h-full flex flex-col items-center justify-center pointer-events-none ">
      <div className="text-center max-w-2xl px-4 space-y-6">
        <div className="bg-white bg-opacity-90 text-blue-600 py-2 px-6 rounded-full inline-block mb-4 shadow-lg font-medium">
          Hello, World!
        </div>

        <h1 className="text-6xl font-extrabold">
          I'm <span className="text-yellow-600">Tien</span>
        </h1>

        <h2 className="text-3xl text-whiteAlpha-800">Frontend Developer</h2>
        <div className="w-full h-[35vh]" />

        <p className="text-lg text-whiteAlpha-700 max-w-xl mx-auto font-light">
          Passionate developer specializing in fullstack and blockchain
          technologies with a strong foundation in Computer Science.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center transition-colors pointer-events-auto font-medium">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            View My Work
          </button>

          <button
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md flex items-center transition-colors pointer-events-auto font-medium"
            onClick={() => {
              console.log("Contact Me");
            }}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Contact Me
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contents;
