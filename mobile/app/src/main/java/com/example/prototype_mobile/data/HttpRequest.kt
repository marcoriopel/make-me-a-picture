package com.example.prototype_mobile.data

import com.example.prototype_mobile.data.model.LoggedInUser
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import org.json.JSONObject

class HttpRequestDrawGuess {
    suspend fun httpRequest(urlPath: String, parameters: HashMap<String, String>): Response {
        return withContext(Dispatchers.IO) {
            val client = OkHttpClient()
            val formBuilder = FormBody.Builder()
            parameters.forEach { (key, value) -> formBuilder.add(key, value) }
            val formBody = formBuilder.build()

            val request: Request = Request.Builder()
                    //.url("http://10.0.2.2:3000" + urlPath)
                    .url("http://18.217.235.167:3000$urlPath")
                    .post(formBody)
                    .build()

            val call: Call = client.newCall(request)
            call.execute()
        }
    }
}