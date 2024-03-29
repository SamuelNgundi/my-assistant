import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./App.module.scss";
import initVoiceRequest from "./lib/initVoiceRequest";
import VoiceInput from "./VoiceInput";
import { useAtom } from "jotai";
import { recorderAtom, recordingAtom } from "./store";

import startSound from "./audio/start.wav";
import stopSound from "./audio/stop.wav";
import playSound from "./lib/playSound";

const sources = {
    start: startSound,
    stop: stopSound,
};

const speech = new SpeechSynthesisUtterance();

// Set to your language code
speech.lang = "en";

const say = (text: string) => {
    speech.text = text;
    window.speechSynthesis.speak(speech);
};

function App() {
    // Keep hold of the state
    const conversationState = useRef<any>(null);

    // Holds what the user is currently saying
    const [transcription, setTranscription] = useState("");

    // Any errors from the voice request will be stored here
    const [error, setError] = useState("");

    const [recorder, setRecorder] = useAtom(recorderAtom);
    const [recording, _setRecording] = useAtom(recordingAtom);

    const setRecording = (value: boolean) => {
        playSound(sources[value ? "start" : "stop"]);
        _setRecording(value);
    };

    const onResponse = useCallback((response: any, info: any) => {
        if (response.AllResults && response.AllResults.length) {
            const result = response.AllResults[0];
            conversationState.current = result.ConversationState;
            handleResult(result);
            setTranscription("");
        }
    }, []);

    const onTranscriptionUpdate = useCallback((transcript: any) => {
        setTranscription(transcript.PartialTranscript);
    }, []);

    const onError = useCallback((error: any, info: any) => {
        setError(JSON.stringify(error));
    }, []);

    const handleResult = (result: any) => {
        // We'll add more here later
        say(result["SpokenResponseLong"]);
    };

    useEffect(() => {
        // @ts-ignore (2339)
        const audioRecorder = new window.Houndify.AudioRecorder();
        setRecorder(audioRecorder);

        let voiceRequest: any;

        audioRecorder.on("start", () => {
            setRecording(true);
            voiceRequest = initVoiceRequest(
                audioRecorder,
                conversationState.current,
                {
                    onResponse,
                    onTranscriptionUpdate,
                    onError,
                }
            );
        });

        audioRecorder.on("data", (data: any) => {
            voiceRequest.write(data);
        });

        audioRecorder.on("end", () => {
            voiceRequest.end();
            setRecording(false);
        });

        audioRecorder.on("error", () => {
            voiceRequest.abort();
            setRecording(false);
        });
    }, []);

    return (
        <div className={styles.root}>
            <h1 className={styles.h1}>Voice Assistant AI</h1>
            <VoiceInput transcription={transcription} />
            {error && <div className={styles.errorContainer}>{error}</div>}
        </div>
    );
}

export default App;