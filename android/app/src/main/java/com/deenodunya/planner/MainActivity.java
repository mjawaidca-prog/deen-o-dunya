package com.deenodunya.planner;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.activity.EdgeToEdge;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int NOTIFICATION_PERMISSION_REQUEST = 7312;
    private static final String NATIVE_AUDIO_BRIDGE_SCRIPT =
        "(function(){" +
        "if(window.__ddpNativeAudioInstalled)return;" +
        "if(typeof HTMLMediaElement==='undefined')return;" +
        "window.__ddpNativeAudioInstalled=true;" +
        "var activeMedia=null;" +
        "var notify=function(active){" +
        "try{if(window.DDPNativeAudio)window.DDPNativeAudio.setKeepAwake(!!active);}catch(e){}" +
        "};" +
        "var mediaTitle=function(el){" +
        "var label='Quran recitation';" +
        "try{var bar=el&&el.parentElement&&el.parentElement.innerText;if(bar)label=bar.split('\\n')[0].trim()||label;}catch(e){}" +
        "return label;" +
        "};" +
        "var srcOf=function(el){return (el&&(el.currentSrc||el.src))||'';};" +
        "var startNative=function(el){" +
        "var src=srcOf(el);" +
        "if(!src||!window.DDPNativeAudio)return;" +
        "activeMedia=el;" +
        "try{el.muted=true;el.volume=0;}catch(e){}" +
        "window.DDPNativeAudio.play(src,mediaTitle(el));" +
        "notify(true);" +
        "};" +
        "var pauseNative=function(el){" +
        "if(el&&activeMedia===el&&window.DDPNativeAudio){window.DDPNativeAudio.pause();notify(false);}" +
        "};" +
        "var stopNative=function(el){" +
        "if(el&&activeMedia===el&&window.DDPNativeAudio){window.DDPNativeAudio.stop();notify(false);activeMedia=null;}" +
        "};" +
        "var originalPlay=HTMLMediaElement.prototype.play;" +
        "HTMLMediaElement.prototype.play=function(){" +
        "var result=originalPlay.apply(this,arguments);" +
        "setTimeout(function(el){startNative(el);},0,this);" +
        "return result;" +
        "};" +
        "var originalPause=HTMLMediaElement.prototype.pause;" +
        "HTMLMediaElement.prototype.pause=function(){" +
        "pauseNative(this);" +
        "return originalPause.apply(this,arguments);" +
        "};" +
        "document.addEventListener('ended',function(ev){stopNative(ev.target);},true);" +
        "document.addEventListener('error',function(ev){stopNative(ev.target);},true);" +
        "document.addEventListener('abort',function(ev){stopNative(ev.target);},true);" +
        "document.addEventListener('playing',function(ev){if(ev.target instanceof HTMLMediaElement)notify(true);},true);" +
        "window.__ddpNativeAudioEnded=function(){" +
        "try{if(activeMedia){var el=activeMedia;activeMedia=null;notify(false);originalPause.call(el);el.dispatchEvent(new Event('ended'));}}catch(e){}" +
        "};" +
        "window.addEventListener('beforeunload',function(){try{if(window.DDPNativeAudio)window.DDPNativeAudio.stop();}catch(e){}});" +
        "})();";

    private final BroadcastReceiver nativeAudioReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (NativeAudioService.ACTION_ENDED.equals(intent.getAction())) {
                WebView webView = getBridge().getWebView();
                webView.post(() -> webView.evaluateJavascript("window.__ddpNativeAudioEnded&&window.__ddpNativeAudioEnded();", null));
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
        requestNotificationPermissionIfNeeded();
        registerNativeAudioReceiver();
        installNativeAudioBridge();
        applySystemBarInsets();
    }

    @Override
    protected void onResume() {
        super.onResume();
        injectNativeAudioBridgeScript();
    }

    @Override
    protected void onPause() {
        setScreenKeepAwake(false);
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        try {
            unregisterReceiver(nativeAudioReceiver);
        } catch (IllegalArgumentException ignored) {
        }
        super.onDestroy();
    }

    private void requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return;
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) return;
        ActivityCompat.requestPermissions(this, new String[] { Manifest.permission.POST_NOTIFICATIONS }, NOTIFICATION_PERMISSION_REQUEST);
    }

    private void registerNativeAudioReceiver() {
        IntentFilter filter = new IntentFilter(NativeAudioService.ACTION_ENDED);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(nativeAudioReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(nativeAudioReceiver, filter);
        }
    }

    private void installNativeAudioBridge() {
        WebView webView = getBridge().getWebView();
        webView.addJavascriptInterface(new NativeAudioBridge(), "DDPNativeAudio");
        injectNativeAudioBridgeScript();
    }

    private void injectNativeAudioBridgeScript() {
        WebView webView = getBridge().getWebView();
        webView.postDelayed(() -> webView.evaluateJavascript(NATIVE_AUDIO_BRIDGE_SCRIPT, null), 500);
        webView.postDelayed(() -> webView.evaluateJavascript(NATIVE_AUDIO_BRIDGE_SCRIPT, null), 1500);
    }

    private void setScreenKeepAwake(boolean keepAwake) {
        if (keepAwake) {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        } else {
            getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }
    }

    private class NativeAudioBridge {
        @JavascriptInterface
        public void play(String url, String title) {
            Intent intent = new Intent(MainActivity.this, NativeAudioService.class)
                .setAction(NativeAudioService.ACTION_PLAY)
                .putExtra(NativeAudioService.EXTRA_URL, url)
                .putExtra(NativeAudioService.EXTRA_TITLE, title);
            ContextCompat.startForegroundService(MainActivity.this, intent);
        }

        @JavascriptInterface
        public void pause() {
            Intent intent = new Intent(MainActivity.this, NativeAudioService.class)
                .setAction(NativeAudioService.ACTION_PAUSE);
            startService(intent);
        }

        @JavascriptInterface
        public void stop() {
            Intent intent = new Intent(MainActivity.this, NativeAudioService.class)
                .setAction(NativeAudioService.ACTION_STOP);
            startService(intent);
        }

        @JavascriptInterface
        public void setKeepAwake(boolean keepAwake) {
            runOnUiThread(() -> setScreenKeepAwake(keepAwake));
        }
    }

    private void applySystemBarInsets() {
        View webView = getBridge().getWebView();
        ViewCompat.setOnApplyWindowInsetsListener(webView, (view, windowInsets) -> {
            Insets systemBars = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
            view.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return windowInsets;
        });
        ViewCompat.requestApplyInsets(webView);
    }
}
