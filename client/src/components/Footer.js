import React, { useState } from "react";

export default function Footer() {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return alert("Please enter a message.");

    window.location.href = `mailto:miki123mbt@gmail.com?subject=Website Feedback&body=${encodeURIComponent(message)}`;

    setMessage("");
  };

  // Base styles with transition for smooth animation
  const iconBaseStyle = {
    margin: "0 0.5rem",
    color: "#ddd",
    cursor: "pointer",
    transition: "color 0.3s ease, transform 0.3s ease",
    display: "inline-block",
  };

  const textBaseStyle = {
    transition: "color 0.3s ease",
    cursor: "default",
  };

  // We can handle hover with React state or keep it simple with inline style + event handlers.
  // Here’s a small helper to handle hover effects cleanly:

  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [hoveredText, setHoveredText] = useState(null);

  const socialLinks = [
    { href: "#", title: "LinkedIn", icon: "fa-linkedin" },
    { href: "https://github.com/mikistat2/", title: "GitHub", icon: "fa-github" },
    { href: "https://www.instagram.com/mike.mbt147/", title: "Instagram", icon: "fa-instagram" },
    { href: "#", title: "Telegram", icon: "fa-telegram" },
  ];

  const contactItems = [
    { type: "text", content: "Phone: +251-987-654-321" },
    {
      type: "email",
      content: "test.gmial.com",
      href: "mailto:miki123mbt@gmail.com",
    },
    { type: "text", content: "Text: EthioUfc on Telegram" },
  ];

  const footerTexts = [
    `© ${new Date().getFullYear()}`,
    "Developed by MBT",
    "Developer rights are alwayes preserved",
  ];

  return (
    <footer
      style={{
        background: "#222",
        color: "#ddd",
        padding: "5rem 2rem",
        marginTop: "4rem",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "auto",
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          justifyContent: "space-between",
        }}
      >
        {/* Left */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <h3
            style={{
              color: hoveredText === "contactHeader" ? "#f04" : "#eee",
              ...textBaseStyle,
            }}
            onMouseEnter={() => setHoveredText("contactHeader")}
            onMouseLeave={() => setHoveredText(null)}
          >
            Contact Us:
          </h3>
          <ul style={{ listStyle: "none", padding: 0, lineHeight: 1.6 }}>
            {contactItems.map((item, idx) => (
              <li
                key={idx}
                style={{
                  color:
                    hoveredText === idx ? "#f04" : textBaseStyle.color || "#ddd",
                  cursor: item.type === "email" ? "pointer" : "default",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={() => setHoveredText(idx)}
                onMouseLeave={() => setHoveredText(null)}
              >
                {item.type === "email" ? (
                  <a
                    href={item.href}
                    style={{
                      color: hoveredText === idx ? "#f04" : "#ddd",
                      textDecoration: "underline",
                      transition: "color 0.3s ease",
                      cursor: "pointer",
                    }}
                  >
                    {item.content}
                  </a>
                ) : (
                  item.content
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Middle */}
        <div style={{ flex: 1, minWidth: 220, textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            {socialLinks.map(({ href, title, icon }, idx) => (
              <a
                key={idx}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={title}
                style={{
                  ...iconBaseStyle,
                  color: hoveredIcon === idx ? "#f04" : iconBaseStyle.color,
                  transform: hoveredIcon === idx ? "scale(1.3)" : "scale(1)",
                }}
                onMouseEnter={() => setHoveredIcon(idx)}
                onMouseLeave={() => setHoveredIcon(null)}
              >
                <i className={`fa-brands ${icon}`}></i>
              </a>
            ))}
          </div>
          <div style={{ fontSize: "0.9rem" }}>
            {footerTexts.map((text, idx) => (
              <p
                key={idx}
                style={{
                  ...textBaseStyle,
                  color: hoveredText === `footerText-${idx}` ? "#f04" : "#ddd",
                }}
                onMouseEnter={() => setHoveredText(`footerText-${idx}`)}
                onMouseLeave={() => setHoveredText(null)}
              >
                {text}
              </p>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <h3
            style={{
              color: hoveredText === "improveHeader" ? "#f04" : "#eee",
              ...textBaseStyle,
            }}
            onMouseEnter={() => setHoveredText("improveHeader")}
            onMouseLeave={() => setHoveredText(null)}
          >
            How can we improve this Website?
          </h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="message"
              placeholder="Your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                marginBottom: "0.5rem",
                borderRadius: "4px",
                border: "none",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#f04",
                color: "#fff",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#c00300")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#f04")}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
}
