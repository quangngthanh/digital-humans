import { useRef, KeyboardEvent } from "react";
import { useChatContext } from "@/hooks/useChatContext";
import { VoiceButton } from "@/components/VoiceButton";

interface UIProps {
  hidden?: boolean;
  [key: string]: any;
}

export const UI = ({ hidden }: UIProps) => {
  const input = useRef<HTMLInputElement>(null);
  const { sendMessage } = useChatContext();
  
  // Access extended context properties
  const chatContext = useChatContext() as any;
  const { loading, cameraZoomed, setCameraZoomed, message } = chatContext;

  const handleSendMessage = async (): Promise<void> => {
    if (!input.current) return;
    
    const text = input.current.value.trim();
    if (!loading && !message && text) {
      try {
        await sendMessage(text);
        input.current.value = "";
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const handleVoiceTranscript = async (transcript: string): Promise<void> => {
    if (!loading && !message && transcript.trim()) {
      try {
        await sendMessage(transcript);
        // Clear input if there was text
        if (input.current) {
          input.current.value = "";
        }
      } catch (error) {
        console.error('Failed to send voice message:', error);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleCamera = (): void => {
    setCameraZoomed(!cameraZoomed);
  };

  const toggleGreenScreen = (): void => {
    const body = document.querySelector("body");
    if (body) {
      if (body.classList.contains("greenScreen")) {
        body.classList.remove("greenScreen");
      } else {
        body.classList.add("greenScreen");
      }
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="w-full flex flex-col items-end justify-center gap-4">
          <button
            onClick={toggleCamera}
            className="pointer-events-auto bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-md transition-colors"
            aria-label={cameraZoomed ? "Zoom out camera" : "Zoom in camera"}
          >
            {cameraZoomed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
          <button
            onClick={toggleGreenScreen}
            className="pointer-events-auto bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-md transition-colors"
            aria-label="Toggle green screen"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <input
            className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
            placeholder="Type a message..."
            ref={input}
            onKeyDown={handleKeyDown}
            disabled={loading || !!message}
          />
          
          {/* Voice Button */}
          <div className="relative">
            <VoiceButton 
              onTranscript={handleVoiceTranscript}
              disabled={loading || !!message}
              className="pointer-events-auto"
            />
          </div>

          <button
            disabled={loading || !!message}
            onClick={handleSendMessage}
            className={`bg-blue-500 hover:bg-blue-600 text-white p-4 px-10 font-semibold uppercase rounded-md transition-colors ${
              loading || message ? "cursor-not-allowed opacity-30" : ""
            }`}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </>
  );
};
