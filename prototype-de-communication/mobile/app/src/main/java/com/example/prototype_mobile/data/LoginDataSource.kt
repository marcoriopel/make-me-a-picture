package com.example.prototype_mobile.data

import android.content.*
import com.android.volley.*
import com.android.volley.toolbox.*
import com.example.prototype_mobile.data.model.LoggedInUser
import org.json.JSONException
import org.json.JSONObject
import java.io.IOException


/**
 * Class that handles authentication w/ login credentials and retrieves user information.
 */
class LoginDataSource() {

    fun login(username: String, password: String, queue: RequestQueue): Result<LoggedInUser> {
        try {
            // TODO: handle loggedInUser authentication
            // Instantiate the RequestQueue.

            val url = "http://18.217.235.167:3000/"
            var userId: String = ""
            val postData = JSONObject()
            try {
                postData.put("username", username)
                postData.put("password", password)
            } catch (e: JSONException) {
                e.printStackTrace()
            }
            // Request a string response from the provided URL.
            val stringRequest = JsonObjectRequest(Request.Method.POST, url, postData,
                Response.Listener<JSONObject>() { response: JSONObject? ->
                    userId = response.toString()

                },  Response.ErrorListener() { error -> error.printStackTrace();

                });

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