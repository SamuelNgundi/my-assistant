// lib/initVoiceRequest.ts
import { RequestHandlers } from "./types";

export default function initVoiceRequest(
    recorder: any,
    conversationState: object,
    handlers: RequestHandlers
) {
    // @ts-ignore (2339)
    const voiceRequest = new window.Houndify.VoiceRequest({
        //Your Houndify Client ID
        clientId: "j9hItNfhWotprfzysgVjKg==",
        clientKey:"kZIWYHr8aANj-wnALYq9xo9F9YOZZEXF4IGlasfjTbff4HbjvUBpmnJEo4_xQUEMUxXRCO_41-FvN5-QRNnZNQ==",

        authURL: "/houndifyAuth",

        //REQUEST INFO JSON
        //See https://houndify.com/reference/RequestInfo
        requestInfo: {
            UserID: "samuelwngundi02@gmail.com",
            //See https://www.latlong.net/ for your own coordinates
            Latitude: -1.292066,
            Longitude: 36.821945,
        },

        //Pass the current ConversationState stored from previous queries
        //See https://www.houndify.com/docs#conversation-state
        conversationState,

        //Sample rate of input audio
        sampleRate: recorder.sampleRate,

        //Enable Voice Activity Detection
        //Default: true
        enableVAD: true,

        //Partial transcript, response and error handlers
        onTranscriptionUpdate: handlers.onTranscriptionUpdate,
        onResponse: function (response: any, info: any) {
            recorder.stop();
            handlers.onResponse(response, info);
        },
        onError: function (err: any, info: any) {
            recorder.stop();
            handlers.onError(err, info);
        },
    });

    return voiceRequest;
}
