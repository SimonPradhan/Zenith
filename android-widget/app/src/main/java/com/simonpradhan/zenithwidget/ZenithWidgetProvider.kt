package com.simonpradhan.zenithwidget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.Executors

class ZenithWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        manager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        refresh(context, manager, appWidgetIds)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_REFRESH) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(
                ComponentName(context, ZenithWidgetProvider::class.java)
            )
            refresh(context, manager, ids)
        }
    }

    companion object {
        private const val ACTION_REFRESH = "com.simonpradhan.zenithwidget.REFRESH"
        private val executor = Executors.newSingleThreadExecutor()

        fun refresh(context: Context, manager: AppWidgetManager, ids: IntArray) {
            if (ids.isEmpty()) return

            ids.forEach { id ->
                val views = RemoteViews(context.packageName, R.layout.zenith_widget)
                views.setTextViewText(R.id.widget_tasks, "Refreshing your tasks…")

                val refreshIntent = Intent(context, ZenithWidgetProvider::class.java).apply {
                    action = ACTION_REFRESH
                }
                views.setOnClickPendingIntent(
                    R.id.refresh_button,
                    PendingIntent.getBroadcast(
                        context, 1001, refreshIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                )

                val noteIntent = Intent(context, QuickNoteActivity::class.java)
                views.setOnClickPendingIntent(
                    R.id.quick_note_button,
                    PendingIntent.getActivity(
                        context, 1002, noteIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                )

                val openIntent = Intent(context, MainActivity::class.java)
                views.setOnClickPendingIntent(
                    R.id.widget_heading,
                    PendingIntent.getActivity(
                        context, 1003, openIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                )
                manager.updateAppWidget(id, views)
            }

            executor.execute {
                val token = WidgetPreferences.getToken(context)
                val text = if (token.isNullOrBlank()) {
                    "Open Zenith Widgets to sign in and load your tasks."
                } else {
                    try {
                        val tasks = ZenithApi.getUpcomingTasks(token)
                        if (tasks.isEmpty()) {
                            "You're all caught up. No open tasks found."
                        } else {
                            tasks.joinToString("\n") { task ->
                                val marker = if (task.dueDate == null) "•" else "◦"
                                val due = task.dueDate?.let { "  ·  ${formatDueDate(it)}" }.orEmpty()
                                "$marker ${task.title}$due"
                            }
                        }
                    } catch (error: Exception) {
                        if (error is ApiException && error.code == 401) {
                            "Your session expired. Open Zenith Widgets to sign in again."
                        } else {
                            "Couldn't refresh tasks. Tap Refresh to try again."
                        }
                    }
                }

                ids.forEach { id ->
                    val views = RemoteViews(context.packageName, R.layout.zenith_widget)
                    views.setTextViewText(R.id.widget_tasks, text)
                    val refreshIntent = Intent(context, ZenithWidgetProvider::class.java).apply {
                        action = ACTION_REFRESH
                    }
                    views.setOnClickPendingIntent(
                        R.id.refresh_button,
                        PendingIntent.getBroadcast(
                            context, 1001, refreshIntent,
                            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                        )
                    )
                    views.setOnClickPendingIntent(
                        R.id.quick_note_button,
                        PendingIntent.getActivity(
                            context, 1002, Intent(context, QuickNoteActivity::class.java),
                            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                        )
                    )
                    views.setOnClickPendingIntent(
                        R.id.widget_heading,
                        PendingIntent.getActivity(
                            context, 1003, Intent(context, MainActivity::class.java),
                            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                        )
                    )
                    manager.updateAppWidget(id, views)
                }
            }
        }

        private fun formatDueDate(raw: String): String {
            return try {
                val parsed = java.time.Instant.parse(raw)
                SimpleDateFormat("MMM d", Locale.getDefault()).format(Date.from(parsed))
            } catch (_: Exception) {
                raw.substringBefore("T")
            }
        }
    }
}
