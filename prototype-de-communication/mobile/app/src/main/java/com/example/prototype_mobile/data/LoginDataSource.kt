package com.example.prototype_mobile.data

import android.R.attr
import android.accounts.AccountManager.KEY_PASSWORD
import android.content.*
import android.widget.Toast
import com.android.volley.*
import com.android.volley.toolbox.*
import com.example.prototype_mobile.data.model.LoggedInUser
import java.io.IOException


/**
 * Class that handles authentication w/ login credentials and retrieves user information.
 */
class LoginDataSource() {

    fun login(username: String, password: String, applicationContext: Context): Result<LoggedInUser> {
        try {
            // TODO: handle loggedInUser authentication
            // Instantiate the RequestQueue.
            val queue = RequestQueueSingleton.getInstance(applicationContext).requestQueue
            val url = "http://18.217.235.167:3000/api/auth/authenticate"
            var userId: String = ""
            val stringRequest: StringRequest = object : StringRequest(Method.POST, url,
                Response.Listener<String>() { response ->
                        Toast.makeText(applicationContext, response, Toast.LENGTH_LONG).show()
                },
                 Response.ErrorListener() { error ->
                        Toast.makeText(applicationContext, error.toString(), Toast.LENGTH_LONG)
                            .show()
                }) {
                override fun getParams(): Map<String, String> {
                    val params: MutableMap<String, String> = HashMap()
                    params["username"] = username
                    params["password"] = password
                    return params
                }
            }

            // Add the request to the RequestQueue.
            queue.add(stringRequest)


            val user = LoggedInUser(userId, username)
            return Result.Success(user)
        } catch (e: Throwable) {
            return Result.Error(IOException("Error logging in", e))
        }
    }

    fun logout() {
        // TODO: revoke authentication
    }
}