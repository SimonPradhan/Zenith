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
import java.util.concurrent.Executors

class MainActivity : Activity() {
    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var emailInput: EditText
    private lateinit var passwordInput: EditText
    private lateinit var linkCodeInput: EditText
    private lateinit var statusText: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(28, 36, 28, 28)
            setBackgroundColor(Color.rgb(9, 9, 11))
        }

        root.addView(TextView(this).apply {
            text = "Zenith"
            textSize = 28f
            setTextColor(Color.rgb(167, 139, 250))
        }, matchWidth())

        root.addView(TextView(this).apply {
            text = "Connect this widget to the Zenith account already signed in on your phone."
            textSize = 15f
            setTextColor(Color.LTGRAY)
        }, margins(top = 10))

        root.addView(TextView(this).apply {
            text = "Recommended: open Zenith PWA → Settings → Connect Android widget. Your account will link without entering your password again."
            textSize = 14f
            setTextColor(Color.rgb(196, 181, 253))
        }, margins(top = 18))

        linkCodeInput = EditText(this).apply {
            hint = "Paste one-time connection code"
            setSingleLine(true)
            inputType = android.text.InputType.TYPE_CLASS_TEXT or
                android.text.InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS
            setTextColor(Color.WHITE)
            setHintTextColor(Color.GRAY)
        }
        root.addView(linkCodeInput, margins(top = 12))

        root.addView(Button(this).apply {
            text = "Connect with code"
            setOnClickListener { redeemLinkCode(linkCodeInput.text.toString().trim()) }
        }, margins(top = 8))

        statusText = TextView(this).apply {
            setTextColor(Color.LTGRAY)
            textSize = 13f
        }
        root.addView(statusText, margins(top = 10))

        root.addView(TextView(this).apply {
            text = "Or sign in directly"
            textSize = 14f
            setTextColor(Color.LTGRAY)
        }, margins(top = 24))

        emailInput = EditText(this).apply {
            hint = "Email address"
            setSingleLine(true)
            inputType = 33
        }
        root.addView(emailInput, margins(top = 8))

        passwordInput = EditText(this).apply {
            hint = "Password"
            setSingleLine(true)
            inputType = 129
        }
        root.addView(passwordInput, margins(top = 8))

        root.addView(Button(this).apply {
            text = "Sign in with password"
            setOnClickListener { signIn() }
        }, margins(top = 8))

        setContentView(root)
        handleWidgetLinkIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleWidgetLinkIntent(intent)
    }

    private fun handleWidgetLinkIntent(intent: Intent?) {
        val code = intent?.data?.takeIf {
            it.scheme == "zenithwidget" && it.host == "link"
        }?.getQueryParameter("code") ?: return

        // Remove the code from the Activity's retained intent after reading it.
        setIntent(Intent(this, MainActivity::class.java))
        redeemLinkCode(code)
    }

    private fun redeemLinkCode(code: String) {
        if (code.isBlank()) {
            statusText.text = "Generate a connection code in Zenith Settings first."
            return
        }

        statusText.text = "Connecting your Zenith account…"
        executor.execute {
            try {
                val token = ZenithApi.exchangeWidgetLinkCode(code)
                WidgetPreferences.saveToken(this, token)
                runOnUiThread {
                    linkCodeInput.text.clear()
                    statusText.text = "Connected! Your home-screen widget is now linked to Zenith."
                    refreshWidgets(this)
                }
            } catch (error: Exception) {
                runOnUiThread {
                    statusText.text = when (error) {
                        is ApiException -> {
                            val detail = try {
                                org.json.JSONObject(error.message.orEmpty())
                                    .optString("detail")
                            } catch (_: Exception) {
                                ""
                            }

                            when {
                                error.code == 400 ->
                                    detail.ifBlank {
                                        "Code expired or already used. Generate a new code."
                                    }
                                else ->
                                    detail.ifBlank {
                                        "Connection failed (HTTP ${error.code})."
                                    }
                            }
                        }
                        else ->
                            "Connection failed: ${error.message ?: "Check your internet and try again."}"
                    }
                }
            }
        }
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
                    statusText.text = "Connected to Zenith."
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
