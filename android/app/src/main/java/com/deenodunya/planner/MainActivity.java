package com.deenodunya.planner;

import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.activity.EdgeToEdge;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String MEDIA_KEEP_AWAKE_SCRIPT =
        "(function(){" +
        "if(window.__ddpMediaKeepAwakeInstalled)return;" +
        "if(typeof HTMLMediaElement==='undefined')return;" +
        "window.__ddpMediaKeepAwakeInstalled=true;" +
        "var notify=function(active){" +
        "try{if(window.DDPMediaKeepAwake)window.DDPMediaKeepAwake.setKeepAwake(!!active);}catch(e){}" +
        "};" +
        "var update=function(){" +
        "var media=document.querySelectorAll('audio,video');" +
        "var active=false;" +
        "for(var i=0;i<media.length;i++){" +
        "if(!media[i].paused&&!media[i].ended){active=true;break;}" +
        "}" +
        "notify(active);" +
        "};" +
        "['play','playing','pause','ended','error','abort','emptied','suspend'].forEach(function(name){" +
        "document.addEventListener(name,function(){setTimeout(update,0);},true);" +
        "});" +
        "var originalPlay=HTMLMediaElement.prototype.play;" +
        "HTMLMediaElement.prototype.play=function(){" +
        "var result=originalPlay.apply(this,arguments);" +
        "setTimeout(update,0);" +
        "return result;" +
        "};" +
        "var originalPause=HTMLMediaElement.prototype.pause;" +
        "HTMLMediaElement.prototype.pause=function(){" +
        "var result=originalPause.apply(this,arguments);" +
        "setTimeout(update,0);" +
        "return result;" +
        "};" +
        "document.addEventListener('visibilitychange',update);" +
        "window.addEventListener('beforeunload',function(){notify(false);});" +
        "setInterval(update,5000);" +
        "setTimeout(update,0);" +
        "})();";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
        installMediaKeepAwakeBridge();
        applySystemBarInsets();
    }

    @Override
    protected void onResume() {
        super.onResume();
        injectMediaKeepAwakeScript();
    }

    @Override
    protected void onPause() {
        setScreenKeepAwake(false);
        super.onPause();
    }

    private void installMediaKeepAwakeBridge() {
        WebView webView = getBridge().getWebView();
        webView.addJavascriptInterface(new MediaKeepAwakeBridge(), "DDPMediaKeepAwake");
        injectMediaKeepAwakeScript();
    }

    private void injectMediaKeepAwakeScript() {
        WebView webView = getBridge().getWebView();
        webView.postDelayed(() -> webView.evaluateJavascript(MEDIA_KEEP_AWAKE_SCRIPT, null), 500);
        webView.postDelayed(() -> webView.evaluateJavascript(MEDIA_KEEP_AWAKE_SCRIPT, null), 1500);
    }

    private void setScreenKeepAwake(boolean keepAwake) {
        if (keepAwake) {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        } else {
            getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }
    }

    private class MediaKeepAwakeBridge {
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
