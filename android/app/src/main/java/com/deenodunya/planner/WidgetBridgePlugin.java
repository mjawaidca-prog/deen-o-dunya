package com.deenodunya.planner;

import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Bridges the WebView app to the NextPrayerWidget's SharedPreferences store.
 * See PHASE-2-WORKORDER Task P2-W. Call from JS after every prayer-time recompute:
 *   Capacitor.Plugins.WidgetBridge.update({ name, time, in, city, ringDone })
 */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    @PluginMethod
    public void update(PluginCall call) {
        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences("DDP_WIDGET", Context.MODE_PRIVATE);
        prefs.edit()
            .putString("next_name", call.getString("name", "—"))
            .putString("next_time", call.getString("time", ""))
            .putString("next_in", call.getString("in", ""))
            .putString("city", call.getString("city", ""))
            .putInt("ring_done", call.getInt("ringDone", 0))
            .apply();
        NextPrayerWidget.updateAllWidgets(context);
        call.resolve();
    }
}
