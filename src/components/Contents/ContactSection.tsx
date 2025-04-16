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
      <h1 className="contact-title text-6xl underline font-extrabold mb-16 text-white/85 tracking-wider">
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
            className="contact-item flex flex-1 flex-col items-center text-center"
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-3 transition-transform hover:scale-110"
              style={{ backgroundColor: item.color }}
            >
              <span className="text-white text-2xl font-bold">
                {item.name.charAt(0)}
              </span>
            </div>
            <span className="text-lg font-medium text-white">{item.name}</span>
            <span className="text-sm text-gray-300 hover:underline">
              {item.url.replace(/(https:\/\/|mailto:)/, "")}
            </span>
          </a>
        ))}
      </div>

      {/* Warning/greeting message */}
      <div
        className="p-6 border-2 border-yellow-500 rounded-lg max-w-2xl mx-auto text-center"
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
