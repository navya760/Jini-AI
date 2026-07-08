// import React from 'react';
// import './Message.css';
// import { ChatSender } from '../types/assistant';

// type MessageProps = {
//   text: string;
//   sender: ChatSender;
// };

// function Message({ text, sender }: MessageProps) {
//   const className = `message-row ${sender === 'user' ? 'message-user' : sender === 'ai' ? 'message-ai' : 'message-system'}`;

//   return (
//     <div className={className}>
//       <div className="message-bubble">
//         <span>{text}</span>
//       </div>
//     </div>
//   );
// }

// export default Message;
// import React, { useState } from 'react';

// import './Message.css';

// import { ChatSender } from '../types/assistant';

// import { FiCopy, FiCheck } from 'react-icons/fi';

// type MessageProps = {

//   text: string;

//   sender: ChatSender;

// };

// function Message({ text, sender }: MessageProps) {

//   const [copied, setCopied] = useState(false);

//   const className = `message-row ${sender === 'user'

//     ? 'message-user'

//     : sender === 'ai'

//       ? 'message-ai'

//       : 'message-system'

//     }`;

//   const handleCopy = async () => {

//     try {

//       await navigator.clipboard.writeText(text);

//       setCopied(true);

//       setTimeout(() => {

//         setCopied(false);

//       }, 2000);

//     } catch (error) {

//       console.error('Failed to copy text:', error);

//     }

//   };

//   return (
//     // <div className={className}>
//     //   <div className="message-bubble">
//     //     <span>{text}</span>

//     //     {sender === 'ai' && (
//     //       <button

//     //         className="copy-button"

//     //         onClick={handleCopy}

//     //         title={copied ? 'Copied!' : 'Copy'}
//     //       >

//     //         {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
//     //       </button>

//     //     )}
//     //   </div>
//     // </div>
//     <div className={`message-row ${sender === "user" ? "message-user" : "message-ai"}`}>
//       {/* <div className="message-bubble"> */}
//       <div
//   className="message-bubble"
//   style={
//     sender === "user"
//       ? {
//           background: "black",
//           boxShadow: "0 0 30px white"
//         }
//       : {}
//   }
// >
//         <span>{text}</span>
//       </div>

//       {sender === "ai" && (
//         <div className="message-actions">
//           <button
//             className="copy-button"
//             onClick={handleCopy}
//             title={copied ? "Copied" : "Copy"}
//           >
//             {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
//           </button>
//         </div>
//       )}
//     </div>

//   );

// }

// export default Message;

import React, { useState } from "react";
import "./Message.css";
import { ChatSender } from "../types/assistant";
import { FiCopy, FiCheck, FiVolume2 } from "react-icons/fi";

type MessageProps = {
  text: string;
  sender: ChatSender;
};

function Message({ text, sender }: MessageProps) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const className = `message-row ${
    sender === "user"
      ? "message-user"
      : sender === "ai"
      ? "message-ai"
      : "message-system"
  }`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const handleSpeak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={className}>
      <div className="message-bubble">
        <span>{text}</span>
      </div>

      {sender === "ai" && (
        <div className="message-actions">
          <button
            className="copy-button"
            onClick={handleCopy}
            title={copied ? "Copied" : "Copy"}
          >
            {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
          </button>
          <button
            className="speaker-button"
            onClick={handleSpeak}
            title={speaking ? "Stop" : "Speak"}
          >
            <FiVolume2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Message;