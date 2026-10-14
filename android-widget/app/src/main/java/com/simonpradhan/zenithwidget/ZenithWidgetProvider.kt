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
    override fun onUpdate(context: Context, manager: AppWidgetManager, appWidgetIds: IntArray) {
        refresh(context, manager, appWidgetIds)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_REFRESH) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, ZenithWidgetProvider::class.java))
            refresh(context, manager, ids)
        }
    }

    companion object {
        private const val ACTION_REFRESH = "com.simonpradhan.zenithwidget.REFRESH"
        private val executor = Executors.newSingleThreadExecutor()

        fun refreshWidgets(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            refresh(context, manager, manager.getAppWidgetIds(ComponentName(context, ZenithWidgetProvider::class.java)))
        }

        fun refresh(context: Context, manager: AppWidgetManager, ids: IntArray) {
            if (ids.isEmpty()) return
            ids.forEach { id ->
                val views = RemoteViews(context.packageName, R.layout.zenith_widget)
                views.setTextViewText(R.id.widget_tasks, "Refreshing your tasks…")
                views.setOnClickPendingIntent(R.id.refresh_button, refreshIntent(context))
                views.setOnClickPendingIntent(R.id.quick_note_button, PendingIntent.getActivity(
                    context, 1002, Intent(context, TaskCreateActivity::class.java),
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                ))
                views.setOnClickPendingIntent(R.id.widget_heading, PendingIntent.getActivity(
                    context, 1003, Intent(context, MainActivity::class.java),
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                ))
                manager.updateAppWidget(id, views)
            }

            executor.execute {
                val token = WidgetPreferences.getToken(context)
                val text = if (token.isNullOrBlank()) {
                    "Open Zenith Widgets to connect your account."
                } else try {
                    val tasks = ZenithApi.getUpcomingTasks(token)
                    if (tasks.isEmpty()) "You're all caught up. No open tasks found."
                    else tasks.joinToString("\n") { task ->
                        val due = task.dueDate?.let { "  ·  ${formatDueDate(it)}" }.orEmpty()
                        val status = if (task.status == "in_progress") "◉" else "○"
                        "$status  ${task.title}$due"
                    }
                } catch (error: Exception) {
                    if (error is ApiException && error.code == 401) "Your session expired. Reconnect Zenith."
                    else "Couldn't refresh tasks. Tap Refresh to try again."
                }

                ids.forEach { id ->
                    val views = RemoteViews(context.packageName, R.layout.zenith_widget)
                    views.setTextViewText(R.id.widget_tasks, text)
                    views.setOnClickPendingIntent(R.id.refresh_button, refreshIntent(context))
                    views.setOnClickPendingIntent(R.id.quick_note_button, PendingIntent.getActivity(
                        context, 1002, Intent(context, TaskCreateActivity::class.java),
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    ))
                    views.setOnClickPendingIntent(R.id.widget_heading, PendingIntent.getActivity(
                        context, 1003, Intent(context, MainActivity::class.java),
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    ))
                    manager.updateAppWidget(id, views)
                }
            }
        }

        private fun refreshIntent(context: Context) = PendingIntent.getBroadcast(
            context, 1001, Intent(context, ZenithWidgetProvider::class.java).setAction(ACTION_REFRESH),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        private fun formatDueDate(raw: String): String = try {
            val parsed = java.time.Instant.parse(raw)
            SimpleDateFormat("MMM d", Locale.getDefault()).format(Date.from(parsed))
        } catch (_: Exception) { raw.substringBefore("T") }
    }
}
