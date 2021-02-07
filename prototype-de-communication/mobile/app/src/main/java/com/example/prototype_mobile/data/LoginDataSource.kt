package com.example.prototype_mobile.data

import com.example.prototype_mobile.data.model.LoggedInUser
import java.io.IOException
import com.android.volley.*
import com.android.volley.toolbox.*
import android.view.View
import android.widget.Toast
import android.content.*

/**
 * Class that handles authentication w/ login credentials and retrieves user information.
 */
class LoginDataSource {

    fun login(username: String): Result<LoggedInUser> {
        try {
            // TODO: handle loggedInUser authentication
            // Instantiate the RequestQueue.
            val queue = Volley.newRequestQueue(applicationContext)
            val url = "https://18.217.235.167:3000/"

            // Request a string response from the provided URL.
            val stringRequest = StringRequest(Request.Method.POST, url,
                    Response.Listener<String> { response ->
                        // Display the first 500 characters of the response string.
                        Toast.makeText(
                                applicationContext,
                                "Response is: ${response.substring(0, 500)}",
                                Toast.LENGTH_LONG
                        ).show()
                    },
                    Response.ErrorListener { textView.text = "That didn't work!" })

            // Add the request to the RequestQueue.
            queue.add(stringRequest)

            val fakeUser = LoggedInUser(java.util.UUID.randomUUID().toString(), username)
            return Result.Success(fakeUser)
        } catch (e: Throwable) {
            return Result.Error(IOException("Error logging in", e))
        }
    }

    fun logout() {
        // TODO: revoke authentication
    }
}