package com.deenodunya.planner;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * Deen o Dunya — Next Prayer home-screen widget.
 *
 * The WebView app writes the next prayer name + time + city into SharedPreferences
 * whenever it recomputes prayer times (via a small Capacitor Preferences bridge, or
 * a tiny plugin — see PHASE-2-WORKORDER Task P2-W). This provider just reads those
 * values and renders them. It updates:
 *   - every 30 min via android:updatePeriodMillis (the OS minimum is 30 min), and
 *   - immediately whenever the app calls updateAllWidgets() after a recompute.
 *
 * Data keys in SharedPreferences ("DDP_WIDGET"):
 *   next_name   e.g. "Maghrib"
 *   next_time   e.g. "7:42 PM"
 *   next_in     e.g. "in 2h 15m"
 *   city        e.g. "Karachi"
 *   ring_done   int 0..8   (today's completed segments, for the mini ring)
 */
public class NextPrayerWidget extends AppWidgetProvider {

    static final String PREFS = "DDP_WIDGET";

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int id : appWidgetIds) {
            updateWidget(context, manager, id);
        }
    }

    static void updateWidget(Context context, AppWidgetManager manager, int widgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String name = prefs.getString("next_name", "—");
        String time = prefs.getString("next_time", "");
        String in   = prefs.getString("next_in", "");
        String city = prefs.getString("city", "");
        int ringDone = prefs.getInt("ring_done", 0);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_next_prayer);
        views.setTextViewText(R.id.widget_prayer_name, name);
        views.setTextViewText(R.id.widget_prayer_time, time);
        views.setTextViewText(R.id.widget_prayer_in, in);
        views.setTextViewText(R.id.widget_city, city);
        views.setTextViewText(R.id.widget_ring, ringDone + "/8");

        // Tap anywhere on the widget opens the app.
        Intent launch = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (launch != null) {
            PendingIntent pi = PendingIntent.getActivity(
                context, 0, launch,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_root, pi);
        }

        manager.updateAppWidget(widgetId, views);
    }

    /** Call from the app bridge after each prayer-time recompute. */
    public static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName cn = new ComponentName(context, NextPrayerWidget.class);
        int[] ids = manager.getAppWidgetIds(cn);
        for (int id : ids) {
            updateWidget(context, manager, id);
        }
    }
}
