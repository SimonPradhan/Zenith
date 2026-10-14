package com.simonpradhan.zenithwidget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.widget.RemoteViews
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.Executors

class NotesWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, manager: AppWidgetManager, appWidgetIds: IntArray) {
        refresh(context, manager, appWidgetIds)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_REFRESH) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, NotesWidgetProvider::class.java))
            refresh(context, manager, ids)
        }
    }

    companion object {
        private const val ACTION_REFRESH = "com.simonpradhan.zenithwidget.NOTES_REFRESH"
        private val executor = Executors.newSingleThreadExecutor()

        fun refresh(context: Context, manager: AppWidgetManager, ids: IntArray) {
            if (ids.isEmpty()) return
            ids.forEach { id ->
                val views = RemoteViews(context.packageName, R.layout.zenith_notes_widget)
                views.setTextViewText(R.id.note_card_title, "Your sticky notes")
                views.setTextViewText(R.id.note_card_content, "Your ideas will live here.")
                views.setOnClickPendingIntent(R.id.note_add_button, activityIntent(context, QuickNoteActivity::class.java, 2201))
                views.setOnClickPendingIntent(R.id.note_card, activityIntent(context, QuickNoteActivity::class.java, 2202))
                views.setOnClickPendingIntent(R.id.notes_refresh_button, refreshIntent(context))
                manager.updateAppWidget(id, views)
            }

            executor.execute {
                val token = WidgetPreferences.getToken(context)
                val note = if (token.isNullOrBlank()) null else try {
                    ZenithApi.getRecentNotes(token).firstOrNull()
                } catch (_: Exception) { null }

                ids.forEach { id ->
                    val views = RemoteViews(context.packageName, R.layout.zenith_notes_widget)
                    if (token.isNullOrBlank()) {
                        views.setTextViewText(R.id.note_card_title, "Connect Zenith")
                        views.setTextViewText(R.id.note_card_content, "Open Zenith Widgets to connect your account.")
                        views.setTextViewText(R.id.note_updated, "Waiting for connection")
                    } else if (note == null) {
                        views.setTextViewText(R.id.note_card_title, "A fresh page")
                        views.setTextViewText(R.id.note_card_content, "Capture a thought before it slips away.")
                        views.setTextViewText(R.id.note_updated, "No notes yet")
                    } else {
                        views.setTextViewText(R.id.note_card_title, note.title)
                        views.setTextViewText(R.id.note_card_content, note.content)
                        views.setTextViewText(R.id.note_updated, note.updatedAt?.let { formatUpdated(it) } ?: "Saved in Zenith")
                        val background = when (note.color.lowercase(Locale.ROOT)) {
                            "yellow" -> Color.rgb(255, 247, 196)
                            "blue" -> Color.rgb(220, 237, 255)
                            "pink" -> Color.rgb(255, 225, 237)
                            "purple" -> Color.rgb(238, 228, 255)
                            else -> Color.rgb(229, 242, 220)
                        }
                        views.setInt(R.id.note_card, "setBackgroundColor", background)
                    }
                    views.setOnClickPendingIntent(R.id.note_add_button, activityIntent(context, QuickNoteActivity::class.java, 2201))
                    views.setOnClickPendingIntent(R.id.note_card, activityIntent(context, QuickNoteActivity::class.java, 2202))
                    views.setOnClickPendingIntent(R.id.notes_refresh_button, refreshIntent(context))
                    manager.updateAppWidget(id, views)
                }
            }
        }

        private fun activityIntent(context: Context, activity: Class<*>, requestCode: Int) =
            PendingIntent.getActivity(
                context, requestCode, Intent(context, activity),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

        private fun refreshIntent(context: Context) = PendingIntent.getBroadcast(
            context, 2203,
            Intent(context, NotesWidgetProvider::class.java).setAction(ACTION_REFRESH),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        private fun formatUpdated(raw: String): String = try {
            val instant = java.time.Instant.parse(raw)
            "Updated " + SimpleDateFormat("MMM d, yyyy", Locale.getDefault()).format(Date.from(instant))
        } catch (_: Exception) { "Saved in Zenith" }
    }
}
