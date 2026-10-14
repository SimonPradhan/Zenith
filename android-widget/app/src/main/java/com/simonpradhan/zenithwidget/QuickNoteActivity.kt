package com.simonpradhan.zenithwidget

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
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
    private var selectedColor = "green"
    private val paperColors = listOf(
        "green" to Color.rgb(229, 242, 220),
        "yellow" to Color.rgb(255, 247, 196),
        "blue" to Color.rgb(220, 237, 255),
        "pink" to Color.rgb(255, 225, 237),
        "purple" to Color.rgb(238, 228, 255)
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(22), dp(24), dp(22), dp(22))
            background = rounded(Color.rgb(17, 16, 22), 0)
        }

        root.addView(TextView(this).apply {
            text = "YOUR LITTLE CORNER"
            textSize = 11f
            letterSpacing = .12f
            setTextColor(Color.rgb(196, 181, 253))
            typeface = Typeface.DEFAULT_BOLD
        }, full())

        root.addView(TextView(this).apply {
            text = "Capture the thought."
            textSize = 25f
            setTextColor(Color.rgb(250, 250, 252))
            typeface = Typeface.create("sans-serif", Typeface.BOLD)
        }, margins(7))

        root.addView(TextView(this).apply {
            text = "A sticky note that syncs with your Zenith workspace."
            textSize = 13f
            setTextColor(Color.rgb(173, 168, 190))
        }, margins(5))

        val paper = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(20), dp(16), dp(16))
            background = rounded(paperColors.first().second, 4)
        }
        root.addView(paper, margins(22))

        titleInput = EditText(this).apply {
            hint = "Note title"
            textSize = 17f
            setTextColor(Color.rgb(39, 49, 40))
            setHintTextColor(Color.rgb(102, 119, 106))
            typeface = Typeface.DEFAULT_BOLD
            setSingleLine(true)
            setPadding(0, dp(4), 0, dp(8))
            background = rounded(Color.TRANSPARENT, 0)
        }
        paper.addView(titleInput, full())

        contentInput = EditText(this).apply {
            hint = "Write something worth remembering…"
            textSize = 15f
            setTextColor(Color.rgb(62, 74, 63))
            setHintTextColor(Color.rgb(102, 119, 106))
            minLines = 7
            gravity = Gravity.TOP
            setPadding(0, dp(8), 0, dp(8))
            background = rounded(Color.TRANSPARENT, 0)
        }
        paper.addView(contentInput, LinearLayout.LayoutParams(-1, dp(180)))

        root.addView(TextView(this).apply {
            text = "PAPER COLOR"
            textSize = 11f
            letterSpacing = .1f
            setTextColor(Color.rgb(173, 168, 190))
            typeface = Typeface.DEFAULT_BOLD
        }, margins(18))

        val swatches = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        paperColors.forEach { (name, color) ->
            val swatch = TextView(this).apply {
                text = if (name == selectedColor) "✓" else ""
                gravity = Gravity.CENTER
                textSize = 17f
                setTextColor(Color.rgb(51, 53, 51))
                background = rounded(color, 50).apply { setStroke(dp(1), Color.rgb(86, 80, 98)) }
                setOnClickListener {
                    selectedColor = name
                    for (i in 0 until swatches.childCount) (swatches.getChildAt(i) as TextView).text = ""
                    text = "✓"
                    paper.background = rounded(color, 4)
                }
            }
            val lp = LinearLayout.LayoutParams(dp(38), dp(38)).apply { marginEnd = dp(10) }
            swatches.addView(swatch, lp)
        }
        root.addView(swatches, margins(9))

        statusText = TextView(this).apply {
            textSize = 12f
            setTextColor(Color.rgb(173, 168, 190))
        }
        root.addView(statusText, margins(12))

        root.addView(Button(this).apply {
            text = "Save sticky note"
            isAllCaps = false
            textSize = 15f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.WHITE)
            background = rounded(Color.rgb(139, 92, 246), 15)
            setOnClickListener { saveNote() }
        }, margins(16))

        root.addView(Button(this).apply {
            text = "Cancel"
            isAllCaps = false
            setTextColor(Color.rgb(173, 168, 190))
            background = rounded(Color.TRANSPARENT, 14).apply {
                setStroke(dp(1), Color.rgb(58, 51, 72))
            }
            setOnClickListener { finish() }
        }, margins(8))

        setContentView(root)
    }

    private fun saveNote() {
        val title = titleInput.text.toString().trim()
        val content = contentInput.text.toString().trim()
        if (title.isBlank() || content.isBlank()) {
            statusText.text = "Add a title and a little content first."
            return
        }
        val token = WidgetPreferences.getToken(this)
        if (token.isNullOrBlank()) {
            statusText.text = "Connect Zenith Widgets to your account first."
            return
        }
        statusText.text = "Saving your note…"
        executor.execute {
            try {
                ZenithApi.createNote(token, title, content, selectedColor)
                runOnUiThread {
                    Toast.makeText(this, "Sticky note saved to Zenith", Toast.LENGTH_SHORT).show()
                    ZenithWidgetProvider.refreshWidgets(this)
                    NotesWidgetProvider.refresh(
                        this, AppWidgetManager.getInstance(this),
                        AppWidgetManager.getInstance(this).getAppWidgetIds(ComponentName(this, NotesWidgetProvider::class.java))
                    )
                    finish()
                }
            } catch (error: Exception) {
                runOnUiThread {
                    statusText.text = if (error is ApiException && error.code == 401)
                        "Your session expired. Reconnect Zenith and try again."
                    else "Couldn't save the note. Check your connection and try again."
                }
            }
        }
    }

    private fun rounded(color: Int, radius: Int) = GradientDrawable().apply {
        setColor(color)
        cornerRadius = dp(radius).toFloat()
    }
    private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()
    private fun full() = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
    private fun margins(top: Int) = full().apply { topMargin = dp(top) }

    override fun onDestroy() {
        executor.shutdown()
        super.onDestroy()
    }
}
