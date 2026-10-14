package com.simonpradhan.zenithwidget

import android.app.Activity
import android.app.DatePickerDialog
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import java.util.concurrent.Executors

class TaskCreateActivity : Activity() {
    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var titleInput: EditText
    private lateinit var descriptionInput: EditText
    private lateinit var dueDateButton: Button
    private lateinit var prioritySpinner: Spinner
    private lateinit var statusText: TextView
    private var dueDateIso: String? = null

    private val ink = Color.rgb(250, 250, 252)
    private val muted = Color.rgb(173, 168, 190)
    private val accent = Color.rgb(139, 92, 246)
    private val background = Color.rgb(17, 16, 22)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(22), dp(24), dp(22), dp(22))
            background = rounded(background, 0)
        }
        val scroll = ScrollView(this).apply { addView(root) }

        root.addView(TextView(this).apply {
            text = "NEW TASK"
            textSize = 11f
            letterSpacing = .14f
            setTextColor(Color.rgb(196, 181, 253))
            typeface = Typeface.DEFAULT_BOLD
        }, full())

        root.addView(TextView(this).apply {
            text = "Make room for what matters."
            textSize = 24f
            setTextColor(ink)
            typeface = Typeface.create("sans-serif", Typeface.BOLD)
        }, margins(6))

        root.addView(TextView(this).apply {
            text = "Add a task to your Zenith workspace."
            textSize = 13f
            setTextColor(muted)
        }, margins(5))

        titleInput = input("What needs to get done?")
        root.addView(titleInput, margins(24))

        descriptionInput = input("Add details (optional)").apply {
            minLines = 3
            gravity = Gravity.TOP
        }
        root.addView(descriptionInput, margins(12))

        root.addView(TextView(this).apply {
            text = "PRIORITY"
            textSize = 11f
            letterSpacing = .1f
            setTextColor(muted)
            typeface = Typeface.DEFAULT_BOLD
        }, margins(18))

        prioritySpinner = Spinner(this).apply {
            adapter = ArrayAdapter(
                this@TaskCreateActivity,
                android.R.layout.simple_spinner_dropdown_item,
                listOf("Medium", "Low", "High", "Urgent")
            )
            setPadding(dp(10), dp(8), dp(10), dp(8))
        }
        root.addView(prioritySpinner, margins(7))

        dueDateButton = Button(this).apply {
            text = "＋  Add due date (optional)"
            isAllCaps = false
            setTextColor(Color.rgb(221, 214, 254))
            background = rounded(Color.rgb(39, 33, 52), 14)
            setOnClickListener { pickDueDate() }
        }
        root.addView(dueDateButton, margins(12))

        statusText = TextView(this).apply {
            textSize = 12f
            setTextColor(muted)
        }
        root.addView(statusText, margins(10))

        root.addView(Button(this).apply {
            text = "Create task"
            isAllCaps = false
            textSize = 15f
            setTextColor(Color.WHITE)
            typeface = Typeface.DEFAULT_BOLD
            background = rounded(accent, 15)
            setOnClickListener { saveTask() }
        }, margins(18))

        root.addView(Button(this).apply {
            text = "Cancel"
            isAllCaps = false
            setTextColor(muted)
            background = rounded(Color.TRANSPARENT, 14).apply {
                setStroke(dp(1), Color.rgb(58, 51, 72))
            }
            setOnClickListener { finish() }
        }, margins(8))

        setContentView(scroll)
    }

    private fun pickDueDate() {
        val calendar = Calendar.getInstance()
        DatePickerDialog(this, { _, year, month, day ->
            val selected = Calendar.getInstance().apply { set(year, month, day, 23, 59, 0) }
            dueDateIso = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX", Locale.US).format(selected.time)
            dueDateButton.text = "Due  ·  " + SimpleDateFormat("EEE, MMM d", Locale.getDefault()).format(selected.time)
        }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH)).show()
    }

    private fun saveTask() {
        val title = titleInput.text.toString().trim()
        val description = descriptionInput.text.toString().trim()
        if (title.isBlank()) {
            statusText.text = "Give your task a title first."
            titleInput.requestFocus()
            return
        }
        val token = WidgetPreferences.getToken(this)
        if (token.isNullOrBlank()) {
            statusText.text = "Connect Zenith Widgets to your account first."
            return
        }
        statusText.text = "Saving task…"
        executor.execute {
            try {
                val priority = prioritySpinner.selectedItem.toString().lowercase(Locale.ROOT)
                ZenithApi.createTask(token, title, description, dueDateIso, priority)
                runOnUiThread {
                    Toast.makeText(this, "Task added to Zenith", Toast.LENGTH_SHORT).show()
                    ZenithWidgetProvider.refreshWidgets(this)
                    finish()
                }
            } catch (error: Exception) {
                runOnUiThread {
                    statusText.text = if (error is ApiException && error.code == 401)
                        "Your session expired. Reconnect Zenith and try again."
                    else "Couldn't save task. Check your connection and try again."
                }
            }
        }
    }

    private fun input(hintText: String) = EditText(this).apply {
        hint = hintText
        textSize = 14f
        setTextColor(ink)
        setHintTextColor(Color.rgb(132, 125, 148))
        setPadding(dp(14), dp(12), dp(14), dp(12))
        background = rounded(Color.rgb(34, 30, 43), 14).apply {
            setStroke(dp(1), Color.rgb(61, 52, 78))
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
