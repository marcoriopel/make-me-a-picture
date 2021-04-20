package com.example.prototype_mobile.model

import com.example.prototype_mobile.model.connection.login.LoginRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*


class HttpRequestDrawGuess {
    companion object {

//      val url = "http://10.0.2.2:3000"
        val url = "http://18.219.29.27:3000"

        suspend fun httpRequestPost(urlPath: String, parameters: HashMap<String, String>, addToken: Boolean = false): Response {
            return withContext(Dispatchers.IO) {
                val client = OkHttpClient()
                val formBuilder = FormBody.Builder()
                parameters.forEach { (key, value) -> formBuilder.add(key, value) }
                val formBody = formBuilder.build()
                var token = "null"
                if(addToken) {
                    token = LoginRepository.getInstance()!!.user!!.token
                }
                val request: Request = Request.Builder()
                        .url(url + urlPath)
                        .addHeader("authorization", token)
                        .post(formBody)
                        .build()

                val call: Call = client.newCall(request)
                call.execute()
            }
        }

        suspend fun httpRequestPatch(urlPath: String, parameters: HashMap<String, String>, addToken: Boolean = false): Response {
            return withContext(Dispatchers.IO) {
                val client = OkHttpClient()
                val formBuilder = FormBody.Builder()
                parameters.forEach { (key, value) -> formBuilder.add(key, value) }
                val formBody = formBuilder.build()
                var token = "null"
                if(addToken) {
                    token = LoginRepository.getInstance()!!.user!!.token
                }
                val request: Request = Request.Builder()
                    .url(url + urlPath)
                    .addHeader("authorization", token)
                    .patch(formBody)
                    .build()

                val call: Call = client.newCall(request)
                call.execute()
            }
        }

        suspend fun httpRequestGet(urlPath: String, parameters: HashMap<String, String> = HashMap()): Response {
            return withContext(Dispatchers.IO) {
                val client = OkHttpClient()
                val token = LoginRepository.getInstance()!!.user!!.token

                val httpBuilder = HttpUrl.parse(url + urlPath)!!.newBuilder()
                parameters.forEach { (key, value) -> httpBuilder.addQueryParameter(key, value) }

                val request: Request = Request.Builder()
                    .url(httpBuilder.build())
                    .addHeader("authorization", token)
                    .get()
                    .build()

                val call: Call = client.newCall(request)
                call.execute()
            }
        }

        suspend fun httpRequestDelete(urlPath: String, parameters: HashMap<String, String>, addToken: Boolean = false): Response {
            return withContext(Dispatchers.IO) {
                val client = OkHttpClient()
                var token = "null"
                if(addToken) {
                    token = LoginRepository.getInstance()!!.user!!.token
                }

                val httpBuilder = HttpUrl.parse(url + urlPath)!!.newBuilder()
                parameters.forEach { (key, value) -> httpBuilder.addQueryParameter(key, value) }

                val request: Request = Request.Builder()
                        .url(httpBuilder.build())
                        .addHeader("authorization", token)
                        .delete()
                        .build()

                val call: Call = client.newCall(request)
                call.execute()
            }
        }
    }
}