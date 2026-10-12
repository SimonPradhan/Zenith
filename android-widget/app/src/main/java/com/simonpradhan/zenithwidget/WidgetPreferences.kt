package com.simonpradhan.zenithwidget

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

object WidgetPreferences {
    private const val PREFS_NAME = "zenith_widget_secure"
    private const val TOKEN_KEY = "access_token"

    private fun preferences(context: Context) =
        EncryptedSharedPreferences.create(
            context,
            PREFS_NAME,
            MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build(),
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )

    fun getToken(context: Context): String? =
        preferences(context).getString(TOKEN_KEY, null)

    fun saveToken(context: Context, token: String) {
        preferences(context).edit().putString(TOKEN_KEY, token).apply()
    }

    fun clearToken(context: Context) {
        preferences(context).edit().remove(TOKEN_KEY).apply()
    }
}
