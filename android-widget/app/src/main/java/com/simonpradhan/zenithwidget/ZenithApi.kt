package com.simonpradhan.zenithwidget

import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets

data class WidgetTask(
    val title: String,
    val status: String,
    val dueDate: String?
)

data class WidgetNote(
    val id: String,
    val title: String,
    val content: String,
    val color: String,
    val updatedAt: String?
)

object ZenithApi {
    private fun request(
        path: String,
        token: String,
        method: String = "GET",
        body: JSONObject? = null
    ): JSONObject {
        val connection = (URL(BuildConfig.ZENITH_API_BASE_URL.trimEnd('/') + path)
            .openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 10000
            readTimeout = 10000
            setRequestProperty("Accept", "application/json")
            setRequestProperty("Authorization", "Bearer $token")
            if (body != null) {
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
            }
        }

        try {
            if (body != null) {
                connection.outputStream.use {
                    it.write(body.toString().toByteArray(StandardCharsets.UTF_8))
                }
            }

            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val response = stream?.use { input ->
                BufferedReader(InputStreamReader(input)).readText()
            }.orEmpty()

            if (code !in 200..299) throw ApiException(code, response)
            return if (response.isBlank()) JSONObject() else JSONObject(response)
        } finally {
            connection.disconnect()
        }
    }

    fun login(email: String, password: String): String {
        val body = JSONObject().put("email", email).put("password", password)
        val connection = (URL(BuildConfig.ZENITH_API_BASE_URL.trimEnd('/') + "/auth/login")
            .openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 10000
            readTimeout = 10000
            doOutput = true
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Accept", "application/json")
        }

        try {
            connection.outputStream.use {
                it.write(body.toString().toByteArray(StandardCharsets.UTF_8))
            }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val response = stream?.use { BufferedReader(InputStreamReader(it)).readText() }.orEmpty()
            if (code !in 200..299) throw ApiException(code, response)
            return JSONObject(response).getString("access_token")
        } finally {
            connection.disconnect()
        }
    }

    fun exchangeWidgetLinkCode(code: String): String {
        val body = JSONObject().put("code", code)
        val connection = (URL(BuildConfig.ZENITH_API_BASE_URL.trimEnd('/') + "/auth/widget-link-exchange")
            .openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 10000
            readTimeout = 10000
            doOutput = true
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Accept", "application/json")
        }

        try {
            connection.outputStream.use {
                it.write(body.toString().toByteArray(StandardCharsets.UTF_8))
            }
            val responseCode = connection.responseCode
            val stream = if (responseCode in 200..299) connection.inputStream else connection.errorStream
            val response = stream?.use { BufferedReader(InputStreamReader(it)).readText() }.orEmpty()
            if (responseCode !in 200..299) throw ApiException(responseCode, response)
            return JSONObject(response).getString("access_token")
        } finally {
            connection.disconnect()
        }
    }

    fun getUpcomingTasks(token: String): List<WidgetTask> {
        val json = request("/tasks/?limit=20&offset=0&order_by_due_date=true", token)
        val items = json.optJSONArray("items") ?: return emptyList()
        val tasks = mutableListOf<WidgetTask>()
        for (index in 0 until items.length()) {
            val item = items.optJSONObject(index) ?: continue
            val status = item.optString("status", "pending")
            if (status == "completed" || status == "cancelled") continue
            tasks += WidgetTask(
                title = item.optString("title", "Untitled task"),
                status = status,
                dueDate = if (item.isNull("due_date")) null else item.optString("due_date")
            )
            if (tasks.size == 5) break
        }
        return tasks
    }

    fun getRecentNotes(token: String): List<WidgetNote> {
        val json = request("/notes/?limit=8&offset=0", token)
        val items = json.optJSONArray("items") ?: return emptyList()
        return (0 until items.length()).mapNotNull { index ->
            val item = items.optJSONObject(index) ?: return@mapNotNull null
            WidgetNote(
                id = item.optString("id"),
                title = item.optString("title", "Untitled note"),
                content = item.optString("content"),
                color = item.optString("color", "green"),
                updatedAt = item.optString("updated_at").takeIf { it.isNotBlank() && it != "null" }
            )
        }
    }

    fun createNote(token: String, title: String, content: String, color: String = "green") {
        val body = JSONObject().put("title", title).put("content", content).put("color", color)
        request("/notes/", token, "POST", body)
    }

    fun createTask(token: String, title: String, description: String?, dueDate: String?, priority: String) {
        val body = JSONObject()
            .put("title", title)
            .put("priority", priority)
            .put("status", "pending")
        if (!description.isNullOrBlank()) body.put("description", description)
        if (!dueDate.isNullOrBlank()) body.put("due_date", dueDate)
        request("/tasks/", token, "POST", body)
    }
}

class ApiException(val code: Int, message: String) : Exception(message)
