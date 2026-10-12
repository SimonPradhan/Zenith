package com.simonpradhan.zenithwidget

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.graphics.Color
import android.os.Bundle
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import java.util.concurrent.Executors

class QuickNoteActivity : Activity() {
    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var titleInput: EditText
    private lateinit var contentInput: EditText
    private lateinit var statusText: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(24, 28, 24, 24)
            setBackgroundColor(Color.rgb(9, 9, 11))
        }

        root.addView(TextView(this).apply {
            text = "Quick note"
            textSize = 25f
            setTextColor(Color.rgb(167, 139, 250))
        }, params())

        titleInput = EditText(this).apply {
            hint = "Note title"
            setSingleLine(true)
        }
        root.addView(titleInput, margins(16))

        contentInput = EditText(this).apply {
            hint = "Write your note…"
            minLines = 5
            gravity = android.view.Gravity.TOP
        }
        root.addView(contentInput, margins(8))

        statusText = TextView(this).apply {
            setTextColor(Color.LTGRAY)
        }
        root.addView(statusText, margins(8))

        root.addView(Button(this).apply {
            text = "Save note"
            setOnClickListener { saveNote() }
        }, margins(12))

        setContentView(root)
    }

    private fun saveNote() {
        val title = titleInput.text.toString().trim()
        val content = contentInput.text.toString().trim()
        if (title.isBlank() || content.isBlank()) {
            statusText.text = "Enter a title and note content."
            return
        }

        val token = WidgetPreferences.getToken(this)
        if (token == null) {
            statusText.text = "Sign in to Zenith Widgets first."
            return
        }

        statusText.text = "Saving…"
        executor.execute {
            try {
                ZenithApi.createNote(token, title, content)
                runOnUiThread {
                    Toast.makeText(this, "Note saved to Zenith", Toast.LENGTH_SHORT).show()
                    finish()
                }
            } catch (error: Exception) {
                runOnUiThread {
                    statusText.text = if (error is ApiException && error.code == 401) {
                        "Session expired. Reopen Zenith Widgets and sign in again."
                    } else {
                        "Couldn't save note. Check your connection and try again."
                    }
                }
            }
        }
    }

    private fun params() = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
    )

    private fun margins(top: Int) = params().apply {
        topMargin = (top * resources.displayMetrics.density).toInt()
    }

    override fun onDestroy() {
        executor.shutdown()
        super.onDestroy()
    }
}
