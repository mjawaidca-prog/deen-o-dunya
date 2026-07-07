package com.deenodunya.planner;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import androidx.activity.EdgeToEdge;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridgePlugin.class);
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
        applySystemBarInsets();
        configureWebViewForWorship();
    }

    /**
     * Adhan/recitation was silently blocked because WebView refuses audio playback
     * that isn't triggered by a direct user tap (adhan fires from a timer). Also
     * applies the user's system font scale to WebView text zoom (clamped 100-140%)
     * for the "font is too small" feedback, without touching app CSS.
     */
    private void configureWebViewForWorship() {
        WebSettings settings = getBridge().getWebView().getSettings();
        settings.setMediaPlaybackRequiresUserGesture(false);

        float systemFontScale = getResources().getConfiguration().fontScale;
        int textZoom = Math.round(100 * systemFontScale);
        if (textZoom < 100) textZoom = 100;
        if (textZoom > 140) textZoom = 140;
        settings.setTextZoom(textZoom);

        // Pinch-to-zoom on any screen. The on-screen +/- zoom widget is hidden since
        // the app provides its own zoom buttons in the UI.
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
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
