import { personalInfo } from "../../constants/personal-info";

const ContactSection = () => {
  const contactItems = [
    {
      name: "GitHub",
      url: personalInfo.github,
      color: "#8BC34A",
    },
    {
      name: "LinkedIn",
      url: personalInfo.linkedin,
      color: "#673AB7",
    },
    { name: "Email", url: personalInfo.email, color: "#2196F3" },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-[100vh] relative py-8">
      {/* Title with colorful text shadow like in the reference */}
      <h1 className="contact-title text-4xl md:text-6xl underline font-extrabold mb-8 md:mb-16 text-white/85 tracking-wider">
        CONTACTS
      </h1>

      {/* Contact items in colorful circular layout */}
      <div className="flex pointer-events-auto flex-wrap justify-center gap-8 mb-16 max-w-4xl">
        {contactItems.map((item, index) => (
          <a
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-item flex w-full flex-1 md:flex-col space-x-3 md:space-x-0 md:space-y-3 px-2 items-center"
          >
            <div
              className="w-24 h-24 hidden sm:flex rounded-full items-center justify-center transition-transform hover:scale-110"
              style={{ backgroundColor: item.color }}
            >
              <p className="text-white text-2xl font-bold">
                {item.name.charAt(0)}
              </p>
            </div>
            <p className="text-lg font-medium text-white truncate">
              {item.name}
            </p>
            <p className="text-sm flex-1 text-gray-300 hover:underline truncate">
              {item.url.replace(/(https:\/\/|mailto:)/, "")}
            </p>
          </a>
        ))}
      </div>

      {/* Warning/greeting message */}
      <div
        className="p-3 md:p-6 border-2 border-yellow-500 rounded-lg max-w-2xl mx-auto text-center"
        style={{
          background: "rgba(30, 30, 30, 0.7)",
          backdropFilter: "blur(5px)",
        }}
      >
        <p className="text-xl text-yellow-100">
          Thanks for visiting my portfolio! I'm currently open to new
          opportunities and collaborations. Feel free to reach out through any
          of the contact methods above.
        </p>
      </div>
    </div>
  );
};

export default ContactSection;
