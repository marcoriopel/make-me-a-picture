package com.example.prototype_mobile.model.mainmenu

import com.example.prototype_mobile.PrivateInfo
import com.example.prototype_mobile.PrivateReceivedInfo
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.google.gson.Gson
import okhttp3.Response


class ProfilRepository {
    val gson: Gson = Gson()

    suspend fun getProfilInfo(): Result<PrivateInfo> {
        val response = HttpRequestDrawGuess.httpRequestGet("/api/stats/private")
        return analyseProfilInfoAnswer(response)
    }

    fun analyseProfilInfoAnswer(response: Response): Result<PrivateInfo> {
        val jsonData: String = response.body()!!.string()
        if(response.code() == ResponseCode.OK.code) {
            val profilInfo = gson.fromJson(jsonData, PrivateReceivedInfo::class.java)
            return Result.Success(profilInfo.privateInfo)
        } else {
            return Result.Error(response.code())
        }
    }
}