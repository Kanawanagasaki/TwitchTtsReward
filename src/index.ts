// Types for tmi sucks! :angryface:
import * as tmi from "tmi.js";

interface MessageItem {
    time: number;
    text: string;
    id: string;
    username: string;
    displayname: string
}

const urlParams = new URLSearchParams(window.location.search);
const channel = urlParams.get('channel');
const rewardId = urlParams.get('reward-id');
const voiceName = (urlParams.get('voice') ?? "").toLowerCase();
let isVoiceSet = false;

const messagesQueue: MessageItem[] = [];
let readingMessage: MessageItem | null = null;

const speech = new SpeechSynthesisUtterance();
speech.lang = "en";

const rootEl = document.getElementById("root") as HTMLDivElement;
const nameEl = document.getElementById("name") as HTMLDivElement;
const messageEl = document.getElementById("message") as HTMLDivElement;

if (rewardId && channel) {

    speechSynthesis.onvoiceschanged = () => {
        if (!isVoiceSet) {
            const voices = speechSynthesis.getVoices();
            console.log(voices);

            let voiceRes = voices.find(x => x.name.toLowerCase().includes(voiceName));
            if (!voiceRes)
                voiceRes = voices.find(x => x.name.toLowerCase().includes("microsoft william online"));
            if (!voiceRes)
                voiceRes = voices[0];

            speech.voice = voiceRes;

            isVoiceSet = true;
        }

        setInterval(() => {
            if (speechSynthesis.speaking)
                return;

            if (readingMessage) {
                rootEl.classList.toggle("show", false);
                rootEl.classList.toggle("hide", true);

                readingMessage = null;
            }


            if (messagesQueue.length == 0)
                return;

            // wait 2 seconds for the bots to detect bad message
            if (performance.now() - messagesQueue[0].time < 2000)
                return;

            const message = messagesQueue.shift();

            readingMessage = message;
            speech.text = message.text;
            speechSynthesis.speak(speech);

            nameEl.innerText = message.displayname;
            messageEl.innerText = message.text;

            rootEl.classList.toggle("show", true);
            rootEl.classList.toggle("hide", false);
        }, 250);
    };

    const client = new tmi.Client({
        channels: [channel]
    });

    client.connect().catch(console.error);

    client.on('message', (channel: any, tags: any, message: any, self: any) => {

        if (tags["custom-reward-id"] !== rewardId)
            return;

        messagesQueue.push({
            time: performance.now(),
            text: message,
            id: tags["id"],
            username: tags["username"],
            displayname: tags["display-name"],
        });
    });

    client.on('messagedeleted', (channel: any, username: any, deletedMessage: any, userstate: any) => {
        stopSpeech(x => x.id == userstate["target-msg-id"]);
    });

    client.on('timeout', (channel: any, username: any, reason: any, duration: any, userstate: any) => {
        stopSpeech(x => x.username == username);
    });

    client.on('ban', (channel: any, username: any, reason: any, userstate: any) => {
        stopSpeech(x => x.username == username);
    });
}

function stopSpeech(predicate: (x: MessageItem) => boolean) {
    if (readingMessage && predicate(readingMessage)) {
        speechSynthesis.cancel();
        readingMessage = null;
    }

    for (let i = 0; i < messagesQueue.length; i++) {
        if (predicate(messagesQueue[i])) {
            messagesQueue.splice(i, 1);
            i--;
        }
    }

    rootEl.classList.toggle("show", false);
    rootEl.classList.toggle("hide", true);
}
