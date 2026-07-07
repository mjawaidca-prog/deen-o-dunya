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
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
        applySystemBarInsets();
        configureWebViewForWorship();
    }

    /**
     * FIX #2 (Adhan not playing): Android WebView blocks any audio playback that is
     * not triggered by a direct user tap. The adhan fires from a timer at prayer
     * time, so it was silently blocked. This allows programmatic playback.
     *
     * Also respects the user's system-wide font size (accessibility) by applying
     * the system font scale to WebView text zoom — helps the "font is too small"
     * feedback for elderly users without touching the CSS.
     */
    private void configureWebViewForWorship() {
        WebSettings settings = getBridge().getWebView().getSettings();
        settings.setMediaPlaybackRequiresUserGesture(false);

        float systemFontScale = getResources().getConfiguration().fontScale; // 1.0 = default
        int textZoom = Math.round(100 * systemFontScale);
        // Clamp so extreme system settings don't break the layout.
        if (textZoom < 100) textZoom = 100;
        if (textZoom > 140) textZoom = 140;
        settings.setTextZoom(textZoom);
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
