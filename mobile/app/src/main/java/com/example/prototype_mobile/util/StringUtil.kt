package com.example.prototype_mobile.util

import java.security.MessageDigest

class StringUtil {
    companion object {
        fun hashSha256(toBeHashed: String): String {
            val bytes = toBeHashed.toByteArray()
            val md = MessageDigest.getInstance("SHA-256")
            val digest = md.digest(bytes)
            return digest.fold("", { str, it -> str + "%02x".format(it) })
        }
    }
}