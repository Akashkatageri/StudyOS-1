package com.studyos.app;

import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "StudyOSWidget")
public class StudyOSWidgetPlugin extends Plugin {

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        try {
            JSObject data = call.getData();
            
            // 1. Username
            String username = data.optString("username", "Student");
            
            // 2. Streak - optString converts numbers (like 5) to strings (like "5") automatically!
            String streak = data.optString("streak", "0");
            
            // 3. Today Focus (string or minutes number)
            String todayFocus = "0 min";
            if (data.has("todayFocus")) {
                todayFocus = data.optString("todayFocus", "0 min");
            } else if (data.has("todayFocusMinutes")) {
                todayFocus = data.optString("todayFocusMinutes", "0") + " min";
            }
            
            // 4. Pet Status
            String petStatus = "Mochi is keeping you company!";
            if (data.has("petStatus")) {
                petStatus = data.optString("petStatus", "Mochi is keeping you company!");
            } else if (data.has("mochiMessage")) {
                petStatus = data.optString("mochiMessage", "Mochi is keeping you company!");
            }
            
            // 5. Avatar Icon
            String avatarIcon = "🐱";
            if (data.has("avatarIcon")) {
                avatarIcon = data.optString("avatarIcon", "🐱");
            } else if (data.has("mochiState")) {
                String mochiState = data.optString("mochiState", "idle");
                if ("sleeping".equals(mochiState)) {
                    avatarIcon = "😴";
                } else if ("studying".equals(mochiState)) {
                    avatarIcon = "📚";
                } else if ("happy".equals(mochiState)) {
                    avatarIcon = "🥰";
                } else if ("active".equals(mochiState)) {
                    avatarIcon = "⚡";
                } else {
                    avatarIcon = "🐱";
                }
            }

            Context context = getContext();
            SharedPreferences prefs = context.getSharedPreferences("StudyOSWidgetPrefs", Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("streak", streak);
            editor.putString("username", username);
            editor.putString("todayFocus", todayFocus);
            editor.putString("petStatus", petStatus);
            editor.putString("avatarIcon", avatarIcon);
            editor.apply();

            // Notify the widget provider to trigger an update on screen
            StudyOSWidgetProvider.updateMyWidgets(context);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to update widget data: " + e.getMessage());
        }
    }
}
