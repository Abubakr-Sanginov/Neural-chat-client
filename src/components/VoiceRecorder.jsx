import { Mic, MicOff } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const VoiceRecorder = ({ onTranscriptReceive }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "ru-RU"; // Russian, change if needed

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscriptReceive(transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscriptReceive]);

  const toggleRecording = () => {
    if (!isSupported || !recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  return (
    <button
      onClick={toggleRecording}
      className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
        isRecording
          ? "bg-red-500 hover:bg-red-600 animate-pulse"
          : "hover:bg-white hover:bg-opacity-10"
      }`}
      title={isRecording ? "Stop recording" : "Voice input"}
    >
      {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
};

export default VoiceRecorder;
