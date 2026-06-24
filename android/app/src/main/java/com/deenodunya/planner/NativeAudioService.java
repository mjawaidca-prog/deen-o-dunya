package com.deenodunya.planner;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import androidx.core.app.NotificationCompat;
import java.io.IOException;

public class NativeAudioService extends Service {
    public static final String ACTION_PLAY = "com.deenodunya.planner.audio.PLAY";
    public static final String ACTION_PAUSE = "com.deenodunya.planner.audio.PAUSE";
    public static final String ACTION_STOP = "com.deenodunya.planner.audio.STOP";
    public static final String ACTION_ENDED = "com.deenodunya.planner.audio.ENDED";
    public static final String EXTRA_URL = "url";
    public static final String EXTRA_TITLE = "title";

    private static final String CHANNEL_ID = "deen_recitation_playback";
    private static final int NOTIFICATION_ID = 7311;

    private MediaPlayer mediaPlayer;
    private AudioManager audioManager;
    private AudioFocusRequest focusRequest;
    private String currentUrl;
    private String currentTitle = "Qur'an recitation";
    private boolean prepared;

    @Override
    public void onCreate() {
        super.onCreate();
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent != null ? intent.getAction() : null;
        if (ACTION_PLAY.equals(action)) {
            String url = intent.getStringExtra(EXTRA_URL);
            String title = intent.getStringExtra(EXTRA_TITLE);
            play(url, title);
        } else if (ACTION_PAUSE.equals(action)) {
            pause();
        } else if (ACTION_STOP.equals(action)) {
            stopPlayback(true);
        }
        return START_NOT_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        stopPlayback(false);
        super.onDestroy();
    }

    private void play(String url, String title) {
        if (url == null || url.trim().isEmpty()) return;
        currentTitle = title == null || title.trim().isEmpty() ? "Qur'an recitation" : title;
        startForeground(NOTIFICATION_ID, buildNotification(true));

        if (url.equals(currentUrl) && mediaPlayer != null) {
            requestAudioFocus();
            mediaPlayer.start();
            updateNotification(true);
            return;
        }

        stopPlayerOnly();
        currentUrl = url;
        prepared = false;
        mediaPlayer = new MediaPlayer();
        mediaPlayer.setWakeMode(getApplicationContext(), PowerManager.PARTIAL_WAKE_LOCK);
        mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
            .build());
        mediaPlayer.setOnPreparedListener(player -> {
            prepared = true;
            requestAudioFocus();
            player.start();
            updateNotification(true);
        });
        mediaPlayer.setOnCompletionListener(player -> {
            sendPlaybackEnded();
            stopPlayback(true);
        });
        mediaPlayer.setOnErrorListener((player, what, extra) -> {
            sendPlaybackEnded();
            stopPlayback(true);
            return true;
        });

        try {
            mediaPlayer.setDataSource(url);
            mediaPlayer.prepareAsync();
        } catch (IOException | IllegalArgumentException | IllegalStateException error) {
            sendPlaybackEnded();
            stopPlayback(true);
        }
    }

    private void pause() {
        if (mediaPlayer != null && prepared && mediaPlayer.isPlaying()) {
            mediaPlayer.pause();
        }
        abandonAudioFocus();
        updateNotification(false);
        stopForeground(false);
    }

    private void stopPlayback(boolean stopService) {
        stopPlayerOnly();
        abandonAudioFocus();
        stopForeground(true);
        currentUrl = null;
        prepared = false;
        if (stopService) stopSelf();
    }

    private void stopPlayerOnly() {
        if (mediaPlayer != null) {
            try {
                mediaPlayer.reset();
                mediaPlayer.release();
            } catch (IllegalStateException ignored) {
                mediaPlayer.release();
            }
            mediaPlayer = null;
        }
    }

    private void requestAudioFocus() {
        if (audioManager == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (focusRequest == null) {
                focusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                    .setAudioAttributes(new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build())
                    .setOnAudioFocusChangeListener(this::onAudioFocusChange)
                    .build();
            }
            audioManager.requestAudioFocus(focusRequest);
        } else {
            audioManager.requestAudioFocus(this::onAudioFocusChange, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
        }
    }

    private void abandonAudioFocus() {
        if (audioManager == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && focusRequest != null) {
            audioManager.abandonAudioFocusRequest(focusRequest);
        } else {
            audioManager.abandonAudioFocus(this::onAudioFocusChange);
        }
    }

    private void onAudioFocusChange(int focusChange) {
        if (focusChange == AudioManager.AUDIOFOCUS_LOSS || focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) {
            pause();
        } else if (focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK && mediaPlayer != null) {
            mediaPlayer.setVolume(0.25f, 0.25f);
        } else if (focusChange == AudioManager.AUDIOFOCUS_GAIN && mediaPlayer != null) {
            mediaPlayer.setVolume(1f, 1f);
        }
    }

    private void sendPlaybackEnded() {
        Intent intent = new Intent(ACTION_ENDED).setPackage(getPackageName());
        sendBroadcast(intent);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Qur'an recitation",
            NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Controls ongoing Qur'an recitation playback.");
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) manager.createNotificationChannel(channel);
    }

    private void updateNotification(boolean playing) {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) manager.notify(NOTIFICATION_ID, buildNotification(playing));
    }

    private Notification buildNotification(boolean playing) {
        Intent openIntent = new Intent(this, MainActivity.class);
        PendingIntent openPendingIntent = PendingIntent.getActivity(
            this,
            0,
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Intent pauseIntent = new Intent(this, NativeAudioService.class).setAction(ACTION_PAUSE);
        PendingIntent pausePendingIntent = PendingIntent.getService(
            this,
            1,
            pauseIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Intent stopIntent = new Intent(this, NativeAudioService.class).setAction(ACTION_STOP);
        PendingIntent stopPendingIntent = PendingIntent.getService(
            this,
            2,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle(currentTitle)
            .setContentText(playing ? "Playing in background" : "Paused")
            .setContentIntent(openPendingIntent)
            .setOngoing(playing)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .addAction(android.R.drawable.ic_media_pause, "Pause", pausePendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Stop", stopPendingIntent)
            .build();
    }
}
