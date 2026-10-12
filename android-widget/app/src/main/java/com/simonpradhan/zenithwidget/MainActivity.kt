package com.simonpradhan.zenithwidget

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import java.util.concurrent.Executors

class MainActivity : Activity() {
    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var emailInput: EditText
    private lateinit var passwordInput: EditText
    private lateinit var statusText: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(28, 36, 28, 28)
            setBackgroundColor(Color.rgb(9, 9, 11))
        }

        root.addView(TextView(this).apply {
            text = "Zenith Widgets"
            textSize = 26f
            setTextColor(Color.rgb(167, 139, 250))
        }, matchWidth())

        root.addView(TextView(this).apply {
            text = "Sign in with your existing Zenith account to connect your home-screen widget."
            textSize = 15f
            setTextColor(Color.LTGRAY)
        }, margins(top = 10))

        emailInput = EditText(this).apply {
            hint = "Email address"
            setSingleLine(true)
            inputType = 33
        }
        root.addView(emailInput, margins(top = 20))

        passwordInput = EditText(this).apply {
            hint = "Password"
            setSingleLine(true)
            inputType = 129
        }
        root.addView(passwordInput, margins(top = 8))

        statusText = TextView(this).apply {
            setTextColor(Color.LTGRAY)
            textSize = 13f
        }
        root.addView(statusText, margins(top = 8))

        root.addView(Button(this).apply {
            text = "Sign in"
            setOnClickListener { signIn() }
        }, margins(top = 14))

        root.addView(Button(this).apply {
            text = "Create a quick note"
            setOnClickListener {
                if (WidgetPreferences.getToken(this@MainActivity) == null) {
                    Toast.makeText(this@MainActivity, "Sign in first.", Toast.LENGTH_SHORT).show()
                } else {
                    startActivity(Intent(this@MainActivity, QuickNoteActivity::class.java))
                }
            }
        }, margins(top = 8))

        setContentView(root)
    }

    private fun signIn() {
        val email = emailInput.text.toString().trim()
        val password = passwordInput.text.toString()
        if (email.isBlank() || password.isBlank()) {
            statusText.text = "Enter your email and password."
            return
        }

        statusText.text = "Signing in…"
        executor.execute {
            try {
                val token = ZenithApi.login(email, password)
                WidgetPreferences.saveToken(this, token)
                runOnUiThread {
                    passwordInput.text.clear()
                    statusText.text = "Connected. Add the Zenith Tasks widget from your home-screen widget picker."
                    refreshWidgets(this)
                }
            } catch (error: Exception) {
                runOnUiThread {
                    statusText.text = when (error) {
                        is ApiException -> if (error.code == 401) "Email or password was incorrect." else "Sign-in failed (HTTP ${error.code})."
                        else -> "Couldn't connect. Check your internet and try again."
                    }
                }
            }
        }
    }

    private fun refreshWidgets(context: Context) {
        val manager = AppWidgetManager.getInstance(context)
        val ids = manager.getAppWidgetIds(ComponentName(context, ZenithWidgetProvider::class.java))
        ZenithWidgetProvider.refresh(context, manager, ids)
    }

    private fun matchWidth() = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
    )

    private fun margins(top: Int = 0) = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
    ).apply {
        topMargin = (top * resources.displayMetrics.density).toInt()
    }

    override fun onDestroy() {
        executor.shutdown()
        super.onDestroy()
    }
}
