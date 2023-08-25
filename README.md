# TwitchTtsReward

OBS browser source thingy, which, when redeeming a certain reward, will read a message from it using locally installed voice

### How to install

1. Create browser source in OBS, recommended size: 650x300 
2. Put `https://kanawanagasaki.github.io/TwitchTtsReward?channel=<channel-name>&reward-id=<custom-reward-id>&voice=<local-voice>` into URL field, where:

|Parameter|Description|
|---------|-----------|
|channel|Twitch channel where reward is located|
|reward-id| An ID of custom reward. This should be an ID, not a reward name|
|voice (optional)|Locally installed voice name|
