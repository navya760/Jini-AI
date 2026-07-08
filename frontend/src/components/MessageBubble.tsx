// import React, { useState } from 'react';
// import './ui.css';
// import { FiCopy, FiCheck } from 'react-icons/fi';
// import { ChatSender } from '../types/assistant';

// type Props = {
//   text: string;
//   sender: ChatSender;
// };

// export default function MessageBubble({ text, sender }: Props) {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = async () => {
//     try {
//       await navigator.clipboard.writeText(text);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1600);
//     } catch (e) {
//       console.error('copy failed', e);
//     }
//   };

//   const isUser = sender === 'user';
//   const isAi = sender === 'ai';
//   const isSystem = sender === 'system';

//   return (
//     <div className={`msg-row ${isUser ? 'user' : isAi ? 'ai' : 'system'}`}>
//       {isAi && (
//         <div className="avatar" aria-hidden>
//           <div className="avatar-glow">🤖</div>
//         </div>
//       )}

//       <div className="msg-bubble">
//         <div className="msg-text">{text}</div>
//         {isAi && (
//           <button className="copy-btn" onClick={handleCopy} title={copied ? 'Copied' : 'Copy'}>
//             {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
//           </button>
//         )}
//       </div>

//       {isUser && <div style={{ width: 44 }} />}
//     </div>
//   );
// }



// import React, { useState } from 'react';
// import { FiCopy, FiCheck } from 'react-icons/fi';
// import './ui.css';
// import { ChatSender } from '../types/assistant';

// type Props = {
//   text: string;
//   sender: ChatSender;
// };

// function MessageBubble({ text, sender }: Props) {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = async () => {
//     await navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   return (
//     <div className={`msg-row ${sender}`}>
//       <div className="msg-bubble">
//         <div>{text}</div>

//         {sender === 'ai' && (
//           <button className="copy-btn" onClick={handleCopy}>
//             {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// export default MessageBubble;



import React, { useState } from 'react';
import './ui.css';
import ReactMarkdown from "react-markdown";
import {
  FiCopy,
  FiCheck,
  FiVolume2,
  FiVolumeX,
} from 'react-icons/fi';
import { ChatSender } from '../types/assistant';

type Props = {
  text: string;
  sender: ChatSender;
};

export default function MessageBubble({ text, sender }: Props) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSpeak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const isUser = sender === 'user';
  const isAi = sender === 'ai';

//   return (
//     <div className={`msg-row ${isUser ? 'user' : isAi ? 'ai' : 'system'}`}>
//       {isAi && (
//         <div className="avatar">
//           <div className="avatar-glow">🤖</div>
//         </div>
//       )}

//       <div className="msg-bubble">
//         <div className="msg-text">{text}</div>

//         {isAi && (
//           <div className="action-buttons">
//             <button className="copy-btn" onClick={handleCopy}>
//               {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
//             </button>

//             <button className="sound-btn" onClick={handleSpeak}>
//               {speaking ? (
//                 <FiVolumeX size={15} />
//               ) : (
//                 <FiVolume2 size={15} />
//               )}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



return (
  <div className={`msg-row ${sender}`}>
    <div className="message-wrapper">
      <div className="msg-bubble">
<div className="msg-text">
  <ReactMarkdown>{text}</ReactMarkdown>
</div>      </div>

      {sender === "ai" && (
        <div className="below-actions">
  <button className="icon-btn" onClick={handleCopy}>
    {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
  </button>

  <button className="icon-btn" onClick={handleSpeak}>
    {speaking ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
  </button>
</div>
      )}
    </div>
  </div>

);
}