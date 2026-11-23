# V238 bowling audio correction

No continuous background, added end music, generated whistle/applause or full-time whistle. Existing penalty `whistleRestart` and existing 5v5/normal `goal` crowd recording are decoded directly from PULSE_AUDIO. Pin/kick PCM SHA256 stays identical to V237.

`tests/browser-bowling-sound.cjs` compares all decoded channels against those existing sources, verifies no preview loop, then downloads four explicitly labelled **2D audio test harness videos**, H264/AAC1080p60. These are not 3D match exports. ffmpeg decoded AAC RMS: quiet0, whistle0.1340, pin0.0583, crowd0.0230. Reports and samples are included here.

Fresh targeted checks: bowling.cjs, bowling-presentation.cjs, audio-export.cjs, browser-bowling-sound.cjs. The prior full suite remains V23769/69; a new broad rerun was stopped early because this task changes only bowling sound, not physics or visuals. No claim of a fresh V238 full-suite run, Hostinger deployment or physical iPhone validation.
